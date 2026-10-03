// Per-monster, per-style damage scales that upstream applies as an NPC
// transform — the Kraken's. Mirrors weirdgloop/osrs-dps-calc
// PlayerVsNPCCalc.applyNpcTransforms (L1945-1948 @ 89c3e25):
//
//   if (['Kraken', 'Cave kraken'].includes(this.monster.name) && styleType === 'ranged') {
//     // https://twitter.com/JagexAsh/status/1699360516488011950
//     relevantEffects.push([divisionTransformer(7, 1)]);
//   }
//
// divisionTransformer(7, 1) is multiplyTransformer(1, 7, 1) (HitDist.ts
// L499-519): every hitsplat d becomes trunc(d/7), except that one of at least
// 1 never drops below 1 — and with the default transform options it reaches
// inaccurate hitsplats too (a miss of 0 stays 0; an opal bolt's bonus on a
// miss is divided as well). It runs after the Zulrah cap (the first NPC
// transform) and before the phase factors and flat armour.
//
// The OSRS Wiki (Kraken): "Magic is the only reliable way of damaging it, as
// Ranged deals 1/7th of its normal damage."
//
// Matched by NAME, like upstream, so both forms of each are covered: the
// Kraken (494) and its Whirlpool (496), the Cave kraken (492) and its
// Whirlpool (493). The Armoured / Pygmy / Spined / Vampyre / Veiled krakens
// are other names and take full ranged damage.

import type { CombatStyle } from "@/types/osrs";

/** A hitsplat d becomes trunc(d × n/d'), at least `minimum` if d was (upstream multiplyTransformer). */
export interface StyleDamageScale {
  factor: [number, number];
  minimum?: number;
}

export const RANGED_DIVIDED_BY_7_NAMES: ReadonlySet<string> = new Set(["Kraken", "Cave kraken"]);

/** Ranged vs the Kraken / Cave kraken: trunc(d/7), minimum 1. */
export const KRAKEN_RANGED_SCALE: StyleDamageScale = { factor: [1, 7], minimum: 1 };

/** The damage scale this style takes against the target, or undefined. */
export function styleDamageScaleFor(
  target: { name: string },
  style: CombatStyle,
): StyleDamageScale | undefined {
  return style === "ranged" && RANGED_DIVIDED_BY_7_NAMES.has(target.name)
    ? KRAKEN_RANGED_SCALE
    : undefined;
}
