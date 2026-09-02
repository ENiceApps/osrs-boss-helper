"use client";

// Adapter exposing the local-file bank (lib/localBank.ts) in the LiveBankResult
// shape the rest of the app already consumes (the boss page + header status).
// The "live" name is historical — the bank now comes from a local file the
// RuneLite plugin writes, never from a server. No player data leaves the browser.

import { asItemId } from "@/types/osrs";
import type { BankContents, Skills } from "@/types/osrs";
import { useLocalBank } from "@/lib/localBank";

export interface LiveBankResult {
  bank: BankContents | null;
  skills: Skills | null;
  gp: number | null;
  playerName: string | undefined;
  /** ms since epoch when the bank file was last written, or null. */
  receivedAt: number | null;
  /** True iff a bank file is connected and parsed. */
  isLive: boolean;
  /** True when the bank came from the browser cache of a previous visit rather
   *  than from a file read this session — real data, but nothing is watching
   *  the file, so it won't update until the player reconnects it. */
  fromCache: boolean;
}

const EMPTY: LiveBankResult = {
  bank: null,
  skills: null,
  gp: null,
  playerName: undefined,
  receivedAt: null,
  isLive: false,
  fromCache: false,
};

/** The current player's bank, read from the connected local file (or empty). */
export function useLiveBank(): LiveBankResult {
  const local = useLocalBank();
  const b = local.bank;
  if (!b) return EMPTY;
  return {
    bank: { tagName: b.rsn, itemIds: new Set(b.items.map((i) => asItemId(i.id))) },
    skills: b.skills,
    gp: b.gp,
    playerName: b.rsn,
    receivedAt: local.updatedAt,
    isLive: true,
    fromCache: local.fromCache,
  };
}

/** Seconds since the bank file was last written, or null if nothing loaded. */
export function secondsSince(receivedAt: number | null): number | null {
  if (receivedAt === null) return null;
  return Math.max(0, Math.floor((Date.now() - receivedAt) / 1000));
}

/** Coarse "how long ago" for spans that can run to days — the bank section of
 *  the file only refreshes when the player opens a bank in-game, so it can be
 *  genuinely old, and "86400s ago" helps nobody. Null in, null out. */
export function formatAgo(at: number | null): string | null {
  if (at === null) return null;
  const secs = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
