// Bridge between "pile of bank items" and "DPS number."
// Given raw item IDs + a boss + player skills, synthesize a LoadoutSet and
// score it through the existing DPS engine. Phase 1 of the bank-driven
// optimizer: Phase 2 will enumerate combinations of bank items and call this
// as the scorer.

import type { ItemCatalogEntry } from "@/data/items/catalog";
import { BONUS_TRIGGER_ITEM_IDS } from "@/data/loadouts/sets.source";
import { detectArmorSetBonus } from "@/data/armor-sets";
import { checkAmmoCompat } from "@/data/ammo-compatibility";
import { findCatalogItem } from "@/lib/loadout-edit";
import {
  WEAPON_STYLES,
  type WeaponStyleOption,
} from "@/data/weapon-styles";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { computeSetDps } from "@/lib/recommend";
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
  const ammoItems = bySlot.get("ammo") ?? [];
  if (weapon && ammoItems[0]) {
    const compat = checkAmmoCompat(weapon.name, ammoItems[0].name);
    if (!compat.ok) reasons.push(compat.reason);
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
    if (slot === "weapon" && item.speed > 0) attackSpeedTicks = item.speed;
  }

  let strengthBonus = 0;
  let magicDamagePct: number | undefined;
  switch (combatStyle) {
    case "melee": strengthBonus = melStr; break;
    case "ranged": strengthBonus = rngStr; break;
    case "magic": magicDamagePct = magStr / 10; break;
  }

  const slotItemIds = new Set(itemIds);
  const B = BONUS_TRIGGER_ITEM_IDS;
  const itemBonusFlags: ItemBonusFlags = {
    dragonHunterCrossbow: slotItemIds.has(B.DRAGON_HUNTER_CROSSBOW),
    dragonHunterLance: slotItemIds.has(B.DRAGON_HUNTER_LANCE),
    salveAmuletEi: slotItemIds.has(B.SALVE_AMULET_EI) || slotItemIds.has(B.SALVE_AMULET_E),
    salveAmulet: slotItemIds.has(B.SALVE_AMULET) || slotItemIds.has(B.SALVE_AMULET_I),
    demonbane: slotItemIds.has(B.ARCLIGHT) || slotItemIds.has(B.EMBERLIGHT),
    tomeOfFire: slotItemIds.has(B.TOME_OF_FIRE_CHARGED),
    twistedBow: slotItemIds.has(B.TWISTED_BOW),
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
    appliesWhen: {},
    slots: computedSlots,
    totals: {
      attackBonus,
      strengthBonus,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks,
    baseSpellMaxHit: combatStyle === "magic" ? input.baseSpellMaxHit : undefined,
    spellElement: combatStyle === "magic" ? input.spellElement : undefined,
    itemBonusFlags,
    weaponCategory: weapon.category,
    armorSetBonus,
  };

  const dps = computeSetDps(loadout, target, skills);
  const activeBonuses = activeBonusesForTarget(loadout, target);
  return { valid: true, loadout, dps, activeBonuses };
}
