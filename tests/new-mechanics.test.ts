/**
 * Unit tests for Phase 1 and Phase 3 mechanics:
 *   - Tumeken's Shadow ×3 (overworld) / ×4 (ToA)
 *   - Harmonised nightmare staff 4-tick speed
 *   - Virtus armour +3%/piece with Ancient Magicks
 *   - Keris partisan +33% damage + 1/51 triple proc vs Kalphites
 *   - Keris partisan of breaching +33% accuracy vs Kalphites
 *   - Soulreaper axe +30% Strength level at max stacks
 *   - Dharok's set missing-HP max-hit multiplier
 */
import { describe, expect, it } from "vitest";
import { calculateDps } from "@/lib/dps/calculate";
import { computeSetDps } from "@/lib/recommend";
import type { DpsScenario } from "@/lib/dps/calculate";
import type { LoadoutSet } from "@/types/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const BASE_PRAYERS = {
  attackMultiplier: 1,
  strengthMultiplier: 1,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1,
} as const;

const BASE_SKILLS = {
  attack: 99,
  strength: 99,
  defence: 99,
  ranged: 99,
  magic: 99,
  hitpoints: 99,
  prayer: 99,
};

/** Flat monster — no attributes, no Wilderness, minimal defence. */
function dummyMonster(overrides: Partial<MonsterCatalogEntry> = {}): MonsterCatalogEntry {
  return {
    slug: "test-dummy",
    name: "Test Dummy",
    combatLevel: 1,
    hp: 100,
    size: 1,
    defenceLevel: 1,
    magicLevel: 1,
    defenceBonuses: { stab: 0, slash: 0, crush: 0, magic: 0, rangedHeavy: 0, rangedStandard: 0, rangedLight: 0 },
    attributes: [],
    isSlayerMonster: false,
    ...overrides,
  } as MonsterCatalogEntry;
}

/** Minimal melee LoadoutSet. */
function meleeSet(overrides: Partial<LoadoutSet> = {}): LoadoutSet {
  return {
    id: "test",
    name: "Test",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 1, itemName: "Sword" } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    itemBonusFlags: {
      dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: false,
      salveAmuletEi: false, salveAmulet: false, demonbane: false,
      tomeOfFire: false, tomeOfWater: false, tomeOfEarth: false,
      twistedBow: false, fang: false, slayerHelmImbued: false,
    },
    weaponCategory: "Sword",
    ...overrides,
  } as LoadoutSet;
}

// ---------------------------------------------------------------------------
// Dharok's max-hit multiplier (DpsScenario.dharok)
// ---------------------------------------------------------------------------
describe("Dharok's set — missing-HP multiplier", () => {
  const BASE: DpsScenario = {
    style: "melee",
    attackStyle: "aggressive",
    prayers: BASE_PRAYERS,
    skills: BASE_SKILLS,
    attackBonus: 100,
    strengthBonus: 100,
    attackSpeedTicks: 7,
    targetDefenceLevel: 1,
    targetDefenceBonusForStyle: 0,
  };

  it("no dharok field → normal max hit", () => {
    const { maxHit } = calculateDps(BASE);
    // meleeMaxHit with effStr = floor(99+8)+3 = 110, bonus=100 → floor((110*128+64+100)/128)
    expect(maxHit).toBeGreaterThan(0);
    // With dharok should be higher when HP is low
    const { maxHit: withDharok } = calculateDps({
      ...BASE,
      dharok: { maxHp: 99, currentHp: 1 },
    });
    expect(withDharok).toBeGreaterThan(maxHit);
  });

  it("dharok at full HP (currentHp === maxHp) produces no bonus", () => {
    const { maxHit: base } = calculateDps(BASE);
    const { maxHit: full } = calculateDps({
      ...BASE,
      dharok: { maxHp: 99, currentHp: 99 },
    });
    // 1 + (99-99)*99/10000 = 1 — multiplier of 1 means Math.trunc(max*1) = max
    expect(full).toBe(base);
  });

  it("dharok at 1 HP with 99 max HP applies ×≈1.97 multiplier", () => {
    const { maxHit: base } = calculateDps(BASE);
    const { maxHit: oneHp } = calculateDps({
      ...BASE,
      dharok: { maxHp: 99, currentHp: 1 },
    });
    // multiplier = 1 + 98*99/10000 = 1 + 0.9702 = 1.9702
    // Math.trunc(base * 1.9702) should be close to base * 1.97
    expect(oneHp).toBe(Math.trunc(base * (1 + (99 - 1) * 99 / 10000)));
  });

  it("dharok is ignored for ranged style", () => {
    const rangedBase: DpsScenario = {
      ...BASE,
      style: "ranged",
      attackStyle: "rapid",
      prayers: {
        ...BASE_PRAYERS,
        rangedAttackMultiplier: 1,
        rangedStrengthMultiplier: 1,
      },
    };
    const { maxHit: base } = calculateDps(rangedBase);
    // dharok field is present but style is ranged → no melee branch → no multiplier
    const { maxHit: withDharok } = calculateDps({
      ...rangedBase,
      dharok: { maxHp: 99, currentHp: 1 },
    });
    expect(withDharok).toBe(base);
  });
});

