// Bank-driven optimizer.
// Given the items a player owns + a boss + their skills, enumerate candidate
// loadouts and return the top-N ranked by DPS. Uses scoreScenario (Phase 1)
// as the scorer.
//
// Strategy: greedy K=1 per non-weapon slot, enumerated across every
// (weapon × style) combo the bank supports. Augmented with force-include
// branches for known conditional-bonus items (DHCB, Salve, Arclight, Tbow)
// so they don't get pruned when their raw bonuses don't dominate.
//
// Why greedy instead of exhaustive: a 500-item bank across 11 slots is
// ~10^29 combinations. K=1 greedy + style enum + force-includes yields a
// few dozen candidates per boss, scored in <100ms.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { BONUS_TRIGGER_ITEM_IDS } from "@/data/loadouts/sets.source";
import {
  availableArmorSetsInBank,
  piecesToEquipForSet,
} from "@/data/armor-sets";
import { checkAmmoCompat } from "@/data/ammo-compatibility";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type {
  AttackStyleChoice,
  CombatStyle,
  Skills,
  SpellElement,
  WeaponAttackType,
} from "@/types/osrs";
import type { LoadoutSlotKey } from "@/types/loadout";
import { scoreScenario, type ScoredScenario } from "@/lib/optimize/scenario";

const ITEM_BY_ID = new Map<number, ItemCatalogEntry>(
  ITEM_CATALOG.map((it) => [it.id, it]),
);

export interface BankOptimizerInput {
  /** Item IDs the player owns. */
  bank: Set<number> | number[];
  target: MonsterCatalogEntry;
  skills: Skills;
  /** Cap on results returned. Default 10. */
  topN?: number;
  /** Magic-only: base spell max hit (e.g. Fire Surge = 24). Required to rank magic loadouts. */
  baseSpellMaxHit?: number;
  /** Magic-only: cast spell element. */
  spellElement?: SpellElement;
}

export interface BankOptimizerResult {
  rankings: Array<Extract<ScoredScenario, { valid: true }>>;
  diagnostics: {
    candidatesGenerated: number;
    candidatesValid: number;
    weaponsConsidered: number;
  };
}

/** Combat style implied by a weapon attack type. */
function combatStyleFor(attackType: WeaponAttackType): CombatStyle {
  if (attackType === "ranged") return "ranged";
  if (attackType === "magic") return "magic";
  return "melee";
}

/** Pull the offensive value an item contributes for a specific attack type. */
function offensiveFor(item: ItemCatalogEntry, attackType: WeaponAttackType): number {
  switch (attackType) {
    case "stab": return item.attackStab;
    case "slash": return item.attackSlash;
    case "crush": return item.attackCrush;
    case "magic": return item.attackMagic;
    case "ranged": return item.attackRanged;
  }
}

/** Pull the strength contribution an item provides for a combat style. */
function strengthFor(item: ItemCatalogEntry, style: CombatStyle): number {
  switch (style) {
    case "melee": return item.str;
    case "ranged": return item.rangedStr;
    case "magic": return item.magicStr; // magic_str is tenths-of-percent; relative ordering preserved.
  }
}

/**
 * DPS-flavoured score for ranking items within a single slot. str contributions
 * are weighted higher than accuracy because str grows max-hit linearly while
 * accuracy plateaus near 1.0. The 2:1 weight is a starting heuristic — see
 * project memory for the rationale; we can tune later.
 */
function itemScore(
  item: ItemCatalogEntry,
  attackType: WeaponAttackType,
  style: CombatStyle,
): number {
  return 2 * strengthFor(item, style) + offensiveFor(item, attackType);
}

/** True iff the player can equip the item given their skills. */
function meetsRequirements(item: ItemCatalogEntry, skills: Skills): boolean {
  if (!item.requirements) return true;
  const r = item.requirements;
  if (r.attack !== undefined && skills.attack < r.attack) return false;
  if (r.strength !== undefined && skills.strength < r.strength) return false;
  if (r.defence !== undefined && skills.defence < r.defence) return false;
  if (r.ranged !== undefined && skills.ranged < r.ranged) return false;
  if (r.magic !== undefined && skills.magic < r.magic) return false;
  if (r.hitpoints !== undefined && skills.hitpoints < r.hitpoints) return false;
  if (r.prayer !== undefined && skills.prayer < r.prayer) return false;
  return true;
}

/** Catalog "2h" slot rolls up to the loadout "weapon" key. */
function loadoutSlotFor(item: ItemCatalogEntry): LoadoutSlotKey {
  return item.slot === "2h" ? "weapon" : (item.slot as LoadoutSlotKey);
}

/** Items in the bank that the player can actually equip, grouped by loadout slot. */
function bankBySlot(
  bankIds: Iterable<number>,
  skills: Skills,
): Map<LoadoutSlotKey, ItemCatalogEntry[]> {
  const out = new Map<LoadoutSlotKey, ItemCatalogEntry[]>();
  for (const id of bankIds) {
    const item = ITEM_BY_ID.get(id);
    if (!item) continue;
    if (!meetsRequirements(item, skills)) continue;
    const slot = loadoutSlotFor(item);
    const list = out.get(slot) ?? [];
    list.push(item);
    out.set(slot, list);
  }
  return out;
}

