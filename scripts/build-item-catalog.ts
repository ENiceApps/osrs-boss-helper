// Codegen: produces a slim, client-safe catalog of equippable items keyed by
// the same fields users will sort/filter on in /items. Drops the upstream
// weight/image fields we don't surface, keeps bonuses + offensive/defensive
// + speed/category + version. Stays well under the 3 MB raw equipment.json
// so it's safe to import into a client page.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import equipmentJson from "../data/vendor/wgloop/equipment.json" with { type: "json" };
import requirementsJson from "../data/vendor/wiki/item-requirements.json" with { type: "json" };
import { REQUIREMENT_OVERRIDES } from "../data/items/requirement-overrides.js";
import { STAT_OVERRIDES } from "../data/items/stat-overrides.js";
import { EXCLUDED_ITEM_NAMES, EXCLUDED_NAME_PATTERNS } from "../data/items/excluded-items.js";
import { SUPPLEMENTAL_ITEMS } from "../data/items/supplemental.js";
import type { VendorEquipmentItem } from "../types/vendor.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Fold in hand-authored gear not yet in the vendored weirdgloop dump (brand-new
// releases — see data/items/supplemental.ts). Skip any whose id is already
// upstream so a future `npm run refresh-vendor` self-heals the overlap.
const vendorEquipment = equipmentJson as VendorEquipmentItem[];
const vendorItemIds = new Set(vendorEquipment.map((it) => it.id));
const supplementalItems = SUPPLEMENTAL_ITEMS.filter((it) => !vendorItemIds.has(it.id));
if (supplementalItems.length < SUPPLEMENTAL_ITEMS.length) {
  const shipped = SUPPLEMENTAL_ITEMS.filter((it) => vendorItemIds.has(it.id)).map((it) => it.name);
  console.log(`Note: dropped supplemental items now present upstream: ${shipped.join(", ")}`);
}
const allEquipment = [...vendorEquipment, ...supplementalItems];

// Drop league-exclusive items (see data/items/excluded-items.ts). Sanity-check
// that every excluded name matched at least one real item, so the list can't
// silently rot when wgloop renames or removes an item upstream.
const excludedMatched = new Set<string>();
const equipment = allEquipment.filter((it) => {
  if (EXCLUDED_ITEM_NAMES.has(it.name)) {
    excludedMatched.add(it.name);
    return false;
  }
  // Pattern exclusions (e.g. Gauntlet "(basic|attuned|perfected)" gear).
  if (EXCLUDED_NAME_PATTERNS.some((re) => re.test(it.name))) {
    return false;
  }
  return true;
});
for (const name of EXCLUDED_ITEM_NAMES) {
  if (!excludedMatched.has(name)) {
    throw new Error(
      `EXCLUDED_ITEM_NAMES has "${name}" that doesn't exist in equipment.json. ` +
        `Either a typo, or the item was renamed/removed upstream — update the list.`,
    );
  }
}

// Scraped combat level requirements, keyed by item id (string). Skill keys are
// Capitalised (e.g. "Ranged"); we lower-case them for the catalog.
const scrapedRequirements = requirementsJson as Record<string, Record<string, number>>;

type ItemRequirements = Partial<
  Record<"attack" | "strength" | "defence" | "ranged" | "magic" | "hitpoints" | "prayer", number>
>;

// Per-item requirements: a name-keyed override (incl. empty = "no requirement")
// always wins over the scrape. Returns undefined when there's no requirement so
// the field is omitted from the emitted catalog.
function requirementsFor(it: VendorEquipmentItem): ItemRequirements | undefined {
  const override = REQUIREMENT_OVERRIDES[it.name];
  const req: ItemRequirements = {};
  if (override) {
    Object.assign(req, override);
  } else {
    const raw = scrapedRequirements[String(it.id)];
    if (raw) {
      for (const [skill, level] of Object.entries(raw)) {
        req[skill.toLowerCase() as keyof ItemRequirements] = level;
      }
    }
  }
  return Object.keys(req).length > 0 ? req : undefined;
}

interface CatalogItem {
  id: number;
  name: string;
  version: string;
  slot: VendorEquipmentItem["slot"];
  category: string;
  speed: number;
  isTwoHanded: boolean;
  // Bonuses (sortable):
  str: number;
  rangedStr: number;
  magicStr: number;
  prayer: number;
  // Offensive (sortable):
  attackStab: number;
  attackSlash: number;
  attackCrush: number;
  attackMagic: number;
  attackRanged: number;
  // Defensive (sortable):
  defStab: number;
  defSlash: number;
  defCrush: number;
  defMagic: number;
  defRanged: number;
  image: string;
  // Combat level requirements to equip. Omitted when the item has none.
  requirements?: ItemRequirements;
}

