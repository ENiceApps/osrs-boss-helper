// Full multi-spellbook combat-spell catalog. Drives both the optimizer's
// auto-selection and the manual spell picker. The DPS engine is spell-agnostic
// (it consumes a resolved baseMaxHit + element), so adding spells here is all
// that's needed for the calculator to "know" them.
//
// Values: Standard + Ancient max hits are the long-stable wiki values; the
// niche specials (Iban/Magic Dart/god spells) and Arceuus spells are verified
// against the OSRS wiki. element is "none" for Ancient/Arceuus and the standard
// specials — only the four elemental ladders interact with tomes / elemental
// weakness / elemental amulets, so "none" correctly opts the rest out of those
// bonuses.
//
// ELEMENTAL LADDERS: since 2024 every standard elemental spell hits as hard as
// the highest-unlocked spell of its CLASS (Strike/Bolt/Blast/Wave/Surge) at the
// player's Magic level — Wind Surge is 21 at 81 Magic, 22 at 85, 23 at 90, 24 at
// 95+ (https://oldschool.runescape.wiki/w/Wind_Surge). Mirrors upstream
// osrs-dps-calc `getSpellMaxHit`. So an elemental entry's `baseMaxHit` is only
// its own nominal tier; ALWAYS read a spell's max hit through `spellMaxHit()`.

import type { SpellElement } from "@/types/osrs";
import {
  amuletBoostsElement,
  ELEMENTAL_AMULET_MAX_HIT_BONUS,
  type ElementalAmuletKind,
} from "@/data/bonus-trigger-items";

export type Spellbook = "standard" | "ancient" | "arceuus";

export interface SpellEntry {
  name: string;
  spellbook: Spellbook;
  element: SpellElement;
  minLevel: number;
  /**
   * Fixed base max hit. Ignored when `scaledMaxHit` is present — which includes
   * every standard elemental spell (see the ladders above): for those this is
   * only the spell's own nominal tier. Read a spell's max hit via `spellMaxHit`.
   */
  baseMaxHit: number;
  /** Strike/Bolt/Blast/Wave/Surge — set on the 20 standard elemental spells. */
  elementalClass?: ElementalSpellClass;
  /** Spell is only castable against targets carrying this attribute. */
  requiresAttribute?: "undead" | "demon";
  /** Baseline accuracy bonus % vs demons (demonbane spells, pre-Mark of Darkness). */
  vsDemonAccuracyPct?: number;
  /** Max hit that scales with magic level (Magic Dart, the elemental ladders) — overrides baseMaxHit. */
  scaledMaxHit?: (magicLevel: number) => number;
  /** Human-readable staff requirement, surfaced in the picker. Not enforced in scoring. */
  requiresStaff?: string;
}

export type ElementalSpellClass = "Strike" | "Bolt" | "Blast" | "Wave" | "Surge";
type RealElement = Exclude<SpellElement, "none">;

/**
 * The elemental ladder per spell class: the Magic level at which Fire / Earth /
 * Water of that class unlock (Wind is the base tier, always available), and each
 * element's own max hit. A player's elemental spell of a class hits for the
 * max hit of the highest tier they have unlocked.
 */
const ELEMENTAL_LADDERS: Record<
  ElementalSpellClass,
  { fireLevel: number; earthLevel: number; waterLevel: number; maxHit: Record<RealElement, number> }
> = {
  Strike: { fireLevel: 13, earthLevel: 9, waterLevel: 5, maxHit: { air: 2, water: 4, earth: 6, fire: 8 } },
  Bolt: { fireLevel: 35, earthLevel: 29, waterLevel: 23, maxHit: { air: 9, water: 10, earth: 11, fire: 12 } },
  Blast: { fireLevel: 59, earthLevel: 53, waterLevel: 47, maxHit: { air: 13, water: 14, earth: 15, fire: 16 } },
  Wave: { fireLevel: 75, earthLevel: 70, waterLevel: 65, maxHit: { air: 17, water: 18, earth: 19, fire: 20 } },
  Surge: { fireLevel: 95, earthLevel: 90, waterLevel: 85, maxHit: { air: 21, water: 22, earth: 23, fire: 24 } },
};

