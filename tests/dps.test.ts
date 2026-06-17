import { describe, expect, it } from "vitest";
import {
  dpsFromHitChance,
  effectiveLevel,
  fangHitChance,
  hitChance,
  npcDefenceRoll,
} from "@/lib/dps/common";
import { meleeMaxHit } from "@/lib/dps/melee";
import { rangedMaxHit } from "@/lib/dps/ranged";
import { magicMaxHit } from "@/lib/dps/magic";
import { applyFactors, conditionalMultipliers } from "@/lib/dps/conditional";
import { calculateDps } from "@/lib/dps/calculate";
import { expectedMultiHitDamage } from "@/lib/dps/multihit";

describe("DPS — pure formulas", () => {
  it("effectiveLevel applies prayer multiplier with floor before adding bonuses", () => {
    expect(effectiveLevel(99, 1.2, 0)).toBe(118 + 8);
    expect(effectiveLevel(99, 1.23, 3)).toBe(121 + 3 + 8);
  });

  it("meleeMaxHit hand-computed sanity check", () => {
    expect(meleeMaxHit(58, 0)).toBe(6);
    expect(meleeMaxHit(132, 100)).toBe(34);
  });

  it("rangedMaxHit hand-computed sanity check", () => {
    expect(rangedMaxHit(132, 100)).toBe(34);
  });

  it("magicMaxHit applies damage percent and floors", () => {
    expect(magicMaxHit(24, 27)).toBe(30);
    expect(magicMaxHit(24, 0)).toBe(24);
  });

  it("npcDefenceRoll matches (defLevel+9)*(bonus+64)", () => {
    expect(npcDefenceRoll(214, 26)).toBe(223 * 90);
  });

  it("hitChance branches correctly when attack roll exceeds defence roll", () => {
    expect(hitChance(20664, 12426)).toBeCloseTo(0.6993, 3);
  });

  it("hitChance branches correctly when defence roll exceeds attack roll", () => {
    expect(hitChance(1000, 5000)).toBeCloseTo(1000 / (2 * 5001), 4);
  });

  it("dpsFromHitChance combines hit chance, max hit, and attack speed", () => {
    expect(dpsFromHitChance(0.5, 30, 5)).toBeCloseTo((0.5 * 15) / (5 * 0.6), 4);
  });
});

describe("Osmumten's fang accuracy", () => {
  // Ground truth: the exact discrete mechanic the closed form is derived from.
  // Two independent attack rolls in {0..A}, one defence roll in {0..D}; a hit
  // lands if either attack roll exceeds the (shared) defence roll.
  function fangBruteForce(A: number, D: number): number {
    let total = 0;
    for (let dr = 0; dr <= D; dr++) {
      const leq = Math.min(dr + 1, A + 1); // attack rolls in {0..A} that are ≤ dr
      const pFail = leq / (A + 1); // single-roll P(attRoll ≤ dr)
      total += 1 - pFail * pFail; // P(at least one of two rolls beats dr)
    }
    return total / (D + 1);
  }

  it("closed form matches the exact discrete two-roll model", () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [0, 0], [1, 1], [5, 5], [10, 3], [3, 10],
      [100, 100], [20664, 12426], [12426, 20664], [1, 50], [50, 1],
    ];
    for (const [A, D] of cases) {
      expect(fangHitChance(A, D)).toBeCloseTo(fangBruteForce(A, D), 9);
    }
  });

  it("never undershoots a single accuracy roll, and strictly beats it when missable", () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [20664, 12426], [5000, 8000], [100, 100], [1, 1],
    ];
    for (const [A, D] of cases) {
      expect(fangHitChance(A, D)).toBeGreaterThanOrEqual(hitChance(A, D) - 1e-12);
    }
    // vs the existing hitChance(20664, 12426) ≈ 0.6993 sanity value above.
    expect(fangHitChance(20664, 12426)).toBeGreaterThan(hitChance(20664, 12426));
  });
});

