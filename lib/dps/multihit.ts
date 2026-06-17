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
//     variance. They have no HitProfile entry for that reason.
//   • Sequential halves (Dual macuahuitl) [{0.5},{0.5,req}] → (M/4)·acc·(1+acc),
//     i.e. ×(1+acc)/2 vs a single hit — the engine OVER-values it without this.
//   • Scythe (size-gated) and Dark bow (two FULL hits) exceed a single hit.

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
 * Expected damage per attack for a multi-hit weapon, given the single-roll
 * accuracy and the combined max hit the engine already computed. Returns the
 * mean damage across one full attack (all hitsplats); divide by attack time for
 * DPS exactly as the single-hit path does.
 */
export function expectedMultiHitDamage(
  profile: HitProfile,
  accuracy: number,
  maxHit: number,
): number {
  let reach = 1;
  let expected = 0;
  for (const hit of profile) {
    if (hit.requiresPrevious) reach *= accuracy;
    expected += (reach * accuracy * (hit.maxFraction * maxHit)) / 2;
  }
  return expected;
}
