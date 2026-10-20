// Shared DPS formulas — independent of combat style.
// See: https://oldschool.runescape.wiki/w/Damage_per_second

export function npcDefenceRoll(defenceLevel: number, defenceBonus: number): number {
  return (defenceLevel + 9) * (defenceBonus + 64);
}

export function hitChance(attackRoll: number, defenceRoll: number): number {
  if (attackRoll > defenceRoll) {
    return 1 - (defenceRoll + 2) / (2 * (attackRoll + 1));
  }
  return attackRoll / (2 * (defenceRoll + 1));
}

/**
 * Osmumten's fang accuracy. Outside the Tombs of Amascut the fang makes two
 * independent attack rolls against a single (un-rerolled) defence roll, and the
 * hit lands if either beats it. Averaging the standard discrete roll model over
 * defRoll ∈ {0..D} and squaring the per-roll fail probability collapses to a
 * closed form (Σk² = n(n+1)(2n+1)/6):
 *
 *   A ≥ D:  1 − (D+2)(2D+3) / (6(A+1)²)
 *   A < D:  A(4A+5) / (6(A+1)(D+1))
 *
 * This is exact (not an approximation) and reduces from the same discrete model
 * as `hitChance`; the gap fang − standard = (D+2)(3A−2D)/(6(A+1)²) ≥ 0 for A ≥ D,
 * so it never undershoots a single roll. The damage trim (15%–85% of max) is
 * symmetric and leaves the mean at max/2, so it does not affect DPS — only this
 * accuracy term does. https://oldschool.runescape.wiki/w/Osmumten's_fang
 */
export function fangHitChance(attackRoll: number, defenceRoll: number): number {
  const a = attackRoll;
  const d = defenceRoll;
  if (a >= d) {
    return 1 - ((d + 2) * (2 * d + 3)) / (6 * (a + 1) * (a + 1));
  }
  return (a * (4 * a + 5)) / (6 * (a + 1) * (d + 1));
}

/**
 * Confliction gauntlets (one-handed magic): an attack that follows a miss rolls
 * accuracy twice, like the fang. Hits and misses form a two-state chain —
 * after a hit the chance is s (single roll), after a miss d (double roll) — so
 * the long-run hit rate is its stationary value d / (1 + d − s). Matches
 * wgloop BaseCalc.getConflictionGauntletsAccuracyRoll.
 * https://oldschool.runescape.wiki/w/Confliction_gauntlets
 */
export function conflictionHitChance(attackRoll: number, defenceRoll: number): number {
  const single = hitChance(attackRoll, defenceRoll);
  const double = fangHitChance(attackRoll, defenceRoll);
  return double / (1 + double - single);
}

/**
 * DPS of a hit that lands with `chance` and rolls uniformly over 0..maxHit:
 * the plain uniform mean maxHit/2. The accurate-zero raise (and the seeking
 * arrow floor) are added on top by calculateDps — see `landedFloorLift`.
 */
export function dpsFromHitChance(
  chance: number,
  maxHit: number,
  attackSpeedTicks: number,
): number {
  const averageDamagePerHit = chance * (maxHit / 2);
  const secondsPerAttack = attackSpeedTicks * 0.6;
  return averageDamagePerHit / secondsPerAttack;
}

/**
 * Extra mean damage of ONE landed hitsplat when its roll — uniform over
 * rollMin..rollMax — is floored to `floor` before the later per-hitsplat
 * transforms `after` (Corp halving, phase damage factors, …) run:
 *
 *   Σ_{r = rollMin .. min(rollMax, floor − 1)} (after(floor) − after(r)) / (rollMax − rollMin + 1)
 *
 * wgloop's getAttackerDist (PlayerVsNPCCalc @ 89c3e25, `accurateZeroApplicable`)
 * raises every ACCURATE hitsplat of 0 to 1 — floor 1, worth 1/(M+1) on a roll
 * over 0..M: M = 10 gives (55 + 1)/11, not 55/11. Seeking arrows floor at 3
 * just before it (6/(M+1)). A roll whose minimum already reaches the floor
 * (Osmumten's fang once trunc(M × 3/20) ≥ 1) gains nothing. Max hits are
 * untouched: the floor only lifts the bottom of the roll.
 */
