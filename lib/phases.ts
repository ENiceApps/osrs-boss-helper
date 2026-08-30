// Boss phase resolution — merges the two phase sources into one selectable
// list and applies a selection to the target the DPS pipeline consumes:
//
//   1. STAT phases: vendored wiki versions with different combat stats
//      (Zulrah's forms, Verzik's per-mode phases, quest/awakened variants) —
//      generated into `MonsterCatalogEntry.phases` by build-monster-catalog.
//   2. MECHANIC phases: curated states that change the math, not the vendor
//      stat block (Tormented Demon's shield, Araxxor's enrage, Doom's
//      immunity…) — data/bosses/mechanic-phases.ts.
//
// When a boss has both (Abyssal Sire, Yama, Doom, Hueycoatl) the mechanic
// states are listed first and a stat selection keeps the boss's default
// mechanic state.

import type { MonsterCatalogEntry, MonsterPhaseEntry } from "@/data/monsters/catalog";
import {
  MECHANIC_PHASES,
  type MechanicPhase,
  type PhaseDamageModifier,
} from "@/data/bosses/mechanic-phases";

/**
 * A monster as the DPS pipeline consumes it. `damageModifier` is the ACTIVE
 * phase's damage scale: undefined = caller never chose a phase (the engine
 * assumes the boss's default mechanic phase), null = a chosen phase with no
 * modifier (e.g. Tormented Demon unshielded). Stat adjustments are already
 * folded into the stat fields by applyPhase.
 */
export type PhasedMonster = MonsterCatalogEntry & {
  damageModifier?: PhaseDamageModifier | null;
  /** Player attacks cannot miss (Doom of Mokhaiotl burrowing/shielded). */
  alwaysHits?: boolean;
  /** Attack-roll scale for the listed styles (Royal Titans at range). */
  accuracyModifier?: MechanicPhase["accuracyModifier"];
  /** Raised minimum hit as a fraction of max hit (Mad Angel reaction buffs). */
  minHitFactor?: [number, number];
  /** Active phase option id — carried into share links. */
  phaseId?: string;
  /** The wiki calc's `monster.inputs.phase` string for the active mechanic
   *  phase — read by lib/wiki-export.ts so the export lands on this phase. */
  wikiPhase?: string;
};

export interface PhaseOption {
  /** Unique within the boss; "m:" = mechanic phase, "s:" = stat phase. */
  id: string;
  label: string;
  /** One-line hint rendered under the selector. */
  note?: string;
  /** Stat block override (stat phases only). */
  stats?: MonsterPhaseEntry;
  /** Mechanic state (mechanic phases only). */
  mechanic?: MechanicPhase;
}

/**
 * Selectable phases for a boss, default first. Empty when the fight has only
 * one state (most monsters) — the UI hides the selector then.
 */
export function phaseOptionsFor(monster: MonsterCatalogEntry): PhaseOption[] {
  const opts: PhaseOption[] = [];
  for (const p of MECHANIC_PHASES[monster.slug] ?? []) {
    opts.push({ id: `m:${p.id}`, label: p.label, note: p.note, mechanic: p });
  }
  for (const p of monster.phases ?? []) {
    opts.push({
      id: `s:${p.version}`,
      label: p.version || monster.name,
      note: `HP ${p.hp} · Def ${p.defenceLevel}`,
      stats: p,
    });
  }
  return opts.length >= 2 ? opts : [];
}

/** The phased target for a selection. No option returns the entry itself, so
 *  memo identities stay stable. */
export function applyPhase(
  monster: MonsterCatalogEntry,
  option: PhaseOption | undefined,
): PhasedMonster {
  if (!option) return monster;
  const out: PhasedMonster = { ...monster, ...(option.stats ?? {}), phaseId: option.id };
  const mech = option.mechanic;
  if (mech) {
    // Mechanic phases pin the damage scale explicitly — null (not undefined)
    // when the phase has none, so the engine's default-phase fallback stays off.
    out.damageModifier = mech.damageModifier ?? null;
    if (mech.alwaysHits) out.alwaysHits = true;
    if (mech.accuracyModifier) out.accuracyModifier = mech.accuracyModifier;
    if (mech.minHitFactor) out.minHitFactor = mech.minHitFactor;
    if (mech.wikiPhase !== undefined) out.wikiPhase = mech.wikiPhase;
    const adj = mech.statAdjust;
    if (adj) {
      if (adj.defenceLevel) out.defenceLevel = monster.defenceLevel + adj.defenceLevel;
      if (adj.magicLevel) out.magicLevel = monster.magicLevel + adj.magicLevel;
      if (adj.defenceBonuses) {
        out.defenceBonuses = { ...monster.defenceBonuses, ...adj.defenceBonuses };
      }
    }
  }
  return out;
}
