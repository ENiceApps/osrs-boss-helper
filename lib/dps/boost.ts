// Combat stat-boosting potions.
//
// A potion raises your VISIBLE combat level (base + boost). The DPS engine's
// effective-level formula multiplies the visible level by the prayer bonus, so
// feeding a boosted level straight into `computeSetDps` is exactly correct —
// no engine change needed. Boost amount = base + floor(level * pct / 100),
// computed from the player's BASE level (a 99 stat boosts above 99).
//
// The boost is resolved from the player's BANK: if they own a boost potion for
// the loadout's style, the DPS reflects it; otherwise the DPS is unpotioned.
// (See `bankBoostResolver`.) The wiki-verified baselines call the engine with
// no boost, so they stay untouched.

import type { CombatStyle, Skills } from "@/types/osrs";

/** boost = base + floor(level * pct / 100). Flat boosts use pct: 0. */
interface BoostFormula {
  base: number;
  pct: number;
}

export interface CombatBoost {
  id: string;
  /** Display name incl. the representative dose. */
  name: string;
  /** Representative item id (the (4) dose) for the inventory suggestion. */
  itemId: number;
  /** Every dose's item id — used to detect the potion in a bank. */
  itemIds: number[];
  attack?: BoostFormula;
  strength?: BoostFormula;
  ranged?: BoostFormula;
  magic?: BoostFormula;
}

function boostAmount(f: BoostFormula | undefined, level: number): number {
  if (!f) return 0;
  return f.base + Math.floor((level * f.pct) / 100);
}

/**
 * Return a copy of `skills` with the boost applied to the combat stats. The
 * boost is computed from the original (base) level and can push a stat above
 * 99 (e.g. 99 strength + Super combat = 118), matching in-game behaviour.
 * Defence/hitpoints/prayer are unchanged — they don't affect outgoing DPS.
 */
export function applyCombatBoost(skills: Skills, boost: CombatBoost | undefined): Skills {
  if (!boost) return skills;
  return {
    ...skills,
    attack: skills.attack + boostAmount(boost.attack, skills.attack),
    strength: skills.strength + boostAmount(boost.strength, skills.strength),
    ranged: skills.ranged + boostAmount(boost.ranged, skills.ranged),
    magic: skills.magic + boostAmount(boost.magic, skills.magic),
  };
}

// ---- Potion library -----------------------------------------------------
// Formulas are the canonical OSRS values; item ids verified against the live
// wiki mapping API.

const ATK_STR_15 = { base: 5, pct: 15 } as const; // super-tier: +5 +15%

/** Super combat — +5 +15% to attack & strength. */
export const SUPER_COMBAT: CombatBoost = {
  id: "super-combat",
  name: "Super combat potion (4)",
  itemId: 12695,
  itemIds: [12695, 12697, 12699, 12701],
  attack: ATK_STR_15,
  strength: ATK_STR_15,
};

const DIVINE_SUPER_COMBAT: CombatBoost = {
  id: "divine-super-combat",
  name: "Divine super combat potion (4)",
  itemId: 23685,
  itemIds: [23685, 23688, 23691, 23694],
  attack: ATK_STR_15,
  strength: ATK_STR_15,
};

const SUPER_STRENGTH: CombatBoost = {
  id: "super-strength",
  name: "Super strength (4)",
  itemId: 2440,
  itemIds: [2440, 157, 159, 161],
  strength: ATK_STR_15,
};

const SUPER_ATTACK: CombatBoost = {
  id: "super-attack",
  name: "Super attack (4)",
  itemId: 2436,
  itemIds: [2436, 145, 147, 149],
  attack: ATK_STR_15,
};

const COMBAT_POTION: CombatBoost = {
  id: "combat-potion",
  name: "Combat potion (4)",
  itemId: 9739,
  itemIds: [9739, 9741, 9743, 9745],
  attack: { base: 3, pct: 10 },
  strength: { base: 3, pct: 10 },
};

