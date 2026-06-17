// Oracle comparison test suite.
//
// Runs every fixture in oracle-matrix.ts through scoreScenario (the same engine
// path the bank optimizer uses) and asserts the locked baselines.
//
// Fixtures marked "engine-only" still run and will break if engine code
// regresses the output — they just haven't been cross-checked against the
// wiki calc yet. When you verify a fixture at dps.osrs.wiki, update its
// baseline numbers and change verifiedOn to the verification date.
//
// To add a new fixture:
//   1. Add an entry to tests/fixtures/oracle-matrix.ts with verifiedOn: "TODO".
//   2. Run: npx tsx scripts/compute-oracle-baselines.ts
//   3. Paste the printed baseline into the fixture.
//   4. Run: npx tsx scripts/wiki-verify.ts <fixture-id>  — for the wiki checklist.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { ORACLE_MATRIX } from "./fixtures/oracle-matrix";

const IS_TODO = (s: string) => s === "TODO" || s.startsWith("TODO");

describe("Oracle matrix — DPS engine vs locked baselines", () => {
  for (const fixture of ORACLE_MATRIX) {
    const todo = IS_TODO(fixture.baseline.verifiedOn);
    const label = todo
      ? `[engine-only] ${fixture.id} @ ${fixture.bossSlug}`
      : `${fixture.id} @ ${fixture.bossSlug}`;

    it(label, () => {
      const boss = MONSTER_BY_SLUG[fixture.bossSlug];
      if (!boss) throw new Error(`Boss not found in catalog: ${fixture.bossSlug}`);

      const result = scoreScenario({
        itemIds: fixture.itemIds,
        target: boss,
        skills: SKILLS_AT_99,
        attackStyle: { attackType: fixture.attackType, choice: fixture.choice },
        baseSpellMaxHit: fixture.baseSpellMaxHit,
        spellElement: fixture.spellElement,
      });

      if (!result.valid) {
        throw new Error(
          `${fixture.id}: invalid setup — ${result.reasons.join("; ")}`,
        );
      }

      const { maxHit, accuracy, dps } = result.dps;

      expect(maxHit, `${fixture.id} maxHit`).toBe(fixture.baseline.maxHit);
      expect(accuracy, `${fixture.id} accuracy`).toBeCloseTo(
        fixture.baseline.accuracy,
        3,
      );

      if (fixture.baseline.dps !== undefined && !fixture.baseline.dpsNote) {
        // For engine-only fixtures the tolerance is tighter (same engine, should be exact).
        // For wiki-verified fixtures we allow 0.05 DPS slop for rounding differences.
        const decimals = todo ? 2 : 1;
        expect(dps, `${fixture.id} dps`).toBeCloseTo(fixture.baseline.dps, decimals);
      }
    });
  }
});
