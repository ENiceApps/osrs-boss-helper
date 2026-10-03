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

/** The oracle-matrix fixtures plus the multiplier-order, NPC-mechanic, Corp and Twisted bow combos below. */
export function validationCombos(): CanonicalCombo[] {
  return [
    ...ORACLE_MATRIX.map(fixtureToCombo),
    ...orderingCombos(),
    ...npcMechanicCombos(),
    ...corpCombos(),
    ...twistedBowCombos(),
  ];
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
const ADAMANT_BOLTS = 9143;
const RING_OF_RECOIL = 2550;
const TORMENTED_BRACELET = 19544;
const AVERNIC_DEFENDER = 22322;
const KERIS_PARTISAN = 25979;
const KERIS_PARTISAN_OF_BREACHING = 25981;
const KERIS_PARTISAN_OF_AMASCUT = 30891;
const KERIS = 10581; // the Contact! dagger (Unpoisoned)
const ACCURSED_SCEPTRE = 27665; // Charged
const ACCURSED_SCEPTRE_A = 27679; // Charged — autocasts spellbook spells
const THAMMARONS_SCEPTRE = 22555; // Charged

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
 * avoid non-zero flat armour (e.g. Gargoyle's -2) so the max hit shows the
 * multiplier order alone; flat armour has its own combos (npcMechanicCombos).
 */
export function orderingCombos(): CanonicalCombo[] {
  const fireSurge = { baseSpellMaxHit: 24, spellElement: "fire" as const, spellName: "Fire Surge" };
  // Twinflame's second cast is a hitsplat of trunc(h × 4/10); the engine takes
  // its exact mean per roll (lib/dps/twinflame.ts), so these rows carry no
  // DPS residual.
  const fireWave = { baseSpellMaxHit: 20, spellElement: "fire" as const, spellName: "Fire Wave" };
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

    // ── Keris vs Kalphite: ×133/100 damage (×115/100 for amascut), breaching
    // ×133/100 accuracy — not ×4/3, which rounds differently at a base that is a
    // multiple of 3. wgloop's max hit is the 1/51 triple hitsplat (3× ours). ──
    orderingCombo("keris-partisan-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS_PARTISAN, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),
    orderingCombo("keris-partisan-pound-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS_PARTISAN, FACEGUARD, FURY), AVERNIC_DEFENDER], "crush", "aggressive"),
    orderingCombo("keris-breaching-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS_PARTISAN_OF_BREACHING, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),
    orderingCombo("ontask-keris-breaching-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS_PARTISAN_OF_BREACHING, SLAYER_HELM_I, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive", onTask),
    // Outside the Tombs of Amascut the amascut partisan loses 50 stab / 22 str.
    orderingCombo("keris-amascut-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS_PARTISAN_OF_AMASCUT, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),
    orderingCombo("keris-amascut-general-graardor", "general-graardor",
      [...meleeGear(KERIS_PARTISAN_OF_AMASCUT, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),
    // Inside the Tombs of Amascut it keeps its full stats (no kalphite bonus).
    orderingCombo("keris-amascut-akkha", "akkha",
      [...meleeGear(KERIS_PARTISAN_OF_AMASCUT, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),
    // The Contact! dagger carries the same kalphite passive (wgloop isWearingKeris).
    orderingCombo("keris-dagger-kalphite-queen", "kalphite-queen",
      [...meleeGear(KERIS, FACEGUARD, TORTURE), AVERNIC_DEFENDER], "stab", "aggressive"),

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
    // Accurate's +3 joins the ranged STRENGTH level too (max 36, was 35), and
    // sits inside Elite Void's ×9/8: trunc((121 + 3 + 8) × 9/8) = 148 → 40 (was 39).
    orderingCombo("accurate-rune-crossbow-vorkath", "vorkath",
      [9185, ADAMANT_BOLTS, ARMADYL_HELM, ANGUISH, ...RANGED_REST], "ranged", "accurate"),
    orderingCombo("accurate-elite-void-rune-crossbow-general-graardor", "general-graardor",
      [9185, ADAMANT_BOLTS, 11664, 13072, 13073, 8842, ANGUISH, 21914, 13237, 11771], "ranged", "accurate"),

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

    // ── Wilderness sceptres: built-in spell max(1, trunc(lvl/3 - 6)) Accursed,
    // - 8 Thammaron's; ×3/2 in the Wilderness, after the black mask on task.
    // The (a) sceptres autocast spellbook spells instead. Longrange keeps the
    // magic Accurate stance bonus (+2 upstream) out of these rolls. ──
    orderingCombo("accursed-sceptre-callisto", "callisto",
      [ACCURSED_SCEPTRE, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange"),
    orderingCombo("thammarons-sceptre-callisto", "callisto",
      [THAMMARONS_SCEPTRE, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange"),
    orderingCombo("thammarons-sceptre-general-graardor", "general-graardor",
      [THAMMARONS_SCEPTRE, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange"),
    // Tormented bracelet puts the post-% base on 32, where mask-then-×3/2 (54)
    // and ×3/2-then-mask (55) disagree.
    orderingCombo("ontask-accursed-sceptre-vetion", "vetion",
      [ACCURSED_SCEPTRE, SLAYER_HELM_I, OCCULT, TORMENTED_BRACELET, ...MAGIC_REST], "magic", "longrange", onTask),
    orderingCombo("accursed-sceptre-a-fire-surge-callisto", "callisto",
      [ACCURSED_SCEPTRE_A, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange", fireSurge),

    // ── Magic: powered-staff stance bonus ──
    // Accurate is +2 on magic's +9 (upstream), not melee/ranged's +3 — the
    // wiki's "+3 accurate / +1 longrange" sits on a +8 base, the same 11 / 9.
    // Longrange adds nothing on +9. The stance moves the roll, never the max hit.
    orderingCombo("powered-staff-accurate-trident-swamp-zulrah", "zulrah",
      [12899, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "accurate"),
    orderingCombo("powered-staff-accurate-tumekens-shadow-vetion", "vetion",
      [27275, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "accurate"),
    orderingCombo("powered-staff-longrange-tumekens-shadow-vetion", "vetion",
      [27275, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange"),
    // The stance sits inside the Wilderness ×3/2 (Accursed sceptre).
    orderingCombo("powered-staff-accurate-accursed-sceptre-vetion", "vetion",
      [ACCURSED_SCEPTRE, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "accurate"),
  ];
}

const RUNE_CROSSBOW = 9185;
const DRAGON_HALBERD = 3204;
const BOLT_MAX = "bolt procs: wgloop's max hit includes the proc hit, ours the normal hit";

/**
 * NPC-side mechanics wgloop applies after the player's hit is rolled:
 *
 *  - Flat armour (`armour-`): every accurate melee/ranged hitsplat becomes
 *    max(0, d − armour). One combo per mean branch the shift has to reach —
 *    single hit, each Scythe hitsplat, two independent halves (Torag's), the
 *    sequential halves (Dual macuahuitl), Dark bow's two arrows, the Keris
 *    triple, the fang's trimmed roll under positive armour, and the ruby /
 *    diamond / opal bolt procs — on both signs (Gargoyle −2, Earthen nagua −4,
 *    Riyl shade −3, Locust rider −2, Drake +2, Veiled kraken +15).
 *  - Flying (`flying-`): melee deals nothing to a flying target unless the
 *    weapon is a Polearm (halberd) or Salamander; Vespula takes no melee at
 *    all. The halberd-vs-Aviansie combo pins that the flying exemption wins
 *    over the Aviansies' non-salamander melee list.
 *
 * Their numbers are locked in tests/npc-mechanics.test.ts. Our DPS runs ~0.1% under wgloop on every
 * melee/ranged row (armoured or not): wgloop raises an accurate 0 to 1, which
 * the engine doesn't model — well inside the DPS tolerance.
 */
export function npcMechanicCombos(): CanonicalCombo[] {
  const rangedGear = (weapon: number, ammo: number): number[] =>
    [weapon, ammo, ARMADYL_HELM, ANGUISH, ...RANGED_REST];
  return [
    // ── Flat armour, melee ──
    orderingCombo("armour-whip-earthen-nagua", "earthen-nagua",
      meleeGear(4151, FACEGUARD, TORTURE), "slash", "controlled"),
    orderingCombo("armour-scythe-gargoyle", "gargoyle",
      meleeGear(22325, FACEGUARD, TORTURE), "slash", "aggressive"),
    orderingCombo("armour-torags-hammers-gargoyle", "gargoyle",
      meleeGear(4747, FACEGUARD, TORTURE), "crush", "aggressive"),
    orderingCombo("armour-dual-macuahuitl-earthen-nagua", "earthen-nagua",
      meleeGear(28997, FACEGUARD, TORTURE), "crush", "aggressive"),
    // The fang's damage roll is trimmed to [trunc(M×3/20), M − that]; Drake's
    // +2 clips the 0..M roll ours used to assume, not the trimmed one.
    // The 1/51 Keris triple is shifted after tripling: max 3 × 41 + 2 = 125.
    orderingCombo("armour-keris-locust-rider", "locust-rider",
      meleeGear(10581, FACEGUARD, TORTURE), "stab", "aggressive"),
    orderingCombo("armour-fang-drake", "drake",
      meleeGear(26219, FACEGUARD, TORTURE), "stab", "aggressive", {
        exactRoll: false, // fang's two-roll accuracy — the roll inversion doesn't apply
        knownMaxHitResidual: "fang: ours reports the true max, wgloop the trimmed normal max",
      }),

    // ── Flat armour, ranged ──
    orderingCombo("armour-dark-bow-riyl-shade", "riyl-shade",
      rangedGear(11235, 11212), "ranged", "rapid"),
    // wgloop's max hit includes the proc hit (ruby 45 → 30 here, diamond
    // trunc(M×115/100), opal M + bonus); ours reports the normal hit.
    orderingCombo("armour-ruby-bolts-veiled-kraken", "veiled-kraken",
      rangedGear(RUNE_CROSSBOW, 9242), "ranged", "rapid", { knownMaxHitResidual: BOLT_MAX }),
    orderingCombo("armour-diamond-bolts-gargoyle", "gargoyle",
      rangedGear(RUNE_CROSSBOW, 9243), "ranged", "rapid", { knownMaxHitResidual: BOLT_MAX }),
    orderingCombo("armour-opal-bolts-gargoyle", "gargoyle",
      rangedGear(RUNE_CROSSBOW, 9236), "ranged", "rapid", { knownMaxHitResidual: BOLT_MAX }),
    orderingCombo("armour-dhcb-drake", "drake",
      rangedGear(21012, DRAGON_BOLTS), "ranged", "rapid"),

    // ── Flying ──
    orderingCombo("flying-whip-kreearra", "kreearra",
      meleeGear(4151, FACEGUARD, TORTURE), "slash", "controlled"),
    orderingCombo("flying-dragon-halberd-kreearra", "kreearra",
      meleeGear(DRAGON_HALBERD, FACEGUARD, TORTURE), "slash", "aggressive"),
    orderingCombo("flying-scythe-flight-kilisa", "flight-kilisa",
      meleeGear(22325, FACEGUARD, TORTURE), "slash", "aggressive"),
    orderingCombo("flying-dragon-halberd-aviansie", "aviansie",
      meleeGear(DRAGON_HALBERD, FACEGUARD, TORTURE), "slash", "aggressive"),
    orderingCombo("flying-dragon-halberd-vespula", "vespula",
      meleeGear(DRAGON_HALBERD, FACEGUARD, TORTURE), "slash", "aggressive"),
  ];
}

const ARMADYL_CROSSBOW = 11785;
const FANG = "fang: ours reports the true max, wgloop the trimmed normal max";

/**
 * Corporeal Beast. wgloop halves every hitsplat of a non-corpbane weapon
 * (`divisionTransformer(2)` in getAttackerDist): after the multi-hit split, the
 * enchanted-bolt effects and the accurate-zero raise, before ruby bolts and the
 * NPC transforms. One combo per mean branch the halving has to reach — single
 * hits on both max parities (an even max is where halving the max overstated
 * the mean), Torag's halves, the Scythe's three hitsplats, the Dual
 * macuahuitl's sequential halves, Dark bow's two arrows, seeking arrows' floor
 * of 3, and all six enchanted bolts on the Armadyl crossbow — plus corpbane
 * controls (stab spear / fang, magic) that keep full damage. The fang's
 * halved trimmed roll (slash) has no combo: upstream's Stab Sword "Slash" is
 * Aggressive, ours Controlled, so the worker can't match the stance; the unit
 * tests cover it. Their numbers are locked in tests/corp-halving.test.ts.
 */
export function corpCombos(): CanonicalCombo[] {
  const corp = "corporeal-beast";
  const rangedGear = (weapon: number, ammo: number): number[] =>
    [weapon, ammo, ARMADYL_HELM, ANGUISH, ...RANGED_REST];
  const glory = (gear: number[]): number[] => gear.map((id) => (id === ANGUISH ? GLORY : id));
  const bolts = (ammo: number): number[] => rangedGear(ARMADYL_CROSSBOW, ammo);
  const boltMax = { knownMaxHitResidual: BOLT_MAX };
  // Corp DPS sits near 0.5, where the default ±0.02 slack is several percent.
  const combo: typeof orderingCombo = (id, bossSlug, itemIds, attackType, choice, extra = {}) =>
    orderingCombo(id, bossSlug, itemIds, attackType, choice, { strictDps: true, ...extra });
  return [
    // ── Single hits, both parities of the pre-halving max (41, 40) ──
    combo("corp-whip", corp, meleeGear(4151, FACEGUARD, TORTURE), "slash", "controlled"),
    combo("corp-whip-glory", corp, meleeGear(4151, FACEGUARD, GLORY), "slash", "controlled"),
    // A spear is corpbane only on stab: Swipe (slash) is halved.
    combo("corp-dragon-spear-slash", corp, meleeGear(1249, FACEGUARD, TORTURE), "slash", "controlled"),

    // ── Multi-hit: each hitsplat is halved on its own ──
    combo("corp-torags-hammers", corp, meleeGear(4747, FACEGUARD, TORTURE), "crush", "aggressive"),
    combo("corp-scythe", corp, meleeGear(22325, FACEGUARD, TORTURE), "slash", "aggressive"),
    combo("corp-dual-macuahuitl", corp, meleeGear(28997, FACEGUARD, TORTURE), "crush", "aggressive"),
    combo("corp-dark-bow", corp, rangedGear(11235, 11212), "ranged", "rapid"),
    // A Glory (no ranged strength) puts these on an even max: 34 and 26.
    combo("corp-scorching-bow-seeking-arrows", corp, glory(rangedGear(29591, 33595)), "ranged", "rapid"),
    combo("corp-dark-bow-seeking-arrows", corp, glory(rangedGear(11235, 33595)), "ranged", "rapid"),

    // ── Enchanted bolts: opal / pearl / dragonstone / diamond / onyx roll
    // before the halving (their bonus is halved too), ruby after it ──
    combo("corp-acb-opal-bolts", corp, bolts(9236), "ranged", "rapid", boltMax),
    combo("corp-acb-pearl-bolts", corp, bolts(9238), "ranged", "rapid", boltMax),
    combo("corp-acb-dragonstone-bolts", corp, bolts(9244), "ranged", "rapid", boltMax),
    combo("corp-acb-diamond-bolts", corp, bolts(9243), "ranged", "rapid", boltMax),
    combo("corp-acb-onyx-bolts", corp, bolts(9245), "ranged", "rapid", boltMax),
    combo("corp-acb-ruby-bolts", corp, bolts(9242), "ranged", "rapid", boltMax),

    // ── Corpbane: full damage ──
    combo("corp-dragon-spear-stab", corp, meleeGear(1249, FACEGUARD, TORTURE), "stab", "controlled"),
    combo("corp-fang-stab", corp, meleeGear(26219, FACEGUARD, TORTURE), "stab", "aggressive", {
      exactRoll: false, // fang's two-roll accuracy — the roll inversion doesn't apply
      knownMaxHitResidual: FANG,
    }),
    combo("corp-kodai-fire-surge", corp, [21006, ANCESTRAL_HAT, OCCULT, ...MAGIC_REST], "magic", "longrange", {
      baseSpellMaxHit: 24, spellElement: "fire", spellName: "Fire Surge",
    }),
  ];
}

const TWISTED_BOW = 20997;
const DRAGON_ARROW = 11212;

/**
 * Twisted bow scaling (upstream PlayerVsNPCCalc L566-573 / L744-748,
 * tbowScaling L2429-2438): the bow scales off min(cap, max(Magic level, magic
 * attack bonus)), cap 250 (350 vs Xerician), and the bonus percents are
 * clamped to 140% accuracy / 250% damage. One combo per way the input is
 * reached: the Magic level at the clamp on a Xerician target (Great Olm's head,
 * 250 under the 350 cap: 141% → 140%), the Magic level over the cap (Commander
 * Zilyana 300 → 250, 141% → 140%), the magic attack bonus over the cap
 * (Araxxor 260 over Magic 190; Nylocas Vasilias 600 over 50) and under it
 * (Zebak 215 over 100). `exactRoll` pins the clamp: 141% vs 140% moves the
 * roll by under 1%, inside the accuracy tolerance. Their numbers are locked in
 * tests/twisted-bow.test.ts.
 *
 * Not here: Zulrah (Magic 300) — upstream rerolls every hit over 50 into
 * 45-50 (cappedRerollTransformer), which the engine doesn't model; and the P2
 * Wardens, where upstream forces accuracy to 1 and turns the (doubly
 * Tbow-scaled) attack roll into a damage modifier, also unmodelled — see
 * scripts/oracle/README.md, Known gaps.
 */
export function twistedBowCombos(): CanonicalCombo[] {
  const gear = [TWISTED_BOW, DRAGON_ARROW, ARMADYL_HELM, ANGUISH, ...RANGED_REST];
  const tbow = (id: string, bossSlug: string): CanonicalCombo =>
    orderingCombo(id, bossSlug, gear, "ranged", "rapid");
  return [
    tbow("tbow-great-olm", "great-olm"),
    tbow("tbow-commander-zilyana", "commander-zilyana"),
    tbow("tbow-araxxor", "araxxor"),
    tbow("tbow-nylocas-vasilias", "nylocas-vasilias"),
    tbow("tbow-zebak", "zebak"),
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