describe("Conditional multipliers", () => {
  const NO_FLAGS = {
    dragonHunterCrossbow: false,
    dragonHunterLance: false,
    dragonHunterWand: false,
    salveAmuletEi: false,
    salveAmulet: false,
    demonbane: false,
  };

  it("emits no factors when no flags are set", () => {
    const m = conditionalMultipliers(undefined);
    expect(m.accuracy).toEqual([]);
    expect(m.damage).toEqual([]);
  });

  it("DHCB applies 13/10 accuracy and 5/4 damage (asymmetric)", () => {
    const m = conditionalMultipliers({ ...NO_FLAGS, dragonHunterCrossbow: true });
    expect(m.accuracy).toEqual([
      expect.objectContaining({ numerator: 13, denominator: 10 }),
    ]);
    expect(m.damage).toEqual([
      expect.objectContaining({ numerator: 5, denominator: 4 }),
    ]);
  });

  it("DHCB + Salve(ei) stacks sequentially with intermediate trunc", () => {
    // Reproduces the ranged-end calibration: base maxHit 38 → floor(×5/4)=47 → floor(×6/5)=56.
    const m = conditionalMultipliers({
      ...NO_FLAGS,
      dragonHunterCrossbow: true,
      salveAmuletEi: true,
    });
    expect(applyFactors(38, m.damage)).toBe(56);
    // And for attack roll, 38304 → floor(×13/10)=49795 → floor(×6/5)=59754.
    expect(applyFactors(38304, m.accuracy)).toBe(59754);
  });

  it("demonbane (Arclight/Emberlight) applies +70% ADDITIVELY", () => {
    const m = conditionalMultipliers({ ...NO_FLAGS, demonbane: true });
    // additive: 100 + trunc(100×70/100) = 170
    expect(applyFactors(100, m.accuracy)).toBe(170);
    expect(applyFactors(100, m.damage)).toBe(170);
  });

  it("regular/imbued Salve is ×7/6, distinct from the enchanted ×6/5", () => {
    const m = conditionalMultipliers({ ...NO_FLAGS, salveAmulet: true });
    expect(applyFactors(60, m.damage)).toBe(70); // trunc(60×7/6)=70
    // enchanted variant is stronger
    const ei = conditionalMultipliers({ ...NO_FLAGS, salveAmuletEi: true });
    expect(applyFactors(60, ei.damage)).toBe(72); // trunc(60×6/5)=72
  });
});

describe("Multi-hit weapons — expectedMultiHitDamage", () => {
  // Baseline: a single normal hit's expected damage is accuracy × maxHit/2.
  const single = (p: number, M: number) => p * (M / 2);

  it("two independent halves are mean-neutral (Sulphur/Torag/Temotli/Tecpatl)", () => {
    const profile = [{ maxFraction: 0.5 }, { maxFraction: 0.5 }];
    for (const [p, M] of [[0.3, 40], [0.7, 55], [1, 30]] as const) {
      expect(expectedMultiHitDamage(profile, p, M)).toBeCloseTo(single(p, M), 9);
    }
  });

  it("sequential halves (Dual macuahuitl) yield (M/4)·p·(1+p) — below a single hit", () => {
    const profile = [{ maxFraction: 0.5 }, { maxFraction: 0.5, requiresPrevious: true }];
    for (const [p, M] of [[0.5, 40], [0.8, 50]] as const) {
      expect(expectedMultiHitDamage(profile, p, M)).toBeCloseTo((M / 4) * p * (1 + p), 9);
      // strictly less than a single combined hit whenever there's a miss chance
      expect(expectedMultiHitDamage(profile, p, M)).toBeLessThan(single(p, M));
    }
  });

  it("Scythe (3 independent hits 100/50/25%) is exactly 1.75× a single hit", () => {
    const profile = [{ maxFraction: 1 }, { maxFraction: 0.5 }, { maxFraction: 0.25 }];
    for (const [p, M] of [[0.6, 48], [0.9, 60]] as const) {
      expect(expectedMultiHitDamage(profile, p, M)).toBeCloseTo(1.75 * single(p, M), 9);
    }
  });

  it("Dark bow (two full independent hits) is exactly 2× a single hit", () => {
    const profile = [{ maxFraction: 1 }, { maxFraction: 1 }];
    expect(expectedMultiHitDamage(profile, 0.5, 40)).toBeCloseTo(2 * single(0.5, 40), 9);
  });
});

