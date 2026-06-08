// Combat stat-boosting potions: the boost math, and that DPS reflects the
// boost (while leaving unboosted defaults — and the verified baselines —
// untouched).

import { describe, expect, it } from "vitest";
import { applyCombatBoost, bestBoostForStyle, SUPER_COMBAT, RANGING_POTION, SATURATED_HEART } from "@/lib/dps/boost";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { LOADOUT_SET_BY_ID } from "@/data/loadouts/sets.generated";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

describe("applyCombatBoost — boost math", () => {
  it("Super combat at 99 → attack & strength 118 (+5 +15%)", () => {
    const b = applyCombatBoost(SKILLS_AT_99, SUPER_COMBAT);
    expect(b.attack).toBe(118); // 99 + 5 + floor(0.15*99=14) = 118
    expect(b.strength).toBe(118);
    expect(b.ranged).toBe(99); // untouched
    expect(b.magic).toBe(99);
  });

  it("Ranging potion at 99 → ranged 112 (+4 +10%)", () => {
    const b = applyCombatBoost(SKILLS_AT_99, RANGING_POTION);
    expect(b.ranged).toBe(112); // 99 + 4 + floor(0.10*99=9) = 112
    expect(b.attack).toBe(99);
  });

  it("Saturated heart at 99 → magic 112 (+4 +10%)", () => {
    const b = applyCombatBoost(SKILLS_AT_99, SATURATED_HEART);
    expect(b.magic).toBe(112);
  });

  it("boost scales off the base level (lower level → smaller %)", () => {
    const lvl70 = { ...SKILLS_AT_99, strength: 70 };
    const b = applyCombatBoost(lvl70, SUPER_COMBAT);
    expect(b.strength).toBe(70 + 5 + Math.floor((70 * 15) / 100)); // 70+5+10 = 85
  });

  it("undefined boost is a no-op", () => {
    expect(applyCombatBoost(SKILLS_AT_99, undefined)).toEqual(SKILLS_AT_99);
  });

  it("bestBoostForStyle maps each style to the right potion", () => {
    expect(bestBoostForStyle("melee").id).toBe("super-combat");
    expect(bestBoostForStyle("ranged").id).toBe("ranging-potion");
    expect(bestBoostForStyle("magic").id).toBe("saturated-heart");
  });
});

describe("computeSetDps — boost is opt-in", () => {
  const set = LOADOUT_SET_BY_ID["ranged-end-dragonbane-undead"]; // ranged set

  it("omitting the boost reproduces the unboosted baseline exactly", () => {
    const a = computeSetDps(set, VORKATH, SKILLS_AT_99);
    const b = computeSetDps(set, VORKATH, SKILLS_AT_99, undefined);
    expect(a.dps).toBe(b.dps);
    expect(a.maxHit).toBe(b.maxHit);
  });

  it("a ranged boost raises max hit and DPS vs unboosted", () => {
    const base = computeSetDps(set, VORKATH, SKILLS_AT_99);
    const boosted = computeSetDps(set, VORKATH, SKILLS_AT_99, bestBoostForStyle("ranged"));
    expect(boosted.maxHit).toBeGreaterThan(base.maxHit);
    expect(boosted.dps).toBeGreaterThan(base.dps);
  });
});
