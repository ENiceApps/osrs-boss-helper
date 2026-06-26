"use client";

// Reads the signed-in user's saved bank from /api/bank (Phase 6.4). The bank is
// persisted in Postgres by the RuneLite plugin (POST, token-authed); here we
// poll for the logged-in user's selected character. `authed` is false when no
// one is signed in — the page then shows the sign-in / Budget-mode state.

import useSWR from "swr";
import { asItemId } from "@/types/osrs";
import type { BankContents, Skills } from "@/types/osrs";
import { useSyncKey } from "@/lib/syncKey";

interface RawItem { id: number; qty: number }
interface RawBank {
  rsn: string;
  items: RawItem[];
  skills: Skills;
  gp: number;
  updatedAt: string;
}
export interface CharacterSummary {
  rsn: string;
  gp: number;
  updatedAt: string;
}
interface ApiResponse {
  authed: boolean;
  /** True when identified via an anonymous sync key rather than an email session. */
  anon?: boolean;
  characters: CharacterSummary[];
  selected: string | null;
  bank: RawBank | null;
}

// SWR array key: [url, syncKey]. Keeping the key OUT of the url (it travels as a
// header) means it never lands in browser history or server access logs, while
// still letting SWR re-fetch the moment the key changes.
const fetcher = async ([url, syncKey]: [string, string | null]): Promise<ApiResponse> => {
  const res = await fetch(url, syncKey ? { headers: { "X-Sync-Key": syncKey } } : undefined);
  if (!res.ok) throw new Error(`/api/bank fetch failed: ${res.status}`);
  return res.json();
};

export interface LiveBankResult {
  /** True iff a user is identified (email session OR anonymous sync key). */
  authed: boolean;
  /** True when identified via an anonymous sync key (no email). */
  anon: boolean;
  /** The user's saved characters (for the switcher). */
  characters: CharacterSummary[];
  /** rsn of the character whose bank is returned (server-resolved). */
  selected: string | null;
  bank: BankContents | null;
  skills: Skills | null;
  gp: number | null;
  playerName: string | undefined;
  /** ms since epoch of the selected character's last sync. null when none. */
  receivedAt: number | null;
  /** True iff a saved bank is loaded for the selected character. */
  isLive: boolean;
}

const EMPTY: LiveBankResult = {
  authed: false,
  anon: false,
  characters: [],
  selected: null,
  bank: null,
  skills: null,
  gp: null,
  playerName: undefined,
  receivedAt: null,
  isLive: false,
};

/**
 * Polls /api/bank every 5s for the signed-in user's selected character.
 * Pass `selectedRsn` to choose a character; omit to let the server default to
 * the most-recently-synced one.
 */
export function useLiveBank(selectedRsn?: string): LiveBankResult {
  // The device's anonymous sync key (if any). Re-renders when it changes so the
  // poller picks up a freshly generated / forgotten key immediately.
  const syncKey = useSyncKey();

  const url = selectedRsn ? `/api/bank?rsn=${encodeURIComponent(selectedRsn)}` : "/api/bank";
  const { data } = useSWR<ApiResponse>([url, syncKey], fetcher, {
    refreshInterval: 5_000,
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
  });
  if (!data) return EMPTY;

  const base: LiveBankResult = {
    authed: data.authed,
    anon: data.anon ?? false,
    characters: data.characters,
    selected: data.selected,
    bank: null,
    skills: null,
    gp: null,
    playerName: undefined,
    receivedAt: null,
    isLive: false,
  };
  const b = data.bank;
  if (!b) return base;

  return {
    ...base,
    bank: {
      tagName: b.rsn,
      itemIds: new Set(b.items.map((i) => asItemId(i.id))),
    },
    skills: b.skills,
    gp: b.gp,
    playerName: b.rsn,
    receivedAt: Date.parse(b.updatedAt) || null,
    isLive: true,
  };
}

/** Seconds since the last sync, or null if nothing loaded. */
export function secondsSince(receivedAt: number | null): number | null {
  if (receivedAt === null) return null;
  return Math.max(0, Math.floor((Date.now() - receivedAt) / 1000));
}
