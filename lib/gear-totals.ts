// One place that sums worn gear into the totals the DPS engine reads, shared by
// the optimizer (scoreScenario) and the manual gear editor (applyOverrides) so
// the two can't drift. Mirrors weirdgloop/osrs-dps-calc Equipment.ts
// calculateEquipmentBonusesFromGear:
//
//   • every piece is read as its CANONICAL item (data/items/aliases.ts): a
//     locked / ornamented / recoloured / degraded variant has the base item's
//     stats, as upstream's getCanonicalEquipment swaps them before summing;
//   • the ammo slot's ranged attack and ranged strength count only when the
//     weapon actually fires that ammo (ammoApplicability "included") — arrows
//     under a blowpipe, thrown weapon or crystal bow add nothing;
//   • Dizana's quiver (charged / blessed / max cape): +10 ranged attack and +1
//     ranged strength, only on a bow or crossbow firing quiver ammo (not a
//     ballista or the Eclipse atlatl);
//   • Dinh's bulwark strength comes from the summed defences.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { canonicalItemId } from "@/data/items/aliases";
import { ammoApplicability, type AmmoApplicability } from "@/data/items/ammo-applicability";
import { bulwarkDefence, bulwarkStrengthBonus } from "@/data/items/special-strength";
import type { WeaponAttackType } from "@/types/osrs";

const ITEM_BY_ID = new Map<number, ItemCatalogEntry>(ITEM_CATALOG.map((it) => [it.id, it]));

// Cape variants that grant the Dizana passive: Blessed Dizana's quiver,
// Dizana's max cape (every version) and the Charged Dizana's quiver. The
// uncharged quiver does not.
export const DIZANA_PASSIVE_CAPE_IDS: ReadonlySet<number> = new Set([
  28828, 28957, 28955, // Blessed Dizana's quiver (Broken / Locked / Normal)
  28830, 28906, 28902, // Dizana's max cape (Broken / Locked / Normal)
  28951, 28953, // Dizana's quiver (Charged / Charged + Locked)
]);

/** Weapons in the Bow / Crossbow categories whose ammo does not go in the quiver. */
const NOT_QUIVER_WEAPONS: ReadonlySet<string> = new Set(["Heavy ballista", "Light ballista", "Eclipse atlatl"]);

/** The catalog entry upstream reads this item as (itself when it has no alias). */
export function canonicalItem(item: ItemCatalogEntry): ItemCatalogEntry {
  const id = canonicalItemId(item.id);
  return id === item.id ? item : (ITEM_BY_ID.get(id) ?? item);
}

/** The catalog entry upstream reads this item id as. */
export function canonicalItemById(itemId: number): ItemCatalogEntry | undefined {
  return ITEM_BY_ID.get(canonicalItemId(itemId)) ?? ITEM_BY_ID.get(itemId);
}

/** The canonical item's name (the given name when the catalog lacks the id). */
export function canonicalNameOf(itemId: number, fallback: string): string {
  // Only an ALIAS takes its canonical item's name; otherwise the slot's own
  // name stands (hand-built sets may carry ids the catalog reads differently).
  const canonical = canonicalItemId(itemId);
  if (canonical === itemId) return fallback;
  return ITEM_BY_ID.get(canonical)?.name ?? fallback;
}

export interface GearTotals {
  /** Offensive bonus for the attack type (Dizana's +10 included). */
  attackBonus: number;
  /** Melee strength (Dinh's bulwark bonus included). */
  melStr: number;
  /** Ranged strength (fired ammo, Dizana's +1; NOT a blowpipe's dart). */
  rngStr: number;
  /** Magic damage, in tenths of a percent as the catalog stores it. */
  magStr: number;
  prayerBonus: number;
  /** The weapon's speed in ticks (0 when it records none). */
  attackSpeedTicks: number;
  /** Whether the weapon fires what is in the ammo slot. */
  ammo: AmmoApplicability;
  /** Every offensive bonus, for rules that compare them (Araxytes, the Hueycoatl's tail). */
  offensive: { stab: number; slash: number; crush: number; magic: number; ranged: number };
}

/** Sum the worn items (one per slot; `slot` is the loadout slot, "weapon" for a 2h). */
export function sumGear(
  worn: readonly { slot: string; item: ItemCatalogEntry }[],
  attackType: WeaponAttackType,
): GearTotals {
  const weaponRaw = worn.find((w) => w.slot === "weapon")?.item;
  const weapon = weaponRaw ? canonicalItem(weaponRaw) : undefined;
  const ammoRaw = worn.find((w) => w.slot === "ammo")?.item;
  const cape = worn.find((w) => w.slot === "cape")?.item;
  const ammo = ammoApplicability(weapon?.id, ammoRaw?.id);

  const offensive = { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 };
  let melStr = 0;
  let rngStr = 0;
  let magStr = 0;
  let prayerBonus = 0;
  let defenceSum = 0;
  for (const w of worn) {
    const item = canonicalItem(w.item);
    const countRanged = w.slot !== "ammo" || ammo === "included";
    offensive.stab += item.attackStab;
    offensive.slash += item.attackSlash;
    offensive.crush += item.attackCrush;
    offensive.magic += item.attackMagic;
    if (countRanged) offensive.ranged += item.attackRanged;
    melStr += item.str;
    if (countRanged) rngStr += item.rangedStr;
    magStr += item.magicStr;
    prayerBonus += item.prayer;
    defenceSum += bulwarkDefence(item);
  }
  melStr += bulwarkStrengthBonus(weapon?.id, defenceSum);

  const firesQuiverAmmo =
    weapon !== undefined &&
    (weapon.category === "Bow" || weapon.category === "Crossbow") &&
    !NOT_QUIVER_WEAPONS.has(weapon.name);
  if (cape && DIZANA_PASSIVE_CAPE_IDS.has(cape.id) && firesQuiverAmmo && ammo === "included") {
    offensive.ranged += 10;
    rngStr += 1;
  }

  return {
    attackBonus: offensive[attackType],
    melStr,
    rngStr,
    magStr,
    prayerBonus,
    attackSpeedTicks: weapon && weapon.speed > 0 ? weapon.speed : 0,
    ammo,
    offensive,
  };
}
