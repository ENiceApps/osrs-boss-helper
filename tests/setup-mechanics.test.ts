// Worn-slot mechanic integration: a recommended setup that drops a required
// worn protection item (and has no inventory alternative) must be flagged as
// an unsafe loadout. Pilot: Vorkath dragonfire protection (shield slot vs
// Super antifire inventory route).

import { describe, expect, it } from "vitest";
import { MECHANICS_BY_SLUG } from "@/data/bosses/mechanics";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { checkSetupMechanics, setupMechanicConflicts } from "@/lib/setup-mechanics";
import { evaluateMechanics } from "@/lib/mechanics";
import { asItemId, type BankContents } from "@/types/osrs";
import type { LoadoutSet } from "@/types/loadout";

const VORKATH = MONSTER_BY_SLUG["vorkath"];
const VORKATH_MECHANICS = MECHANICS_BY_SLUG["vorkath"];

// Build a real setup from item ids via the engine.
function setupFor(itemIds: number[]): LoadoutSet {
  const scored = scoreScenario({ itemIds, target: VORKATH, skills: SKILLS_AT_99 });
  if (!scored.valid) throw new Error(`bad test setup: ${scored.reasons.join("; ")}`);
  return scored.loadout;
}

function bank(...ids: number[]): Set<number> {
  return new Set(ids);
}

const DHCB = 21012;
const DIAMOND_BOLTS_E = 9243;
const DRAGONFIRE_WARD = 22002;
const AVERNIC_DEFENDER = 22322;
const TWISTED_BOW = 20997;
const DRAGON_ARROW = 11212;
const SUPER_ANTIFIRE_4 = 21987;

describe("checkSetupMechanics — Vorkath dragonfire", () => {
  it("setup equipping a Dragonfire ward is safe even with an empty bank", () => {
    const setup = setupFor([DHCB, DIAMOND_BOLTS_E, DRAGONFIRE_WARD]);
    const statuses = checkSetupMechanics(setup, VORKATH_MECHANICS, bank());
    const fire = statuses.find((s) => s.requirement.id === "dragonfire-protection");
    expect(fire).toBeDefined();
    expect(fire!.satisfiedByWorn).toBe(true);
    expect(fire!.conflict).toBe(false);
  });

  it("setup with a DPS shield is safe IF the bank has a Super antifire", () => {
    const setup = setupFor([DHCB, DIAMOND_BOLTS_E, AVERNIC_DEFENDER]);
    const statuses = checkSetupMechanics(setup, VORKATH_MECHANICS, bank(SUPER_ANTIFIRE_4));
    const fire = statuses.find((s) => s.requirement.id === "dragonfire-protection")!;
    expect(fire.satisfiedByWorn).toBe(false);
    expect(fire.satisfiedByInventory).toBe(true);
    expect(fire.conflict).toBe(false);
  });

  it("setup with a DPS shield and NO antifire in the bank is a conflict (unsafe)", () => {
    const setup = setupFor([DHCB, DIAMOND_BOLTS_E, AVERNIC_DEFENDER]);
    const conflicts = setupMechanicConflicts(setup, VORKATH_MECHANICS, bank());
    expect(conflicts.map((c) => c.requirement.id)).toContain("dragonfire-protection");
  });

  it("2H weapon (no shield slot) with no antifire is a conflict", () => {
    const setup = setupFor([TWISTED_BOW, DRAGON_ARROW]);
    const conflicts = setupMechanicConflicts(setup, VORKATH_MECHANICS, bank());
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].requirement.id).toBe("dragonfire-protection");
    expect(conflicts[0].slot).toBe("shield");
  });

  it("2H weapon is safe when the bank carries a Super antifire", () => {
    const setup = setupFor([TWISTED_BOW, DRAGON_ARROW]);
    const conflicts = setupMechanicConflicts(setup, VORKATH_MECHANICS, bank(SUPER_ANTIFIRE_4));
    expect(conflicts).toHaveLength(0);
  });

  it("ignores pure checklist mechanics (no worn route) — only worn-slot ones are returned", () => {
    const setup = setupFor([DHCB, DIAMOND_BOLTS_E, DRAGONFIRE_WARD]);
    const statuses = checkSetupMechanics(setup, VORKATH_MECHANICS, bank());
    // Vorkath has food / prayer-restore / crumble-undead mechanics with no
    // worn route — they must not appear in the setup check.
    expect(statuses.every((s) => s.requirement.worn !== undefined)).toBe(true);
    expect(statuses.some((s) => s.requirement.id === "food")).toBe(false);
  });
});

describe("evaluateMechanics — checklist counts the worn route too", () => {
  const bankContents = (...ids: number[]): BankContents => ({
    tagName: "test",
    itemIds: new Set(ids.map(asItemId)),
  });
  const fireStatus = (b: BankContents) =>
    evaluateMechanics(VORKATH_MECHANICS, b).find((e) => e.requirement.id === "dragonfire-protection")!;

  it("owning a Dragonfire ward (worn route) satisfies the checklist", () => {
    expect(fireStatus(bankContents(DRAGONFIRE_WARD)).satisfied).toBe(true);
  });

  it("owning a Super antifire (inventory route) satisfies the checklist", () => {
    expect(fireStatus(bankContents(SUPER_ANTIFIRE_4)).satisfied).toBe(true);
  });

  it("owning neither route leaves it unsatisfied", () => {
    expect(fireStatus(bankContents()).satisfied).toBe(false);
  });
});
