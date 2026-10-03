// Magic combat formulas (OSRS). `magicMaxHit` applies the worn magic-damage %
// bonus to a spell's base max hit; `magicAttackRoll` is the standard
// effectiveLevel × (bonus + 64) attack roll. These are the pure base formulas —
// multipliers (elemental tomes, Tumeken's shadow, target weakness) are layered
// on top in calculate.ts.

export function magicMaxHit(baseSpellMaxHit: number, magicDamagePercent: number): number {
  // wgloop's trackAddFactor on the bonus in tenths of a percent:
  // base + trunc(base × tenths / 1000). Integer math, so a float product like
  // 20 × 1.15 = 22.999… can't floor a whole max hit away.
  const tenths = Math.round(magicDamagePercent * 10);
  return baseSpellMaxHit + Math.trunc((baseSpellMaxHit * tenths) / 1000);
}

export function magicAttackRoll(
  effectiveMagicLevel: number,
  magicAttackBonus: number,
): number {
  return effectiveMagicLevel * (magicAttackBonus + 64);
}
