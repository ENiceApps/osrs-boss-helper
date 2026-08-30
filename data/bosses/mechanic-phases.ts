// Curated MECHANIC phases — boss states that change the DPS math without
// (or beyond) changing the vendored stat block, so they can't come from the
// version data (data/monsters/catalog.ts `phases` covers those). Keyed by
// catalog slug. Each list is a complete, ordered set of selectable states for
// the fight; the FIRST entry is the default the page (and the engine, when no
// phase was chosen) assumes — matching the wiki calc's default so numbers line
// up out of the box.
//
// Numbers mirror weirdgloop's calc (PlayerVsNPCCalc.ts + scaling/Phases.ts)
// phase-for-phase; `wikiPhase` is their `monster.inputs.phase` string so the
// wiki export lands on the same state.
//
// NOTE: a boss can have both vendor stat phases AND mechanic phases (Abyssal
// Sire, Yama, Doom, Hueycoatl). The selector shows one flat list — mechanic
// states first — and picking a stat variant keeps the default mechanic state.

import type { MonsterDefenceBonuses } from "@/data/monsters/catalog";
import type { CombatStyle } from "@/types/osrs";

/** Flat per-hit damage scale while the phase is active. Usually a reduction
 *  (TD shield ×4/5, Sire transition ×1/2) but can boost (Hueycoatl pillar
 *  ×13/10) or zero out entirely (Doom's shield = immune). */
export interface PhaseDamageModifier {
  /** [numerator, denominator] scale on the final max hit. */
  factor: [number, number];
  /** Only these combat styles are affected (Maggot King's melee punish). */
  styles?: CombatStyle[];
  /** Demonbane weapons/spells ignore the modifier entirely. */
  piercedByDemonbane?: boolean;
  /** Abyssal melee weapons (whip/tentacle/dagger/bludgeon) ignore it. */
  piercedByAbyssal?: boolean;
}

export interface MechanicPhase {
  /** Stable id, unique within the boss (used in share links). */
  id: string;
  label: string;
  /** One-line hint shown under the selector. */
  note?: string;
  /** Damage scale active during this phase. Omitted = full damage. */
  damageModifier?: PhaseDamageModifier;
  /**
   * Monster stat changes while the phase is active. Levels are DELTAS on the
   * catalog entry (Araxxor enrage: +35 def); defenceBonuses are ABSOLUTE
   * overrides of individual bonuses (Yama's tank-style magic bonus).
   */
  statAdjust?: {
    defenceLevel?: number;
    magicLevel?: number;
    defenceBonuses?: Partial<MonsterDefenceBonuses>;
  };
  /** Player attacks cannot miss during this phase (Doom burrowing/shielded). */
  alwaysHits?: boolean;
  /**
   * Raised minimum hit as a fraction of the player's max hit (Mad Angel's
   * reaction buffs: dodged Sweep = [1,2], perfect Smite flick = [1,1] i.e.
   * every hit is the max). Lifts the per-hit mean from max/2 to
   * (trunc(max×n/d) + max)/2. Pair with alwaysHits — wgloop's
   * firstHitAccurate/firstHitMinimum/firstHitMax states.
   */
  minHitFactor?: [number, number];
  /** Attack-roll scale during this phase (Royal Titans: ranged ×6 at range). */
  accuracyModifier?: { factor: [number, number]; styles?: CombatStyle[] };
  /**
   * The wiki DPS calc's `monster.inputs.phase` value for this state — the
   * exact string from their constants.ts phase arrays (e.g. TD_PHASES) — so
   * the "Open in wiki calc" export lands on the same phase.
   */
  wikiPhase?: string;
}

