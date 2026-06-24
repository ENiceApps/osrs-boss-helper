// Oracle comparison matrix — one fixture per special-case DPS code path.
//
// PURPOSE: Every conditional bonus branch in the DPS engine (demonbane, Void set,
// Tome of Fire, Tbow scaling, armor-set bonuses, elemental weakness) has at least
// one entry here with a locked baseline. If engine code changes break a branch,
// the corresponding test fails immediately.
//
// BASELINES: entries marked "engine-only" were computed from our DPS engine and
// lock in regression protection, but haven't been cross-checked against
// dps.osrs.wiki yet. To verify a fixture:
//   1. Run: npx tsx scripts/wiki-verify.ts <fixture-id>
//      (prints which items to enter in the wiki calc and which options to set)
//   2. Open https://dps.osrs.wiki/, configure the loadout, read the numbers.
//   3. Update baseline.maxHit / accuracy / dps and set verifiedOn to today's date.
//
// ADDING A NEW FIXTURE: add an entry below with verifiedOn: "TODO", then run
// npx tsx scripts/compute-oracle-baselines.ts to get initial engine values.

import type { AttackStyleChoice, SpellElement, WeaponAttackType } from "@/types/osrs";

export interface OracleFixture {
  id: string;
  /** Slug from MONSTER_CATALOG — which boss this setup targets. */
  bossSlug: string;
  itemIds: number[];
  attackType: WeaponAttackType;
  choice: AttackStyleChoice;
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  /** Which special-case engine branches this fixture exercises. */
  codePaths: string[];
  /** Notes about wiki calc options to match (e.g. Kandarin diary). */
  wikiNotes?: string;
  baseline: {
    maxHit: number;
    accuracy: number;
    dps?: number;
    verifiedOn: string;
    dpsNote?: string;
  };
}

