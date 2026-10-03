// Per-monster damage caps — Zulrah's. Mirrors weirdgloop/osrs-dps-calc
// PlayerVsNPCCalc.applyNpcTransforms (L1937-1940 @ 89c3e25), its FIRST NPC
// transform:
//
//   if (this.monster.name === 'Zulrah') {
//     // https://twitter.com/JagexAsh/status/1745852774607183888
//     relevantEffects.push([cappedRerollTransformer(50, 5, 45)]);
//   }
//
// Every hitsplat over 50 is rerolled into 45-50, whatever the combat style.
// The OSRS Wiki (Zulrah, "Fight overview"): "Damage at Zulrah is capped at 50,
// with any hits greater than this amount dealing 45-50 damage instead." It is
// counted per hitsplat: the Crystal halberd's "double hitsplats get around the
// 50 damage cap" (Zulrah/Strategies, Equipment).
//
// Matched by NAME, like upstream, so all three forms (Serpentine 2042, Magma
// 2043, Tanzanite 2044) share it. lib/dps/damage-cap.ts holds the math.

import type { DamageCap } from "@/lib/dps/damage-cap";

export const ZULRAH_NAME = "Zulrah";

/** Zulrah: hits over 50 deal 45-50 (upstream cappedRerollTransformer(50, 5, 45)). */
export const ZULRAH_DAMAGE_CAP: DamageCap = { limit: 50, rerollMin: 45, rerollMax: 50 };

/** The target's damage cap, or undefined for the (nearly all) monsters without one. */
export function damageCapFor(target: { name: string }): DamageCap | undefined {
  return target.name === ZULRAH_NAME ? ZULRAH_DAMAGE_CAP : undefined;
}