export const MECHANIC_PHASES: Record<string, MechanicPhase[]> = {
  // While the demon's fiery shield is up, all damage is reduced ×4/5 —
  // demonbane and abyssal weapons pierce it for full damage. The shield drops
  // briefly after its bombardment special. https://oldschool.runescape.wiki/w/Tormented_demon
  "tormented-demon": [
    {
      id: "shielded",
      label: "Shielded",
      note: "Shield up (most of the fight): −20% damage unless using a demonbane or abyssal weapon.",
      damageModifier: {
        factor: [4, 5],
        piercedByDemonbane: true,
        piercedByAbyssal: true,
      },
      wikiPhase: "Shielded", // TD_PHASES in wgloop constants.ts
    },
    {
      id: "unshielded",
      label: "Unshielded",
      note: "Shield down (after its bombardment): full damage from everything.",
      wikiPhase: "Unshielded",
    },
  ],

  // During the Sire's phase transitions (waking → walking, and the P2→P3 slam)
  // all damage is halved. https://oldschool.runescape.wiki/w/Abyssal_Sire
  "abyssal-sire": [
    {
      id: "standard",
      label: "Standard",
      note: "Normal fight: full damage.",
      wikiPhase: "Standard", // ABYSSAL_SIRE_PHASES in wgloop constants.ts
    },
    {
      id: "transition",
      label: "Transition",
      note: "Between phases (waking / relocating): all damage is halved.",
      damageModifier: { factor: [1, 2] },
      wikiPhase: "Transition",
    },
  ],

  // Enraged (final ~25% HP): Araxxor gains +35 Defence and +28 Magic, so all
  // styles hit it less often. Mirrors wgloop scaling/Phases.ts.
  "araxxor": [
    {
      id: "standard",
      label: "Standard",
      note: "Normal fight: base defences.",
      wikiPhase: "Standard", // ARAXXOR_PHASES in wgloop constants.ts
    },
    {
      id: "enraged",
      label: "Enraged",
      note: "Final phase: +35 Defence and +28 Magic — everything hits less often.",
      statAdjust: { defenceLevel: 35, magicLevel: 28 },
      wikiPhase: "Enraged",
    },
  ],

  // Collapsing a pillar on the Hueycoatl empowers your hits: ×13/10 damage
  // while the buff lasts. https://oldschool.runescape.wiki/w/The_Hueycoatl
  "the-hueycoatl": [
    {
      id: "without-pillar",
      label: "Without pillar",
      note: "No pillar buff: normal damage.",
      wikiPhase: "Without Pillar", // HUEYCOATL_PHASES in wgloop constants.ts
    },
    {
      id: "with-pillar",
      label: "With pillar",
      note: "Pillar buff active: +30% damage from every style.",
      damageModifier: { factor: [13, 10] },
      wikiPhase: "With Pillar",
    },
  ],

  // Yama's magic defence bonus depends on which style the duo's tank draws:
  // +60 when tanked with magic, −30 otherwise. wgloop sets the bonus
  // absolutely per phase (scaling/Phases.ts), so both options override it.
  "yama": [
    {
      id: "tank-magic",
      label: "Tank using magic",
      note: "Tank drawing magic aggro: Yama's magic defence bonus is +60.",
      statAdjust: { defenceBonuses: { magic: 60 } },
      wikiPhase: "Tank using magic", // YAMA_PHASES in wgloop constants.ts
    },
    {
      id: "tank-other",
      label: "Tank not using magic",
      note: "Tank drawing non-magic aggro: Yama's magic defence bonus drops to −30.",
      statAdjust: { defenceBonuses: { magic: -30 } },
      wikiPhase: "Tank not using magic",
    },
  ],

  // Doom of Mokhaiotl: while shielded it is IMMUNE to everything except
  // demonbane; while burrowing (and shielded) player attacks cannot miss.
  // https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl
  "doom-of-mokhaiotl": [
    {
      id: "normal",
      label: "Normal",
      note: "Normal fight: standard accuracy and damage.",
      wikiPhase: "Normal", // DOOM_OF_MOKHAIOTL_PHASES in wgloop constants.ts
    },
    {
      id: "shielded",
      label: "Shielded",
      note: "Shield up: immune to everything except demonbane (which cannot miss).",
      damageModifier: { factor: [0, 1], piercedByDemonbane: true },
      alwaysHits: true,
      wikiPhase: "Shielded",
    },
    {
      id: "burrowing",
      label: "Burrowing",
      note: "Burrowing: attacks cannot miss.",
      alwaysHits: true,
      wikiPhase: "Burrowing",
    },
  ],

  // The Maggot King's "melee punish" window: melee hits deal ×3/2 damage.
  // (wgloop additionally boosts the first crush splat; this engine applies the
  // ×3/2 to the whole melee mean.)
  "maggot-king": [
    {
      id: "standard",
      label: "Standard",
      note: "Normal fight: full damage.",
      wikiPhase: "Standard", // MAGGOT_KING_PHASES in wgloop constants.ts
    },
    {
      id: "melee-punish",
      label: "Melee punish",
      note: "Punish window: melee damage ×1.5.",
      damageModifier: { factor: [3, 2], styles: ["melee"] },
      wikiPhase: "Melee Punish",
    },
  ],

  // Mad Angel's reaction buffs: countering a special perfectly buffs the
  // player's NEXT attack. wgloop models each buff as a selectable state
  // (MAD_ANGEL_PHASES) — Sword Cleave (side-stepped the sweep) = can't miss +
  // minimum hit 50% of max; Perfect Lightning (flicked Protect from Magic on
  // the strike tick) = can't miss + guaranteed max hit.
  // https://oldschool.runescape.wiki/w/Mad_Angel
  "mad-angel": [
    {
      id: "standard",
      label: "Standard",
      note: "No reaction buff active: normal accuracy and damage.",
      wikiPhase: "Standard", // MAD_ANGEL_PHASES in wgloop constants.ts
    },
    {
      id: "sword-cleave",
      label: "Sword Cleave (dodged)",
      note: "After side-stepping the sweep: your next attack cannot miss and its minimum hit is 50% of your max.",
      alwaysHits: true,
      minHitFactor: [1, 2],
      wikiPhase: "Sword Cleave",
    },
    {
      id: "perfect-lightning",
      label: "Perfect Lightning (flicked)",
      note: "After a perfect Protect from Magic flick on the smite: your next attack cannot miss and deals your max hit.",
      alwaysHits: true,
      minHitFactor: [1, 1],
      wikiPhase: "Perfect Lightning",
    },
  ],
};

// The Royal Titans share one mechanic: standing out of melee range makes
// ranged attacks ×6 more accurate (wgloop PLAYER_ACCURACY_TITANS_RANGED).
const ROYAL_TITAN_PHASES: MechanicPhase[] = [
  {
    id: "in-melee-range",
    label: "In melee range",
    note: "Standing in melee range: normal accuracy.",
    wikiPhase: "In Melee Range", // ROYAL_TITANS_PHASES in wgloop constants.ts
  },
  {
    id: "out-of-melee-range",
    label: "Out of melee range",
    note: "Standing at range: ranged attacks are ×6 more accurate.",
    accuracyModifier: { factor: [6, 1], styles: ["ranged"] },
    wikiPhase: "Out of Melee Range",
  },
];
MECHANIC_PHASES["branda-the-fire-queen"] = ROYAL_TITAN_PHASES;
MECHANIC_PHASES["eldric-the-ice-king"] = ROYAL_TITAN_PHASES;

/** The damage modifier the engine should assume for a target when the caller
 *  didn't pick a phase — the boss's default mechanic phase. */
export function defaultDamageModifier(slug: string): PhaseDamageModifier | undefined {
  return MECHANIC_PHASES[slug]?.[0]?.damageModifier;
}