const NON_WEAPON_SLOTS: LoadoutSlotKey[] = [
  "head", "cape", "neck", "body", "legs", "hands", "feet", "ring", "ammo", "shield",
];

interface WeaponStyleCandidate {
  weapon: ItemCatalogEntry;
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  combatStyle: CombatStyle;
}

/** Enumerate every legal non-defensive (weapon, attackType, choice) combo from the bank. */
function enumerateWeaponStyles(
  weapons: ItemCatalogEntry[],
): WeaponStyleCandidate[] {
  const out: WeaponStyleCandidate[] = [];
  for (const weapon of weapons) {
    const opts = WEAPON_STYLES[weapon.category];
    if (!opts) continue;
    for (const opt of opts) {
      if (opt.defensive) continue; // skip Block / Defend / Defensive Cast
      out.push({
        weapon,
        attackType: opt.attackType,
        choice: opt.choice,
        combatStyle: combatStyleFor(opt.attackType),
      });
    }
  }
  return out;
}

/**
 * Pick the best item per non-weapon slot for a (weapon, style) combo. Skips
 * the shield slot when the weapon is 2H. For ammo, filters by weapon compat
 * first. Returns the item IDs of the chosen loadout including the weapon.
 */
function greedyBuild(
  ws: WeaponStyleCandidate,
  bySlot: Map<LoadoutSlotKey, ItemCatalogEntry[]>,
): number[] {
  const ids: number[] = [ws.weapon.id];
  for (const slot of NON_WEAPON_SLOTS) {
    if (slot === "shield" && ws.weapon.isTwoHanded) continue;
    let pool = bySlot.get(slot) ?? [];
    if (slot === "ammo") {
      pool = pool.filter((a) => checkAmmoCompat(ws.weapon.name, a.name).ok);
    }
    if (pool.length === 0) continue;
    // Pick the item with the highest DPS-flavoured score for this style.
    let best = pool[0];
    let bestScore = itemScore(best, ws.attackType, ws.combatStyle);
    for (let i = 1; i < pool.length; i++) {
      const s = itemScore(pool[i], ws.attackType, ws.combatStyle);
      if (s > bestScore) { best = pool[i]; bestScore = s; }
    }
    ids.push(best.id);
  }
  return ids;
}

/**
 * Conditional-bonus trigger items in the bank that fire against this target.
 * Used to build "force-include" branches so DHCB doesn't get pruned by raw
 * weapon-bonus dominance on a dragon target, etc.
 */
function applicableForceIncludes(
  bank: Set<number>,
  target: MonsterCatalogEntry,
): number[] {
  const isDragon = target.attributes.includes("dragon");
  const isUndead = target.attributes.includes("undead");
  const isDemon = target.attributes.includes("demon");
  const isFireWeak = target.weakness?.element === "fire";
  const out: number[] = [];
  const B = BONUS_TRIGGER_ITEM_IDS;
  if (isDragon && bank.has(B.DRAGON_HUNTER_CROSSBOW)) out.push(B.DRAGON_HUNTER_CROSSBOW);
  if (isDragon && bank.has(B.DRAGON_HUNTER_LANCE)) out.push(B.DRAGON_HUNTER_LANCE);
  if (isUndead && bank.has(B.SALVE_AMULET_EI)) out.push(B.SALVE_AMULET_EI);
  if (isUndead && bank.has(B.SALVE_AMULET_E)) out.push(B.SALVE_AMULET_E);
  if (isUndead && bank.has(B.SALVE_AMULET_I)) out.push(B.SALVE_AMULET_I);
  if (isUndead && bank.has(B.SALVE_AMULET)) out.push(B.SALVE_AMULET);
  if (isDemon && bank.has(B.ARCLIGHT)) out.push(B.ARCLIGHT);
  if (isDemon && bank.has(B.EMBERLIGHT)) out.push(B.EMBERLIGHT);
  if (bank.has(B.TWISTED_BOW)) out.push(B.TWISTED_BOW); // always relevant (scales with target magic)
  if (isFireWeak && bank.has(B.TOME_OF_FIRE_CHARGED)) out.push(B.TOME_OF_FIRE_CHARGED);
  return out;
}

/**
 * Top-level entry point. Returns the top-N highest-DPS loadouts buildable
 * from the bank against this target.
 */
