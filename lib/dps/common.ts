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

export function dpsFromHitChance(
  chance: number,
  maxHit: number,
  attackSpeedTicks: number,
): number {
  const averageDamagePerHit = chance * (maxHit / 2);
  const secondsPerAttack = attackSpeedTicks * 0.6;
  return averageDamagePerHit / secondsPerAttack;
}

export function effectiveLevel(
  visibleLevel: number,
  prayerMultiplier: number,
  styleBonus: number,
  voidBonus = 0,
  baseOffset = 8,
): number {
  // Style-specific constant: +8 for melee/ranged, +9 for magic. See
  // https://oldschool.runescape.wiki/w/Magic_damage (the effective magic
  // level formula uses +9; melee/ranged use +8). Default keeps existing
  // ranged/melee callsites unchanged.
  return Math.floor(visibleLevel * prayerMultiplier) + styleBonus + baseOffset + voidBonus;
}
