// One-off script: compute engine baselines for oracle-matrix fixtures.
// Run with: npx tsx scripts/compute-oracle-baselines.ts
// Paste the printed baselines into tests/fixtures/oracle-matrix.ts.
// Then verify each entry against dps.osrs.wiki and update verifiedOn.

import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";

interface FixtureInput {
  id: string;
  bossSlug: string;
  itemIds: number[];
  attackType: "stab" | "slash" | "crush" | "ranged" | "magic";
  choice: "accurate" | "aggressive" | "controlled" | "defensive" | "rapid" | "longrange";
  baseSpellMaxHit?: number;
  spellElement?: "fire" | "water" | "earth" | "air";
}

const FIXTURES: FixtureInput[] = [
  // --- Arclight demonbane ---
  {
    id: "arclight-kril-demonbane",
    bossSlug: "kril-tsutsaroth",
    // Arclight, Neitiznot faceguard, Infernal cape, Amulet of torture,
    // Bandos chestplate, Bandos tassets, Ferocious gloves, Primordial boots, Berserker ring (i)
    itemIds: [19675, 24271, 21287, 19553, 11832, 11834, 22981, 13239, 11773],
    attackType: "slash",
    choice: "aggressive",
  },

  // --- Void Knight (Ranged, regular) ---
  {
    id: "void-ranged-graardor",
    bossSlug: "general-graardor",
    // Void ranger helm, Void knight top, Void knight robe, Void knight gloves,
    // Rune crossbow, Adamant bolts, Necklace of anguish, Ava's assembler,
    // Pegasian boots, Archers ring (i)
    itemIds: [11664, 8839, 8840, 8842, 9185, 9143, 19547, 21914, 13237, 11771],
    attackType: "ranged",
    choice: "rapid",
  },

  // --- Elite Void Knight (Ranged) ---
  {
    id: "elite-void-ranged-graardor",
    bossSlug: "general-graardor",
    // Void ranger helm, Elite void top, Elite void robe, Void knight gloves,
    // Rune crossbow, Adamant bolts, Necklace of anguish, Ava's assembler,
    // Pegasian boots, Archers ring (i)
    itemIds: [11664, 13072, 13073, 8842, 9185, 9143, 19547, 21914, 13237, 11771],
    attackType: "ranged",
    choice: "rapid",
  },

  // --- Void Knight (Melee) ---
  {
    id: "void-melee-graardor",
    bossSlug: "general-graardor",
    // Void melee helm, Void knight top, Void knight robe, Void knight gloves (required for set),
    // Abyssal whip, Infernal cape, Amulet of torture, Primordial boots, Berserker ring (i)
    itemIds: [11665, 8839, 8840, 8842, 4151, 21287, 19553, 13239, 11773],
    attackType: "slash",
    choice: "accurate",
  },

  // --- Tome of Fire + fire spell vs fire-weak boss ---
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
  },

  // --- Twisted bow at high-magic boss (Cerberus, magic 220) ---
  {
    id: "tbow-cerberus",
    bossSlug: "cerberus",
    // Twisted bow, Crystal helm, Crystal body, Crystal legs,
    // Necklace of anguish, Ava's assembler, Pegasian boots,
    // Zaryte vambraces, Archers ring (i)
    itemIds: [20997, 23971, 23975, 23979, 19547, 21914, 13237, 26235, 11771],
    attackType: "ranged",
    choice: "rapid",
  },

  // --- Inquisitor's armour (crush bonus) ---
  {
    id: "inquisitors-crush-graardor",
    bossSlug: "general-graardor",
    // Inquisitor's great helm, hauberk, plateskirt, Barrelchest anchor,
    // Infernal cape, Amulet of torture, Ferocious gloves, Primordial boots, Berserker ring (i)
    itemIds: [24419, 24420, 24421, 10887, 21287, 19553, 22981, 13239, 11773],
    attackType: "crush",
    choice: "aggressive",
  },

  // --- Obsidian armour + TzHaar weapon (weapon-gated set bonus) ---
  {
    id: "obsidian-melee-cerberus",
    bossSlug: "cerberus",
    // Toktz-xil-ak (obsidian sword, stab), Obsidian helmet, platebody, platelegs,
    // Infernal cape, Berserker necklace, Ferocious gloves, Primordial boots, Berserker ring (i)
    itemIds: [6523, 21298, 21301, 21304, 21287, 11128, 22981, 13239, 11773],
    attackType: "stab",
    choice: "aggressive",
  },
];

async function main() {
  console.log("Computing engine baselines for oracle-matrix fixtures...\n");

  for (const f of FIXTURES) {
    const boss = MONSTER_BY_SLUG[f.bossSlug];
    if (!boss) {
      console.error(`❌ Boss not found: ${f.bossSlug}`);
      continue;
    }

    const result = scoreScenario({
      itemIds: f.itemIds,
      target: boss,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: f.attackType, choice: f.choice },
      baseSpellMaxHit: f.baseSpellMaxHit,
      spellElement: f.spellElement,
    });

    if (!result.valid) {
      console.error(`❌ ${f.id}: invalid — ${result.reasons.join("; ")}`);
      continue;
    }

    const { maxHit, accuracy, dps } = result.dps;
    console.log(`// ${f.id}`);
    console.log(`baseline: { maxHit: ${maxHit}, accuracy: ${accuracy.toFixed(4)}, dps: ${dps.toFixed(3)}, verifiedOn: "engine-only (TODO: verify at dps.osrs.wiki)" },`);
    console.log();
  }
}

main().catch(console.error);