export function optimizeForBoss(input: BankOptimizerInput): BankOptimizerResult {
  const bankSet = input.bank instanceof Set
    ? input.bank
    : new Set<number>(input.bank);
  const topN = input.topN ?? 10;
  const bySlot = bankBySlot(bankSet, input.skills);
  const weapons = bySlot.get("weapon") ?? [];

  // Step 1: base candidate set — every (weapon × style) combo with greedy fill.
  const baseCandidates = enumerateWeaponStyles(weapons);

  // Step 2: force-include branches for conditional-bonus items. For weapon-slot
  // triggers (DHCB / DHL / Arclight / Emberlight / Tbow), restrict the weapon
  // pool to that item. For amulet triggers (Salve variants), the greedy build
  // would already pick them if their bonus is competitive — but Salve's
  // benefit is the conditional ×7/6 or ×6/5, which the per-slot scorer can't
  // see. We handle amulets by force-overriding the neck pick in a custom build.
  const forceIds = applicableForceIncludes(bankSet, input.target);
  type Candidate = { itemIds: number[]; ws: WeaponStyleCandidate };
  const allCandidates: Candidate[] = [];

  for (const ws of baseCandidates) {
    allCandidates.push({ itemIds: greedyBuild(ws, bySlot), ws });
  }

  for (const forcedId of forceIds) {
    const forced = ITEM_BY_ID.get(forcedId);
    if (!forced) continue;
    const forcedSlot = loadoutSlotFor(forced);
    if (forcedSlot === "weapon") {
      // Force this weapon — enumerate its styles, build greedily.
      const opts = WEAPON_STYLES[forced.category];
      if (!opts) continue;
      for (const opt of opts) {
        if (opt.defensive) continue;
        const ws: WeaponStyleCandidate = {
          weapon: forced,
          attackType: opt.attackType,
          choice: opt.choice,
          combatStyle: combatStyleFor(opt.attackType),
        };
        allCandidates.push({ itemIds: greedyBuild(ws, bySlot), ws });
      }
    } else {
      // Non-weapon force (Salve, Tome of Fire). Build a greedy loadout for
      // every base weapon-style combo, then override the forced slot.
      for (const ws of baseCandidates) {
        // Only force a Tome of Fire branch when this weapon-style is magic.
        if (forcedId === BONUS_TRIGGER_ITEM_IDS.TOME_OF_FIRE_CHARGED && ws.combatStyle !== "magic") continue;
        const ids = greedyBuild(ws, bySlot);
        // Replace any item in the forced slot with the forced item.
        const filtered = ids.filter((id) => {
          const it = ITEM_BY_ID.get(id);
          if (!it) return true;
          return loadoutSlotFor(it) !== forcedSlot;
        });
        filtered.push(forcedId);
        allCandidates.push({ itemIds: filtered, ws });
      }
    }
  }

  // Step 2b: armor-set force-includes. The K=1 greedy can't see that
  // wearing the full Void/Elite Void set unlocks +10%/+12.5% multipliers
  // (Void's per-slot stats are weak — greedy always prefers Masori/Armadyl
  // and never tries the set). For every armor set whose pieces are all in
  // the bank, build a candidate locking the set's slots and greedy-filling
  // the rest. scoreScenario re-detects the set bonus and the DPS engine
  // applies the multiplier.
  for (const setDef of availableArmorSetsInBank(bankSet)) {
    const setPieces = piecesToEquipForSet(setDef, bankSet);
    const setSlotsLocked = new Set(setPieces.map((p) => p.slot));
    for (const ws of baseCandidates) {
      if (ws.combatStyle !== setDef.style) continue;
      // Honor attackType + weaponId constraints. Inquisitor's only fires
      // on crush, Obsidian only with TzHaar weapons — skip force-builds
      // that wouldn't actually trigger the bonus.
      if (setDef.attackTypes && !setDef.attackTypes.includes(ws.attackType)) continue;
      if (setDef.requiredWeaponIds && !setDef.requiredWeaponIds.includes(ws.weapon.id)) continue;
      // Build greedy for this weapon-style, then replace any slot the set
      // covers with the set's piece.
      const ids = greedyBuild(ws, bySlot);
      const filtered = ids.filter((id) => {
        const it = ITEM_BY_ID.get(id);
        if (!it) return true;
        return !setSlotsLocked.has(loadoutSlotFor(it));
      });
      for (const p of setPieces) filtered.push(p.itemId);
      allCandidates.push({ itemIds: filtered, ws });
    }
  }

  // Step 3: dedupe by (sorted itemIds + style signature). Same gear with
  // different attack styles is still distinct (different DPS).
  const seen = new Set<string>();
  const unique: Candidate[] = [];
  for (const c of allCandidates) {
    const sig = `${c.ws.attackType}/${c.ws.choice}|${[...c.itemIds].sort((a, b) => a - b).join(",")}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    unique.push(c);
  }

  // Step 4: score every candidate.
  const valid: Array<Extract<ScoredScenario, { valid: true }>> = [];
  for (const c of unique) {
    const scored = scoreScenario({
      itemIds: c.itemIds,
      target: input.target,
      skills: input.skills,
      attackStyle: { attackType: c.ws.attackType, choice: c.ws.choice },
      baseSpellMaxHit: input.baseSpellMaxHit,
      spellElement: input.spellElement,
    });
    if (scored.valid) valid.push(scored);
  }

  // Step 5: rank + take top N.
  valid.sort((a, b) => b.dps.dps - a.dps.dps);

  return {
    rankings: valid.slice(0, topN),
    diagnostics: {
      candidatesGenerated: allCandidates.length,
      candidatesValid: valid.length,
      weaponsConsidered: weapons.length,
    },
  };
}
