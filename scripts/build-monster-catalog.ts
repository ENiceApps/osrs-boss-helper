// Codegen: writes data/monsters/catalog.ts — a list of every monster from the
// vendored weirdgloop dataset that's a plausible combat target: boss-tier
// monsters (HP >= HP_FLOOR) PLUS every Slayer-assignable creature regardless
// of HP.
//
// Filter: (HP >= HP_FLOOR OR is_slayer_monster), drop quest/league echo
// duplicates, pick one primary version per unique name. The catalog is the
// source of truth for the boss browser at /; per-boss curated content
// (presets, mechanics) is keyed by the slug emitted here.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import monstersJson from "../data/vendor/wgloop/monsters.json" with { type: "json" };
import { SUPPLEMENTAL_MONSTERS } from "../data/monsters/supplemental.js";
import type { VendorMonster } from "../types/vendor.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// HP >= 200 catches iconic mid-tier bosses (KBD at 240, DKs at 250-ish, GWD
// bosses, Kraken, Vet'ion, Scorpia, Skeletal Wyvern) plus all higher-tier
// content. Below 200 is mostly slayer mobs and quest filler. Slayer-assignable
// creatures are admitted regardless of HP (see `eligible` below) so the browser
// can serve slayer DPS estimation too — the boss browser's "Slayer" filter
// toggles them on/off so the boss roster isn't drowned by default.
const HP_FLOOR = 200;
// Filter out Leagues "Echo" variants, Nightmare Zone variants, and other
// duplicates that share the same canonical fight but with scaled stats.
// We check both the `version` field AND the `name` field, since upstream
// uses both conventions inconsistently (e.g. "Amoxliatl (Echo)" has empty
// version but the tag in the name).
const EXCLUDED_TAGS = ["Echo", "Nightmare Zone"];

interface DefenceBonuses {
  stab: number;
  slash: number;
  crush: number;
  magic: number;
  rangedHeavy: number;
  rangedStandard: number;
  rangedLight: number;
}

/** One selectable phase/form of a monster — the combat-relevant stat block of
 *  a vendor version. Spread over the parent entry to get the phased target. */
interface PhaseEntry {
  version: string;
  wikiId: number;
  combatLevel: number;
  hp: number;
  defenceLevel: number;
  magicLevel: number;
  defenceBonuses: DefenceBonuses;
  attributes: string[];
  weakness: { element: string; severity: number } | null;
  image: string;
  size: number;
  maxHitText: string;
}

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
  defenceBonuses: DefenceBonuses;
  attributes: string[];
  weakness: { element: string; severity: number } | null;
  image: string;
  size: number;
  /** Free-text max hit description from the monster page (e.g. "30 (Magic)"). */
  maxHitText: string;
  /** True iff this monster can be assigned as a Slayer task (gates the on-task UI + bonus). */
  isSlayerMonster: boolean;
  /**
   * Selectable phases/forms when the wiki records versions with DIFFERENT
   * combat stats (Zulrah's forms, Verzik's phases, Muspah's shield, quest /
   * post-quest / awakened variants…). First entry is the catalog default
   * (same stats as the top-level fields). Omitted when every version is
   * combat-identical.
   */
  phases?: PhaseEntry[];
}

// Upstream `max_hit` is free-form wiki infobox text: a bare number, a short
// string ("30 (Magic)"), or raw HTML when a monster has several max hits —
// either `<br>`-separated values or a `<div class="plainlist">` of
// `*`-prefixed lines. Flatten all of those to plain " · "-separated text so
// the UI never renders markup.
function cleanMaxHit(raw: unknown): string {
  if (raw == null) return "";
  return String(raw)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s*/, "").trim())
    .filter(Boolean)
    .join(" · ");
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
  // Prefix match tolerates compound labels ("Post-quest, Awake" — Duke Sucellus).
  const named = (v: string) =>
    candidates.find((c) => c.version === v || c.version?.startsWith(`${v},`));
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

// Fold in hand-authored monsters (brand-new releases not yet in the vendored
// weirdgloop dump — see data/monsters/supplemental.ts). Skip any whose id is
// already upstream so a future `npm run refresh-vendor` self-heals the overlap
// and we never emit a duplicate catalog entry.
const vendorMonsters = monstersJson as VendorMonster[];
const vendorIds = new Set(vendorMonsters.map((m) => m.id));
const supplemental = SUPPLEMENTAL_MONSTERS.filter((m) => !vendorIds.has(m.id));
if (supplemental.length < SUPPLEMENTAL_MONSTERS.length) {
  const shipped = SUPPLEMENTAL_MONSTERS.filter((m) => vendorIds.has(m.id)).map((m) => m.name);
  console.log(`Note: dropped supplemental monsters now present upstream: ${shipped.join(", ")}`);
}

