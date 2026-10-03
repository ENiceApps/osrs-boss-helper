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
//   3. Salve amulet (ei)/(e) vs undead is ×6/5; base Salve / (i) is ×7/6
//      (melee; ranged takes only the imbued two). It lives outside the weapon
//      list (`salveFactor`), applied first; magic uses `salveMagicPct` instead.
//   4. Demonbane (Arclight/Emberlight) vs demons is +70% accuracy AND damage,
//      applied ADDITIVELY (weirdgloop's trackAddFactor): value + trunc(value×70/100).
//      weirdgloop further scales the weapon's bonus PERCENT by a per-monster
//      "demonbane vulnerability" (BaseCalc.demonbaneVulnerability(): Duke
//      Sucellus 70, Yama 120, Yama void flares 200, Ice demon 115 — raised from
//      100 in the 2026-07-22 Summer Sweep-Up — else 100): the percent becomes
//      trunc(70 × vulnerability / 100) before it is applied (Duke: 49%). The
//      per-monster table lives in data/monsters/demonbane-vulnerability.ts;
//      `conditionalMultipliers` takes the resolved vulnerability (default 100,
//      i.e. every ordinary demon is unchanged).
//   5. Multipliers stack via Math.trunc after EACH application — not by
//      multiplying into a single combined factor. This matters because
//      Math.trunc(38 × 5/4) × 6/5 = 56, whereas Math.trunc(38 × 1.5) = 57.
//      For the same reason the ORDER matters (trunc(trunc(41×47/40)×7/6) = 56
//      but trunc(trunc(41×7/6)×47/40) = 55); calculate.ts sequences these
//      lists against Salve / black mask exactly as wgloop does.

import type { ConditionalBonusFlags } from "@/types/osrs";
import {
  DEFAULT_DEMONBANE_VULNERABILITY,
  scaleDemonbanePct,
} from "@/data/monsters/demonbane-vulnerability";

