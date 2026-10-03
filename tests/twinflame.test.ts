import { describe, expect, it } from "vitest";
import {
  bestSpell,
  SPELLS_BY_NAME,
  spellEffectiveMaxHit,
  spellExpectedHit,
} from "@/data/spells/catalog";
import { calculateDps } from "@/lib/dps/calculate";
import { twinflameDamage } from "@/lib/dps/twinflame";

describe("Twinflame staff — spell selection", () => {
  it("Twinflame restricts the auto-pick to Standard spells; Fire Wave (mean 287/21 ≈ 13.7) beats Fire Surge (24 → 12, no double-cast)", () => {
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [], twinflame: true });
    expect(spell?.name).toBe("Fire Wave");
  });

  it("Twinflame winner is always a qualifying Bolt/Blast/Wave, never a Surge/Strike", () => {
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [], twinflame: true });
    expect(/(Bolt|Blast|Wave)$/.test(spell?.name ?? "")).toBe(true);
  });

  it("without Twinflame, the staff is unconstrained, so a higher-max Ancient spell can win", () => {
    // Contrast: no Twinflame means no spellbook restriction → Ice Barrage (30) tops Fire Surge (24).
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [] });
    expect(spell?.name).toBe("Ice Barrage");
  });

  it("ranks by the exact mean, not 7/10 of the max: Fire Wave 20 → max 28, mean 287/21", () => {
    // Σ_{h=0..20} h = 210; Σ trunc(2h/5) = 76 (blocks of five: 2, 12, 22, 32, then 8);
    // the landed 0 is raised to 1 before the split: +1.
    const ctx = { magicLevel: 99, targetAttributes: [], twinflame: true };
    const fireWave = SPELLS_BY_NAME.get("Fire Wave")!;
    const fireSurge = SPELLS_BY_NAME.get("Fire Surge")!;
    expect(spellEffectiveMaxHit(fireWave, ctx)).toBe(28); // 20 + trunc(20 × 4/10)
    expect(spellExpectedHit(fireWave, ctx)).toBeCloseTo(287 / 21, 12); // not 28/2 = 14
    expect(spellExpectedHit(fireSurge, ctx)).toBe(12); // Surge gets no second cast
    expect(spellExpectedHit(fireWave, { ...ctx, twinflame: false })).toBe(10);
  });
});

describe("twinflameDamage — hitsplats [h, trunc(h × 4/10)], h uniform over 0..M", () => {
  // trunc(2h/5) over h = 0..4 is 0,0,0,1,1 and rises by 2 every five rolls.
  // wgloop raises a landed first cast of 0 to 1 BEFORE the split ([1, 0]),
  // so every first-cast sum gains 1.
  it("M = 10: max 14, mean (55 + 1 + 18)/11 = 74/11 (the ×7/5 mean said 7)", () => {
    const r = twinflameDamage(10);
    expect(r.maxHit).toBe(14);
    expect(r.meanLanded).toBeCloseTo(74 / 11, 12);
  });

  it("M = 25 (Graardor oracle row): max 35, mean (325 + 1 + 120)/26 = 446/26, ~0.35 below 17.5", () => {
    const r = twinflameDamage(25);
    expect(r.maxHit).toBe(35);
    expect(r.meanLanded).toBeCloseTo(446 / 26, 12);
  });

  it("M = 28 (spectre / abyssal demon oracle rows): max 39, mean (406 + 1 + 151)/29 = 558/29", () => {
    const r = twinflameDamage(28);
    expect(r.maxHit).toBe(39);
    expect(r.meanLanded).toBeCloseTo(558 / 29, 12);
  });

  it("M = 0 deals nothing", () => {
    expect(twinflameDamage(0)).toEqual({ maxHit: 0, meanLanded: 0 });
  });

  it("corp halving hits each hitsplat: M = 33 → 16 + 6 = 22 (not trunc(46/2) = 23), mean (272 + 99)/34", () => {
    // Σ trunc(h/2) = 2 × (0+…+16) = 272; Σ trunc(trunc(2h/5)/2) = 5 × (0+…+5) + 4 × 6 = 99.
    // The raised 0 halves back to 0: the halving runs after the raise.
    const r = twinflameDamage(33, { halved: true });
    expect(r.maxHit).toBe(22);
    expect(r.meanLanded).toBeCloseTo(371 / 34, 12);
  });

  it("a phase factor hits each hitsplat: TD shield ×4/5 at M = 28 → 22 + 8 = 30 (not trunc(39 × 4/5) = 31), mean (313 + 110)/29", () => {
    // Σ trunc(4h/5): blocks of five sum to 20k + 6 → 230, then h = 25..28: 20+20+21+22 = 83.
    // Σ trunc(4·trunc(2h/5)/5): blocks 0, 7, 17, 22, 32, then h = 25..28: 8×4 = 32.
    const r = twinflameDamage(28, { damageFactor: [4, 5] });
    expect(r.maxHit).toBe(30);
    expect(r.meanLanded).toBeCloseTo(423 / 29, 12);
  });

  it("the TD shield's minimum 1 keeps a hitsplat of 1 at 1: M = 28 → mean (315 + 112)/29", () => {
    // wgloop multiplyTransformer(4, 5, 1). First cast: the raised 0 and the
    // rolled 1 stay 1 instead of trunc(4/5) = 0 (313 + 2). Second: trunc(2h/5)
    // = 1 at h = 3, 4 stays 1 (110 + 2); a 0 is never raised there.
    const r = twinflameDamage(28, { damageFactor: [4, 5], damageMinimum: 1 });
    expect(r.maxHit).toBe(30);
    expect(r.meanLanded).toBeCloseTo(427 / 29, 12);
  });

  it("Mad Angel Sword Cleave floors BOTH hitsplats at trunc(14/2) = 7: M = 10 → mean (83 + 77)/11, max 10 + 7", () => {
    // First: rolls 0..7 → 7 (8 × 7 = 56) + 8 + 9 + 10 = 83. Second: trunc(2h/5) ≤ 4 → always 7.
    const r = twinflameDamage(10, { minHitFactor: [1, 2] });
    expect(r.maxHit).toBe(17);
    expect(r.meanLanded).toBeCloseTo(160 / 11, 12);
  });

  it("Mad Angel Perfect Lightning maxes only the FIRST hitsplat: M = 10 → mean 10 + 18/11", () => {
    const r = twinflameDamage(10, { minHitFactor: [1, 1] });
    expect(r.maxHit).toBe(14);
    expect(r.meanLanded).toBeCloseTo(128 / 11, 12);
  });
});

