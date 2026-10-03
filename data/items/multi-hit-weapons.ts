// Weapon id → multi-hit HitProfile: every weapon wgloop builds as more than one
// hitsplat per attack. See lib/dps/multihit.ts — the "two independent halves"
// weapons (Sulphur blades, Torag's hammers, Glacial temotli, Earthbound
// tecpatl) have the same mean as one combined hit, but each half is its own
// roll: each gets wgloop's accurate-zero raise and its own flat-armour shift.
//
// Ids verified against data/vendor/wgloop/equipment.json.

import type { HitProfile } from "@/lib/dps/multihit";

// Scythe of Vitur — charged, uncharged, Holy, Sanguine. Same mechanic.
const SCYTHE_IDS = new Set([22325, 22486, 25736, 25739]);
// Dark bow — base + cosmetic/deadman variants.
const DARK_BOW_IDS = new Set([12766, 12765, 11235, 12768, 12767]);
const DUAL_MACUAHUITL = 28997;
const TONALZTICS_CHARGED = 28922;
const TONALZTICS_UNCHARGED = 28919;
// Two independent half hits (wgloop isWearingTwoHitWeapon): Torag's hammers
// (undamaged + 100/75/50/25/0 degradation), Sulphur blades, Glacial temotli,
// Earthbound tecpatl.
const TWO_HIT_WEAPON_IDS = new Set([4747, 4958, 4959, 4960, 4961, 4962, 29084, 29889, 30957]);

export interface HitProfileContext {
  /** NxN target size (catalog `size`). Drives the Scythe's hit count. */
  targetSize?: number;
}

/**
 * The hit profile for a weapon, or undefined when the weapon is single-hit.
 * The combined max hit is computed by the engine as usual; the profile only
 * redistributes it.
 */
export function hitProfileForWeapon(
  weaponId: number | undefined,
  ctx: HitProfileContext = {},
): HitProfile | undefined {
  if (weaponId === undefined) return undefined;

  if (SCYTHE_IDS.has(weaponId)) {
    // 1st 100%, 2nd 50%, 3rd 25% — each an independent accuracy roll, maxes
    // trunc(M/2) and trunc(M/4) as in wgloop. Hit count by target size:
    // 1x1 → 1, 2x2 → 2, ≥3x3 → 3.
    const size = ctx.targetSize ?? 1;
    if (size >= 3) return [{ maxFraction: 1 }, { maxFraction: 0.5 }, { maxFraction: 0.25 }];
    if (size === 2) return [{ maxFraction: 1 }, { maxFraction: 0.5 }];
    return undefined; // 1x1 → single hit, nothing to override
  }

  if (DARK_BOW_IDS.has(weaponId)) {
    // Two full, independent arrows. The ×1.5 damage / minimum-hit boost is
    // Descent of Darkness (special attack) only and is not modeled here.
    return [{ maxFraction: 1 }, { maxFraction: 1 }];
  }

  if (weaponId === DUAL_MACUAHUITL) {
    // Two halves, but the 2nd hit only lands if the 1st did (sequential
    // accuracy) — this makes it weaker than a single combined hit, the one
    // multi-hitter the engine would otherwise OVER-value.
    return [{ maxFraction: 0.5 }, { maxFraction: 0.5, requiresPrevious: true }];
  }

  if (weaponId === TONALZTICS_CHARGED) {
    // Charged: two independent hits, each 0–75% of max ranged hit (×1.5 overall).
    // The wiki states 75% explicitly only for the uncharged single hit; the
    // charged per-hit fraction follows the weirdgloop calc / community testing.
    return [{ maxFraction: 0.75 }, { maxFraction: 0.75 }];
  }
  if (weaponId === TONALZTICS_UNCHARGED) {
    // Uncharged: a single 0–75% hit (weaker than a normal full hit).
    return [{ maxFraction: 0.75 }];
  }

  // Two independent halves, trunc(M/2) and M − trunc(M/2) — the same mean as
  // one combined hit, but two rolls: each landed half gets its own raised 0
  // and its own flat-armour shift (Torag's hammers vs a Gargoyle: +2 per half).
  if (TWO_HIT_WEAPON_IDS.has(weaponId)) {
    return [{ maxFraction: 0.5 }, { maxFraction: 0.5 }];
  }

  return undefined;
}
