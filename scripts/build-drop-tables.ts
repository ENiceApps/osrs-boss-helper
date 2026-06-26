// Codegen: writes data/bosses/drops.ts — per-boss drop tables scraped from the
// OSRS Wiki, used for the profit/hr estimate (lib/profit.ts).
//
// The wiki has no Cargo/SMW API, so we parse the raw page wikitext for
// {{DropsLine}} templates (grouped under {{DropsTableHead|dropversion=…}}).
// For each line we fold the rarity and roll count into an EXPECTED quantity per
// kill; the runtime multiplies that by live GE prices, so prices are NOT baked
// in here — only item id, name, and expected-per-kill.
//
// This is a one-off / occasional refresh (it hits the network), so it is NOT in
// the `build-data` prebuild chain. Run manually: `npm run build-drop-tables`.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MONSTER_CATALOG } from "../data/monsters/catalog";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "osrs-boss-helper drop-table codegen (https://osrs-boss-helper-2026.vercel.app)";
const WIKI_API = "https://oldschool.runescape.wiki/api.php";
const MAPPING_API = "https://prices.runescape.wiki/api/v1/osrs/mapping";
const COINS_ID = 995;

interface BossDrop {
  itemId: number;
  name: string;
  /** Expected units obtained per kill (rarity × rolls × avg quantity, merged). */
  expected: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Average of every integer found in a quantity string ("5-15 (noted)" → 10). */
function parseQuantity(raw: string | undefined): number {
  if (!raw) return 1;
  const cleaned = raw.replace(/\(.*?\)/g, " "); // drop "(noted)" etc.
  const nums = cleaned.match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return 1;
  const vals = nums.map((n) => Number(n.replace(/,/g, "")));
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Rarity string → per-roll probability, or null if not quantifiable. */
function parseRarity(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s === "always") return 1;
  // Take the first fraction, e.g. "~1/128" or "5/150 (1/64 on task)".
  const m = s.match(/~?\s*(\d+(?:\.\d+)?)\s*\/\s*([\d,]+)/);
  if (m) {
    const num = Number(m[1]);
    const den = Number(m[2].replace(/,/g, ""));
    if (den > 0) return num / den;
  }
  return null; // "Varies", "Common", "Unknown", etc. — skip.
}

/** Parse a `{{DropsLine|...}}` body into its named params. */
function parseTemplateParams(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const part of body.split("|")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    params[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim();
  }
  return params;
}

/**
 * Extract drops from one page's wikitext, honoring the catalog version: when a
 * {{DropsTableHead}} declares a dropversion that doesn't match this boss's
 * version, its lines are skipped (otherwise multi-version pages double-count).
 */
function extractDrops(
  wikitext: string,
  catalogVersion: string,
  nameToId: Map<string, number>,
): Map<number, BossDrop> {
  const byId = new Map<number, BossDrop>();
  let currentVersion: string | null = null;

  // Only gate on version when the catalog's version label actually appears as a
  // dropversion on this page. The wiki often splits drops on a DIFFERENT axis
  // (e.g. "MVP"/"non-MVP") than the catalog's version ("Group"); filtering by a
  // non-matching label would drop everything. When it doesn't match, the axis
  // is orthogonal → include all lines.
  const pageVersions = new Set(
    [...wikitext.matchAll(/dropversion\s*=\s*([^|}\n]+)/gi)].map((m) => m[1].trim()),
  );
  const gateVersion = catalogVersion && pageVersions.has(catalogVersion) ? catalogVersion : null;

  for (const rawLine of wikitext.split("\n")) {
    const line = rawLine.trim();

    const head = line.match(/\{\{DropsTableHead\b([^}]*)\}\}/i);
    if (head) {
      const dv = parseTemplateParams(head[1]).dropversion;
      currentVersion = dv && dv.length > 0 ? dv : null;
      continue;
    }

    const dl = line.match(/\{\{DropsLine\b([^}]*)\}\}/i);
    if (!dl) continue;
    // Version gate: only skip when we have a matching gate version and this
    // table's version differs from it.
    if (gateVersion && currentVersion && currentVersion !== gateVersion) continue;

    const p = parseTemplateParams(dl[1]);
    const name = p.name;
    if (!name) continue;

    const prob = parseRarity(p.rarity);
    if (prob === null) continue;
    const rolls = p.rolls ? Math.max(1, parseInt(p.rolls, 10) || 1) : 1;
    const qty = parseQuantity(p.quantity);
    const expected = Math.min(1, prob * rolls) * qty;
    if (!(expected > 0)) continue;

    const lower = name.toLowerCase();
    const itemId = lower === "coins" ? COINS_ID : nameToId.get(lower);
    if (itemId === undefined) continue; // unpriceable / non-GE item — skip.

    const existing = byId.get(itemId);
    if (existing) existing.expected += expected;
    else byId.set(itemId, { itemId, name, expected });
  }

  return byId;
}

