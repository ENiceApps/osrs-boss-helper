// Bank-vs-wiki comparison sweep.
// Loads data/my-bank.json, runs the optimizer for a curated boss list at 99s,
// creates a wiki DPS calc shortlink for each loadout, and writes a CSV you can
// open in Excel/Sheets to compare our DPS vs the wiki's.
//
// Usage: npx tsx scripts/bank-compare.ts
// Output: reports/bank-compare.csv
//
// Columns:
//   our columns  — computed locally by this script
//   wiki_calc_url — pre-filled link; click it, read the DPS, paste into wiki_dps
//   wiki_dps / dps_diff / dps_diff_pct / notes — fill in manually after review

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { optimizeForBoss } from "@/lib/optimize/bank";
import { bankBoostResolver, boostFromBank } from "@/lib/dps/boost";
import { activeBonusesForTarget } from "@/lib/loadout";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";
import type { Skills } from "@/types/osrs";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SKILLS_99: Skills = {
  attack: 99, strength: 99, defence: 99,
  ranged: 99, magic: 99, hitpoints: 99, prayer: 99,
};

// Curated list — add or remove slugs as needed.
const BOSS_SLUGS = [
  "vorkath",
  "zulrah",
  "vardorvis",
  "the-leviathan",
  "the-whisperer",
  "duke-sucellus",
  "general-graardor",
  "commander-zilyana",
  "kreearra",
  "kril-tsutsaroth",
  "nex",
  "the-nightmare",
  "phosanis-nightmare",
  "cerberus",
  "thermonuclear-smoke-devil",
  "king-black-dragon",
  "kalphite-queen",
  "dagannoth-prime",
  "dagannoth-rex",
  "dagannoth-supreme",
  "phantom-muspah",
  "corporeal-beast",
  "abyssal-sire",
  "sarachnis",
  "giant-mole",
];

const WIKI_CALC_BASE = "https://tools.runescape.wiki/osrs-dps/";
const SHORTLINK_API  = "https://tools.runescape.wiki/osrs-dps/shortlink";
const APP_BASE       = "http://localhost:3000";
const DELAY_MS       = 1100; // stay well under any rate-limit

// ---------------------------------------------------------------------------
// Wiki-calc payload builder (mirrors lib/wiki-export.ts but runs in Node)
// ---------------------------------------------------------------------------

type WikiStance =
  | "Accurate" | "Aggressive" | "Controlled" | "Defensive"
  | "Rapid" | "Longrange" | "Autocast" | "Defensive Autocast";

function toWikiStance(choice: string, style: string): WikiStance {
  if (style === "magic") return choice === "defensive" ? "Defensive Autocast" : "Autocast";
  switch (choice) {
    case "accurate":   return "Accurate";
    case "aggressive": return "Aggressive";
    case "controlled": return "Controlled";
    case "defensive":  return "Defensive";
    case "rapid":      return "Rapid";
    case "longrange":  return "Longrange";
    default:           return "Accurate";
  }
}