// Vendor data has occasional nulls in bonus fields (e.g. Wilderness champion
// amulet's str/ranged_str/prayer come through as null). Coerce to 0 for
// sortability — null would sort weirdly and break the TS-strict types.
const n = (v: unknown): number => (typeof v === "number" ? v : 0);

const items: CatalogItem[] = equipment.map((it) => {
  const base: CatalogItem = {
    id: it.id,
    name: it.name,
    version: it.version,
    slot: it.slot,
    category: it.category,
    speed: n(it.speed),
    isTwoHanded: it.isTwoHanded,
    str: n(it.bonuses?.str),
    rangedStr: n(it.bonuses?.ranged_str),
    magicStr: n(it.bonuses?.magic_str),
    prayer: n(it.bonuses?.prayer),
    attackStab: n(it.offensive?.stab),
    attackSlash: n(it.offensive?.slash),
    attackCrush: n(it.offensive?.crush),
    attackMagic: n(it.offensive?.magic),
    attackRanged: n(it.offensive?.ranged),
    defStab: n(it.defensive?.stab),
    defSlash: n(it.defensive?.slash),
    defCrush: n(it.defensive?.crush),
    defMagic: n(it.defensive?.magic),
    defRanged: n(it.defensive?.ranged),
    image: it.image,
    requirements: requirementsFor(it),
  };
  // Apply hand-curated stat overrides last so they win over vendor data.
  // Used when Jagex patches faster than wgloop catches up — see
  // data/items/stat-overrides.ts for active entries.
  const override = STAT_OVERRIDES[it.id];
  if (override) Object.assign(base, override);
  return base;
});

// Sanity-check: every override key must match a real item in the catalog.
// Catches typos like "28538" when you meant "28338" (Soulreaper axe).
const allIds = new Set(items.map((i) => i.id));
for (const overrideId of Object.keys(STAT_OVERRIDES).map(Number)) {
  if (!allIds.has(overrideId)) {
    throw new Error(
      `STAT_OVERRIDES has id ${overrideId} that doesn't exist in equipment.json. ` +
        `Either a typo, or the item was removed by Jagex — drop the entry.`,
    );
  }
}

const lines: string[] = [];
lines.push(`// GENERATED FILE — do not edit by hand.`);
lines.push(`// Run \`npm run build-item-catalog\` to regenerate from data/vendor/wgloop/equipment.json.`);
lines.push(``);
lines.push(`export type ItemCatalogSlot =`);
lines.push(`  | "head" | "cape" | "neck" | "ammo" | "weapon" | "body"`);
lines.push(`  | "shield" | "legs" | "hands" | "feet" | "ring" | "2h";`);
lines.push(``);
lines.push(`export interface ItemCatalogEntry {`);
lines.push(`  id: number;`);
lines.push(`  name: string;`);
lines.push(`  version: string;`);
lines.push(`  slot: ItemCatalogSlot;`);
lines.push(`  category: string;`);
lines.push(`  speed: number;`);
lines.push(`  isTwoHanded: boolean;`);
lines.push(`  str: number;`);
lines.push(`  rangedStr: number;`);
lines.push(`  magicStr: number;`);
lines.push(`  prayer: number;`);
lines.push(`  attackStab: number;`);
lines.push(`  attackSlash: number;`);
lines.push(`  attackCrush: number;`);
lines.push(`  attackMagic: number;`);
lines.push(`  attackRanged: number;`);
lines.push(`  defStab: number;`);
lines.push(`  defSlash: number;`);
lines.push(`  defCrush: number;`);
lines.push(`  defMagic: number;`);
lines.push(`  defRanged: number;`);
lines.push(`  image: string;`);
lines.push(`  requirements?: {`);
lines.push(`    attack?: number; strength?: number; defence?: number;`);
lines.push(`    ranged?: number; magic?: number; hitpoints?: number; prayer?: number;`);
lines.push(`  };`);
lines.push(`}`);
lines.push(``);
// Emit the data as a JSON.parse(...) of a string literal rather than an inline
// object-array literal. With 5306 entries and an optional `requirements` object
// of varying shape, an inline literal makes `tsc` build an enormous union
// (error TS2590). JSON.parse is typed by the annotation, skips that inference,
// and parses faster at runtime for data this size.
lines.push(
  `export const ITEM_CATALOG: ItemCatalogEntry[] = JSON.parse(${JSON.stringify(
    JSON.stringify(items),
  )});`,
);
lines.push(``);

writeFileSync(resolve(ROOT, "data/items/catalog.ts"), lines.join("\n"), "utf8");
console.log(`Wrote data/items/catalog.ts (${items.length} items)`);
