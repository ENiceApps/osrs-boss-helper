import { describe, expect, it } from "vitest";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

describe("multi-hit weapon registry", () => {
  it("Scythe hit count is gated on target size (1→none, 2→2 hits, ≥3→3 hits)", () => {
    expect(hitProfileForWeapon(22325, { targetSize: 1 })).toBeUndefined();
    expect(hitProfileForWeapon(22325, { targetSize: 2 })).toHaveLength(2);
    expect(hitProfileForWeapon(22325, { targetSize: 3 })).toHaveLength(3);
    expect(hitProfileForWeapon(22325, { targetSize: 5 })).toHaveLength(3);
  });

  it("Dual macuahuitl is two halves with a sequential second hit", () => {
    const p = hitProfileForWeapon(28997);
    expect(p).toEqual([
      { maxFraction: 0.5 },
      { maxFraction: 0.5, requiresPrevious: true },
    ]);
  });

  it("the two-hit weapons are two independent halves, trunc(M/2) and M − trunc(M/2)", () => {
    // Torag's hammers (undamaged + 100/75/50/25/0), Sulphur blades, Glacial
    // temotli, Earthbound tecpatl — wgloop isWearingTwoHitWeapon.
    for (const id of [4747, 4958, 4959, 4960, 4961, 4962, 29084, 29889, 30957]) {
      expect(hitProfileForWeapon(id)).toEqual([
        { maxFraction: 0.5 },
        { maxFraction: 0.5 },
      ]);
    }
  });

  it("Dark bow is two full independent hits", () => {
    expect(hitProfileForWeapon(11235)).toEqual([{ maxFraction: 1 }, { maxFraction: 1 }]);
  });

  it("Tonalztics: charged = two 75% hits, uncharged = one 75% hit", () => {
    expect(hitProfileForWeapon(28922)).toHaveLength(2);
    expect(hitProfileForWeapon(28919)).toHaveLength(1);
  });

  it("single-hit weapons return undefined", () => {
    expect(hitProfileForWeapon(4151)).toBeUndefined(); // Abyssal whip
    expect(hitProfileForWeapon(undefined)).toBeUndefined();
  });
});

// A Scythe loadout. The hit profile is keyed only by weapon id, so the style
// doesn't matter for this test.
function scytheSet(): LoadoutSet {
  return {
    id: "scythe-test",
    name: "Scythe of Vitur",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 22325, itemName: "Scythe of Vitur" } },
    totals: { attackBonus: 110, strengthBonus: 75, prayerBonus: 0 },
    attackSpeedTicks: 5,
    weaponCategory: "Scythe",
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

describe("Scythe multi-hit plumbing through computeSetDps", () => {
  // Cloning ONE monster at different sizes isolates the hit profile as the only
  // variable — defence, accuracy and max hit are identical, so the DPS ratio is
  // exactly the multi-hit multiplier.
  const base = MONSTER_CATALOG.find((m) => m.defenceLevel > 0)!;
  const set = scytheSet();

  it("adds hitsplats of trunc(M/2) and trunc(M/4), each with its own raised 0", () => {
    const small = computeSetDps(set, { ...base, size: 1 }, SKILLS_AT_99);
    const medium = computeSetDps(set, { ...base, size: 2 }, SKILLS_AT_99).dps;
    const large = computeSetDps(set, { ...base, size: 3 }, SKILLS_AT_99).dps;
    // A landed roll over 0..m, its 0 raised to 1: m/2 + 1/(m+1). Every
    // hitsplat lands with the same accuracy, so the ratios are exact.
    const landed = (m: number) => m / 2 + 1 / (m + 1);
    const M = small.maxHit;
    const first = landed(M);
    const second = landed(Math.trunc(M / 2));
    const third = landed(Math.trunc(M / 4));
    expect(medium / small.dps).toBeCloseTo((first + second) / first, 12);
    expect(large / small.dps).toBeCloseTo((first + second + third) / first, 12);
    // About 1.5× and 1.75× — the halves truncate and each roll gets its raise.
    expect(medium / small.dps).toBeCloseTo(1.5, 1);
    expect(large / small.dps).toBeCloseTo(1.75, 1);
  });
});
