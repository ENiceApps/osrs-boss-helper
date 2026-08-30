// Selectable combat-prayer catalog — the single source of truth for which
// offensive prayer a loadout is praying with.
//
// The DPS engine is already prayer-agnostic: PrayerSelection (types/osrs.ts)
// carries arbitrary accuracy / strength / magic multipliers, applied via the
// same sequential Math.trunc the wiki uses. This module just enumerates the
// real OSRS prayers per style with their multipliers + drain effect, so the
// player can pick one instead of always assuming the best.
//
// Modelling notes (per OSRS Wiki):
//  - Melee attack and strength are SEPARATE prayers you activate together, so
//    each entry below is the realistic combined activation (e.g. "Ultimate
//    Strength + Incredible Reflexes"), and its drain effect SUMS the two.
//  - Ranged/Magic offensive prayers are single activations. The modern ranged
//    prayers boost ranged attack AND ranged strength by the same %, matching
//    the vendored wgloop calc we calibrate against; Rigour is the asymmetric
//    exception (+20% atk / +23% str). Only Augury grants magic damage (+4%).
//  - Drain effect drives data/prayer-drain.ts: Piety/Rigour/Augury = 24, the
//    level-3 tier = 12, level-2 = 6, level-1 = 3. "None" drains nothing.

import type { CombatStyle, PrayerSelection } from "@/types/osrs";

export interface PrayerOption {
  /** Stable id (used in state + share links). */
  id: string;
  name: string;
  /** Short offensive summary shown in the picker and the results rail. */
  effect: string;
  style: CombatStyle;
  /** Prayer level required to use it (display gating only — still selectable). */
  level: number;
  /** OSRS drain effect for the supply model (Piety/Rigour/Augury = 24). */
  drainEffect: number;
  /** Multipliers fed to the DPS engine. */
  selection: PrayerSelection;
}

/** Build a full PrayerSelection from the few multipliers that differ from 1. */
function sel(overrides: Partial<PrayerSelection>): PrayerSelection {
  return {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1,
    ...overrides,
  };
}

const NONE_MELEE: PrayerOption = {
  id: "none", name: "None", effect: "no offensive prayer",
  style: "melee", level: 1, drainEffect: 0, selection: sel({}),
};
const NONE_RANGED: PrayerOption = { ...NONE_MELEE, style: "ranged" };
const NONE_MAGIC: PrayerOption = { ...NONE_MELEE, style: "magic" };

/** Offensive prayers per style, ordered best → worst (the picker shows top first). */
export const PRAYER_OPTIONS: Record<CombatStyle, PrayerOption[]> = {
  melee: [
    {
      id: "piety", name: "Piety", effect: "+20% atk · +23% str",
      style: "melee", level: 70, drainEffect: 24,
      selection: sel({ attackMultiplier: 1.2, strengthMultiplier: 1.23, defenceMultiplier: 1.25 }),
    },
    {
      id: "chivalry", name: "Chivalry", effect: "+15% atk · +18% str",
      // Drain halved 2026-08-12 (Summer Sweep-Up: Agility & CoX) to match
      // Deadeye/Mystic Vigour — 1 point per 3s at 0 prayer bonus.
      style: "melee", level: 60, drainEffect: 12,
      selection: sel({ attackMultiplier: 1.15, strengthMultiplier: 1.18, defenceMultiplier: 1.2 }),
    },
    {
      id: "ultimate-incredible", name: "Ultimate Str + Incredible Reflexes",
      effect: "+15% atk · +15% str", style: "melee", level: 34, drainEffect: 24,
      selection: sel({ attackMultiplier: 1.15, strengthMultiplier: 1.15 }),
    },
    {
      id: "superhuman-improved", name: "Superhuman Str + Improved Reflexes",
      effect: "+10% atk · +10% str", style: "melee", level: 16, drainEffect: 12,
      selection: sel({ attackMultiplier: 1.1, strengthMultiplier: 1.1 }),
    },
    {
      id: "burst-clarity", name: "Burst of Str + Clarity of Thought",
      effect: "+5% atk · +5% str", style: "melee", level: 7, drainEffect: 6,
      selection: sel({ attackMultiplier: 1.05, strengthMultiplier: 1.05 }),
    },
    NONE_MELEE,
  ],
  ranged: [
    {
      id: "rigour", name: "Rigour", effect: "+20% atk · +23% str",
      style: "ranged", level: 74, drainEffect: 24,
      selection: sel({ rangedAttackMultiplier: 1.2, rangedStrengthMultiplier: 1.23, defenceMultiplier: 1.25 }),
    },
    {
      id: "eagle-eye", name: "Eagle Eye", effect: "+15% atk · +15% str",
      style: "ranged", level: 44, drainEffect: 12,
      selection: sel({ rangedAttackMultiplier: 1.15, rangedStrengthMultiplier: 1.15 }),
    },
    {
      id: "hawk-eye", name: "Hawk Eye", effect: "+10% atk · +10% str",
      style: "ranged", level: 26, drainEffect: 6,
      selection: sel({ rangedAttackMultiplier: 1.1, rangedStrengthMultiplier: 1.1 }),
    },
    {
      id: "sharp-eye", name: "Sharp Eye", effect: "+5% atk · +5% str",
      style: "ranged", level: 8, drainEffect: 3,
      selection: sel({ rangedAttackMultiplier: 1.05, rangedStrengthMultiplier: 1.05 }),
    },
    NONE_RANGED,
  ],
  magic: [
    {
      id: "augury", name: "Augury", effect: "+25% acc · +4% dmg",
      style: "magic", level: 77, drainEffect: 24,
      selection: sel({ magicAttackMultiplier: 1.25, magicDamageMultiplier: 1.04, defenceMultiplier: 1.25 }),
    },
    {
      id: "mystic-might", name: "Mystic Might", effect: "+15% acc",
      style: "magic", level: 45, drainEffect: 12,
      selection: sel({ magicAttackMultiplier: 1.15 }),
    },
    {
      id: "mystic-lore", name: "Mystic Lore", effect: "+10% acc",
      style: "magic", level: 27, drainEffect: 6,
      selection: sel({ magicAttackMultiplier: 1.1 }),
    },
    {
      id: "mystic-will", name: "Mystic Will", effect: "+5% acc",
      style: "magic", level: 9, drainEffect: 3,
      selection: sel({ magicAttackMultiplier: 1.05 }),
    },
    NONE_MAGIC,
  ],
};

/** The best offensive prayer per style — the optimizer's and calc's default. */
export const DEFAULT_PRAYER_ID: Record<CombatStyle, string> = {
  melee: "piety",
  ranged: "rigour",
  magic: "augury",
};

/** Lookup a prayer by style + id, falling back to the style's default. */
export function prayerById(style: CombatStyle, id: string | undefined): PrayerOption {
  const list = PRAYER_OPTIONS[style];
  return list.find((p) => p.id === id) ?? defaultPrayerFor(style);
}

/** The default (best) prayer option for a style. */
export function defaultPrayerFor(style: CombatStyle): PrayerOption {
  const id = DEFAULT_PRAYER_ID[style];
  return PRAYER_OPTIONS[style].find((p) => p.id === id)!;
}
