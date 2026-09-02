"use client";

// Local-file bank bridge — the privacy-first replacement for the old server
// sync. The RuneLite plugin writes the player's bank to a JSON file inside
// `~/.runelite/osrs-boss-helper/bank.json`; this module reads that file directly
// in the browser. The data NEVER leaves the user's machine — there is no server
// round-trip.
//
// Two read paths:
//   1. File System Access API (Chrome/Edge/Brave): the user picks the file once;
//      we persist the handle in IndexedDB and poll it for changes, so the app
//      auto-refreshes whenever the plugin rewrites the file.
//   2. Manual import (`importLocalBankFile`) via a plain <input type="file">:
//      a one-shot read for browsers without the FSA API (Firefox/Safari).
//
// The parsed bank is also cached in IndexedDB after every successful read, so
// closing the app doesn't lose it: on the next visit the last known bank renders
// immediately (flagged `fromCache`) and is replaced the moment the file is read
// again. That's what makes the import-only browsers usable across sessions at
// all — they have no handle to restore.
//
// State is exposed through a tiny useSyncExternalStore-backed store (same pattern
// the old lib/syncKey.ts used) so components re-render the moment the bank
// updates.

import { useSyncExternalStore } from "react";
import type { Skills } from "@/types/osrs";

// --- Minimal File System Access API types ------------------------------------
// `showOpenFilePicker` is in recent lib.dom, but the per-handle permission
// methods (queryPermission/requestPermission) are non-standard and missing from
// the TS DOM lib, so we declare just what we use rather than reach for `any`.
type FSPermissionState = "granted" | "denied" | "prompt";
interface FSPermissionDescriptor {
  mode?: "read" | "readwrite";
}
interface BankFileHandle {
  readonly kind: "file";
  readonly name: string;
  getFile(): Promise<File>;
  queryPermission?(descriptor?: FSPermissionDescriptor): Promise<FSPermissionState>;
  requestPermission?(descriptor?: FSPermissionDescriptor): Promise<FSPermissionState>;
}
type ShowOpenFilePicker = (opts?: {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: Array<{ description?: string; accept: Record<string, string[]> }>;
}) => Promise<BankFileHandle[]>;

function picker(): ShowOpenFilePicker | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { showOpenFilePicker?: ShowOpenFilePicker };
  return typeof w.showOpenFilePicker === "function" ? w.showOpenFilePicker : null;
}

/** Whether this browser supports live file reading (vs manual import only). */
export function localBankSupported(): boolean {
  return picker() !== null;
}

// --- Parsed bank + store shape -----------------------------------------------
export interface ParsedBank {
  rsn: string;
  gp: number;
  skills: Skills;
  items: Array<{ id: number; qty: number }>;
  /** When the plugin last read the BANK container itself (v2 files), or null.
   *  Differs from the file's mtime: the file is rewritten on every inventory
   *  change, but the bank section only refreshes when a bank is opened. */
  bankUpdatedAt: number | null;
  /** True when the file's bank section was carried over from a previous session
   *  rather than read live — i.e. the player hasn't opened a bank since login. */
  bankCached: boolean;
}

export interface LocalBankState {
  /** A file is connected and readable (handle granted, or manually imported). */
  connected: boolean;
  /** The bank shown came from the IndexedDB cache, not a file read this session.
   *  It's real data from the last visit, but nothing is watching the file yet. */
  fromCache: boolean;
  /** A saved handle exists but needs the user to re-grant read permission. */
  needsPermission: boolean;
  bank: ParsedBank | null;
  fileName: string | null;
  /** File mtime in ms — when the plugin last wrote it. */
  updatedAt: number | null;
  error: string | null;
}

const IDLE: LocalBankState = {
  connected: false,
  fromCache: false,
  needsPermission: false,
  bank: null,
  fileName: null,
  updatedAt: null,
  error: null,
};

let state: LocalBankState = IDLE;
const listeners = new Set<() => void>();

function emit(next: Partial<LocalBankState>): void {
  state = { ...state, ...next };
  for (const l of listeners) l();
}

// --- IndexedDB: persist the file handle across reloads ------------------------
// FileSystemFileHandle is structured-cloneable, so it can live in IndexedDB.
const IDB_NAME = "osrs-boss-helper";
const IDB_STORE = "handles";
const IDB_KEY = "bankFile";
// The parsed bank lives in the same object store under its own key rather than
// in a store of its own: adding a store means an IndexedDB version bump, and a
// bump has to be handled for every existing user for no real gain here.
const IDB_BANK_KEY = "lastBank";