async function fetchMapping(): Promise<Map<string, number>> {
  const res = await fetch(MAPPING_API, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`mapping ${res.status}`);
  const data = (await res.json()) as Array<{ id: number; name: string }>;
  const map = new Map<string, number>();
  for (const it of data) if (!map.has(it.name.toLowerCase())) map.set(it.name.toLowerCase(), it.id);
  return map;
}

/** Fetch wikitext for up to 50 titles, resolving redirects, keyed by requested title. */
async function fetchWikitextBatch(titles: string[]): Promise<Map<string, string>> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("prop", "revisions");
  url.searchParams.set("rvprop", "content");
  url.searchParams.set("rvslots", "main");
  url.searchParams.set("redirects", "1");
  url.searchParams.set("titles", titles.join("|"));

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`query ${res.status}`);
  const data = (await res.json()) as {
    query?: {
      redirects?: Array<{ from: string; to: string }>;
      pages?: Array<{ title: string; missing?: boolean; revisions?: Array<{ slots: { main: { content: string } } }> }>;
    };
  };

  // requested title → final (redirect-resolved) title
  const redirect = new Map<string, string>();
  for (const r of data.query?.redirects ?? []) redirect.set(r.from, r.to);
  const contentByTitle = new Map<string, string>();
  for (const pg of data.query?.pages ?? []) {
    const content = pg.revisions?.[0]?.slots.main.content;
    if (content) contentByTitle.set(pg.title, content);
  }

  const out = new Map<string, string>();
  for (const t of titles) {
    const final = redirect.get(t) ?? t;
    const content = contentByTitle.get(final);
    if (content) out.set(t, content);
  }
  return out;
}

async function main() {
  console.log("Fetching item mapping…");
  const nameToId = await fetchMapping();
  console.log(`  ${nameToId.size} item names.`);

  // Skip the synthetic sandbox boss; everything else has a wiki page.
  const monsters = MONSTER_CATALOG.filter((m) => m.slug !== "ditto");
  const dropsBySlug: Record<string, BossDrop[]> = {};

  const CHUNK = 40;
  let withDrops = 0;
  for (let i = 0; i < monsters.length; i += CHUNK) {
    const chunk = monsters.slice(i, i + CHUNK);
    const titles = chunk.map((m) => m.name);
    let batch: Map<string, string>;
    try {
      batch = await fetchWikitextBatch(titles);
    } catch (e) {
      console.warn(`  batch ${i} failed: ${(e as Error).message} — retrying once`);
      await sleep(2000);
      batch = await fetchWikitextBatch(titles);
    }

    for (const m of chunk) {
      const wikitext = batch.get(m.name);
      if (!wikitext) continue;
      const byId = extractDrops(wikitext, m.version, nameToId);
      if (byId.size === 0) continue;
      // Largest expected-value contributors first is price-dependent, so just
      // sort by expected count here; the runtime re-sorts by gp value.
      const list = [...byId.values()].sort((a, b) => b.expected - a.expected);
      dropsBySlug[m.slug] = list.map((d) => ({
        itemId: d.itemId,
        name: d.name,
        expected: Math.round(d.expected * 1e6) / 1e6,
      }));
      withDrops++;
    }
    console.log(`  ${Math.min(i + CHUNK, monsters.length)}/${monsters.length} pages…`);
    await sleep(200);
  }

  const lines: string[] = [];
  lines.push(`// GENERATED FILE — do not edit by hand.`);
  lines.push(`// Run \`npm run build-drop-tables\` to regenerate from the OSRS Wiki.`);
  lines.push(`// expected = expected units obtained per kill (rarity × rolls × avg qty).`);
  lines.push(`// Runtime multiplies by live GE prices (see lib/profit.ts).`);
  lines.push(``);
  lines.push(`export interface BossDrop {`);
  lines.push(`  itemId: number;`);
  lines.push(`  name: string;`);
  lines.push(`  /** Expected units obtained per kill (rarity × rolls × avg quantity). */`);
  lines.push(`  expected: number;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const DROPS_BY_SLUG: Record<string, BossDrop[]> = ${JSON.stringify(dropsBySlug, null, 2)};`);
  lines.push(``);

  writeFileSync(resolve(ROOT, "data/bosses/drops.ts"), lines.join("\n"), "utf8");
  console.log(`Wrote data/bosses/drops.ts (${withDrops} bosses with drops, ${monsters.length} scanned)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