describe("calculateDps end-to-end", () => {
  it("produces a positive DPS for a basic melee scenario", () => {
    const result = calculateDps({
      style: "melee",
      attackStyle: "aggressive",
      prayers: {
        attackMultiplier: 1.2,
        strengthMultiplier: 1.23,
        rangedAttackMultiplier: 1,
        rangedStrengthMultiplier: 1,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      },
      skills: {
        attack: 99,
        strength: 99,
        defence: 99,
        ranged: 1,
        magic: 1,
        hitpoints: 99,
        prayer: 99,
      },
      attackBonus: 100,
      strengthBonus: 100,
      attackSpeedTicks: 4,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 50,
    });
    expect(result.maxHit).toBeGreaterThan(0);
    expect(result.dps).toBeGreaterThan(0);
    expect(result.accuracy).toBeGreaterThan(0);
    expect(result.accuracy).toBeLessThanOrEqual(1);
  });

  it("DHCB multiplier increases DPS for the same loadout", () => {
    const base = {
      style: "ranged" as const,
      attackStyle: "rapid" as const,
      prayers: {
        attackMultiplier: 1,
        strengthMultiplier: 1,
        rangedAttackMultiplier: 1.2,
        rangedStrengthMultiplier: 1.23,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      },
      skills: {
        attack: 1,
        strength: 1,
        defence: 1,
        ranged: 99,
        magic: 1,
        hitpoints: 99,
        prayer: 99,
      },
      attackBonus: 200,
      strengthBonus: 100,
      attackSpeedTicks: 6,
      targetDefenceLevel: 214,
      targetDefenceBonusForStyle: 26,
    };
    const without = calculateDps(base);
    const withDhcb = calculateDps({
      ...base,
      conditionalBonuses: {
        dragonHunterCrossbow: true,
        dragonHunterLance: false,
        dragonHunterWand: false,
        salveAmuletEi: false,
        salveAmulet: false,
        demonbane: false,
      },
    });
    expect(withDhcb.dps).toBeGreaterThan(without.dps);
  });

  it("ranged 'rapid' attack style speeds up the weapon by 1 tick", () => {
    const base = {
      style: "ranged" as const,
      prayers: {
        attackMultiplier: 1,
        strengthMultiplier: 1,
        rangedAttackMultiplier: 1.2,
        rangedStrengthMultiplier: 1.23,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      },
      skills: {
        attack: 1,
        strength: 1,
        defence: 1,
        ranged: 99,
        magic: 1,
        hitpoints: 99,
        prayer: 99,
      },
      attackBonus: 150,
      strengthBonus: 80,
      attackSpeedTicks: 6,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 30,
    };
    const accurate = calculateDps({ ...base, attackStyle: "accurate" });
    const rapid = calculateDps({ ...base, attackStyle: "rapid" });
    expect(rapid.dps).toBeGreaterThan(accurate.dps);
  });

  it("slayer helm (i) on-task applies ×7/6 melee and ×23/20 ranged to acc + damage", () => {
    const prayers = {
      attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    };
    const skills = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };
    const meleeBase = {
      style: "melee" as const, attackStyle: "aggressive" as const, prayers, skills,
      attackBonus: 100, strengthBonus: 100, attackSpeedTicks: 4,
      targetDefenceLevel: 150, targetDefenceBonusForStyle: 40,
    };
    const mOff = calculateDps(meleeBase);
    const mOn = calculateDps({ ...meleeBase, slayerOnTask: true });
    expect(mOn.maxHit).toBe(Math.trunc((mOff.maxHit * 7) / 6)); // ×7/6 melee
    expect(mOn.dps).toBeGreaterThan(mOff.dps); // accuracy also rises

    const rangedBase = { ...meleeBase, style: "ranged" as const, attackStyle: "rapid" as const };
    const rOff = calculateDps(rangedBase);
    const rOn = calculateDps({ ...rangedBase, slayerOnTask: true });
    expect(rOn.maxHit).toBe(Math.trunc((rOff.maxHit * 23) / 20)); // ×23/20 ranged
  });

  it("Tumeken's shadow triples gear magic attack + damage, capped at 100%", () => {
    const base = {
      style: "magic" as const,
      attackStyle: "accurate" as const,
      prayers: {
        attackMultiplier: 1,
        strengthMultiplier: 1,
        rangedAttackMultiplier: 1,
        rangedStrengthMultiplier: 1,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      },
      skills: {
        attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99,
      },
      attackBonus: 30, // gear magic attack bonus
      strengthBonus: 0,
      magicDamagePercent: 20, // gear magic damage %
      baseSpellMaxHit: 34, // shadow's base max hit at 99
      attackSpeedTicks: 5,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 0,
    };
    const normal = calculateDps(base);
    const shadow = calculateDps({ ...base, shadowEquipped: true });
    expect(normal.maxHit).toBe(40); // floor(34 × 1.20)
    expect(shadow.maxHit).toBe(54); // gear 20%×3 = 60% → floor(34 × 1.60)
    expect(shadow.accuracy).toBeGreaterThan(normal.accuracy); // attack bonus ×3
    expect(shadow.dps).toBeGreaterThan(normal.dps);
    // 40% gear → ×3 = 120% → capped to 100% → floor(34 × 2.0)
    const capped = calculateDps({ ...base, magicDamagePercent: 40, shadowEquipped: true });
    expect(capped.maxHit).toBe(68);
  });

  it("Osmumten's fang raises DPS through accuracy only — max hit is unchanged", () => {
    const base = {
      style: "melee" as const,
      attackStyle: "aggressive" as const,
      prayers: {
        attackMultiplier: 1.2,
        strengthMultiplier: 1.23,
        rangedAttackMultiplier: 1,
        rangedStrengthMultiplier: 1,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      },
      skills: {
        attack: 99,
        strength: 99,
        defence: 99,
        ranged: 1,
        magic: 1,
        hitpoints: 99,
        prayer: 99,
      },
      attackBonus: 105,
      strengthBonus: 103,
      attackSpeedTicks: 5,
      targetDefenceLevel: 200,
      targetDefenceBonusForStyle: 60,
    };
    const without = calculateDps(base);
    const withFang = calculateDps({ ...base, fangEquipped: true });
    // Damage trim (15%–85%) is symmetric, so the mean — and thus max hit — holds.
    expect(withFang.maxHit).toBe(without.maxHit);
    expect(withFang.accuracy).toBeGreaterThan(without.accuracy);
    expect(withFang.dps).toBeGreaterThan(without.dps);
  });
});
