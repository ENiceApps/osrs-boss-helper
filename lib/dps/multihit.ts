// Multi-hit weapons — a single abstraction for every weapon that lands more
// than one hitsplat per attack (Scythe, Dual macuahuitl, Dark bow, Tonalztics,
// Sulphur blades, Torag's hammers, Glacial temotli, Earthbound tecpatl).
//
// A weapon is described by a HitProfile: an ordered list of hitsplats, each a
// fraction of the weapon's *combined* max hit. The combined max hit is what the
// normal engine already computes from the weapon's strength bonus — the profile
// just says how that potential is split across hitsplats.
//
// Two facts drive the math (and the surprising result that several of these
// weapons need NO correction):
//   1. A hitsplat that rolls 0..(f·M) uniformly has expected damage f·M/2 when
//      it lands. So a hit's mean contribution is reach · accuracy · (f·M)/2.
//   2. "reach" is the probability the hitsplat is even attempted. Independent
//      hits are always attempted (reach 1). A hit flagged requiresPrevious only
//      occurs if the preceding hitsplat landed, so its reach gains a factor of
//      `accuracy` per sequential gate.
//
// Consequences:
//   • Two independent halves [{0.5},{0.5}] → 2 · acc · (0.5M)/2 = acc·M/2,
//     EXACTLY a single combined hit. Sulphur/Torag/Temotli/Tecpatl are therefore
//     already valued correctly by the single-hit engine; the split only lowers
//     variance. They have no HitProfile entry for that reason — except vs a
//     target with flat armour, which shifts each landed half separately.
//   • Sequential halves (Dual macuahuitl) [{0.5},{0.5,req}] → (M/4)·acc·(1+acc),
//     i.e. ×(1+acc)/2 vs a single hit — the engine OVER-values it without this.
//   • Scythe (size-gated) and Dark bow (two FULL hits) exceed a single hit.

import { meanArmouredHit } from "./flat-armour";

export interface HitDescriptor {
  /** Fraction of the weapon's combined max hit this hitsplat can roll (0..1+). */
  maxFraction: number;
  /**
   * When true the hitsplat only lands if the immediately preceding hitsplat
   * landed (sequential accuracy gate, e.g. Dual macuahuitl). Independent hits
   * (the default) are always attempted.
   */
  requiresPrevious?: boolean;
}

export type HitProfile = readonly HitDescriptor[];

/**
 * True when the profile SPLITS one combined max hit across its hitsplats —
 * fractions summing to 1 (Dual macuahuitl, the two-halves weapons). The
 * engine's max hit for these is the whole attack's max, not one hitsplat's.
 */
export function isSplitProfile(profile: HitProfile): boolean {
  if (profile.length < 2) return false;
  const total = profile.reduce((sum, h) => sum + h.maxFraction, 0);
  return Math.abs(total - 1) < 1e-9;
}

/**
 * Each hitsplat's integer max hit as upstream rolls it: trunc(f·M), except
 * that a split profile's last hitsplat takes the remainder (upstream's
 * M − trunc(M/2)), so the halves add back up to M.
 */
export function hitsplatMaxima(profile: HitProfile, maxHit: number): number[] {
  const maxima = profile.map((h) => Math.trunc(h.maxFraction * maxHit));
  if (isSplitProfile(profile)) {
    const others = maxima.slice(0, -1).reduce((sum, m) => sum + m, 0);
    maxima[maxima.length - 1] = maxHit - others;
  }
  return maxima;
}

/**
 * Expected damage per attack for a multi-hit weapon, given the single-roll
 * accuracy and the combined max hit the engine already computed. Returns the
 * mean damage across one full attack (all hitsplats); divide by attack time for
 * DPS exactly as the single-hit path does.
 *
 * `flatArmour` (lib/dps/flat-armour.ts) shifts EACH landed hitsplat, so a
 * 3-hit Scythe vs a Gargoyle (−2) gains up to +6 per attack, not +2. The shift
 * is added on top of the unchanged f·M/2 mean as the difference it makes to a
 * hitsplat rolling 0..m, m its integer max (`hitsplatMaxima`). That is exactly
 * |armour| for negative armour; positive armour also clips low rolls at 0.
 */
export function expectedMultiHitDamage(
  profile: HitProfile,
  accuracy: number,
  maxHit: number,
  flatArmour = 0,
): number {
  const maxima = flatArmour !== 0 ? hitsplatMaxima(profile, maxHit) : [];
  let reach = 1;
  let expected = 0;
  profile.forEach((hit, i) => {
    if (hit.requiresPrevious) reach *= accuracy;
    expected += (reach * accuracy * (hit.maxFraction * maxHit)) / 2;
    if (flatArmour !== 0) {
      const m = maxima[i];
      expected += reach * accuracy * (meanArmouredHit(0, m, flatArmour) - m / 2);
    }
  });
  return expected;
}
