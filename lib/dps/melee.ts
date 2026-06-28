// Melee combat formulas (OSRS). `meleeMaxHit` is the canonical
// floor(0.5 + eff.strength × (strBonus + 64) / 640); `meleeAttackRoll` is
// effectiveAttack × (attackBonus + 64). Pure base formulas — gear/prayer
// multipliers (Salve, Dragon hunter, etc.) are applied upstream in calculate.ts.

export function meleeMaxHit(effectiveStrength: number, meleeStrengthBonus: number): number {
  return Math.floor(0.5 + (effectiveStrength * (meleeStrengthBonus + 64)) / 640);
}

export function meleeAttackRoll(
  effectiveAttack: number,
  attackBonusForStyle: number,
): number {
  return effectiveAttack * (attackBonusForStyle + 64);
}
