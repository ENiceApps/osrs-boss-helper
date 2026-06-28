// Ranged combat formulas (OSRS) — the same shape as the melee ones but driven by
// the ranged-strength / ranged-attack stats. Pure base formulas; multipliers
// (Dragon hunter crossbow, Salve, void, slayer helm) are applied in calculate.ts.

export function rangedMaxHit(effectiveRangedStrength: number, rangedStrengthBonus: number): number {
  return Math.floor(0.5 + (effectiveRangedStrength * (rangedStrengthBonus + 64)) / 640);
}

export function rangedAttackRoll(
  effectiveRangedAttack: number,
  rangedAttackBonus: number,
): number {
  return effectiveRangedAttack * (rangedAttackBonus + 64);
}