const RANGED_4_10 = { base: 4, pct: 10 } as const; // ranging-tier: +4 +10%

/** Ranging potion — +4 +10% ranged. */
export const RANGING_POTION: CombatBoost = {
  id: "ranging-potion",
  name: "Ranging potion (4)",
  itemId: 2444,
  itemIds: [2444, 169, 171, 173],
  ranged: RANGED_4_10,
};

const DIVINE_RANGING: CombatBoost = {
  id: "divine-ranging",
  name: "Divine ranging potion (4)",
  itemId: 23733,
  itemIds: [23733, 23736, 23739, 23742],
  ranged: RANGED_4_10,
};

const BASTION_POTION: CombatBoost = {
  id: "bastion-potion",
  name: "Bastion potion (4)",
  itemId: 22461,
  itemIds: [22461, 22464, 22467, 22470],
  ranged: RANGED_4_10,
};

/** Saturated heart — +4 +10% magic. The strongest reusable magic boost. */
export const SATURATED_HEART: CombatBoost = {
  id: "saturated-heart",
  name: "Saturated heart",
  itemId: 27641,
  itemIds: [27641],
  magic: { base: 4, pct: 10 },
};

const IMBUED_HEART: CombatBoost = {
  id: "imbued-heart",
  name: "Imbued heart",
  itemId: 20724,
  itemIds: [20724],
  magic: { base: 1, pct: 10 },
};

const DIVINE_MAGIC: CombatBoost = {
  id: "divine-magic",
  name: "Divine magic potion (4)",
  itemId: 23745,
  itemIds: [23745, 23748, 23751, 23754],
  magic: { base: 4, pct: 0 },
};

const MAGIC_POTION: CombatBoost = {
  id: "magic-potion",
  name: "Magic potion (4)",
  itemId: 3040,
  itemIds: [3040, 3042, 3044, 3046],
  magic: { base: 4, pct: 0 },
};

const BATTLEMAGE_POTION: CombatBoost = {
  id: "battlemage-potion",
  name: "Battlemage potion (4)",
  itemId: 22449,
  itemIds: [22449, 22452, 22455, 22458],
  magic: { base: 4, pct: 0 },
};

// Per-style candidates ordered strongest → weakest. `boostFromBank` returns the
// first one the player owns, so this doubles as a preference order.
const STYLE_BOOSTS: Record<CombatStyle, CombatBoost[]> = {
  melee: [DIVINE_SUPER_COMBAT, SUPER_COMBAT, SUPER_STRENGTH, COMBAT_POTION, SUPER_ATTACK],
  ranged: [DIVINE_RANGING, RANGING_POTION, BASTION_POTION],
  magic: [SATURATED_HEART, IMBUED_HEART, DIVINE_MAGIC, MAGIC_POTION, BATTLEMAGE_POTION],
};

/**
 * The strongest boost potion the player owns for a style, or undefined if they
 * own none. Used to make the DPS reflect what the player can actually drink.
 */
export function boostFromBank(
  style: CombatStyle,
  bankItemIds: ReadonlySet<number>,
): CombatBoost | undefined {
  for (const boost of STYLE_BOOSTS[style]) {
    if (boost.itemIds.some((id) => bankItemIds.has(id))) return boost;
  }
  return undefined;
}

export type BoostResolver = (style: CombatStyle) => CombatBoost | undefined;

/** A resolver bound to a bank: `(style) => best owned boost for that style`. */
export function bankBoostResolver(bankItemIds: ReadonlySet<number>): BoostResolver {
  return (style) => boostFromBank(style, bankItemIds);
}

/**
 * The boost a player *should* bring for a style (top recommendation), regardless
 * of ownership. Used to suggest the potion in the inventory panel.
 */
export function bestBoostForStyle(style: CombatStyle): CombatBoost {
  switch (style) {
    case "melee":
      return SUPER_COMBAT;
    case "ranged":
      return RANGING_POTION;
    case "magic":
      return SATURATED_HEART;
  }
}
