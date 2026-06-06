// Helpers for matching universal loadout sets to specific boss targets.

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type {
  AppliesWhen,
  LoadoutSet,
} from "@/types/loadout";
import type { ConditionalBonusFlags } from "@/types/osrs";

/**
 * True iff every condition in the predicate matches the target. Empty
 * predicate ⇒ always applies (universal set).
 */
export function predicateMatches(
  aw: AppliesWhen,
  target: MonsterCatalogEntry,
): boolean {
  if (aw.requiresAttributes) {
    for (const attr of aw.requiresAttributes) {
      if (!target.attributes.includes(attr)) return false;
    }
  }
  if (aw.excludesAttributes) {
    for (const attr of aw.excludesAttributes) {
      if (target.attributes.includes(attr)) return false;
    }
  }
  if (aw.weaknessElement) {
    if (target.weakness?.element !== aw.weaknessElement) return false;
  }
  return true;
}

export function setAppliesTo(set: LoadoutSet, target: MonsterCatalogEntry): boolean {
  return predicateMatches(set.appliesWhen, target);
}

export function applicableSets(
  sets: readonly LoadoutSet[],
  target: MonsterCatalogEntry,
): LoadoutSet[] {
  return sets.filter((s) => setAppliesTo(s, target));
}

export interface TargetActiveBonuses {
  conditionalBonuses: ConditionalBonusFlags;
  tomeOfFireEquipped: boolean;
  /** True iff this loadout's weapon is Twisted bow. */
  twistedBowEquipped: boolean;
  /** Target's effective magic level for Tbow scaling. */
  targetMonsterMagicLevel: number;
  /** Whether target is in Chambers of Xeric (350 cap vs 250). */
  targetIsXerician: boolean;
}

/**
 * Resolve which of the set's item-implied bonuses actually fire against this
 * target. DHCB only matters if the target is dragon-classified; Salve(ei)
 * only matters vs undead; Tome of Fire only matters when the cast spell is
 * fire-element AND the target is fire-weak.
 */
export function activeBonusesForTarget(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
): TargetActiveBonuses {
  const isDragon = target.attributes.includes("dragon");
  const isUndead = target.attributes.includes("undead");
  const isDemon = target.attributes.includes("demon");
  const isFireWeak = target.weakness?.element === "fire";
  const castsFire = set.spellElement === "fire";
  const isXerician = target.attributes.includes("xerician");
  return {
    conditionalBonuses: {
      dragonHunterCrossbow: set.itemBonusFlags.dragonHunterCrossbow && isDragon,
      dragonHunterLance: set.itemBonusFlags.dragonHunterLance && isDragon,
      salveAmuletEi: set.itemBonusFlags.salveAmuletEi && isUndead,
      salveAmulet: set.itemBonusFlags.salveAmulet && isUndead,
      demonbane: set.itemBonusFlags.demonbane && isDemon,
    },
    tomeOfFireEquipped: set.itemBonusFlags.tomeOfFire && castsFire && isFireWeak,
    twistedBowEquipped: set.itemBonusFlags.twistedBow,
    // Per wgloop's source: M = max(skills.magic, offensive.magic). Catalog
    // only exposes skills.magic for now; offensive.magic isn't surfaced.
    // For most monsters these match; we'll plumb offensive.magic if we hit
    // a target where the difference matters.
    targetMonsterMagicLevel: target.magicLevel,
    targetIsXerician: isXerician,
  };
}

/** Pick the wiki ranged-defence bucket that corresponds to a weapon attack profile. */
export function rangedDefenceBonusFor(
  target: MonsterCatalogEntry,
  /** Use weapon category if known; defaults to "standard" (bow) bucket. */
  weaponCategory?: string,
): number {
  switch (weaponCategory) {
    case "Crossbow":
    case "Two-handed Crossbow":
      return target.defenceBonuses.rangedHeavy;
    case "Thrown":
    case "Blowpipe":
      return target.defenceBonuses.rangedLight;
    default:
      return target.defenceBonuses.rangedStandard;
  }
}

/** Get the right defence bonus from the target for a given attack type. */
export function defenceBonusForAttackType(
  target: MonsterCatalogEntry,
  attackType: "stab" | "slash" | "crush" | "magic" | "ranged",
): number {
  switch (attackType) {
    case "stab":
      return target.defenceBonuses.stab;
    case "slash":
      return target.defenceBonuses.slash;
    case "crush":
      return target.defenceBonuses.crush;
    case "magic":
      return target.defenceBonuses.magic;
    case "ranged":
      // Default to heavy (crossbow) — for non-crossbow weapons recommend.ts
      // looks up the weapon category and calls rangedDefenceBonusFor instead.
      return target.defenceBonuses.rangedHeavy;
  }
}
