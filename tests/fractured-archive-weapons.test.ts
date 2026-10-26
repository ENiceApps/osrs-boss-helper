// The Fractured Archive weapon mechanics (2026-10-20): the Obligator's
// best-of-N damage rolls, size bonus and thrust-vs-smash choice, and Zorya's
// tome's special attack. weirdgloop had neither weapon when these were
// written, so every mean here is hand-derived: the best of n rolls over 0..M
// lands k with weight ((k+1)^n − k^n)/(M+1)^n, and the kept roll then takes
// the same per-hitsplat steps as a plain hit.

import { describe, expect, it } from "vitest";
import { bestOfRollWeight, meanBestOfRoll } from "@/lib/dps/common";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG, MONSTER_CATALOG } from "@/data/monsters/catalog";
import {
  OBLIGATOR_SMASH_TICKS,
  OBLIGATOR_THRUST_TICKS,
  obligatorDamageRolls,
  obligatorSizeDamageFactor,
  obligatorThrust,
} from "@/data/items/obligator";
import { findSpecWeapon, SPEC_MAX_HIT } from "@/data/spec-weapons";
import { specMaxHitDisplay } from "@/lib/dps/spec-max-hit";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import type { LoadoutSet } from "@/types/loadout";

// ---- 1. the best-of-N primitive ------------------------------------------------

/** Brute force: the mean of `after(max of n rolls)` over every n-tuple in 0..M. */
function bruteBestOf(max: number, rolls: number, after: (k: number) => number = (k) => k): number {
  const count = (max + 1) ** rolls;
  let sum = 0;
  for (let i = 0; i < count; i++) {
    let rest = i;
    let best = 0;
    for (let r = 0; r < rolls; r++) {
      best = Math.max(best, rest % (max + 1));
      rest = Math.trunc(rest / (max + 1));
    }
    sum += after(best);
  }
  return sum / count;
}

/** The weights by hand, written out: P(best = k) = ((k+1)^n − k^n) / (M+1)^n. */
function weight(k: number, max: number, rolls: number): number {
  return ((k + 1) ** rolls - k ** rolls) / (max + 1) ** rolls;
}

describe("best-of-N damage rolls — the primitive", () => {
  it("weights sum to 1 and one roll is the plain uniform", () => {
    for (const [max, rolls] of [
      [10, 1],
      [10, 2],
      [7, 4],
      [0, 3],
    ]) {
      let total = 0;
      for (let k = 0; k <= max; k++) total += bestOfRollWeight(k, max, rolls);
      expect(total).toBeCloseTo(1, 12);
    }
    expect(bestOfRollWeight(3, 10, 1)).toBeCloseTo(1 / 11, 15);
    expect(bestOfRollWeight(11, 10, 2)).toBe(0);
  });

  it("two rolls over 0..10 average 825/121; the closed form M − Σ((k+1)/(M+1))^n agrees", () => {
    // Σ_{k=0}^{10} k(2k+1)/121 = (2·385 + 55)/121.
    expect(meanBestOfRoll(10, 2)).toBeCloseTo(825 / 121, 12);
    for (const [max, rolls] of [
      [10, 2],
      [25, 3],
      [40, 4],
    ]) {
      let tail = 0;
      for (let k = 0; k < max; k++) tail += ((k + 1) / (max + 1)) ** rolls;
      expect(meanBestOfRoll(max, rolls)).toBeCloseTo(max - tail, 10);
    }
  });

  it("matches a brute-force enumeration, with and without a per-hitsplat transform", () => {
    const halve = (k: number) => Math.trunc(Math.max(k, 1) / 2);
    for (const [max, rolls] of [
      [7, 2],
      [7, 3],
      [7, 4],
      [5, 4],
    ]) {
      expect(meanBestOfRoll(max, rolls)).toBeCloseTo(bruteBestOf(max, rolls), 12);
      expect(meanBestOfRoll(max, rolls, halve)).toBeCloseTo(bruteBestOf(max, rolls, halve), 12);
    }
  });
});

