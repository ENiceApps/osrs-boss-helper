// The Chambers of Xeric Guardians (weirdgloop/osrs-dps-calc @ 89c3e25,
// GUARDIAN_IDS 7569 / 7571 regular, 7570 / 7572 Challenge Mode):
//
//  1. isImmune: every attack but a MELEE swing with a Pickaxe-category weapon
//     deals 0 (ranged and magic too).
//  2. getAttackerDist: a pickaxe swing scales each hitsplat by
//     trunc(h × (50 + Mining + pick bonus) / 150), the pick bonus being the
//     pickaxe's wield level (Bronze/Iron 1 … Rune/Gilded 41, everything else
//     61). We assume 99 Mining, as the wiki calc defaults.
//
// Section 1 checks the helpers, section 2 how a scored loadout carries them,
// section 3 locks wgloop's numbers for guardianCombos().

import { describe, expect, it } from "vitest";
import { hitChance } from "@/lib/dps/common";
import {
  GUARDIAN_IDS,
  guardianPickaxeFactor,
  isGuardianImmune,
  meleeImmunityNote,
  styleImmunityNote,
} from "@/data/monsters/melee-reach";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";
import { buildActiveFlags } from "@/components/ResultsPanel";
import { guardianCombos } from "@/scripts/oracle/combos";

const GUARDIAN = MONSTER_BY_SLUG["guardian-chambers-of-xeric"];

// ---- 1. the rules -------------------------------------------------------------

describe("isGuardianImmune / guardianPickaxeFactor", () => {
  it("the catalog Guardian is one of upstream's ids", () => {
    expect(GUARDIAN_IDS.has(GUARDIAN.wikiId)).toBe(true);
    for (const id of [7569, 7570, 7571, 7572]) expect(GUARDIAN_IDS.has(id)).toBe(true);
  });

  it("only a pickaxe in melee damages a Guardian", () => {
    expect(isGuardianImmune(GUARDIAN, "melee", "Pickaxe")).toBe(false);
    expect(isGuardianImmune(GUARDIAN, "melee", "Slash Sword")).toBe(true);
    expect(isGuardianImmune(GUARDIAN, "melee", undefined)).toBe(true);
    // A pickaxe category on a non-melee style still deals nothing.
    expect(isGuardianImmune(GUARDIAN, "ranged", "Pickaxe")).toBe(true);
    expect(isGuardianImmune(GUARDIAN, "magic", "Staff")).toBe(true);
  });

  it("no other monster is affected", () => {
    const graardor = MONSTER_BY_SLUG["general-graardor"];
    expect(isGuardianImmune(graardor, "ranged", "Bow")).toBe(false);
    expect(guardianPickaxeFactor(graardor, "melee", "Pickaxe", "Dragon pickaxe")).toBeUndefined();
  });

  it("factor = (50 + Mining + wield level) / 150, 61 for anything unlisted", () => {
    const f = (name: string, mining?: number) =>
      guardianPickaxeFactor(GUARDIAN, "melee", "Pickaxe", name, mining);
    expect(f("Dragon pickaxe")).toEqual([210, 150]);
    expect(f("Crystal pickaxe")).toEqual([210, 150]);
    expect(f("Infernal pickaxe")).toEqual([210, 150]);
    expect(f("Rune pickaxe")).toEqual([190, 150]);
    expect(f("Gilded pickaxe")).toEqual([190, 150]);
    expect(f("Adamant pickaxe")).toEqual([180, 150]);
    expect(f("Bronze pickaxe")).toEqual([150, 150]);
    expect(f("Dragon pickaxe", 70)).toEqual([181, 150]);
    expect(guardianPickaxeFactor(GUARDIAN, "melee", "Slash Sword", "Abyssal whip")).toBeUndefined();
  });

  it("the empty-tab notes name the pickaxe rule for every style", () => {
    const note = "Guardian (Chambers of Xeric) only takes damage from a pickaxe in melee.";
    expect(meleeImmunityNote(GUARDIAN)).toBe(note);
    expect(styleImmunityNote(GUARDIAN, "ranged")).toBe(note);
    expect(styleImmunityNote(GUARDIAN, "magic")).toBe(note);
    expect(styleImmunityNote(MONSTER_BY_SLUG["tzkal-zuk"], "ranged")).toBeUndefined();
  });
});

// ---- 2. a scored loadout ------------------------------------------------------

const meleeGear = (weapon: number): number[] =>
  [weapon, 24271, 19553, 21295, 11832, 11834, 22981, 13239, 11773];
const DRAGON_PICKAXE = 11920;
const WHIP = 4151;

describe("a loadout vs the Guardian", () => {
  it("Dragon pickaxe: scores, carries the factor and flags it", () => {
    const r = scoreScenario({
      itemIds: meleeGear(DRAGON_PICKAXE),
      target: GUARDIAN,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "crush", choice: "aggressive" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(r.activeBonuses.guardianImmune).toBe(false);
    expect(r.activeBonuses.guardianPickaxeFactor).toEqual([210, 150]);
    expect(r.dps.dps).toBeGreaterThan(0);
    expect(buildActiveFlags(r.loadout, r.activeBonuses)).toContain(
      "Guardian pickaxe +40.0% dmg (Mining 99)",
    );
  });

  it("Whip: 0 DPS, 0 max hit, accuracy still reported, and the flag says why", () => {
    const r = scoreScenario({
      itemIds: meleeGear(WHIP),
      target: GUARDIAN,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "slash", choice: "controlled" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(r.activeBonuses.guardianImmune).toBe(true);
    expect(r.dps.dps).toBe(0);
    expect(r.dps.maxHit).toBe(0);
    expect(r.dps.accuracy).toBeGreaterThan(0);
    expect(buildActiveFlags(r.loadout, r.activeBonuses)).toContain(
      "Guardian: only a pickaxe in melee damages it",
    );
  });

  it("Budget mode keeps pickaxes past its weapon shortlist and builds one", () => {
    const r = bestLoadoutForBudget({
      target: GUARDIAN,
      skills: SKILLS_AT_99,
      gp: 10_000_000_000,
      priceLookup: () => 1,
    });
    expect(r.upgradedBest?.loadout.weaponCategory).toBe("Pickaxe");
    expect(r.upgradedBest?.dps.dps).toBeGreaterThan(0);
  });
});

// ---- 3. wgloop ----------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each guardianCombos() combo.
 * Before this change the engine scored the Whip and the Twisted bow against
 * the Guardian, and the pickaxes without the Mining scale.
 */
const WGLOOP: Record<
  string,
  { maxHit: number; attackRoll: number; defenceRoll: number; dps: number }
> = {
  "guardian-dragon-pickaxe-stab": { maxHit: 47, attackRoll: 17514, defenceRoll: 15696, dps: 4.309840544839116 },
  "guardian-dragon-pickaxe-crush": { maxHit: 47, attackRoll: 16758, defenceRoll: 5886, dps: 6.4376497063411575 },
  "guardian-rune-pickaxe-crush": { maxHit: 39, attackRoll: 15750, defenceRoll: 5886, dps: 5.2088657069392434 },
  "guardian-whip-control": { maxHit: 0, attackRoll: 23241, defenceRoll: 26596, dps: 0 },
  "guardian-tbow-control": { maxHit: 0, attackRoll: 13003, defenceRoll: 6976, dps: 0 },
};

describe("Guardian combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = guardianCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: MONSTER_BY_SLUG[combo.bossSlug],
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
