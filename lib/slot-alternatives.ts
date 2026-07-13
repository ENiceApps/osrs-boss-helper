// Ranked "next best options" for one equipment slot, powering the clickable
// alternatives inside the loadout doll's hover tooltip. Candidates come from
// the player's bank when one drives the build ("what else could I wear right
// now?") or the whole catalog in budget mode; each is scored by re-running
// the DPS engine with it slotted in, so conditional bonuses are priced in.

import { loadoutSlotFor, meetsRequirements } from "@/lib/optimize/bank";
import { checkAmmoCompatWithCategory } from "@/data/ammo-compatibility";
import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { Skills } from "@/types/osrs";

export interface SlotAlternative {
  item: ItemCatalogEntry;
  /** Loadout DPS with this item slotted in. */
  dps: number;
  /** vs the displayed loadout's DPS — usually negative, the current pick won. */
  delta: number;
}

// Same two dedupe keys as the cockpit's untradeables panel: base name folds
// tiers/recolours that SHARE a name (Necklace of anguish (or)); stat
// fingerprint folds same-stat items with DIFFERENT names (Ava's assembler =
// Masori assembler). Candidates are pre-sorted by DPS, so first-in wins.
const baseName = (name: string) => name.split(" (")[0];
const statSig = (it: ItemCatalogEntry) =>
  [
    it.attackStab, it.attackSlash, it.attackCrush, it.attackMagic, it.attackRanged,
    it.str, it.rangedStr, it.magicStr, it.prayer, it.speed, it.isTwoHanded ? 1 : 0,
    it.defStab, it.defSlash, it.defCrush, it.defMagic, it.defRanged,
  ].join(",");

export function rankSlotAlternatives(opts: {
  slot: LoadoutSlotKey;
  /** Name of the item currently in the slot — its other variants (degrade
   *  states, ornament kits) are excluded too, they aren't real alternatives. */
  currentItemName?: string;
  /** DPS of the displayed loadout — the baseline every delta is measured against. */
  currentDps: number;
  /** Restrict candidates to these ids (the bank). Undefined = whole catalog. */
  ownedItemIds?: Set<number>;
  skills: Skills;
  /** The loadout's current weapon — ammo candidates must be compatible with it. */
  weapon?: ItemCatalogEntry;
  /** Trial DPS with `item` slotted in — the cockpit's dpsForSlotItem engine. */
  dpsForItem: (slot: LoadoutSlotKey, item: ItemCatalogEntry) => number | undefined;
  limit?: number;
}): SlotAlternative[] {
  const {
    slot, currentItemName, currentDps, ownedItemIds, skills, weapon,
    dpsForItem, limit = 3,
  } = opts;
  const scored: SlotAlternative[] = [];
  for (const item of ITEM_CATALOG) {
    if (loadoutSlotFor(item) !== slot) continue;
    if (ownedItemIds && !ownedItemIds.has(item.id)) continue;
    // The equipped item and its own variants aren't alternatives.
    if (currentItemName !== undefined && baseName(item.name) === baseName(currentItemName)) continue;
    if (!meetsRequirements(item, skills)) continue;
    if (
      slot === "ammo" &&
      weapon &&
      !checkAmmoCompatWithCategory(weapon.name, weapon.category, item.name).ok
    ) {
      continue;
    }
    const dps = dpsForItem(slot, item);
    if (dps === undefined || dps <= 0) continue;
    scored.push({ item, dps, delta: dps - currentDps });
  }
  scored.sort((a, b) => b.dps - a.dps || a.item.name.localeCompare(b.item.name));
  // One row per real choice — see the dedupe keys above.
  const out: SlotAlternative[] = [];
  const seen = new Set<string>();
  for (const alt of scored) {
    const nameKey = `n:${baseName(alt.item.name)}`;
    const sigKey = `s:${statSig(alt.item)}`;
    if (seen.has(nameKey) || seen.has(sigKey)) continue;
    seen.add(nameKey);
    seen.add(sigKey);
    out.push(alt);
    if (out.length >= limit) break;
  }
  return out;
}
