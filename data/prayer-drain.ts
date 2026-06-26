/**
 * Prayer drain + supply-cost model for the results rail.
 *
 * The DPS calc assumes one offensive overhead prayer per combat style (see
 * ASSUMED_PRAYER in lib/recommend.ts: Piety / Rigour / Augury). This module
 * estimates how fast that prayer drains and how many prayer potions per hour it
 * costs, so the player can factor supplies into "is this boss worth it?".
 *
 * Mechanics (per OSRS Wiki, Prayer § drain rate):
 *  - Each prayer has a "drain effect". Piety, Rigour and Augury all drain at 24.
 *  - Drain resistance = 2 × (worn Prayer bonus) + 60.
 *  - One prayer point is lost every (drainResistance / drainEffect) game ticks;
 *    a tick is 0.6 s. So worn Prayer bonus directly slows the drain.
 *
 * This intentionally models only the offensive overhead — many bosses also run a
 * protection prayer (drain effect 12), which would increase the cost. Treat the
 * output as a lower-bound estimate and label it as such in the UI.
 */

export type CombatStyle = "melee" | "ranged" | "magic";

const TICK_SECONDS = 0.6;

/** Drain effect of the assumed offensive overhead prayer, per combat style. */
export const PRAYER_DRAIN_EFFECT: Record<CombatStyle, number> = {
  melee: 24, // Piety
  ranged: 24, // Rigour
  magic: 24, // Augury
};

/** Prayer potion(4) — the default restore item we price the supply cost against. */
export const PRAYER_POTION_4_ID = 2434;
/** Doses in a Prayer potion(4). */
export const DOSES_PER_PRAYER_POTION = 4;

/**
 * Prayer points drained per minute for a given drain effect and worn Prayer
 * bonus. Higher Prayer bonus → slower drain.
 */
export function prayerPointsPerMinute(drainEffect: number, prayerBonus: number): number {
  const drainResistance = 2 * Math.max(0, prayerBonus) + 60;
  const ticksPerPoint = drainResistance / drainEffect;
  const secondsPerPoint = ticksPerPoint * TICK_SECONDS;
  return 60 / secondsPerPoint;
}

/**
 * Prayer points restored per dose of a prayer potion at a given Prayer level:
 * 7 + ⌊25% of level⌋ (so 31 at level 99). Super restores give one more (8 + …)
 * but Prayer potion is the common default.
 */
export function prayerRestorePerDose(prayerLevel: number): number {
  return 7 + Math.floor(0.25 * Math.max(1, prayerLevel));
}

export interface SupplyEstimate {
  pointsPerMinute: number;
  /** Prayer potions (4-dose) consumed per hour of continuous prayer use. */
  potionsPerHour: number;
  /** GP per hour spent on prayer potions, or null when the price is unknown. */
  gpPerHour: number | null;
}

/**
 * Estimate prayer-potion supply consumption for an hour of continuous combat.
 *
 * @param style          combat style → which offensive prayer is assumed
 * @param prayerLevel    the player's Prayer level (restore-per-dose scales with it)
 * @param prayerBonus    worn Prayer bonus from the loadout (slows drain)
 * @param potionPriceGp  GE price of a Prayer potion(4), or null if unknown
 */
export function estimatePrayerSupplies(
  style: CombatStyle,
  prayerLevel: number,
  prayerBonus: number,
  potionPriceGp: number | null,
): SupplyEstimate {
  const pointsPerMinute = prayerPointsPerMinute(PRAYER_DRAIN_EFFECT[style], prayerBonus);
  const pointsPerHour = pointsPerMinute * 60;
  const dosesPerHour = pointsPerHour / prayerRestorePerDose(prayerLevel);
  const potionsPerHour = dosesPerHour / DOSES_PER_PRAYER_POTION;
  return {
    pointsPerMinute,
    potionsPerHour,
    gpPerHour: potionPriceGp != null ? potionsPerHour * potionPriceGp : null,
  };
}