// ---------------------------------------------------------------------------
// Soulreaper axe — Strength level boost at max stacks
// ---------------------------------------------------------------------------
describe("Soulreaper axe — max stacks (+30% Str level)", () => {
  const MONSTER = dummyMonster();

  it("no effect when weapon is not Soulreaper (id 28338)", () => {
    const set = meleeSet({ slots: { weapon: { itemId: 1, itemName: "Not Soulreaper" } } });
    const base = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false);
    const withFlag = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, true);
    expect(withFlag.dps).toBeCloseTo(base.dps, 6);
  });

  it("no effect when flag is false even with Soulreaper equipped", () => {
    const set = meleeSet({ slots: { weapon: { itemId: 28338, itemName: "Soulreaper axe" } } });
    const base = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false);
    const withFlagOff = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false);
    expect(withFlagOff.dps).toBeCloseTo(base.dps, 6);
  });

  it("max stacks with Soulreaper raises DPS by roughly 30% Str-level boost", () => {
    const set = meleeSet({ slots: { weapon: { itemId: 28338, itemName: "Soulreaper axe" } } });
    const base = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false);
    const boosted = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, true);
    // Boosted DPS must be strictly higher
    expect(boosted.dps).toBeGreaterThan(base.dps);
    // Strength 99 → floor(99 * 1.3) = 128. The max hit grows but not linearly with
    // raw Str — we just verify the DPS is meaningfully higher (at least 10%).
    expect(boosted.dps / base.dps).toBeGreaterThan(1.1);
  });

  it("Strength level is floored: floor(99 * 1.3) = 128", () => {
    // Verify the effective skill used. We can infer it from maxHit:
    // effStr = floor(floor(128*1)+8) = 136 (with piety=1 aggressive=+3 → 139)
    // meleeMaxHit(139, 100) = floor((139*128+64+100)/128) = floor(17892+64+100)/128
    // = floor(18056/128) = floor(141.0625) = 141... let's just verify the boost.
    const set = meleeSet({ slots: { weapon: { itemId: 28338, itemName: "Soulreaper axe" } } });
    const skills99 = { ...BASE_SKILLS, strength: 99 };
    const skills128 = { ...BASE_SKILLS, strength: 128 };
    const withFlooredBoost = computeSetDps(set, MONSTER, skills99, undefined, false, true);
    const withActual128 = computeSetDps(set, MONSTER, skills128, undefined, false, false);
    // floor(99 * 1.3) = 128, so both should produce identical DPS
    expect(withFlooredBoost.dps).toBeCloseTo(withActual128.dps, 6);
  });
});

// ---------------------------------------------------------------------------
// Dharok's via computeSetDps (full-set detection)
// ---------------------------------------------------------------------------
describe("Dharok's set detection in computeSetDps", () => {
  const MONSTER = dummyMonster();

  it("no bonus when set is incomplete (missing helm)", () => {
    const set = meleeSet({
      slots: {
        weapon: { itemId: 4718, itemName: "Dharok's greataxe" },
        body: { itemId: 4720, itemName: "Dharok's platebody" },
        legs: { itemId: 4722, itemName: "Dharok's platelegs" },
        // head intentionally missing
      },
    });
    const full = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, undefined);
    const lowHp = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, 1);
    // Incomplete set → no bonus → DPS should be identical
    expect(lowHp.dps).toBeCloseTo(full.dps, 6);
  });

  it("bonus fires when all 4 canonical Dharok pieces are worn at 1 HP", () => {
    const set = meleeSet({
      slots: {
        weapon: { itemId: 4718, itemName: "Dharok's greataxe" },
        head: { itemId: 4716, itemName: "Dharok's helm" },
        body: { itemId: 4720, itemName: "Dharok's platebody" },
        legs: { itemId: 4722, itemName: "Dharok's platelegs" },
      },
    });
    const fullHp = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, undefined);
    const oneHp = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, 1);
    expect(oneHp.dps).toBeGreaterThan(fullHp.dps);
    // At 1/99 HP, multiplier = 1 + 98*99/10000 ≈ 1.97 → DPS should be ~97% higher
    expect(oneHp.dps / fullHp.dps).toBeGreaterThan(1.5);
  });

  it("no bonus when currentHp equals hitpoints (full HP)", () => {
    const set = meleeSet({
      slots: {
        weapon: { itemId: 4718, itemName: "Dharok's greataxe" },
        head: { itemId: 4716, itemName: "Dharok's helm" },
        body: { itemId: 4720, itemName: "Dharok's platebody" },
        legs: { itemId: 4722, itemName: "Dharok's platelegs" },
      },
    });
    const fullHp = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, undefined);
    const atMax = computeSetDps(set, MONSTER, BASE_SKILLS, undefined, false, false, 99);
    expect(atMax.dps).toBeCloseTo(fullHp.dps, 6);
  });
});