export interface ConditionalFactor {
  numerator: number;
  denominator: number;
  /**
   * When true the factor is ADDITIVE — result = value + trunc(value×num/den)
   * (demonbane). Otherwise multiplicative — result = trunc(value×num/den).
   */
  additive?: boolean;
  /**
   * The wilderness-weapon ×3/2. Magic applies it later than the other factors
   * (after the black mask and demonbane spell), so calculate.ts splits it out.
   */
  wilderness?: boolean;
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
  /**
   * The target's demonbane vulnerability as a percent (see
   * data/monsters/demonbane-vulnerability.ts). Scales every demonbane tier's
   * bonus percent — upstream's demonbaneFactor: trunc(pct × vulnerability/100).
   * Default 100 = an ordinary demon (bonus unchanged).
   */
  demonbaneVulnerability: number = DEFAULT_DEMONBANE_VULNERABILITY,
): ConditionalMultipliers {
  const accuracy: ConditionalFactor[] = [];
  const damage: ConditionalFactor[] = [];
  if (!flags) return { accuracy, damage };

  // Demonbane first, mirroring weirdgloop's order (applied before dragonbane).
  // Only one weapon can be worn, so at most one demonbane tier fires at a time.
  // Each tier's percent is scaled by the target's vulnerability (whole-percent
  // truncation) — the same value feeds accuracy AND damage, as upstream does.
  const vulnNote =
    demonbaneVulnerability === DEFAULT_DEMONBANE_VULNERABILITY
      ? ""
      : ` (${demonbaneVulnerability}% demonbane vulnerability)`;
  if (flags.demonbane) {
    const pct = scaleDemonbanePct(70, demonbaneVulnerability);
    const reason = `Demonbane (Arclight/Emberlight) vs demon${vulnNote}`;
    accuracy.push({ numerator: pct, denominator: 100, additive: true, reason });
    damage.push({ numerator: pct, denominator: 100, additive: true, reason });
  }
  if (flags.demonbaneSilverlight) {
    const pct = scaleDemonbanePct(60, demonbaneVulnerability);
    const reason = `Demonbane (Silverlight/Darklight) vs demon${vulnNote}`;
    accuracy.push({ numerator: pct, denominator: 100, additive: true, reason });
    damage.push({ numerator: pct, denominator: 100, additive: true, reason });
  }
  if (flags.demonbaneClaws) {
    const pct = scaleDemonbanePct(5, demonbaneVulnerability);
    const reason = `Demonbane (Burning claws) vs demon${vulnNote}`;
    accuracy.push({ numerator: pct, denominator: 100, additive: true, reason });
    damage.push({ numerator: pct, denominator: 100, additive: true, reason });
  }
  if (flags.demonbaneScorchingBow) {
    // Accuracy only — the +30% DAMAGE lives in calculate.ts because on a
    // slayer task it merges additively into the black-mask multiplier
    // ((23+6)/20), which this per-factor list can't express.
    accuracy.push({
      numerator: scaleDemonbanePct(30, demonbaneVulnerability),
      denominator: 100,
      additive: true,
      reason: `Demonbane (Scorching bow) vs demon${vulnNote}`,
    });
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
  if (flags.leafBladedBattleaxe) {
    // Leaf-bladed battleaxe vs a leafy target: +17.5% damage (×47/40),
    // multiplicative (wgloop MAX_HIT_LEAFY trackFactor). Damage only.
    damage.push({ numerator: 47, denominator: 40, reason: "Leaf-bladed battleaxe vs leafy" });
  }
  if (flags.wildernessWeapon) {
    // Charged wilderness weapon vs an NPC in the Wilderness: +50% accuracy AND
    // damage. Same ×3/2 for all six weapons (Craw's/Webweaver, Viggora's/
    // Ursine, Thammaron's/Accursed). Multiplicative — EXCEPT on-task ranged,
    // where the damage half folds into the mask (see foldRangedBaneDamage).
    // Last in the list, and tagged: magic applies it after the black mask and
    // demonbane spell (wgloop's rev-weapon step).
    const reason = "Wilderness weapon vs NPC in the Wilderness";
    accuracy.push({ numerator: 3, denominator: 2, reason, wilderness: true });
    if (!foldRangedBaneDamage) {
      damage.push({ numerator: 3, denominator: 2, reason, wilderness: true });
    }
  }
  return { accuracy, damage };
}

/**
 * The Salve amulet's factor vs undead, or undefined when none is active:
 * (ei)/(e) ×6/5, regular/(i) ×7/6 — melee and ranged, on accuracy AND damage.
 * Not part of `conditionalMultipliers`: Salve shares wgloop's first bonus slot
 * with the black mask (they never stack) and lands BEFORE every weapon bane,
 * so calculate.ts applies it ahead of that list. Which variants count for the
 * style (ranged needs (i)/(ei)) is resolved upstream in activeBonusesForTarget.
 * Magic doesn't use this factor: its Salve is a flat percent folded into the
 * magic accuracy / damage bonus (see `salveMagicPct`).
 */
export function salveFactor(flags: ConditionalBonusFlags | undefined): ConditionalFactor | undefined {
  if (flags?.salveAmuletEi) {
    return { numerator: 6, denominator: 5, reason: "Salve amulet (ei/e) vs undead" };
  }
  if (flags?.salveAmulet) {
    // Mutually exclusive with the enchanted variant (only one amulet equipped).
    return { numerator: 7, denominator: 6, reason: "Salve amulet (regular/i) vs undead" };
  }
  return undefined;
}

/**
 * Magic Salve bonus as a whole percent: Salve amulet(ei) +20, Salve amulet(i)
 * +15 — wgloop adds it to the magic attack-roll percent (with the smoke-staff
 * +10) and to the magic damage bonus, rather than multiplying ×6/5 / ×7/6.
 * Only the imbued variants work for magic; activeBonusesForTarget already
 * drops the (e) / regular amulet for magic, so here (ei) is `salveAmuletEi`
 * and (i) is `salveAmulet`.
 */
export function salveMagicPct(flags: ConditionalBonusFlags | undefined): number {
  if (flags?.salveAmuletEi) return 20;
  if (flags?.salveAmulet) return 15;
  return 0;
}

export function applyFactors(value: number, factors: ConditionalFactor[]): number {
  let result = value;
  for (const f of factors) {
    const delta = Math.trunc((result * f.numerator) / f.denominator);
    result = f.additive ? result + delta : delta;
  }
  return result;
}
