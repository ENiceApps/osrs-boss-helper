// Client-side storage for the anonymous "sync key" (the no-email flow). The key
// lives in localStorage on this device only; it's sent to /api/bank as the
// `X-Sync-Key` header so the server can resolve the player's anonymous bank.
//
// It is NEVER placed in a URL — that would leak it into history and server logs.
// Components subscribe to changes (e.g. after generating or forgetting a key) so
// the live-bank poller re-fetches immediately.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "osrsBossHelper.syncKey";
const CHANGE_EVENT = "osrs-sync-key-changed";

/** The current sync key for this device, or null. Safe to call during SSR. */
export function getSyncKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist a sync key and notify subscribers. */
export function setSyncKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage unavailable (private mode / quota) — nothing else to do */
  }
}

/** Forget the sync key on this device and notify subscribers. */
export function clearSyncKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

/**
 * Subscribe to sync-key changes — both our own (CHANGE_EVENT) and changes from
 * another tab (the native `storage` event). Returns an unsubscribe function.
 */
export function subscribeSyncKey(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const storageListener = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", storageListener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", storageListener);
  };
}

/**
 * Read the current sync key reactively. Uses useSyncExternalStore so it stays in
 * sync with localStorage (including changes from another tab) without tripping
 * hydration mismatches — the server snapshot is always null, and the client
 * value lands after hydration.
 */
export function useSyncKey(): string | null {
  return useSyncExternalStore(subscribeSyncKey, getSyncKey, () => null);
}
