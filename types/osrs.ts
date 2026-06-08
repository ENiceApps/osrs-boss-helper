// Core OSRS domain types.
// All combat-related types model the formulas documented at
// https://oldschool.runescape.wiki/w/Damage_per_second

export type ItemId = number & { readonly __brand: "ItemId" };
export const asItemId = (n: number) => n as ItemId;

export type CombatStyle = "melee" | "ranged" | "magic";

export type WeaponAttackType =
  | "stab"
  | "slash"
  | "crush"
  | "ranged"
  | "magic";

export type AttackStyleChoice =
  | "accurate"
  | "aggressive"
  | "defensive"
  | "controlled"
  | "rapid"
  | "longrange";

export interface AttackBonuses {
  stab: number;
  slash: number;
  crush: number;
  magic: number;
  ranged: number;
}

export interface StrengthBonuses {
  melee: number;
  ranged: number;
  magicDamage: number;
}

export interface DefenceBonuses {
  stab: number;
  slash: number;
  crush: number;
  magic: number;
  ranged: number;
}

export interface OtherBonuses {
  prayer: number;
}

export interface ItemBonuses {
  attack: AttackBonuses;
  strength: StrengthBonuses;
  defence: DefenceBonuses;
  other: OtherBonuses;
}

export interface WeaponInfo {
  attackSpeedTicks: number;
  attackType: WeaponAttackType;
  twoHanded: boolean;
}

export type Slot =
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
  | "ring";

export interface GearPiece {
  itemId: ItemId;
  name: string;
  slot: Slot;
  bonuses: ItemBonuses;
  weapon?: WeaponInfo;
}

export type Loadout = Partial<Record<Slot, GearPiece>>;

export interface Skills {
  attack: number;
  strength: number;
  defence: number;
  ranged: number;
  magic: number;
  hitpoints: number;
  prayer: number;
}

export interface Player {
  username: string;
  skills: Skills;
  combatLevel: number;
}

export interface MappingEntry {
  id: number;
  name: string;
  examine?: string;
  members: boolean;
  lowalch?: number;
  highalch?: number;
  limit?: number;
  value?: number;
  icon: string;
}

export interface LatestPriceEntry {
  high: number | null;
  highTime: number | null;
  low: number | null;
  lowTime: number | null;
}

export interface DpsInput {
  style: CombatStyle;
  loadout: Loadout;
  skills: Skills;
  attackStyle: AttackStyleChoice;
  prayers: PrayerSelection;
  attackSpeedTicks: number;
  targetDefenceLevel: number;
  targetDefenceBonusForStyle: number;
  conditionalBonuses?: ConditionalBonusFlags;
  baseSpellMaxHit?: number;
  /** Spell element for magic scenarios — gates Tome of Fire and target weakness bonuses. */
  spellElement?: SpellElement;
  /** Monster's elemental weakness, if any. severity is percentage points (40 = +40%). */
  targetWeakness?: MonsterWeakness;
  /** True when Tome of Fire is in the loadout (we model the +50% on fire spells separately from magic_str). */
  tomeOfFireEquipped?: boolean;
}

export interface PrayerSelection {
  attackMultiplier: number;
  strengthMultiplier: number;
  rangedAttackMultiplier: number;
  rangedStrengthMultiplier: number;
  magicAttackMultiplier: number;
  magicDamageMultiplier: number;
  defenceMultiplier: number;
}

export interface ConditionalBonusFlags {
  dragonHunterCrossbow: boolean;
  dragonHunterLance: boolean;
  /** Salve amulet (ei)/(e) vs undead → ×6/5. */
  salveAmuletEi: boolean;
  /** Salve amulet (regular)/(i) vs undead → ×7/6. */
  salveAmulet: boolean;
  /** Arclight / Emberlight vs demons → +70% accuracy & damage (additive). */
  demonbane: boolean;
}

export type SpellElement = "fire" | "water" | "earth" | "air" | "none";

/** Magic damage modifier for matching elemental spells. severity is a percentage point value (40 = +40%). */
export interface MonsterWeakness {
  element: SpellElement;
  severity: number;
}

export interface DpsResult {
  dps: number;
  maxHit: number;
  accuracy: number;
}

export interface BankContents {
  tagName: string;
  itemIds: Set<ItemId>;
}

export type PresetTier = "entry" | "mid" | "end";

export interface GearPreset {
  id: string;
  name: string;
  style: CombatStyle;
  tier: PresetTier;
  loadout: Loadout;
  ammoQuantity?: number;
  notes?: string;
}

export type PresetSlotStatus = "owned" | "affordable" | "missing";

export interface PresetEvaluation {
  preset: GearPreset;
  slotStatuses: Partial<Record<Slot, PresetSlotStatus>>;
  totalCostToComplete: number;
  viable: boolean;
  dps?: DpsResult;
}

export interface MechanicRequirement {
  id: string;
  label: string;
  description: string;
  /**
   * If present, the requirement is "satisfied" when the player's bank
   * contains at least one item from at least one of the `anyOf` groups.
   * Omit for informational mechanics that have no item proxy (e.g. prayer
   * flicking, kill order, positional dodges).
   *
   * Semantically this is the INVENTORY/consumable route — having the item in
   * your kit is enough and it does not occupy an equipment slot (e.g. a Super
   * antifire potion). See `worn` for the equipment-slot route.
   */
  satisfiedBy?: { anyOf: ItemId[][] };
  /**
   * Equipment-slot route: this mechanic can ALSO be satisfied by EQUIPPING one
   * of `items` in `slot` (e.g. a Dragonfire ward in the shield slot). Unlike
   * `satisfiedBy`, this competes with DPS gear for the slot, so the setup
   * checker uses it to flag unsafe loadouts: a recommended setup that neither
   * equips one of these items NOR has a `satisfiedBy` item in the bank leaves
   * the mechanic unmet. See `lib/setup-mechanics.ts`.
   */
  worn?: { slot: Slot; items: ItemId[] };
  remediation: string;
}

export interface ConsumableSuggestion {
  itemId: ItemId;
  name: string;
  quantity: number;
  role: "antifire" | "food" | "prayer" | "boost" | "runes" | "teleport" | "other";
}
