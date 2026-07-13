import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

// Tormented Demon shield: while up (default phase, matching wgloop), every hit
// is reduced ×4/5 — unless the weapon is demonbane or abyssal, which pierce it.

const NO_FLAGS = {
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
};

// A plain melee slash loadout, parameterised by weapon so we can exercise the
// demonbane / abyssal pierce gates. Bonuses are held constant across weapons —
// only the NAME drives the shield check, so DPS differences isolate the ×4/5.
function meleeSet(itemId: number, itemName: string): LoadoutSet {
  return {
    id: `td-test-${itemId}`,
    name: itemName,
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId, itemName } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    weaponCategory: "Slash Sword",
    itemBonusFlags: NO_FLAGS,
  };
}

const TD = MONSTER_BY_SLUG["tormented-demon"];
// Same monster under a different slug — the shield keys off the slug, so this
// gives the unreduced baseline with identical defences.
const TD_UNSHIELDED = { ...TD, slug: "not-tormented-demon" };

describe("Tormented Demon shield — engine", () => {
  const base: DpsScenario = {
    style: "melee",
    attackStyle: "aggressive",
    prayers: {
      attackMultiplier: 1.2,
      strengthMultiplier: 1.23,
      rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1,
      magicAttackMultiplier: 1,
      magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    },
    skills: SKILLS_AT_99,
    attackBonus: 100,
    strengthBonus: 100,
    attackSpeedTicks: 4,
    targetDefenceLevel: TD.defenceLevel,
    targetDefenceBonusForStyle: TD.defenceBonuses.slash,
  };

  it("targetDamageFactor scales the final max hit by n/d (floored)", () => {
    const full = calculateDps(base);
    const reduced = calculateDps({ ...base, targetDamageFactor: [4, 5] });
    expect(reduced.maxHit).toBe(Math.trunc((full.maxHit * 4) / 5));
    expect(reduced.accuracy).toBe(full.accuracy); // damage-only, accuracy untouched
    expect(reduced.dps).toBeLessThan(full.dps);
  });
});

describe("Tormented Demon shield — computeSetDps plumbing", () => {
  it("reduces a non-demonbane weapon's max hit ×4/5 vs the demon", () => {
    const set = meleeSet(4151, "Godsword of testing");
    const shielded = computeSetDps(set, TD, SKILLS_AT_99);
    const unshielded = computeSetDps(set, TD_UNSHIELDED, SKILLS_AT_99);
    expect(shielded.maxHit).toBe(Math.trunc((unshielded.maxHit * 4) / 5));
    expect(shielded.accuracy).toBe(unshielded.accuracy);
  });

  it("demonbane melee weapons pierce the shield", () => {
    // Note: Arclight/Emberlight normally also fire the +70% demonbane
    // conditional, but that flag is held false here to isolate the shield.
    const set = meleeSet(19675, "Arclight");
    const vsDemon = computeSetDps(set, TD, SKILLS_AT_99);
    const baseline = computeSetDps(set, TD_UNSHIELDED, SKILLS_AT_99);
    expect(vsDemon.maxHit).toBe(baseline.maxHit);
  });

  it("abyssal weapons pierce the shield", () => {
    const set = meleeSet(4151, "Abyssal whip");
    const vsDemon = computeSetDps(set, TD, SKILLS_AT_99);
    const baseline = computeSetDps(set, TD_UNSHIELDED, SKILLS_AT_99);
    expect(vsDemon.maxHit).toBe(baseline.maxHit);
  });
});
