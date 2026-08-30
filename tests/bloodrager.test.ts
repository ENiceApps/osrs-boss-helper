import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

// Blood moon "Bloodrager" set effect: full Blood moon armour + Dual macuahuitl.
// Each of the macuahuitl's two sequential hits has a 33% chance to make the
// next attack land a tick sooner. Per-attack accelerate chance is
//   P = 0.33·a·(1 + 0.67·a)   (a = per-hit accuracy)
// and the long-run effective interval drops from 4 ticks to (4 − P). The effect
// is accuracy-dependent, so it's applied after accuracy is known.
const MELEE_PRAYERS = {
  attackMultiplier: 1.2,
  strengthMultiplier: 1.23,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1.25,
};

function macuahuitlScenario(overrides: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "melee",
    attackStyle: "aggressive",
    prayers: MELEE_PRAYERS,
    skills: SKILLS_AT_99,
    attackBonus: 60,
    strengthBonus: 120,
    attackSpeedTicks: 4,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 50,
    hitProfile: hitProfileForWeapon(28997), // two sequential halves
    ...overrides,
  };
}

describe("Bloodrager attack-speed effect", () => {
  it("raises DPS by exactly base/(base − P), with P from the per-hit accuracy", () => {
    const off = calculateDps(macuahuitlScenario({ bloodrager: false }));
    const on = calculateDps(macuahuitlScenario({ bloodrager: true }));

    const a = off.accuracy; // accuracy is identical with/without the speed effect
    const p = 0.33 * a * (1 + 0.67 * a);
    const expectedRatio = 4 / (4 - p);

    expect(on.accuracy).toBeCloseTo(off.accuracy, 10);
    expect(on.maxHit).toBe(off.maxHit); // speed-only effect — damage unchanged
    expect(on.dps / off.dps).toBeCloseTo(expectedRatio, 6);
  });

  it("is a real gain — larger at higher accuracy", () => {
    const lowAcc = macuahuitlScenario({ targetDefenceLevel: 300, targetDefenceBonusForStyle: 200 });
    const highAcc = macuahuitlScenario({ targetDefenceLevel: 1, targetDefenceBonusForStyle: 0 });

    const lowGain =
      calculateDps({ ...lowAcc, bloodrager: true }).dps /
      calculateDps({ ...lowAcc, bloodrager: false }).dps;
    const highGain =
      calculateDps({ ...highAcc, bloodrager: true }).dps /
      calculateDps({ ...highAcc, bloodrager: false }).dps;

    expect(highGain).toBeGreaterThan(lowGain);
    expect(highGain).toBeGreaterThan(1.1); // ~+16% near full accuracy
    expect(lowGain).toBeGreaterThan(1.0); // always a gain
  });

  it("does nothing without the bloodrager flag (no false positives on other multi-hitters)", () => {
    const plain = calculateDps(macuahuitlScenario({ bloodrager: false }));
    const same = calculateDps(macuahuitlScenario());
    expect(same.dps).toBe(plain.dps);
  });
});

// A full Blood moon + Dual macuahuitl loadout, and a near-identical one with the
// set broken, to confirm computeSetDps detects the set and routes the speed gain.
function bloodMoonSet(broken: boolean): LoadoutSet {
  return {
    id: "bloodrager-test",
    name: "Blood moon + macuahuitl",
    style: "melee",
    tier: "end",
    attackType: "crush",
    attackStyleChoice: "aggressive",
    slots: {
      weapon: { itemId: 28997, itemName: "Dual macuahuitl" },
      head: { itemId: broken ? 10828 : 29028, itemName: "head" }, // Helm of Neitiznot breaks the set
      body: { itemId: 29022, itemName: "Blood moon chestplate" },
      legs: { itemId: 29025, itemName: "Blood moon tassets" },
    },
    totals: { attackBonus: 80, strengthBonus: 130, prayerBonus: 0 },
    attackSpeedTicks: 4,
    weaponCategory: "Spiked",
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

describe("Bloodrager detection through computeSetDps", () => {
  const base = MONSTER_CATALOG.find((m) => m.defenceLevel > 0)!;

  it("full set + macuahuitl beats the same loadout with the set broken", () => {
    const full = computeSetDps(bloodMoonSet(false), base, SKILLS_AT_99).dps;
    const broken = computeSetDps(bloodMoonSet(true), base, SKILLS_AT_99).dps;
    expect(full).toBeGreaterThan(broken);
  });
});

describe("Bloodrager force-include in the bank optimizer", () => {
  // The original bug: Blood moon chestplate and Bandos chestplate tie on
  // itemScore, so the greedy picked arbitrarily and never assembled the full
  // set. With the macuahuitl owned, the force-include must build the full set
  // and it must win on DPS (the speed gain), not get tie-broken to Bandos.
  const target = MONSTER_CATALOG.find((m) => m.defenceLevel > 0 && m.size <= 1)!;
  const BLOOD_MOON = [28997, 29028, 29022, 29025]; // macuahuitl, helm, chest, tassets
  const bank = new Set<number>([
    ...BLOOD_MOON,
    11832, // Bandos chestplate — the competing body slot (same str, more defence)
    11834, // Bandos tassets — competing legs
    10828, // Helm of Neitiznot — competing head
  ]);

  it("assembles macuahuitl + the full Blood moon set when the macuahuitl is owned", () => {
    const { rankings } = optimizeForBoss({ bank, target, skills: SKILLS_AT_99, topN: 50 });
    const macuahuitlSets = rankings.filter((r) => r.loadout.slots.weapon?.itemId === 28997);
    expect(macuahuitlSets.length).toBeGreaterThan(0);
    const best = macuahuitlSets[0];
    // The highest-DPS macuahuitl loadout wears all three Blood moon pieces.
    expect(best.loadout.slots.head?.itemId).toBe(29028);
    expect(best.loadout.slots.body?.itemId).toBe(29022);
    expect(best.loadout.slots.legs?.itemId).toBe(29025);
  });
});
