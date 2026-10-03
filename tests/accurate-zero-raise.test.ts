import { describe, expect, it } from "vitest";
import { landedFloorLift, scaleHitsplat } from "@/lib/dps/common";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { boltAccurateZeroes, type BoltProcSpec } from "@/lib/dps/bolts";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

// wgloop's getAttackerDist (PlayerVsNPCCalc @ 89c3e25, `accurateZeroApplicable`)
// raises every ACCURATE hitsplat of 0 to 1. On a landed roll over 0..M that
// adds 1/(M+1) to the mean: M = 10 → (55 + 1)/11, not 55/11. It runs after the
// bolt effects, Berserker, Keris and Sanguinesti, and before the Twinflame
// split, the Corp halving, ruby bolts, the Mad Angel buffs and the NPC phase
// transforms. Every expectation below is derived by hand from that order.

const NO_PRAYERS = {
  attackMultiplier: 1,
  strengthMultiplier: 1,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};

// A Fire Wave-style cast with no damage bonus: the max hit is exactly the
// spell's base hit, so M can be set directly.
function cast(baseSpellMaxHit: number, over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic",
    attackStyle: "accurate",
    prayers: NO_PRAYERS,
    skills: { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99 },
    attackBonus: 30,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit,
    attackSpeedTicks: 5,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
    ...over,
  };
}
const SECONDS = 5 * 0.6;

describe("landedFloorLift — Σ (after(floor) − after(r)) over the rolls below the floor", () => {
  it("the raise on a roll over 0..10 is 1/11: mean (55 + 1)/11", () => {
    expect(landedFloorLift(0, 10, 1)).toBeCloseTo(1 / 11, 15);
    expect(10 / 2 + landedFloorLift(0, 10, 1)).toBeCloseTo(56 / 11, 15);
  });

  it("a roll over 0..0 always lands a 0, so it always gains 1", () => {
    expect(landedFloorLift(0, 0, 1)).toBe(1);
  });

  it("seeking arrows floor at 3: (3 + 2 + 1)/(M+1)", () => {
    expect(landedFloorLift(0, 40, 3)).toBeCloseTo(6 / 41, 15);
  });

  it("a roll that starts at or above the floor gains nothing (the fang once M ≥ 7)", () => {
    expect(landedFloorLift(1, 39, 1)).toBe(0); // fang M = 40: trunc(40 × 3/20) = 6 .. 34
  });

  it("later per-hitsplat transforms decide what the lifted 1 is worth", () => {
    // Corp halves the raised 1 back to 0.
    expect(landedFloorLift(0, 10, 1, (h) => Math.trunc(h / 2))).toBe(0);
    // The TD shield (×4/5, minimum 1) keeps it at 1.
    expect(landedFloorLift(0, 10, 1, (h) => scaleHitsplat(h, [4, 5], 1))).toBeCloseTo(1 / 11, 15);
    // Seeking arrows into Corp: 3 → 1 against 0, 0, 1 for rolls 0, 1, 2.
    expect(landedFloorLift(0, 40, 3, (h) => Math.trunc(h / 2))).toBeCloseTo(2 / 41, 15);
  });
});

describe("scaleHitsplat — wgloop multiplyTransformer(n, d, minimum)", () => {
  it("truncates, and with a minimum never drops a hit below it", () => {
    expect(scaleHitsplat(1, [4, 5])).toBe(0);
    expect(scaleHitsplat(1, [4, 5], 1)).toBe(1);
    expect(scaleHitsplat(0, [4, 5], 1)).toBe(0); // below the minimum: never reduced, never raised
    expect(scaleHitsplat(28, [4, 5], 1)).toBe(22);
    expect(scaleHitsplat(1, [13, 10])).toBe(1);
  });
});

