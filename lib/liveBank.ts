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
}

const EMPTY: LiveBankResult = {
  bank: null,
  skills: null,
  gp: null,
  playerName: undefined,
  receivedAt: null,
  isLive: false,
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
  };
}

/** Seconds since the bank file was last written, or null if nothing loaded. */
export function secondsSince(receivedAt: number | null): number | null {
  if (receivedAt === null) return null;
  return Math.max(0, Math.floor((Date.now() - receivedAt) / 1000));
}