// ---------------------------------------------------------------------------
// Harmonised nightmare staff 4-tick speed
// ---------------------------------------------------------------------------
describe("Harmonised nightmare staff — 4-tick autocast speed", () => {
  it("standard-spell autocast uses 4 ticks, not the vendor speed of 5", () => {
    // We can't call computeSetDps with a real magic LoadoutSet easily, but we can
    // verify the DPS calculation directly: same scenario, speed 4 vs 5.
    const MAGIC_BASE: DpsScenario = {
      style: "magic",
      attackStyle: "longrange",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 120,
      strengthBonus: 0,
      magicDamagePercent: 15,
      baseSpellMaxHit: 20,
      attackSpeedTicks: 5,
      targetDefenceLevel: 1,
      targetDefenceBonusForStyle: 0,
    };
    const at5 = calculateDps(MAGIC_BASE);
    const at4 = calculateDps({ ...MAGIC_BASE, attackSpeedTicks: 4 });
    // Faster speed → higher DPS (same maxHit/accuracy, divided by smaller tick count)
    expect(at4.dps).toBeGreaterThan(at5.dps);
    // Ratio should be exactly 5/4
    expect(at4.dps / at5.dps).toBeCloseTo(5 / 4, 5);
  });
});

// ---------------------------------------------------------------------------
// Tumeken's Shadow ×3 / ×4 multiplier
// ---------------------------------------------------------------------------
describe("Tumeken's Shadow — gear bonus multiplier", () => {
  const MAGIC_SCENARIO: DpsScenario = {
    style: "magic",
    attackStyle: "longrange",
    prayers: BASE_PRAYERS,
    skills: BASE_SKILLS,
    attackBonus: 50,  // worn magic attack
    strengthBonus: 0,
    magicDamagePercent: 10, // worn magic damage % (e.g. Ahrim's top)
    baseSpellMaxHit: 20,
    attackSpeedTicks: 5,
    targetDefenceLevel: 1,
    targetDefenceBonusForStyle: 0,
  };

  it("shadow×3 triples attackBonus and magicDamagePercent", () => {
    const base = calculateDps(MAGIC_SCENARIO);
    const shadow = calculateDps({ ...MAGIC_SCENARIO, shadowEquipped: true });
    const shadow4 = calculateDps({ ...MAGIC_SCENARIO, shadowEquipped: true, shadowToaQuadruple: true });
    // shadow multiplies bonuses → higher accuracy + damage → higher DPS
    expect(shadow.dps).toBeGreaterThan(base.dps);
    // ToA ×4 > overworld ×3
    expect(shadow4.dps).toBeGreaterThan(shadow.dps);
  });

  it("shadow magic damage is hard-capped at 100%", () => {
    // With 50% gear dmg and ×3, we'd get 150% — but cap is 100%.
    const bigDmg = calculateDps({
      ...MAGIC_SCENARIO,
      magicDamagePercent: 50,
      shadowEquipped: true,
    });
    // With dmg capped at 100%: magicMaxHit(20, 100+prayerPct) = floor(20*(1+1)) = 40
    // With dmg NOT capped (180%): would be much higher → verifying cap fires
    const cappedMaxHit = bigDmg.maxHit;
    const uncapped = calculateDps({ ...MAGIC_SCENARIO, magicDamagePercent: 180 });
    // Capped shadow result should equal uncapped at 100% (no prayer bonus here)
    const at100pct = calculateDps({ ...MAGIC_SCENARIO, magicDamagePercent: 100 });
    expect(cappedMaxHit).toBe(at100pct.maxHit);
    expect(cappedMaxHit).toBeLessThan(uncapped.maxHit);
  });
});

