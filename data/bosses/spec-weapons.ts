// Per-boss recommended special-attack weapons, keyed by catalog slug.
// Follows the same hand-curation pattern as mechanics.ts — only bosses
// listed here have curated recommendations; everything else just doesn't
// have a "Recommended specs" section yet.
//
// itemIds must match an entry in data/spec-weapons.ts (the test suite
// verifies this). Each note is the "why for THIS boss specifically" —
// the catalog already has the generic spec effect.
//
// Use sparingly: a recommendation should be the standard PvM advice you'd
// see in a Slayer guide or boss strategy page on the wiki. Don't list
// every plausible spec — just the meta ones.

import type { BossSpecRecommendation } from "@/types/spec-weapons";
import { asItemId } from "@/types/osrs";

const id = (n: number) => asItemId(n);

// ---------------- Vorkath ----------------
const VORKATH: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "BGS on the first attack of the kill knocks Vorkath's Defence down by ~10–15, opening the rest of the kill to higher accuracy.",
  },
  {
    specWeaponId: id(5698), // Dragon dagger
    note: "DDS spec is a budget alternative to BGS for defence-leeching long fights.",
  },
];

// ---------------- King Black Dragon ----------------
const KBD: BossSpecRecommendation[] = [
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH at the start of the trip — KBD has 70 base Defence; one successful spec drops it 30%, opening kills to your main weapon.",
  },
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "Alternative to DWH if you don't own one; BGS drains defence by damage dealt.",
  },
];

// ---------------- Cerberus ----------------
const CERBERUS: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "BGS spec when she's at full HP to drop her Defence; high HP pool benefits from sustained accuracy.",
  },
];

// ---------------- General Graardor (Bandos) ----------------
const GRAARDOR: BossSpecRecommendation[] = [
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH spec on entry to drop Graardor's 250 Defence by 30%, making the kill significantly faster.",
  },
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "BGS alternative — drains defence based on damage dealt; pair with DWH for stacking drops.",
  },
];

// ---------------- Commander Zilyana ----------------
const ZILYANA: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "Zilyana has high Defence; BGS spec dramatically improves DPS for the rest of the kill.",
  },
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH alternative; 30% flat reduction stacks well with subsequent BGS specs.",
  },
];

// ---------------- K'ril Tsutsaroth ----------------
const KRIL: BossSpecRecommendation[] = [
  {
    specWeaponId: id(29589), // Emberlight
    note: "Emberlight is a demonbane weapon AND its spec drains stats with TRIPLE effect on demons — flat-out best opener.",
  },
  {
    specWeaponId: id(19675), // Arclight
    note: "Arclight if you don't have Emberlight — double-effect demon stat drain on the spec.",
  },
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "Optional BGS as a follow-up to drain remaining defence.",
  },
];

// ---------------- Kree'arra (Armadyl) ----------------
const KREEARRA: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11785), // Armadyl crossbow
    note: "ACB spec doubles enchanted bolt proc chance — fits naturally if you're already using ruby/diamond bolts on Kree'arra.",
  },
];

// ---------------- Zulrah ----------------
const ZULRAH: BossSpecRecommendation[] = [
  {
    specWeaponId: id(27690), // Voidwaker
    note: "Voidwaker spec hits guaranteed magic damage 50–150% of melee max — great for blocking the rotation when you're caught in melee distance.",
  },
  {
    specWeaponId: id(11806), // Saradomin godsword
    note: "SGS spec to heal during long Zulrah trips without using food.",
  },
];

// ---------------- Corporeal Beast ----------------
const CORP: BossSpecRecommendation[] = [
  {
    specWeaponId: id(27690), // Voidwaker
    note: "Voidwaker bypasses Corp's defensive halving — guaranteed 50–150% magic damage rolls. The single best DPS option in mass kills.",
  },
  {
    specWeaponId: id(23987), // Crystal halberd
    note: "Crystal halberd is the iron-friendly alternative — its spec hits Corp twice due to his size, doubling effective DPS.",
  },
  {
    specWeaponId: id(13652), // Dragon claws
    note: "Dragon claws spec for the burst opener if you don't have Voidwaker.",
  },
];

// ---------------- Demonic Gorilla ----------------
const DEMONIC_GORILLA: BossSpecRecommendation[] = [
  {
    specWeaponId: id(27690), // Voidwaker
    note: "Voidwaker's guaranteed magic-damage spec ignores the gorilla's prayer flicking — the canonical kill speedup.",
  },
  {
    specWeaponId: id(29589), // Emberlight
    note: "Emberlight as demonbane weapon — spec for triple stat drain on demons.",
  },
];

// ---------------- Dagannoth Rex ----------------
const DAG_REX: BossSpecRecommendation[] = [
  {
    specWeaponId: id(5698), // Dragon dagger
    note: "Dragon dagger spec is a classic Rex opener — cheap, fast, drops his HP before he can melee you much.",
  },
];

// ---------------- Wilderness bosses ----------------
const CALLISTO: BossSpecRecommendation[] = [
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH spec to drop Callisto's Defence; high HP pool rewards sustained accuracy.",
  },
];

const VENENATIS: BossSpecRecommendation[] = [
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH spec to soften her Defence early.",
  },
];

const VETION: BossSpecRecommendation[] = [
  {
    specWeaponId: id(13576), // Dragon warhammer
    note: "DWH to lower Vet'ion's high Defence; pair with Salve(ei) for the undead bonus.",
  },
];

// ---------------- Kalphite Queen ----------------
const KQ: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "BGS spec to drain her Defence — both phases benefit. Use in melee phase for maximum damage.",
  },
];

// ---------------- Alchemical Hydra ----------------
const HYDRA: BossSpecRecommendation[] = [
  {
    specWeaponId: id(11804), // Bandos godsword
    note: "BGS optional — Hydra's defence isn't extreme but multiple specs can sustain pre-Tbow gear.",
  },
];

// ---------------- Abyssal Sire ----------------
const SIRE: BossSpecRecommendation[] = [
  {
    specWeaponId: id(29589), // Emberlight
    note: "Sire is a demon — Emberlight spec triples the stat drain. Major DPS gain through phase 4.",
  },
  {
    specWeaponId: id(19675), // Arclight
    note: "Arclight alternative — double-effect demon stat drain.",
  },
];

// ---------------- Registry ----------------
export const BOSS_SPEC_RECOMMENDATIONS: Record<string, BossSpecRecommendation[]> = {
  vorkath: VORKATH,
  "king-black-dragon": KBD,
  cerberus: CERBERUS,
  "general-graardor": GRAARDOR,
  "commander-zilyana": ZILYANA,
  "kril-tsutsaroth": KRIL,
  "kreearra": KREEARRA,
  zulrah: ZULRAH,
  "corporeal-beast": CORP,
  "demonic-gorilla": DEMONIC_GORILLA,
  "dagannoth-rex": DAG_REX,
  callisto: CALLISTO,
  venenatis: VENENATIS,
  vetion: VETION,
  "kalphite-queen": KQ,
  "alchemical-hydra": HYDRA,
  "abyssal-sire": SIRE,
};

export function specRecommendationsForBoss(slug: string): BossSpecRecommendation[] {
  return BOSS_SPEC_RECOMMENDATIONS[slug] ?? [];
}
