import { describe, expect, it } from "vitest";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

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

function slashSet(): LoadoutSet {
  return {
    id: "phase-test",
    name: "Plain slasher",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 4151, itemName: "Plain sword" } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    weaponCategory: "Slash Sword",
    itemBonusFlags: NO_FLAGS,
  };
}

describe("phaseOptionsFor", () => {
  it("returns mechanic phases for the Tormented Demon, default (shielded) first", () => {
    const opts = phaseOptionsFor(MONSTER_BY_SLUG["tormented-demon"]);
    expect(opts.map((o) => o.id)).toEqual(["m:shielded", "m:unshielded"]);
    expect(opts[0].mechanic?.damageModifier).toMatchObject({ factor: [4, 5] });
    expect(opts[1].mechanic?.damageModifier).toBeUndefined();
  });

  it("returns stat phases for Zulrah, catalog default first", () => {
    const opts = phaseOptionsFor(MONSTER_BY_SLUG["zulrah"]);
    expect(opts.map((o) => o.label)).toEqual(["Serpentine", "Magma", "Tanzanite"]);
    expect(opts[0].stats?.wikiId).toBe(MONSTER_BY_SLUG["zulrah"].wikiId);
  });

  it("returns nothing for single-state fights", () => {
    expect(phaseOptionsFor(MONSTER_BY_SLUG["cerberus"])).toEqual([]);
  });
});

describe("applyPhase", () => {
  it("spreads a stat phase's block over the entry", () => {
    const zulrah = MONSTER_BY_SLUG["zulrah"];
    const magma = phaseOptionsFor(zulrah).find((o) => o.label === "Magma")!;
    const phased = applyPhase(zulrah, magma);
    expect(phased.defenceBonuses).toEqual(magma.stats!.defenceBonuses);
    expect(phased.wikiId).toBe(magma.stats!.wikiId);
    expect(phased.slug).toBe("zulrah"); // identity fields stay
  });

  it("is a no-op without an option", () => {
    const cerb = MONSTER_BY_SLUG["cerberus"];
    expect(applyPhase(cerb, undefined)).toBe(cerb);
  });
});

describe("phases through the DPS pipeline", () => {
  it("Tormented Demon: unshielded phase lifts the default ×4/5 reduction", () => {
    const td = MONSTER_BY_SLUG["tormented-demon"];
    const [shielded, unshielded] = phaseOptionsFor(td);
    const set = slashSet();

    const rawDefault = computeSetDps(set, td, SKILLS_AT_99);
    const shieldedDps = computeSetDps(set, applyPhase(td, shielded), SKILLS_AT_99);
    const unshieldedDps = computeSetDps(set, applyPhase(td, unshielded), SKILLS_AT_99);

    // Raw catalog entry (no phase chosen) behaves like the default phase.
    expect(rawDefault.maxHit).toBe(shieldedDps.maxHit);
    expect(shieldedDps.maxHit).toBe(Math.trunc((unshieldedDps.maxHit * 4) / 5));
    expect(unshieldedDps.dps).toBeGreaterThan(shieldedDps.dps);
    expect(unshieldedDps.accuracy).toBe(shieldedDps.accuracy);
  });

  it("Zulrah: form selection changes ranged defence and therefore DPS", () => {
    const zulrah = MONSTER_BY_SLUG["zulrah"];
    const opts = phaseOptionsFor(zulrah);
    const set: LoadoutSet = {
      ...slashSet(),
      style: "ranged",
      attackType: "ranged",
      attackStyleChoice: "rapid",
      weaponCategory: "Bow",
    };
    // Serpentine 50 / Magma 300 / Tanzanite 0 standard ranged defence…
    const byDef = new Set(opts.map((o) => applyPhase(zulrah, o).defenceBonuses.rangedStandard));
    expect(byDef.size).toBeGreaterThan(1);
    // …and the engine sees the difference.
    const dps = opts.map((o) => computeSetDps(set, applyPhase(zulrah, o), SKILLS_AT_99).dps);
    expect(new Set(dps.map((d) => d.toFixed(6))).size).toBeGreaterThan(1);
  });
});
