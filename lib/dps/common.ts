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