export const ORACLE_MATRIX: OracleFixture[] = [
  // ─── Demonbane ────────────────────────────────────────────────────────────
  {
    id: "arclight-kril-demonbane",
    bossSlug: "kril-tsutsaroth",
    // Arclight, Neitiznot faceguard, Infernal cape, Amulet of torture,
    // Bandos chestplate, Bandos tassets, Ferocious gloves, Primordial boots,
    // Berserker ring (i)
    itemIds: [19675, 24271, 21287, 19553, 11832, 11834, 22981, 13239, 11773],
    attackType: "slash",
    choice: "aggressive",
    codePaths: [
      "demonbane: +70% accuracy ADDITIVE vs demon attribute",
      "demonbane: +70% damage ADDITIVE vs demon attribute",
    ],
    wikiNotes: "Piety prayer. K'ril Tsutsaroth. Arclight must be equipped (not Inactive).",
    baseline: { maxHit: 45, accuracy: 0.3705, dps: 3.474, verifiedOn: "engine-only (TODO: verify at dps.osrs.wiki)" },
  },

  // ─── Void Knight (Ranged — regular) ───────────────────────────────────────
  {
    id: "void-ranged-graardor",
    bossSlug: "general-graardor",
    // Void ranger helm, Void knight top, Void knight robe, Void knight gloves,
    // Rune crossbow, Adamant bolts, Necklace of anguish, Ava's assembler,
    // Pegasian boots, Archers ring (i)
    itemIds: [11664, 8839, 8840, 8842, 9185, 9143, 19547, 21914, 13237, 11771],
    attackType: "ranged",
    choice: "rapid",
    codePaths: [
      "void-ranged set bonus: ×11/10 accuracy + ×11/10 damage",
    ],
    wikiNotes: "Rigour prayer. General Graardor. No Kandarin diary (bolts are not enchanted).",
    // accuracy corrected 0.3423 → 0.3408 (bug #8: void ×11/10 applies to the
    // effective level, not the attack roll). Now matches wgloop.
    baseline: { maxHit: 38, accuracy: 0.3408, dps: 2.158, verifiedOn: "2026-06-23 (oracle vs wgloop)" },
  },

  // ─── Elite Void Knight (Ranged) ───────────────────────────────────────────
  {
    id: "elite-void-ranged-graardor",
    bossSlug: "general-graardor",
    // Void ranger helm, Elite void top, Elite void robe, Void knight gloves,
    // Rune crossbow, Adamant bolts, Necklace of anguish, Ava's assembler,
    // Pegasian boots, Archers ring (i)
    itemIds: [11664, 13072, 13073, 8842, 9185, 9143, 19547, 21914, 13237, 11771],
    attackType: "ranged",
    choice: "rapid",
    codePaths: [
      "elite-void-ranged set bonus: ×11/10 accuracy + ×9/8 damage (stronger than regular)",
    ],
    wikiNotes: "Rigour prayer. General Graardor. Elite void top + robe equipped.",
    // accuracy corrected 0.3423 → 0.3408 (bug #8). Now matches wgloop.
    baseline: { maxHit: 39, accuracy: 0.3408, dps: 2.215, verifiedOn: "2026-06-23 (oracle vs wgloop)" },
  },

  // ─── Void Knight (Melee) ──────────────────────────────────────────────────
  {
    id: "void-melee-graardor",
    bossSlug: "general-graardor",
    // Void melee helm, Void knight top, Void knight robe, Void knight gloves (required),
    // Abyssal whip, Infernal cape, Amulet of torture, Primordial boots, Berserker ring (i)
    itemIds: [11665, 8839, 8840, 8842, 4151, 21287, 19553, 13239, 11773],
    attackType: "slash",
    choice: "accurate",
    codePaths: [
      "void-melee set bonus: ×11/10 accuracy + ×11/10 damage",
    ],
    wikiNotes: "Piety prayer. General Graardor. Void gloves are mandatory for the set.",
    // accuracy corrected 0.2971 → 0.2952 (bug #8). Now matches wgloop.
    baseline: { maxHit: 39, accuracy: 0.2952, dps: 2.398, verifiedOn: "2026-06-23 (oracle vs wgloop)" },
  },

  // ─── Tome of Fire + elemental weakness ────────────────────────────────────
  {
    id: "tome-fire-zulrah-weakness",
    bossSlug: "zulrah",
    // Kodai wand, Ancestral hat, Ancestral robe top, Ancestral robe bottom,
    // Occult necklace, Tome of fire (charged), Eternal boots, Seers ring (i)
    itemIds: [21006, 21018, 21021, 21024, 12002, 20714, 13235, 11770],
    attackType: "magic",
    choice: "longrange",
    baseSpellMaxHit: 24,
    spellElement: "fire",
    codePaths: [
      "Tome of Fire: ×11/10 damage on fire spells",
      "elemental weakness: fire vs Zulrah (severity 50) boosts attack roll + max hit",
    ],
    wikiNotes: "Augury prayer. Zulrah. Fire Surge (max hit 24). Tome of Fire (charged) equipped. No special options.",
    // dps corrected 9.262 → 7.410 after the magic cast-speed fix (Fire Surge
    // autocasts at 5 ticks, not the Kodai wand's 4-tick melee speed). Now matches
    // the wgloop engine (7.416) via scripts/oracle.
    baseline: { maxHit: 48, accuracy: 0.9262, dps: 7.41, verifiedOn: "2026-06-23 (oracle vs wgloop)" },
  },

  // ─── Twisted bow at high-magic boss ───────────────────────────────────────
  {
    id: "tbow-cerberus",
    bossSlug: "cerberus",
    // Twisted bow, Crystal helm, Crystal body, Crystal legs,
    // Necklace of anguish, Ava's assembler, Pegasian boots,
    // Zaryte vambraces, Archers ring (i)
    itemIds: [20997, 23971, 23975, 23979, 19547, 21914, 13237, 26235, 11771],
    attackType: "ranged",
    choice: "rapid",
    codePaths: [
      "Twisted bow scaling: accuracy/damage scale with monster magic level (220 at Cerberus)",
      "Tbow cap: 250 (non-Xerician boss) — different scaling point than Vorkath fixtures",
    ],
    wikiNotes: "Rigour prayer. Cerberus. Twisted bow equipped.",
    baseline: { maxHit: 38, accuracy: 0.7922, dps: 5.017, verifiedOn: "engine-only (TODO: verify at dps.osrs.wiki)" },
  },

  // ─── Inquisitor's armour (attack-type-gated set bonus) ────────────────────
  {
    id: "inquisitors-crush-graardor",
    bossSlug: "general-graardor",
    // Inquisitor's great helm, hauberk, plateskirt, Barrelchest anchor (crush),
    // Infernal cape, Amulet of torture, Ferocious gloves, Primordial boots, Berserker ring (i)
    itemIds: [24419, 24420, 24421, 10887, 21287, 19553, 22981, 13239, 11773],
    attackType: "crush",
    choice: "aggressive",
    codePaths: [
      "Inquisitor's set bonus: ×41/40 accuracy + ×41/40 damage (crush attacks only)",
      "attack-type gate: set bonus must NOT fire for stab/slash with same pieces",
    ],
    wikiNotes: "Piety prayer. General Graardor. Full Inquisitor's set. Barrelchest anchor (crush style).",
    // Matches wgloop exactly once the oracle replays our post-buff Inquisitor
    // stat-overrides into the clone (its pinned equipment.json is pre-buff).
    baseline: { maxHit: 47, accuracy: 0.374, dps: 2.441, verifiedOn: "2026-06-23 (oracle vs wgloop)" },
  },

  // ─── Obsidian armour (weapon-gated set bonus) ─────────────────────────────
  {
    id: "obsidian-melee-cerberus",
    bossSlug: "cerberus",
    // Toktz-xil-ak (obsidian sword, stab), Obsidian helmet, platebody, platelegs,
    // Infernal cape, Berserker necklace, Ferocious gloves, Primordial boots, Berserker ring (i)
    itemIds: [6523, 21298, 21301, 21304, 21287, 11128, 22981, 13239, 11773],
    attackType: "stab",
    choice: "aggressive",
    codePaths: [
      "Obsidian set bonus: ×11/10 accuracy + ×11/10 damage (TzHaar weapon required)",
      "weapon-ID gate: set bonus must NOT fire if a non-TzHaar weapon is equipped",
    ],
    wikiNotes: "Piety prayer. Cerberus. Toktz-xil-ak (obsidian sword) equipped. Full obsidian set. Berserker necklace.",
    // maxHit corrected 36 → 43 after modelling the Berserker necklace ×6/5 (bug
    // #6). maxHit + accuracy now match wgloop exactly; dps 5.693 vs wgloop 5.625
    // (~1.2%) — a residual from wgloop flooring each value of the scaled hit
    // distribution, which our max-hit-only model doesn't capture (see dpsNote).
    baseline: {
      maxHit: 43,
      accuracy: 0.6355,
      dps: 5.693,
      verifiedOn: "2026-06-23 (oracle vs wgloop)",
      dpsNote: "wgloop 5.625; ~1.2% gap from distribution-flooring on the necklace ×6/5",
    },
  },
];
