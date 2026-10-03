// Attack-style (stance) bonus on the effective level, magic vs melee / ranged.
//
// Magic's Accurate stance — only a powered staff has one — is +2 on magic's +9
// base: upstream weirdgloop/osrs-dps-calc getPlayerMaxMagicAttackRoll
// (src/lib/PlayerVsNPCCalc.ts @ 89c3e25, unchanged since the 2023 port) does
// `if (style.stance === 'Accurate') effectiveLevel += 2; effectiveLevel += 9;`.
// The wiki's "+3 accurate / +1 longrange (trident only)" (Bitterkoekje, Combat
// Formulas, 2015) sits on a +8 base for every stance — the same 11 / 9. Melee
// and ranged Accurate stay +3 on +8. The engine had +3 on +9 = 12, so every
// powered staff on Accurate rolled one effective level (~0.7%) high.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance, npcDefenceRoll } from "@/lib/dps/common";
import type { ArmorSetBonus } from "@/data/armor-sets";

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };
// Defence roll (91 + 9) × (36 + 64) = 10000 for every scenario below.
const DEF_ROLL = npcDefenceRoll(91, 36);

/** Powered-staff-like magic: attack bonus 30 (+64 = 94), base hit 24, +25% damage. */
function magic(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 30, strengthBonus: 0, attackSpeedTicks: 4,
    baseSpellMaxHit: 24, magicDamagePercent: 25,
    targetDefenceLevel: 91, targetDefenceBonusForStyle: 36, ...over,
  };
}

describe("magic stance bonus", () => {
  it("Accurate is +2 on the +9 base: (99 + 2 + 9) × 94 = 10340 (was +3: 111 × 94 = 10434)", () => {
    expect(calculateDps(magic()).accuracy).toBe(hitChance(10340, DEF_ROLL));
  });

  it("Longrange, Defensive (and an unreachable Controlled) add nothing: 108 × 94 = 10152", () => {
    for (const attackStyle of ["longrange", "defensive", "controlled"] as const) {
      expect(calculateDps(magic({ attackStyle })).accuracy).toBe(hitChance(10152, DEF_ROLL));
    }
  });

  it("Augury, Accurate: floor(99 × 1.25) = 123 + 2 + 9 = 134, × (126 + 64) = 25460 — wgloop's Trident of the Swamp roll", () => {
    const r = calculateDps(magic({
      attackBonus: 126,
      prayers: { ...NO_PRAYER, magicAttackMultiplier: 1.25, magicDamageMultiplier: 1.04 },
    }));
    expect(r.accuracy).toBe(hitChance(25460, DEF_ROLL));
  });

  it("Void magic ×29/20 takes the stance inside: trunc(110 × 1.45) = 159 × 94 = 14946 (was 160 / 15040)", () => {
    const voidMagic: ArmorSetBonus = {
      id: "void-magic", name: "Void Knight (Magic)", accuracyFactor: [29, 20], accuracyOnEffectiveLevel: true,
    };
    expect(calculateDps(magic({ armorSetBonus: voidMagic })).accuracy).toBe(hitChance(14946, DEF_ROLL));
    // Longrange: trunc(108 × 1.45) = 156 × 94 = 14664.
    expect(calculateDps(magic({ armorSetBonus: voidMagic, attackStyle: "longrange" })).accuracy)
      .toBe(hitChance(14664, DEF_ROLL));
  });

  it("the stance never touches the max hit: 24 + trunc(24 × 25%) = 30 on both", () => {
    expect(calculateDps(magic()).maxHit).toBe(30);
    expect(calculateDps(magic({ attackStyle: "longrange" })).maxHit).toBe(30);
  });
});

describe("melee / ranged Accurate stay +3 on +8", () => {
  it("melee: (99 + 3 + 8) × (100 + 64) = 18040", () => {
    const r = calculateDps({
      style: "melee", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
      attackBonus: 100, strengthBonus: 0, attackSpeedTicks: 4,
      targetDefenceLevel: 91, targetDefenceBonusForStyle: 36,
    });
    expect(r.accuracy).toBe(hitChance(18040, DEF_ROLL));
  });

  it("ranged: (99 + 3 + 8) × (100 + 64) = 18040", () => {
    const r = calculateDps({
      style: "ranged", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
      attackBonus: 100, strengthBonus: 0, attackSpeedTicks: 5,
      targetDefenceLevel: 91, targetDefenceBonusForStyle: 36,
    });
    expect(r.accuracy).toBe(hitChance(18040, DEF_ROLL));
  });
});
