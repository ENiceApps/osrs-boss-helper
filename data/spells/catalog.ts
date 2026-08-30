// Full multi-spellbook combat-spell catalog. Drives both the optimizer's
// auto-selection and the manual spell picker. The DPS engine is spell-agnostic
// (it consumes a resolved baseMaxHit + element), so adding spells here is all
// that's needed for the calculator to "know" them.
//
// Values: Standard + Ancient max hits are the long-stable wiki values; the
// niche specials (Iban/Magic Dart/god spells) and Arceuus spells are verified
// against the OSRS wiki. element is "none" for Ancient/Arceuus and the standard
// specials — only the four elemental ladders interact with tomes / elemental
// weakness, so "none" correctly opts the rest out of those bonuses.

import type { SpellElement } from "@/types/osrs";

export type Spellbook = "standard" | "ancient" | "arceuus";

export interface SpellEntry {
  name: string;
  spellbook: Spellbook;
  element: SpellElement;
  minLevel: number;
  /** Fixed base max hit. Ignored when `scaledMaxHit` is present. */
  baseMaxHit: number;
  /** Spell is only castable against targets carrying this attribute. */
  requiresAttribute?: "undead" | "demon";
  /** Baseline accuracy bonus % vs demons (demonbane spells, pre-Mark of Darkness). */
  vsDemonAccuracyPct?: number;
  /** Max hit that scales with magic level (Magic Dart) — overrides baseMaxHit. */
  scaledMaxHit?: (magicLevel: number) => number;
  /** Human-readable staff requirement, surfaced in the picker. Not enforced in scoring. */
  requiresStaff?: string;
}

const STANDARD: readonly SpellEntry[] = [
  { name: "Fire Surge", spellbook: "standard", element: "fire", minLevel: 95, baseMaxHit: 24 },
  { name: "Earth Surge", spellbook: "standard", element: "earth", minLevel: 90, baseMaxHit: 23 },
  { name: "Water Surge", spellbook: "standard", element: "water", minLevel: 85, baseMaxHit: 22 },
  { name: "Wind Surge", spellbook: "standard", element: "air", minLevel: 81, baseMaxHit: 21 },
  { name: "Fire Wave", spellbook: "standard", element: "fire", minLevel: 75, baseMaxHit: 20 },
  { name: "Earth Wave", spellbook: "standard", element: "earth", minLevel: 70, baseMaxHit: 19 },
  { name: "Water Wave", spellbook: "standard", element: "water", minLevel: 65, baseMaxHit: 18 },
  { name: "Wind Wave", spellbook: "standard", element: "air", minLevel: 62, baseMaxHit: 17 },
  { name: "Fire Blast", spellbook: "standard", element: "fire", minLevel: 59, baseMaxHit: 16 },
  { name: "Earth Blast", spellbook: "standard", element: "earth", minLevel: 53, baseMaxHit: 15 },
  { name: "Water Blast", spellbook: "standard", element: "water", minLevel: 47, baseMaxHit: 14 },
  { name: "Wind Blast", spellbook: "standard", element: "air", minLevel: 41, baseMaxHit: 13 },
  { name: "Fire Bolt", spellbook: "standard", element: "fire", minLevel: 35, baseMaxHit: 12 },
  { name: "Earth Bolt", spellbook: "standard", element: "earth", minLevel: 29, baseMaxHit: 11 },
  { name: "Water Bolt", spellbook: "standard", element: "water", minLevel: 23, baseMaxHit: 10 },
  { name: "Wind Bolt", spellbook: "standard", element: "air", minLevel: 17, baseMaxHit: 9 },
  { name: "Fire Strike", spellbook: "standard", element: "fire", minLevel: 13, baseMaxHit: 8 },
  { name: "Earth Strike", spellbook: "standard", element: "earth", minLevel: 9, baseMaxHit: 6 },
  { name: "Water Strike", spellbook: "standard", element: "water", minLevel: 5, baseMaxHit: 4 },
  { name: "Wind Strike", spellbook: "standard", element: "air", minLevel: 1, baseMaxHit: 2 },
  // Standard specials (element "none" — no tome interaction).
  { name: "Saradomin Strike", spellbook: "standard", element: "none", minLevel: 60, baseMaxHit: 20, requiresStaff: "Saradomin staff" },
  { name: "Claws of Guthix", spellbook: "standard", element: "none", minLevel: 60, baseMaxHit: 20, requiresStaff: "Guthix staff" },
  { name: "Flames of Zamorak", spellbook: "standard", element: "none", minLevel: 60, baseMaxHit: 20, requiresStaff: "Zamorak staff" },
  { name: "Iban Blast", spellbook: "standard", element: "none", minLevel: 50, baseMaxHit: 25, requiresStaff: "Iban's staff" },
  // Magic Dart: ⌊magic/10⌋ + 10 (19 at 99). Needs a Slayer's staff family weapon.
  { name: "Magic Dart", spellbook: "standard", element: "none", minLevel: 50, baseMaxHit: 0, scaledMaxHit: (lvl) => Math.floor(lvl / 10) + 10, requiresStaff: "Slayer's staff" },
  { name: "Crumble Undead", spellbook: "standard", element: "none", minLevel: 39, baseMaxHit: 15, requiresAttribute: "undead" },
];

