// Types matching the JSON schema published by weirdgloop/osrs-dps-calc:
//   https://github.com/weirdgloop/osrs-dps-calc/tree/main/cdn/json
// These mirror the upstream structure exactly. Do not extend them with
// app-specific fields — keep this file as a faithful description of vendor
// data so a refresh script can swap the JSON without touching anything else.

export interface VendorItemBonuses {
  str: number;
  ranged_str: number;
  /** Magic damage % * 10 (e.g. 50 = +5%). */
  magic_str: number;
  prayer: number;
}

export interface VendorItemOffensive {
  stab: number;
  slash: number;
  crush: number;
  magic: number;
  ranged: number;
}

export interface VendorItemDefensive {
  stab: number;
  slash: number;
  crush: number;
  magic: number;
  ranged: number;
}

export type VendorSlot =
  | "head"
  | "cape"
  | "neck"
  | "ammo"
  | "weapon"
  | "body"
  | "shield"
  | "legs"
  | "hands"
  | "feet"
  | "ring"
  | "2h";

export interface VendorEquipmentItem {
  id: number;
  name: string;
  /** Variant key when the same name has multiple versions (e.g. "Charged"). */
  version: string;
  slot: VendorSlot;
  weight: number;
  image: string;
  /** Attack speed in ticks. 0 for non-weapons. */
  speed: number;
  /** Weapon category (e.g. "Crossbow", "Slash sword"). Empty for non-weapons. */
  category: string;
  bonuses: VendorItemBonuses;
  offensive: VendorItemOffensive;
  defensive: VendorItemDefensive;
  isTwoHanded: boolean;
}

export interface VendorMonsterSkills {
  atk: number;
  def: number;
  hp: number;
  magic: number;
  ranged: number;
  str: number;
}

export interface VendorMonsterOffensive {
  atk: number;
  magic: number;
  magic_str: number;
  ranged: number;
  ranged_str: number;
  str: number;
}

/**
 * Defensive stats. The 2024 ranged-defence rework split the old single
 * "ranged" value into three buckets based on the bolt/dart/arrow type:
 *  - heavy:    crossbow bolts (Dragon hunter crossbow uses this)
 *  - standard: bows (shortbows, longbows, Twisted bow, etc.)
 *  - light:    blowpipe darts, throwing knives, etc.
 * Vorkath has them all set to the same value (26) but most newer monsters
 * differentiate.
 */
export interface VendorMonsterDefensive {
  flat_armour: number;
  crush: number;
  magic: number;
  heavy: number;
  standard: number;
  light: number;
  slash: number;
  stab: number;
}

export interface VendorMonster {
  id: number;
  name: string;
  /** Variant key when the same name has multiple versions (e.g. "Post-quest"). */
  version: string;
  image: string;
  /** Combat level. */
  level: number;
  /** Attack speed in ticks. */
  speed: number;
  style: string[];
  size: number;
  max_hit: string;
  skills: VendorMonsterSkills;
  offensive: VendorMonsterOffensive;
  defensive: VendorMonsterDefensive;
  /** Categorisation strings used to gate special bonuses (e.g. "dragon", "undead", "fiery"). */
  attributes: string[];
  immunities: { burn: string | null };
  is_slayer_monster: boolean;
  weakness: { element: string; severity: number } | null;
}
