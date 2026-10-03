// Weapon id → multi-hit HitProfile. Only weapons whose profile actually differs
// from a single combined hit appear here; see lib/dps/multihit.ts for why the
// "two independent halves" weapons (Sulphur blades, Torag's hammers, Glacial
// temotli, Earthbound tecpatl) are absent by default — their split is
// mean-neutral, so the single-hit engine already prices them correctly. The
// exception is a target with flat armour, which shifts EACH hitsplat: there
// they get their two-halves profile (see `targetFlatArmour`).
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
  /**
   * Target's flat armour (catalog `defenceBonuses.flatArmour`). Non-zero turns
   * on the two-halves profile of the mean-neutral two-hit weapons, since the
   * armour shift lands on each half.
   */
  targetFlatArmour?: number;
}

/**
 * The hit profile for a weapon, or undefined when the weapon is single-hit (or
 * a mean-neutral multi-hitter that needs no correction). The combined max hit
 * is computed by the engine as usual; the profile only redistributes it.
 */
export function hitProfileForWeapon(
  weaponId: number | undefined,
  ctx: HitProfileContext = {},
): HitProfile | undefined {
  if (weaponId === undefined) return undefined;

  if (SCYTHE_IDS.has(weaponId)) {
    // 1st 100%, 2nd 50%, 3rd 25% — each an independent accuracy roll. Hit count
    // by target size: 1x1 → 1, 2x2 → 2, ≥3x3 → 3. (Ignores the ±1 even/÷4
    // rounding bonus on the lesser hits — sub-1-damage, immaterial to mean DPS.)
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

  // Two independent halves — the same mean as one combined hit, so they need
  // no profile, except vs flat armour, which shifts each landed half (Torag's
  // hammers vs a Gargoyle: +2 per half, up to +4 per attack).
  if (TWO_HIT_WEAPON_IDS.has(weaponId) && (ctx.targetFlatArmour ?? 0) !== 0) {
    return [{ maxFraction: 0.5 }, { maxFraction: 0.5 }];
  }

  return undefined;
}
