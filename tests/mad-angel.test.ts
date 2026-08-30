/**
 * Wyrmscraig update (2026-07-29) regression tests:
 *   - Golembane conditional bonuses: Granite hammer ×13/10 accuracy AND damage,
 *     Barronite mace ×23/20 damage only — vs golems, and only vs golems
 *     (wgloop PLAYER_ACCURACY_GOLEMBANE / MAX_HIT_GOLEMBANE).
 *   - Mad Angel reaction-buff phases: Sword Cleave (can't miss, min hit 50% of
 *     max) and Perfect Lightning (can't miss, always max hit) lift the engine's
 *     landed-hit mean exactly as the minHitFactor model predicts.
 */
import { describe, expect, it } from "vitest";
import { conditionalMultipliers, applyFactors } from "@/lib/dps/conditional";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

const NO_FLAGS = {
  dragonHunterCrossbow: false,
  dragonHunterLance: false,
  dragonHunterWand: false,
  salveAmuletEi: false,
  salveAmulet: false,
  demonbane: false,
  tomeOfFire: false,
  tomeOfWater: false,
  tomeOfEarth: false,
  twistedBow: false,
  fang: false,
  slayerHelmImbued: false,
};

function meleeSet(overrides: Partial<LoadoutSet> = {}): LoadoutSet {
  return {
    id: "mad-angel-test",
    name: "Test",
    style: "melee",
    tier: "end",
    attackType: "crush",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 1, itemName: "Hammer" } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    itemBonusFlags: NO_FLAGS,
    weaponCategory: "Blunt",
    ...overrides,
  } as LoadoutSet;
}

const MAD_ANGEL = MONSTER_BY_SLUG["mad-angel"];

describe("golembane conditional factors", () => {
  it("Granite hammer flag adds ×13/10 to BOTH accuracy and damage", () => {
    const m = conditionalMultipliers({ golembaneGraniteHammer: true });
    expect(m.accuracy).toHaveLength(1);
    expect(m.damage).toHaveLength(1);
    // Multiplicative, not additive: trunc(1000 × 13/10) = 1300.
    expect(applyFactors(1000, m.accuracy)).toBe(1300);
    expect(applyFactors(40, m.damage)).toBe(52);
  });

  it("Barronite mace flag adds ×23/20 to damage ONLY", () => {
    const m = conditionalMultipliers({ golembaneBarronite: true });
    expect(m.accuracy).toHaveLength(0);
    expect(m.damage).toHaveLength(1);
    // trunc(40 × 23/20) = 46.
    expect(applyFactors(40, m.damage)).toBe(46);
  });
});

describe("golembane gating on the golem attribute", () => {
  it("Mad Angel is a golem in the catalog", () => {
    expect(MAD_ANGEL).toBeDefined();
    expect(MAD_ANGEL.attributes).toContain("golem");
  });

  it("Granite hammer boosts DPS vs Mad Angel but not vs a non-golem", () => {
    const plain = meleeSet();
    const hammer = meleeSet({
      slots: { weapon: { itemId: 21742, itemName: "Granite hammer" } },
      itemBonusFlags: { ...NO_FLAGS, golembaneGraniteHammer: true },
    });
    const nonGolem = MONSTER_BY_SLUG["vorkath"];
    expect(nonGolem.attributes).not.toContain("golem");

    const vsGolemPlain = computeSetDps(plain, MAD_ANGEL, SKILLS_AT_99);
    const vsGolemHammer = computeSetDps(hammer, MAD_ANGEL, SKILLS_AT_99);
    expect(vsGolemHammer.dps).toBeGreaterThan(vsGolemPlain.dps);
    // ×13/10 max hit exactly (identical totals otherwise).
    expect(vsGolemHammer.maxHit).toBe(Math.trunc((vsGolemPlain.maxHit * 13) / 10));

    const vsOtherPlain = computeSetDps(plain, nonGolem, SKILLS_AT_99);
    const vsOtherHammer = computeSetDps(hammer, nonGolem, SKILLS_AT_99);
    expect(vsOtherHammer.dps).toBeCloseTo(vsOtherPlain.dps, 10);
  });

  it("Barronite mace boosts damage vs Mad Angel without touching accuracy", () => {
    const plain = meleeSet();
    const mace = meleeSet({
      slots: { weapon: { itemId: 25641, itemName: "Barronite mace" } },
      itemBonusFlags: { ...NO_FLAGS, golembaneBarronite: true },
    });
    const base = computeSetDps(plain, MAD_ANGEL, SKILLS_AT_99);
    const boosted = computeSetDps(mace, MAD_ANGEL, SKILLS_AT_99);
    expect(boosted.maxHit).toBe(Math.trunc((base.maxHit * 23) / 20));
    expect(boosted.accuracy).toBeCloseTo(base.accuracy, 10);
  });
});

describe("Mad Angel reaction-buff phases (minHitFactor)", () => {
  function phased(id: string) {
    const opt = phaseOptionsFor(MAD_ANGEL).find((o) => o.id === `m:${id}`);
    expect(opt, `phase m:${id}`).toBeDefined();
    return applyPhase(MAD_ANGEL, opt);
  }

  it("has the three wgloop states, Standard first", () => {
    const ids = phaseOptionsFor(MAD_ANGEL)
      .filter((o) => o.id.startsWith("m:"))
      .map((o) => o.id);
    expect(ids).toEqual(["m:standard", "m:sword-cleave", "m:perfect-lightning"]);
  });

  it("Sword Cleave: can't miss, mean = (trunc(max/2) + max)/2", () => {
    const set = meleeSet();
    const std = computeSetDps(set, phased("standard"), SKILLS_AT_99);
    const buffed = computeSetDps(set, phased("sword-cleave"), SKILLS_AT_99);
    expect(buffed.accuracy).toBe(1);
    expect(buffed.maxHit).toBe(std.maxHit);
    const minHit = Math.trunc(std.maxHit / 2);
    const secondsPerAttack = 4 * 0.6;
    expect(buffed.dps).toBeCloseTo((minHit + std.maxHit) / 2 / secondsPerAttack, 10);
  });

  it("Perfect Lightning: can't miss and every hit is the max", () => {
    const set = meleeSet();
    const std = computeSetDps(set, phased("standard"), SKILLS_AT_99);
    const buffed = computeSetDps(set, phased("perfect-lightning"), SKILLS_AT_99);
    expect(buffed.accuracy).toBe(1);
    const secondsPerAttack = 4 * 0.6;
    expect(buffed.dps).toBeCloseTo(std.maxHit / secondsPerAttack, 10);
    // Ordering sanity: standard < sword cleave < perfect lightning.
    const cleave = computeSetDps(set, phased("sword-cleave"), SKILLS_AT_99);
    expect(std.dps).toBeLessThan(cleave.dps);
    expect(cleave.dps).toBeLessThan(buffed.dps);
  });
});
