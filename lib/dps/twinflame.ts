// Twinflame staff's second cast on standard Bolt/Blast/Wave spells.
//
// wgloop's getAttackerDist (PlayerVsNPCCalc @ 89c3e25) turns every first-cast
// hitsplat h, after every max-hit multiplier, into TWO hitsplats:
//
//   [h, trunc(h × 4/10)]
//
// so the attack maxes at M + trunc(M × 4/10) (= trunc(M × 7/5)), but its mean is
// not 7/10 of the max: each second hitsplat truncates on its own. With the
// first cast uniform over 0..M, the mean of a landed attack is
//
//   (1/(M+1)) Σ_{h=0..M} (h + trunc(2h/5))   ≈ 0.7·M − 0.4
//
// e.g. M = 10: (55 + 18)/11 = 73/11 ≈ 6.64, where 7/10 of the max (14) says 7.
//
// Every later transform runs on each hitsplat separately, in this order:
// the Corporeal Beast halving (still inside getAttackerDist), the Mad Angel
// reaction buffs, then the per-phase NPC damage factor (applyNpcTransforms). So
// the max hit and the mean are both rebuilt hitsplat by hitsplat here. Magic is
// corpbane, and none of these targets overlap, so in practice at most one of
// them applies — but the order is upstream's either way.
//
// Upstream's accurate-zero raise (see landedFloorLift in ./common) runs just
// BEFORE the split: a landed first cast of 0 becomes 1, so it deals [1, 0],
// worth 1/(M+1) on the mean (M = 10: 74/11). The loop below folds it in. The Sanguinesti
// staff's leech is another weapon, so it never meets this split.

import { scaleHitsplat } from "./common";

export interface TwinflameTransforms {
  /** Corporeal Beast halves each hitsplat (`DpsScenario.corpDamageHalved`). */
  halved?: boolean;
  /**
   * Mad Angel reaction buff (`DpsScenario.targetMinHitFactor`), on an attack
   * that always lands. [n, d] with n ≥ d is Perfect Lightning (`firstHitMax`):
   * the FIRST hitsplat becomes the first cast's max, the second keeps
   * trunc(h × 4/10) of the rolled h. Otherwise it is Sword Cleave
   * (`firstHitMinimum`): minimum = trunc(pairMax × n/d), and upstream floors
   * EVERY hitsplat of the attack to it, the second cast included.
   *
   * Upstream's split builds both hitsplats with the default `accurate = true`,
   * misses included, so its `firstHitAccurate` keeps the misses (dealt as
   * [min, min] / [max, 0]) and its mean runs ~1–3% under this one at 80%
   * accuracy. The buff's attack cannot miss in game, as `alwaysHits` says, so
   * this model lands every attack.
   */
  minHitFactor?: [number, number];
  /** Per-phase NPC damage scale (`DpsScenario.targetDamageFactor`), per hitsplat. */
  damageFactor?: [number, number];
  /** Its minimum (`DpsScenario.targetDamageMinimum`: the TD shield keeps a 1 at 1). */
  damageMinimum?: number;
}

export interface TwinflameDamage {
  /** The most one attack deals: the largest hitsplat-pair total. */
  maxHit: number;
  /** Mean damage of a LANDED attack, the first cast uniform over 0..firstMax. */
  meanLanded: number;
}

/** The second cast's hitsplat for a first-cast hit of `h`. */
export function twinflameSecondHit(h: number): number {
  return Math.trunc((h * 4) / 10);
}

/**
 * Max hit and exact landed mean of a Twinflame double cast whose first cast
 * maxes at `firstMax` (every max-hit multiplier already applied). Enumerates
 * the first cast's rolls; M is a magic max hit, so the loop is short.
 */
export function twinflameDamage(
  firstMax: number,
  transforms: TwinflameTransforms = {},
): TwinflameDamage {
  if (firstMax <= 0) return { maxHit: 0, meanLanded: 0 };
  const { halved, minHitFactor, damageFactor, damageMinimum } = transforms;

  // Attacker side: the split, then the corp halving (each hitsplat).
  const halve = (s: number): number => (halved ? Math.trunc(s / 2) : s);
  const top1 = halve(firstMax);
  const top2 = halve(twinflameSecondHit(firstMax));

  // Mad Angel buffs read the attacker distribution's max (the pair's total).
  let pinFirst = false;
  let floor = 0;
  if (minHitFactor) {
    const [n, d] = minHitFactor;
    if (n >= d) pinFirst = true;
    else floor = Math.trunc(((top1 + top2) * n) / d);
  }

  // NPC side: the per-phase damage factor (each hitsplat).
  const scale = (s: number): number =>
    damageFactor ? scaleHitsplat(s, damageFactor, damageMinimum) : s;

  let total = 0;
  let maxHit = 0;
  for (let roll = 0; roll <= firstMax; roll++) {
    // The accurate-zero raise, before the split.
    const h = Math.max(roll, 1);
    const s1 = Math.max(pinFirst ? top1 : halve(h), floor);
    const s2 = Math.max(halve(twinflameSecondHit(h)), floor);
    const pair = scale(s1) + scale(s2);
    total += pair;
    if (pair > maxHit) maxHit = pair;
  }
  return { maxHit, meanLanded: total / (firstMax + 1) };
}
