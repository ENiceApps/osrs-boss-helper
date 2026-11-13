// Item aliases: variants the wiki DPS calc treats as the SAME item — locked
// (Trouver parchment), broken / degraded, ornament-kit and recoloured versions.
// Mirrors weirdgloop/osrs-dps-calc cdn/json/equipment_aliases.json (alias id ->
// canonical id) and Equipment.ts getCanonicalItem: before any stat is summed or
// any "is wearing X" check runs, upstream swaps each worn piece for its
// canonical item, so a Void knight top (or), a Tzhaar-ket-om (t) or a recoloured
// crystal helm behaves exactly like the base item.
//
// Refreshed with the rest of the vendor dump (scripts/refresh-vendor-data.ts).

import aliasJson from "@/data/vendor/wgloop/equipment_aliases.json";

const CANONICAL_BY_ALIAS: ReadonlyMap<number, number> = new Map(
  Object.entries(aliasJson as Record<string, number>).map(([alias, canonical]) => [Number(alias), canonical]),
);

/** The id upstream reads this item as (itself when it has no alias). */
export function canonicalItemId(itemId: number): number {
  return CANONICAL_BY_ALIAS.get(itemId) ?? itemId;
}

/** `ids` plus the canonical id of each — for "is wearing" checks against base-id lists. */
export function withCanonicalIds(ids: Iterable<number>): Set<number> {
  const out = new Set<number>();
  for (const id of ids) {
    out.add(id);
    out.add(canonicalItemId(id));
  }
  return out;
}