/** The last successfully parsed bank, kept so the app has data on open. */
interface CachedBank {
  bank: ParsedBank;
  fileName: string | null;
  /** mtime of the file it was parsed from. */
  updatedAt: number | null;
  /** When this cache entry was written. */
  savedAt: number;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIdb();
  const result = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

async function idbDelete(key: string): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** Remember the bank we just parsed. Failures are swallowed: the cache is a
 *  convenience, and a browser that refuses IndexedDB (private mode) must still
 *  work normally for the rest of the session. */
async function cacheBank(bank: ParsedBank, fileName: string | null, updatedAt: number | null): Promise<void> {
  try {
    const rec: CachedBank = { bank, fileName, updatedAt, savedAt: Date.now() };
    await idbPut(IDB_BANK_KEY, rec);
  } catch {
    // Ignore — see above.
  }
}

// --- Active handle + polling -------------------------------------------------
let handle: BankFileHandle | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastModified = -1;
let reading = false;

const POLL_MS = 4000;

async function hasReadPermission(h: BankFileHandle, request: boolean): Promise<boolean> {
  if (!h.queryPermission) return true; // very old impls — assume usable
  const d: FSPermissionDescriptor = { mode: "read" };
  if ((await h.queryPermission(d)) === "granted") return true;
  if (request && h.requestPermission && (await h.requestPermission(d)) === "granted") return true;
  return false;
}

async function readHandle(force: boolean): Promise<void> {
  if (!handle || reading) return;
  reading = true;
  try {
    const file = await handle.getFile();
    if (!force && file.lastModified === lastModified) return;
    lastModified = file.lastModified;
    const parsed = parseBankJson(await file.text());
    if (!parsed) {
      emit({ error: "bank.json wasn't in the expected format." });
      return;
    }
    emit({
      connected: true,
      fromCache: false,
      needsPermission: false,
      bank: parsed,
      fileName: file.name,
      updatedAt: file.lastModified,
      error: null,
    });
    void cacheBank(parsed, file.name, file.lastModified);
  } catch (e) {
    emit({ error: e instanceof Error ? e.message : "Couldn't read the bank file." });
  } finally {
    reading = false;
  }
}

function startPolling(): void {
  if (pollTimer) return;
  pollTimer = setInterval(() => void readHandle(false), POLL_MS);
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// --- Public actions ----------------------------------------------------------
/** Open the file picker, persist the handle, and start live polling. */
export async function connectLocalBank(): Promise<void> {
  const open = picker();
  if (!open) {
    emit({ error: "This browser can't read files live — use Import instead." });
    return;
  }
  try {
    const [h] = await open({
      multiple: false,
      types: [{ description: "OSRS Boss Helper bank file", accept: { "application/json": [".json"] } }],
    });
    if (!h) return;
    if (!(await hasReadPermission(h, true))) {
      emit({ needsPermission: true, error: "Read permission was denied." });
      return;
    }
    handle = h;
    lastModified = -1;
    await idbPut(IDB_KEY, h);
    await readHandle(true);
    startPolling();
  } catch (e) {
    // The user cancelling the picker throws AbortError — that's not an error.
    if (e instanceof DOMException && e.name === "AbortError") return;
    emit({ error: e instanceof Error ? e.message : "Couldn't open the file." });
  }
}

/** Re-grant read permission on the saved handle after a reload (user gesture). */
export async function reconnectLocalBank(): Promise<void> {
  if (!handle) {
    await connectLocalBank();
    return;
  }
  if (await hasReadPermission(handle, true)) {
    lastModified = -1;
    await readHandle(true);
    startPolling();
  } else {
    emit({ needsPermission: true });
  }
}

/** One-shot import from a plain file input (fallback for non-FSA browsers). */
export async function importLocalBankFile(file: File): Promise<void> {
  stopPolling();
  handle = null;
  try {
    const parsed = parseBankJson(await file.text());
    if (!parsed) {
      emit({ error: "bank.json wasn't in the expected format." });
      return;
    }
    emit({
      connected: true,
      fromCache: false,
      needsPermission: false,
      bank: parsed,
      fileName: file.name,
      updatedAt: file.lastModified,
      error: null,
    });
    // Cached so a browser without the File System Access API — which has no
    // handle to restore — still shows this bank the next time the app opens.
    void cacheBank(parsed, file.name, file.lastModified);
  } catch {
    emit({ error: "Couldn't parse that file as JSON." });
  }
}

/** Forget the connected file AND the cached bank — "disconnect" has to mean the
 *  player's data is gone from this browser, not just that polling stopped. */
export function disconnectLocalBank(): void {
  stopPolling();
  handle = null;
  lastModified = -1;
  void idbDelete(IDB_KEY);
  void idbDelete(IDB_BANK_KEY);
  state = IDLE;
  for (const l of listeners) l();
}

// --- Reactive store ----------------------------------------------------------
let initStarted = false;

async function restore(): Promise<void> {
  // Show the last bank we parsed before going near the file. It's a real snapshot
  // from a previous visit, so the app opens with the player's gear already there
  // instead of an empty state — and on browsers with no file handle to restore,
  // this is the only thing that survives closing the tab.
  let saved: BankFileHandle | null = null;
  try {
    const cached = await idbGet<CachedBank>(IDB_BANK_KEY);
    if (cached?.bank) {
      emit({
        connected: true,
        fromCache: true,
        bank: cached.bank,
        fileName: cached.fileName,
        updatedAt: cached.updatedAt,
        error: null,
      });
    }
    saved = await idbGet<BankFileHandle>(IDB_KEY);
  } catch {
    return; // IndexedDB unavailable (e.g. private mode) — start idle.
  }
  if (!saved) return;
  handle = saved;
  // queryPermission doesn't need a user gesture; requestPermission does — so on
  // reload we resume silently if still granted, else prompt the user to reconnect.
  if (await hasReadPermission(saved, false)) {
    lastModified = -1;
    await readHandle(true);
    startPolling();
  } else {
    // Keep whatever the cache put on screen — the player can still use the app,
    // they just need one click to resume live updates.
    emit({ needsPermission: true, fileName: saved.name });
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!initStarted) {
    initStarted = true;
    void restore();
  }
  return () => {
    listeners.delete(cb);
  };
}

/** Reactive snapshot of the local-bank connection + contents. */
export function useLocalBank(): LocalBankState {
  return useSyncExternalStore(subscribe, () => state, () => IDLE);
}

// --- Parsing / validation ----------------------------------------------------
/** Parse + validate the plugin's bank.json. Returns null on any bad shape so a
 *  malformed file surfaces a friendly error rather than throwing. */
export function parseBankJson(text: string): ParsedBank | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const rawSkills = o.skills;
  if (!rawSkills || typeof rawSkills !== "object") return null;
  const s = rawSkills as Record<string, unknown>;
  const skill = (k: keyof Skills): number | null => {
    const v = s[k];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    return Math.max(1, Math.min(99, Math.round(v)));
  };
  const attack = skill("attack");
  const strength = skill("strength");
  const defence = skill("defence");
  const ranged = skill("ranged");
  const magic = skill("magic");
  const hitpoints = skill("hitpoints");
  const prayer = skill("prayer");
  if (
    attack === null || strength === null || defence === null || ranged === null ||
    magic === null || hitpoints === null || prayer === null
  ) {
    return null;
  }
  const skills: Skills = { attack, strength, defence, ranged, magic, hitpoints, prayer };

  if (!Array.isArray(o.items)) return null;
  const items: Array<{ id: number; qty: number }> = [];
  for (const it of o.items) {
    if (!it || typeof it !== "object") continue;
    const r = it as Record<string, unknown>;
    const id = r.id;
    if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) continue;
    // qty 0 = a bank PLACEHOLDER (RuneLite reports those as quantity 0) — the
    // player doesn't own the item, so skip it rather than default it to 1.
    // A missing/malformed qty still defaults to 1 (lenient for hand-made files).
    if (typeof r.qty === "number" && r.qty <= 0) continue;
    const qty = typeof r.qty === "number" ? Math.max(1, Math.round(r.qty)) : 1;
    items.push({ id, qty });
  }

  const rsn = typeof o.rsn === "string" && o.rsn.trim() ? o.rsn.trim().slice(0, 64) : "Your bank";
  const gp = typeof o.gp === "number" && Number.isFinite(o.gp) && o.gp >= 0 ? Math.round(o.gp) : 0;

  // v2 fields. Absent in v1 files (and in hand-made ones), which read as "we
  // don't know when the bank was last seen" rather than as an error.
  const rawBankAt = o.bankUpdatedAt;
  const bankUpdatedAt =
    typeof rawBankAt === "number" && Number.isFinite(rawBankAt) && rawBankAt > 0 ? rawBankAt : null;
  const bankCached = o.bankCached === true;

  return { rsn, gp, skills, items, bankUpdatedAt, bankCached };
}
