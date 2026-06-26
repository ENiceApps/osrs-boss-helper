// Prayer drain + supply-cost model (data/prayer-drain.ts). Validates the OSRS
// drain mechanics: Piety/Rigour/Augury drain at effect 24, worn Prayer bonus
// slows the drain, and the potion-supply math derives from those.

import { describe, expect, it } from "vitest";
import {
  PRAYER_DRAIN_EFFECT,
  prayerPointsPerMinute,
  prayerRestorePerDose,
  estimatePrayerSupplies,
} from "@/data/prayer-drain";

describe("prayer drain rate", () => {
  it("drains the offensive overhead at ~40 pts/min with no Prayer bonus", () => {
    // drainResistance = 60, ticksPerPoint = 60/24 = 2.5 → 1.5s/pt → 40 pts/min.
    // (Matches the wiki: Piety lasts ~2.5 min on 99 Prayer with no bonus.)
    expect(prayerPointsPerMinute(PRAYER_DRAIN_EFFECT.melee, 0)).toBeCloseTo(40, 5);
  });

  it("worn Prayer bonus slows the drain (≈ halves it at +30)", () => {
    // drainResistance = 2*30+60 = 120 → twice as slow → ~20 pts/min.
    expect(prayerPointsPerMinute(PRAYER_DRAIN_EFFECT.ranged, 30)).toBeCloseTo(20, 5);
  });

  it("all three offensive overheads share the same drain effect", () => {
    expect(PRAYER_DRAIN_EFFECT.melee).toBe(24);
    expect(PRAYER_DRAIN_EFFECT.ranged).toBe(24);
    expect(PRAYER_DRAIN_EFFECT.magic).toBe(24);
  });
});

describe("prayer potion restore", () => {
  it("restores 7 + 25% of Prayer level per dose (31 at 99)", () => {
    expect(prayerRestorePerDose(99)).toBe(31);
    expect(prayerRestorePerDose(43)).toBe(7 + 10); // 43 → +10
  });
});

describe("supply estimate", () => {
  it("derives potions/hr and gp/hr from drain ÷ restore", () => {
    // 40 pts/min × 60 = 2400 pts/hr; /31 per dose ≈ 77.4 doses; /4 ≈ 19.4 pots/hr.
    const est = estimatePrayerSupplies("melee", 99, 0, 10_000);
    expect(est.potionsPerHour).toBeCloseTo(19.35, 1);
    expect(est.gpPerHour).toBeCloseTo(193_548, -2);
  });

  it("returns null gp/hr when the potion price is unknown", () => {
    const est = estimatePrayerSupplies("magic", 99, 15, null);
    expect(est.gpPerHour).toBeNull();
    expect(est.potionsPerHour).toBeGreaterThan(0);
  });

  it("a protection prayer raises drain by the 36/24 effect ratio", () => {
    const base = estimatePrayerSupplies("melee", 99, 0, 10_000);
    const withProt = estimatePrayerSupplies("melee", 99, 0, 10_000, {
      useProtectionPrayer: true,
    });
    // Drain effect 24 → 36 (offensive + protection), so 1.5× the pots.
    expect(withProt.potionsPerHour / base.potionsPerHour).toBeCloseTo(36 / 24, 5);
  });

  it("uptime scales consumption linearly", () => {
    const full = estimatePrayerSupplies("ranged", 99, 0, 10_000);
    const half = estimatePrayerSupplies("ranged", 99, 0, 10_000, { uptime: 0.5 });
    expect(half.potionsPerHour).toBeCloseTo(full.potionsPerHour * 0.5, 5);
    // The instantaneous drain rate is unchanged — only the per-hour totals scale.
    expect(half.pointsPerMinute).toBeCloseTo(full.pointsPerMinute, 5);
  });
});
