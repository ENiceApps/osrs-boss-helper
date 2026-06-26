// Hybrid armor sets — armor whose pieces give a set bonus to MULTIPLE combat
// styles by sharing most slots and switching only one (the helm). These need a
// force-include "seed" in the hybrid optimizer (lib/optimize/hybrid.ts) for the
// same reason the single-style optimizer force-includes Void: when the bank ALSO
// holds stronger single-style gear (Masori, Ancestral, …), the hybrid set is no
// style's independent best, so the optimizer's per-style-best seeds never try it —
// even though, at a tight switch budget, sharing the set + one helm switch can beat
// wearing one style's gear for everything.
//
// A set that IS a style's independent best (e.g. a Void-only bank) is already
// discovered generically and needs no entry here.
//
// Each entry lists the pieces shared across styles + the per-style switch piece.
// The optimizer seeds the shared base with the shared pieces (helm slot left open)
// and lets its switch-allocation add the matching per-style helm. Mirrors the
// existing data/armor-sets.ts piece IDs.

import type { CombatStyle } from "@/types/osrs";
import type { LoadoutSlotKey } from "@/types/loadout";

export interface HybridSet {
  id: string;
  name: string;
  styles: readonly CombatStyle[];
  /** Pieces worn by every style — any one id per slot satisfies the slot. */
  sharedPieces: readonly { slot: LoadoutSlotKey; itemIds: readonly number[] }[];
  /** The per-style switch piece (the helm) that completes each style's set bonus. */
  switchPieces: Partial<Record<CombatStyle, { slot: LoadoutSlotKey; itemId: number }>>;
}

// Void piece IDs — verified against data/armor-sets.ts / ITEM_CATALOG.
export const HYBRID_SETS: readonly HybridSet[] = [
  {
    id: "void",
    name: "Void Knight",
    styles: ["melee", "ranged", "magic"],
    sharedPieces: [
      { slot: "body", itemIds: [8839, 13072] }, // Void knight top (regular / elite)
      { slot: "legs", itemIds: [8840, 13073] }, // Void knight robe (regular / elite)
      { slot: "hands", itemIds: [8842] },        // Void knight gloves
    ],
    switchPieces: {
      melee: { slot: "head", itemId: 11665 },  // Void melee helm
      ranged: { slot: "head", itemId: 11664 }, // Void ranger helm
      magic: { slot: "head", itemId: 11663 },  // Void mage helm
    },
  },
  // Future: the proposed Fractured Archive melee/magic hybrid set, once released.
];

/** A hybrid set resolved against a bank: which shared piece id sits in each slot,
 *  and which helm each covered style switches to. */
export interface ResolvedHybridSet {
  id: string;
  name: string;
  /** Shared armor: the owned item id for each shared slot. */
  shared: Map<LoadoutSlotKey, number>;
  /** Per-style switch piece (helm) for the styles this set covers in the bank. */
  switchByStyle: Map<CombatStyle, { slot: LoadoutSlotKey; itemId: number }>;
}

/**
 * Every hybrid set whose shared pieces are all in the bank AND which covers ≥2 of
 * the requested styles (with their helms owned). The optimizer turns each into a
 * candidate by re-gearing the per-style anchors to the set's pieces, then scoring
 * it against the generic build and keeping whichever blends to more DPS.
 */
export function availableHybridSets(
  bankIds: ReadonlySet<number>,
  styles: readonly CombatStyle[],
): ResolvedHybridSet[] {
  const out: ResolvedHybridSet[] = [];
  for (const set of HYBRID_SETS) {
    const shared = new Map<LoadoutSlotKey, number>();
    let haveAllShared = true;
    for (const p of set.sharedPieces) {
      const owned = p.itemIds.find((id) => bankIds.has(id));
      if (owned === undefined) { haveAllShared = false; break; }
      shared.set(p.slot, owned);
    }
    if (!haveAllShared) continue;

    const switchByStyle = new Map<CombatStyle, { slot: LoadoutSlotKey; itemId: number }>();
    for (const s of styles) {
      const sw = set.switchPieces[s];
      if (sw && bankIds.has(sw.itemId)) switchByStyle.set(s, sw);
    }
    if (switchByStyle.size < 2) continue;
    out.push({ id: set.id, name: set.name, shared, switchByStyle });
  }
  return out;
}
