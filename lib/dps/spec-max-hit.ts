// Display-only helper: given the equipped weapon and the engine's max hit,
// derive the NORMAL-attack max hit and the SPECIAL-attack max hit for weapons
// whose spec changes the max. The DPS engine itself ignores spec attacks
// (see types/spec-weapons.ts), so this lives outside it and feeds the UI.
//
// Calibrated against weirdgloop's PlayerVsNPCCalc.ts spec block. Factors apply
// to the engine's `maxHit`, which is the weapon's NORMAL (un-capped) max — for
// every weapon except Osmumten's fang, where the engine's value is the fang's
// TRUE max (the fang's normal attack is capped to ~85%, see `uncapped`).

import { findSpecWeapon, specMaxHitMod } from "@/data/spec-weapons";
import type { DpsResult } from "@/types/osrs";
import { npcHitMax, npcHitMin, type NpcHitTransforms } from "./npc-transforms";

export interface SpecMaxHitDisplay {
  /** Spec's wiki name, e.g. "Eviscerate", "The Judgement". */
  specName: string;
  /** Max hit a NORMAL attack can deal (headline). */
  normalMaxHit: number;
  /** Max hit per spec hit; null when the spec max varies (see `varies`). */
  specMaxHit: number | null;
  /** Hits per spec activation. 1 for single-hit specs. */
  hits: number;
  /** Guaranteed minimum hit during the spec, when the spec defines one. */
  minHit?: number;
  /** Free-text when the spec max can't be a fixed number. */
  varies?: string;
}

/** Osmumten's fang trims a normal attack to true − trunc(true × 3/20) ≈ 85%. */
function fangNormalMax(trueMax: number): number {
  return trueMax - Math.trunc((trueMax * 3) / 20);
}

/**
 * Returns the normal/special max-hit breakdown for the equipped weapon, or null
 * when its special attack doesn't change the max hit (or it has no spec).
 *
 * @param weaponItemId equipped weapon's item id
 * @param maxHit       the engine's computed max hit for the active loadout
 * @param flatArmour   the engine's `DpsResult.flatArmour`, when the target's
 *                     flat armour shifted the hits. Every factor below works on
 *                     the pre-armour `rawMaxHit`; each derived max is then
 *                     shifted per hit (upstream shifts every accurate hitsplat
 *                     last, specs included), and the normal max is the engine's
 *                     already-shifted `maxHit`.
 */
export function specMaxHitDisplay(
  weaponItemId: number,
  maxHit: number,
  flatArmour?: DpsResult["flatArmour"],
  npcHit?: DpsResult["npcHitTransforms"],
): SpecMaxHitDisplay | null {
  const mod = specMaxHitMod(weaponItemId);
  if (!mod) return null;

  // NPC transforms reshape each spec hit as they do a normal one: Zulrah caps
  // it at 50 (over 50 rerolls into 45-50), the Kraken divides a ranged one by
  // 7 (minimum 1), and flat armour shifts it last. So derive the raw spec
  // from the max before them and put each hit through them, rather than
  // scaling the already-transformed max (Zulrah: trunc(50 × 5/4) = 62).
  if (flatArmour || npcHit) {
    const raw = specMaxHitDisplay(
      weaponItemId,
      npcHit ? npcHit.rawMaxHit : flatArmour!.rawMaxHit,
    );
    if (!raw) return null;
    const t: NpcHitTransforms = npcHit ?? {};
    const shift = (n: number): number => Math.max(0, n - (flatArmour?.armour ?? 0));
    // A spec that hits as magic (Voidwaker) skips flat armour.
    const armoured = mod.magicDamage ? (n: number) => n : shift;
    const top = (n: number): number => armoured(npcHitMax(n, t));
    // The floor of the rolls lo..hi once transformed: a roll over the cap can
    // land as low as the reroll's bottom.
    const floor = (lo: number, hi: number | null): number => {
      const low = npcHitMin(lo, t);
      const over = t.damageCap !== undefined && hi !== null && hi > t.damageCap.limit;
      return armoured(over ? Math.min(low, npcHitMin(hi, t)) : low);
    };
    return {
      ...raw,
      // The fang's normal max is derived (trimmed) here; every other weapon's
      // is the engine's own.
      normalMaxHit: mod.uncapped ? shift(npcHitMax(raw.normalMaxHit, t)) : maxHit,
      specMaxHit: raw.specMaxHit === null ? null : top(raw.specMaxHit),
      ...(raw.minHit !== undefined ? { minHit: floor(raw.minHit, raw.specMaxHit) } : {}),
    };
  }

  const specName = findSpecWeapon(weaponItemId)?.specName ?? "Special attack";
  const hits = mod.hits ?? 1;

  // Fang: the engine's maxHit is the true (un-capped) max = the spec max. The
  // normal attack is the capped value.
  if (mod.uncapped) {
    return { specName, normalMaxHit: fangNormalMax(maxHit), specMaxHit: maxHit, hits };
  }

  // Variable specs (prayer points, Magic level, …) — no fixed number.
  if (mod.varies) {
    return { specName, normalMaxHit: maxHit, specMaxHit: null, hits, varies: mod.varies };
  }

  if (mod.factor) {
    const [n, d] = mod.factor;
    const minHit =
      mod.minHit ??
      (mod.minFactor
        ? Math.trunc((maxHit * mod.minFactor[0]) / mod.minFactor[1])
        : undefined);
    return {
      specName,
      normalMaxHit: maxHit,
      specMaxHit: Math.trunc((maxHit * n) / d),
      hits,
      minHit,
    };
  }

  return null;
}
