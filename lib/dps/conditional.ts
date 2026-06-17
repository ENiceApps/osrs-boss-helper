// Target-conditional accuracy/damage multipliers: dragonbane (vs dragon),
// Salve (vs undead), demonbane (vs demon). Which ones FIRE for a given target
// is decided in lib/loadout.ts → activeBonusesForTarget (off the target's
// attributes); this module just maps the resolved flags to numeric factors.
//
// Calibrated against tools.runescape.wiki/osrs-dps (weirdgloop calc) source:
//   src/lib/PlayerVsNPCCalc.ts in github.com/weirdgloop/osrs-dps-calc
//
// Key calibration facts:
//   1. DHCB is ASYMMETRIC: ×13/10 accuracy, ×5/4 damage.
//   2. DHL is symmetric ×6/5 / ×6/5.
//   3. Salve amulet (ei)/(e) vs undead is ×6/5; base Salve / (i) is ×7/6.
//   4. Demonbane (Arclight/Emberlight) vs demons is +70% accuracy AND damage,
//      applied ADDITIVELY (weirdgloop's trackAddFactor): value + trunc(value×70/100).
//      NOTE: weirdgloop further scales this by a per-monster "demonbane
//      vulnerability" (most demons = 100%, a few resist). We assume full 100%
//      for now — TODO once that per-monster datum is surfaced in the catalog.
//   5. Multipliers stack via Math.trunc after EACH application — not by
//      multiplying into a single combined factor. This matters because
//      Math.trunc(38 × 5/4) × 6/5 = 56, whereas Math.trunc(38 × 1.5) = 57.

import type { ConditionalBonusFlags } from "@/types/osrs";

export interface ConditionalFactor {
  numerator: number;
  denominator: number;
  /**
   * When true the factor is ADDITIVE — result = value + trunc(value×num/den)
   * (demonbane). Otherwise multiplicative — result = trunc(value×num/den).
   */
  additive?: boolean;
  /** Free-text reason for the multiplier; useful for "show more" breakdowns. */
  reason: string;
}

export interface ConditionalMultipliers {
  accuracy: ConditionalFactor[];
  damage: ConditionalFactor[];
}

export function conditionalMultipliers(
  flags: ConditionalBonusFlags | undefined,
): ConditionalMultipliers {
  const accuracy: ConditionalFactor[] = [];
  const damage: ConditionalFactor[] = [];
  if (!flags) return { accuracy, damage };

  // Demonbane first, mirroring weirdgloop's order (applied before dragonbane).
  if (flags.demonbane) {
    accuracy.push({ numerator: 70, denominator: 100, additive: true, reason: "Demonbane (Arclight/Emberlight) vs demon" });
    damage.push({ numerator: 70, denominator: 100, additive: true, reason: "Demonbane (Arclight/Emberlight) vs demon" });
  }
  if (flags.dragonHunterCrossbow) {
    accuracy.push({ numerator: 13, denominator: 10, reason: "Dragon hunter crossbow vs dragon" });
    damage.push({ numerator: 5, denominator: 4, reason: "Dragon hunter crossbow vs dragon" });
  }
  if (flags.dragonHunterLance) {
    accuracy.push({ numerator: 6, denominator: 5, reason: "Dragon hunter lance vs dragon" });
    damage.push({ numerator: 6, denominator: 5, reason: "Dragon hunter lance vs dragon" });
  }
  if (flags.dragonHunterWand) {
    // Magic dragonbane: +75% accuracy, +40% damage (buffed 2025-06-25 from 50/20).
    // Suppresses Salve upstream (they don't stack) so this never double-counts.
    accuracy.push({ numerator: 7, denominator: 4, reason: "Dragon hunter wand vs dragon" });
    damage.push({ numerator: 7, denominator: 5, reason: "Dragon hunter wand vs dragon" });
  }
  if (flags.salveAmuletEi) {
    accuracy.push({ numerator: 6, denominator: 5, reason: "Salve amulet (ei/e) vs undead" });
    damage.push({ numerator: 6, denominator: 5, reason: "Salve amulet (ei/e) vs undead" });
  } else if (flags.salveAmulet) {
    // Mutually exclusive with the enchanted variant (only one amulet equipped).
    accuracy.push({ numerator: 7, denominator: 6, reason: "Salve amulet (regular/i) vs undead" });
    damage.push({ numerator: 7, denominator: 6, reason: "Salve amulet (regular/i) vs undead" });
  }
  return { accuracy, damage };
}

export function applyFactors(value: number, factors: ConditionalFactor[]): number {
  let result = value;
  for (const f of factors) {
    const delta = Math.trunc((result * f.numerator) / f.denominator);
    result = f.additive ? result + delta : delta;
  }
  return result;
}