function buildWikiPayload(
  set: LoadoutSet,
  skills: Skills,
  monster: MonsterCatalogEntry,
): object {
  const stance = toWikiStance(set.attackStyleChoice, set.style);
  return {
    serializationVersion: 10,
    selectedLoadout: 0,
    loadouts: [{
      name: "Boss Helper export",
      style: { name: stance, type: set.attackType, stance },
      skills: {
        atk: skills.attack, str: skills.strength, def: skills.defence,
        ranged: skills.ranged, magic: skills.magic, hp: skills.hitpoints,
        prayer: skills.prayer, mining: 1, herblore: 99,
      },
      equipment: {
        head:   set.slots.head   ? { id: set.slots.head.itemId }   : null,
        cape:   set.slots.cape   ? { id: set.slots.cape.itemId }   : null,
        neck:   set.slots.neck   ? { id: set.slots.neck.itemId }   : null,
        ammo:   set.slots.ammo   ? { id: set.slots.ammo.itemId }   : null,
        weapon: set.slots.weapon ? { id: set.slots.weapon.itemId } : null,
        body:   set.slots.body   ? { id: set.slots.body.itemId }   : null,
        shield: set.slots.shield ? { id: set.slots.shield.itemId } : null,
        legs:   set.slots.legs   ? { id: set.slots.legs.itemId }   : null,
        hands:  set.slots.hands  ? { id: set.slots.hands.itemId }  : null,
        feet:   set.slots.feet   ? { id: set.slots.feet.itemId }   : null,
        ring:   set.slots.ring   ? { id: set.slots.ring.itemId }   : null,
      },
      buffs: {
        onSlayerTask: false, inWilderness: false, kandarinDiary: true,
        chargeSpell: false, markOfDarknessSpell: false, forinthrySurge: false,
        soulreaperStacks: 0, potions: [], baAttackerLevel: 0,
        chinchompaDistance: 4, usingSunfireRunes: false,
      },
      prayers: [],
      spell: null,
    }],
    monster: {
      id: monster.wikiId,
      name: monster.name,
      version: monster.version,
      image: monster.image,
      size: monster.size,
      speed: 4,
      style: "crush",
      skills: {
        atk: 0, def: monster.defenceLevel, hp: monster.hp,
        magic: monster.magicLevel, ranged: 0, str: 0,
      },
      offensive: { atk: 0, magic: 0, magic_str: 0, ranged: 0, ranged_str: 0, str: 0 },
      defensive: {
        flat_armour: 0,
        stab:     monster.defenceBonuses.stab,
        slash:    monster.defenceBonuses.slash,
        crush:    monster.defenceBonuses.crush,
        magic:    monster.defenceBonuses.magic,
        light:    monster.defenceBonuses.rangedLight,
        standard: monster.defenceBonuses.rangedStandard,
        heavy:    monster.defenceBonuses.rangedHeavy,
      },
      attributes: monster.attributes,
      weakness: monster.weakness,
      immunities: { burn: null },
      is_slayer_monster: false,
      inputs: {
        isFromCoxCm: false, toaInvocationLevel: 0, toaPathLevel: 0,
        partyMaxCombatLevel: 126, partySumMiningLevel: 99, partyMaxHpLevel: 99,
        partySize: 1, monsterCurrentHp: monster.hp,
        defenceReductions: {
          vulnerability: false, accursed: false, elderMaul: 0, dwh: 0,
          arclight: 0, emberlight: 0, bgs: 0, tonalztic: 0, seercull: 0, ayak: 0,
        },
        prayers: { melee: false, ranged: false, magic: false },
      },
    },
  };
}

