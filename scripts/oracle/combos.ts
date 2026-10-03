// Combo sources for the oracle harness.
//
// The validation set is derived from tests/fixtures/oracle-matrix.ts — the same
// 8 special-case fixtures the engine already locks baselines for. Running the
// oracle on these FIRST proves the wgloop bridge is wired correctly (and turns
// their still-"engine-only" baselines into wiki-cross-checked numbers) before
// any broad sweep is trusted. The multiplier-order combos (orderingCombos,
// below) join them in the validation set.

import { MONSTER_CATALOG, MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { ORACLE_MATRIX, type OracleFixture } from "@/tests/fixtures/oracle-matrix";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { SKILLS_AT_99 } from "@/lib/recommend";
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

/** The oracle-matrix fixtures plus the multiplier-order combos below. */
export function validationCombos(): CanonicalCombo[] {
  return [...ORACLE_MATRIX.map(fixtureToCombo), ...orderingCombos()];
}

// Gear shells for the ordering combos (weapon/head/neck added per combo).
// Ranged: Ava's assembler, Armadyl chestplate + chainskirt, Zaryte vambraces,
// Pegasian boots, Archers ring (i).
const RANGED_REST = [21914, 11828, 11830, 26235, 13237, 11771];
// Magic: Ancestral robe top + bottom, Eternal boots, Seers ring (i).
const MAGIC_REST = [21021, 21024, 13235, 11770];

const SLAYER_HELM_I = 11865;
const FACEGUARD = 24271;
const ARMADYL_HELM = 11826;
const ANCESTRAL_HAT = 21018;
const TORTURE = 19553;
const FURY = 6585;
const GLORY = 1712;
const ANGUISH = 19547;
const OCCULT = 12002;
const SALVE = 4081;
const SALVE_E = 10588;
const SALVE_I = 12017;
const SALVE_EI = 12018;
const DRAGON_BOLTS = 21905;
const RING_OF_RECOIL = 2550;

/**
 * Melee shell: Infernal cape, Bandos chestplate + tassets, Ferocious gloves,
 * Primordial boots, and a ring (default Berserker ring (i)).
 */
function meleeGear(weapon: number, head: number, neck: number, ring = 11773): number[] {
  return [weapon, head, neck, 21295, 11832, 11834, 22981, 13239, ring];
}

function orderingCombo(
  id: string,
  bossSlug: string,
  itemIds: number[],
  attackType: CanonicalCombo["attackType"],
  choice: CanonicalCombo["choice"],
  extra: Partial<CanonicalCombo> = {},
): CanonicalCombo {
  const boss = MONSTER_BY_SLUG[bossSlug];
  if (!boss) throw new Error(`Boss not in catalog: ${bossSlug}`);
  return {
    id,
    itemIds,
    bossWikiId: boss.wikiId,
    bossVersion: boss.version || undefined,
    bossSlug,
    inWilderness: isWildernessBoss(bossSlug),
    attackType,
    choice,
    exactRoll: true,
    ...extra,
  };
}

/**
 * Multiplier-ORDER combos. Every accuracy/damage multiplier truncates, so the
 * order Salve / black mask / dragonbane / golembane / leafy / wilderness /
 * smoke-staff / armour-set bonuses are applied in moves results by ~1 max hit
 * or a few attack-roll points (hence `exactRoll`). The oracle-matrix fixtures
 * never set onTask, so the slayer-helm placement went unchecked; these pin
 * each pairing against wgloop. `ontask-` ids run with onTask = true.
 *
 * Gear is varied per combo (ring / neck / body swaps) so the base value is one
 * where the two orders disagree — at many bases they agree by luck. Targets
 * avoid non-zero flat armour (e.g. Gargoyle's -2): wgloop models it and our
 * engine doesn't yet, which would mask the ordering check.
 */
export function orderingCombos(): CanonicalCombo[] {
  const fireSurge = { baseSpellMaxHit: 24, spellElement: "fire" as const, spellName: "Fire Surge" };
  // Twinflame's second cast is mean-modelled as ×7/5 of the max hit; upstream
  // truncates each second hitsplat (trunc(h × 4/10)), ~1–2% less DPS. Max hit
  // and accuracy still match exactly.
  const fireWave = {
    baseSpellMaxHit: 20,
    spellElement: "fire" as const,
    spellName: "Fire Wave",
    knownDpsResidual: "Twinflame second cast mean-modelled as ×7/5",
  };
  const onTask = { onTask: true };
  return [
    // ── Melee: slayer helm / Salve first, then the weapon's bane ──
    orderingCombo("ontask-dhl-rune-dragon", "rune-dragon",
      meleeGear(22978, SLAYER_HELM_I, GLORY, RING_OF_RECOIL), "stab", "controlled", onTask),
    orderingCombo("ontask-granite-hammer-marble-gargoyle", "marble-gargoyle",
      meleeGear(21742, SLAYER_HELM_I, GLORY), "crush", "aggressive", onTask),
    orderingCombo("ontask-barronite-mace-marble-gargoyle", "marble-gargoyle",
      meleeGear(25641, SLAYER_HELM_I, GLORY), "crush", "aggressive", onTask),
    orderingCombo("ontask-leaf-bladed-battleaxe-kurask", "kurask",
      meleeGear(20727, SLAYER_HELM_I, FURY, 6737), "slash", "aggressive", onTask),
    orderingCombo("ontask-arclight-abyssal-demon", "abyssal-demon",
      meleeGear(19675, SLAYER_HELM_I, TORTURE), "slash", "aggressive", onTask),
    // Avernic defender (+8 str) puts the base max hit on 41, where mask-then-
    // x3/2 and x3/2-then-mask disagree (70 vs 71).
    orderingCombo("ontask-ursine-chainmace-vetion", "vetion",
      [...meleeGear(27660, SLAYER_HELM_I, TORTURE), 22322], "crush", "aggressive", onTask),
    orderingCombo("salve-dhl-vorkath", "vorkath",
      meleeGear(22978, FACEGUARD, SALVE, RING_OF_RECOIL), "stab", "controlled"),
    // Inquisitor's per-piece bonus lands after every target bonus upstream.
    orderingCombo("ontask-inquisitor-pieces-dhl-rune-dragon", "rune-dragon",
      [22978, SLAYER_HELM_I, TORTURE, 21295, 24420, 24421, 22981, 13239, 11773], "crush", "controlled", onTask),
    orderingCombo("inquisitor-salve-ei-vetion", "vetion",
      [24417, 24419, 24420, 24421, SALVE_EI, 21295, 22981, 13239, 11773], "crush", "aggressive"),
    // Obsidian's +10% is added from the pre-Salve base upstream.
    orderingCombo("obsidian-salve-ei-vetion", "vetion",
      [6528, 21298, 21301, 21304, SALVE_EI, 21295, 22981, 13239, 11773], "crush", "aggressive"),

    // ── Ranged: Salve(i/ei) / imbued mask first, then DHCB / wilderness ──
    orderingCombo("ontask-dhcb-rune-dragon", "rune-dragon",
      [21012, DRAGON_BOLTS, SLAYER_HELM_I, ANGUISH, 21914, 2503, 2497, 26235, 13237, RING_OF_RECOIL],
      "ranged", "rapid", onTask),
    orderingCombo("salve-ei-dhcb-vorkath", "vorkath",
      [21012, DRAGON_BOLTS, ARMADYL_HELM, SALVE_EI, 21914, 11828, 11830, 26235, 13237, 6733],
      "ranged", "rapid"),
    orderingCombo("salve-i-dhcb-vorkath", "vorkath",
      [21012, DRAGON_BOLTS, ARMADYL_HELM, SALVE_I, ...RANGED_REST], "ranged", "rapid"),
    // Salve (e) / plain Salve do nothing for ranged — and so leave the mask on.
    orderingCombo("salve-e-dhcb-vorkath", "vorkath",
      [21012, DRAGON_BOLTS, ARMADYL_HELM, SALVE_E, ...RANGED_REST], "ranged", "rapid"),
    orderingCombo("ontask-salve-e-dhcb-vorkath", "vorkath",
      [21012, DRAGON_BOLTS, SLAYER_HELM_I, SALVE_E, ...RANGED_REST], "ranged", "rapid", onTask),
    orderingCombo("ontask-webweaver-vetion", "vetion",
      [27655, SLAYER_HELM_I, ANGUISH, ...RANGED_REST], "ranged", "rapid", onTask),

    // ── Magic: Salve(i/ei) + smoke-staff % fold into one additive bonus ──
    orderingCombo("salve-ei-magic-abhorrent-spectre", "abhorrent-spectre",
      [21006, ANCESTRAL_HAT, SALVE_EI, ...MAGIC_REST], "magic", "longrange", fireSurge),
    orderingCombo("salve-i-magic-abhorrent-spectre", "abhorrent-spectre",
      [21006, ANCESTRAL_HAT, SALVE_I, ...MAGIC_REST], "magic", "longrange", fireSurge),
    orderingCombo("salve-e-magic-abhorrent-spectre", "abhorrent-spectre",
      [21006, ANCESTRAL_HAT, SALVE_E, ...MAGIC_REST], "magic", "longrange", fireSurge),
    orderingCombo("salve-magic-abhorrent-spectre", "abhorrent-spectre",
      [21006, ANCESTRAL_HAT, SALVE, ...MAGIC_REST], "magic", "longrange", fireSurge),
    orderingCombo("ontask-salve-e-magic-abhorrent-spectre", "abhorrent-spectre",
      [21006, SLAYER_HELM_I, SALVE_E, ...MAGIC_REST], "magic", "longrange", { ...fireSurge, ...onTask }),
    orderingCombo("twinflame-fire-wave-general-graardor", "general-graardor",
      [30634, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange", fireWave),
    orderingCombo("twinflame-salve-ei-fire-wave-abhorrent-spectre", "abhorrent-spectre",
      [30634, ANCESTRAL_HAT, SALVE_EI, ...MAGIC_REST], "magic", "longrange", fireWave),
    // Staff + Amulet of fire only: 22 + trunc(22 × (10 + 4 Augury)%) = 25,
    // second cast 25 + 10 = 35 (the old ×11/10 path gave 33).
    orderingCombo("twinflame-amulet-of-fire-fire-wave-general-graardor", "general-graardor",
      [30634, 34425], "magic", "longrange", fireWave),
    orderingCombo("ontask-twinflame-fire-wave-abyssal-demon", "abyssal-demon",
      [30634, SLAYER_HELM_I, OCCULT, ...MAGIC_REST], "magic", "longrange", { ...fireWave, ...onTask }),
    orderingCombo("mystic-smoke-staff-fire-surge-general-graardor", "general-graardor",
      [12000, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange", fireSurge),
    orderingCombo("ontask-dhw-rune-dragon", "rune-dragon",
      [30070, SLAYER_HELM_I, OCCULT, ...MAGIC_REST], "magic", "longrange", { ...fireSurge, ...onTask }),
    orderingCombo("ontask-dark-demonbane-abyssal-demon", "abyssal-demon",
      [21006, SLAYER_HELM_I, OCCULT, 21791, 21021, 21024, 13235, RING_OF_RECOIL], "magic", "longrange", {
        baseSpellMaxHit: 30, spellElement: "none", spellName: "Dark Demonbane", ...onTask,
      }),
    // Elite Void's +5% joins the magic damage percent (wgloop magic_str += 50).
    orderingCombo("elite-void-magic-fire-surge-general-graardor", "general-graardor",
      [21006, 11663, 13072, 13073, 8842, FURY, 13235, 11770], "magic", "longrange", fireSurge),
  ];
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
        inWilderness: isWildernessBoss(boss.slug),
        baseline: undefined, // sweep rows have no locked baseline
      });
    }
  }
  return out;
}

/**
 * Optimizer-driven sweep: for each sampled boss, run the APP's own
 * optimizeForBoss with an owns-everything bank, then oracle-check the loadout it
 * actually recommends. This is the highest-value sweep — it validates the real
 * gear the app puts in front of users, not a fixed reference set. Magic ranking
 * is seeded with Fire Surge (24, fire); both engines then use that same spell.
 */
export function optimizedSweepCombos(opts: { limit?: number } = {}): CanonicalCombo[] {
  const realBosses = MONSTER_CATALOG.filter((m) => m.wikiId !== 0);
  const limit = opts.limit ?? 12;
  const step = Math.max(1, Math.floor(realBosses.length / limit));
  const sampled = realBosses.filter((_, i) => i % step === 0).slice(0, limit);
  // Exclude PvP/minigame-only gear (Deadman Mode, Bounty Hunter "(bh)", LMS
  // "(perfected)"/"(augmented)") from the owns-everything bank — players don't
  // own these in PvM and their inflated/variant stats only add sweep noise.
  const PVP_GEAR = /\(deadman mode\)|\(bh\)|\(perfected\)|\(augmented\)|\(last man standing\)/i;
  const bank = ITEM_CATALOG.filter((i) => !PVP_GEAR.test(i.name)).map((i) => i.id);

  const out: CanonicalCombo[] = [];
  for (const boss of sampled) {
    const result = optimizeForBoss({
      bank,
      target: boss,
      skills: SKILLS_AT_99,
      baseSpellMaxHit: 24,
      spellElement: "fire",
      topN: 1,
    });
    const best = result.rankings[0];
    if (!best) continue;
    const lo = best.loadout;
    const itemIds = Object.values(lo.slots)
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => s.itemId);
    const isMagic = lo.style === "magic";
    out.push({
      id: `opt-${boss.slug}`,
      itemIds,
      internalAmmoId: lo.internalAmmo?.itemId,
      bossWikiId: boss.wikiId,
      bossVersion: boss.version || undefined,
      bossSlug: boss.slug,
      inWilderness: isWildernessBoss(boss.slug),
      attackType: lo.attackType,
      choice: lo.attackStyleChoice,
      baseSpellMaxHit: isMagic ? lo.baseSpellMaxHit : undefined,
      spellElement: isMagic ? lo.spellElement : undefined,
      spellName: isMagic ? spellNameFor(lo.spellElement, lo.baseSpellMaxHit) : undefined,
    });
  }
  return out;
}
