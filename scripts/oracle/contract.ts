// Shared types for the wgloop oracle harness.
//
// A "canonical combo" is the single source of truth for one test case. Both
// sides consume it:
//   • our engine  — scripts/oracle/run-oracle.ts feeds it to scoreScenario
//   • wgloop calc — run-oracle serializes it to JSON; the jest worker inside the
//                   cloned weirdgloop/osrs-dps-calc reads it and builds a
//                   Player + Monster, then runs PlayerVsNPCCalc.
//
// Keeping ONE record drive both sides means a combo can never describe two
// different setups — the only thing that differs is each engine's native input
// shape, derived from these same fields.

import type { AttackStyleChoice, SpellElement, WeaponAttackType } from "@/types/osrs";

export interface CanonicalCombo {
  /** Stable id for cross-referencing rows in the diff report. */
  id: string;
  /** Worn item IDs, one per slot (order irrelevant). Excludes blowpipe dart. */
  itemIds: number[];
  /** Blowpipe-internal dart id (lives inside the weapon, not the ammo slot). */
  internalAmmoId?: number;
  /** weirdgloop monster id (our MonsterCatalogEntry.wikiId). */
  bossWikiId: number;
  /** Disambiguates multi-version monsters (e.g. "Whisperer"). */
  bossVersion?: string;
  bossSlug: string;
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  /** Magic, standard spellbook: base spell max hit (Fire Surge = 24). */
  baseSpellMaxHit?: number;
  /** Magic: cast spell element — gates Tome of Fire / target weakness. */
  spellElement?: SpellElement;
  /**
   * Magic, standard spellbook: the wgloop spell name (e.g. "Fire Surge").
   * Omit for powered staves/wands — those derive max hit from the weapon and
   * cast no selected spell (worker sets spell = null).
   */
  spellName?: string;
  /** On a slayer task — gates black mask / slayer helm on BOTH engines. */
  onTask?: boolean;
  /**
   * Target is a Wilderness boss. Our engine infers this from the boss slug, but
   * the wgloop worker needs the `inWilderness` buff set explicitly so wilderness
   * weapons (Accursed sceptre, Webweaver, Ursine chainmace, …) get their ×3/2 on
   * both sides.
   */
  inWilderness?: boolean;
  /**
   * Also require the exact attack roll to match (recovered from our hit
   * chance). Set on multiplier-order combos, where a truncation-order bug moves
   * the roll by a few points — well inside the accuracy tolerance.
   */
  exactRoll?: boolean;
  /**
   * A documented reason this combo's DPS may differ beyond tolerance while max
   * hit and accuracy match (e.g. a mean-model shortcut). The DPS check is then
   * reported as a note instead of a divergence.
   */
  knownDpsResidual?: string;
  /**
   * A documented reason the reported max hit differs by design while DPS and
   * accuracy still match (e.g. Osmumten's fang: ours is the true max, wgloop's
   * the trimmed normal max). The max-hit check is then reported as a note.
   */
  knownMaxHitResidual?: string;
  /**
   * Hold DPS to a 0.05% relative tolerance, with no absolute slack. For
   * low-DPS rows (the Corporeal Beast sits near 0.5 dps), where the default
   * ±0.02 absolute slack would hide gaps of several percent.
   */
  strictDps?: boolean;
  /**
   * Optional locked baseline this combo was lifted from (oracle-matrix). When
   * present the diff report does a three-way check: our engine vs wgloop vs
   * this wiki-target baseline.
   */
  baseline?: { maxHit: number; accuracy: number; dps?: number; verifiedOn: string };
}

/** What the jest worker writes back, one per combo (keyed by id). */
export type OracleResult =
  | {
      id: string;
      ok: true;
      maxHit: number;
      accuracy: number;
      dps: number;
      maxAttackRoll: number;
      npcDefRoll: number;
    }
  | { id: string; ok: false; error: string };

/** Pinned upstream commit — bump deliberately, never float to HEAD. */
export const WGLOOP_PINNED_SHA = "89c3e25b344aea90d0189746e4b5f73dde0f0383";
export const WGLOOP_REPO = "https://github.com/weirdgloop/osrs-dps-calc.git";
