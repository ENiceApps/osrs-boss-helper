// Copies equipment icons from weirdgloop/osrs-dps-calc into public/icons/items/
// so the app serves item sprites itself instead of every visitor's browser
// hotlinking oldschool.runescape.wiki/images (see the wiki's Sep 2026 note on
// tools straining its infrastructure). Sources from GitHub, never the wiki.
//
// Run via `npm run refresh-vendor` (after the JSON refresh) or on its own with
// `npm run refresh-vendor-icons`. Needs `git` on PATH.
//
// Files are named <itemId>.png — keyed by id, so filenames never contain the
// quotes/parens/percent signs the wiki uses. Only items in ITEM_CATALOG are
// copied; orphans from a previous run are deleted.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ITEM_CATALOG } from "../data/items/catalog";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/icons/items");
const REPO = "https://github.com/weirdgloop/osrs-dps-calc.git";

const tmp = mkdtempSync(join(tmpdir(), "wgloop-icons-"));
try {
  // Blobless, shallow, sparse: downloads only the cdn/equipment images (~13 MB),
  // not the 180 MB of monster renders next to them.
  console.log(`Cloning cdn/equipment from ${REPO}`);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: tmp, stdio: "inherit" });
  git("clone", "--depth", "1", "--filter=blob:none", "--sparse", REPO, "repo");
  execFileSync("git", ["sparse-checkout", "set", "cdn/equipment"], { cwd: join(tmp, "repo"), stdio: "inherit" });
  const sha = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: join(tmp, "repo") }).toString().trim();
  const src = join(tmp, "repo/cdn/equipment");

  mkdirSync(OUT, { recursive: true });
  const wanted = new Set<string>();
  const missing: string[] = [];
  let bytes = 0;
  for (const item of ITEM_CATALOG) {
    if (!item.image) continue;
    const from = join(src, item.image);
    if (!existsSync(from)) {
      missing.push(`${item.id} ${item.name} (${item.image})`);
      continue;
    }
    const name = `${item.id}.png`;
    wanted.add(name);
    copyFileSync(from, join(OUT, name));
    bytes += statSync(from).size;
  }

  let removed = 0;
  for (const f of readdirSync(OUT)) {
    if (!wanted.has(f)) {
      rmSync(join(OUT, f));
      removed++;
    }
  }

  console.log(`  wrote ${wanted.size} icons (${(bytes / 1e6).toFixed(1)} MB) from osrs-dps-calc@${sha}; removed ${removed} stale`);
  if (missing.length) {
    console.log(`  ${missing.length} catalog items have no upstream icon (they fall back at runtime):`);
    for (const m of missing) console.log(`    ${m}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
