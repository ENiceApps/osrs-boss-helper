// Verify the Phase-1 "loadout from raw items" bridge: scenarios built from
// 11 arbitrary item IDs should match the DPS the existing curated-set engine
// produces for the equivalent loadout. Also exercises the validation cases
// the optimizer will rely on as filter predicates.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { LOADOUT_SET_BY_ID } from "@/data/loadouts/sets.generated";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import type { Skills } from "@/types/osrs";

const VORKATH = MONSTER_BY_SLUG["vorkath"];
const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];

// Curated DHCB+Salve(ei) loadout — see data/loadouts/sets.source.ts (id
// "ranged-end-dragonbane-undead"). Reproducing the IDs here so the test
// breaks loudly if anyone edits the source set without updating both.
const DHCB_SALVE_EI_IDS = [
  27235, // Masori mask (f)
  22109, // Ava's assembler
  12018, // Salve amulet(ei)
  27238, // Masori body (f)
  27241, // Masori chaps (f)
  26235, // Zaryte vambraces
  13237, // Pegasian boots
  28310, // Venator ring
  21012, // Dragon hunter crossbow (2H)
  9243, // Diamond bolts (e)
  22002, // Dragonfire ward
];

describe("optimize/scenario — DPS parity with curated loadouts", () => {
  it("DHCB+Salve(ei) from raw IDs matches the curated set's DPS against Vorkath", () => {
    const scratch = scoreScenario({
      itemIds: DHCB_SALVE_EI_IDS,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    if (!scratch.valid) throw new Error(`Expected valid scenario, got reasons: ${scratch.reasons.join("; ")}`);

    const curated = LOADOUT_SET_BY_ID["ranged-end-dragonbane-undead"];
    const curatedDps = computeSetDps(curated, VORKATH, SKILLS_AT_99);

    expect(scratch.dps.maxHit).toBe(curatedDps.maxHit);
    expect(scratch.dps.accuracy).toBeCloseTo(curatedDps.accuracy, 4);
    expect(scratch.dps.dps).toBeCloseTo(curatedDps.dps, 3);

    // Conditional bonuses should fire (dragon + undead).
    expect(scratch.activeBonuses.conditionalBonuses.dragonHunterCrossbow).toBe(true);
    expect(scratch.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
  });

  it("same loadout against Graardor (non-dragon, non-undead) silences the bonuses", () => {
    const scratch = scoreScenario({
      itemIds: DHCB_SALVE_EI_IDS,
      target: GRAARDOR,
      skills: SKILLS_AT_99,
    });
    if (!scratch.valid) throw new Error(`Expected valid scenario, got reasons: ${scratch.reasons.join("; ")}`);
    expect(scratch.activeBonuses.conditionalBonuses.dragonHunterCrossbow).toBe(false);
    expect(scratch.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(false);
  });
});

describe("optimize/scenario — validation rejects malformed loadouts", () => {
  it("no weapon → invalid", () => {
    const result = scoreScenario({
      itemIds: [27235, 22109], // helm + cape only
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("No weapon"))).toBe(true);
  });

  it("2H weapon + shield → invalid", () => {
    // Scythe of Vitur (22325) is genuinely 2H. Rune kiteshield (1201) for shield.
    const result = scoreScenario({
      itemIds: [22325, 1201, 27235],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("2H weapon"))).toBe(true);
  });

  it("ammo class mismatch (arrows on a crossbow) → invalid", () => {
    // DHCB (crossbow, fires bolts) + Dragon arrow (id 11212) → class mismatch.
    const result = scoreScenario({
      itemIds: [21012, 11212],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("fires bolts") || r.includes("is a arrow"))).toBe(true);
  });

  it("equip requirement failure → invalid", () => {
    // Masori mask (f) needs Ranged 80. A skill set with ranged=50 should reject it.
    const lowSkills: Skills = { ...SKILLS_AT_99, ranged: 50 };
    const result = scoreScenario({
      itemIds: [27235, 21012, 9243], // mask + DHCB + bolts (DHCB needs 70 ranged, would also fail)
      target: VORKATH,
      skills: lowSkills,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("Masori mask") && r.includes("ranged"))).toBe(true);
  });

  it("unknown item id → invalid", () => {
    const result = scoreScenario({
      itemIds: [99999999, 21012, 9243],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("Unknown item id 99999999"))).toBe(true);
  });

  it("two amulets → slot collision invalid", () => {
    // Salve(ei) + Necklace of anguish (19547) both occupy neck.
    const result = scoreScenario({
      itemIds: [12018, 19547, 21012, 9243],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.reasons.some((r) => r.includes("Slot collision") && r.includes("neck"))).toBe(true);
  });
});
