// Verification harness: build each wiki-verified setup from raw item ids via
// the engine (scoreScenario) and diff against tools.runescape.wiki/osrs-dps.
// Fixtures live in tests/fixtures/verified-setups.ts. Locked baselines stay
// true regardless of how the data/optimizer layers are reorganised — this is
// the DPS regression net.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { VERIFIED_SETUPS } from "./fixtures/verified-setups";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

describe("Vorkath DPS verification (raw-item fixtures)", () => {
  for (const setup of VERIFIED_SETUPS) {
    it(`engine output matches the wiki baseline for ${setup.id}`, () => {
      const scored = scoreScenario({
        itemIds: setup.itemIds,
        target: VORKATH,
        skills: SKILLS_AT_99,
        attackStyle: { attackType: setup.attackType, choice: setup.choice },
        baseSpellMaxHit: setup.baseSpellMaxHit,
        spellElement: setup.spellElement,
      });
      if (!scored.valid) {
        throw new Error(`${setup.id} should be a valid setup: ${scored.reasons.join("; ")}`);
      }
      const { maxHit, accuracy, dps } = scored.dps;
      expect(maxHit, `${setup.id} maxHit`).toBe(setup.baseline.maxHit);
      expect(accuracy, `${setup.id} accuracy`).toBeCloseTo(setup.baseline.accuracy, 3);
      if (setup.baseline.dps !== undefined) {
        expect(dps, `${setup.id} dps within 0.05 of wiki`).toBeCloseTo(setup.baseline.dps, 1);
      }
    });
  }
});
