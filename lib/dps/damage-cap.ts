// An NPC damage cap that rerolls big hits — Zulrah's (data/monsters/damage-cap.ts).
//
// Upstream's cappedRerollTransformer(limit, rollMax, offset) (HitDist.ts
// L481-497 @ 89c3e25) leaves a hitsplat of at most `limit` alone and replaces
// a bigger one with a uniform roll over offset..offset + rollMax. Zulrah's is
// cappedRerollTransformer(50, 5, 45): every hitsplat over 50 deals 45-50.
// It is one of upstream's NPC transforms (applyNpcTransforms), so it runs on
// each hitsplat after the attacker side is done — the accurate-zero raise, the
// Corp halving, ruby bolts, a Mad Angel floor — and before the per-phase
// damage factors and flat armour.

export interface DamageCap {
  /** A hitsplat of at most this much is left alone. */
  limit: number;
  /** A bigger one is rerolled uniformly over rerollMin..rerollMax. */
  rerollMin: number;
  rerollMax: number;
}

/**
 * Mean of `after` applied to one hitsplat of `damage` once the cap has had its
 * way: `after(damage)` when the hit is within the limit, else the average of
 * `after` over the reroll range. `after` is whatever upstream does to the
 * hitsplat next (phase damage factors, flat armour); identity by default.
 */
export function cappedHitsplat(
  damage: number,
  cap: DamageCap | undefined,
  after: (hitsplat: number) => number = (h) => h,
): number {
  if (!cap || damage <= cap.limit) return after(damage);
  let sum = 0;
  for (let r = cap.rerollMin; r <= cap.rerollMax; r++) sum += after(r);
  return sum / (cap.rerollMax - cap.rerollMin + 1);
}

/**
 * The most a hitsplat that rolls 0..`maxHit` can deal after the cap — what
 * upstream's getMax() reads off the transformed distribution: `maxHit` within
 * the limit, else the larger of the limit (rolled exactly) and the reroll's top.
 * Zulrah: min(maxHit, 50).
 */
export function cappedMaxHit(maxHit: number, cap: DamageCap | undefined): number {
  if (!cap || maxHit <= cap.limit) return maxHit;
  return Math.max(cap.limit, cap.rerollMax);
}
