/**
 * Summer Sweep-Up follow-ups (2026-07-22 / 2026-09-16):
 *   - Soulreaper axe (o) (item 33335) gets the same max-stacks +30% Strength
 *     level as the base Soulreaper axe (28338) — the 2026-07-22 post covers both.
 *   - The Corporeal Beast "Blue Moon spear is NOT a corpbane weapon" exclusion
 *     survives the in-game rename "Blue moon spear" -> "Blue Moon spear"
 *     (2026-09-16): it keys off item id 28988, with a case-insensitive name
 *     fallback, so a vendor refresh that carries the new casing can't silently
 *     flip it to a full-damage spear.
 */
import { describe, expect, it } from "vitest";
import { computeSetDps, SOULREAPER_AXE_IDS, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

/** Minimal melee LoadoutSet (same shape as tests/new-mechanics.test.ts). */
function meleeSet(overrides: Partial<LoadoutSet> = {}): LoadoutSet {
  return {
    id: "test",
    name: "Test",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    slots: { weapon: { itemId: 1, itemName: "Sword" } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    itemBonusFlags: {
      dragonHunterCrossbow: false, dragonHunterLance: false, dragonHunterWand: false,
      salveAmuletEi: false, salveAmulet: false, demonbane: false,
      tomeOfFire: false, tomeOfWater: false, tomeOfEarth: false,
      twistedBow: false, fang: false, slayerHelmImbued: false,
    },
    weaponCategory: "Sword",
    ...overrides,
  } as LoadoutSet;
}

/** Flat monster — no attributes, minimal defence. */
const DUMMY = {
  slug: "test-dummy",
  name: "Test Dummy",
  combatLevel: 1,
  hp: 100,
  size: 1,
  defenceLevel: 1,
  magicLevel: 1,
  defenceBonuses: { stab: 0, slash: 0, crush: 0, magic: 0, rangedHeavy: 0, rangedStandard: 0, rangedLight: 0 },
  attributes: [],
  isSlayerMonster: false,
} as unknown as MonsterCatalogEntry;

describe("Soulreaper axe (o) — max stacks (+30% Str level)", () => {
  const SOULREAPER = 28338;
  const SOULREAPER_O = 33335;
  const axe = (itemId: number, itemName: string) =>
    meleeSet({ slots: { weapon: { itemId, itemName } } });

  it("both the base axe and the (o) ornament variant are recognised", () => {
    expect(SOULREAPER_AXE_IDS.has(SOULREAPER)).toBe(true);
    expect(SOULREAPER_AXE_IDS.has(SOULREAPER_O)).toBe(true);
    expect(SOULREAPER_AXE_IDS.has(1)).toBe(false);
  });

  it("(o) with max stacks raises DPS, and by exactly what the base axe gets", () => {
    const base = axe(SOULREAPER, "Soulreaper axe");
    const ornate = axe(SOULREAPER_O, "Soulreaper axe (o)");
    const off = computeSetDps(ornate, DUMMY, SKILLS_AT_99, undefined, false, false);
    const on = computeSetDps(ornate, DUMMY, SKILLS_AT_99, undefined, false, true);
    expect(on.dps).toBeGreaterThan(off.dps);
    expect(on.maxHit).toBeGreaterThan(off.maxHit);
    // Same stats + same mechanic -> identical numbers to the plain axe.
    const baseOn = computeSetDps(base, DUMMY, SKILLS_AT_99, undefined, false, true);
    expect(on.dps).toBeCloseTo(baseOn.dps, 10);
    expect(on.maxHit).toBe(baseOn.maxHit);
  });

  it("(o) Strength level is floored: floor(99 × 1.3) = 128", () => {
    const set = axe(SOULREAPER_O, "Soulreaper axe (o)");
    const boosted = computeSetDps(set, DUMMY, { ...SKILLS_AT_99, strength: 99 }, undefined, false, true);
    const manual = computeSetDps(set, DUMMY, { ...SKILLS_AT_99, strength: 128 }, undefined, false, false);
    expect(boosted.dps).toBeCloseTo(manual.dps, 10);
  });

  it("no effect for a non-Soulreaper weapon, or with the flag off", () => {
    const other = axe(1, "Not Soulreaper");
    expect(computeSetDps(other, DUMMY, SKILLS_AT_99, undefined, false, true).dps).toBeCloseTo(
      computeSetDps(other, DUMMY, SKILLS_AT_99, undefined, false, false).dps,
      10,
    );
    // Flag off: the (o) axe is just an ordinary weapon, identical to the plain
    // axe's un-stacked numbers.
    const ornate = axe(SOULREAPER_O, "Soulreaper axe (o)");
    const plain = axe(SOULREAPER, "Soulreaper axe");
    expect(computeSetDps(ornate, DUMMY, SKILLS_AT_99, undefined, false, false).dps).toBeCloseTo(
      computeSetDps(plain, DUMMY, SKILLS_AT_99, undefined, false, false).dps,
      10,
    );
  });
});

describe("Corporeal Beast — Blue Moon spear stays excluded from the corpbane rule", () => {
  const CORP = MONSTER_BY_SLUG["corporeal-beast"];
  const BLUE_MOON_SPEAR = 28988;
  const DRAGON_SPEAR = 1249;
  const spear = (itemId: number | undefined, itemName: string) =>
    meleeSet({
      attackType: "stab",
      weaponCategory: "Spear",
      slots: { weapon: { itemId: itemId as number, itemName } },
    });
  const maxHitAgainstCorp = (itemId: number | undefined, itemName: string) =>
    computeSetDps(spear(itemId, itemName), CORP, SKILLS_AT_99).maxHit;

  it("the target is the Corporeal Beast", () => {
    expect(CORP).toBeDefined();
  });

  it("a regular stab spear is corpbane (full damage); the Blue Moon spear is halved", () => {
    const full = maxHitAgainstCorp(DRAGON_SPEAR, "Dragon spear");
    expect(maxHitAgainstCorp(BLUE_MOON_SPEAR, "Blue moon spear")).toBe(Math.trunc(full / 2));
  });

  it("is robust to the 2026-09-16 rename: new casing, same item id -> still halved", () => {
    const full = maxHitAgainstCorp(DRAGON_SPEAR, "Dragon spear");
    expect(maxHitAgainstCorp(BLUE_MOON_SPEAR, "Blue Moon spear")).toBe(Math.trunc(full / 2));
  });

  it("item id alone is enough (a stale or unexpected name can't re-enable it)", () => {
    const full = maxHitAgainstCorp(DRAGON_SPEAR, "Dragon spear");
    expect(maxHitAgainstCorp(BLUE_MOON_SPEAR, "Some future display name spear")).toBe(
      Math.trunc(full / 2),
    );
  });

  it("name fallback is case-insensitive for callers that carry no usable id", () => {
    const full = maxHitAgainstCorp(DRAGON_SPEAR, "Dragon spear");
    const half = Math.trunc(full / 2);
    expect(maxHitAgainstCorp(undefined, "Blue Moon spear")).toBe(half);
    expect(maxHitAgainstCorp(undefined, "BLUE MOON SPEAR")).toBe(half);
    expect(maxHitAgainstCorp(undefined, "Blue moon spear")).toBe(half);
  });

  it("other spears and the halberd rule are unaffected", () => {
    const full = maxHitAgainstCorp(DRAGON_SPEAR, "Dragon spear");
    expect(maxHitAgainstCorp(1, "Zamorakian spear")).toBe(full);
    expect(maxHitAgainstCorp(1, "Crystal halberd")).toBe(full);
  });
});
