import { describe, expect, it } from "vitest";
import {
  dpsFromHitChance,
  effectiveLevel,
  hitChance,
  npcDefenceRoll,
} from "@/lib/dps/common";
import { meleeMaxHit } from "@/lib/dps/melee";
import { rangedMaxHit } from "@/lib/dps/ranged";
import { magicMaxHit } from "@/lib/dps/magic";
import { applyFactors, conditionalMultipliers } from "@/lib/dps/conditional";
import { calculateDps } from "@/lib/dps/calculate";

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

describe("Conditional multipliers", () => {
  const NO_FLAGS = {
    dragonHunterCrossbow: false,
    dragonHunterLance: false,
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
});
