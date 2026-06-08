// Recommendation engine.
// Given a target (a MonsterCatalogEntry) plus the player's bank + GP + skills,
// filter the universal loadout set library by applicability, score each one
// for ownership/affordability, and rank viable sets by DPS against this
// specific target's stats. One curated set serves every boss that matches
// its predicate — no per-boss preset curation needed.

import type {
  DpsResult,
  ItemId,
  Skills,
  BankContents,
} from "@/types/osrs";
import { asItemId } from "@/types/osrs";
import { calculateDps } from "@/lib/dps/calculate";
import { applyCombatBoost, type BoostResolver, type CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import {
  activeBonusesForTarget,
  applicableSets,
  defenceBonusForAttackType,
  rangedDefenceBonusFor,
} from "@/lib/loadout";

type LatestPriceLookup = (itemId: number) => number | null;

export type SlotStatus = "owned" | "affordable" | "missing";

export interface LoadoutEvaluation {
  set: LoadoutSet;
  slotStatuses: Partial<Record<LoadoutSlotKey, SlotStatus>>;
  totalCostToComplete: number;
  viable: boolean;
  dps?: DpsResult;
  /** Diagnostic — which conditional bonuses actually fired against this target. */
  activeBonuses: ReturnType<typeof activeBonusesForTarget>;
}

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

export interface LoadoutPreview {
  set: LoadoutSet;
  dps: DpsResult;
  activeBonuses: ReturnType<typeof activeBonusesForTarget>;
}

/**
 * Browse-mode: show every loadout that applies to this target, ranked by DPS
 * at the supplied skill levels (typically the 99-across-the-board fallback
 * on the dynamic boss page). No bank / GP / ownership considered.
 */
export function previewLoadoutsForBoss(
  sets: readonly LoadoutSet[],
  target: MonsterCatalogEntry,
  skills: Skills,
  /** Resolves the boost potion the player owns for a given style (from the bank). */
  boostResolver?: BoostResolver,
): LoadoutPreview[] {
  return applicableSets(sets, target)
    .map((set) => ({
      set,
      dps: computeSetDps(set, target, skills, boostResolver?.(set.style)),
      activeBonuses: activeBonusesForTarget(set, target),
    }))
    .sort((a, b) => b.dps.dps - a.dps.dps);
}

export function evaluateLoadout(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
  owned: Set<ItemId>,
  gp: number,
  priceLookup: LatestPriceLookup,
  skills: Skills,
  boostResolver?: BoostResolver,
): LoadoutEvaluation {
  const slotStatuses: Partial<Record<LoadoutSlotKey, SlotStatus>> = {};
  let totalCostToComplete = 0;
  let viable = true;

  for (const [slotKey, piece] of Object.entries(set.slots) as Array<[
    LoadoutSlotKey,
    { itemId: number; itemName: string; version?: string },
  ]>) {
    if (!piece) continue;
    const branded = asItemId(piece.itemId);
    if (owned.has(branded)) {
      slotStatuses[slotKey] = "owned";
      continue;
    }
    const price = priceLookup(piece.itemId);
    if (price !== null && price <= gp - totalCostToComplete) {
      slotStatuses[slotKey] = "affordable";
      totalCostToComplete += price;
    } else {
      slotStatuses[slotKey] = "missing";
      viable = false;
    }
  }

  const activeBonuses = activeBonusesForTarget(set, target);
  const dps: DpsResult | undefined = viable
    ? computeSetDps(set, target, skills, boostResolver?.(set.style))
    : undefined;

  return { set, slotStatuses, totalCostToComplete, viable, dps, activeBonuses };
}

export function rankLoadoutsForBoss(
  sets: readonly LoadoutSet[],
  target: MonsterCatalogEntry,
  bank: BankContents,
  gp: number,
  priceLookup: LatestPriceLookup,
  skills: Skills,
  boostResolver?: BoostResolver,
): LoadoutEvaluation[] {
  const applicable = applicableSets(sets, target);
  return applicable
    .map((s) => evaluateLoadout(s, target, bank.itemIds, gp, priceLookup, skills, boostResolver))
    .sort((a, b) => {
      if (a.viable !== b.viable) return a.viable ? -1 : 1;
      const aDps = a.dps?.dps ?? 0;
      const bDps = b.dps?.dps ?? 0;
      return bDps - aDps;
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
