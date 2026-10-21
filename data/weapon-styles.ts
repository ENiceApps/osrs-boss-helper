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

import type { AttackStyleChoice, CombatStyle } from "@/types/osrs";
import type { ItemCatalogEntry } from "@/data/items/catalog";

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
    // Crystal halberd, Dragon halberd, etc.
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
  Claw: [
    // Burning claws, dragon claws — same four options as a slash sword.
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
  Bludgeon: [
    // Abyssal bludgeon. In-game Pound / Pummel / Smash are all crush +
    // aggressive (wgloop getCombatStylesForCategory) and there is no block, so
    // one entry covers it — three identical options would only triple the
    // optimizer's work.
    { name: "Pummel", attackType: "crush", choice: "aggressive", defensive: false },
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
    // Jab is crush/AGGRESSIVE (verified vs OSRS wiki + wgloop). It was wrongly
    // crush/controlled, which doesn't exist in-game and under-credits strength.
    { name: "Jab", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  Partisan: [
    // Keris partisan family. Stances per wgloop getCombatStylesForCategory:
    // Stab Accurate, Lunge Aggressive, Pound (crush) Aggressive, Block.
    { name: "Stab", attackType: "stab", choice: "accurate", defensive: false },
    { name: "Lunge", attackType: "stab", choice: "aggressive", defensive: false },
    { name: "Pound", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "stab", choice: "defensive", defensive: true },
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
  "Bladed Staff": [
    // Staff of the dead / Toxic SotD, Staff of light, Staff of balance, Blue
    // moon spear. Melee stances per wgloop getCombatStylesForCategory; spell
    // casting is modelled exactly like a regular Staff (see
    // SPELLCASTING_STAFF_CATEGORIES).
    { name: "Jab", attackType: "stab", choice: "accurate", defensive: false },
    { name: "Swipe", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Fend", attackType: "crush", choice: "defensive", defensive: true },
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

  // ----- Other weapon categories (stances per wgloop getCombatStylesForCategory) -----
  Pickaxe: [
    // Dragon / crystal / infernal pickaxe. The only weapons that damage the CoX
    // Guardians, with Mining-scaled damage (data/monsters/melee-reach.ts).
    { name: "Spike", attackType: "stab", choice: "accurate", defensive: false },
    { name: "Impale", attackType: "stab", choice: "aggressive", defensive: false },
    { name: "Smash", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "stab", choice: "defensive", defensive: true },
  ],
  Polestaff: [
    // Dragon cane, god mjolnirs, sceptres.
    { name: "Bash", attackType: "crush", choice: "accurate", defensive: false },
    { name: "Pound", attackType: "crush", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "crush", choice: "defensive", defensive: true },
  ],
  Flail: [
    // Hallowed flail. (Blisterwood / Ivandis flails are category "Staff".)
    { name: "Chop", attackType: "slash", choice: "accurate", defensive: false },
    { name: "Slash", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Block", attackType: "slash", choice: "defensive", defensive: true },
  ],
  Chinchompas: [
    // Chinchompa accuracy depends on fuse and target distance (upstream
    // PLAYER_ACCURACY_CHINCHOMPA). We assume the wiki calc's default 4 tiles,
    // where only Medium fuse keeps full accuracy (Short / Long fuse are ×3/4),
    // so it's the one style worth offering — and the one our engine scores
    // exactly without a distance model.
    { name: "Medium fuse", attackType: "ranged", choice: "rapid", defensive: false },
  ],
  Salamander: [
    // wgloop getCombatStylesForCategory. All three need the salamander's own
    // tar in the AMMO slot (data/ammo-compatibility.ts) or they deal 0. Flare
    // rolls against the mean of the three ranged defences (rangedDefenceBonusFor);
    // Blaze's max hit is its own magic-level formula (POWERED_STAFF_FORMULA),
    // and its Defensive stance adds no magic accuracy. `defensive: false` on
    // Blaze because it's the only magic option, not a Block-style tab.
    { name: "Scorch", attackType: "slash", choice: "aggressive", defensive: false },
    { name: "Flare", attackType: "ranged", choice: "rapid", defensive: false },
    { name: "Blaze", attackType: "magic", choice: "defensive", defensive: false },
  ],
  Bulwark: [
    // Dinh's bulwark (wgloop getCombatStylesForCategory). Pummel is its only
    // attack; Block has no attack type (it can't attack), so it's left out.
    // Its strength bonus grows with total defence (bulwarkStrengthBonus).
    { name: "Pummel", attackType: "crush", choice: "accurate", defensive: false },
  ],
  // Deliberately unmapped (never recommended): Multi-Melee (Infernal tecpatl,
  // a Leagues item in excluded-items.ts), Banner / Gun / Blaster / Unarmed /
  // "" / "blunt" (cosmetic, quest, broken or non-weapon items).
};

/**
 * Categories that cast spellbook spells (autocast at the spell's cast speed,
 * not the weapon's melee speed), as opposed to powered staves.
 */
export const SPELLCASTING_STAFF_CATEGORIES: ReadonlySet<string> = new Set(["Staff", "Bladed Staff"]);

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

/** Combat style is implied by attackType: ranged → ranged, magic → magic, else melee. */
export function combatStyleFor(attackType: WeaponAttackType): CombatStyle {
  if (attackType === "ranged") return "ranged";
  if (attackType === "magic") return "magic";
  return "melee";
}

/**
 * Pick a sensible default (attackType, choice) for a weapon when the caller
 * hasn't specified one. Heuristic, not optimal — the optimizer enumerates the
 * few legal styles per weapon and picks the DPS-best; this is the fallback
 * for scoreScenario and for the manual gear editor when a weapon swap leaves
 * the set's old style illegal (a blowpipe dropped into the magic set).
 */
export function defaultStyleFor(
  weapon: ItemCatalogEntry,
): { attackType: WeaponAttackType; choice: AttackStyleChoice } | null {
  const options = WEAPON_STYLES[weapon.category];
  if (!options) return null;
  const offensive = options.filter((o) => !o.defensive);
  if (offensive.length === 0) return null;

  const isRangedCat = offensive.some((o) => o.attackType === "ranged");
  const isPoweredStaff = weapon.category === "Powered Staff";

  // Ranged → prefer rapid (extra tick beats Accurate's +3 level in realistic ranges).
  if (isRangedCat) {
    const rapid = offensive.find((o) => o.choice === "rapid");
    if (rapid) return { attackType: rapid.attackType, choice: rapid.choice };
  }

  // Powered staff auto-casts; "accurate" is the only DPS-relevant mode.
  if (isPoweredStaff) {
    const acc = offensive.find((o) => o.choice === "accurate" && o.attackType === "magic");
    if (acc) return { attackType: acc.attackType, choice: acc.choice };
  }

  // Regular staff casting spells: longrange (gives +0 atk / +0 str, matching curated magic sets).
  if (SPELLCASTING_STAFF_CATEGORIES.has(weapon.category)) {
    const spell = offensive.find((o) => o.attackType === "magic" && o.choice === "longrange");
    if (spell) return { attackType: spell.attackType, choice: spell.choice };
  }

  // Melee: pick the style whose attackType maximises the weapon's offensive bonus,
  // preferring aggressive > accurate > controlled > rapid > longrange.
  const choiceRank: Record<AttackStyleChoice, number> = {
    aggressive: 5,
    accurate: 4,
    controlled: 3,
    rapid: 2,
    longrange: 1,
    defensive: 0,
  };
  const offensiveBonus = (at: WeaponAttackType): number => {
    switch (at) {
      case "stab": return weapon.attackStab;
      case "slash": return weapon.attackSlash;
      case "crush": return weapon.attackCrush;
      case "magic": return weapon.attackMagic;
      case "ranged": return weapon.attackRanged;
    }
  };
  let best: WeaponStyleOption | null = null;
  for (const o of offensive) {
    if (!best) { best = o; continue; }
    const bScore = offensiveBonus(best.attackType) * 10 + choiceRank[best.choice];
    const oScore = offensiveBonus(o.attackType) * 10 + choiceRank[o.choice];
    if (oScore > bScore) best = o;
  }
  return best ? { attackType: best.attackType, choice: best.choice } : null;
}
