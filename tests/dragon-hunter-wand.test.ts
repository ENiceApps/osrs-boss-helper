import { describe, expect, it } from "vitest";
import { conditionalMultipliers, applyFactors } from "@/lib/dps/conditional";
import { activeBonusesForTarget } from "@/lib/loadout";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import type { ConditionalBonusFlags } from "@/types/osrs";
import type { LoadoutSet } from "@/types/loadout";

const NO_COND: ConditionalBonusFlags = {
  dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: false,
  salveAmuletEi: false, salveAmulet: false, demonbane: false,
};

function wandSet(opts: { wand: boolean; salve: boolean }): LoadoutSet {
  return {
    id: "w", name: "Dragon hunter wand", style: "magic", tier: "end",
    attackType: "magic", attackStyleChoice: "accurate",
    slots: { weapon: { itemId: 30070, itemName: "Dragon hunter wand" } },
    totals: { attackBonus: 30, strengthBonus: 0, magicDamagePct: 10, prayerBonus: 0 },
    attackSpeedTicks: 4, weaponCategory: "Powered Staff", baseSpellMaxHit: 30,
    itemBonusFlags: {
      dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: opts.wand,
      salveAmuletEi: opts.salve, salveAmulet: false, demonbane: false, tomeOfFire: false,
      tomeOfWater: false, tomeOfEarth: false, twistedBow: false, fang: false, slayerHelmImbued: false,
    },
  };
}

const dragon = MONSTER_CATALOG.find((m) => m.attributes.includes("dragon") && !m.attributes.includes("undead"))!;
const undeadDragon = MONSTER_CATALOG.find((m) => m.attributes.includes("dragon") && m.attributes.includes("undead"))!;
const nonDragon = MONSTER_CATALOG.find((m) => !m.attributes.includes("dragon") && m.defenceLevel > 0)!;

describe("Dragon hunter wand", () => {
  it("applies ×7/4 accuracy and ×7/5 damage, multiplicatively", () => {
    const m = conditionalMultipliers({ ...NO_COND, dragonHunterWand: true });
    expect(applyFactors(100, m.accuracy)).toBe(175); // trunc(100 × 7/4)
    expect(applyFactors(100, m.damage)).toBe(140); // trunc(100 × 7/5)
  });

  it("fires only against draconic targets", () => {
    const set = wandSet({ wand: true, salve: false });
    expect(activeBonusesForTarget(set, dragon).conditionalBonuses.dragonHunterWand).toBe(true);
    expect(activeBonusesForTarget(set, nonDragon).conditionalBonuses.dragonHunterWand).toBe(false);
  });

  it("suppresses an active Salve on an undead dragon — they don't stack (unlike DHCB)", () => {
    const set = wandSet({ wand: true, salve: true });
    const cb = activeBonusesForTarget(set, undeadDragon).conditionalBonuses;
    expect(cb.dragonHunterWand).toBe(true);
    expect(cb.salveAmuletEi).toBe(false); // Salve dropped in favour of the wand
  });
});
