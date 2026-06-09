// Weapons that load ammunition internally (i.e. NOT from the equipment ammo
// slot). Currently all blowpipes — they hold darts inside the weapon itself,
// so the ammo slot stays free for a blessing.
//
// Two item IDs exist per blowpipe family: the "Charged" variant (has scales +
// darts loaded, or just darts for the Hunter's Guild tier) and the "Empty"
// variant (no darts / scales). Both are listed so the optimizer can offer a
// blessing in the ammo slot regardless of which variant the player owns.
//
// Source: wgloop equipment.json vendor data.

export type InternalAmmoClass = "dart";

/** Map of blowpipe item ID → the ammo class it uses internally. */
export const INTERNAL_AMMO_WEAPONS: ReadonlyMap<number, InternalAmmoClass> =
  new Map<number, InternalAmmoClass>([
    // Toxic blowpipe (Zulrah's scales + darts)
    [12926, "dart"], // Charged
    [12924, "dart"], // Empty

    // Blazing blowpipe (upgraded Toxic, Inferno reward)
    [28688, "dart"], // Charged
    [28687, "dart"], // Empty

    // Drygore blowpipe (Chambers of Fortitude)
    [30374, "dart"], // Charged
    [30373, "dart"], // Empty

    // Hunter's Guild blowpipe tiers (Varlamore) — all use standard darts
    [31575, "dart"], // Camphor blowpipe (Charged)
    [31577, "dart"], // Camphor blowpipe (Empty)
    [31579, "dart"], // Ironwood blowpipe (Charged)
    [31581, "dart"], // Ironwood blowpipe (Empty)
    [31583, "dart"], // Rosewood blowpipe (Charged)
    [31585, "dart"], // Rosewood blowpipe (Empty)
  ]);
