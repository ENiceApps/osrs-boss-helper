/**
 * Regression: the boss page's manual gear editor (applyOverrides) must derive
 * the same item-bonus flags as the optimizer (scoreScenario). It used to omit
 * golembaneBarronite, golembaneGraniteHammer and wildernessWeapon, so swapping
 * in a Barronite mace / Granite hammer vs a golem, or a charged wilderness
 * weapon vs a Wilderness boss — or editing ANY slot of a set that already had
 * one — silently dropped the conditional bonus from the displayed DPS.
 */
import { describe, expect, it } from "vitest";
import { applyOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { scoreScenario } from "@/lib/optimize/scenario";
import { activeBonusesForTarget } from "@/lib/loadout";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG, type MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { ItemBonusFlags, LoadoutSet, LoadoutSlotKey } from "@/types/loadout";

const BARRONITE_MACE = 25641;
const GRANITE_HAMMER = 21742;
const CRAWS_BOW = 22550;
const GRANITE_MAUL = 4153; // Blunt, like both golembane weapons — keeps the crush style legal
const MAGIC_SHORTBOW = 861;
const RUNE_ARROW = 892;
const BARROWS_GLOVES = 7462;

const MAD_ANGEL = MONSTER_BY_SLUG["mad-angel"]; // golem
const CALLISTO = MONSTER_BY_SLUG["callisto"]; // Wilderness boss

type FlagKey = "golembaneBarronite" | "golembaneGraniteHammer" | "wildernessWeapon";

function scored(itemIds: number[], target: MonsterCatalogEntry, set?: LoadoutSet) {
  const s = scoreScenario({
    itemIds,
    target,
    skills: SKILLS_AT_99,
    // Pin the edited set's style so the optimizer-side score is comparable.
    ...(set ? { attackStyle: { attackType: set.attackType, choice: set.attackStyleChoice } } : {}),
  });
  if (!s.valid) throw new Error(`invalid scenario: ${s.reasons.join("; ")}`);
  return s;
}

function edit(base: LoadoutSet, overrides: Partial<Record<LoadoutSlotKey, number | null>>): LoadoutSet {
  const resolved = Object.fromEntries(
    Object.entries(overrides).map(([slot, id]) => [slot, id === null ? null : findCatalogItem(id)!]),
  );
  return applyOverrides(base, resolved);
}

function withoutFlag(set: LoadoutSet, flag: FlagKey): LoadoutSet {
  const itemBonusFlags: ItemBonusFlags = { ...set.itemBonusFlags, [flag]: false };
  return { ...set, itemBonusFlags };
}

function finalItemIds(set: LoadoutSet): number[] {
  return Object.values(set.slots).map((s) => s!.itemId);
}

describe("manual gear edit keeps golembane / wilderness-weapon bonuses", () => {
  const cases: Array<{
    name: string;
    base: number[];
    swap: Partial<Record<LoadoutSlotKey, number | null>>;
    target: MonsterCatalogEntry;
    flag: FlagKey;
  }> = [
    {
      name: "Barronite mace vs Mad Angel",
      base: [GRANITE_MAUL],
      swap: { weapon: BARRONITE_MACE },
      target: MAD_ANGEL,
      flag: "golembaneBarronite",
    },
    {
      name: "Granite hammer vs Mad Angel",
      base: [GRANITE_MAUL],
      swap: { weapon: GRANITE_HAMMER },
      target: MAD_ANGEL,
      flag: "golembaneGraniteHammer",
    },
    {
      name: "Craw's bow vs Callisto",
      base: [MAGIC_SHORTBOW, RUNE_ARROW],
      swap: { weapon: CRAWS_BOW, ammo: null },
      target: CALLISTO,
      flag: "wildernessWeapon",
    },
  ];

  for (const c of cases) {
    it(`${c.name}: swapping the weapon in derives and applies the flag`, () => {
      const edited = edit(scored(c.base, c.target).loadout, c.swap);

      expect(edited.itemBonusFlags[c.flag]).toBe(true);
      expect(activeBonusesForTarget(edited, c.target).conditionalBonuses[c.flag]).toBe(true);

      const withBonus = computeSetDps(edited, c.target, SKILLS_AT_99);
      const without = computeSetDps(withoutFlag(edited, c.flag), c.target, SKILLS_AT_99);
      expect(withBonus.maxHit).toBeGreaterThan(without.maxHit);
      expect(withBonus.dps).toBeGreaterThan(without.dps);

      // Same gear scored through the optimizer path lands on the same numbers.
      const optimizer = scored(finalItemIds(edited), c.target, edited);
      expect(withBonus.maxHit).toBe(optimizer.dps.maxHit);
      expect(withBonus.dps).toBeCloseTo(optimizer.dps.dps, 10);
    });
  }

  it("editing an unrelated slot of a set that already has the bonus doesn't drop it", () => {
    for (const [weapon, target, flag] of [
      [BARRONITE_MACE, MAD_ANGEL, "golembaneBarronite"],
      [GRANITE_HAMMER, MAD_ANGEL, "golembaneGraniteHammer"],
      [CRAWS_BOW, CALLISTO, "wildernessWeapon"],
    ] as const) {
      const base = scored([weapon], target);
      expect(base.loadout.itemBonusFlags[flag]).toBe(true);

      const edited = edit(base.loadout, { hands: BARROWS_GLOVES });
      expect(edited.itemBonusFlags[flag]).toBe(true);
      const optimizer = scored([weapon, BARROWS_GLOVES], target, edited);
      expect(computeSetDps(edited, target, SKILLS_AT_99).maxHit).toBe(optimizer.dps.maxHit);
    }
  });
});
