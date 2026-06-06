// Weapon category → attack style options.
//
// Each entry mirrors the in-game combat tab: 3 offensive styles + 1 defensive
// (Block / Defend / etc.). The mapping covers categories used by our presets;
// extend as new bosses introduce new weapon types.
//
// Source: the OSRS wiki combat style table (e.g. the right-hand panel of
// https://oldschool.runescape.wiki/w/Dragon_hunter_lance). Categories use the
// exact `category` string emitted by weirdgloop's equipment.json.
//
// The `choice` field is the `AttackStyleChoice` enum from `@/types/osrs` and
// determines the +atk/+str style bonus our DPS engine applies. The `name`
// field is the in-game display name, surfaced in the UI so users can see
// which style our DPS number assumes.

import type { AttackStyleChoice } from "@/types/osrs";

export type WeaponAttackType = "stab" | "slash" | "crush" | "ranged" | "magic";

export interface WeaponStyleOption {
  /** In-game display name (e.g. "Lunge", "Swipe", "Rapid"). */
  name: string;
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  /** True for the defensive-tab style (Block / Defend / Longrange). */
  defensive: boolean;
}

export const WEAPON_STYLES: Record<string, WeaponStyleOption[]> = {
  // ----- Ranged weapons -----
  Crossbow: [
    { name: "Accurate", attackType: "ranged", choice: "accurate", defensive: false },
    { name: "Rapid", attackType: "ranged", choice: "rapid", defensive: false },
    { name: "Longrange", attackType: "ranged", choice: "longrange", defensive: true },
  ],
  "Two-handed Crossbow": [
    { name: "Accurate", attackType: "ranged", choice: "accurate", defensive: false },
    { name: "Rapid", attackType: "ranged", choice: "rapid", defensive: false },
    { name: "Longrange", attackType: "ranged", choice: "longrange", defensive: true },
  ],
  Bow: [
    { name: "Accurate", attackType: "ranged", choice: "accurate", defensive: false },
    { name: "Rapid", attackType: "ranged", choice: "rapid", defensive: false },
    { name: "Longrange", attackType: "ranged", choice: "longrange", defensive: true },
  ],
  Thrown: [
    { name: "Accurate", attackType: "ranged", choice: "accurate", defensive: false },
    { name: "Rapid", attackType: "ranged", choice: "rapid", defensive: false },
    { name: "Longrange", attackType: "ranged", choice: "longrange", defensive: true },
  ],

  // ----- Melee weapons -----
  // NOTE: category names match `equipment.json`'s `category` field VERBATIM,
  // including capitalisation. "Slash Sword" (capital S) vs "Slash sword"
  // matters because findWeaponStyle does an exact lookup.
  Spear: [
    { name: "Lunge", attackType: "stab", choice: "controlled", defensive: false },
    { name: "Swipe", attackType: "slash", choice: "controlled", defensive: false },
    { name: "Pound", attackType: "crush", choice: "controlled", defensive: false },
    { name: "Block", attackType: "stab", choice: "defensive", defensive: true },
  ],
  Polearm: [
    // Crystal halberd, Dharok's greataxe, etc.
    { name: "Jab", attackType: "stab", choice: "controlled", defensive: false },
    { name: "Swipe", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Fend", attackType: "stab", choice: "defensive", defensive: true },
  ],
  "Slash Sword": [
    { name: "Chop", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Slash", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Lunge", attackType: "stab", choice: "controlled", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  "Stab Sword": [
    // Osmumten's fang, rapiers, daggers.
    { name: "Stab", attackType: "stab", choice: "accurate", defensive: false },
    { name: "Lunge", attackType: "stab", choice: "aggressive", defensive: false },
    { name: "Slash", attackType: "slash", choice: "controlled", defensive: false },
    { name: "Block", attackType: "stab", choice: "defensive", defensive: true },
  ],
  Whip: [
    { name: "Flick", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Lash", attackType: "slash", choice: "controlled", defensive: false },
    { name: "Deflect", attackType: "slash", choice: "defensive", defensive: true },
  ],
  Blunt: [
    { name: "Pound", attackType: "crush", choice: "accurate", defensive: false },
    { name: "Pummel", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "crush", choice: "defensive", defensive: true },
  ],
  Axe: [
    // Soulreaper axe, dragon axe, etc.
    { name: "Chop", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Hack", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Smash", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  "2h Sword": [
    { name: "Chop", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Slash", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Smash", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  Scythe: [
    // Scythe of Vitur. Note: in-game also has a 3-target hit mechanic vs
    // size-3+ monsters; not modelled in single-target DPS calc.
    { name: "Reap", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Chop", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Jab", attackType: "crush", choice: "controlled", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  Spiked: [
    // Inquisitor's mace.
    { name: "Pound", attackType: "crush", choice: "accurate", defensive: false },
    { name: "Pummel", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Spike", attackType: "stab", choice: "controlled", defensive: false },
    { name: "Block", attackType: "crush", choice: "defensive", defensive: true },
  ],

  // ----- Magic-via-melee weapons (staves) -----
  // Staves have melee styles for whacking, but our magic presets cast spells
  // — the cast mode itself has no style attack/strength bonus. We model that
  // by using the "longrange" choice (which gives +0 atk / +0 str) so the
  // engine doesn't accidentally credit magic with a +3 melee-attack bonus.
  Staff: [
    { name: "Bash", attackType: "crush", choice: "accurate", defensive: false },
    { name: "Pound", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Focus", attackType: "crush", choice: "defensive", defensive: true },
    { name: "Spell", attackType: "magic", choice: "longrange", defensive: false },
    { name: "Defensive Cast", attackType: "magic", choice: "defensive", defensive: true },
  ],
  "Powered Staff": [
    // Trident of seas/swamp, Sanguinesti staff. The staff auto-casts its
    // signature spell — there's no separate spellbook involved, so the
    // attack style choice is "Accurate" (default) or "Longrange".
    { name: "Accurate", attackType: "magic", choice: "accurate", defensive: false },
    { name: "Longrange", attackType: "magic", choice: "longrange", defensive: true },
  ],
};

export interface StyleLookupResult {
  category: string;
  option: WeaponStyleOption;
}

/**
 * Find the weapon style option that matches the requested (attackType, choice)
 * for a given weapon category. Throws if the category is unknown or the combo
 * is illegal — that's an authoring error, not a runtime fallback.
 */
export function findWeaponStyle(
  category: string,
  attackType: WeaponAttackType,
  choice: AttackStyleChoice,
): StyleLookupResult {
  const options = WEAPON_STYLES[category];
  if (!options) {
    throw new Error(
      `Unknown weapon category "${category}". Add it to data/weapon-styles.ts.`,
    );
  }
  const option = options.find((o) => o.attackType === attackType && o.choice === choice);
  if (!option) {
    const available = options
      .map((o) => `${o.name} (${o.attackType}/${o.choice})`)
      .join(", ");
    throw new Error(
      `Weapon category "${category}" has no style with attackType="${attackType}" choice="${choice}". Available: ${available}.`,
    );
  }
  return { category, option };
}