describe("calculateDps — single hit", () => {
  it("M = 10: accuracy × (55 + 1)/11 per cast, max hit still 10", () => {
    const r = calculateDps(cast(10));
    expect(r.maxHit).toBe(10);
    expect(r.dps).toBeCloseTo((r.accuracy * 56) / 11 / SECONDS, 12);
  });

  it("a 0-max spell (Bind) deals nothing — upstream returns before the raise", () => {
    expect(calculateDps(cast(0)).dps).toBe(0);
  });

  it("Corp halving runs after the raise and turns the 1 back into 0", () => {
    // Each roll halves on its own: Σ trunc(r/2) over 0..10 = 25 (see
    // tests/corp-halving.test.ts); the raised 0 adds nothing.
    const r = calculateDps(cast(10, { corpDamageHalved: true }));
    expect(r.maxHit).toBe(5);
    expect(r.dps).toBeCloseTo((r.accuracy * 25) / 11 / SECONDS, 12);
  });

  it("TD shield (×4/5, minimum 1) keeps the raised 1: M = 10 → 8/2 + 1/11", () => {
    const r = calculateDps(cast(10, { targetDamageFactor: [4, 5], targetDamageMinimum: 1 }));
    expect(r.maxHit).toBe(8);
    expect(r.dps).toBeCloseTo((r.accuracy * (4 + 1 / 11)) / SECONDS, 12);
  });

  it("Sire transition (÷2, no minimum) zeroes it: M = 10 → 5/2", () => {
    const r = calculateDps(cast(10, { targetDamageFactor: [1, 2] }));
    expect(r.dps).toBeCloseTo((r.accuracy * 5) / 2 / SECONDS, 12);
  });

  it("Hueycoatl pillar (×13/10) keeps it: M = 10 → 13/2 + 1/11", () => {
    const r = calculateDps(cast(10, { targetDamageFactor: [13, 10] }));
    expect(r.maxHit).toBe(13);
    expect(r.dps).toBeCloseTo((r.accuracy * (6.5 + 1 / 11)) / SECONDS, 12);
  });

  it("a Mad Angel Sword Cleave floor of 5 absorbs it: M = 10 → (5·6 + 10·11)/22", () => {
    const r = calculateDps(cast(10, { targetAlwaysHit: true, targetMinHitFactor: [1, 2] }));
    expect(r.dps).toBeCloseTo(140 / 22 / SECONDS, 12);
  });

  it("…but a floor of trunc(1/2) = 0 doesn't: M = 1 → rolls 0, 1 both land 1", () => {
    const r = calculateDps(cast(1, { targetAlwaysHit: true, targetMinHitFactor: [1, 2] }));
    expect(r.dps).toBeCloseTo(1 / SECONDS, 12);
  });

  it("Berserker's ×6/5 rescales the roll, so the raise uses the pre-scale max", () => {
    // Melee: the raise is 1/(M0+1) on the roll before ×6/5, not 1/(M+1) after it.
    const melee: DpsScenario = {
      style: "melee",
      attackStyle: "aggressive",
      prayers: NO_PRAYERS,
      skills: SKILLS_AT_99,
      attackBonus: 100,
      strengthBonus: 100,
      attackSpeedTicks: 5,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 0,
    };
    const plain = calculateDps(melee);
    const neck = calculateDps({ ...melee, berserkerObsidian: true });
    const m0 = plain.maxHit;
    expect(neck.maxHit).toBe(Math.trunc((m0 * 6) / 5));
    expect(neck.dps).toBeCloseTo((neck.accuracy * (neck.maxHit / 2 + 1 / (m0 + 1))) / SECONDS, 12);
  });

  it("the fang's trimmed roll has no 0 once M ≥ 7, on any style", () => {
    const melee: DpsScenario = {
      style: "melee",
      attackStyle: "aggressive",
      prayers: NO_PRAYERS,
      skills: SKILLS_AT_99,
      attackBonus: 100,
      strengthBonus: 100,
      attackSpeedTicks: 5,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 0,
      fangHitTrim: true,
    };
    const r = calculateDps(melee);
    expect(r.maxHit).toBeGreaterThanOrEqual(7);
    expect(r.dps).toBeCloseTo((r.accuracy * r.maxHit) / 2 / SECONDS, 12);
  });

  it("seeking arrows floor every landed hit at 3: + 6/(M+1)", () => {
    const ranged: DpsScenario = {
      style: "ranged",
      attackStyle: "rapid",
      prayers: NO_PRAYERS,
      skills: SKILLS_AT_99,
      attackBonus: 100,
      strengthBonus: 80,
      attackSpeedTicks: 5,
      targetDefenceLevel: 100,
      targetDefenceBonusForStyle: 0,
      seekingArrows: true,
    };
    const r = calculateDps(ranged);
    const M = r.maxHit;
    expect(r.dps).toBeCloseTo((r.accuracy * (M / 2 + 6 / (M + 1))) / (4 * 0.6), 12);
  });
});

