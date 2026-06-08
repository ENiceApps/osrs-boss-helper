// Recommendation engine.
// Given a target (a MonsterCatalogEntry) plus the player's bank + GP + skills,
// filter the universal loadout set library by applicability, score each one
// for ownership/affordability, and rank viable sets by DPS against this
// specific target's stats. One curated set serves every boss that matches
// its predicate — no per-boss preset curation needed.

import type { DpsResult, Skills } from "@/types/osrs";
import { calculateDps } from "@/lib/dps/calculate";
import { applyCombatBoost, type CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet } from "@/types/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import {
  activeBonusesForTarget,
  defenceBonusForAttackType,
  rangedDefenceBonusFor,
} from "@/lib/loadout";

const DEFAULT_PRAYERS = {
  melee: {
    attackMultiplier: 1.2,
    strengthMultiplier: 1.23,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1.25,
  },
  ranged: {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1.2,
    rangedStrengthMultiplier: 1.23,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1.25,
  },
  magic: {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1.25,
    // Augury gives +25% magic accuracy AND +4% magic damage.
    magicDamageMultiplier: 1.04,
    defenceMultiplier: 1.25,
  },
} as const;

/** Resolve which defence-bonus number to feed the DPS calc given the loadout's attack profile. */
function defenceBonusForSet(set: LoadoutSet, target: MonsterCatalogEntry): number {
  if (set.attackType === "ranged") {
    // Dispatch by weapon category: Crossbow → heavy, Bow → standard,
    // Thrown/Blowpipe → light. Falls back to "standard" if the field is
    // missing (legacy sets built before weaponCategory was added).
    return rangedDefenceBonusFor(target, set.weaponCategory);
  }
  return defenceBonusForAttackType(target, set.attackType);
}

function targetDefenceLevelFor(set: LoadoutSet, target: MonsterCatalogEntry): number {
  // For magic, NPC defence roll uses skills.magic — every other style uses skills.def.
  return set.style === "magic" ? target.magicLevel : target.defenceLevel;
}

/**
 * Pure DPS calculation for a set against a target — no bank / ownership /
 * affordability concerns. Used both by the full evaluator and by the
 * browse-mode previewer on the dynamic boss page.
 */
export function computeSetDps(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
  skills: Skills,
  /** Optional combat-boost potion. Applied to the visible level before the engine. */
  boost?: CombatBoost,
): DpsResult {
  const activeBonuses = activeBonusesForTarget(set, target);
  const effectiveSkills = applyCombatBoost(skills, boost);
  return calculateDps({
    style: set.style,
    attackStyle: set.attackStyleChoice,
    prayers: DEFAULT_PRAYERS[set.style],
    skills: effectiveSkills,
    attackBonus: set.totals.attackBonus,
    strengthBonus: set.totals.strengthBonus,
    magicDamagePercent: set.totals.magicDamagePct,
    baseSpellMaxHit: set.style === "magic" ? set.baseSpellMaxHit : undefined,
    attackSpeedTicks: set.attackSpeedTicks,
    targetDefenceLevel: targetDefenceLevelFor(set, target),
    targetDefenceBonusForStyle: defenceBonusForSet(set, target),
    conditionalBonuses: activeBonuses.conditionalBonuses,
    spellElement: set.spellElement,
    tomeOfFireEquipped: activeBonuses.tomeOfFireEquipped,
    twistedBowEquipped: activeBonuses.twistedBowEquipped,
    targetMonsterMagicLevel: activeBonuses.targetMonsterMagicLevel,
    targetIsXerician: activeBonuses.targetIsXerician,
    armorSetBonus: set.armorSetBonus,
    targetWeakness: target.weakness
      ? {
          element: target.weakness.element as never,
          severity: target.weakness.severity,
        }
      : undefined,
  });
}

/** Convenience for pages that just want recommendations at default level-99 skills. */
export const SKILLS_AT_99: Skills = {
  attack: 99,
  strength: 99,
  defence: 99,
  ranged: 99,
  magic: 99,
  hitpoints: 99,
  prayer: 99,
};