const ANCIENT: readonly SpellEntry[] = [
  { name: "Ice Barrage", spellbook: "ancient", element: "none", minLevel: 94, baseMaxHit: 30 },
  { name: "Blood Barrage", spellbook: "ancient", element: "none", minLevel: 92, baseMaxHit: 29 },
  { name: "Shadow Barrage", spellbook: "ancient", element: "none", minLevel: 88, baseMaxHit: 28 },
  { name: "Smoke Barrage", spellbook: "ancient", element: "none", minLevel: 86, baseMaxHit: 27 },
  { name: "Ice Blitz", spellbook: "ancient", element: "none", minLevel: 82, baseMaxHit: 26 },
  { name: "Blood Blitz", spellbook: "ancient", element: "none", minLevel: 80, baseMaxHit: 25 },
  { name: "Shadow Blitz", spellbook: "ancient", element: "none", minLevel: 76, baseMaxHit: 24 },
  { name: "Smoke Blitz", spellbook: "ancient", element: "none", minLevel: 74, baseMaxHit: 23 },
  { name: "Ice Burst", spellbook: "ancient", element: "none", minLevel: 70, baseMaxHit: 22 },
  { name: "Blood Burst", spellbook: "ancient", element: "none", minLevel: 68, baseMaxHit: 21 },
  { name: "Shadow Burst", spellbook: "ancient", element: "none", minLevel: 64, baseMaxHit: 19 },
  { name: "Smoke Burst", spellbook: "ancient", element: "none", minLevel: 62, baseMaxHit: 18 },
  { name: "Ice Rush", spellbook: "ancient", element: "none", minLevel: 58, baseMaxHit: 16 },
  { name: "Blood Rush", spellbook: "ancient", element: "none", minLevel: 56, baseMaxHit: 15 },
  { name: "Shadow Rush", spellbook: "ancient", element: "none", minLevel: 52, baseMaxHit: 13 },
  { name: "Smoke Rush", spellbook: "ancient", element: "none", minLevel: 50, baseMaxHit: 12 },
];

const ARCEUUS: readonly SpellEntry[] = [
  // Grasp spells — general damage + bind, no target restriction.
  { name: "Undead Grasp", spellbook: "arceuus", element: "none", minLevel: 79, baseMaxHit: 24 },
  { name: "Skeletal Grasp", spellbook: "arceuus", element: "none", minLevel: 56, baseMaxHit: 17 },
  { name: "Ghostly Grasp", spellbook: "arceuus", element: "none", minLevel: 35, baseMaxHit: 12 },
  // Demonbane spells — demon-only. vsDemonAccuracyPct marks them for the
  // engine's demonbane-spell handling (lib/recommend.ts): +20% accuracy base,
  // 40% with Mark of Darkness (which also adds +25% damage), and the Purging
  // staff doubles both.
  { name: "Dark Demonbane", spellbook: "arceuus", element: "none", minLevel: 82, baseMaxHit: 30, requiresAttribute: "demon", vsDemonAccuracyPct: 20 },
  { name: "Superior Demonbane", spellbook: "arceuus", element: "none", minLevel: 62, baseMaxHit: 23, requiresAttribute: "demon", vsDemonAccuracyPct: 20 },
  { name: "Inferior Demonbane", spellbook: "arceuus", element: "none", minLevel: 44, baseMaxHit: 16, requiresAttribute: "demon", vsDemonAccuracyPct: 20 },
];

/** Every modeled combat spell, across all spellbooks. */
export const ALL_SPELLS: readonly SpellEntry[] = [...STANDARD, ...ANCIENT, ...ARCEUUS];

