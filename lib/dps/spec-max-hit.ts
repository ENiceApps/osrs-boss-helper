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
 */
export function specMaxHitDisplay(
  weaponItemId: number,
  maxHit: number,
): SpecMaxHitDisplay | null {
  const mod = specMaxHitMod(weaponItemId);
  if (!mod) return null;

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
