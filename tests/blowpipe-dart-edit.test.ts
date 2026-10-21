/**
 * Regression: the boss page's manual gear editor (applyOverrides) must treat
 * a blowpipe's dart as part of the WEAPON, not as baggage from the base set.
 *
 * Before: the dart only existed when the optimizer built the set. Swapping a
 * blowpipe in by hand gave an empty pipe (no dart, no "loaded" chip, DPS with
 * zero dart strength), and swapping a blowpipe OUT kept adding the old dart's
 * ranged strength to the new weapon. There was also no way to pick a dart.
 */
import { describe, expect, it } from "vitest";
import {
  applyOverrides,
  dartsForBlowpipe,
  findCatalogItem,
  hasOverrides,
} from "@/lib/loadout-edit";
import { scoreScenario } from "@/lib/optimize/scenario";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

const TOXIC_BLOWPIPE = 12926; // Charged
const CAMPHOR_BLOWPIPE = 31575; // Charged — Hunter's Guild, up to mithril
const TWISTED_BOW = 20997;
const DRAGON_ARROW = 11212;
const DRAGON_DART = 11230; // Unpoisoned
const RUNE_DART = 811; // Unpoisoned
const MITHRIL_DART = 809; // Unpoisoned
const BARROWS_GLOVES = 7462;

const ZULRAH = MONSTER_BY_SLUG["zulrah"];

function scored(itemIds: number[], internalAmmoId?: number) {
  const s = scoreScenario({
    itemIds,
    target: ZULRAH,
    skills: SKILLS_AT_99,
    attackStyle: { attackType: "ranged", choice: "rapid" },
    internalAmmoId,
  });
  if (!s.valid) throw new Error(`invalid scenario: ${s.reasons.join("; ")}`);
  return s;
}

const item = (id: number) => findCatalogItem(id)!;

/** Both paths (manual edit vs optimizer) must land on identical numbers. */
function expectSameDps(edited: LoadoutSet, optimizer: ReturnType<typeof scored>) {
  expect(edited.internalAmmo?.itemId).toBe(optimizer.loadout.internalAmmo?.itemId);
  expect(edited.totals.strengthBonus).toBe(optimizer.loadout.totals.strengthBonus);
  const dps = computeSetDps(edited, ZULRAH, SKILLS_AT_99);
  expect(dps.maxHit).toBe(optimizer.dps.maxHit);
  expect(dps.dps).toBeCloseTo(optimizer.dps.dps, 10);
}

describe("dartsForBlowpipe", () => {
  it("lists the darts a pipe can load, best first, plain variant ahead of poisoned", () => {
    const toxic = dartsForBlowpipe(TOXIC_BLOWPIPE);
    expect(toxic[0].id).toBe(DRAGON_DART);
    expect(toxic.every((d) => d.name.endsWith(" dart"))).toBe(true);
    expect(toxic.some((d) => d.name === "Atlatl dart")).toBe(false);
  });

  it("honours the Hunter's Guild tier cap", () => {
    const camphor = dartsForBlowpipe(CAMPHOR_BLOWPIPE);
    expect(camphor[0].id).toBe(MITHRIL_DART);
    expect(camphor.some((d) => d.name === "Rune dart" || d.name === "Dragon dart")).toBe(false);
  });

  it("is empty for a weapon that isn't a blowpipe", () => {
    expect(dartsForBlowpipe(TWISTED_BOW)).toEqual([]);
    expect(dartsForBlowpipe(undefined)).toEqual([]);
  });
});

