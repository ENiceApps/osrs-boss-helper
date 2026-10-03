// Keris family — the Keris partisans (weapon category "Partisan") and the
// Contact! dagger. Before 2026-10-03 the partisans had no style mapping, so
// scoreScenario rejected every one of them and the optimizer never tried them.
// Exact max hits / rolls vs wgloop are locked in multiplier-order.test.ts.

import { describe, expect, it } from "vitest";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario } from "@/lib/optimize/scenario";

const KALPHITE_QUEEN = MONSTER_BY_SLUG["kalphite-queen"];
const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];
const AKKHA = MONSTER_BY_SLUG["akkha"]; // Tombs of Amascut

const KERIS_PARTISAN = 25979;
const KERIS_PARTISAN_OF_AMASCUT = 30891;
const KERIS_PARTISAN_OF_BREACHING = 25981;
const KERIS_IDS = [
  25979, 30891, 25981, 27287, 27291, // partisan: base, amascut, breaching, corruption, sun
  10581, 10582, 10583, 10584, // Contact! dagger: Unpoisoned, (p), (p+), (p++)
];

/** Neitiznot faceguard, Amulet of torture, Infernal cape, Bandos, Ferocious, Primordial, Berserker (i), Avernic. */
const gear = (weapon: number) =>
  [weapon, 24271, 19553, 21295, 11832, 11834, 22981, 13239, 11773, 22322];

const stabLunge = { attackType: "stab", choice: "aggressive" } as const;

describe("Partisan weapon styles", () => {
  it("mirror wgloop getCombatStylesForCategory: Stab, Lunge, Pound, Block", () => {
    expect(WEAPON_STYLES.Partisan.map((o) => [o.name, o.attackType, o.choice, o.defensive])).toEqual([
      ["Stab", "stab", "accurate", false],
      ["Lunge", "stab", "aggressive", false],
      ["Pound", "crush", "aggressive", false],
      ["Block", "stab", "defensive", true],
    ]);
  });
});

describe("every Keris scores vs a Kalphite", () => {
  for (const id of KERIS_IDS) {
    it(`item ${id}: valid, kalphite bonus + triple proc active`, () => {
      const r = scoreScenario({
        itemIds: gear(id), target: KALPHITE_QUEEN, skills: SKILLS_AT_99, attackStyle: stabLunge,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      expect(r.activeBonuses.conditionalBonuses.kerisVsKalphite).toBe(true);
      expect(r.dps.maxHit).toBeGreaterThan(0);
    });
  }

  it("only breaching adds the accuracy bonus; only amascut uses ×115/100", () => {
    const flags = (id: number) => {
      const r = scoreScenario({
        itemIds: gear(id), target: KALPHITE_QUEEN, skills: SKILLS_AT_99, attackStyle: stabLunge,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      return r.activeBonuses.conditionalBonuses;
    };
    expect(flags(KERIS_PARTISAN_OF_BREACHING).kerisBreachVsKalphite).toBe(true);
    expect(flags(KERIS_PARTISAN).kerisBreachVsKalphite).toBe(false);
    expect(flags(KERIS_PARTISAN_OF_AMASCUT).kerisAmascutVsKalphite).toBe(true);
    expect(flags(KERIS_PARTISAN).kerisAmascutVsKalphite).toBe(false);
  });
});

describe("Keris partisan of amascut stats", () => {
  // Its catalog stats (+108 stab / +67 str) are the in-raid ones; outside the
  // Tombs of Amascut it loses 50 stab and 22 str — which is exactly the base
  // partisan's +58 / +45, so the two must score identically there.
  const score = (weapon: number, target: typeof GRAARDOR) => {
    const r = scoreScenario({ itemIds: gear(weapon), target, skills: SKILLS_AT_99, attackStyle: stabLunge });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    return r.dps;
  };

  it("outside the Tombs of Amascut it scores like the base partisan (wgloop 36 max hit)", () => {
    const amascut = score(KERIS_PARTISAN_OF_AMASCUT, GRAARDOR);
    expect(amascut.maxHit).toBe(36);
    expect(amascut).toEqual(score(KERIS_PARTISAN, GRAARDOR));
  });

  it("inside the Tombs of Amascut it keeps its full stats (wgloop 40 vs the base partisan's 36)", () => {
    expect(score(KERIS_PARTISAN_OF_AMASCUT, AKKHA).maxHit).toBe(40);
    expect(score(KERIS_PARTISAN, AKKHA).maxHit).toBe(36);
  });
});

describe("optimizer", () => {
  it("ranks a Keris partisan when it's the only weapon in the bank (was: no candidates)", () => {
    const bank = gear(KERIS_PARTISAN_OF_BREACHING);
    const { rankings } = optimizeForBoss({ bank, target: KALPHITE_QUEEN, skills: SKILLS_AT_99, topN: 3 });
    expect(rankings.length).toBeGreaterThan(0);
    expect(rankings[0].loadout.slots.weapon?.itemId).toBe(KERIS_PARTISAN_OF_BREACHING);
    expect(rankings[0].dps.dps).toBeGreaterThan(0);
  });
});
