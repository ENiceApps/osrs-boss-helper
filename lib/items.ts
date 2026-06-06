// Server / build-script-only loader for the vendored weirdgloop dataset.
//
// IMPORTANT: do not import this file from anything in `app/` or `components/`.
// equipment.json is ~3 MB and would bloat the browser bundle. The intended
// consumers are scripts under `scripts/` (preset codegen) and, in future,
// server-side route handlers that compute totals for custom loadouts.

import equipmentJson from "@/data/vendor/wgloop/equipment.json" with { type: "json" };
import monstersJson from "@/data/vendor/wgloop/monsters.json" with { type: "json" };
import { STAT_OVERRIDES, type StatOverride } from "@/data/items/stat-overrides";
import type {
  VendorEquipmentItem,
  VendorMonster,
  VendorMonsterDefensive,
} from "@/types/vendor";

const EQUIPMENT: VendorEquipmentItem[] = equipmentJson as VendorEquipmentItem[];
const MONSTERS: VendorMonster[] = monstersJson as VendorMonster[];

/**
 * Translate a flat StatOverride into the nested vendor shape and merge.
 * Returns a shallow copy of `item` with patched nested bonus/offensive/
 * defensive objects when an override exists. Both `findItem` here AND
 * `scripts/build-item-catalog.ts` consume STAT_OVERRIDES so the slim
 * catalog and the curated-loadout codegen stay consistent.
 */
function applyStatOverride(item: VendorEquipmentItem): VendorEquipmentItem {
  const o: StatOverride | undefined = STAT_OVERRIDES[item.id];
  if (!o) return item;
  return {
    ...item,
    speed: o.speed ?? item.speed,
    bonuses: {
      str: o.str ?? item.bonuses.str,
      ranged_str: o.rangedStr ?? item.bonuses.ranged_str,
      magic_str: o.magicStr ?? item.bonuses.magic_str,
      prayer: o.prayer ?? item.bonuses.prayer,
    },
    offensive: {
      stab: o.attackStab ?? item.offensive.stab,
      slash: o.attackSlash ?? item.offensive.slash,
      crush: o.attackCrush ?? item.offensive.crush,
      magic: o.attackMagic ?? item.offensive.magic,
      ranged: o.attackRanged ?? item.offensive.ranged,
    },
    defensive: {
      stab: o.defStab ?? item.defensive.stab,
      slash: o.defSlash ?? item.defensive.slash,
      crush: o.defCrush ?? item.defensive.crush,
      magic: o.defMagic ?? item.defensive.magic,
      ranged: o.defRanged ?? item.defensive.ranged,
    },
  };
}

const EQUIPMENT_BY_ID = new Map<number, VendorEquipmentItem[]>();
for (const item of EQUIPMENT) {
  const list = EQUIPMENT_BY_ID.get(item.id) ?? [];
  list.push(item);
  EQUIPMENT_BY_ID.set(item.id, list);
}

/**
 * Look up an equipment item by id. If multiple variants share the id (rare,
 * but happens for charged/uncharged or quest-locked versions), pass `version`
 * to disambiguate. Throws if the id is unknown — totals must be exact, so a
 * miss is an authoring error, not a runtime fallback.
 */
export function findItem(id: number, version?: string): VendorEquipmentItem {
  const candidates = EQUIPMENT_BY_ID.get(id);
  if (!candidates || candidates.length === 0) {
    throw new Error(`Unknown equipment id ${id}. Refresh vendor data?`);
  }
  if (candidates.length === 1) return applyStatOverride(candidates[0]);
  if (version === undefined) {
    const versions = candidates.map((c) => `"${c.version}"`).join(", ");
    throw new Error(
      `Equipment id ${id} (${candidates[0].name}) has multiple versions: ${versions}. Pass a version.`,
    );
  }
  const match = candidates.find((c) => c.version === version);
  if (!match) {
    throw new Error(
      `Equipment id ${id} has no version "${version}". Available: ${candidates
        .map((c) => `"${c.version}"`)
        .join(", ")}`,
    );
  }
  return applyStatOverride(match);
}

export function findMonster(name: string, version?: string): VendorMonster {
  const candidates = MONSTERS.filter((m) => m.name === name);
  if (candidates.length === 0) throw new Error(`Unknown monster "${name}".`);
  if (candidates.length === 1) return candidates[0];
  if (version === undefined) {
    const versions = candidates.map((c) => `"${c.version}"`).join(", ");
    throw new Error(
      `Monster "${name}" has multiple versions: ${versions}. Pass a version.`,
    );
  }
  const match = candidates.find((c) => c.version === version);
  if (!match) {
    throw new Error(
      `Monster "${name}" has no version "${version}". Available: ${candidates
        .map((c) => `"${c.version}"`)
        .join(", ")}`,
    );
  }
  return match;
}

export type StanceAttackType = "stab" | "slash" | "crush" | "magic" | "ranged";

export interface LoadoutTotals {
  attackBonus: number;
  /** Melee strength (sum of bonuses.str) — only meaningful for melee. */
  strBonus: number;
  /** Ranged strength (sum of bonuses.ranged_str) — only meaningful for ranged. */
  rangedStrBonus: number;
  /**
   * Sum of bonuses.magic_str. Wgloop's calc treats this as tenths of a percent:
   * maxHit ≈ maxHit × (1 + magicStrSum/1000). Equivalently, divide by 10 to
   * get the conventional "magic damage %" (e.g. magic_str 50 ≡ +5%).
   */
  magicStrSum: number;
  prayerBonus: number;
  /** Weapon speed in ticks. 0 if no weapon in the loadout. */
  attackSpeedTicks: number;
}

export interface LoadoutSlotRef {
  itemId: number;
  /** Required when the id has multiple variants in the vendor data. */
  version?: string;
}

/**
 * Sum the equipment bonuses for a loadout, picking the offensive value that
 * matches the requested attack type (e.g. "ranged" for crossbow stances).
 */
export function sumLoadout(
  slots: LoadoutSlotRef[],
  attackType: StanceAttackType,
): LoadoutTotals {
  const totals: LoadoutTotals = {
    attackBonus: 0,
    strBonus: 0,
    rangedStrBonus: 0,
    magicStrSum: 0,
    prayerBonus: 0,
    attackSpeedTicks: 0,
  };
  for (const ref of slots) {
    const item = findItem(ref.itemId, ref.version);
    totals.attackBonus += item.offensive[attackType];
    totals.strBonus += item.bonuses.str;
    totals.rangedStrBonus += item.bonuses.ranged_str;
    totals.magicStrSum += item.bonuses.magic_str;
    totals.prayerBonus += item.bonuses.prayer;
    if (item.slot === "weapon" && item.speed > 0) {
      totals.attackSpeedTicks = item.speed;
    }
  }
  return totals;
}

/** Pick the wiki ranged-defence bucket that matches a weapon category. */
export function rangedDefenceBucketFor(weaponCategory: string): keyof Pick<
  VendorMonsterDefensive,
  "heavy" | "standard" | "light"
> {
  switch (weaponCategory) {
    case "Crossbow":
    case "Two-handed crossbow":
      return "heavy";
    case "Thrown":
    case "Blowpipe":
      return "light";
    default:
      // Bows, javelins, chinchompas, etc. all use standard.
      return "standard";
  }
}
