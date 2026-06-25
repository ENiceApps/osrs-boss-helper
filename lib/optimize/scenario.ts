// Bridge between "pile of bank items" and "DPS number."
// Given raw item IDs + a boss + player skills, synthesize a LoadoutSet and
// score it through the existing DPS engine. Phase 1 of the bank-driven
// optimizer: Phase 2 will enumerate combinations of bank items and call this
// as the scorer.

import type { ItemCatalogEntry } from "@/data/items/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { rangedDamageUsesMeleeStrength } from "@/data/items/special-strength";
import { hasTrigger } from "@/data/bonus-trigger-items";
import { hasImbuedSlayerHelm } from "@/data/items/slayer-helm";
import { detectArmorSetBonus } from "@/data/armor-sets";
import { checkAmmoCompat } from "@/data/ammo-compatibility";
import { findCatalogItem } from "@/lib/loadout-edit";
import {
  WEAPON_STYLES,
  type WeaponStyleOption,
} from "@/data/weapon-styles";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { computeSetDps } from "@/lib/recommend";
import type { BoostResolver } from "@/lib/dps/boost";
import { activeBonusesForTarget } from "@/lib/loadout";
import type {
  ItemBonusFlags,
  LoadoutSet,
  LoadoutSlotKey,
  LoadoutTier,
} from "@/types/loadout";
import type {
  AttackStyleChoice,
  CombatStyle,
  DpsResult,
  Skills,
  SpellElement,
  WeaponAttackType,
} from "@/types/osrs";

// Cape variants that grant the Dizana passive (+10 ranged atk / +1 ranged str
// with compatible ammo): Blessed dizana's quiver, Dizana's max cape, and the
// Charged Dizana's quiver — all version ids. Uncharged/broken base quiver and
// the cosmetic max hood do NOT qualify.
const DIZANA_PASSIVE_CAPE_IDS: ReadonlySet<number> = new Set([
  28828, 28957, 28955, // Blessed dizana's quiver (Broken / Locked / Normal)
  28830, 28906, 28902, // Dizana's max cape (Broken / Locked / Normal)
  28951, 28953, // Dizana's quiver (Charged / Charged + Locked)
]);

export interface ScenarioInput {
  /** Up to 11 item IDs — one per slot. Order doesn't matter. */
  itemIds: number[];
  target: MonsterCatalogEntry;
  skills: Skills;
  /** Override the auto-picked weapon style. Must be legal for the weapon category. */
  attackStyle?: { attackType: WeaponAttackType; choice: AttackStyleChoice };
  /** Magic-only: base spell max hit (e.g. Fire Surge = 24). Required for non-powered staves. */
  baseSpellMaxHit?: number;
  /** Magic-only: cast spell element — gates Tome of Fire and target weakness. */
  spellElement?: SpellElement;
  /** Magic-only: name of the auto-selected standard spellbook spell, for UI display. */
  autoSpellName?: string;
  /** Resolves the boost potion the player owns for the loadout's style (from the bank). */
  boostResolver?: BoostResolver;
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask?: boolean;
  /** Soulreaper axe: assume max 5 stacks (+30% Strength level). */
  soulreaperMaxStacks?: boolean;
  /**
   * Dart loaded inside a blowpipe (internal ammo). NOT in the itemIds list —
   * it lives inside the weapon, leaving the ammo slot free for a blessing.
   * Its rangedStr is added to the ranged-strength total here.
   */
  internalAmmoId?: number;
}

export type ScoredScenario =
  | {
      valid: true;
      loadout: LoadoutSet;
      dps: DpsResult;
      activeBonuses: ReturnType<typeof activeBonusesForTarget>;
    }
  | {
      valid: false;
      reasons: string[];
    };

/** Map catalog `slot` field → loadout slot key. Catalog uses "2h" for 2H weapons. */
function loadoutSlotFor(item: ItemCatalogEntry): LoadoutSlotKey {
  return item.slot === "2h" ? "weapon" : (item.slot as LoadoutSlotKey);
}