// ---- 2. the engine's single-hit path -------------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1,
  strengthMultiplier: 1,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};

/** A plain 5-tick crush hit; everything else off. */
function melee(extra: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "melee",
    attackStyle: "aggressive",
    prayers: NO_PRAYER,
    skills: SKILLS_AT_99,
    attackBonus: 120,
    strengthBonus: 100,
    attackSpeedTicks: 5,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 35,
    ...extra,
  };
}

const SECONDS = 5 * 0.6;

/** Mean of `after(best of n rolls over 0..M)`, by the hand-written weights. */
function expectedLanded(max: number, rolls: number, after: (k: number) => number): number {
  let sum = 0;
  for (let k = 0; k <= max; k++) sum += weight(k, max, rolls) * after(k);
  return sum;
}

describe("calculateDps — damageRolls keeps the best of n rolls", () => {
  const plain = calculateDps(melee());
  const M = plain.maxHit;
  const acc = plain.accuracy;

  it("the plain hit is the usual M/2 plus the raised 0, and M is big enough to matter", () => {
    expect(M).toBeGreaterThan(20);
    expect(plain.dps).toBeCloseTo((acc * (M / 2 + 1 / (M + 1))) / SECONDS, 12);
  });

  it("two rolls: mean Σ w_k·max(k, 1), the accurate 0 raised once; max hit unchanged", () => {
    const r = calculateDps(melee({ damageRolls: 2 }));
    expect(r.maxHit).toBe(M);
    expect(r.accuracy).toBe(acc);
    expect(r.dps).toBeCloseTo((acc * expectedLanded(M, 2, (k) => Math.max(k, 1))) / SECONDS, 9);
    // About two thirds of max, up from a half.
    expect((r.dps * SECONDS) / acc / M).toBeGreaterThan(0.66);
  });

  it("four rolls: about 0.8·M; one roll (or none) is the plain hit exactly", () => {
    const r = calculateDps(melee({ damageRolls: 4 }));
    expect(r.dps).toBeCloseTo((acc * expectedLanded(M, 4, (k) => Math.max(k, 1))) / SECONDS, 9);
    expect((r.dps * SECONDS) / acc / M).toBeGreaterThan(0.79);
    expect(calculateDps(melee({ damageRolls: 1 })).dps).toBe(plain.dps);
  });

  it("flat armour shifts the kept roll (−2 adds 2, +1 clips the raised 1)", () => {
    const gargoyle = calculateDps(melee({ damageRolls: 3, targetFlatArmour: -2 }));
    expect(gargoyle.dps).toBeCloseTo(
      (acc * expectedLanded(M, 3, (k) => Math.max(k, 1) + 2)) / SECONDS,
      9,
    );
    expect(gargoyle.maxHit).toBe(M + 2);
    const skeleton = calculateDps(melee({ damageRolls: 3, targetFlatArmour: 1 }));
    expect(skeleton.dps).toBeCloseTo(
      (acc * expectedLanded(M, 3, (k) => Math.max(0, Math.max(k, 1) - 1))) / SECONDS,
      9,
    );
  });

  it("per-hitsplat transforms (Corp's halving) act on the kept roll after its raise", () => {
    const r = calculateDps(melee({ damageRolls: 4, corpDamageHalved: true }));
    expect(r.maxHit).toBe(Math.trunc(M / 2));
    expect(r.dps).toBeCloseTo(
      (acc * expectedLanded(M, 4, (k) => Math.trunc(Math.max(k, 1) / 2))) / SECONDS,
      9,
    );
  });

  it("a phase damage factor (×4/5) scales each kept roll, not the max", () => {
    const r = calculateDps(melee({ damageRolls: 2, targetDamageFactor: [4, 5] }));
    expect(r.maxHit).toBe(Math.trunc((M * 4) / 5));
    expect(r.dps).toBeCloseTo(
      (acc * expectedLanded(M, 2, (k) => Math.trunc((Math.max(k, 1) * 4) / 5))) / SECONDS,
      9,
    );
  });

  it("sizeDamageFactor multiplies the max hit before the rolls", () => {
    const r = calculateDps(melee({ damageRolls: 4, sizeDamageFactor: [7, 5] }));
    const big = Math.trunc((M * 7) / 5);
    expect(r.maxHit).toBe(big);
    expect(r.dps).toBeCloseTo((acc * expectedLanded(big, 4, (k) => Math.max(k, 1))) / SECONDS, 9);
    expect(calculateDps(melee({ sizeDamageFactor: [6, 5] })).maxHit).toBe(Math.trunc((M * 6) / 5));
  });

  it("a multi-hit profile ignores damageRolls (single-hit path only)", () => {
    const profile = [{ maxFraction: 0.5 }, { maxFraction: 0.5 }];
    expect(calculateDps(melee({ damageRolls: 4, hitProfile: profile })).dps).toBe(
      calculateDps(melee({ hitProfile: profile })).dps,
    );
  });
});

