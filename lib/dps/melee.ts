export function meleeMaxHit(effectiveStrength: number, meleeStrengthBonus: number): number {
  return Math.floor(0.5 + (effectiveStrength * (meleeStrengthBonus + 64)) / 640);
}

export function meleeAttackRoll(
  effectiveAttack: number,
  attackBonusForStyle: number,
): number {
  return effectiveAttack * (attackBonusForStyle + 64);
}
