import { describe, expect, it } from "vitest";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { activeBonusesForTarget } from "@/lib/loadout";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

// Webweaver bow ranged set. wildernessWeapon flag toggled to isolate the bonus.
function webweaverSet(wildy: boolean): LoadoutSet {
  return {
    id: "w", name: "test", style: "ranged", tier: "end",
    attackType: "ranged", attackStyleChoice: "rapid",
    slots: { weapon: { itemId: 27655, itemName: "Webweaver bow" } },
    totals: { attackBonus: 70, strengthBonus: 80, prayerBonus: 0 },
    attackSpeedTicks: 3, weaponCategory: "Bow",
    itemBonusFlags: {
      dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: false,
      salveAmuletEi: false, salveAmulet: false, demonbane: false,
      tomeOfFire: false, tomeOfWater: false, tomeOfEarth: false,
      twistedBow: false, fang: false, slayerHelmImbued: false,
      wildernessWeapon: wildy,
    },
  };
}

const CALLISTO = MONSTER_BY_SLUG["callisto"];   // Wilderness boss
const VORKATH = MONSTER_BY_SLUG["vorkath"];     // not in the Wilderness

describe("wilderness weapon bonus", () => {
  it("only the listed wilderness bosses are flagged (KBD/Skotizo excluded)", () => {
    expect(isWildernessBoss("callisto")).toBe(true);
    expect(isWildernessBoss("revenant-maledictus")).toBe(true);
    expect(isWildernessBoss("king-black-dragon")).toBe(false); // lair isn't Wilderness
    expect(isWildernessBoss("skotizo")).toBe(false);           // Catacombs of Kourend
    expect(isWildernessBoss("vorkath")).toBe(false);
  });

  it("the ×3/2 fires only vs a wilderness boss", () => {
    expect(
      activeBonusesForTarget(webweaverSet(true), CALLISTO).conditionalBonuses.wildernessWeapon,
    ).toBe(true);
    // Same weapon vs a non-wilderness boss: no bonus.
    expect(
      activeBonusesForTarget(webweaverSet(true), VORKATH).conditionalBonuses.wildernessWeapon,
    ).toBe(false);
  });

  it("raises DPS vs a wilderness boss but not vs a non-wilderness boss", () => {
    const onWildy = computeSetDps(webweaverSet(true), CALLISTO, SKILLS_AT_99).dps;
    const offWildy = computeSetDps(webweaverSet(false), CALLISTO, SKILLS_AT_99).dps;
    expect(onWildy).toBeGreaterThan(offWildy);

    // Vs Vorkath the flag can't fire, so toggling it changes nothing.
    const onVork = computeSetDps(webweaverSet(true), VORKATH, SKILLS_AT_99).dps;
    const offVork = computeSetDps(webweaverSet(false), VORKATH, SKILLS_AT_99).dps;
    expect(onVork).toBe(offVork);
  });
});
