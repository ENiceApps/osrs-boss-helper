// Wiki-verified DPS fixtures for the Vorkath regression net.
//
// These are RAW item-id setups (not user-facing curated loadouts — the premade
// loadout-set architecture was removed). Each was hand-verified against
// tools.runescape.wiki/osrs-dps at 99/99/99 + style-default prayer. The verify
// test builds each via `scoreScenario` (the same engine path the bank optimizer
// uses) and asserts the locked baselines, so any engine regression is caught.

import type { AttackStyleChoice, SpellElement, WeaponAttackType } from "@/types/osrs";

export interface VerifiedSetup {
  id: string;
  itemIds: number[];
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  /** Magic-only. */
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  /**
   * `dps` is optional: omit it when the engine path (scoreScenario) can't
   * reproduce the true DPS because of an UNMODELLED weapon mechanic (e.g. the
   * Harmonised staff's 5→4 standard-spell speed). maxHit + accuracy are still
   * asserted in those cases. `dpsNote` documents why dps is absent.
   */
  baseline: { maxHit: number; accuracy: number; dps?: number; verifiedOn: string; dpsNote?: string };
}

// ⚠️ Summer Sweep-Up 2026 stat patch shifted some engine outputs; entries tagged
// "post-patch (engine)" reflect the NEW engine value but weren't re-checked
// against the wiki tool. Re-verify and tighten verifiedOn next time.
//
// ⚠️ 2026-06-10: enchanted-bolt procs are now modelled (always on, mirroring
// the wiki calc — Kandarin diary ON, its default). The three bolt setups'
// dps baselines were recomputed and hand-checked against the wgloop formulas;
// pre-proc values for reference: 7.904 / 5.785 / 3.761. When re-verifying in
// the wiki tool, keep "Kandarin Hard Diary" checked.
export const VERIFIED_SETUPS: VerifiedSetup[] = [
  {
    id: "ranged-end-dragonbane-undead",
    attackType: "ranged",
    choice: "rapid",
    itemIds: [27235, 22109, 12018, 9243, 21012, 27238, 22002, 27241, 26235, 13237, 28310],
    // Diamond bolts (e): 11% defence-ignoring proc at +15% max hit.
    baseline: { maxHit: 57, accuracy: 0.832, dps: 8.227, verifiedOn: "2026-06-10 (engine, bolt procs)" },
  },
  {
    id: "ranged-mid-dragonbane",
    attackType: "ranged",
    choice: "rapid",
    itemIds: [11826, 22109, 19547, 9243, 21012, 11828, 11283, 11830, 7462, 13237, 6733],
    baseline: { maxHit: 45, accuracy: 0.7714, dps: 6.084, verifiedOn: "2026-06-10 (engine, bolt procs)" },
  },
  {
    id: "ranged-entry-universal",
    attackType: "ranged",
    choice: "rapid",
    itemIds: [11865, 10499, 6585, 9242, 9185, 2503, 1540, 2497, 2491, 6328, 6733],
    // Ruby bolts (e): 6.6% proc dealing 20% of current HP (capped 100) that
    // ignores accuracy — transformative on a 750 HP target at entry accuracy.
    baseline: { maxHit: 34, accuracy: 0.6625, dps: 5.706, verifiedOn: "2026-06-10 (engine, bolt procs)" },
  },
  {
    id: "magic-end-fire",
    attackType: "magic",
    choice: "longrange",
    baseSpellMaxHit: 24,
    spellElement: "fire",
    itemIds: [21018, 21791, 12002, 24423, 21021, 20714, 21024, 19544, 13235, 28313],
    // dps omitted: the Harmonised nightmare staff (24423) casts standard spells
    // at 4 ticks, not its raw 5 — scoreScenario uses the raw weapon speed, so
    // its dps (~3.25) understates the true wiki value (4.065). maxHit/accuracy
    // are correct. TODO: model Harmonised's 5→4 speed, then restore dps: 4.065.
    baseline: {
      maxHit: 47,
      accuracy: 0.4148,
      verifiedOn: "2026-05-21",
      dpsNote: "Harmonised 5→4 cast speed not modelled; true wiki dps 4.065",
    },
  },
  {
    id: "melee-end-dragonbane",
    attackType: "stab",
    choice: "controlled",
    itemIds: [24271, 21295, 19553, 22978, 11832, 22002, 11834, 22981, 13239, 28307],
    baseline: { maxHit: 46, accuracy: 0.6258, dps: 6.003, verifiedOn: "2026-05-20" },
  },
  {
    id: "ranged-end-universal-tbow",
    attackType: "ranged",
    choice: "rapid",
    itemIds: [27235, 22109, 19547, 11212, 20997, 27238, 27241, 26235, 13237, 28310],
    baseline: { maxHit: 54, accuracy: 0.7496, dps: 6.751, verifiedOn: "2026-06-02" },
  },
  {
    id: "ranged-end-dragonbane-undead-tbow",
    attackType: "ranged",
    choice: "rapid",
    itemIds: [27235, 22109, 12018, 11212, 20997, 27238, 27241, 26235, 13237, 28310],
    baseline: { maxHit: 62, accuracy: 0.7795, dps: 8.058, verifiedOn: "2026-06-02" },
  },
];