/** Combat style is implied by attackType: ranged → ranged, magic → magic, else melee. */
function combatStyleFor(attackType: WeaponAttackType): CombatStyle {
  if (attackType === "ranged") return "ranged";
  if (attackType === "magic") return "magic";
  return "melee";
}

/**
 * Pick a sensible default (attackType, choice) for a weapon when the caller
 * hasn't specified one. Heuristic, not optimal — Phase 2's optimizer will
 * enumerate the few legal styles per weapon and pick the DPS-best.
 */
function defaultStyleFor(
  weapon: ItemCatalogEntry,
): { attackType: WeaponAttackType; choice: AttackStyleChoice } | null {
  const options = WEAPON_STYLES[weapon.category];
  if (!options) return null;
  const offensive = options.filter((o) => !o.defensive);
  if (offensive.length === 0) return null;

  const isRangedCat = offensive.some((o) => o.attackType === "ranged");
  const isPoweredStaff = weapon.category === "Powered Staff";

  // Ranged → prefer rapid (extra tick beats +3 accuracy in realistic ranges).
  if (isRangedCat) {
    const rapid = offensive.find((o) => o.choice === "rapid");
    if (rapid) return { attackType: rapid.attackType, choice: rapid.choice };
  }

  // Powered staff auto-casts; "accurate" is the only DPS-relevant mode.
  if (isPoweredStaff) {
    const acc = offensive.find((o) => o.choice === "accurate" && o.attackType === "magic");
    if (acc) return { attackType: acc.attackType, choice: acc.choice };
  }

  // Regular staff casting spells: longrange (gives +0 atk / +0 str, matching curated magic sets).
  if (weapon.category === "Staff") {
    const spell = offensive.find((o) => o.attackType === "magic" && o.choice === "longrange");
    if (spell) return { attackType: spell.attackType, choice: spell.choice };
  }

  // Melee: pick the style whose attackType maximises the weapon's offensive bonus,
  // preferring aggressive > accurate > controlled > rapid > longrange.
  const choiceRank: Record<AttackStyleChoice, number> = {
    aggressive: 5,
    accurate: 4,
    controlled: 3,
    rapid: 2,
    longrange: 1,
    defensive: 0,
  };
  const offensiveBonus = (at: WeaponAttackType): number => {
    switch (at) {
      case "stab": return weapon.attackStab;
      case "slash": return weapon.attackSlash;
      case "crush": return weapon.attackCrush;
      case "magic": return weapon.attackMagic;
      case "ranged": return weapon.attackRanged;
    }
  };
  let best: WeaponStyleOption | null = null;
  for (const o of offensive) {
    if (!best) { best = o; continue; }
    const bScore = offensiveBonus(best.attackType) * 10 + choiceRank[best.choice];
    const oScore = offensiveBonus(o.attackType) * 10 + choiceRank[o.choice];
    if (oScore > bScore) best = o;
  }
  return best ? { attackType: best.attackType, choice: best.choice } : null;
}

/** Pick the offensive bonus the loadout uses for its attack type. */
function offensiveFor(item: ItemCatalogEntry, attackType: WeaponAttackType): number {
  switch (attackType) {
    case "stab": return item.attackStab;
    case "slash": return item.attackSlash;
    case "crush": return item.attackCrush;
    case "magic": return item.attackMagic;
    case "ranged": return item.attackRanged;
  }
}

/** Check every requirement against skills; return list of failures. */
function requirementFailures(item: ItemCatalogEntry, skills: Skills): string[] {
  if (!item.requirements) return [];
  const reasons: string[] = [];
  const r = item.requirements;
  const check = (skill: keyof Skills, req: number | undefined) => {
    if (req !== undefined && skills[skill] < req) {
      reasons.push(`${item.name} requires ${skill} ${req} (have ${skills[skill]}).`);
    }
  };
  check("attack", r.attack);
  check("strength", r.strength);
  check("defence", r.defence);
  check("ranged", r.ranged);
  check("magic", r.magic);
  check("hitpoints", r.hitpoints);
  check("prayer", r.prayer);
  return reasons;
}

