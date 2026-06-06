"use client";

import useSWR from "swr";
import type { LatestPriceEntry, MappingEntry } from "@/types/osrs";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request to ${url} failed: ${res.status}`);
  return res.json();
};

export function useMapping() {
  return useSWR<MappingEntry[]>("/api/mapping", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,
  });
}

interface LatestPricesResponse {
  data: Record<string, LatestPriceEntry>;
}

export function usePrices() {
  return useSWR<LatestPricesResponse>("/api/prices", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 1000,
  });
}

export function priceForItem(
  prices: LatestPricesResponse | undefined,
  itemId: number,
): number | null {
  if (!prices) return null;
  const entry = prices.data[String(itemId)];
  if (!entry) return null;
  return entry.low ?? entry.high ?? null;
}
