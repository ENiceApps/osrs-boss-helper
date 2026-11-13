// Imbued black mask / slayer helmet grant the on-task DPS bonus (+16.67% melee,
// +15% ranged & magic accuracy and damage). The non-imbued versions give only
// the melee portion and are not separately modeled — for bossing the imbued
// head is the relevant item.
//
// There are 50+ recolor variants, so the id set is derived from the item
// catalog by NAME rather than hand-listed — robust to new recolors and avoids
// the "a variant missing from the table silently turns the bonus off" bug that
// previously hid players' Salve amulet(ei).

import { ITEM_CATALOG } from "@/data/items/catalog";

const IMBUED_SLAYER_HEAD = /(slayer helmet|black mask) \(i\)/i;

export const IMBUED_SLAYER_HELM_IDS: ReadonlySet<number> = new Set(
  ITEM_CATALOG.filter((i) => IMBUED_SLAYER_HEAD.test(i.name)).map((i) => i.id),
);

/**
 * Every black mask / slayer helmet, imbued or not. The plain ones carry the
 * on-task bonus in MELEE only (x7/6, upstream isWearingBlackMask); ranged and
 * magic need the imbue.
 */
export const SLAYER_HEAD_IDS: ReadonlySet<number> = new Set(
  ITEM_CATALOG.filter((i) => /(slayer helmet|black mask)/i.test(i.name) && i.slot === "head").map((i) => i.id),
);

/** True iff any equipped item is an imbued black mask / slayer helmet. */
export function hasImbuedSlayerHelm(itemIds: ReadonlySet<number>): boolean {
  for (const id of itemIds) {
    if (IMBUED_SLAYER_HELM_IDS.has(id)) return true;
  }
  return false;
}
