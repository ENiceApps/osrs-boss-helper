// Combat XP from damage dealt.
//
// OSRS grants XP per point of damage, split by the attack style in use
// (https://oldschool.runescape.wiki/w/Combat#Experience):
//   melee   accurate 4 Attack · aggressive 4 Strength · defensive 4 Defence ·
//           controlled 1.33 each to Attack, Strength and Defence
//   ranged  accurate / rapid 4 Ranged · longrange 2 Ranged + 2 Defence
//   magic   2 Magic · defensive cast (or a powered staff's Longrange)
//           1.33 Magic + 1 Defence
// plus 1.33 Hitpoints per damage whatever the style. A spell's base XP per
// cast is NOT included (the spell catalog doesn't carry it).
//
// XP/hr is then DPS x 3600 x XP-per-damage x the monster's XP multiplier
// (data/monsters/xp-multiplier.ts), since our DPS is expected damage per second.

import type { AttackStyleChoice, CombatStyle } from "@/types/osrs";

export type XpSkill = "attack" | "strength" | "defence" | "ranged" | "magic" | "hitpoints";

export const XP_SKILL_LABELS: Record<XpSkill, string> = {
  attack: "Attack",
  strength: "Strength",
  defence: "Defence",
  ranged: "Ranged",
  magic: "Magic",
  hitpoints: "Hitpoints",
};

export interface XpShare {
  skill: XpSkill;
  /** XP per point of damage dealt. */
  xpPerDamage: number;
}

const THIRD = 4 / 3;
const HITPOINTS: XpShare = { skill: "hitpoints", xpPerDamage: THIRD };

/**
 * XP per point of damage for an attack style, Hitpoints last.
 *
 * `defensive` is the weapon style option's own flag (data/weapon-styles.ts).
 * Magic needs it because the `choice` alone is ambiguous there: a staff's
 * plain "Spell" is modelled as `longrange` and a salamander's Blaze as
 * `defensive`, and both give full Magic XP.
 */
export function xpPerDamage(
  style: CombatStyle,
  choice: AttackStyleChoice,
  defensive: boolean,
): XpShare[] {
  if (style === "magic") {
    return defensive
      ? [{ skill: "magic", xpPerDamage: THIRD }, { skill: "defence", xpPerDamage: 1 }, HITPOINTS]
      : [{ skill: "magic", xpPerDamage: 2 }, HITPOINTS];
  }
  if (style === "ranged") {
    return choice === "longrange"
      ? [{ skill: "ranged", xpPerDamage: 2 }, { skill: "defence", xpPerDamage: 2 }, HITPOINTS]
      : [{ skill: "ranged", xpPerDamage: 4 }, HITPOINTS];
  }
  switch (choice) {
    case "accurate":
      return [{ skill: "attack", xpPerDamage: 4 }, HITPOINTS];
    case "defensive":
      return [{ skill: "defence", xpPerDamage: 4 }, HITPOINTS];
    case "controlled":
      return [
        { skill: "attack", xpPerDamage: THIRD },
        { skill: "strength", xpPerDamage: THIRD },
        { skill: "defence", xpPerDamage: THIRD },
        HITPOINTS,
      ];
    default:
      return [{ skill: "strength", xpPerDamage: 4 }, HITPOINTS];
  }
}

export interface XpPerHourRow {
  skill: XpSkill;
  xpPerHour: number;
}

export interface CombatXpPerHour {
  rows: XpPerHourRow[];
  total: number;
}

/**
 * XP per hour at a given DPS. `multiplier` is the monster's XP multiplier
 * (1 = normal) and `uptime` the share of the hour spent attacking (0..1).
 */
export function combatXpPerHour(
  dps: number,
  shares: XpShare[],
  multiplier = 1,
  uptime = 1,
): CombatXpPerHour {
  const damagePerHour = Math.max(0, dps) * 3600 * uptime;
  const rows = shares.map((s) => ({
    skill: s.skill,
    xpPerHour: damagePerHour * s.xpPerDamage * multiplier,
  }));
  return { rows, total: rows.reduce((sum, r) => sum + r.xpPerHour, 0) };
}