/**
 * Score an arbitrary set of item IDs against a boss target. Validates equip
 * requirements, slot conflicts, 2H/shield rules, and ammo compatibility,
 * then synthesizes a LoadoutSet and runs the existing DPS engine.
 */
export function scoreScenario(input: ScenarioInput): ScoredScenario {
  const { itemIds, target, skills } = input;
  const reasons: string[] = [];

  // Step 1: resolve catalog entries.
  const resolved: { item: ItemCatalogEntry; slot: LoadoutSlotKey }[] = [];
  for (const id of itemIds) {
    const item = findCatalogItem(id);
    if (!item) {
      reasons.push(`Unknown item id ${id}.`);
      continue;
    }
    resolved.push({ item, slot: loadoutSlotFor(item) });
  }

  // Step 2: detect slot collisions. The "weapon" slot is special: a 2H weapon
  // forbids a shield, and at most one weapon may be equipped.
  const bySlot = new Map<LoadoutSlotKey, ItemCatalogEntry[]>();
  for (const { item, slot } of resolved) {
    const list = bySlot.get(slot) ?? [];
    list.push(item);
    bySlot.set(slot, list);
  }
  for (const [slot, items] of bySlot) {
    if (items.length > 1) {
      reasons.push(`Slot collision: ${items.map((i) => i.name).join(" + ")} all occupy "${slot}".`);
    }
  }

  // Step 3: equip requirements.
  for (const { item } of resolved) {
    reasons.push(...requirementFailures(item, skills));
  }

  // Step 4: weapon required for DPS.
  const weaponItems = bySlot.get("weapon") ?? [];
  const weapon = weaponItems[0];
  if (!weapon) {
    reasons.push("No weapon equipped.");
  }

  // Step 5: 2H ↔ shield conflict.
  if (weapon?.isTwoHanded && (bySlot.get("shield")?.length ?? 0) > 0) {
    reasons.push(`2H weapon "${weapon.name}" cannot be equipped with a shield.`);
  }

  // Step 6: ammo ↔ weapon compat.
  // Blessings (prayer > 0, no offensive stats) are decorative ammo-slot items
  // that can be worn alongside ANY weapon — skip the projectile compat check for
  // them. Real ammo (bolts, arrows, darts) still goes through the full check.
  const ammoItems = bySlot.get("ammo") ?? [];
  // Whether real ammo compatible with the weapon is loaded (its ranged stats
  // apply). Gates the Dizana's quiver passive below.
  let ammoIsIncluded = false;
  if (weapon && ammoItems[0]) {
    const ammo = ammoItems[0];
    const isBlessingItem = ammo.prayer > 0 && ammo.rangedStr === 0 && ammo.attackRanged === 0;
    if (!isBlessingItem) {
      const compat = checkAmmoCompat(weapon.name, ammo.name);
      if (!compat.ok) reasons.push(compat.reason);
      else ammoIsIncluded = true;
    }
  }

  // Step 7: weapon style. Honour caller override if legal; else default.
  let style: { attackType: WeaponAttackType; choice: AttackStyleChoice } | null = null;
  if (weapon) {
    const options = WEAPON_STYLES[weapon.category];
    if (!options) {
      reasons.push(`Weapon category "${weapon.category}" has no style mapping in data/weapon-styles.ts.`);
    } else if (input.attackStyle) {
      const match = options.find(
        (o) =>
          o.attackType === input.attackStyle!.attackType &&
          o.choice === input.attackStyle!.choice,
      );
      if (!match) {
        reasons.push(
          `Style (${input.attackStyle.attackType}/${input.attackStyle.choice}) is not legal for "${weapon.category}".`,
        );
      } else {
        style = input.attackStyle;
      }
    } else {
      style = defaultStyleFor(weapon);
      if (!style) {
        reasons.push(`No default style available for "${weapon.category}".`);
      }
    }
  }

  if (reasons.length > 0 || !weapon || !style) {
    return { valid: false, reasons };
  }

  // Step 8: synthesize the LoadoutSet. Mirrors lib/loadout-edit.ts:applyOverrides
  // and scripts/build-loadouts.ts so the DPS engine sees an identical shape.
  const combatStyle = combatStyleFor(style.attackType);
  let attackBonus = 0;
  let melStr = 0;
  let rngStr = 0;
  let magStr = 0;
  let prayerBonus = 0;
  let attackSpeedTicks = 0;
  const computedSlots: LoadoutSet["slots"] = {};
  for (const { item, slot } of resolved) {
    if ((bySlot.get(slot)?.length ?? 0) > 1) continue; // skip collided slots
    computedSlots[slot] = {
      itemId: item.id,
      itemName: item.name,
      version: item.version || undefined,
    };
    attackBonus += offensiveFor(item, style.attackType);
    melStr += item.str;
    rngStr += item.rangedStr;
    magStr += item.magicStr;
    prayerBonus += item.prayer;
    if (slot === "weapon" && item.speed > 0) attackSpeedTicks = item.speed;
  }

  // Weapon-internal ammo (blowpipe dart). The dart lives inside the weapon
  // and is NOT in the slot list — add its rangedStr separately so DPS reflects
  // the correct dart tier (dragon dart = +35 rangedStr on top of the blowpipe's
  // own +20, for a true total of +55).
  let internalAmmo: LoadoutSet["internalAmmo"];
  if (input.internalAmmoId !== undefined) {
    const dartItem = findCatalogItem(input.internalAmmoId);
    if (dartItem) {
      rngStr += dartItem.rangedStr;
      internalAmmo = { itemId: dartItem.id, itemName: dartItem.name };
    }
  }

  // Dizana's quiver / max cape passive: +10 ranged attack and +1 ranged strength
  // when compatible ammo is loaded — a bonus NOT in the cape's base stats. Only
  // the charged/blessed/max variants grant it. Mirrors wgloop's
  // calculateEquipmentBonusesFromGear (Blessed dizana's quiver et al.).
  // Only real ammo in the AMMO SLOT counts — a blowpipe's internal dart does
  // not (wgloop checks the ammo-slot item, which is empty for a blowpipe), so
  // the passive does not apply to self-ammo weapons.
  if (combatStyle === "ranged") {
    const capeId = computedSlots.cape?.itemId;
    if (capeId !== undefined && DIZANA_PASSIVE_CAPE_IDS.has(capeId) && ammoIsIncluded) {
      attackBonus += 10;
      rngStr += 1;
    }
  }

  // Powered staves (Trident, Sanguinesti, Eye of ayak, …) embed their own
  // max-hit formula keyed by weapon id. Derive it here from the weapon so any
  // caller that doesn't pre-resolve a spell — notably the budget upgrade path,
  // which re-scores without re-running autoPickSpell — still gets correct magic
  // DPS instead of a 0 max hit. Regular staves keep the caller-supplied value.
  // Uses base magic level (input.skills.magic) to match optimizeForBoss exactly.
  const poweredStaffFormula = POWERED_STAFF_FORMULA.get(weapon.id);
  const resolvedBaseSpellMaxHit = poweredStaffFormula
    ? poweredStaffFormula(skills.magic)
    : input.baseSpellMaxHit;

  let strengthBonus = 0;
  let magicDamagePct: number | undefined;
  switch (combatStyle) {
    case "melee": strengthBonus = melStr; break;
    // Eclipse atlatl scales ranged damage off the MELEE strength bonus.
    case "ranged": strengthBonus = rangedDamageUsesMeleeStrength(weapon.id) ? melStr : rngStr; break;
    case "magic": magicDamagePct = magStr / 10; break;
  }

  // Variant-aware (hasTrigger): cosmetic kits and minigame re-imbues carry
  // distinct ids but the same bonus — e.g. Salve amulet(ei) (Emir's Arena).
  const slotItemIds = new Set(itemIds);
  const itemBonusFlags: ItemBonusFlags = {
    dragonHunterCrossbow: hasTrigger(slotItemIds, "DRAGON_HUNTER_CROSSBOW"),
    dragonHunterLance: hasTrigger(slotItemIds, "DRAGON_HUNTER_LANCE"),
    dragonHunterWand: hasTrigger(slotItemIds, "DRAGON_HUNTER_WAND"),
    salveAmuletEi: hasTrigger(slotItemIds, "SALVE_AMULET_EI") || hasTrigger(slotItemIds, "SALVE_AMULET_E"),
    salveAmulet: hasTrigger(slotItemIds, "SALVE_AMULET") || hasTrigger(slotItemIds, "SALVE_AMULET_I"),
    demonbane: hasTrigger(slotItemIds, "ARCLIGHT") || hasTrigger(slotItemIds, "EMBERLIGHT"),
    kerisPartisan: hasTrigger(slotItemIds, "KERIS_PARTISAN"),
    kerisBreaching: hasTrigger(slotItemIds, "KERIS_PARTISAN_BREACHING"),
    tomeOfFire: hasTrigger(slotItemIds, "TOME_OF_FIRE_CHARGED"),
    tomeOfWater: hasTrigger(slotItemIds, "TOME_OF_WATER_CHARGED"),
    tomeOfEarth: hasTrigger(slotItemIds, "TOME_OF_EARTH_CHARGED"),
    twistedBow: hasTrigger(slotItemIds, "TWISTED_BOW"),
    fang: hasTrigger(slotItemIds, "OSMUMTEN_FANG"),
    slayerHelmImbued: hasImbuedSlayerHelm(slotItemIds),
    wildernessWeapon: hasTrigger(slotItemIds, "WILDERNESS_WEAPON"),
  };

  // Tier is purely informational on the recommend path; mark scratch loadouts
  // as "end" so they sort alongside curated endgame sets when both apply.
  const tier: LoadoutTier = "end";

  const armorSetBonus = detectArmorSetBonus(slotItemIds, combatStyle, {
    attackType: style.attackType,
    weaponId: weapon.id,
  });

  const loadout: LoadoutSet = {
    id: `scratch-${weapon.id}`,
    name: `Scratch loadout — ${weapon.name}`,
    style: combatStyle,
    tier,
    attackType: style.attackType as LoadoutSet["attackType"],
    attackStyleChoice: style.choice,
    slots: computedSlots,
    totals: {
      attackBonus,
      strengthBonus,
      prayerBonus,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks,
    internalAmmo,
    baseSpellMaxHit: combatStyle === "magic" ? resolvedBaseSpellMaxHit : undefined,
    // Powered staves (Trident / Sanguinesti / Tumeken's shadow) fire their own
    // attack with NO spell element — they must NOT inherit a spellElement, or the
    // engine would wrongly apply elemental-weakness / tome bonuses to them.
    spellElement:
      combatStyle === "magic" && weapon.category !== "Powered Staff"
        ? input.spellElement
        : undefined,
    autoSpellName: combatStyle === "magic" ? input.autoSpellName : undefined,
    itemBonusFlags,
    weaponCategory: weapon.category,
    armorSetBonus,
  };

  const dps = computeSetDps(
    loadout,
    target,
    skills,
    input.boostResolver?.(combatStyle),
    input.onTask ?? false,
    input.soulreaperMaxStacks ?? false,
  );
  const activeBonuses = activeBonusesForTarget(loadout, target);
  return { valid: true, loadout, dps, activeBonuses };
}
