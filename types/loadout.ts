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
  /** Dragon hunter wand — magic dragonbane (×7/4 acc, ×7/5 dmg vs dragons). */
  dragonHunterWand: boolean;
  /** Salve amulet (ei)/(e) — ×6/5 vs undead. */
  salveAmuletEi: boolean;
  /** Salve amulet (regular)/(i) — ×7/6 vs undead. */
  salveAmulet: boolean;
  /** Arclight / Emberlight — demonbane vs demons (+70% acc/dmg). */
  demonbane: boolean;
  /** Silverlight (incl. Dyed) / Darklight — demonbane vs demons (+60% acc/dmg). */
  demonbaneSilverlight?: boolean;
  /** Burning claws — demonbane vs demons (+5% acc/dmg). */
  demonbaneClaws?: boolean;
  /** Scorching bow — RANGED demonbane vs demons (+30% acc/dmg). */
  demonbaneScorchingBow?: boolean;
  /** Any Keris partisan — +33% damage + 1/51 triple vs Kalphites/Scabarites. */
  kerisPartisan?: boolean;
  /** Keris partisan of breaching — additionally +33% accuracy vs Kalphites/Scabarites. */
  kerisBreaching?: boolean;
  tomeOfFire: boolean;
  /** Tome of Water (charged) — ×6/5 accuracy + ×6/5 damage on water spells. */
  tomeOfWater: boolean;
  /** Tome of Earth (charged) — ×11/10 accuracy + ×11/10 damage on earth spells. */
  tomeOfEarth: boolean;
  /** Twisted bow — always active when equipped; scaling pulled from target magic level. */
  twistedBow: boolean;
  /** Osmumten's fang — double accuracy roll; only fires on a stab attack style. */
  fang: boolean;
  /** Imbued black mask / slayer helmet — on-task acc+dmg bonus (gated by the UI on-task toggle). */
  slayerHelmImbued: boolean;
  /**
   * A charged wilderness weapon (Craw's/Webweaver, Viggora's/Ursine,
   * Thammaron's/Accursed) — ×3/2 acc+dmg vs NPCs in the Wilderness (gated by the
   * target being a wilderness boss). Optional for back-compat with existing flag
   * literals; absent = false.
   */
  wildernessWeapon?: boolean;
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
  /**
   * Dart loaded inside a blowpipe. Distinct from the ammo slot — blowpipes
   * hold darts internally, leaving the ammo slot free for a blessing. The
   * dart's rangedStr is already folded into totals.strengthBonus.
   */
  internalAmmo?: { itemId: number; itemName: string };
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  /** Name of the selected combat spell (e.g. "Fire Surge", "Ice Barrage") — auto-picked by the optimizer or chosen via the spell picker. Undefined for powered staves. */
  autoSpellName?: string;
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