describe("Twinflame staff — DPS engine", () => {
  const magicBase = {
    style: "magic" as const,
    attackStyle: "accurate" as const,
    prayers: {
      attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    },
    skills: { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99 },
    attackBonus: 30,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit: 20, // Fire Wave
    spellElement: "fire" as const,
    attackSpeedTicks: 5,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
  };
  const SECONDS_PER_ATTACK = 5 * 0.6;

  it("+10% accuracy & damage on a standard cast", () => {
    const off = calculateDps(magicBase);
    const on = calculateDps({ ...magicBase, smokeStaffStandard: true });
    expect(on.maxHit).toBe(22); // trunc(20 × 11/10)
    expect(on.accuracy).toBeGreaterThan(off.accuracy);
  });

  it("second cast adds ~40% damage on a qualifying spell (stacks on the +10%)", () => {
    const both = calculateDps({
      ...magicBase,
      smokeStaffStandard: true,
      twinflameDoubleCast: true,
    });
    expect(both.maxHit).toBe(30); // 22 + trunc(22 × 4/10)
  });

  it("raises DPS over a plain staff casting the same spell", () => {
    const plain = calculateDps(magicBase);
    const twin = calculateDps({ ...magicBase, smokeStaffStandard: true, twinflameDoubleCast: true });
    expect(twin.dps).toBeGreaterThan(plain.dps);
  });

  it("DPS uses the exact mean: first cast 25 → max 35, accuracy × 446/26 per cast (×7/5 said 17.5)", () => {
    const r = calculateDps({ ...magicBase, magicDamagePercent: 25, twinflameDoubleCast: true });
    expect(r.maxHit).toBe(35); // 20 + trunc(20 × 25%) = 25 → 25 + 10
    // The raised 0 is in the per-hitsplat mean, not added a second time.
    expect(r.dps).toBeCloseTo((r.accuracy * 446) / 26 / SECONDS_PER_ATTACK, 12);
    expect(r.dps).toBeLessThan((r.accuracy * 35) / 2 / SECONDS_PER_ATTACK);
  });

  it("a phase factor scales each hitsplat: TD shield ×4/5 on first cast 28 → max 30, accuracy × 423/29", () => {
    const r = calculateDps({
      ...magicBase, magicDamagePercent: 40, twinflameDoubleCast: true, targetDamageFactor: [4, 5],
    });
    expect(r.maxHit).toBe(30); // 22 + 8, not trunc(39 × 4/5) = 31
    expect(r.dps).toBeCloseTo((r.accuracy * 423) / 29 / SECONDS_PER_ATTACK, 12);
  });

  it("Mad Angel Sword Cleave on first cast 10: always lands, mean 160/11, max 17", () => {
    const r = calculateDps({
      ...magicBase, baseSpellMaxHit: 10, twinflameDoubleCast: true,
      targetAlwaysHit: true, targetMinHitFactor: [1, 2],
    });
    expect(r.accuracy).toBe(1);
    expect(r.maxHit).toBe(17);
    expect(r.dps).toBeCloseTo(160 / 11 / SECONDS_PER_ATTACK, 12);
  });

  it("an immune target still zeroes the double cast", () => {
    const r = calculateDps({ ...magicBase, twinflameDoubleCast: true, targetImmune: true });
    expect(r).toMatchObject({ dps: 0, maxHit: 0 });
  });
});