// ---- 3. the Obligator's rules and the loadout layer's style choice ---------------

describe("Obligator rules", () => {
  it("rolls twice, plus once per stab / slash defence strictly above crush", () => {
    expect(obligatorDamageRolls({ stab: 0, slash: 0, crush: 0 })).toBe(2);
    expect(obligatorDamageRolls({ stab: 50, slash: 20, crush: 20 })).toBe(3);
    expect(obligatorDamageRolls({ stab: 20, slash: 50, crush: 20 })).toBe(3);
    expect(obligatorDamageRolls({ stab: 40, slash: 140, crush: 35 })).toBe(4);
    expect(obligatorDamageRolls({ stab: 10, slash: 10, crush: 50 })).toBe(2);
  });

  it("size bonus: none vs 1x1, ×6/5 vs 2x2, ×7/5 vs 3x3 and bigger", () => {
    expect(obligatorSizeDamageFactor(1)).toBeUndefined();
    expect(obligatorSizeDamageFactor(undefined)).toBeUndefined();
    expect(obligatorSizeDamageFactor(2)).toEqual([6, 5]);
    expect(obligatorSizeDamageFactor(3)).toEqual([7, 5]);
    expect(obligatorSizeDamageFactor(5)).toEqual([7, 5]);
  });

  it("resolves for both catalog ids and nothing else", () => {
    const nex = MONSTER_BY_SLUG["nex"];
    expect(obligatorThrust(34715, nex)).toEqual({ damageRolls: 4, sizeDamageFactor: [7, 5] });
    expect(obligatorThrust(34717, nex)).toEqual({ damageRolls: 4, sizeDamageFactor: [7, 5] });
    expect(obligatorThrust(22325, nex)).toBeUndefined(); // Scythe
    expect(obligatorThrust(undefined, nex)).toBeUndefined();
  });
});

function obligatorSet(weaponId = 34715, name = "Obligator"): LoadoutSet {
  return {
    id: "obligator-test",
    name,
    style: "melee",
    tier: "end",
    attackType: "crush",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: weaponId, itemName: name } },
    totals: { attackBonus: 120, strengthBonus: 40, prayerBonus: 3 },
    attackSpeedTicks: OBLIGATOR_THRUST_TICKS,
    weaponCategory: "Blunt",
    itemBonusFlags: {
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
    },
  };
}

