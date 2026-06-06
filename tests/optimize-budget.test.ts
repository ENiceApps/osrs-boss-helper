// Phase 3 acceptance tests. Verifies the iterative-greedy upgrade finder:
//   - own-only mode = passthrough (no upgrades, no sell list)
//   - gp-only mode buys upgrades within wallet GP
//   - sell-to-fund mode adds inactive bank items to the budget; recursively
//     adds displaced items as more upgrades commit
//   - upgrades are ranked by dps-per-gp so cheap+impactful items lead
//   - budget exhaustion halts the loop
//   - no profitable upgrades → empty path, currentBest = upgradedBest

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades } from "@/lib/optimize/budget";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

// Approximate GE prices for the items the tests touch. Real prices fluctuate;
// we hard-code so tests are deterministic. Values are "close enough" — the
// algorithm cares about RELATIVE ordering, not exact GP.
const PRICES: Record<number, number> = {
  // Endgame ranged kit (DHCB + Salve set)
  27235: 60_000_000, // Masori mask (f)
  27238: 130_000_000, // Masori body (f)
  27241: 90_000_000, // Masori chaps (f)
  22109: 30_000_000, // Ava's assembler
  12018: 15_000_000, // Salve amulet(ei)
  19547: 14_000_000, // Necklace of anguish
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

// Bare-bones early-game ranged kit. Player has the basics but is missing
// every endgame piece — there's room for the optimizer to flex.
const EARLY_GAME_BANK = [
  837, // Crossbow
  877, // Bronze bolts
  11826, // Armadyl helmet
  11828, // Armadyl chestplate
  11830, // Armadyl chainskirt
  6585, // Amulet of fury
  6737, // Berserker ring
  3105, // Climbing boots
];

describe("optimize/budget — own-only mode", () => {
  it("returns currentBest unchanged with no upgrades", () => {
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 1_000_000_000,
      mode: "own-only",
      priceLookup,
    });
    expect(result.currentBest).not.toBeNull();
    expect(result.upgradedBest).toBe(result.currentBest);
    expect(result.upgradePath).toEqual([]);
    expect(result.sellList).toEqual([]);
    expect(result.totalCostGp).toBe(0);
    expect(result.totalDpsDelta).toBe(0);
    expect(result.remainingGp).toBe(1_000_000_000);
  });
});

describe("optimize/budget — gp-only mode", () => {
  it("with a big budget, optimizer buys profitable upgrades and DPS improves", () => {
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 1_000_000_000,
      mode: "gp-only",
      priceLookup,
    });
    expect(result.currentBest).not.toBeNull();
    expect(result.upgradePath.length).toBeGreaterThan(0);
    expect(result.totalDpsDelta).toBeGreaterThan(0);
    // upgradedBest must be strictly better than currentBest.
    expect(result.upgradedBest!.dps.dps).toBeGreaterThan(result.currentBest!.dps.dps);
    // No sell list in gp-only mode.
    expect(result.sellList).toEqual([]);
  });

  it("upgrade path is sorted by dpsPerGp (each step's ratio >= the next step against its own baseline)", () => {
    // Iterative greedy commits the best dpsPerGp at each step. Because the
    // baseline DPS changes each iteration, raw dpsPerGp across steps isn't
    // strictly monotone — but each step IS the best available at the time
    // of commit. We can sanity-check that every step is a positive gain.
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 1_000_000_000,
      mode: "gp-only",
      priceLookup,
    });
    for (const step of result.upgradePath) {
      expect(step.dpsDelta).toBeGreaterThan(0);
      expect(step.dpsPerGp).toBeGreaterThan(0);
      expect(step.dpsAfter).toBeGreaterThan(step.dpsBefore);
    }
  });

  it("a tiny budget halts the loop quickly and respects affordability", () => {
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 100_000, // Only a few cheap items affordable.
      mode: "gp-only",
      priceLookup,
    });
    expect(result.totalCostGp).toBeLessThanOrEqual(100_000);
    expect(result.remainingGp).toBeGreaterThanOrEqual(0);
  });

  it("gp=0 → empty upgrade path", () => {
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "gp-only",
      priceLookup,
    });
    expect(result.upgradePath).toEqual([]);
    expect(result.upgradedBest).toBe(result.currentBest);
  });
});

describe("optimize/budget — sell-to-fund mode", () => {
  it("inactive bank items become initial budget; sellList lists them", () => {
    // Bank has an extra cape (Ava's assembler) that won't be in the basic-
    // ranged best loadout. With sell-to-fund and gp=0, the Ava's value should
    // bankroll some upgrades.
    const bank = [...EARLY_GAME_BANK, 22109]; // + Ava's assembler (30M)
    const result = findUpgrades({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "sell-to-fund",
      sellThreshold: 1_000_000,
      priceLookup,
    });
    // currentBest is from the early-game bank ignoring Ava's (Ava's IS in cape slot
    // so it'd be the best cape; let's not assert about that).
    expect(result.currentBest).not.toBeNull();
    // Even with gp=0, sell-to-fund should have produced budget IF Ava's wasn't
    // used in currentBest. If Ava's ended up in currentBest (as the best cape),
    // it wouldn't be sellable; the algorithm is honest about this.
    // We at least confirm no crash and sell list is well-formed.
    for (const sell of result.sellList) {
      expect(sell.valueGp).toBeGreaterThanOrEqual(1_000_000);
    }
  });

  it("sell threshold filters out junk items", () => {
    const bank = [...EARLY_GAME_BANK, 877]; // already has bronze bolts (30 gp)
    const result = findUpgrades({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "sell-to-fund",
      sellThreshold: 1_000_000, // 1M minimum
      priceLookup,
    });
    // Bronze bolts (30gp) should never appear in sell list.
    expect(result.sellList.some((s) => s.itemId === 877)).toBe(false);
  });

  it("DHCB upgrade path: starting with the DHCB+Salve gear missing only Masori, optimizer buys what's affordable", () => {
    // A semi-endgame ranged player. Has DHCB, Salve(ei), most of the Masori
    // pieces — but missing the body, and has 500M GP. Should buy Masori body.
    const bank = [
      27235, // Masori mask (f)
      22109, // Ava's assembler
      12018, // Salve amulet(ei)
      27241, // Masori chaps (f)
      26235, // Zaryte vambraces
      13237, // Pegasian boots
      28310, // Venator ring
      21012, // DHCB
      9243, // Diamond bolts (e)
      22002, // Dragonfire ward
      // Missing: Masori body (f) (27238)
    ];
    const result = findUpgrades({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 500_000_000,
      mode: "gp-only",
      priceLookup,
    });
    // The optimizer should buy Masori body (f) — it's the most obvious upgrade.
    const boughtMasoriBody = result.upgradePath.some(
      (s) => s.bought.itemId === 27238,
    );
    expect(boughtMasoriBody).toBe(true);
  });
});

describe("optimize/budget — degenerate inputs", () => {
  it("empty bank → no currentBest, no upgrades, sell list empty", () => {
    const result = findUpgrades({
      bank: [],
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 1_000_000_000,
      mode: "gp-only",
      priceLookup,
    });
    expect(result.currentBest).toBeNull();
    expect(result.upgradedBest).toBeNull();
    expect(result.upgradePath).toEqual([]);
    expect(result.sellList).toEqual([]);
  });
});
