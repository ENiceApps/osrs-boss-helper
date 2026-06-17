// Codegen: writes data/monsters/catalog.ts — a compact list of every monster
// from the vendored weirdgloop dataset that's plausibly a "boss-tier" target.
//
// Filter: HP >= 300, drop quest/league echo duplicates, pick one primary
// version per unique name. The catalog is the source of truth for the boss
// browser at /; per-boss curated content (presets, mechanics) is keyed by
// the slug emitted here.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import monstersJson from "../data/vendor/wgloop/monsters.json" with { type: "json" };
import type { VendorMonster } from "../types/vendor.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// HP >= 200 catches iconic mid-tier bosses (KBD at 240, DKs at 250-ish, GWD
// bosses, Kraken, Vet'ion, Scorpia, Skeletal Wyvern) plus all higher-tier
// content. Below 200 is mostly slayer mobs and quest filler — still useful
// for slayer DPS estimation but not the "boss helper" core. Adjust if/when
// we add a separate slayer-monster browser.
const HP_FLOOR = 200;
// Filter out Leagues "Echo" variants, Nightmare Zone variants, and other
// duplicates that share the same canonical fight but with scaled stats.
// We check both the `version` field AND the `name` field, since upstream
// uses both conventions inconsistently (e.g. "Amoxliatl (Echo)" has empty
// version but the tag in the name).
const EXCLUDED_TAGS = ["Echo", "Nightmare Zone"];