export const SPELLS_BY_NAME: ReadonlyMap<string, SpellEntry> = new Map(
  ALL_SPELLS.map((s) => [s.name, s]),
);

/** The spell's max hit at a given magic level (resolves Magic Dart scaling). */
export function spellMaxHit(spell: SpellEntry, magicLevel: number): number {
  return spell.scaledMaxHit ? spell.scaledMaxHit(magicLevel) : spell.baseMaxHit;
}

/** True iff the spell can be cast against this target (level + attribute restriction). */
export function spellCastableVs(
  spell: SpellEntry,
  magicLevel: number,
  targetAttributes: readonly string[],
): boolean {
  if (spell.minLevel > magicLevel) return false;
  if (spell.requiresAttribute && !targetAttributes.includes(spell.requiresAttribute)) return false;
  return true;
}

/**
 * Standard elemental Bolt/Blast/Wave spells qualify for Twinflame staff's
 * second cast. Strike and Surge are explicitly excluded, as are non-standard
 * and non-elemental (specials) spells.
 */
export function qualifiesForTwinflame(spell: SpellEntry): boolean {
  return (
    spell.spellbook === "standard" &&
    spell.element !== "none" &&
    /(Bolt|Blast|Wave)$/.test(spell.name)
  );
}

export interface SpellSelectionContext {
  magicLevel: number;
  targetAttributes: readonly string[];
  tomeOfFire?: boolean;
  tomeOfWater?: boolean;
  tomeOfEarth?: boolean;
  /** Twinflame staff equipped — folds the double-cast into the ranking. */
  twinflame?: boolean;
  /**
   * Spellbooks the equipped weapon can autocast (see data/items/magic-weapon-autocast.ts).
   * When set, the auto-pick is restricted to these — so it never recommends a
   * spell the weapon physically can't cast (e.g. Ice Barrage on an elemental staff).
   * Omitted = no weapon constraint.
   */
  allowedSpellbooks?: readonly Spellbook[];
}

/** Effective max hit used for ranking — folds in tome and Twinflame bonuses. */
export function spellEffectiveMaxHit(spell: SpellEntry, ctx: SpellSelectionContext): number {
  let hit = spellMaxHit(spell, ctx.magicLevel);
  if (ctx.tomeOfFire && spell.element === "fire") hit = Math.floor((hit * 11) / 10);
  else if (ctx.tomeOfWater && spell.element === "water") hit = Math.floor((hit * 6) / 5);
  else if (ctx.tomeOfEarth && spell.element === "earth") hit = Math.floor((hit * 11) / 10);
  // Twinflame's second cast adds ~40% expected damage on qualifying spells, which
  // can make Fire Wave beat Fire Surge.
  if (ctx.twinflame && qualifiesForTwinflame(spell)) hit = Math.floor((hit * 7) / 5);
  return hit;
}

/**
 * Best castable spell across ALL spellbooks for the given level/target/tomes,
 * ranked by effective max hit. The manual picker can override this. Assumes the
 * player can access whichever spellbook wins (the picker is there for when they
 * can't, or want a specific spell).
 *
 * Spells needing a specific staff (Iban Blast, Magic Dart, god spells) are
 * excluded from the auto-pick — we can't assume that exact staff is equipped, so
 * recommending them on a generic staff would be wrong. They remain selectable in
 * the manual picker, which lists every spell directly.
 */
export function bestSpell(ctx: SpellSelectionContext): SpellEntry | undefined {
  let castable = ALL_SPELLS.filter(
    (s) =>
      !s.requiresStaff && spellCastableVs(s, ctx.magicLevel, ctx.targetAttributes),
  );
  // The Twinflame staff can only autocast standard-spellbook spells, so when
  // it's equipped the auto-pick must stay within Standard (otherwise an Ancient
  // barrage's higher max hit would win a spell the staff can't actually cast).
  if (ctx.twinflame) castable = castable.filter((s) => s.spellbook === "standard");
  // Restrict to spellbooks the equipped weapon can actually autocast.
  if (ctx.allowedSpellbooks) {
    castable = castable.filter((s) => ctx.allowedSpellbooks!.includes(s.spellbook));
  }
  if (castable.length === 0) return undefined;
  return castable.reduce((best, s) =>
    spellEffectiveMaxHit(s, ctx) > spellEffectiveMaxHit(best, ctx) ? s : best,
  );
}