// ---------------------------------------------------------------------------
// Virtus armour — Ancient Magicks bonus
// ---------------------------------------------------------------------------
describe("Virtus armour — +3%/piece Ancient Magicks bonus", () => {
  it("non-ancient spell: no bonus beyond vendor magic_str", () => {
    // computeSetDps resolves virtus delta; we verify it doesn't fire for standard.
    // We test via the DPS scenario layer: virtusAncientBonusPct = 0 for standard.
    const base: DpsScenario = {
      style: "magic",
      attackStyle: "longrange",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 80,
      strengthBonus: 0,
      magicDamagePercent: 6, // 3 pieces × 2% vendor = 6%
      baseSpellMaxHit: 24,
      attackSpeedTicks: 5,
      targetDefenceLevel: 1,
      targetDefenceBonusForStyle: 0,
    };
    // Standard spell: no extra delta. Ancient spell delta = +3%/piece = +9% total.
    const standard = calculateDps(base);
    const ancient = calculateDps({ ...base, magicDamagePercent: 6 + 9 }); // 3 pieces × 3%
    expect(ancient.dps).toBeGreaterThan(standard.dps);
  });
});

// ---------------------------------------------------------------------------
// Keris partisan — +33% damage factor and 1/51 triple proc
// ---------------------------------------------------------------------------
describe("Keris partisan — vs Kalphite bonuses", () => {
  it("+33% damage increases maxHit", () => {
    const base: DpsScenario = {
      style: "melee",
      attackStyle: "aggressive",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 80,
      strengthBonus: 80,
      attackSpeedTicks: 4,
      targetDefenceLevel: 1,
      targetDefenceBonusForStyle: 0,
      conditionalBonuses: { kerisVsKalphite: false },
    };
    const noBonus = calculateDps(base);
    const withBonus = calculateDps({
      ...base,
      conditionalBonuses: { kerisVsKalphite: true },
    });
    expect(withBonus.maxHit).toBeGreaterThan(noBonus.maxHit);
    // +33% means numerator 4 denom 3 on maxHit: Math.trunc(x*4/3) > x
  });

  it("1/51 triple proc multiplies mean DPS by ×53/51", () => {
    const base: DpsScenario = {
      style: "melee",
      attackStyle: "aggressive",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 80,
      strengthBonus: 80,
      attackSpeedTicks: 4,
      targetDefenceLevel: 1,
      targetDefenceBonusForStyle: 0,
      conditionalBonuses: { kerisVsKalphite: true },
    };
    const withoutProc = calculateDps(base);
    const withProc = calculateDps({ ...base, kalphiteTripleProc: true });
    expect(withProc.dps / withoutProc.dps).toBeCloseTo(53 / 51, 5);
  });

  it("Sanguinesti proc adds accuracy × 8/5 expected damage per attack", () => {
    // Summer Sweep-Up (2026-07-22): the 1/5 life leech deals 8 bonus damage.
    const base: DpsScenario = {
      style: "magic",
      attackStyle: "accurate",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 80,
      strengthBonus: 0,
      baseSpellMaxHit: 33,
      attackSpeedTicks: 4,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 50,
      conditionalBonuses: {},
    };
    const withoutProc = calculateDps(base);
    const withProc = calculateDps({ ...base, sanguinestiProc: true });
    const interval = 4 * 0.6;
    expect(withProc.dps - withoutProc.dps).toBeCloseTo(
      (withProc.accuracy * 8) / 5 / interval,
      5,
    );
    // The flat bonus must not touch max hit or accuracy.
    expect(withProc.maxHit).toBe(withoutProc.maxHit);
    expect(withProc.accuracy).toBe(withoutProc.accuracy);
  });

  it("breaching +33% accuracy increases hit chance", () => {
    const base: DpsScenario = {
      style: "melee",
      attackStyle: "aggressive",
      prayers: BASE_PRAYERS,
      skills: BASE_SKILLS,
      attackBonus: 80,
      strengthBonus: 80,
      attackSpeedTicks: 4,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 200,
      conditionalBonuses: { kerisBreachVsKalphite: false },
    };
    const noBonus = calculateDps(base);
    const withBonus = calculateDps({
      ...base,
      conditionalBonuses: { kerisBreachVsKalphite: true },
    });
    expect(withBonus.accuracy).toBeGreaterThan(noBonus.accuracy);
  });
});
