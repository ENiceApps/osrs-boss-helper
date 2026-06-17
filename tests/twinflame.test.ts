import { describe, expect, it } from "vitest";
import { bestSpell } from "@/data/spells/catalog";
import { calculateDps } from "@/lib/dps/calculate";

describe("Twinflame staff — spell selection", () => {
  it("Twinflame restricts the auto-pick to Standard spells; Fire Wave (20 ×7/5 = 28) beats Fire Surge (24, no double-cast)", () => {
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [], twinflame: true });
    expect(spell?.name).toBe("Fire Wave");
  });

  it("Twinflame winner is always a qualifying Bolt/Blast/Wave, never a Surge/Strike", () => {
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [], twinflame: true });
    expect(/(Bolt|Blast|Wave)$/.test(spell?.name ?? "")).toBe(true);
  });

  it("without Twinflame, the staff is unconstrained, so a higher-max Ancient spell can win", () => {
    // Contrast: no Twinflame means no spellbook restriction → Ice Barrage (30) tops Fire Surge (24).
    const spell = bestSpell({ magicLevel: 99, targetAttributes: [] });
    expect(spell?.name).toBe("Ice Barrage");
  });
});

describe("Twinflame staff — DPS engine", () => {
  const magicBase = {
    style: "magic" as const,
    attackStyle: "accurate" as const,
    prayers: {
      attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    },
    skills: { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99 },
    attackBonus: 30,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit: 20, // Fire Wave
    spellElement: "fire" as const,
    attackSpeedTicks: 5,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
  };

  it("+10% accuracy & damage on a standard cast", () => {
    const off = calculateDps(magicBase);
    const on = calculateDps({ ...magicBase, twinflameStandard: true });
    expect(on.maxHit).toBe(22); // trunc(20 × 11/10)
    expect(on.accuracy).toBeGreaterThan(off.accuracy);
  });

  it("second cast adds ~40% damage on a qualifying spell (stacks on the +10%)", () => {
    const both = calculateDps({
      ...magicBase,
      twinflameStandard: true,
      twinflameDoubleCast: true,
    });
    expect(both.maxHit).toBe(30); // trunc(trunc(20 × 11/10) × 7/5) = trunc(22 × 7/5) = 30
  });

  it("raises DPS over a plain staff casting the same spell", () => {
    const plain = calculateDps(magicBase);
    const twin = calculateDps({ ...magicBase, twinflameStandard: true, twinflameDoubleCast: true });
    expect(twin.dps).toBeGreaterThan(plain.dps);
  });
});
