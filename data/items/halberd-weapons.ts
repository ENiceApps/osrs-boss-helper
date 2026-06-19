// Long-reach melee weapons (2 tiles). These can hit a target one extra tile
// away, which makes them the ONLY melee option against bosses you can't stand
// adjacent to (Zulrah and a few others — see data/monsters/melee-reach.ts).
//
// Derived from the catalog by NAME (like data/items/slayer-helm.ts) so new
// recolours/variants are picked up automatically and a missing id can't
// silently turn the reach off. The set is:
//   • every halberd (category "Polearm", name contains "halberd") — Bronze
//     through Dragon, Crystal/Corrupted halberd variants, Noxious halberd
//   • the Scythe of Vitur and its Holy/Sanguine variants (category "Scythe")
//
// NOTE (domain review): spears and the Zamorakian hasta are 1-tile and are
// deliberately NOT included. If OSRS grants 2-tile reach to other weapons,
// widen the predicate below.

import { ITEM_CATALOG } from "@/data/items/catalog";

const HALBERD_NAME = /halberd/i;
const SCYTHE_OF_VITUR = /scythe of vitur/i;

export const HALBERD_WEAPON_IDS: ReadonlySet<number> = new Set(
  ITEM_CATALOG.filter(
    (i) =>
      (i.category === "Polearm" && HALBERD_NAME.test(i.name)) ||
      (i.category === "Scythe" && SCYTHE_OF_VITUR.test(i.name)),
  ).map((i) => i.id),
);

/** True iff the weapon has 2-tile melee reach (halberd or Scythe of Vitur). */
export function isHalberdWeapon(itemId: number): boolean {
  return HALBERD_WEAPON_IDS.has(itemId);
}
