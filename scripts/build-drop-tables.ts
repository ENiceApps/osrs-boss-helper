// Codegen: writes data/bosses/drops.ts — per-boss drop tables scraped from the
// OSRS Wiki, used for the profit/hr estimate (lib/profit.ts).
//
// The wiki has no Cargo/SMW API, so we parse the raw page wikitext for
// {{DropsLine}} templates (grouped under {{DropsTableHead|dropversion=…}}).
// The parsing itself lives in ./drop-table-parser (pure, unit-tested), including
// which of a page's tables make up one NORMAL kill of a catalog monster (its
// version's tables plus the untagged ones; Yama's Contract/Junk extras and other
// locations' variants are left out) and the few per-slug overrides.
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
import { DROP_VERSION_OVERRIDES, extractDrops, type BossDrop } from "./drop-table-parser";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "osrs-boss-helper drop-table codegen (https://osrs-boss-helper-2026.vercel.app)";
const WIKI_API = "https://oldschool.runescape.wiki/api.php";
const MAPPING_API = "https://prices.runescape.wiki/api/v1/osrs/mapping";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
      const byId = extractDrops(wikitext, m.version, nameToId, DROP_VERSION_OVERRIDES[m.slug]);
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