describe("computeSetDps — the Obligator scores thrust and smash and keeps the better", () => {
  // The same stats on a weapon with no passive: the plain 5-tick crush hit.
  const plainSet = obligatorSet(4151, "Abyssal whip");
  const set = obligatorSet();

  it("vs Nex (3x3; stab 40 and slash 140 above crush 35): thrust, four rolls, ×7/5", () => {
    const nex = MONSTER_BY_SLUG["nex"];
    const plain = computeSetDps(plainSet, nex, SKILLS_AT_99);
    const r = computeSetDps(set, nex, SKILLS_AT_99);
    expect(plain.obligatorStyle).toBeUndefined();
    expect(r.obligatorStyle).toEqual({ style: "thrust", attackSpeedTicks: 5, damageRolls: 4 });
    const big = Math.trunc((plain.maxHit * 7) / 5);
    expect(r.maxHit).toBe(big);
    expect(r.accuracy).toBe(plain.accuracy);
    expect(r.dps).toBeCloseTo(
      (plain.accuracy * expectedLanded(big, 4, (k) => Math.max(k, 1))) / SECONDS,
      9,
    );
    // Well over double the plain hit's DPS.
    expect(r.dps / plain.dps).toBeGreaterThan(2);
  });

  it("vs a 1x1 target with neutral defences: smash, 3 ticks, the plain hit ×5/3", () => {
    const base = MONSTER_CATALOG.find((m) => m.defenceLevel > 0 && m.size === 1)!;
    const neutral = {
      ...base,
      defenceBonuses: { ...base.defenceBonuses, stab: 30, slash: 30, crush: 30 },
    };
    const plain = computeSetDps(plainSet, neutral, SKILLS_AT_99);
    const r = computeSetDps(set, neutral, SKILLS_AT_99);
    expect(r.obligatorStyle).toEqual({
      style: "smash",
      attackSpeedTicks: OBLIGATOR_SMASH_TICKS,
      damageRolls: 1,
    });
    expect(r.maxHit).toBe(plain.maxHit);
    expect(r.dps).toBeCloseTo((plain.dps * 5) / 3, 9);
    // And thrust would have been the weaker choice here: best of 2 per 5
    // ticks is about 2M/3 ÷ 5 against M/2 ÷ 3 (same accuracy and max).
    const thrustDps =
      (plain.accuracy * expectedLanded(plain.maxHit, 2, (k) => Math.max(k, 1))) / SECONDS;
    expect(thrustDps).toBeLessThan(r.dps);
    expect(thrustDps).toBeGreaterThan(plain.dps);
  });

  it("vs a 2x2 target: thrust once a third roll is in, smash on two rolls", () => {
    const base = MONSTER_CATALOG.find((m) => m.defenceLevel > 0 && m.size === 1)!;
    const twoByTwo = (stab: number) => ({
      ...base,
      size: 2,
      defenceBonuses: { ...base.defenceBonuses, stab, slash: 30, crush: 30 },
    });
    expect(computeSetDps(set, twoByTwo(30), SKILLS_AT_99).obligatorStyle?.style).toBe("smash");
    const r = computeSetDps(set, twoByTwo(60), SKILLS_AT_99);
    expect(r.obligatorStyle).toEqual({ style: "thrust", attackSpeedTicks: 5, damageRolls: 3 });
    const plain = computeSetDps(plainSet, twoByTwo(60), SKILLS_AT_99);
    expect(r.maxHit).toBe(Math.trunc((plain.maxHit * 6) / 5));
  });
});

// ---- 4. Zorya's tome ----------------------------------------------------------

describe("Zorya's tome", () => {
  it("is a dps-spike spec weapon with four boosted hits at +60%", () => {
    const spec = findSpecWeapon(34725);
    expect(spec?.name).toBe("Zorya's tome");
    expect(spec?.role).toBe("dps-spike");
    expect(spec?.energyCost).toBe(50); // "Zorya's flow", wiki 2026-10-26
    expect(SPEC_MAX_HIT[34725]).toEqual({ factor: [8, 5], hits: 4 });
    const display = specMaxHitDisplay(34725, 25)!;
    expect(display.normalMaxHit).toBe(25);
    expect(display.specMaxHit).toBe(40);
    expect(display.hits).toBe(4);
  });

  it("keeps the wiki's flat base max hit of 18 at every Magic level", () => {
    for (const id of [34725, 34727]) {
      const formula = POWERED_STAFF_FORMULA.get(id)!;
      expect(formula(85)).toBe(18);
      expect(formula(99)).toBe(18);
      expect(formula(120)).toBe(18);
    }
  });
});
