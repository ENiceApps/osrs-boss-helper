// Verifies the hover-tooltip "vs the bank item" comparison: in GP / sell-to-fund
// modes the doll shows the post-upgrade build, so each upgraded slot's tooltip
// should report DPS gained over the bank item it replaced — including the weapon
// slot, where the bank weapon must be scored at its OWN best style.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades } from "@/lib/optimize/budget";
import { compareSlotsVsReference } from "@/lib/loadout-compare";

const RUNE_DRAGON = MONSTER_BY_SLUG["rune-dragon"];

describe("loadout-compare — slot DPS vs the bank item it replaced", () => {
  it("weapon tooltip reports the lance's gain over the fang (not over empty)", () => {
    const FANG = 26219;
    const DHL = 22978;
    const GEAR = [26674, 24780, 20445, 11832, 11834, 7462, 11840, 26770, 20463, 20220];
    const prices = (id: number) => (id === DHL ? 60_000_000 : null);

    const result = findUpgrades({
      bank: [FANG, ...GEAR],
      target: RUNE_DRAGON,
      skills: SKILLS_AT_99,
      gp: 100_000_000,
      mode: "gp-only",
      onTask: true,
      priceLookup: prices,
    });

    // Sanity: the upgrade actually swapped the weapon.
    expect(result.currentBest!.loadout.slots.weapon!.itemId).toBe(FANG);
    expect(result.upgradedBest!.loadout.slots.weapon!.itemId).toBe(DHL);

    const vsBank = compareSlotsVsReference({
      displayed: result.upgradedBest!.loadout,
      displayedDps: result.upgradedBest!.dps.dps,
      reference: result.currentBest!.loadout,
      target: RUNE_DRAGON,
      skills: SKILLS_AT_99,
      boostResolver: () => undefined,
      onTask: true,
      soulreaperMaxStacks: false,
    });

    // The weapon slot is compared against the fang by name, with a positive,
    // bounded gain — NOT the lance's full standalone DPS (which a "vs empty"
    // comparison would imply).
    expect(vsBank.weapon).toBeDefined();
    expect(vsBank.weapon!.vsItemName).toBe("Osmumten's fang");
    expect(vsBank.weapon!.dpsDelta).toBeGreaterThan(0);
    expect(vsBank.weapon!.dpsDelta).toBeLessThan(result.upgradedBest!.dps.dps);
    // The gain equals the full-build delta since the weapon is the only change.
    expect(vsBank.weapon!.dpsDelta).toBeCloseTo(
      result.upgradedBest!.dps.dps - result.currentBest!.dps.dps,
      5,
    );
  });

  it("leaves unchanged slots out of the comparison map", () => {
    const FANG = 26219;
    const DHL = 22978;
    const GEAR = [26674, 24780, 20445, 11832, 11834, 7462, 11840, 26770, 20463, 20220];
    const result = findUpgrades({
      bank: [FANG, ...GEAR],
      target: RUNE_DRAGON,
      skills: SKILLS_AT_99,
      gp: 100_000_000,
      mode: "gp-only",
      onTask: true,
      priceLookup: (id: number) => (id === DHL ? 60_000_000 : null),
    });

    const vsBank = compareSlotsVsReference({
      displayed: result.upgradedBest!.loadout,
      displayedDps: result.upgradedBest!.dps.dps,
      reference: result.currentBest!.loadout,
      target: RUNE_DRAGON,
      skills: SKILLS_AT_99,
      boostResolver: () => undefined,
      onTask: true,
      soulreaperMaxStacks: false,
    });

    // Only the weapon changed, so every other slot is absent from the map.
    expect(vsBank.body).toBeUndefined();
    expect(vsBank.feet).toBeUndefined();
    expect(Object.keys(vsBank)).toEqual(["weapon"]);
  });
});
