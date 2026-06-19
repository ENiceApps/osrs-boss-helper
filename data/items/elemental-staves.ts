// Which elemental runes a staff/wand supplies for free (unlimited). Used purely
// as a DPS-neutral TIE-BREAK in the optimizer: when two magic weapons cast the
// same spell for identical DPS (e.g. the four basic elemental staves all have
// +10 magic), prefer the one that supplies the cast spell's element so the
// player doesn't have to buy/carry that rune type. Rune *cost* itself is not
// modelled, so this never changes which spell or how much damage — only which
// equally-good staff gets recommended.
//
// Derived from the catalog by NAME (like data/items/slayer-helm.ts) so recolours
// and new variants are covered automatically. Covers the basic elemental staves,
// battlestaves, mystic staves, the combination (lava/mud/steam/smoke/mist/dust)
// staves, and the Kodai wand (water).

import { ITEM_CATALOG } from "@/data/items/catalog";
import type { SpellElement } from "@/types/osrs";

// Combination staves supply two elements. Keyed by the combo word in the name.
const COMBO_ELEMENTS: Record<string, SpellElement[]> = {
  lava: ["earth", "fire"],
  mud: ["water", "earth"],
  steam: ["water", "fire"],
  smoke: ["air", "fire"],
  mist: ["air", "water"],
  dust: ["earth", "air"],
};

const BASE_ELEMENTS: SpellElement[] = ["air", "water", "earth", "fire"];

/** Elements a staff name supplies, or null if it isn't an elemental staff. */
function elementsForName(name: string): SpellElement[] | null {
  const n = name.toLowerCase();
  // The Kodai wand supplies water runes (and saves others) — treat as water.
  if (n.includes("kodai")) return ["water"];
  // Only real staves/battlestaves/wands supply runes — guard on those words to
  // avoid matching e.g. "Fire cape" or "Mystic robe".
  if (!/staff|battlestaff|wand/.test(n)) return null;
  for (const [word, els] of Object.entries(COMBO_ELEMENTS)) {
    if (n.includes(word)) return els;
  }
  const single = BASE_ELEMENTS.filter((el) => n.includes(el));
  return single.length > 0 ? single : null;
}

export const STAFF_ELEMENTS: ReadonlyMap<number, ReadonlySet<SpellElement>> = (() => {
  const m = new Map<number, ReadonlySet<SpellElement>>();
  for (const it of ITEM_CATALOG) {
    if (it.slot !== "weapon" && it.slot !== "2h") continue;
    const els = elementsForName(it.name);
    if (els) m.set(it.id, new Set(els));
  }
  return m;
})();

/** True iff the weapon supplies the given spell element's runes for free. */
export function staffSuppliesElement(itemId: number, element: SpellElement | undefined): boolean {
  if (!element || element === "none") return false;
  return STAFF_ELEMENTS.get(itemId)?.has(element) ?? false;
}
