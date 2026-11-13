// Re-downloads the vendored weirdgloop dataset files into data/vendor/wgloop/.
// Run via `npm run refresh-vendor` when you want to pick up upstream changes.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  { name: "equipment.json", url: "https://raw.githubusercontent.com/weirdgloop/osrs-dps-calc/main/cdn/json/equipment.json" },
  { name: "monsters.json", url: "https://raw.githubusercontent.com/weirdgloop/osrs-dps-calc/main/cdn/json/monsters.json" },
  // Item variants the calc treats as one item (data/items/aliases.ts). The
  // ammo table (ammo-applicability.json) is dumped from upstream's
  // Equipment.ts by hand: see data/items/ammo-applicability.ts.
  { name: "equipment_aliases.json", url: "https://raw.githubusercontent.com/weirdgloop/osrs-dps-calc/main/cdn/json/equipment_aliases.json" },
];

for (const f of FILES) {
  console.log(`Fetching ${f.name} from ${f.url}`);
  const res = await fetch(f.url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${f.url}`);
  const text = await res.text();
  // Lightly validate that the body parses as JSON before writing — saves us
  // from accidentally clobbering a working file with an HTML error page.
  JSON.parse(text);
  const path = resolve(ROOT, "data/vendor/wgloop", f.name);
  writeFileSync(path, text, "utf8");
  console.log(`  wrote ${path} (${text.length} bytes)`);
}

console.log("Done. Run `npm run build-presets` to regenerate derived files.");
