// Combo sources for the oracle harness.
//
// The validation set is derived from tests/fixtures/oracle-matrix.ts — the same
// 8 special-case fixtures the engine already locks baselines for. Running the
// oracle on these FIRST proves the wgloop bridge is wired correctly (and turns
// their still-"engine-only" baselines into wiki-cross-checked numbers) before
// any broad sweep is trusted.

import { MONSTER_CATALOG, MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { ORACLE_MATRIX, type OracleFixture } from "@/tests/fixtures/oracle-matrix";
import type { CombatStyle, SpellElement } from "@/types/osrs";
import type { CanonicalCombo } from "./contract";

/**
 * Map a standard-spellbook (element, baseMaxHit) to the wgloop spell name. Only
 * the elemental spell ladders the harness actually exercises are listed; extend
 * as the sweep grows. Returns undefined for powered staves (no selected spell).
 */
export function spellNameFor(
  element: SpellElement | undefined,
  baseMaxHit: number | undefined,
): string | undefined {
  if (!element || baseMaxHit === undefined) return undefined;
  const el = element === "air" ? "Wind" : element[0].toUpperCase() + element.slice(1);
  // Standard combat-spell max hits by tier.
  const tierByMax: Record<number, string> = {
    24: "Surge",
    20: "Wave",
    16: "Blast",
    12: "Bolt",
  };
  // Fire ladder is offset (+1 over the others on some tiers); match on the
  // canonical Fire Surge = 24 first, then fall back to the generic table.
  const tier = tierByMax[baseMaxHit];
  return tier ? `${el} ${tier}` : undefined;
}

function fixtureToCombo(f: OracleFixture): CanonicalCombo {
  const boss = MONSTER_BY_SLUG[f.bossSlug];
  if (!boss) throw new Error(`Boss not in catalog: ${f.bossSlug}`);
  return {
    id: f.id,
    itemIds: f.itemIds,
    bossWikiId: boss.wikiId,
    bossVersion: boss.version || undefined,
    bossSlug: f.bossSlug,
    attackType: f.attackType,
    choice: f.choice,
    baseSpellMaxHit: f.baseSpellMaxHit,
    spellElement: f.spellElement,
    spellName: spellNameFor(f.spellElement, f.baseSpellMaxHit),
    baseline: f.baseline,
  };
}

/** The 8 special-case fixtures, as canonical combos. */
export function validationCombos(): CanonicalCombo[] {
  return ORACLE_MATRIX.map(fixtureToCombo);
}

// One self-sufficient base loadout per style (no missing ammo, works vs any
// boss): a generic gear set the sweep re-targets at many monsters. Picked from
// the validation fixtures so the equipment is known-valid on both engines.
const SWEEP_BASE_BY_STYLE: Record<CombatStyle, string> = {
  melee: "void-melee-graardor", // Whip + Void — equippable & attacks anything
  ranged: "void-ranged-graardor", // Rune c'bow + Adamant bolts (ammo present)
  magic: "tome-fire-zulrah-weakness", // Kodai + Fire Surge — casts vs anything
};

/**
 * Broad sweep: cross one base loadout per style against a deterministic sample
 * of the boss catalog. Pure parity-checking — the loadout need not be optimal
 * for each boss, only equippable; we only assert the two engines agree on the
 * SAME setup vs the SAME monster. Shard the run by passing `style`.
 */
export function sweepCombos(opts: { style?: CombatStyle; limit?: number } = {}): CanonicalCombo[] {
  const bases = validationCombos();
  const baseById = new Map(bases.map((b) => [b.id, b]));
  const styles: CombatStyle[] = opts.style ? [opts.style] : ["melee", "ranged", "magic"];

  // Deterministic boss sample: every Nth real monster, capped by `limit`.
  const realBosses = MONSTER_CATALOG.filter((m) => m.wikiId !== 0);
  const limit = opts.limit ?? 40;
  const step = Math.max(1, Math.floor(realBosses.length / limit));
  const sampled = realBosses.filter((_, i) => i % step === 0).slice(0, limit);

  const out: CanonicalCombo[] = [];
  for (const style of styles) {
    const base = baseById.get(SWEEP_BASE_BY_STYLE[style]);
    if (!base) continue;
    for (const boss of sampled) {
      out.push({
        ...base,
        id: `sweep-${style}-${boss.slug}`,
        bossWikiId: boss.wikiId,
        bossVersion: boss.version || undefined,
        bossSlug: boss.slug,
        baseline: undefined, // sweep rows have no locked baseline
      });
    }
  }
  return out;
}