describe("applyOverrides — blowpipe darts", () => {
  it("swapping a blowpipe IN loads the best dart it can fire", () => {
    const base = scored([TWISTED_BOW, DRAGON_ARROW]).loadout;
    expect(base.internalAmmo).toBeUndefined();

    const edited = applyOverrides(base, { weapon: item(TOXIC_BLOWPIPE), ammo: null });
    expect(edited.internalAmmo?.itemId).toBe(DRAGON_DART);
    expectSameDps(edited, scored([TOXIC_BLOWPIPE], DRAGON_DART));

    // The dart's strength is really in the totals: without it the pipe hits lower.
    const empty = applyOverrides(base, { weapon: item(TOXIC_BLOWPIPE), ammo: null }, undefined, undefined, null);
    expect(edited.totals.strengthBonus - empty.totals.strengthBonus).toBe(item(DRAGON_DART).rangedStr);
  });

  it("swapping a blowpipe OUT drops its dart from the new weapon's totals", () => {
    const base = scored([TOXIC_BLOWPIPE], DRAGON_DART).loadout;
    expect(base.internalAmmo?.itemId).toBe(DRAGON_DART);

    const edited = applyOverrides(base, { weapon: item(TWISTED_BOW), ammo: item(DRAGON_ARROW) });
    expect(edited.internalAmmo).toBeUndefined();
    expectSameDps(edited, scored([TWISTED_BOW, DRAGON_ARROW]));
  });

  it("an explicit dart pick replaces the loaded one", () => {
    const base = scored([TOXIC_BLOWPIPE], DRAGON_DART).loadout;
    const edited = applyOverrides(base, {}, undefined, undefined, item(RUNE_DART));
    expect(edited.internalAmmo?.itemId).toBe(RUNE_DART);
    expectSameDps(edited, scored([TOXIC_BLOWPIPE], RUNE_DART));
  });

  it("null unloads the pipe", () => {
    const base = scored([TOXIC_BLOWPIPE], DRAGON_DART).loadout;
    const edited = applyOverrides(base, {}, undefined, undefined, null);
    expect(edited.internalAmmo).toBeUndefined();
    expectSameDps(edited, scored([TOXIC_BLOWPIPE]));
  });

  it("editing an unrelated slot keeps the loaded dart", () => {
    const base = scored([TOXIC_BLOWPIPE], RUNE_DART).loadout;
    const edited = applyOverrides(base, { hands: item(BARROWS_GLOVES) });
    expect(edited.internalAmmo?.itemId).toBe(RUNE_DART);
    expectSameDps(edited, scored([TOXIC_BLOWPIPE, BARROWS_GLOVES], RUNE_DART));
  });

  it("a carried dart the new pipe can't load falls back to the best legal one", () => {
    const base = scored([TOXIC_BLOWPIPE], DRAGON_DART).loadout;
    const edited = applyOverrides(base, { weapon: item(CAMPHOR_BLOWPIPE) });
    expect(edited.internalAmmo?.itemId).toBe(MITHRIL_DART);
    expectSameDps(edited, scored([CAMPHOR_BLOWPIPE], MITHRIL_DART));

    // Same for an explicit pick the pipe can't take.
    const picked = applyOverrides(base, { weapon: item(CAMPHOR_BLOWPIPE) }, undefined, undefined, item(DRAGON_DART));
    expect(picked.internalAmmo?.itemId).toBe(MITHRIL_DART);
  });
});

describe("hasOverrides — dart", () => {
  it("counts a dart change, ignores re-picking the loaded dart", () => {
    const loaded = scored([TOXIC_BLOWPIPE], DRAGON_DART).loadout;
    expect(hasOverrides(loaded, {}, null, undefined)).toBe(false);
    expect(hasOverrides(loaded, {}, null, item(DRAGON_DART))).toBe(false);
    expect(hasOverrides(loaded, {}, null, item(RUNE_DART))).toBe(true);
    expect(hasOverrides(loaded, {}, null, null)).toBe(true); // unloading a loaded pipe

    const empty = scored([TOXIC_BLOWPIPE]).loadout;
    expect(hasOverrides(empty, {}, null, null)).toBe(false); // already empty
    expect(hasOverrides(empty, {}, null, item(RUNE_DART))).toBe(true);
  });
});