interface CatalogEntry {
  slug: string;
  /** Numeric monster ID from the weirdgloop/osrs-dps-calc dataset. 0 for synthetic entries. */
  wikiId: number;
  name: string;
  version: string;
  combatLevel: number;
  hp: number;
  defenceLevel: number;
  magicLevel: number;
  defenceBonuses: {
    stab: number;
    slash: number;
    crush: number;
    magic: number;
    rangedHeavy: number;
    rangedStandard: number;
    rangedLight: number;
  };
  attributes: string[];
  weakness: { element: string; severity: number } | null;
  image: string;
  size: number;
  /** Free-text max hit description from the monster page (e.g. "30 (Magic)"). */
  maxHitText: string;
  /** True iff this monster can be assigned as a Slayer task (gates the on-task UI + bonus). */
  isSlayerMonster: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Some bosses have multiple equal-HP phases; name the one that best represents
// a typical kill for DPS benchmarking. Add entries here as needed.
const PREFERRED_VERSION: Record<string, string> = {
  // Serpentine is the wiki calc's default and the most-fought phase.
  "Zulrah": "Serpentine",
};

function pickPrimaryVersion(name: string, candidates: VendorMonster[]): VendorMonster {
  if (candidates.length === 1) return candidates[0];
  const named = (v: string) => candidates.find((c) => c.version === v);
  return (
    named(PREFERRED_VERSION[name]) ??
    named("Post-quest") ??
    named("Normal") ??
    named("Hard Mode") ??
    [...candidates].sort((a, b) => b.skills.hp - a.skills.hp)[0]
  );
}

// ---------------------------------------------------------------------------
// Stat overrides for monsters where the weirdgloop vendor data is wrong.
// Keyed by "name|version" (empty version = "") → partial skill/defensive patch.
// Always cite the OSRS Wiki as source so future maintainers can verify.
// ---------------------------------------------------------------------------
const STAT_OVERRIDES: Record<string, Partial<{ def: number; magic: number }>> = {
  // Weirdgloop exports def=0 for all Vardorvis versions.
  // Wiki: https://oldschool.runescape.wiki/w/Vardorvis (Post-quest defence level = 200)
  "Vardorvis|Post-quest": { def: 200 },
  "Vardorvis|Awakened":   { def: 200 },
  "Vardorvis|Quest":      { def: 200 },
};

const monsters = (monstersJson as VendorMonster[]).map((m) => {
  const key = `${m.name}|${m.version ?? ""}`;
  const patch = STAT_OVERRIDES[key];
  if (!patch) return m;
  return {
    ...m,
    skills: { ...m.skills, ...(patch.def != null ? { def: patch.def } : {}) },
  };
});

const eligible = monsters.filter((m) => {
  if (!m.name) return false;
  if ((m.skills?.hp ?? 0) < HP_FLOOR) return false;
  if (EXCLUDED_TAGS.some((tag) => m.version?.includes(tag) || m.name?.includes(tag))) {
    return false;
  }
  return true;
});

const byName = new Map<string, VendorMonster[]>();
for (const m of eligible) {
  const list = byName.get(m.name) ?? [];
  list.push(m);
  byName.set(m.name, list);
}

const entries: CatalogEntry[] = [];
const usedSlugs = new Set<string>();
for (const [name, candidates] of byName) {
  const primary = pickPrimaryVersion(name, candidates);
  let slug = slugify(name);
  // De-dupe slugs from naming collisions (vanishingly rare here, but cheap insurance).
  if (usedSlugs.has(slug)) {
    let i = 2;
    while (usedSlugs.has(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }
  usedSlugs.add(slug);
  entries.push({
    slug,
    wikiId: primary.id,
    name: primary.name,
    version: primary.version,
    // Upstream vendor data has `level` as a string for ~5 monsters (data-quality
    // bug). Coerce defensively so the generated TS keeps a number type.
    combatLevel: Number(primary.level) || 0,
    hp: primary.skills.hp,
    defenceLevel: primary.skills.def,
    magicLevel: primary.skills.magic,
    defenceBonuses: {
      stab: primary.defensive.stab,
      slash: primary.defensive.slash,
      crush: primary.defensive.crush,
      magic: primary.defensive.magic,
      rangedHeavy: primary.defensive.heavy,
      rangedStandard: primary.defensive.standard,
      rangedLight: primary.defensive.light,
    },
    attributes: primary.attributes ?? [],
    weakness: primary.weakness ?? null,
    image: primary.image,
    size: primary.size,
    // Coerce defensively — upstream has both string ("30 (Magic)") and number (0) shapes.
    maxHitText: primary.max_hit == null ? "" : String(primary.max_hit),
    isSlayerMonster: primary.is_slayer_monster ?? false,
  });
}

// Synthetic test target — not from vendor data. Mirrors the in-game POH
// Combat dummy: stationary, 10k HP, level 1 everything, zero defence bonuses,
// no attribute tags. Use it as a clean baseline DPS check (no DHCB / Salve /
// demonbane / Tbow-scaling conditional bonuses ever fire against it, so the
// optimizer's number is the engine's raw output for whatever gear you bring).
const COMBAT_DUMMY: CatalogEntry = {
  slug: "combat-dummy",
  wikiId: 0,
  name: "Combat dummy",
  version: "",
  combatLevel: 1,
  hp: 10_000,
  defenceLevel: 1,
  magicLevel: 1,
  defenceBonuses: {
    stab: 0,
    slash: 0,
    crush: 0,
    magic: 0,
    rangedHeavy: 0,
    rangedStandard: 0,
    rangedLight: 0,
  },
  attributes: [],
  weakness: null,
  image: "Combat_dummy.png",
  size: 1,
  maxHitText: "0",
  isSlayerMonster: false,
};
entries.push(COMBAT_DUMMY);

entries.sort((a, b) => a.name.localeCompare(b.name));

const lines: string[] = [];
lines.push(`// GENERATED FILE — do not edit by hand.`);
lines.push(`// Run \`npm run build-monster-catalog\` to regenerate from data/vendor/wgloop/monsters.json.`);
lines.push(`// Filter: HP >= ${HP_FLOOR}, excluding entries tagged ${JSON.stringify(EXCLUDED_TAGS)}.`);
lines.push(``);
lines.push(`export interface MonsterCatalogEntry {`);
lines.push(`  slug: string;`);
lines.push(`  /** Numeric monster ID from the weirdgloop/osrs-dps-calc dataset. 0 for synthetic entries. */`);
lines.push(`  wikiId: number;`);
lines.push(`  name: string;`);
lines.push(`  version: string;`);
lines.push(`  combatLevel: number;`);
lines.push(`  hp: number;`);
lines.push(`  defenceLevel: number;`);
lines.push(`  magicLevel: number;`);
lines.push(`  defenceBonuses: {`);
lines.push(`    stab: number;`);
lines.push(`    slash: number;`);
lines.push(`    crush: number;`);
lines.push(`    magic: number;`);
lines.push(`    rangedHeavy: number;`);
lines.push(`    rangedStandard: number;`);
lines.push(`    rangedLight: number;`);
lines.push(`  };`);
lines.push(`  attributes: string[];`);
lines.push(`  weakness: { element: string; severity: number } | null;`);
lines.push(`  image: string;`);
lines.push(`  size: number;`);
lines.push(`  maxHitText: string;`);
lines.push(`  /** True iff this monster can be assigned as a Slayer task (gates the on-task UI + bonus). */`);
lines.push(`  isSlayerMonster: boolean;`);
lines.push(`}`);
lines.push(``);
lines.push(`export const MONSTER_CATALOG: MonsterCatalogEntry[] = ${JSON.stringify(entries, null, 2)};`);
lines.push(``);
lines.push(`export const MONSTER_BY_SLUG: Record<string, MonsterCatalogEntry> = Object.fromEntries(`);
lines.push(`  MONSTER_CATALOG.map((m) => [m.slug, m]),`);
lines.push(`);`);
lines.push(``);

writeFileSync(resolve(ROOT, "data/monsters/catalog.ts"), lines.join("\n"), "utf8");
console.log(`Wrote data/monsters/catalog.ts (${entries.length} monsters)`);
