// Bridge between "pile of bank items" and "DPS number."
// Given raw item IDs + a boss + player skills, synthesize a LoadoutSet and
// score it through the existing DPS engine. Phase 1 of the bank-driven
// optimizer: Phase 2 will enumerate combinations of bank items and call this
// as the scorer.

import type { ItemCatalogEntry } from "@/data/items/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import {
  rangedDamageUsesMeleeStrength,
} from "@/data/items/special-strength";
import { detectArmorSetBonus } from "@/data/armor-sets";
import { ammoApplicability } from "@/data/items/ammo-applicability";
import { canonicalItemId, withCanonicalIds } from "@/data/items/aliases";
import { sumGear } from "@/lib/gear-totals";
import { findCatalogItem, itemBonusFlagsFor } from "@/lib/loadout-edit";
import { combatStyleFor, defaultStyleFor, WEAPON_STYLES } from "@/data/weapon-styles";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { computeSetDps } from "@/lib/recommend";
import type { BoostResolver } from "@/lib/dps/boost";
import { activeBonusesForTarget } from "@/lib/loadout";
import type {
  LoadoutSet,
  LoadoutSlotKey,
  LoadoutTier,
} from "@/types/loadout";
import type {
  AttackStyleChoice,
  DpsResult,
  PrayerSelection,
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
  /** Magic-only: name of the auto-selected standard spellbook spell, for UI display. */
  autoSpellName?: string;
  /** Resolves the boost potion the player owns for the loadout's style (from the bank). */
  boostResolver?: BoostResolver;
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask?: boolean;
  /** Soulreaper axe: assume max 5 stacks (+30% Strength level). */
  soulreaperMaxStacks?: boolean;
  /** Ruby bolt special assumed to fire (default ON). OFF = ruby bolts valued on raw stats only. */
  rubyProcEnabled?: boolean;
  /** Mark of Darkness active (default OFF) — boosts demonbane spells vs demons. */
  markOfDarkness?: boolean;
  /** The offensive prayer. Omitted = the style's best (Piety / Rigour / Augury). */
  prayer?: PrayerSelection;
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

  // Step 6: ammo vs weapon. The wiki calc's own table decides
  // (data/items/ammo-applicability.ts): a weapon that needs ammo and has none
  // it can fire (an empty slot, a blessing under a bow, bolts in a bow, a
  // salamander without its tar) attacks for 0 upstream, so it is never a
  // build worth scoring. A weapon that uses no ammo ignores the slot.
  const ammoItems = bySlot.get("ammo") ?? [];
  if (weapon && ammoApplicability(weapon.id, ammoItems[0]?.id) === "invalid") {
    reasons.push(
      ammoItems[0]
        ? `"${weapon.name}" can't fire "${ammoItems[0].name}".`
        : `"${weapon.name}" needs ammo in the ammo slot.`,
    );
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
  const computedSlots: LoadoutSet["slots"] = {};
  const worn: { slot: LoadoutSlotKey; item: ItemCatalogEntry }[] = [];
  for (const { item, slot } of resolved) {
    if ((bySlot.get(slot)?.length ?? 0) > 1) continue; // skip collided slots
    computedSlots[slot] = {
      itemId: item.id,
      itemName: item.name,
      version: item.version || undefined,
    };
    worn.push({ slot, item });
  }
  // Canonical stats, fired-ammo gating, Dizana's quiver and Dinh's bulwark all
  // live in sumGear, shared with the manual gear editor.
  const gear = sumGear(worn, style.attackType);
  const attackBonus = gear.attackBonus;
  const melStr = gear.melStr;
  let rngStr = gear.rngStr;
  const magStr = gear.magStr;
  const prayerBonus = gear.prayerBonus;
  const attackSpeedTicks = gear.attackSpeedTicks;

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

  // Powered staves (Trident, Sanguinesti, Eye of Ayak, …) embed their own
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

  // Shared with the manual gear editor (applyOverrides) so the two can't drift.
  // Canonical ids too, so a locked / ornamented / recoloured variant triggers
  // what its base item does (upstream canonicalises before every check).
  const slotItemIds = withCanonicalIds(itemIds);
  const itemBonusFlags = itemBonusFlagsFor(slotItemIds);

  // Tier is purely informational on the recommend path; mark scratch loadouts
  // as "end" so they sort alongside curated endgame sets when both apply.
  const tier: LoadoutTier = "end";

  const armorSetBonus = detectArmorSetBonus(slotItemIds, combatStyle, {
    attackType: style.attackType,
    weaponId: canonicalItemId(weapon.id),
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
      offensive: gear.offensive,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks,
    internalAmmo,
    baseSpellMaxHit: combatStyle === "magic" ? resolvedBaseSpellMaxHit : undefined,
    // Powered staves (Trident / Sanguinesti / Tumeken's shadow) and a
    // salamander's Blaze fire their own attack with NO spell element — they
    // must NOT inherit a spellElement, or the engine would wrongly apply
    // elemental-weakness / tome bonuses to them.
    spellElement:
      combatStyle === "magic" && !poweredStaffFormula
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
    undefined,
    input.prayer,
    input.rubyProcEnabled ?? true,
    input.markOfDarkness ?? false,
  );
  const activeBonuses = activeBonusesForTarget(loadout, target);
  return { valid: true, loadout, dps, activeBonuses };
}
