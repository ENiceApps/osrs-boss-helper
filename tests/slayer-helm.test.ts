import { describe, expect, it } from "vitest";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

function whipSet(opts: { slayer: boolean; salve: boolean }): LoadoutSet {
  return {
    id: "s", name: "test", style: "melee", tier: "end",
    attackType: "slash", attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 4151, itemName: "Abyssal whip" } },
    totals: { attackBonus: 90, strengthBonus: 90, prayerBonus: 0 },
    attackSpeedTicks: 4, weaponCategory: "Whip",
    itemBonusFlags: {
      dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: false, salveAmuletEi: opts.salve,
      salveAmulet: false, demonbane: false, tomeOfFire: false, tomeOfWater: false,
      tomeOfEarth: false, twistedBow: false, fang: false, slayerHelmImbued: opts.slayer,
    },
  };
}

const nonUndead = MONSTER_CATALOG.find((m) => !m.attributes.includes("undead") && m.defenceLevel > 0)!;
const undead = MONSTER_CATALOG.find((m) => m.attributes.includes("undead") && m.defenceLevel > 0)!;

describe("slayer helm (i) on-task gating", () => {
  it("raises DPS only when on-task", () => {
    const set = whipSet({ slayer: true, salve: false });
    const off = computeSetDps(set, nonUndead, SKILLS_AT_99, undefined, false).dps;
    const on = computeSetDps(set, nonUndead, SKILLS_AT_99, undefined, true).dps;
    expect(on).toBeGreaterThan(off);
  });

  it("does nothing without an imbued head, even on-task", () => {
    const set = whipSet({ slayer: false, salve: false });
    const off = computeSetDps(set, nonUndead, SKILLS_AT_99, undefined, false).dps;
    const on = computeSetDps(set, nonUndead, SKILLS_AT_99, undefined, true).dps;
    expect(on).toBe(off);
  });

  it("is suppressed by an active Salve vs undead (they don't stack)", () => {
    const set = whipSet({ slayer: true, salve: true });
    // Salve is active on the undead target either way, so toggling on-task must
    // NOT add the slayer multiplier on top.
    const off = computeSetDps(set, undead, SKILLS_AT_99, undefined, false).dps;
    const on = computeSetDps(set, undead, SKILLS_AT_99, undefined, true).dps;
    expect(on).toBe(off);
  });

  it("still applies vs undead when no Salve is worn", () => {
    const set = whipSet({ slayer: true, salve: false });
    const off = computeSetDps(set, undead, SKILLS_AT_99, undefined, false).dps;
    const on = computeSetDps(set, undead, SKILLS_AT_99, undefined, true).dps;
    expect(on).toBeGreaterThan(off);
  });
});
