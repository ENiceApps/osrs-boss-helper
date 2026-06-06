export function magicMaxHit(baseSpellMaxHit: number, magicDamagePercent: number): number {
  return Math.floor(baseSpellMaxHit * (1 + magicDamagePercent / 100));
}

export function magicAttackRoll(
  effectiveMagicLevel: number,
  magicAttackBonus: number,
): number {
  return effectiveMagicLevel * (magicAttackBonus + 64);
}
