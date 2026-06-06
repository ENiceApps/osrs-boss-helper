// Universal loadout-set types. A LoadoutSet is a gear configuration tagged
// with an `appliesWhen` predicate over the target's catalog attributes. The
// recommender filters sets by applicability and ranks the rest by DPS at the
// boss's actual stats — so one set ("DHCB + Masori, vs dragons") serves
// every dragon-classified boss instead of being curated per-boss.

import type { AttackStyleChoice, CombatStyle, SpellElement } from "@/types/osrs";

export type AttackType = "stab" | "slash" | "crush" | "ranged" | "magic";
export type LoadoutTier = "entry" | "mid" | "end";

export type LoadoutSlotKey =
  | "head"
  | "cape"
  | "neck"
  | "body"
  | "legs"
  | "hands"
  | "feet"
  | "ring"
  | "weapon"
  | "ammo"
  | "shield";

export interface LoadoutSlotRef {
  itemId: number;
  /** Disambiguates vendor entries with multiple variants (e.g. "Charged"). */
  version?: string;
}

/**
 * Predicate over a monster's catalog entry. All conditions must match. An
 * empty predicate means the set applies to every target.
 */
export interface AppliesWhen {
  /** Target attributes must include every entry here (intersection). */
  requiresAttributes?: readonly string[];
  /** Target must NOT include any of these attributes. */
  excludesAttributes?: readonly string[];
  /** Target's weakness element must match (e.g. "fire" for tome-of-fire setups). */
  weaknessElement?: SpellElement;
}

export interface LoadoutSetSource {
  /** Stable identifier used for URLs and persistence. */
  id: string;
  /** Display name surfaced in the UI. */
  name: string;
  style: CombatStyle;
  tier: LoadoutTier;
  attackType: AttackType;
  attackStyleChoice: AttackStyleChoice;
  appliesWhen: AppliesWhen;
  slots: Partial<Record<LoadoutSlotKey, LoadoutSlotRef>>;
  /** Item-name labels per slot — codegen verifies these match the vendor data. */
  slotLabels: Partial<Record<LoadoutSlotKey, string>>;
  /** Magic-only: base spell max hit (e.g. Fire Surge = 24). */
  baseSpellMaxHit?: number;
  /** Magic-only: cast spell's element, for tome and weakness gating. */
  spellElement?: SpellElement;
  /** Override the weapon's raw `speed` (e.g. Harmonised staff reduces standard spells 5→4 ticks). */
  attackSpeedTicksOverride?: number;
  ammoQuantity?: number;
  notes?: string;
}

export interface LoadoutSlotComputed {
  itemId: number;
  itemName: string;
  version?: string;
}

/** Item-implied conditional bonuses. Activated at recommend time based on target attributes. */
export interface ItemBonusFlags {
  dragonHunterCrossbow: boolean;
  dragonHunterLance: boolean;
  /** Salve amulet (ei)/(e) — ×6/5 vs undead. */
  salveAmuletEi: boolean;
  /** Salve amulet (regular)/(i) — ×7/6 vs undead. */
  salveAmulet: boolean;
  /** Arclight / Emberlight — demonbane vs demons. */
  demonbane: boolean;
  tomeOfFire: boolean;
  /** Twisted bow — always active when equipped; scaling pulled from target magic level. */
  twistedBow: boolean;
}

export interface LoadoutSet {
  id: string;
  name: string;
  style: CombatStyle;
  tier: LoadoutTier;
  attackType: AttackType;
  attackStyleChoice: AttackStyleChoice;
  appliesWhen: AppliesWhen;
  slots: Partial<Record<LoadoutSlotKey, LoadoutSlotComputed>>;
  totals: {
    attackBonus: number;
    strengthBonus: number;
    magicDamagePct?: number;
  };
  attackSpeedTicks: number;
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  ammoQuantity?: number;
  notes?: string;
  /** Which conditional item bonuses the set's gear can grant — see `activeBonusesForTarget`. */
  itemBonusFlags: ItemBonusFlags;
  /**
   * Weapon `category` from vendor data (e.g. "Crossbow", "Bow", "Blowpipe").
   * Used by `defenceBonusForSet` to pick the correct ranged-defence bucket
   * (heavy / standard / light). Optional only for backwards-compat with sets
   * built before this field existed; new sets must populate it.
   */
  weaponCategory?: string;
  /**
   * Active armor-set bonus (e.g. Void Knight) when the loadout has all the
   * required pieces of a defined set. Detected from `data/armor-sets.ts` at
   * loadout build time. Engine applies accuracy/damage factors per
   * `lib/dps/calculate.ts`.
   */
  armorSetBonus?: import("@/data/armor-sets").ArmorSetBonus;
}
