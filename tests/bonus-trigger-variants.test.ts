// Variant-id regression net for conditional-bonus triggers. The bug: minigame
// re-imbues (Soul Wars / Emir's Arena) and cosmetic kits carry DIFFERENT item
// ids than the canonical item, so the flag derivation and force-include
// branches silently ignored them — a real player's Salve amulet(ei) (Emir's
// Arena, 26782) was invisible to the optimizer vs undead Vorkath.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario } from "@/lib/optimize/scenario";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

const SALVE_EI_CANONICAL = 12018;
const SALVE_EI_EMIRS = 26782;
const DHCB = 21012;
const DHCB_T = 25916;

// The verified DHCB kit, parameterised on neck + weapon.
function kit({ neck, weapon }: { neck: number; weapon: number }): number[] {
  return [
    27235, // Masori mask (f)
    22109, // Ava's assembler
    neck,
    9243, // Diamond bolts (e)
    weapon,
    27238, // Masori body (f)
    22002, // Dragonfire ward
    27241, // Masori chaps (f)
    26235, // Zaryte vambraces
    13237, // Pegasian boots
    28310, // Venator ring
  ];
}

describe("bonus-trigger variants — flags fire for non-canonical ids", () => {
  it("Salve(ei) Emir's Arena scores identically to the canonical Salve(ei)", () => {
    const canonical = scoreScenario({
      itemIds: kit({ neck: SALVE_EI_CANONICAL, weapon: DHCB }),
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    const emirs = scoreScenario({
      itemIds: kit({ neck: SALVE_EI_EMIRS, weapon: DHCB }),
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    if (!canonical.valid || !emirs.valid) throw new Error("expected both valid");
    expect(emirs.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
    expect(emirs.dps.dps).toBeCloseTo(canonical.dps.dps, 6);
  });

  it("DHCB (t) cosmetic kit still fires the dragon-hunter bonus", () => {
    const scored = scoreScenario({
      itemIds: kit({ neck: SALVE_EI_CANONICAL, weapon: DHCB_T }),
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    if (!scored.valid) throw new Error(`invalid: ${scored.reasons.join("; ")}`);
    expect(scored.activeBonuses.conditionalBonuses.dragonHunterCrossbow).toBe(true);
  });
});

describe("bonus-trigger variants — optimizer force-includes the OWNED id", () => {
  it("bank holding only the Emir's Arena Salve(ei) → it wins the neck slot vs Vorkath", () => {
    const bank = kit({ neck: 19547 /* anguish */, weapon: DHCB });
    bank.push(SALVE_EI_EMIRS); // the only salve in the bank
    const { rankings } = optimizeForBoss({ bank, target: VORKATH, skills: SKILLS_AT_99 });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.slots.neck?.itemId).toBe(SALVE_EI_EMIRS);
    expect(top.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
  });
});

describe("force-include composition — Salve overrides reach armor-set builds", () => {
  it("Elite Void + Salve(ei) is generated and carries both bonuses vs Vorkath", () => {
    // Masori pieces outrank Void per-slot, so the greedy build is Masori and
    // Void only exists via the armor-set force branch — the salve override
    // must compose with THAT branch, not just the greedy one.
    const bank = [
      ...kit({ neck: 24780 /* blood fury */, weapon: DHCB }),
      11664, // Void ranger helm
      13072, // Elite void top
      13073, // Elite void robe
      8842, // Void knight gloves
      SALVE_EI_EMIRS,
    ];
    const { rankings } = optimizeForBoss({ bank, target: VORKATH, skills: SKILLS_AT_99 });
    const voidSalve = rankings.find(
      (r) =>
        r.loadout.armorSetBonus?.name.includes("Void") &&
        r.loadout.slots.neck?.itemId === SALVE_EI_EMIRS,
    );
    expect(voidSalve).toBeDefined();
    expect(voidSalve!.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
    // And whatever wins overall, the winner's neck must be the salve — no
    // stat amulet beats ×6/5 acc & dmg vs undead.
    expect(rankings[0].loadout.slots.neck?.itemId).toBe(SALVE_EI_EMIRS);
  });
});
