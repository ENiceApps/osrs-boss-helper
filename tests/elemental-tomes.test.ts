// Elemental tomes vs upstream weirdgloop/osrs-dps-calc (89c3e25, 2026-09-02)
// and the OSRS Wiki. Regression tests for the 2026-10 fix:
//
//   - All three charged tomes are ×11/10 DAMAGE vs NPCs. The Tome of Water was
//     ×6/5 until Project Rebalance (2024-05-29) cut it to 10%; we still had
//     ×6/5. (wgloop: `trackFactor(MAX_HIT_TOME, maxHit, [11, 10])` for all three.)
//   - The Tome of Earth has NO accuracy bonus (wiki: damage only; wgloop has
//     none). We applied ×11/10.
//   - The Tome of Water keeps ×6/5 ACCURACY (wgloop PLAYER_ACCURACY_TOME), applied
//     after the slayer helm / Salve / DHW multipliers, then the elemental
//     weakness is ADDED from the base roll — wgloop's
//     attackRoll + trunc(baseRoll × severity/100). We multiplied the weakness in
//     first, so the tome (and the slayer helm) also scaled the weakness bonus.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance, npcDefenceRoll } from "@/lib/dps/common";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { buildActiveFlags } from "@/components/ResultsPanel";
import { spellEffectiveMaxHit, SPELLS_BY_NAME } from "@/data/spells/catalog";

const NO_PRAYER = {
  attackMultiplier: 1,
  strengthMultiplier: 1,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};

// Magic 99, no prayer, a 0-bonus stance, +100 magic attack:
//   effective level 99 + 9 = 108; base roll 108 × (100 + 64) = 17712.
const BASE_ROLL = 17712;
const DEF_LEVEL = 100;
const DEF_BONUS = 50;
const DEF_ROLL = npcDefenceRoll(DEF_LEVEL, DEF_BONUS); // 109 × 114 = 12426

function scenario(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic",
    attackStyle: "rapid", // +0 magic level, +0 speed for magic
    prayers: NO_PRAYER,
    skills: { ...SKILLS_AT_99 },
    attackBonus: 100,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit: 24,
    spellElement: "water",
    attackSpeedTicks: 5,
    targetDefenceLevel: DEF_LEVEL,
    targetDefenceBonusForStyle: DEF_BONUS,
    ...over,
  };
}

const accuracyFor = (attackRoll: number) => hitChance(attackRoll, DEF_ROLL);

describe("elemental tomes — damage", () => {
  it("Tome of Water is ×11/10 damage vs NPCs, not the pre-Rebalance ×6/5 (24 -> 26, not 28)", () => {
    expect(calculateDps(scenario()).maxHit).toBe(24);
    expect(calculateDps(scenario({ tomeOfWaterEquipped: true })).maxHit).toBe(26);
  });

  it("all three tomes give the same ×11/10 on their own element", () => {
    for (const [el, flag] of [
      ["fire", "tomeOfFireEquipped"],
      ["water", "tomeOfWaterEquipped"],
      ["earth", "tomeOfEarthEquipped"],
    ] as const) {
      expect(calculateDps(scenario({ spellElement: el, [flag]: true })).maxHit, el).toBe(26);
    }
  });

  it("the tome multiplies the weakness-boosted hit: 24 + trunc(24 x 50%) = 36 -> x11/10 = 39 (was 43)", () => {
    const weak = { element: "water" as const, severity: 50 };
    expect(calculateDps(scenario({ targetWeakness: weak, tomeOfWaterEquipped: true })).maxHit).toBe(39);
  });

  it("the spell auto-pick ranks with the same ×11/10 (Water Surge 24 -> 26)", () => {
    const waterSurge = SPELLS_BY_NAME.get("Water Surge")!;
    expect(
      spellEffectiveMaxHit(waterSurge, { magicLevel: 99, targetAttributes: [], tomeOfWater: true }),
    ).toBe(26);
  });
});

describe("elemental tomes — accuracy", () => {
  it("Tome of Earth adds no accuracy (it used to apply ×11/10)", () => {
    const off = calculateDps(scenario({ spellElement: "earth" }));
    const on = calculateDps(scenario({ spellElement: "earth", tomeOfEarthEquipped: true }));
    expect(off.accuracy).toBeCloseTo(accuracyFor(BASE_ROLL), 12);
    expect(on.accuracy).toBe(off.accuracy);
    expect(on.maxHit).toBe(26); // the damage half still fires
  });

  it("Tome of Water keeps ×6/5 accuracy on water spells (17712 -> 21254)", () => {
    const r = calculateDps(scenario({ tomeOfWaterEquipped: true }));
    expect(r.accuracy).toBeCloseTo(accuracyFor(21254), 12);
  });

  it("the Tome of Water does not scale the weakness accuracy bonus (30110, was 31881)", () => {
    // wgloop: trunc(17712 × 6/5) = 21254, then + trunc(17712 × 50/100) = 8856.
    // The old order — trunc(trunc(17712 × 150/100) × 6/5) — gave 31881.
    const weak = { element: "water" as const, severity: 50 };
    const r = calculateDps(scenario({ targetWeakness: weak, tomeOfWaterEquipped: true }));
    expect(r.accuracy).toBeCloseTo(accuracyFor(21254 + 8856), 12);
  });

  it("the slayer helm does not scale it either (on task: 29224, was 30553)", () => {
    // trunc(17712 × 23/20) = 20368, + 8856 from the unboosted base roll.
    const weak = { element: "water" as const, severity: 50 };
    const r = calculateDps(scenario({ targetWeakness: weak, slayerOnTask: true }));
    expect(r.accuracy).toBeCloseTo(accuracyFor(20368 + 8856), 12);
  });

  it("weakness alone is unchanged: base + trunc(base × severity/100)", () => {
    const weak = { element: "water" as const, severity: 50 };
    const r = calculateDps(scenario({ targetWeakness: weak }));
    expect(r.accuracy).toBeCloseTo(accuracyFor(BASE_ROLL + 8856), 12);
  });
});

describe("elemental tomes — end to end (K'ril Tsutsaroth, 30% water weakness)", () => {
  const KRIL = MONSTER_BY_SLUG["kril-tsutsaroth"];
  const STAFF_OF_WATER = 1383;
  const TOME_OF_WATER = 25574; // charged

  function waterSurge(itemIds: number[]) {
    const scored = scoreScenario({
      itemIds,
      target: KRIL,
      skills: SKILLS_AT_99,
      baseSpellMaxHit: 24,
      spellElement: "water",
      autoSpellName: "Water Surge",
    });
    if (!scored.valid) throw new Error(scored.reasons.join("; "));
    return scored;
  }

  it("Water Surge + Tome of Water: 24 (Augury +4% rounds down) + trunc(24 x 30%) = 31 -> x11/10 = 34", () => {
    expect(KRIL.weakness).toEqual({ element: "water", severity: 30 });
    expect(waterSurge([STAFF_OF_WATER]).dps.maxHit).toBe(31);
    expect(waterSurge([STAFF_OF_WATER, TOME_OF_WATER]).dps.maxHit).toBe(34); // was trunc(31 x 6/5) = 37
  });

  it("the results panel describes the tomes with the corrected numbers", () => {
    const scored = waterSurge([STAFF_OF_WATER, TOME_OF_WATER]);
    expect(buildActiveFlags(scored.loadout, scored.activeBonuses)).toContain(
      "Tome of Water +20% acc / +10% dmg",
    );
  });
});
