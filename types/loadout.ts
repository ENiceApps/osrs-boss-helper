// LoadoutSet — the synthesized gear-configuration shape the DPS engine scores.
// Produced by the bank optimizer (lib/optimize/scenario.ts) and the manual gear
// editor (lib/loadout-edit.ts) from a pile of item ids. (The old curated
// premade-set source types + appliesWhen predicates were removed.)

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
  slots: Partial<Record<LoadoutSlotKey, LoadoutSlotComputed>>;
  totals: {
    attackBonus: number;
    strengthBonus: number;
    magicDamagePct?: number;
    /** Sum of prayer bonuses across all equipped items. */
    prayerBonus: number;
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
