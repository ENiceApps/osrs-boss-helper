// Which ammo each ranged weapon fires — the wiki DPS calc's own table.
// Mirrors weirdgloop/osrs-dps-calc Equipment.ts `ammoForRangedWeapons` +
// `ammoApplicability` (dumped to data/vendor/wgloop/ammo-applicability.json:
// weapon id -> the ammo ids it takes; an empty list = a weapon that uses no
// ammo-slot ammo, e.g. a blowpipe or crystal bow).
//
//   INCLUDED  the weapon fires this ammo: its ranged attack / strength count.
//   ALLOWED   the weapon uses no ammo (or isn't in the table): whatever sits in
//             the ammo slot is ignored — its ranged stats do NOT count.
//   INVALID   the weapon needs ammo and this isn't it (or the slot is empty):
//             upstream zeroes the attack roll and max hit on every style but a
//             manual cast (BaseCalc isAmmoInvalid) — a Twisted bow with no
//             arrows, bolts in a bow, a salamander without its tar.
//
// Both ids are canonicalised first (data/items/aliases.ts), as upstream does,
// so a Rune crossbow (or) or a recoloured bow uses its base item's row.

import ammoJson from "@/data/vendor/wgloop/ammo-applicability.json";
import { canonicalItemId } from "./aliases";

export type AmmoApplicability = "included" | "allowed" | "invalid";

const AMMO_BY_WEAPON: ReadonlyMap<number, ReadonlySet<number>> = new Map(
  Object.entries(ammoJson as Record<string, number[]>).map(([weapon, ammo]) => [Number(weapon), new Set(ammo)]),
);

export function ammoApplicability(
  weaponId: number | undefined,
  ammoId: number | undefined,
): AmmoApplicability {
  const valid = weaponId === undefined ? undefined : AMMO_BY_WEAPON.get(canonicalItemId(weaponId));
  if (!valid || valid.size === 0) return "allowed";
  if (ammoId !== undefined && valid.has(canonicalItemId(ammoId))) return "included";
  return "invalid";
}

/** True iff the weapon needs ammo-slot ammo to attack at all. */
export function weaponNeedsAmmo(weaponId: number | undefined): boolean {
  const valid = weaponId === undefined ? undefined : AMMO_BY_WEAPON.get(canonicalItemId(weaponId));
  return valid !== undefined && valid.size > 0;
}

/** Every ammo id the weapon fires (empty when it uses none). */
export function ammoIdsFor(weaponId: number | undefined): ReadonlySet<number> {
  return (weaponId === undefined ? undefined : AMMO_BY_WEAPON.get(canonicalItemId(weaponId))) ?? new Set();
}
