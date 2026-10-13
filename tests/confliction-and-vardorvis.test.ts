import { describe, expect, it } from "vitest";
import { conflictionHitChance, fangHitChance, hitChance } from "@/lib/dps/common";
import { itemBonusFlagsFor } from "@/lib/loadout-edit";
import { scoreScenario } from "@/lib/optimize/scenario";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";

// Numbers locked from the wgloop engine (weirdgloop/osrs-dps-calc @ 89c3e25)
// via `npm run oracle -- --optimize --bosses=zulrah,hespori,vardorvis`.

const CONFLICTION = 31106;
const HARMONISED_STAFF = 24423; // one-handed
const TUMEKENS_SHADOW = 27275; // two-handed

// The app's best magic pick at Zulrah / Hespori (owns-everything bank).
const HARMONISED_MAGIC = [
  HARMONISED_STAFF, 21018, 24240, 21021, 21024, CONFLICTION, 31093, 28313, 22947, 20714, 34425,
];

function score(slug: string, itemIds: number[], attackStyle: Parameters<typeof scoreScenario>[0]["attackStyle"], magic = false) {
  const scored = scoreScenario({
    itemIds,
    target: MONSTER_BY_SLUG[slug],
    skills: SKILLS_AT_99,
    attackStyle,
    ...(magic ? { baseSpellMaxHit: 24, spellElement: "fire" as const, autoSpellName: "Fire Surge" } : {}),
    onTask: false,
  });
  if (!scored.valid) throw new Error(scored.reasons.join("; "));
  return scored;
}

describe("Confliction gauntlets", () => {
  it("matches wgloop's getConflictionGauntletsAccuracyRoll", () => {
    expect(conflictionHitChance(45144, 5871)).toBeCloseTo(0.9386014277832059, 12);
    expect(conflictionHitChance(60192, 19440)).toBeCloseTo(0.85666646539564, 12);
  });

  it("is the stationary hit rate of the hit/miss chain", () => {
    // After a hit the next cast rolls once (s), after a miss twice (d).
    for (const [a, d] of [[3, 7], [7, 3], [50, 50], [1000, 4000]]) {
      const s = hitChance(a, d);
      const dbl = fangHitChance(a, d);
      let pHit = 0.5;
      for (let i = 0; i < 10_000; i++) pHit = pHit * s + (1 - pHit) * dbl;
      expect(conflictionHitChance(a, d)).toBeCloseTo(pHit, 12);
      expect(conflictionHitChance(a, d)).toBeGreaterThanOrEqual(s);
      expect(conflictionHitChance(a, d)).toBeLessThanOrEqual(dbl);
    }
  });

  it("only counts with a one-handed weapon", () => {
    expect(itemBonusFlagsFor(new Set([HARMONISED_STAFF, CONFLICTION])).conflictionGauntlets).toBe(true);
    expect(itemBonusFlagsFor(new Set([TUMEKENS_SHADOW, CONFLICTION])).conflictionGauntlets).toBe(false);
    expect(itemBonusFlagsFor(new Set([HARMONISED_STAFF])).conflictionGauntlets).toBe(false);
  });

  it("matches the wiki calc end to end (Harmonised staff + Fire Surge)", () => {
    const style = { attackType: "magic" as const, choice: "longrange" as const };
    const zulrah = score("zulrah", HARMONISED_MAGIC, style, true);
    expect(zulrah.activeBonuses.conflictionGauntlets).toBe(true);
    expect(zulrah.dps.accuracy).toBeCloseTo(0.9386014277832059, 9);
    expect(zulrah.dps.dps).toBeCloseTo(10.273195411346277, 6);

    const hespori = score("hespori", HARMONISED_MAGIC, style, true);
    expect(hespori.dps.accuracy).toBeCloseTo(0.85666646539564, 9);
    expect(hespori.dps.dps).toBeCloseTo(12.141281366446663, 6);
  });
});

describe("Vardorvis defence", () => {
  it("uses the full-HP Defence the wiki calc shows (215 post-quest)", () => {
    expect(MONSTER_BY_SLUG["vardorvis"].defenceLevel).toBe(215);
    const melee = score(
      "vardorvis",
      [25736, 30750, 24224, 29801, 30753, 30756, 22981, 31097, 28316, 22947],
      { attackType: "slash", choice: "aggressive" },
    );
    expect(melee.dps.accuracy).toBeCloseTo(0.6139005424471582, 9);
    expect(melee.dps.dps).toBeCloseTo(6.255938861128184, 6);
  });
});
