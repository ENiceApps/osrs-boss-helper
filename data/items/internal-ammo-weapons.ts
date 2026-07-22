// Weapons that load ammunition internally (i.e. NOT from the equipment ammo
// slot). Currently all blowpipes — they hold darts inside the weapon itself,
// so the ammo slot stays free for a blessing.
//
// Two item IDs exist per blowpipe family: the "Charged" variant (has scales +
// darts loaded, or just darts for the Hunter's Guild tier) and the "Empty"
// variant (no darts / scales). Both are listed so the optimizer can offer a
// blessing in the ammo slot regardless of which variant the player owns.
//
// `maxDartTier` uses the same tier ladder as AMMO_TYPES in
// data/ammo-compatibility.ts (rune/amethyst = 6, dragon = 7). The Hunter's
// Guild blowpipes are tier-capped in-game; the Toxic line takes any dart.
//
// Source: wgloop equipment.json vendor data; dart caps from the wiki item
// pages (Rosewood raised adamant → rune in the 2026-07-22 Summer Sweep-Up).

export type InternalAmmoClass = "dart";

export interface InternalAmmoSpec {
  class: InternalAmmoClass;
  /** Highest AMMO_TYPES tier this weapon can fire. */
  maxDartTier: number;
}

/** Map of blowpipe item ID → the ammo it loads internally and its tier cap. */
export const INTERNAL_AMMO_WEAPONS: ReadonlyMap<number, InternalAmmoSpec> =
  new Map<number, InternalAmmoSpec>([
    // Toxic blowpipe (Zulrah's scales + darts) — any dart up to dragon.
    [12926, { class: "dart", maxDartTier: 7 }], // Charged
    [12924, { class: "dart", maxDartTier: 7 }], // Empty

    // Blazing blowpipe (upgraded Toxic, Inferno reward)
    [28688, { class: "dart", maxDartTier: 7 }], // Charged
    [28687, { class: "dart", maxDartTier: 7 }], // Empty

    // Drygore blowpipe (Chambers of Fortitude)
    [30374, { class: "dart", maxDartTier: 7 }], // Charged
    [30373, { class: "dart", maxDartTier: 7 }], // Empty

    // Hunter's Guild blowpipe tiers (Varlamore) — standard darts, tier-capped.
    [31575, { class: "dart", maxDartTier: 4 }], // Camphor blowpipe (Charged) — up to mithril
    [31577, { class: "dart", maxDartTier: 4 }], // Camphor blowpipe (Empty)
    [31579, { class: "dart", maxDartTier: 5 }], // Ironwood blowpipe (Charged) — up to adamant
    [31581, { class: "dart", maxDartTier: 5 }], // Ironwood blowpipe (Empty)
    // Rosewood: adamant → rune in the Summer Sweep-Up (2026-07-22).
    [31583, { class: "dart", maxDartTier: 6 }], // Rosewood blowpipe (Charged) — up to rune
    [31585, { class: "dart", maxDartTier: 6 }], // Rosewood blowpipe (Empty)
  ]);
