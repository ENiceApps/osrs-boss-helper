// Slot-explanation tests: the hover-tooltip data must tell the truth.
// Marginal DPS comes from a real engine recompute with the slot emptied, so
// conditional multipliers (Salve, DHCB) must be priced into their slots.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { explainSlots } from "@/lib/loadout-explain";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

// DHCB + Salve(ei) ranged kit — same fixture as optimize-bank.test.ts.
const DHCB_SALVE_EI_IDS = [
  27235, // Masori mask (f)
  22109, // Ava's assembler
  12018, // Salve amulet(ei)
  27238, // Masori body (f)
  27241, // Masori chaps (f)
  26235, // Zaryte vambraces
  13237, // Pegasian boots
  28310, // Venator ring
  21012, // Dragon hunter crossbow
  9243, // Diamond bolts (e)
  22002, // Dragonfire ward
];

function bestScenario() {
  const { rankings } = optimizeForBoss({
    bank: DHCB_SALVE_EI_IDS,
    target: VORKATH,
    skills: SKILLS_AT_99,
  });
  expect(rankings.length).toBeGreaterThan(0);
  return rankings[0];
}

describe("loadout-explain — slot tooltips", () => {
  const top = bestScenario();
  const details = explainSlots(
    top.loadout,
    top.dps,
    VORKATH,
    SKILLS_AT_99,
    undefined,
    top.activeBonuses,
  );

  it("explains every filled slot and no empty ones", () => {
    for (const [slot, piece] of Object.entries(top.loadout.slots)) {
      if (piece) {
        expect(details[slot as keyof typeof details]).toBeDefined();
      }
    }
    expect(Object.keys(details).length).toBe(
      Object.values(top.loadout.slots).filter(Boolean).length,
    );
  });

  it("weapon: no marginal DPS, anchors the build, carries the DHCB reason", () => {
    const weapon = details.weapon!;
    expect(weapon.marginalDps).toBeUndefined();
    expect(weapon.reasons.some((r) => r.includes("every other slot"))).toBe(true);
    expect(weapon.reasons.some((r) => r.includes("dragon"))).toBe(true);
  });

  it("neck: Salve(ei) marginal DPS prices in the ×6/5 undead multiplier", () => {
    const neck = details.neck!;
    expect(neck.reasons.some((r) => r.includes("undead"))).toBe(true);
    // Salve(ei) multiplies BOTH accuracy and damage by 6/5 — emptying the
    // neck slot must cost far more than a plain stat amulet would suggest.
    expect(neck.marginalDps).toBeGreaterThan(0.5);
  });

  it("armor pieces report non-negative marginal DPS and a stat line", () => {
    for (const slot of ["head", "body", "legs", "hands", "feet", "ring"] as const) {
      const d = details[slot];
      if (!d) continue;
      expect(d.marginalDps).toBeGreaterThanOrEqual(0);
      expect(d.bonusLine).toBeTruthy();
    }
  });

  it("bonus line speaks the build's language (ranged acc / ranged str)", () => {
    // Masori body (f): +43 ranged acc, +4 ranged str.
    expect(details.body!.bonusLine).toContain("ranged acc");
    expect(details.body!.bonusLine).toContain("ranged str");
  });
});
