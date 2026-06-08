// Combat stat-boosting potions.
//
// A potion raises your VISIBLE combat level (base + boost). The DPS engine's
// effective-level formula multiplies the visible level by the prayer bonus, so
// feeding a boosted level straight into `computeSetDps` is exactly correct —
// no engine change needed. Boost amount = base + floor(level * pct / 100),
// computed from the player's BASE level (a 99 stat boosts above 99).
//
// Boosting is opt-in (callers pass it explicitly) so the wiki-verified DPS
// baselines, which assume an unpotioned 99/99/99, stay untouched.

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

/** Super combat — +5 +15% to attack & strength (and defence, irrelevant to DPS). */
export const SUPER_COMBAT: CombatBoost = {
  id: "super-combat",
  name: "Super combat potion (4)",
  itemId: 12695,
  attack: { base: 5, pct: 15 },
  strength: { base: 5, pct: 15 },
};

/** Ranging potion — +4 +10% ranged. (Divine ranging / Bastion give the same magnitude.) */
export const RANGING_POTION: CombatBoost = {
  id: "ranging-potion",
  name: "Ranging potion (4)",
  itemId: 2444,
  ranged: { base: 4, pct: 10 },
};

/** Saturated heart — +4 +10% magic. The strongest reusable magic boost. */
export const SATURATED_HEART: CombatBoost = {
  id: "saturated-heart",
  name: "Saturated heart",
  itemId: 27641,
  magic: { base: 4, pct: 10 },
};

/**
 * The boost a typical player brings for a given combat style. Used to make the
 * recommended-loadout DPS reflect a potted-up trip, and to surface the matching
 * potion in the inventory panel.
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