describe("calculateDps — flat armour shifts the raised hitsplat (it runs last)", () => {
  // Upstream raises the accurate 0 in the attacker distribution; flat armour is
  // the last NPC transform, so the raised 1 lands as max(0, 1 − A).
  const melee = (over: Partial<DpsScenario>): DpsScenario => ({
    style: "melee",
    attackStyle: "aggressive",
    prayers: NO_PRAYERS,
    skills: SKILLS_AT_99,
    attackBonus: 100,
    strengthBonus: 100,
    attackSpeedTicks: 4,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
    ...over,
  });

  it("vs −2 an accurate 0 deals 3, not 2: M/2 + 2 + 1/(M+1)", () => {
    const r = calculateDps(melee({ targetFlatArmour: -2 }));
    const M = r.flatArmour!.rawMaxHit;
    expect(r.maxHit).toBe(M + 2);
    expect(r.dps).toBeCloseTo((r.accuracy * (M / 2 + 2 + 1 / (M + 1))) / (4 * 0.6), 12);
  });

  it("vs +1 the raised 1 is clipped back to 0: Σ(d − 1) over 2..M, no raise", () => {
    const r = calculateDps(melee({ targetFlatArmour: 1 }));
    const M = r.flatArmour!.rawMaxHit;
    expect(r.dps).toBeCloseTo((r.accuracy * ((M - 1) * M) / 2 / (M + 1)) / (4 * 0.6), 12);
  });

  it("diamond bolts vs −2: every accurate 0, proc rolls included, deals 3", () => {
    const diamond: BoltProcSpec = { effect: "diamond", kind: "scaledMax", chance: 0.11, effectMaxPercent: 115, accurateOnly: false };
    const r = calculateDps(melee({
      style: "ranged",
      attackStyle: "rapid",
      attackSpeedTicks: 6,
      boltProc: diamond,
      targetFlatArmour: -2,
    }));
    const a = r.accuracy;
    const M = r.flatArmour!.rawMaxHit;
    const E = Math.trunc((M * 115) / 100);
    // The proc replaces the attack with an accurate roll over 0..E; otherwise
    // a normal landed roll over 0..M. Each takes +2, and each 0 is raised first.
    const perAttack = 0.11 * (E / 2 + 2 + 1 / (E + 1)) + 0.89 * a * (M / 2 + 2 + 1 / (M + 1));
    expect(r.dps).toBeCloseTo(perAttack / (5 * 0.6), 12);
  });
});

describe("calculateDps — multi-hit: one raise per hitsplat, on its own integer max", () => {
  const ranged = (over: Partial<DpsScenario>): DpsScenario => ({
    style: "ranged",
    attackStyle: "rapid",
    prayers: NO_PRAYERS,
    skills: SKILLS_AT_99,
    attackBonus: 100,
    strengthBonus: 80,
    attackSpeedTicks: 9,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
    ...over,
  });
  const melee = (over: Partial<DpsScenario>): DpsScenario => ({
    style: "melee",
    attackStyle: "aggressive",
    prayers: NO_PRAYERS,
    skills: SKILLS_AT_99,
    attackBonus: 100,
    strengthBonus: 101,
    attackSpeedTicks: 4,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
    ...over,
  });

  it("Dark bow: two full rolls, 2 × (M/2 + 1/(M+1))", () => {
    const r = calculateDps(ranged({ hitProfile: [{ maxFraction: 1 }, { maxFraction: 1 }] }));
    const M = r.maxHit;
    expect(r.dps).toBeCloseTo((2 * r.accuracy * (M / 2 + 1 / (M + 1))) / (8 * 0.6), 12);
  });

  it("two-hit weapons: a single hit's mean, but two raises — 1/(h+1) + 1/(M−h+1), h = trunc(M/2)", () => {
    const r = calculateDps(melee({ hitProfile: [{ maxFraction: 0.5 }, { maxFraction: 0.5 }] }));
    const M = r.maxHit;
    const h = Math.trunc(M / 2);
    expect(r.dps).toBeCloseTo((r.accuracy * (M / 2 + 1 / (h + 1) + 1 / (M - h + 1))) / (4 * 0.6), 12);
  });

  it("Dual macuahuitl: the second half's raise only when the first landed", () => {
    const r = calculateDps(melee({
      hitProfile: [{ maxFraction: 0.5 }, { maxFraction: 0.5, requiresPrevious: true }],
    }));
    const a = r.accuracy;
    const M = r.maxHit;
    const first = Math.trunc(M / 2);
    const second = M - first;
    const perAttack = a * (first / 2 + 1 / (first + 1)) + a * a * (second / 2 + 1 / (second + 1));
    expect(r.dps).toBeCloseTo(perAttack / (4 * 0.6), 12);
  });

  it("seeking arrows from a Dark bow floor BOTH arrows at 3", () => {
    const r = calculateDps(ranged({ hitProfile: [{ maxFraction: 1 }, { maxFraction: 1 }], seekingArrows: true }));
    const M = r.maxHit;
    expect(r.dps).toBeCloseTo((2 * r.accuracy * (M / 2 + 6 / (M + 1))) / (8 * 0.6), 12);
  });
});

