// Selectable combat-prayer catalog (data/prayers.ts) + its integration with the
// DPS engine and the supply-cost model. Verifies: the catalog is well-formed,
// changing the prayer changes DPS, omitting the override reproduces the default
// (best) prayer exactly, and a weaker prayer drains slower.

import { describe, expect, it } from "vitest";
import {
  PRAYER_OPTIONS,
  DEFAULT_PRAYER_ID,
  prayerById,
  defaultPrayerFor,
} from "@/data/prayers";
import { estimatePrayerSupplies } from "@/data/prayer-drain";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { CombatStyle } from "@/types/osrs";

const STYLES: CombatStyle[] = ["melee", "ranged", "magic"];
const VORKATH = MONSTER_BY_SLUG["vorkath"];

// A DHCB ranged setup built straight from item ids (mirrors boost.test.ts).
const RANGED_SET = (() => {
  const scored = scoreScenario({
    itemIds: [27235, 22109, 12018, 9243, 21012, 27238, 22002, 27241, 26235, 13237, 28310],
    target: VORKATH,
    skills: SKILLS_AT_99,
    attackStyle: { attackType: "ranged", choice: "rapid" },
  });
  if (!scored.valid) throw new Error(`RANGED_SET invalid: ${scored.reasons.join("; ")}`);
  return scored.loadout;
})();

describe("prayer catalog", () => {
  it("each style's default id resolves to a real option", () => {
    for (const style of STYLES) {
      const def = defaultPrayerFor(style);
      expect(def.id).toBe(DEFAULT_PRAYER_ID[style]);
      expect(def.style).toBe(style);
    }
  });

  it("every style ends with a 'None' option that is a pure no-op", () => {
    for (const style of STYLES) {
      const none = PRAYER_OPTIONS[style].find((p) => p.id === "none")!;
      expect(none.drainEffect).toBe(0);
      expect(none.selection).toEqual({
        attackMultiplier: 1,
        strengthMultiplier: 1,
        rangedAttackMultiplier: 1,
        rangedStrengthMultiplier: 1,
        magicAttackMultiplier: 1,
        magicDamageMultiplier: 1,
        defenceMultiplier: 1,
      });
    }
  });

  it("prayerById falls back to the style default for an unknown id", () => {
    expect(prayerById("melee", "bogus").id).toBe("piety");
    expect(prayerById("ranged", undefined).id).toBe("rigour");
    expect(prayerById("magic", "augury").id).toBe("augury");
  });

  it("the default (best) prayer drains at the offensive-overhead rate of 24", () => {
    for (const style of STYLES) {
      expect(defaultPrayerFor(style).drainEffect).toBe(24);
    }
  });
});

describe("computeSetDps — prayer override", () => {
  it("omitting the prayer reproduces the default (Rigour) exactly", () => {
    const implicit = computeSetDps(RANGED_SET, VORKATH, SKILLS_AT_99);
    const explicit = computeSetDps(
      RANGED_SET, VORKATH, SKILLS_AT_99, undefined, false, false, undefined,
      prayerById("ranged", "rigour").selection,
    );
    expect(explicit.dps).toBe(implicit.dps);
    expect(explicit.maxHit).toBe(implicit.maxHit);
  });

  it("a weaker prayer lowers DPS; 'None' lowers it further", () => {
    const rigour = computeSetDps(RANGED_SET, VORKATH, SKILLS_AT_99).dps;
    const eagle = computeSetDps(
      RANGED_SET, VORKATH, SKILLS_AT_99, undefined, false, false, undefined,
      prayerById("ranged", "eagle-eye").selection,
    ).dps;
    const none = computeSetDps(
      RANGED_SET, VORKATH, SKILLS_AT_99, undefined, false, false, undefined,
      prayerById("ranged", "none").selection,
    ).dps;
    expect(eagle).toBeLessThan(rigour);
    expect(none).toBeLessThan(eagle);
  });
});

describe("estimatePrayerSupplies — drain effect tracks the chosen prayer", () => {
  it("a lower drain effect costs fewer prayer pots", () => {
    const rigour = estimatePrayerSupplies("ranged", 99, 0, 10_000, { offensiveDrainEffect: 24 });
    const eagle = estimatePrayerSupplies("ranged", 99, 0, 10_000, { offensiveDrainEffect: 12 });
    expect(eagle.potionsPerHour).toBeCloseTo(rigour.potionsPerHour / 2, 5);
  });

  it("'None' (drain effect 0) consumes no prayer pots", () => {
    const none = estimatePrayerSupplies("ranged", 99, 0, 10_000, { offensiveDrainEffect: 0 });
    expect(none.pointsPerMinute).toBe(0);
    expect(none.potionsPerHour).toBe(0);
    expect(none.gpPerHour).toBe(0);
  });

  it("defaults to the style's drain effect (24) when none is given", () => {
    const explicit = estimatePrayerSupplies("ranged", 99, 0, 10_000, { offensiveDrainEffect: 24 });
    const implicit = estimatePrayerSupplies("ranged", 99, 0, 10_000);
    expect(implicit.potionsPerHour).toBeCloseTo(explicit.potionsPerHour, 5);
  });
});