export function landedFloorLift(
  rollMin: number,
  rollMax: number,
  floor: number,
  after: (hitsplat: number) => number = (h) => h,
): number {
  if (rollMax < rollMin) return 0;
  let lift = 0;
  for (let r = rollMin; r < floor && r <= rollMax; r++) lift += after(floor) - after(r);
  return lift / (rollMax - rollMin + 1);
}

/**
 * Mean of `after(r)` over a roll uniform over lo..hi: the exact landed mean of
 * a hitsplat whose later per-hitsplat transforms truncate each roll on its
 * own. Corp's halving is the case that needs it: Σ_{r=0..M} trunc(r/2) =
 * ⌊M²/4⌋, so a roll over 0..40 averages 400/41 ≈ 9.76 once halved, where
 * halving the max first says trunc(40/2)/2 = 10 (an odd max agrees).
 */
export function meanTransformedRoll(
  lo: number,
  hi: number,
  after: (hitsplat: number) => number,
): number {
  if (hi < lo) return 0;
  let sum = 0;
  for (let r = lo; r <= hi; r++) sum += after(r);
  return sum / (hi - lo + 1);
}

/**
 * Probability that the BEST of `rolls` independent uniform rolls over 0..max
 * is exactly k: P(all ≤ k) − P(all ≤ k−1) = ((k+1)^n − k^n) / (max+1)^n.
 * One roll (n = 1) is the plain uniform 1/(max+1).
 */
export function bestOfRollWeight(k: number, max: number, rolls: number): number {
  if (k < 0 || k > max) return 0;
  const n = Math.max(1, rolls);
  return ((k + 1) ** n - k ** n) / (max + 1) ** n;
}

/**
 * Mean of `after(k)` where k is the best of `rolls` damage rolls, each uniform
 * over 0..max — the Obligator's passive (lib/dps/calculate.ts `damageRolls`):
 * one accuracy roll, then the damage is rolled n times and the highest kept.
 * `after` carries the kept hitsplat through the later per-hitsplat transforms
 * (the accurate-zero raise, Corp, a cap, a phase factor, flat armour), which
 * commute with the max since each is monotone in the roll. Closed form of the
 * untransformed mean: max − Σ_{k=0}^{max−1} ((k+1)/(max+1))^n, ≈ n·max/(n+1)
 * — two rolls over 0..10 average 825/121 ≈ 6.82, not 5; four, 9.1.
 */
export function meanBestOfRoll(
  max: number,
  rolls: number,
  after: (hitsplat: number) => number = (h) => h,
): number {
  if (max < 0) return 0;
  let sum = 0;
  for (let k = 0; k <= max; k++) sum += bestOfRollWeight(k, max, rolls) * after(k);
  return sum;
}

/**
 * One hitsplat through a per-phase damage factor — wgloop's
 * multiplyTransformer(n, d, minimum): trunc(h × n/d), except that with a
 * minimum a hit of at least `minimum` never drops below it, and a smaller one
 * is never reduced (the Tormented Demon's shield keeps a 1 at 1).
 */
export function scaleHitsplat(h: number, [n, d]: [number, number], minimum = 0): number {
  const scaled = Math.trunc((h * n) / d);
  if (minimum === 0) return scaled;
  return h >= minimum ? Math.max(minimum, scaled) : Math.max(h, scaled);
}

export function effectiveLevel(
  visibleLevel: number,
  prayerMultiplier: number,
  styleBonus: number,
  voidBonus = 0,
  baseOffset = 8,
): number {
  // Style-specific constant: +8 for melee/ranged, +9 for magic, as upstream
  // osrs-dps-calc does (getPlayerMaxMagicAttackRoll). The wiki's magic formula
  // uses +8 with a powered staff's Accurate at +3 rather than +2 — the same
  // total there; see styleBonuses in calculate.ts. Default keeps existing
  // ranged/melee callsites unchanged.
  return Math.floor(visibleLevel * prayerMultiplier) + styleBonus + baseOffset + voidBonus;
}
