// Multi-hit weapons — a single abstraction for every weapon that lands more
// than one hitsplat per attack (Scythe, Dual macuahuitl, Dark bow, Tonalztics,
// Sulphur blades, Torag's hammers, Glacial temotli, Earthbound tecpatl).
//
// A weapon is described by a HitProfile: an ordered list of hitsplats, each a
// fraction of the weapon's *combined* max hit. The combined max hit is what the
// normal engine already computes from the weapon's strength bonus — the profile
// just says how that potential is split across hitsplats. Each hitsplat rolls
// over 0..its own INTEGER max, built the way wgloop builds it
// (`hitsplatMaxima`): Scythe trunc(M/2^i), Tonalztics trunc(3M/4), and the
// halves of a split trunc(M/2) and M − trunc(M/2).
//
// Two facts drive the math:
//   1. A hitsplat that rolls 0..m uniformly has expected damage m/2 when it
//      lands. So a hit's mean contribution is reach · accuracy · m/2.
//   2. "reach" is the probability the hitsplat is even attempted. Independent
//      hits are always attempted (reach 1). A hit flagged requiresPrevious only
//      occurs if the preceding hitsplat landed, so its reach gains a factor of
//      `accuracy` per sequential gate.
//
// Consequences:
//   • Two independent halves [{0.5},{0.5}] → acc·(trunc(M/2) + M − trunc(M/2))/2
//     = acc·M/2, EXACTLY a single combined hit (Sulphur/Torag/Temotli/Tecpatl).
//     They still carry a profile: wgloop raises every landed 0 to 1 PER
//     HITSPLAT (landedFloorLift in ./common), and flat armour shifts each half.
//   • Sequential halves (Dual macuahuitl) [{0.5},{0.5,req}] → about
//     (M/4)·acc·(1+acc), i.e. ×(1+acc)/2 vs a single hit — the engine
//     OVER-values it without this.
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

/** One hitsplat of an attack: how likely it lands, and the max it rolls to. */
export interface HitsplatRoll {
  landChance: number;
  maxHit: number;
}

/**
 * The hitsplats of one attack, given the single-roll accuracy and the combined
 * max hit the engine already computed.
 */
export function hitsplatRolls(
  profile: HitProfile,
  accuracy: number,
  maxHit: number,
): HitsplatRoll[] {
  const maxima = hitsplatMaxima(profile, maxHit);
  let reach = 1;
  return profile.map((hit, i) => {
    if (hit.requiresPrevious) reach *= accuracy;
    return { landChance: reach * accuracy, maxHit: maxima[i] };
  });
}

/**
 * Expected damage per attack for a multi-hit weapon, given the single-roll
 * accuracy and the combined max hit the engine already computed. Returns the
 * mean damage across one full attack (all hitsplats); divide by attack time for
 * DPS exactly as the single-hit path does.
 *
 * `flatArmour` (lib/dps/flat-armour.ts) shifts EACH landed hitsplat, so a
 * 3-hit Scythe vs a Gargoyle (−2) gains up to +6 per attack, not +2: each
 * hitsplat's landed mean is meanArmouredHit over 0..its integer max — m/2 with
 * no armour, exactly |armour| more for negative armour, and positive armour
 * also clips low rolls at 0.
 */
export function expectedMultiHitDamage(
  profile: HitProfile,
  accuracy: number,
  maxHit: number,
  flatArmour = 0,
): number {
  let expected = 0;
  for (const splat of hitsplatRolls(profile, accuracy, maxHit)) {
    expected += splat.landChance * meanArmouredHit(0, splat.maxHit, flatArmour);
  }
  return expected;
}