/** An elemental spell class's max hit at a Magic level (the highest unlocked tier). */
export function elementalLadderMaxHit(cls: ElementalSpellClass, magicLevel: number): number {
  const l = ELEMENTAL_LADDERS[cls];
  if (magicLevel >= l.fireLevel) return l.maxHit.fire;
  if (magicLevel >= l.earthLevel) return l.maxHit.earth;
  if (magicLevel >= l.waterLevel) return l.maxHit.water;
  return l.maxHit.air;
}

const ELEMENT_SPELL_NAME: Record<RealElement, string> = {
  fire: "Fire",
  earth: "Earth",
  water: "Water",
  air: "Wind",
};

/** One of the 20 standard elemental spells; max hit resolves via the class ladder. */
function elemental(cls: ElementalSpellClass, element: RealElement, minLevel: number): SpellEntry {
  return {
    name: `${ELEMENT_SPELL_NAME[element]} ${cls}`,
    spellbook: "standard",
    element,
    minLevel,
    baseMaxHit: ELEMENTAL_LADDERS[cls].maxHit[element],
    elementalClass: cls,
    scaledMaxHit: (magicLevel) => elementalLadderMaxHit(cls, magicLevel),
  };
}

const STANDARD: readonly SpellEntry[] = [
  elemental("Surge", "fire", 95),
  elemental("Surge", "earth", 90),
  elemental("Surge", "water", 85),
  elemental("Surge", "air", 81),
  elemental("Wave", "fire", 75),
  elemental("Wave", "earth", 70),
  elemental("Wave", "water", 65),
  elemental("Wave", "air", 62),
  elemental("Blast", "fire", 59),
  elemental("Blast", "earth", 53),
  elemental("Blast", "water", 47),
  elemental("Blast", "air", 41),
  elemental("Bolt", "fire", 35),
  elemental("Bolt", "earth", 29),
  elemental("Bolt", "water", 23),
  elemental("Bolt", "air", 17),
  elemental("Strike", "fire", 13),
  elemental("Strike", "earth", 9),
  elemental("Strike", "water", 5),
  elemental("Strike", "air", 1),
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

/**
 * The spell's max hit at a given magic level — resolves the elemental ladders
 * and Magic Dart scaling. Every consumer must go through this rather than
 * reading `baseMaxHit` (for elemental spells only the spell's nominal tier).
 */
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
 * True iff the player can cast some standard elemental spell of this element at
 * this Magic level (Wind from 1, Water 5, Earth 9, Fire 13) — gates forcing a
 * single-element amulet into an optimizer candidate.
 */
export function canCastElement(element: SpellElement, magicLevel: number): boolean {
  if (element === "none") return false;
  return STANDARD.some((sp) => sp.element === element && sp.minLevel <= magicLevel);
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
  /**
   * Worn / considered elemental amulet — +2 flat max hit on spells of the
   * matching element (the Elemental amulet covers all four). Applied to the
   * spell's base hit, before the weakness and tomes, exactly like the engine
   * (lib/dps/calculate.ts).
   */
  elementalAmulet?: ElementalAmuletKind;
  /**
   * The target's elemental weakness. A matching-element spell adds
   * trunc(base * severity / 100) max hit (base includes the amulet's +2), as in
   * the engine. With the elemental ladders every Surge ties at 95+ Magic, so the
   * weakness and amulet are what decide the element.
   */
  targetWeakness?: { element: string; severity: number } | null;
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

/**
 * Effective max hit used for ranking — folds in the elemental amulet, the
 * target's elemental weakness, tome and Twinflame bonuses, in the engine's order
 * (amulet +2 on the base, weakness on that base, tome, Twinflame second cast).
 */
export function spellEffectiveMaxHit(spell: SpellEntry, ctx: SpellSelectionContext): number {
  let hit = spellMaxHit(spell, ctx.magicLevel);
  if (amuletBoostsElement(ctx.elementalAmulet, spell.element)) {
    hit += ELEMENTAL_AMULET_MAX_HIT_BONUS;
  }
  const weak = ctx.targetWeakness;
  if (weak && spell.element !== "none" && weak.element === spell.element) {
    hit += Math.trunc((hit * weak.severity) / 100);
  }
  if (
    (ctx.tomeOfFire && spell.element === "fire") ||
    (ctx.tomeOfWater && spell.element === "water") ||
    (ctx.tomeOfEarth && spell.element === "earth")
  ) {
    hit = Math.floor((hit * 11) / 10);
  }
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
