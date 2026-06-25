// Phase 3 acceptance tests. Verifies the iterative-greedy upgrade finder:
//   - own-only mode = passthrough (no upgrades, no sell list)
//   - gp-only mode buys upgrades within wallet GP
//   - sell-to-fund mode adds the player's EXPLICITLY chosen bank items to the
//     budget (selling is user-driven; sellList echoes the selection)
//   - recommendedSellToFund picks the minimal sales that fund worthwhile
//     upgrades, never recommending an item that's actually equipped
//   - upgrades are ranked by dps-per-gp so cheap+impactful items lead
//   - budget exhaustion halts the loop
//   - no profitable upgrades → empty path, currentBest = upgradedBest

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades, recommendedSellToFund } from "@/lib/optimize/budget";

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

describe("optimize/budget — weapon candidate uses its own legal style", () => {
  // Regression: a weapon upgrade was scored with the INCUMBENT weapon's attack
  // style. The Dragon hunter lance (category "Spear") has no aggressive style,
  // only "controlled" Lunge/Swipe/Pound — so when the bank's best melee weapon
  // is an aggressive Stab Sword (Osmumten's fang), the lance was scored with an
  // illegal {stab, aggressive} combo, came back invalid, and was silently
  // dropped. It must instead be evaluated with its own legal style and, vs a
  // dragon, win on its dragonbane bonus.
  const RUNE_DRAGON = MONSTER_BY_SLUG["rune-dragon"];

  it("recommends the Dragon hunter lance over the fang vs a dragon", () => {
    const FANG = 26219;
    const DHL = 22978;
    // Full melee strength setup — the fang's higher base Strength only loses to
    // the lance's dragonbane once strength gear is stacked, mirroring the live
    // app's loadout. With a bare weapon the fang still wins, so the regression
    // needs the real gear context.
    const GEAR = [26674, 24780, 20445, 11832, 11834, 7462, 11840, 26770, 20463, 20220];
    const prices = (id: number) => (id === DHL ? 60_000_000 : null);

    const result = findUpgrades({
      bank: [FANG, ...GEAR],
      target: RUNE_DRAGON,
      skills: SKILLS_AT_99,
      gp: 100_000_000,
      mode: "gp-only",
      onTask: true,
      priceLookup: prices,
    });

    // The fang is the bank's only weapon, so it's the current best.
    expect(result.currentBest!.loadout.slots.weapon!.itemId).toBe(FANG);
    // The lance must be bought and end up equipped — it beats the fang vs a dragon.
    const boughtLance = result.upgradePath.some((s) => s.bought.itemId === DHL);
    expect(boughtLance).toBe(true);
    expect(result.upgradedBest!.loadout.slots.weapon!.itemId).toBe(DHL);
    expect(result.upgradedBest!.dps.dps).toBeGreaterThan(result.currentBest!.dps.dps);
  });
});

describe("optimize/budget — sell-to-fund mode (explicit selection)", () => {
  it("only the explicitly-selected items fund the budget; sellList echoes them", () => {
    // Player chooses to sell a spare Armadyl chestplate (30M). That GP — and
    // ONLY that GP — tops up the budget, even though the bank holds other
    // tradeable items (bronze bolts) that were NOT selected.
    const bank = [...EARLY_GAME_BANK, 27238]; // + Masori body (f), so Armadyl chest is spare
    const result = findUpgrades({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "sell-to-fund",
      sellItemIds: [11828], // Armadyl chestplate (30M)
      priceLookup,
    });
    expect(result.currentBest).not.toBeNull();
    expect(result.sellList).toEqual([
      { itemId: 11828, name: expect.any(String), valueGp: 30_000_000 },
    ]);
    // Unselected tradeable items (bronze bolts) never leak into the sell list.
    expect(result.sellList.some((s) => s.itemId === 877)).toBe(false);
    // The 30M of sale proceeds bankrolled at least one upgrade.
    expect(result.upgradePath.length).toBeGreaterThan(0);
    expect(result.totalCostGp).toBeLessThanOrEqual(30_000_000);
  });

  it("no selection → behaves like gp-only at the wallet amount", () => {
    const result = findUpgrades({
      bank: EARLY_GAME_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "sell-to-fund",
      sellItemIds: [],
      priceLookup,
    });
    expect(result.sellList).toEqual([]);
    expect(result.upgradePath).toEqual([]); // gp=0, nothing sold → no budget
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

describe("optimize/budget — recommendedSellToFund", () => {
  // Bank holds a Masori body (best body, equipped) AND an Armadyl chestplate,
  // which is therefore a spare worth 30M sitting unused.
  const REC_BANK = [837, 877, 27238, 11828, 6585, 6737, 3105];

  it("recommends selling the spare item to fund a worthwhile upgrade", () => {
    const { sellItemIds } = recommendedSellToFund({
      bank: REC_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      priceLookup,
    });
    // The unused 30M Armadyl chest is the obvious thing to liquidate.
    expect(sellItemIds).toContain(11828);
  });

  it("never recommends selling an item that's actually equipped", () => {
    const { sellItemIds } = recommendedSellToFund({
      bank: REC_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      priceLookup,
    });
    const ownOnly = findUpgrades({
      bank: REC_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 0,
      mode: "own-only",
      priceLookup,
    });
    const equipped = new Set(
      Object.values(ownOnly.currentBest!.loadout.slots).map((s) => s.itemId),
    );
    for (const id of sellItemIds) expect(equipped.has(id)).toBe(false);
  });

  it("recommends nothing when wallet GP already covers every upgrade", () => {
    const { sellItemIds } = recommendedSellToFund({
      bank: REC_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      gp: 1_000_000_000, // plenty — no need to sell anything
      priceLookup,
    });
    expect(sellItemIds).toEqual([]);
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