const monsters = [...vendorMonsters, ...supplemental].map((m) => {
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
  // Admit boss-tier monsters by HP, plus every Slayer-assignable creature
  // regardless of HP (the UI's "Slayer" filter hides them by default).
  if ((m.skills?.hp ?? 0) < HP_FLOOR && !m.is_slayer_monster) return false;
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

// Phase pool: EVERY non-excluded version of a name, ignoring the HP floor —
// a real phase can sit below it (e.g. Phantom Muspah's "Shielded" object is
// 75 HP) and must still be selectable on the parent's page.
const phasePool = new Map<string, VendorMonster[]>();
for (const m of monsters) {
  if (!m.name) continue;
  if (EXCLUDED_TAGS.some((tag) => m.version?.includes(tag) || m.name?.includes(tag))) continue;
  const list = phasePool.get(m.name) ?? [];
  list.push(m);
  phasePool.set(m.name, list);
}

function toPhase(m: VendorMonster): PhaseEntry {
  return {
    version: m.version ?? "",
    wikiId: m.id,
    combatLevel: Number(m.level) || 0,
    hp: m.skills.hp,
    defenceLevel: m.skills.def,
    magicLevel: m.skills.magic,
    defenceBonuses: {
      stab: m.defensive.stab,
      slash: m.defensive.slash,
      crush: m.defensive.crush,
      magic: m.defensive.magic,
      rangedHeavy: m.defensive.heavy,
      rangedStandard: m.defensive.standard,
      rangedLight: m.defensive.light,
    },
    attributes: m.attributes ?? [],
    weakness: m.weakness ?? null,
    image: m.image,
    size: m.size,
    maxHitText: cleanMaxHit(m.max_hit),
  };
}

/** Combat identity of a version — versions that collide are the same fight
 *  (recolours like Tormented Demon 1-4) and collapse to one phase. Display
 *  fields (image, max-hit text, level) don't count. */
function combatSig(m: VendorMonster): string {
  return JSON.stringify([
    m.skills.hp, m.skills.def, m.skills.magic, m.defensive,
    m.attributes ?? [], m.weakness ?? null, m.size,
  ]);
}

/** Distinct-stat phases for a name, primary first. undefined when the fight
 *  only has one stat block. */
function phasesFor(name: string, primary: VendorMonster): PhaseEntry[] | undefined {
  const pool = phasePool.get(name) ?? [];
  const seen = new Set<string>([combatSig(primary)]);
  const out: PhaseEntry[] = [toPhase(primary)];
  for (const m of pool) {
    // Reference equality, not id — wgloop reuses one wiki id across versions
    // (e.g. Vardorvis Awakened & Post-quest are both 12223).
    if (m === primary) continue;
    const sig = combatSig(m);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(toPhase(m));
  }
  return out.length >= 2 ? out : undefined;
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
  const phases = phasesFor(name, primary);
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
    maxHitText: cleanMaxHit(primary.max_hit),
    isSlayerMonster: primary.is_slayer_monster ?? false,
    ...(phases ? { phases } : {}),
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

// Synthetic "theoretical boss creator" — every stat is editable at runtime on
// the /boss/ditto page (see components/DittoEditorPanel.tsx). These are just the
// starting defaults: a mid-tier dummy with moderate defence and no attributes
// or weakness, so the player tweaks from a neutral baseline.
const DITTO: CatalogEntry = {
  slug: "ditto",
  wikiId: 0,
  name: "Ditto (custom boss)",
  version: "",
  combatLevel: 1,
  hp: 1000,
  defenceLevel: 100,
  magicLevel: 100,
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
entries.push(DITTO);

entries.sort((a, b) => a.name.localeCompare(b.name));

const lines: string[] = [];
lines.push(`// GENERATED FILE — do not edit by hand.`);
lines.push(`// Run \`npm run build-monster-catalog\` to regenerate from data/vendor/wgloop/monsters.json.`);
lines.push(`// Filter: HP >= ${HP_FLOOR} OR is_slayer_monster, excluding entries tagged ${JSON.stringify(EXCLUDED_TAGS)}.`);
lines.push(``);
lines.push(`export interface MonsterDefenceBonuses {`);
lines.push(`  stab: number;`);
lines.push(`  slash: number;`);
lines.push(`  crush: number;`);
lines.push(`  magic: number;`);
lines.push(`  rangedHeavy: number;`);
lines.push(`  rangedStandard: number;`);
lines.push(`  rangedLight: number;`);
lines.push(`}`);
lines.push(``);
lines.push(`/** One selectable phase/form of a monster. Spread over the parent entry`);
lines.push(` *  (see lib/phases.ts applyPhase) to get the phased target. */`);
lines.push(`export interface MonsterPhaseEntry {`);
lines.push(`  version: string;`);
lines.push(`  wikiId: number;`);
lines.push(`  combatLevel: number;`);
lines.push(`  hp: number;`);
lines.push(`  defenceLevel: number;`);
lines.push(`  magicLevel: number;`);
lines.push(`  defenceBonuses: MonsterDefenceBonuses;`);
lines.push(`  attributes: string[];`);
lines.push(`  weakness: { element: string; severity: number } | null;`);
lines.push(`  image: string;`);
lines.push(`  size: number;`);
lines.push(`  maxHitText: string;`);
lines.push(`}`);
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
lines.push(`  defenceBonuses: MonsterDefenceBonuses;`);
lines.push(`  attributes: string[];`);
lines.push(`  weakness: { element: string; severity: number } | null;`);
lines.push(`  image: string;`);
lines.push(`  size: number;`);
lines.push(`  maxHitText: string;`);
lines.push(`  /** True iff this monster can be assigned as a Slayer task (gates the on-task UI + bonus). */`);
lines.push(`  isSlayerMonster: boolean;`);
lines.push(`  /** Distinct-stat phases/forms (first = default). Omitted when the fight has one stat block. */`);
lines.push(`  phases?: MonsterPhaseEntry[];`);
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
