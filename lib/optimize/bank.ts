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
import { rangedDamageUsesMeleeStrength } from "@/data/items/special-strength";
import { BONUS_TRIGGER_VARIANTS, ownedTriggerIds } from "@/data/bonus-trigger-items";
import {
  availableArmorSetsInBank,
  piecesToEquipForSet,
} from "@/data/armor-sets";
import { checkAmmoCompatWithCategory, SELF_AMMO_WEAPON_CATEGORIES, AMMO_TYPES } from "@/data/ammo-compatibility";
import { BOLT_EFFECT_BY_ITEM_ID, type BoltEffect } from "@/data/items/bolt-procs";
import { boltEffectApplies } from "@/lib/dps/bolts";
import { INTERNAL_AMMO_WEAPONS } from "@/data/items/internal-ammo-weapons";
import { IMBUED_SLAYER_HELM_IDS } from "@/data/items/slayer-helm";
import { isHalberdWeapon } from "@/data/items/halberd-weapons";
import { staffSuppliesElement } from "@/data/items/elemental-staves";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { autocastableSpellbooks } from "@/data/items/magic-weapon-autocast";
import { bestSpell, spellMaxHit } from "@/data/spells/catalog";
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
import type { BoostResolver } from "@/lib/dps/boost";

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
  /** Resolves the boost potion the player owns for a given style (from the bank). */
  boostResolver?: BoostResolver;
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask?: boolean;
  /** Soulreaper axe: assume max 5 stacks (+30% Strength level). */
  soulreaperMaxStacks?: boolean;
  /**
   * When true, the target can only be meleed with a 2-tile reach weapon
   * (halberd / Scythe of Vitur). Melee candidates using any other weapon are
   * dropped; ranged and magic are unaffected. See data/monsters/melee-reach.ts.
   */
  requiresMeleeReach2?: boolean;
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
export function combatStyleFor(attackType: WeaponAttackType): CombatStyle {
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
 *
 * `meleeStrForRanged` handles the Eclipse atlatl: its ranged damage scales off
 * the MELEE strength bonus, so rank gear by `str` even though the style is
 * ranged — otherwise the greedy fills slots with useless ranged-strength gear.
 */
export function itemScore(
  item: ItemCatalogEntry,
  attackType: WeaponAttackType,
  style: CombatStyle,
  meleeStrForRanged = false,
): number {
  const str = style === "ranged" && meleeStrForRanged
    ? item.str
    : strengthFor(item, style);
  return 2 * str + offensiveFor(item, attackType);
}

/**
 * Total defensive bonus across all five defence types. Used only as a
 * DPS-neutral tiebreak: when two items have an identical `itemScore` (same
 * offensive + strength contribution, e.g. Bandos vs Blood moon chestplate),
 * prefer the one with better defence — a strictly-better pick at no DPS cost,
 * and deterministic rather than left to arbitrary bank iteration order.
 */
function defensiveSum(item: ItemCatalogEntry): number {
  return item.defStab + item.defSlash + item.defCrush + item.defMagic + item.defRanged;
}

/** True iff the player can equip the item given their skills. */
export function meetsRequirements(item: ItemCatalogEntry, skills: Skills): boolean {
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
export function loadoutSlotFor(item: ItemCatalogEntry): LoadoutSlotKey {
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

export const NON_WEAPON_SLOTS: LoadoutSlotKey[] = [
  "head", "cape", "neck", "body", "legs", "hands", "feet", "ring", "ammo", "shield",
];

export interface WeaponStyleCandidate {
  weapon: ItemCatalogEntry;
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  combatStyle: CombatStyle;
}

/** Enumerate every legal non-defensive (weapon, attackType, choice) combo from the bank. */
export function enumerateWeaponStyles(
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
 * first.
 *
 * Returns both the chosen item IDs AND, for blowpipe weapons, the best dart
 * found in the bank (`internalAmmoId`). The dart is NOT in `ids` — it lives
 * inside the blowpipe and its rangedStr is folded in by scoreScenario via the
 * separate `internalAmmoId` field.
 */
function greedyBuild(
  ws: WeaponStyleCandidate,
  bySlot: Map<LoadoutSlotKey, ItemCatalogEntry[]>,
): { ids: number[]; internalAmmoId?: number } {
  const ids: number[] = [ws.weapon.id];
  const meleeStrForRanged = rangedDamageUsesMeleeStrength(ws.weapon.id);

  // Blowpipe — find the best dart in the bank. Darts have slot:"weapon" in
  // the catalog (they're thrown weapons), so they live in the weapon pool.
  let internalAmmoId: number | undefined;
  if (INTERNAL_AMMO_WEAPONS.has(ws.weapon.id)) {
    const weaponPool = bySlot.get("weapon") ?? [];
    const bestDart = weaponPool
      .filter((i) => AMMO_TYPES[i.name]?.class === "dart")
      .sort((a, b) => b.rangedStr - a.rangedStr)[0];
    if (bestDart) internalAmmoId = bestDart.id;
  }

  for (const slot of NON_WEAPON_SLOTS) {
    if (slot === "shield" && ws.weapon.isTwoHanded) continue;
    // The ammo slot is "free" whenever the weapon doesn't fire a separate
    // projectile from it. That covers:
    //   • Melee and magic weapons (combatStyle !== "ranged")
    //   • Self-ammo ranged weapons: blowpipes load darts internally, thrown
    //     weapons ARE the weapon, chinchompas and salamanders use inventory
    //     consumables — none of them occupy the ammo slot in-game.
    // In all these cases fill the slot with the highest-prayer item in the
    // bank (Rada's blessing 4 > god blessings > Rada's 2/3 etc.) at zero DPS
    // cost. Leave the slot empty only if nothing in the bank has prayer > 0.
    if (slot === "ammo" && (SELF_AMMO_WEAPON_CATEGORIES.has(ws.weapon.category) || ws.combatStyle !== "ranged")) {
      const prayerPool = (bySlot.get("ammo") ?? []).filter((a) => a.prayer > 0);
      if (prayerPool.length > 0) {
        const bestPrayer = prayerPool.reduce((b, a) => (a.prayer > b.prayer ? a : b));
        ids.push(bestPrayer.id);
      }
      continue;
    }
    let pool = bySlot.get(slot) ?? [];
    if (slot === "ammo") {
      pool = pool.filter((a) => checkAmmoCompatWithCategory(ws.weapon.name, ws.weapon.category, a.name).ok);
    }
    if (pool.length === 0) continue;
    // Pick the item with the highest DPS-flavoured score for this style. On an
    // exact tie, prefer higher defence — a strictly-better, deterministic pick
    // that costs no DPS (see defensiveSum).
    let best = pool[0];
    let bestScore = itemScore(best, ws.attackType, ws.combatStyle, meleeStrForRanged);
    let bestDef = defensiveSum(best);
    for (let i = 1; i < pool.length; i++) {
      const it = pool[i];
      const s = itemScore(it, ws.attackType, ws.combatStyle, meleeStrForRanged);
      if (s > bestScore) {
        best = it; bestScore = s; bestDef = defensiveSum(it);
      } else if (s === bestScore) {
        const d = defensiveSum(it);
        if (d > bestDef) { best = it; bestDef = d; }
      }
    }
    ids.push(best.id);
  }
  return { ids, internalAmmoId };
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
  const out: number[] = [];
  // Variant-aware (ownedTriggerIds): force-include the id the player actually
  // owns — a Salve(ei) Soul Wars/Emir's Arena imbue or DHCB (t)/(b) kit
  // carries the same bonus under a different item id.
  if (isDragon) out.push(...ownedTriggerIds(bank, "DRAGON_HUNTER_CROSSBOW"));
  if (isDragon) out.push(...ownedTriggerIds(bank, "DRAGON_HUNTER_LANCE"));
  if (isUndead) {
    out.push(...ownedTriggerIds(bank, "SALVE_AMULET_EI"));
    out.push(...ownedTriggerIds(bank, "SALVE_AMULET_E"));
    out.push(...ownedTriggerIds(bank, "SALVE_AMULET_I"));
    out.push(...ownedTriggerIds(bank, "SALVE_AMULET"));
  }
  if (isDemon) out.push(...ownedTriggerIds(bank, "ARCLIGHT"));
  if (isDemon) out.push(...ownedTriggerIds(bank, "EMBERLIGHT"));
  out.push(...ownedTriggerIds(bank, "TWISTED_BOW")); // always relevant (scales with target magic)
  // Tomes boost their element's spells vs all NPCs — push them unconditionally
  // so the optimizer tries them for any magic build, not only element-weak targets.
  out.push(...ownedTriggerIds(bank, "TOME_OF_FIRE_CHARGED"));
  out.push(...ownedTriggerIds(bank, "TOME_OF_WATER_CHARGED"));
  out.push(...ownedTriggerIds(bank, "TOME_OF_EARTH_CHARGED"));
  // Wilderness weapons get a big ×3/2 vs NPCs in the Wilderness that itemScore
  // can't see — force them in for wilderness bosses so they're ranked honestly.
  if (isWildernessBoss(target.slug)) out.push(...ownedTriggerIds(bank, "WILDERNESS_WEAPON"));
  return out;
}

export interface AutoSpellResult {
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  autoSpellName?: string;
}

/**
 * Resolve the spell info a magic loadout should be scored with. Powered staves
 * (Trident / Sanguinesti / Shadow) embed their own damage formula keyed by
 * weapon ID; regular staves and wands auto-select the best castable spell
 * across all spellbooks the weapon can autocast, gated by the target's
 * attributes and any equipped tome. Non-magic styles return the fallbacks
 * unchanged. Shared by the bank optimizer and the from-scratch budget builder.
 */
export function autoPickSpell(
  weapon: ItemCatalogEntry,
  itemIds: number[],
  combatStyle: CombatStyle,
  magicLevel: number,
  target: MonsterCatalogEntry,
  fallbackBaseSpellMaxHit?: number,
  fallbackSpellElement?: SpellElement,
): AutoSpellResult {
  const poweredFormula = POWERED_STAFF_FORMULA.get(weapon.id);
  let baseSpellMaxHit = poweredFormula
    ? poweredFormula(magicLevel)
    : fallbackBaseSpellMaxHit;
  let spellElement = fallbackSpellElement;
  let autoSpellName: string | undefined;

  if (combatStyle === "magic" && !poweredFormula && baseSpellMaxHit === undefined) {
    const spell = bestSpell({
      magicLevel,
      targetAttributes: target.attributes,
      tomeOfFire: BONUS_TRIGGER_VARIANTS.TOME_OF_FIRE_CHARGED.some((id) => itemIds.includes(id)),
      tomeOfWater: BONUS_TRIGGER_VARIANTS.TOME_OF_WATER_CHARGED.some((id) => itemIds.includes(id)),
      tomeOfEarth: BONUS_TRIGGER_VARIANTS.TOME_OF_EARTH_CHARGED.some((id) => itemIds.includes(id)),
      twinflame: weapon.id === 30634, // Twinflame staff
      // Never recommend a spell the equipped weapon can't autocast.
      allowedSpellbooks: autocastableSpellbooks(weapon.id),
    });
    if (spell) {
      baseSpellMaxHit = spellMaxHit(spell, magicLevel);
      spellElement = spell.element;
      autoSpellName = spell.name;
    }
  }

  return { baseSpellMaxHit, spellElement, autoSpellName };
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
  type Candidate = { itemIds: number[]; internalAmmoId?: number; ws: WeaponStyleCandidate };
  const allCandidates: Candidate[] = [];

  for (const ws of baseCandidates) {
    const { ids, internalAmmoId } = greedyBuild(ws, bySlot);
    allCandidates.push({ itemIds: ids, internalAmmoId, ws });
  }

  for (const forcedId of forceIds) {
    const forced = ITEM_BY_ID.get(forcedId);
    if (!forced) continue;
    if (loadoutSlotFor(forced) !== "weapon") continue; // non-weapon forces compose later
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
      const { ids, internalAmmoId } = greedyBuild(ws, bySlot);
      allCandidates.push({ itemIds: ids, internalAmmoId, ws });
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
      const { ids, internalAmmoId } = greedyBuild(ws, bySlot);
      const filtered = ids.filter((id) => {
        const it = ITEM_BY_ID.get(id);
        if (!it) return true;
        return !setSlotsLocked.has(loadoutSlotFor(it));
      });
      for (const p of setPieces) filtered.push(p.itemId);
      allCandidates.push({ itemIds: filtered, internalAmmoId, ws });
    }
  }

  // Step 2c: non-weapon force overrides (Salve neck, Tome of Fire shield),
  // applied over a snapshot of EVERY candidate so far — base greedy builds,
  // forced-weapon builds, AND armor-set builds. Iterating only the base
  // candidates here was a real bug: "Elite Void + Salve(ei)" was never
  // generated, so a Void-owning player got Void + blood fury recommended vs
  // undead targets even though the Salve multiplier dwarfs any neck's stats.
  const nonWeaponForces = forceIds.filter((id) => {
    const it = ITEM_BY_ID.get(id);
    return it !== undefined && loadoutSlotFor(it) !== "weapon";
  });
  if (nonWeaponForces.length > 0) {
    const snapshot = [...allCandidates];
    for (const forcedId of nonWeaponForces) {
      const forced = ITEM_BY_ID.get(forcedId)!;
      const forcedSlot = loadoutSlotFor(forced);
      const isTome = (
        BONUS_TRIGGER_VARIANTS.TOME_OF_FIRE_CHARGED.includes(forcedId) ||
        BONUS_TRIGGER_VARIANTS.TOME_OF_WATER_CHARGED.includes(forcedId) ||
        BONUS_TRIGGER_VARIANTS.TOME_OF_EARTH_CHARGED.includes(forcedId)
      );
      for (const c of snapshot) {
        // Tomes only benefit magic builds — skip for melee/ranged weapon styles,
        // and never force a shield slot onto a 2H weapon.
        if (isTome && c.ws.combatStyle !== "magic") continue;
        if (forcedSlot === "shield" && c.ws.weapon.isTwoHanded) continue;
        const filtered = c.itemIds.filter((id) => {
          const it = ITEM_BY_ID.get(id);
          if (!it) return true;
          return loadoutSlotFor(it) !== forcedSlot;
        });
        filtered.push(forcedId);
        allCandidates.push({ itemIds: filtered, internalAmmoId: c.internalAmmoId, ws: c.ws });
      }
    }
  }

  // Step 2d: enchanted-bolt branches. The greedy ammo pick ranks by raw
  // rangedStr, where proc bolts tie with (or lose to) their plain variants —
  // but the engine now prices their procs (Ruby's 20%-of-HP hit, Diamond's
  // defence-ignoring hit). For every crossbow candidate, branch once per
  // distinct applicable bolt effect in the bank; scoreScenario ranks them
  // honestly and dedupe drops any branch the greedy already produced.
  const boltBranches: Candidate[] = [];
  for (const c of allCandidates) {
    if (c.ws.weapon.category !== "Crossbow" || c.ws.combatStyle !== "ranged") continue;
    const procBolts = (bySlot.get("ammo") ?? []).filter((a) => {
      const effect = BOLT_EFFECT_BY_ITEM_ID.get(a.id);
      if (!effect) return false;
      if (!boltEffectApplies(effect, input.target.attributes)) return false;
      return checkAmmoCompatWithCategory(c.ws.weapon.name, c.ws.weapon.category, a.name).ok;
    });
    if (procBolts.length === 0) continue;
    const bestPerEffect = new Map<BoltEffect, ItemCatalogEntry>();
    for (const bolt of procBolts) {
      const effect = BOLT_EFFECT_BY_ITEM_ID.get(bolt.id)!;
      const current = bestPerEffect.get(effect);
      if (!current || bolt.rangedStr > current.rangedStr) bestPerEffect.set(effect, bolt);
    }
    for (const bolt of bestPerEffect.values()) {
      const withoutAmmo = c.itemIds.filter((id) => {
        const it = ITEM_BY_ID.get(id);
        return !it || loadoutSlotFor(it) !== "ammo";
      });
      boltBranches.push({
        itemIds: [...withoutAmmo, bolt.id],
        internalAmmoId: c.internalAmmoId,
        ws: c.ws,
      });
    }
  }
  allCandidates.push(...boltBranches);

  // Step 2e: slayer-helm force-include. On task, the imbued black mask / slayer
  // helmet grants a large on-task multiplier (×7/6 melee, ×23/20 ranged & magic)
  // that the per-slot greedy can't see — and it competes with head-slot armor-set
  // pieces (Void / Justiciar / Inquisitor helm). Branch every candidate with the
  // helm in the head slot so scoreScenario ranks "helm + broken set" vs "intact
  // set" honestly and the DPS engine applies the on-task bonus. (The boss page
  // used to patch the helm into the head slot directly, which stranded the rest
  // of an armor set; the optimizer now owns this decision.)
  if (input.onTask) {
    const ownedHelmId = [...bankSet].find((id) => IMBUED_SLAYER_HELM_IDS.has(id));
    if (ownedHelmId !== undefined) {
      const snapshot = [...allCandidates];
      for (const c of snapshot) {
        if (c.itemIds.includes(ownedHelmId)) continue; // already wearing it
        const filtered = c.itemIds.filter((id) => {
          const it = ITEM_BY_ID.get(id);
          if (!it) return true;
          return loadoutSlotFor(it) !== "head";
        });
        filtered.push(ownedHelmId);
        allCandidates.push({ itemIds: filtered, internalAmmoId: c.internalAmmoId, ws: c.ws });
      }
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
    // Reach gate: on bosses you can't stand next to (Zulrah), a melee setup must
    // use a 2-tile weapon. Drop any melee candidate whose weapon isn't a halberd
    // / Scythe — ranged & magic are unaffected. This is the single chokepoint, so
    // it also catches force-include and armor-set branches.
    if (
      input.requiresMeleeReach2 &&
      c.ws.combatStyle === "melee" &&
      !isHalberdWeapon(c.ws.weapon.id)
    ) {
      continue;
    }
    // Powered staves (Trident, Sanguinesti, etc.) embed their own damage
    // formula keyed by weapon ID — derive baseSpellMaxHit from the weapon
    // rather than requiring the caller to supply a spell. For regular staves
    // and wands, auto-select the best castable spell across all spellbooks
    // (Standard / Ancient / Arceuus), gated by the target's attributes.
    const { baseSpellMaxHit, spellElement, autoSpellName } = autoPickSpell(
      c.ws.weapon,
      c.itemIds,
      c.ws.combatStyle,
      input.skills.magic,
      input.target,
      input.baseSpellMaxHit,
      input.spellElement,
    );

    const scored = scoreScenario({
      itemIds: c.itemIds,
      internalAmmoId: c.internalAmmoId,
      target: input.target,
      skills: input.skills,
      attackStyle: { attackType: c.ws.attackType, choice: c.ws.choice },
      baseSpellMaxHit,
      spellElement,
      autoSpellName,
      boostResolver: input.boostResolver,
      onTask: input.onTask,
      soulreaperMaxStacks: input.soulreaperMaxStacks,
    });
    if (scored.valid) valid.push(scored);
  }

  // Step 5: rank + take top N. Primary key is DPS. For exact ties, prefer a
  // magic loadout whose staff supplies the cast spell's element — a DPS-neutral
  // tie-break so an earth spell is shown with an earth staff rather than an
  // equally-good staff that doesn't supply its runes. (Rune cost isn't modelled,
  // so this only reorders identical-DPS staves; it never changes the spell.)
  const suppliesSpellElement = (s: Extract<ScoredScenario, { valid: true }>): number =>
    s.loadout.style === "magic" &&
    staffSuppliesElement(s.loadout.slots.weapon?.itemId ?? -1, s.loadout.spellElement)
      ? 1
      : 0;
  valid.sort((a, b) => {
    const d = b.dps.dps - a.dps.dps;
    if (Math.abs(d) > 1e-9) return d;
    return suppliesSpellElement(b) - suppliesSpellElement(a);
  });

  return {
    rankings: valid.slice(0, topN),
    diagnostics: {
      candidatesGenerated: allCandidates.length,
      candidatesValid: valid.length,
      weaponsConsidered: weapons.length,
    },
  };
}
