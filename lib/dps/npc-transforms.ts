// Upstream's per-monster NPC transforms that this engine models besides the
// phase factors and flat armour, composed in upstream's order
// (PlayerVsNPCCalc.applyNpcTransforms @ 89c3e25): Zulrah's damage cap first
// (L1937-1940, lib/dps/damage-cap.ts), then a per-style damage scale — the
// Kraken / Cave kraken's ranged ÷7, minimum 1 (L1945-1948,
// data/monsters/style-damage-scale.ts). The phase factor and flat armour come
// after both (calculate.ts).

import type { StyleDamageScale } from "@/data/monsters/style-damage-scale";
import { scaleHitsplat } from "./common";
import { cappedHitsplat, cappedMaxHit, type DamageCap } from "./damage-cap";

export interface NpcHitTransforms {
  damageCap?: DamageCap;
  styleScale?: StyleDamageScale;
}

/** True when either transform is in play. */
export function hasNpcHitTransforms(t: NpcHitTransforms): boolean {
  return t.damageCap !== undefined || t.styleScale !== undefined;
}

/** One hitsplat through the style scale alone (deterministic). */
export function styleScaledHit(h: number, scale: StyleDamageScale | undefined): number {
  return scale ? scaleHitsplat(h, scale.factor, scale.minimum ?? 0) : h;
}

/**
 * Mean of `after` over what one hitsplat of `h` becomes: the cap (a reroll,
 * hence a mean), then the style scale, then `after` (the phase factor, flat
 * armour).
 */
export function npcHitMean(
  h: number,
  t: NpcHitTransforms,
  after: (hitsplat: number) => number = (x) => x,
): number {
  return cappedHitsplat(h, t.damageCap, (c) => after(styleScaledHit(c, t.styleScale)));
}

/** The most a hitsplat rolling up to `h` deals after both (both are monotone). */
export function npcHitMax(h: number, t: NpcHitTransforms): number {
  return styleScaledHit(cappedMaxHit(h, t.damageCap), t.styleScale);
}

/**
 * The least a hitsplat of exactly `h` deals after both — a spec's guaranteed
 * minimum: over the cap it is rerolled, so its floor is the reroll's bottom.
 */
export function npcHitMin(h: number, t: NpcHitTransforms): number {
  const capped = t.damageCap && h > t.damageCap.limit ? t.damageCap.rerollMin : h;
  return styleScaledHit(capped, t.styleScale);
}
