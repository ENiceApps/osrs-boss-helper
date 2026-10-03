// NPC flat armour — wgloop's last NPC-side transform (applyNpcTransforms):
//
//   flatAddTransformer(-monster.defensive.flat_armour), { transformInaccurate: false }
//
// Every ACCURATE melee/ranged hitsplat d becomes max(0, d − armour); misses
// and magic are untouched. Negative armour adds damage (Gargoyle −2 → +2 per
// landed hitsplat), positive armour subtracts it, floored at 0 (Heavy
// skeleton +1 turns an accurate 1 into a 0). The shift lands after every
// other transform, so it also applies to each hitsplat of a multi-hit weapon
// and to bolt-proc hits — see the callers in calculate.ts, bolts.ts and
// multihit.ts. These helpers are the closed forms the mean model needs.

/**
 * Σ_{d=lo}^{hi} max(0, scale·d − armour) for integers 0 ≤ lo ≤ hi and an
 * integer scale ≥ 1 (Keris's ×3 proc). Only d > armour/scale contribute, so
 * the sum starts at d0 = max(lo, ⌊armour/scale⌋ + 1) and is the arithmetic
 * series scale·(d0 + hi)·n/2 − armour·n over n = hi − d0 + 1 terms. Negative
 * armour gives d0 = lo: every term gains |armour|.
 */
export function sumArmouredHits(lo: number, hi: number, armour: number, scale = 1): number {
  if (hi < lo) return 0;
  const d0 = Math.max(lo, Math.floor(armour / scale) + 1);
  if (d0 > hi) return 0;
  const n = hi - d0 + 1;
  return (scale * (d0 + hi) * n) / 2 - armour * n;
}

/**
 * Mean damage of one ACCURATE hitsplat that rolls uniformly over lo..hi and
 * then takes the flat armour shift. Armour 0 gives the plain (lo + hi) / 2;
 * negative armour b adds exactly |b|; positive armour clips low rolls to 0,
 * e.g. 0..39 vs armour 1 → 38·39 / (2·40) = 18.525.
 */
export function meanArmouredHit(lo: number, hi: number, armour: number, scale = 1): number {
  if (hi < lo) return 0;
  return sumArmouredHits(lo, hi, armour, scale) / (hi - lo + 1);
}

/** One landed hitsplat of fixed damage d after flat armour. */
export function armouredHit(damage: number, armour: number): number {
  return Math.max(0, damage - armour);
}
