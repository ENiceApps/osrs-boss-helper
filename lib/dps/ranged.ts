export function rangedMaxHit(effectiveRangedStrength: number, rangedStrengthBonus: number): number {
  return Math.floor(0.5 + (effectiveRangedStrength * (rangedStrengthBonus + 64)) / 640);
}

export function rangedAttackRoll(
  effectiveRangedAttack: number,
  rangedAttackBonus: number,
): number {
  return effectiveRangedAttack * (rangedAttackBonus + 64);
}
