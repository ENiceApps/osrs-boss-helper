// Profit/hr estimate. Combines the scraped per-boss drop table
// (data/bosses/drops.ts) with live GE prices and the engine's kills/hr to
// answer "is this boss worth grinding?". Prices are looked up at call time, so
// the estimate tracks the live market.

import { DROPS_BY_SLUG } from "@/data/bosses/drops";

/** Coins aren't a GE item — they're worth their face value. */
const COINS_ID = 995;

export interface ProfitDrop {
  itemId: number;
  name: string;
  /** Expected gp from this item per kill (expected units × unit price). */
  gpPerKill: number;
}

export interface ProfitEstimate {
  /** True when we have a drop table for this boss at all. */
  hasData: boolean;
  /** Expected loot value per kill, gp. */
  gpPerKill: number;
  /** Per-item contributions, highest gp first. */
  breakdown: ProfitDrop[];
}

export type PriceLookup = (itemId: number) => number | null;

/** Expected gp of loot per kill for a boss, using live prices. */
export function expectedGpPerKill(slug: string, priceLookup: PriceLookup): ProfitEstimate {
  const drops = DROPS_BY_SLUG[slug];
  if (!drops || drops.length === 0) {
    return { hasData: false, gpPerKill: 0, breakdown: [] };
  }
  const breakdown: ProfitDrop[] = [];
  let total = 0;
  for (const d of drops) {
    const price = d.itemId === COINS_ID ? 1 : priceLookup(d.itemId) ?? 0;
    if (price <= 0) continue;
    const gp = d.expected * price;
    if (gp <= 0) continue;
    total += gp;
    breakdown.push({ itemId: d.itemId, name: d.name, gpPerKill: gp });
  }
  breakdown.sort((a, b) => b.gpPerKill - a.gpPerKill);
  return { hasData: true, gpPerKill: total, breakdown };
}

/**
 * Net profit per hour: loot value per kill × kills/hr, minus any supply cost
 * per hour (prayer potions etc.). Returns gp/hr (can be negative if supplies
 * outweigh loot — rare, but honest).
 */
export function profitPerHour(
  gpPerKill: number,
  killsPerHour: number,
  supplyGpPerHour = 0,
): number {
  return gpPerKill * killsPerHour - supplyGpPerHour;
}
