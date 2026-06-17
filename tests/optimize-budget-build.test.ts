// Acceptance tests for the bank-free Budget builder (lib/optimize/budget-build.ts).
//
// The priceLookup below only prices a handful of items, so the "affordable
// catalog" the builder sees is exactly those items — deterministic. A bigger
// budget unlocks pricier, stronger gear, so DPS must climb with the budget and
// the built loadout must never cost more than the budget allows.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

// Approximate GE prices — same fixture style as optimize-budget.test.ts.
const PRICES: Record<number, number> = {
  // Endgame ranged kit (DHCB + Salve set)
  27235: 60_000_000, // Masori mask (f)
  27238: 130_000_000, // Masori body (f)
  27241: 90_000_000, // Masori chaps (f)
  22109: 30_000_000, // Ava's assembler
  12018: 14_000_000, // Salve amulet(ei)
  19547: 19_000_000, // Necklace of anguish
  26235: 70_000_000, // Zaryte vambraces
  13237: 4_000_000, // Pegasian boots
  28310: 95_000_000, // Venator ring
  21012: 130_000_000, // Dragon hunter crossbow
  9243: 500, // Diamond bolts (e), each
  22002: 12_000_000, // Dragonfire ward
  // Mid-tier ranged
  11826: 2_000_000, // Armadyl helmet
  11828: 30_000_000, // Armadyl chestplate
  11830: 25_000_000, // Armadyl chainskirt
  6585: 2_000_000, // Amulet of fury
  6737: 60_000, // Berserker ring
  837: 100, // Crossbow (basic)
  877: 30, // Bronze bolts each
  3105: 70_000, // Climbing boots
};

const priceLookup = (id: number) => PRICES[id] ?? null;

function build(gp: number) {
  return bestLoadoutForBudget({
    target: VORKATH,
    skills: SKILLS_AT_99,
    gp,
    priceLookup,
  });
}

describe("optimize/budget-build — bestLoadoutForBudget", () => {
  it("builds a valid from-scratch loadout that fits the budget", () => {
    const result = build(10_000_000);
    expect(result.fromScratch).toBe(true);
    expect(result.currentBest).toBeNull(); // no "before" — built from nothing
    expect(result.upgradedBest).not.toBeNull();
    expect(result.upgradePath).toEqual([]);
    expect(result.shoppingList!.length).toBeGreaterThan(0);
    expect(result.totalCostGp).toBeLessThanOrEqual(10_000_000);
    expect(result.remainingGp).toBe(10_000_000 - result.totalCostGp);
  });

  it("a bigger budget yields a stronger loadout", () => {
    const lo = build(10_000_000);
    const mid = build(100_000_000);
    const hi = build(500_000_000);
    // More budget can only help — DPS is monotonic non-decreasing.
    expect(mid.upgradedBest!.dps.dps).toBeGreaterThanOrEqual(lo.upgradedBest!.dps.dps);
    expect(hi.upgradedBest!.dps.dps).toBeGreaterThanOrEqual(mid.upgradedBest!.dps.dps);
    // And the top budget unlocks the DHCB (130M), a real jump over 10M.
    expect(hi.upgradedBest!.dps.dps).toBeGreaterThan(lo.upgradedBest!.dps.dps);
  });

  it("the loadout never costs more than the budget, at any tier", () => {
    for (const gp of [10_000_000, 100_000_000, 500_000_000, 2_000_000_000]) {
      const result = build(gp);
      expect(result.totalCostGp).toBeLessThanOrEqual(gp);
      const listTotal = result.shoppingList!.reduce((s, i) => s + i.valueGp, 0);
      expect(listTotal).toBeLessThanOrEqual(gp);
    }
  });

  it("ignores the bank entirely — there is no bank parameter", () => {
    // Sanity: the same budget always produces the same build regardless of
    // anything the player owns (the function simply takes no bank).
    const a = build(100_000_000);
    const b = build(100_000_000);
    expect(a.upgradedBest!.dps.dps).toBe(b.upgradedBest!.dps.dps);
    expect(a.totalCostGp).toBe(b.totalCostGp);
  });

  it("zero / empty budget returns an empty-but-valid result", () => {
    const result = build(0);
    expect(result.upgradedBest).toBeNull();
    expect(result.currentBest).toBeNull();
    expect(result.shoppingList).toEqual([]);
    expect(result.fromScratch).toBe(true);
    expect(result.totalCostGp).toBe(0);
  });
});
