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
  /**
   * On-task RANGED only: wgloop folds ranged-bane DAMAGE bonuses additively
   * into the imbued-black-mask multiplier — DHCB +5/20, wilderness weapon
   * +10/20, Scorching bow +6/20 → ×(23+bonus)/20 — instead of stacking them
   * multiplicatively. When true, the standalone DHCB/wilderness damage
   * factors are omitted here and calculate.ts adds them to the mask
   * numerator. Accuracy factors are unaffected either way.
   */
  foldRangedBaneDamage = false,
): ConditionalMultipliers {
  const accuracy: ConditionalFactor[] = [];
  const damage: ConditionalFactor[] = [];
  if (!flags) return { accuracy, damage };

  // Demonbane first, mirroring weirdgloop's order (applied before dragonbane).
  // Only one weapon can be worn, so at most one demonbane tier fires at a time.
  if (flags.demonbane) {
    accuracy.push({ numerator: 70, denominator: 100, additive: true, reason: "Demonbane (Arclight/Emberlight) vs demon" });
    damage.push({ numerator: 70, denominator: 100, additive: true, reason: "Demonbane (Arclight/Emberlight) vs demon" });
  }
  if (flags.demonbaneSilverlight) {
    accuracy.push({ numerator: 60, denominator: 100, additive: true, reason: "Demonbane (Silverlight/Darklight) vs demon" });
    damage.push({ numerator: 60, denominator: 100, additive: true, reason: "Demonbane (Silverlight/Darklight) vs demon" });
  }
  if (flags.demonbaneClaws) {
    accuracy.push({ numerator: 5, denominator: 100, additive: true, reason: "Demonbane (Burning claws) vs demon" });
    damage.push({ numerator: 5, denominator: 100, additive: true, reason: "Demonbane (Burning claws) vs demon" });
  }
  if (flags.demonbaneScorchingBow) {
    // Accuracy only — the +30% DAMAGE lives in calculate.ts because on a
    // slayer task it merges additively into the black-mask multiplier
    // ((23+6)/20), which this per-factor list can't express.
    accuracy.push({ numerator: 30, denominator: 100, additive: true, reason: "Demonbane (Scorching bow) vs demon" });
  }
  if (flags.dragonHunterCrossbow) {
    accuracy.push({ numerator: 13, denominator: 10, reason: "Dragon hunter crossbow vs dragon" });
    if (!foldRangedBaneDamage) {
      damage.push({ numerator: 5, denominator: 4, reason: "Dragon hunter crossbow vs dragon" });
    }
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
  if (flags.kerisVsKalphite) {
    // Keris partisan family vs Kalphites/Scabarites: +33% damage (×4/3). The
    // 1/51 triple-damage proc is mean-only and handled in calculate.ts, not here.
    damage.push({ numerator: 4, denominator: 3, reason: "Keris partisan vs Kalphite/Scabarite" });
  }
  if (flags.kerisBreachVsKalphite) {
    // Keris partisan of breaching: +33% accuracy vs Kalphites/Scabarites
    // (persists outside the Tombs of Amascut).
    accuracy.push({ numerator: 4, denominator: 3, reason: "Keris partisan of breaching vs Kalphite/Scabarite" });
  }
  if (flags.golembaneGraniteHammer) {
    // Granite hammer vs golem: ×13/10 accuracy AND damage, multiplicative
    // (wgloop PLAYER_ACCURACY_GOLEMBANE / MAX_HIT_GOLEMBANE trackFactor).
    accuracy.push({ numerator: 13, denominator: 10, reason: "Granite hammer vs golem" });
    damage.push({ numerator: 13, denominator: 10, reason: "Granite hammer vs golem" });
  }
  if (flags.golembaneBarronite) {
    // Barronite mace vs golem: damage only — no accuracy component in wgloop.
    damage.push({ numerator: 23, denominator: 20, reason: "Barronite mace vs golem" });
  }
  if (flags.salveAmuletEi) {
    accuracy.push({ numerator: 6, denominator: 5, reason: "Salve amulet (ei/e) vs undead" });
    damage.push({ numerator: 6, denominator: 5, reason: "Salve amulet (ei/e) vs undead" });
  } else if (flags.salveAmulet) {
    // Mutually exclusive with the enchanted variant (only one amulet equipped).
    accuracy.push({ numerator: 7, denominator: 6, reason: "Salve amulet (regular/i) vs undead" });
    damage.push({ numerator: 7, denominator: 6, reason: "Salve amulet (regular/i) vs undead" });
  }
  if (flags.wildernessWeapon) {
    // Charged wilderness weapon vs an NPC in the Wilderness: +50% accuracy AND
    // damage. Same ×3/2 for all six weapons (Craw's/Webweaver, Viggora's/
    // Ursine, Thammaron's/Accursed). Multiplicative — EXCEPT on-task ranged,
    // where the damage half folds into the mask (see foldRangedBaneDamage).
    accuracy.push({ numerator: 3, denominator: 2, reason: "Wilderness weapon vs NPC in the Wilderness" });
    if (!foldRangedBaneDamage) {
      damage.push({ numerator: 3, denominator: 2, reason: "Wilderness weapon vs NPC in the Wilderness" });
    }
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
