import { describe, expect, it } from "vitest";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { activeBonusesForTarget } from "@/lib/loadout";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { AttackType, LoadoutSet } from "@/types/loadout";
import type { AttackStyleChoice } from "@/types/osrs";

// A minimal Fang loadout, parameterised by attack style so we can exercise the
// stab-gate. `fang` toggles the worn-item flag the build sites derive via
// hasTrigger(OSMUMTEN_FANG).
function fangSet(opts: {
  fang: boolean;
  attackType: AttackType;
  choice: AttackStyleChoice;
}): LoadoutSet {
  return {
    id: "fang-test",
    name: "Osmumten's fang",
    style: "melee",
    tier: "end",
    attackType: opts.attackType,
    attackStyleChoice: opts.choice,
    slots: { weapon: { itemId: 26219, itemName: "Osmumten's fang" } },
    totals: { attackBonus: 105, strengthBonus: 103, prayerBonus: 0 },
    attackSpeedTicks: 5,
    weaponCategory: "Stab Sword",
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
      fang: opts.fang,
      slayerHelmImbued: false,
    },
  };
}

// A high-defence target so the accuracy passive has misses to recover.
const target = MONSTER_BY_SLUG["general-graardor"];

describe("Osmumten's fang — loadout plumbing", () => {
  it("raises DPS through accuracy on a stab style, leaving max hit untouched", () => {
    const lunge = { attackType: "stab" as const, choice: "aggressive" as const };
    const off = computeSetDps(fangSet({ fang: false, ...lunge }), target, SKILLS_AT_99);
    const on = computeSetDps(fangSet({ fang: true, ...lunge }), target, SKILLS_AT_99);
    expect(on.accuracy).toBeGreaterThan(off.accuracy);
    expect(on.dps).toBeGreaterThan(off.dps);
    expect(on.maxHit).toBe(off.maxHit);
  });

  it("activeBonusesForTarget gates the passive on stab styles only", () => {
    const stab = fangSet({ fang: true, attackType: "stab", choice: "aggressive" });
    const slash = fangSet({ fang: true, attackType: "slash", choice: "controlled" });
    expect(activeBonusesForTarget(stab, target).fangEquipped).toBe(true);
    expect(activeBonusesForTarget(slash, target).fangEquipped).toBe(false);
  });

  it("does not fire when the weapon isn't a fang", () => {
    const notFang = fangSet({ fang: false, attackType: "stab", choice: "aggressive" });
    expect(activeBonusesForTarget(notFang, target).fangEquipped).toBe(false);
  });
});
