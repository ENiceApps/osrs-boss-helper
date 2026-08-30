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

  it("Dark bow is two full independent hits", () => {
    expect(hitProfileForWeapon(11235)).toEqual([{ maxFraction: 1 }, { maxFraction: 1 }]);
  });

  it("Tonalztics: charged = two 75% hits, uncharged = one 75% hit", () => {
    expect(hitProfileForWeapon(28922)).toHaveLength(2);
    expect(hitProfileForWeapon(28919)).toHaveLength(1);
  });

  it("non-multi-hit weapons and the mean-neutral splitters return undefined", () => {
    expect(hitProfileForWeapon(4151)).toBeUndefined(); // Abyssal whip
    expect(hitProfileForWeapon(29084)).toBeUndefined(); // Sulphur blades (neutral)
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

  it("scales DPS by exactly 1.5× on a 2×2 target and 1.75× on a 3×3 target", () => {
    const small = computeSetDps(set, { ...base, size: 1 }, SKILLS_AT_99).dps;
    const medium = computeSetDps(set, { ...base, size: 2 }, SKILLS_AT_99).dps;
    const large = computeSetDps(set, { ...base, size: 3 }, SKILLS_AT_99).dps;
    expect(medium / small).toBeCloseTo(1.5, 5);
    expect(large / small).toBeCloseTo(1.75, 5);
  });
});