describe("boltAccurateZeroes — accurate 0s left for the raise, per attack", () => {
  // acc 0.8, M = 50 (P0 = 1/51), Kandarin ×1.1 chances.
  const a = 0.8;
  const p0 = 1 / 51;

  it("opal / pearl / dragonstone: a proc adds damage to the 0 — acc·(1−c)·P0", () => {
    const opal: BoltProcSpec = { effect: "opal", kind: "flatBonus", chance: 0.055, bonusDamage: 9, accurateOnly: false };
    expect(boltAccurateZeroes(a, 50, opal)).toBeCloseTo(a * 0.945 * p0, 15);
  });

  it("diamond: proc hits are accurate rolls over 0..trunc(M × 115/100) — c/58 + (1−c)·acc·P0", () => {
    const diamond: BoltProcSpec = { effect: "diamond", kind: "scaledMax", chance: 0.11, effectMaxPercent: 115, accurateOnly: false };
    expect(boltAccurateZeroes(a, 50, diamond)).toBeCloseTo(0.11 / 58 + 0.89 * a * p0, 15);
  });

  it("onyx: only on accurate hits — acc·(c/61 + (1−c)·P0)", () => {
    const onyx: BoltProcSpec = { effect: "onyx", kind: "scaledMax", chance: 0.121, effectMaxPercent: 120, accurateOnly: true };
    expect(boltAccurateZeroes(a, 50, onyx)).toBeCloseTo(a * (0.121 / 61 + 0.879 * p0), 15);
  });

  it("ruby: fires after the raise and replaces it — (1−c)·acc·P0", () => {
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: 0.066, procDamage: 100 };
    expect(boltAccurateZeroes(a, 50, ruby)).toBeCloseTo(0.934 * a * p0, 15);
  });
});

// ---------------------------------------------------------------------------
// Wiring through computeSetDps
// ---------------------------------------------------------------------------

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

describe("computeSetDps — resolves the raise's inputs", () => {
  const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];

  it("Seeking dragon arrows from a Twisted bow lift the mean by 5/(M+1) over Dragon arrows", () => {
    // Same 60 ranged strength: 6/(M+1) for the floor at 3 vs 1/(M+1) for the raise.
    const bow = (ammoId: number, ammoName: string): LoadoutSet => ({
      id: `seeking-${ammoId}`,
      name: "Twisted bow",
      style: "ranged",
      tier: "end",
      attackType: "ranged",
      attackStyleChoice: "rapid",
      slots: {
        weapon: { itemId: 20997, itemName: "Twisted bow" },
        ammo: { itemId: ammoId, itemName: ammoName },
      },
      totals: { attackBonus: 70, strengthBonus: 80, prayerBonus: 0 },
      attackSpeedTicks: 5,
      weaponCategory: "Bow",
      itemBonusFlags: NO_FLAGS,
    });
    const dragon = computeSetDps(bow(11212, "Dragon arrow"), GRAARDOR, SKILLS_AT_99);
    const seeking = computeSetDps(bow(33595, "Seeking dragon arrow"), GRAARDOR, SKILLS_AT_99);
    expect(seeking.maxHit).toBe(dragon.maxHit);
    expect(seeking.dps - dragon.dps).toBeCloseTo(
      (seeking.accuracy * 5) / (seeking.maxHit + 1) / (4 * 0.6),
      12,
    );
  });

  it("Osmumten's fang on SLASH still has its trimmed roll — no raise", () => {
    const fang: LoadoutSet = {
      id: "fang-slash",
      name: "Osmumten's fang",
      style: "melee",
      tier: "end",
      attackType: "slash",
      attackStyleChoice: "aggressive",
      slots: { weapon: { itemId: 26219, itemName: "Osmumten's fang" } },
      totals: { attackBonus: 100, strengthBonus: 103, prayerBonus: 0 },
      attackSpeedTicks: 5,
      weaponCategory: "Stab Sword",
      itemBonusFlags: { ...NO_FLAGS, fang: true },
    };
    const r = computeSetDps(fang, GRAARDOR, SKILLS_AT_99);
    expect(r.dps).toBeCloseTo((r.accuracy * r.maxHit) / 2 / (5 * 0.6), 12);
  });

  it("the Tormented Demon's shield carries its minimum 1 to the engine", () => {
    const TD = MONSTER_BY_SLUG["tormented-demon"];
    const sword: LoadoutSet = {
      id: "td-sword",
      name: "Sword",
      style: "melee",
      tier: "end",
      attackType: "slash",
      attackStyleChoice: "aggressive",
      slots: { weapon: { itemId: 1, itemName: "Test sword" } },
      totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
      attackSpeedTicks: 4,
      weaponCategory: "Slash Sword",
      itemBonusFlags: NO_FLAGS,
    };
    const open = computeSetDps(sword, { ...TD, slug: "not-tormented-demon" }, SKILLS_AT_99);
    const shielded = computeSetDps(sword, TD, SKILLS_AT_99);
    const m0 = open.maxHit;
    expect(shielded.maxHit).toBe(Math.trunc((m0 * 4) / 5));
    // The raised 1 survives the shield: + 1/(M0+1), where trunc(4/5) would drop it.
    expect(shielded.dps).toBeCloseTo(
      (shielded.accuracy * (shielded.maxHit / 2 + 1 / (m0 + 1))) / (4 * 0.6),
      12,
    );
  });
});
