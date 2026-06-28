// Magic combat formulas (OSRS). `magicMaxHit` applies the worn magic-damage %
// bonus to a spell's base max hit; `magicAttackRoll` is the standard
// effectiveLevel × (bonus + 64) attack roll. These are the pure base formulas —
// multipliers (elemental tomes, Tumeken's shadow, target weakness) are layered
// on top in calculate.ts.

export function magicMaxHit(baseSpellMaxHit: number, magicDamagePercent: number): number {
  return Math.floor(baseSpellMaxHit * (1 + magicDamagePercent / 100));
}

export function magicAttackRoll(
  effectiveMagicLevel: number,
  magicAttackBonus: number,
): number {
  return effectiveMagicLevel * (magicAttackBonus + 64);
}
