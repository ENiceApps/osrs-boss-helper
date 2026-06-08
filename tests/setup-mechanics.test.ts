// Worn-slot mechanic integration: a recommended setup that drops a required
// worn protection item (and has no inventory alternative) must be flagged as
// an unsafe loadout. Pilot: Vorkath dragonfire protection (shield slot vs
// Super antifire inventory route).

import { describe, expect, it } from "vitest";
import { MECHANICS_BY_SLUG, mechanicsForBoss } from "@/data/bosses/mechanics";
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

describe("mechanicsForBoss — universal dragonfire injection", () => {
  const fire = (slug: string) =>
    mechanicsForBoss(MONSTER_BY_SLUG[slug]).find((m) => m.id === "dragonfire-protection");

  it("injects dragonfire protection for a fire-breathing dragon with no curated mechanics (black dragon)", () => {
    expect(MECHANICS_BY_SLUG["black-dragon"]).toBeUndefined(); // not hand-curated
    const m = fire("black-dragon");
    expect(m).toBeDefined();
    expect(m!.worn?.slot).toBe("shield");
  });

  it("does NOT inject dragonfire for dragon-typed but non-fiery monsters", () => {
    // Wyverns breathe ice (super antifire is useless); hydras don't breathe fire.
    expect(fire("skeletal-wyvern")).toBeUndefined();
    expect(fire("hydra")).toBeUndefined();
    expect(fire("alchemical-hydra")).toBeUndefined();
  });

  it("de-dupes: a curated boss keeps exactly one dragonfire mechanic (Vorkath)", () => {
    const all = mechanicsForBoss(MONSTER_BY_SLUG["vorkath"]);
    const fires = all.filter((m) => m.id === "dragonfire-protection");
    expect(fires).toHaveLength(1);
    // Curated entries are still present alongside the (deduped) dragonfire one.
    expect(all.some((m) => m.id === "food")).toBe(true);
  });
});

describe("mechanicsForBoss — venom & poison potion mechanics", () => {
  const mechIds = (slug: string) => mechanicsForBoss(MONSTER_BY_SLUG[slug]).map((m) => m.id);

  it("venom bosses get a venom mechanic with both potion and worn-helm routes", () => {
    for (const slug of ["zulrah", "alchemical-hydra", "araxxor"]) {
      const venom = mechanicsForBoss(MONSTER_BY_SLUG[slug]).find((m) => m.id === "venom-protection");
      expect(venom, slug).toBeDefined();
      expect(venom!.satisfiedBy).toBeDefined(); // anti-venom potions (inventory route)
      expect(venom!.worn?.slot).toBe("head"); // serpentine-family helm (worn route)
    }
  });

  it("poison bosses get a potion-only poison mechanic (no worn route)", () => {
    const poison = mechanicsForBoss(MONSTER_BY_SLUG["kalphite-queen"]).find((m) => m.id === "poison-protection");
    expect(poison).toBeDefined();
    expect(poison!.satisfiedBy).toBeDefined();
    expect(poison!.worn).toBeUndefined(); // poison doesn't constrain gear
  });

  it("venom bosses are NOT also tagged with the redundant poison mechanic", () => {
    expect(mechIds("zulrah")).not.toContain("poison-protection");
  });

  it("non-venom / non-poison bosses get neither", () => {
    expect(mechIds("general-graardor")).not.toContain("venom-protection");
    expect(mechIds("general-graardor")).not.toContain("poison-protection");
  });
});

describe("checkSetupMechanics — venom worn-slot (Zulrah, helm slot)", () => {
  const ZULRAH = MONSTER_BY_SLUG["zulrah"];
  const ZULRAH_MECHANICS = mechanicsForBoss(ZULRAH);
  const ANTI_VENOM_PLUS_4 = 12913;

  it("wearing a Serpentine helm covers venom even with an empty bank", () => {
    const s = scoreScenario({ itemIds: [12931, 21012, 9243], target: ZULRAH, skills: SKILLS_AT_99 });
    if (!s.valid) throw new Error(s.reasons.join("; "));
    const conflicts = setupMechanicConflicts(s.loadout, ZULRAH_MECHANICS, new Set());
    expect(conflicts.map((c) => c.requirement.id)).not.toContain("venom-protection");
  });

  it("a non-immunity helm with an Anti-venom+ in the bank is safe", () => {
    const s = scoreScenario({ itemIds: [27235, 21012, 9243], target: ZULRAH, skills: SKILLS_AT_99 }); // Masori mask
    if (!s.valid) throw new Error(s.reasons.join("; "));
    const conflicts = setupMechanicConflicts(s.loadout, ZULRAH_MECHANICS, new Set([ANTI_VENOM_PLUS_4]));
    expect(conflicts.map((c) => c.requirement.id)).not.toContain("venom-protection");
  });

  it("a non-immunity helm with no anti-venom in the bank flags a venom conflict", () => {
    const s = scoreScenario({ itemIds: [27235, 21012, 9243], target: ZULRAH, skills: SKILLS_AT_99 });
    if (!s.valid) throw new Error(s.reasons.join("; "));
    const conflicts = setupMechanicConflicts(s.loadout, ZULRAH_MECHANICS, new Set());
    expect(conflicts.map((c) => c.requirement.id)).toContain("venom-protection");
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