async function createShortlink(
  set: LoadoutSet,
  skills: Skills,
  monster: MonsterCatalogEntry,
): Promise<string | null> {
  if (monster.wikiId === 0) return null;
  try {
    const res = await fetch(SHORTLINK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildWikiPayload(set, skills, monster)),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: string };
    return `${WIKI_CALC_BASE}?id=${json.data}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function esc(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function row(...cells: (string | number | null | undefined)[]): string {
  return cells.map(esc).join(",");
}

function activeBonusLabel(set: LoadoutSet, monster: MonsterCatalogEntry): string {
  const ab = activeBonusesForTarget(set, monster);
  const flags: string[] = [];
  if (ab.conditionalBonuses.dragonHunterCrossbow) flags.push("DHCB vs dragon");
  if (ab.conditionalBonuses.dragonHunterLance)    flags.push("DHL vs dragon");
  if (ab.conditionalBonuses.dragonHunterWand)     flags.push("DH wand vs dragon");
  if (ab.conditionalBonuses.salveAmuletEi)         flags.push("Salve(ei) vs undead");
  if (ab.conditionalBonuses.salveAmulet)           flags.push("Salve vs undead");
  if (ab.conditionalBonuses.demonbane)             flags.push("Demonbane vs demon");
  if (ab.tomeOfFireEquipped)                       flags.push("Tome of Fire");
  if (ab.twistedBowEquipped)                       flags.push("Tbow scaling");
  if (ab.fangEquipped)                             flags.push("Fang 2× acc");
  return flags.join(" | ");
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const bankData = JSON.parse(readFileSync(resolve(ROOT, "data/my-bank.json"), "utf8"));
  const bankItemIds = new Set<number>(
    (bankData.items as { id: number }[]).map((i) => i.id),
  );
  const boostResolver = bankBoostResolver(bankItemIds);
  const skills = SKILLS_99;

  console.log(`Loaded bank: ${bankItemIds.size} items`);
  console.log(`Sweeping ${BOSS_SLUGS.length} bosses at 99s / own-only...\n`);

  const HEADER = row(
    "boss_name",
    "our_dps", "accuracy_pct", "max_hit",
    "style", "attack_type", "style_choice",
    "weapon",
    "ammo_slot",
    "loaded_dart",
    "head", "cape", "neck",
    "body", "shield", "legs", "hands", "feet", "ring",
    "boost_used",
    "active_bonuses",
    "boss_page_url",
    "wiki_calc_url",
    "wiki_dps",
    "dps_diff",
    "dps_diff_pct",
    "notes",
  );

  const lines: string[] = [HEADER];

  for (const slug of BOSS_SLUGS) {
    const monster = MONSTER_BY_SLUG[slug];
    if (!monster) {
      console.warn(`  SKIP  ${slug} — not found in catalog`);
      continue;
    }

    const { rankings } = optimizeForBoss({
      bank: bankItemIds,
      target: monster,
      skills,
      topN: 1,
      boostResolver,
    });

    if (!rankings.length) {
      console.log(`  EMPTY ${monster.name} — no valid loadout from bank`);
      lines.push(row(
        monster.name, "no loadout", "", "",
        "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "",
        "none", "",
        `${APP_BASE}/boss/${slug}`, "",
        "", "", "", "",
      ));
      continue;
    }

    const { loadout: set, dps } = rankings[0];
    const boostObj = boostFromBank(set.style, bankItemIds);
    const boostName = boostObj?.name ?? "none";
    const activeBonuses = activeBonusLabel(set, monster);

    process.stdout.write(`  ${monster.name.padEnd(32)} ${set.style.padEnd(7)} ${dps.dps.toFixed(3)} dps  `);

    const wikiUrl = await createShortlink(set, skills, monster);
    console.log(wikiUrl ? "✓ shortlink" : "✗ shortlink failed");

    lines.push(row(
      monster.name,
      dps.dps.toFixed(4),
      (dps.accuracy * 100).toFixed(2),
      dps.maxHit,
      set.style,
      set.attackType,
      set.attackStyleChoice,
      set.slots.weapon?.itemName ?? "",
      set.slots.ammo?.itemName ?? "",
      set.internalAmmo?.itemName ?? "",
      set.slots.head?.itemName  ?? "",
      set.slots.cape?.itemName  ?? "",
      set.slots.neck?.itemName  ?? "",
      set.slots.body?.itemName  ?? "",
      set.slots.shield?.itemName ?? "",
      set.slots.legs?.itemName  ?? "",
      set.slots.hands?.itemName ?? "",
      set.slots.feet?.itemName  ?? "",
      set.slots.ring?.itemName  ?? "",
      boostName,
      activeBonuses,
      `${APP_BASE}/boss/${slug}`,
      wikiUrl ?? "",
      "",  // wiki_dps — fill after clicking the link
      "",  // dps_diff
      "",  // dps_diff_pct
      "",  // notes
    ));

    await sleep(DELAY_MS);
  }

  mkdirSync(resolve(ROOT, "reports"), { recursive: true });
  const outPath = resolve(ROOT, "reports/bank-compare.csv");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`\nWrote ${lines.length - 1} boss rows → ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
