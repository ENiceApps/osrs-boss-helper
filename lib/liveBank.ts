"use client";

// Live bank sync — pulls the latest payload posted by the RuneLite plugin
// (see /api/bank/route.ts). Falls back to undefined when no plugin data has
// arrived yet; the page wires SAMPLE_BANK as a stand-in in that case.

import useSWR from "swr";
import { asItemId } from "@/types/osrs";
import type { BankContents, Skills } from "@/types/osrs";

interface RawItem { id: number; qty: number }
interface RawPayload {
  items: RawItem[];
  skills: Skills;
  gp: number;
  playerName?: string;
  receivedAt: number;
}
interface ApiResponse { latest: RawPayload | null }

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`/api/bank fetch failed: ${res.status}`);
  return res.json();
};

export interface LiveBankResult {
  bank: BankContents | null;
  skills: Skills | null;
  gp: number | null;
  playerName: string | undefined;
  /** ms since epoch when the plugin last pushed. null when no payload yet. */
  receivedAt: number | null;
  /** True iff a plugin payload has been received in this session. */
  isLive: boolean;
}

/**
 * Polls /api/bank every 5s. Returns the most recent plugin payload, or all
 * nulls when no plugin has connected yet. Polling is intentional (not SSE)
 * for simplicity — bank changes are rare and a 5s lag is fine for the
 * "see your live bank" use case.
 */
export function useLiveBank(): LiveBankResult {
  const { data } = useSWR<ApiResponse>("/api/bank", fetcher, {
    refreshInterval: 5_000,
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
  });
  const payload = data?.latest ?? null;
  if (!payload) {
    return {
      bank: null,
      skills: null,
      gp: null,
      playerName: undefined,
      receivedAt: null,
      isLive: false,
    };
  }
  return {
    bank: {
      tagName: payload.playerName ?? "Live bank",
      itemIds: new Set(payload.items.map((i) => asItemId(i.id))),
    },
    skills: payload.skills,
    gp: payload.gp,
    playerName: payload.playerName,
    receivedAt: payload.receivedAt,
    isLive: true,
  };
}

/** Seconds since the last plugin push, or null if nothing received. */
export function secondsSince(receivedAt: number | null): number | null {
  if (receivedAt === null) return null;
  return Math.max(0, Math.floor((Date.now() - receivedAt) / 1000));
}
