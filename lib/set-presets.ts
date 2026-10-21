// "Equip a set" presets for the loadout panel's Sets dropdown. One pick drops
// every piece of a set-effect armour (Void, Dharok's, Obsidian, …) into the
// doll at once instead of clicking four slots one by one.
//
// Every set the DPS engine models is listed: the armour sets from
// data/armor-sets.ts (Void / Elite Void / Crystal / Inquisitor's / Obsidian /
// Blood moon) plus Dharok's, whose missing-HP effect lives in lib/recommend.ts
// rather than the armor-set table. A set that needs a particular weapon for
// its effect (Obsidian → TzHaar, Blood moon → Dual macuahuitl, Dharok's →
// greataxe) carries the weapon as a piece, so equipping the set makes the
// effect fire rather than leaving dead armour on.

import { ARMOR_SETS } from "@/data/armor-sets";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import { findCatalogItem } from "@/lib/loadout-edit";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { CombatStyle } from "@/types/osrs";

export interface SetPresetPiece {
  slot: LoadoutSlotKey;
  /** Any one of these satisfies the slot. First is the default when none is owned. */
  itemIds: readonly number[];
}

export interface SetPreset {
  id: string;
  name: string;
  /** The set effect only works for this style, so the dropdown gates on it. */
  style: CombatStyle;
  pieces: readonly SetPresetPiece[];
  /** Shown under the dropdown while the set is worn. */
  hint?: string;
}

// Dharok's pieces in every degradation state (Undamaged / 100 / 75 / 50 / 25).
// The undamaged ids come first so a player with none in the bank gets the
// plain item rather than a degraded one.
const DHAROKS: SetPreset = {
  id: "dharoks",
  name: "Dharok's",
  style: "melee",
  pieces: [
    { slot: "weapon", itemIds: [4718, 4886, 4887, 4888] },
    { slot: "head", itemIds: [4716, 4880, 4881, 4882] },
    { slot: "body", itemIds: [4720, 4892, 4893, 4894] },
    { slot: "legs", itemIds: [4722, 4898, 4899, 4900] },
  ],
  hint: "Drag the Dharok's HP slider in the setup card to see the low-HP bonus.",
};

const HINTS: Record<string, string> = {
  inquisitors: "The Inquisitor's bonus only fires on crush attacks.",
};

function fromArmorSets(): SetPreset[] {
  return ARMOR_SETS.map((def) => ({
    id: def.id,
    name: def.name,
    style: def.style,
    pieces: [
      ...(def.requiredWeaponIds ? [{ slot: "weapon" as const, itemIds: def.requiredWeaponIds }] : []),
      ...def.pieces.map((p) => ({ slot: p.slot, itemIds: p.itemIds })),
    ],
    hint: HINTS[def.id],
  }));
}

/** Every equipable set, in dropdown order (elite variants before regulars). */
export const SET_PRESETS: readonly SetPreset[] = [...fromArmorSets(), DHAROKS];

const STYLE_ORDER: readonly CombatStyle[] = ["melee", "ranged", "magic"];

/** Presets grouped by style, in melee → ranged → magic order, for `<optgroup>`s. */
export function setPresetsByStyle(): Array<{ style: CombatStyle; presets: SetPreset[] }> {
  return STYLE_ORDER.map((style) => ({
    style,
    presets: SET_PRESETS.filter((p) => p.style === style),
  }));
}

/**
 * The per-slot catalog items to override so `preset` is worn. For each slot
 * the player's owned variant wins (elite top over regular, a degraded Dharok's
 * piece over buying an undamaged one); otherwise the first listed id. A slot
 * whose current item already satisfies the piece is left out, so an equipped
 * Toktz-xil-ek isn't swapped for the sword when the Obsidian set is picked.
 */
export function setPresetOverrides(
  preset: SetPreset,
  options: { owned?: ReadonlySet<number>; current?: LoadoutSet } = {},
): Partial<Record<LoadoutSlotKey, ItemCatalogEntry>> {
  const out: Partial<Record<LoadoutSlotKey, ItemCatalogEntry>> = {};
  for (const piece of preset.pieces) {
    const worn = options.current?.slots[piece.slot]?.itemId;
    if (worn !== undefined && piece.itemIds.includes(worn)) continue;
    const id = piece.itemIds.find((i) => options.owned?.has(i)) ?? piece.itemIds[0];
    const item = findCatalogItem(id);
    if (item) out[piece.slot] = item;
  }
  return out;
}

/** The first preset whose every piece is worn by `set`, or undefined. */
export function wornSetPreset(set: LoadoutSet): SetPreset | undefined {
  return SET_PRESETS.find(
    (preset) =>
      preset.style === set.style &&
      preset.pieces.every((piece) => {
        const worn = set.slots[piece.slot]?.itemId;
        return worn !== undefined && piece.itemIds.includes(worn);
      }),
  );
}
