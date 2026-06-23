// Conditional-bonus + defence-bucket helpers for scoring a loadout against a
// target. (The old universal-set applicability predicates were removed with
// the curated loadout architecture.)

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import type { LoadoutSet } from "@/types/loadout";
import type { ConditionalBonusFlags } from "@/types/osrs";

export interface TargetActiveBonuses {
  conditionalBonuses: ConditionalBonusFlags;
  tomeOfFireEquipped: boolean;
  tomeOfWaterEquipped: boolean;
  tomeOfEarthEquipped: boolean;
  /** True iff this loadout's weapon is Twisted bow. */
  twistedBowEquipped: boolean;
  /** True iff Osmumten's fang is the weapon AND it's swung on a stab style. */
  fangEquipped: boolean;
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
  const isKalphite = target.attributes.includes("kalphite");
  // Dragon hunter wand's dragonbane is active vs dragons AND does NOT stack with
  // Salve (unlike DHCB/DHL, which do). On an undead dragon (e.g. Vorkath) the
  // wand wins (+75/+40 ≫ Salve's +20/+20), so suppress Salve when it's active.
  const wandActive = set.itemBonusFlags.dragonHunterWand && isDragon;
  const isXerician = target.attributes.includes("xerician");
  const castsFire = set.spellElement === "fire";
  const castsWater = set.spellElement === "water";
  const castsEarth = set.spellElement === "earth";
  return {
    conditionalBonuses: {
      dragonHunterCrossbow: set.itemBonusFlags.dragonHunterCrossbow && isDragon,
      dragonHunterLance: set.itemBonusFlags.dragonHunterLance && isDragon,
      dragonHunterWand: wandActive,
      salveAmuletEi: set.itemBonusFlags.salveAmuletEi && isUndead && !wandActive,
      salveAmulet: set.itemBonusFlags.salveAmulet && isUndead && !wandActive,
      demonbane: set.itemBonusFlags.demonbane && isDemon,
      kerisVsKalphite: (set.itemBonusFlags.kerisPartisan ?? false) && isKalphite,
      kerisBreachVsKalphite: (set.itemBonusFlags.kerisBreaching ?? false) && isKalphite,
      // Wilderness weapons only get their ×3/2 vs NPCs fought in the Wilderness.
      wildernessWeapon:
        (set.itemBonusFlags.wildernessWeapon ?? false) && isWildernessBoss(target.slug),
    },
    // Tomes boost their element's spells vs all NPCs — not just element-weak
    // targets. (Element weakness is a separate accuracy+damage bonus modelled
    // in calculate.ts; the tome multiplier stacks on top of it.)
    tomeOfFireEquipped: set.itemBonusFlags.tomeOfFire && castsFire,
    tomeOfWaterEquipped: set.itemBonusFlags.tomeOfWater && castsWater,
    tomeOfEarthEquipped: set.itemBonusFlags.tomeOfEarth && castsEarth,
    twistedBowEquipped: set.itemBonusFlags.twistedBow,
    // Fang's double accuracy roll only fires on stab styles (Stab/Lunge/Block);
    // its slash style is a vanilla swing. Target-independent — works on any NPC.
    fangEquipped: set.itemBonusFlags.fang && set.attackType === "stab",
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
      return target.defenceBonuses.rangedHeavy;
    case "Thrown": // includes blowpipe, darts, knives
      return target.defenceBonuses.rangedLight;
    default: // Bow, Chinchompas, etc.
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
