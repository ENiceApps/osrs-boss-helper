// Profit/hr calc (lib/profit.ts). Validates the expected-gp math, coin handling,
// graceful no-data behavior, and the per-hour formula. Uses Vorkath from the
// generated drop table as a real fixture.

import { describe, expect, it } from "vitest";
import { expectedGpPerKill, profitPerHour } from "@/lib/profit";
import { DROPS_BY_SLUG } from "@/data/bosses/drops";

describe("expectedGpPerKill", () => {
  it("sums expected units × price across drops, sorted by gp", () => {
    // Flat 10 gp for every item → gpPerKill = 10 × Σ expected.
    const drops = DROPS_BY_SLUG["vorkath"];
    const sumExpected = drops
      .filter((d) => d.itemId !== 995)
      .reduce((s, d) => s + d.expected, 0);
    const est = expectedGpPerKill("vorkath", () => 10);
    // Coins (id 995) are valued at 1 gp each regardless of the lookup.
    const coins = drops.find((d) => d.itemId === 995);
    const expectedTotal = sumExpected * 10 + (coins ? coins.expected * 1 : 0);
    expect(est.hasData).toBe(true);
    expect(est.gpPerKill).toBeCloseTo(expectedTotal, 2);
    // Breakdown is sorted descending by gp.
    for (let i = 1; i < est.breakdown.length; i++) {
      expect(est.breakdown[i - 1].gpPerKill).toBeGreaterThanOrEqual(est.breakdown[i].gpPerKill);
    }
  });

  it("skips items with no/zero price", () => {
    const est = expectedGpPerKill("vorkath", () => null);
    // Only coins (face value 1) survive when the GE lookup returns nothing.
    const coins = DROPS_BY_SLUG["vorkath"].find((d) => d.itemId === 995);
    expect(est.gpPerKill).toBeCloseTo(coins ? coins.expected : 0, 2);
  });

  it("returns hasData=false for a boss with no drop table", () => {
    const est = expectedGpPerKill("great-olm", () => 1000);
    expect(est.hasData).toBe(false);
    expect(est.gpPerKill).toBe(0);
    expect(est.breakdown).toEqual([]);
  });
});

describe("profitPerHour", () => {
  it("is loot/kill × kills/hr minus supply cost", () => {
    expect(profitPerHour(100_000, 30, 50_000)).toBe(2_950_000);
  });

  it("can go negative when supplies outweigh loot", () => {
    expect(profitPerHour(100, 10, 5_000)).toBe(-4_000);
  });
});
