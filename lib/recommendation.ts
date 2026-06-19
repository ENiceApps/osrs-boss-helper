// Shared recommendation payload — the gear the optimizer recommends for the
// active boss, serialized as item IDs grouped by worn slot. Two consumers:
//   • ResultsPanel's "Copy plugin JSON" button (manual clipboard transfer)
//   • the boss page's POST to /api/recommendation (auto HTTP transfer)
// The osrs-boss-sync RuneLite plugin reads this shape to highlight / filter the
// in-game bank down to the recommended items (and their per-slot alternatives).

import type { LoadoutSlotKey } from "@/types/loadout";

/** What the plugin consumes: a human label plus item IDs per worn slot. */
export interface RecommendationPayload {
  /** Display label, e.g. "Vorkath — Budget Magic". Becomes the bank-tab title. */
  label: string;
  /** Optional boss slug so the plugin can show which setup this is for. */
  bossSlug?: string;
  /**
   * Item IDs per worn slot, best-first (index 0 = the optimizer's pick, the
   * rest are owned alternatives). Slot keys are LoadoutSlotKey strings.
   */
  slots: Record<string, number[]>;
}

/**
 * Fold per-slot alternative IDs (plus any blowpipe darts) into the flat
 * `slots` record the plugin reads. Darts live inside the weapon in-game, so
 * they're appended to the ammo row.
 */
export function buildRecommendationSlots(
  alternatives: Partial<Record<LoadoutSlotKey, number[]>>,
  internalAmmoId?: number,
): Record<string, number[]> {
  const slots: Record<string, number[]> = {};
  for (const [slot, ids] of Object.entries(alternatives)) {
    if (ids && ids.length > 0) slots[slot] = [...ids];
  }
  if (internalAmmoId !== undefined) {
    slots.ammo = [...(slots.ammo ?? []), internalAmmoId];
  }
  return slots;
}
