// Postgres data layer (Neon serverless driver — works in local dev and on
// Vercel). Phase 6.1: persists each user's per-character bank, replacing the
// old in-memory globalThis store.
//
// Connection string comes from DATABASE_URL (Neon's default) or POSTGRES_URL
// (what Vercel Postgres injects) — never hard-coded, never committed. The
// client is created lazily so importing this module doesn't throw when the env
// isn't configured (e.g. before the DB is provisioned).

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

let _sql: NeonQueryFunction<false, false> | null = null;

/** Lazily-initialised Neon tagged-template client. Throws only when first used
 *  without a connection string configured. Tagged-template interpolation is
 *  parameterised — never string-concatenate SQL. */
export function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "No database connection string. Set DATABASE_URL (or POSTGRES_URL) in .env.local — see .env.example.",
    );
  }
  _sql = neon(url);
  return _sql;
}

/** One owned item: catalog id + stack size, as the plugin posts it. */
export interface BankItem {
  id: number;
  qty: number;
}

export interface BankSkills {
  attack: number;
  strength: number;
  defence: number;
  ranged: number;
  magic: number;
  hitpoints: number;
  prayer: number;
}

/** A single character's saved bank for one user. */
export interface CharacterBank {
  rsn: string;
  items: BankItem[];
  skills: BankSkills;
  gp: number;
  updatedAt: string;
}

/** Lightweight row for the character switcher (no items payload). */
export interface CharacterSummary {
  rsn: string;
  gp: number;
  updatedAt: string;
}

interface BankInput {
  rsn: string;
  items: BankItem[];
  skills: BankSkills;
  gp: number;
}

/**
 * Insert or update a character's bank for a user (last-write-wins on bank-open).
 * Keyed by (user_id, rsn) — one row per character per account.
 */
export async function upsertCharacterBank(userId: string, bank: BankInput): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO character_banks (user_id, rsn, items, skills, gp, updated_at)
    VALUES (${userId}, ${bank.rsn}, ${JSON.stringify(bank.items)}, ${JSON.stringify(bank.skills)}, ${bank.gp}, now())
    ON CONFLICT (user_id, rsn) DO UPDATE
      SET items = EXCLUDED.items,
          skills = EXCLUDED.skills,
          gp = EXCLUDED.gp,
          updated_at = now()
  `;
}

/** Fetch one character's full bank, or null if the user has none by that rsn. */
export async function getCharacterBank(userId: string, rsn: string): Promise<CharacterBank | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT rsn, items, skills, gp, updated_at
    FROM character_banks
    WHERE user_id = ${userId} AND rsn = ${rsn}
    LIMIT 1
  `) as Array<{ rsn: string; items: BankItem[]; skills: BankSkills; gp: string | number; updated_at: string }>;
  const r = rows[0];
  if (!r) return null;
  return { rsn: r.rsn, items: r.items, skills: r.skills, gp: Number(r.gp), updatedAt: r.updated_at };
}

/** List a user's characters (most-recently-synced first) for the switcher. */
export async function listCharacters(userId: string): Promise<CharacterSummary[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT rsn, gp, updated_at
    FROM character_banks
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `) as Array<{ rsn: string; gp: string | number; updated_at: string }>;
  return rows.map((r) => ({ rsn: r.rsn, gp: Number(r.gp), updatedAt: r.updated_at }));
}

/**
 * Create an anonymous (email-less) user and return its id. Backs the "use
 * without email" flow: the caller mints a plugin token for this user, which
 * becomes the player's sync key — the only credential tying a browser + plugin
 * to this bank. No email is ever collected. `users.email` is nullable and
 * UNIQUE permits multiple NULLs, so these rows coexist with real accounts.
 */
export async function createAnonUser(): Promise<string> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO users (email) VALUES (NULL) RETURNING id
  `) as Array<{ id: string }>;
  return rows[0].id;
}

// --- Plugin tokens (machine credential for the RuneLite plugin) ----------------

/** Generate a fresh plugin token (plaintext) — shown to the user once. */
export function generatePluginToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hex of a token. Only the hash is ever stored. */
export function hashPluginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Store (or rotate) the hashed plugin token for a user. */
export async function setPluginTokenHash(userId: string, tokenHash: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO plugin_tokens (user_id, token_hash, created_at)
    VALUES (${userId}, ${tokenHash}, now())
    ON CONFLICT (user_id) DO UPDATE
      SET token_hash = EXCLUDED.token_hash, created_at = now()
  `;
}

/** Resolve a presented plugin token to its owning user id, or null. Compares
 *  via constant-time equality against the stored hash for that user. */
export async function userIdForPluginToken(token: string): Promise<string | null> {
  const sql = getSql();
  const presented = hashPluginToken(token);
  const rows = (await sql`
    SELECT user_id, token_hash FROM plugin_tokens WHERE token_hash = ${presented} LIMIT 1
  `) as Array<{ user_id: string; token_hash: string }>;
  const r = rows[0];
  if (!r) return null;
  // Defense-in-depth: constant-time compare (the WHERE already matched the hash).
  const a = Buffer.from(presented);
  const b = Buffer.from(r.token_hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return r.user_id;
}

/** Whether the user has minted a plugin token (for the Settings UI). */
export async function hasPluginToken(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`SELECT 1 FROM plugin_tokens WHERE user_id = ${userId} LIMIT 1`) as unknown[];
  return rows.length > 0;
}
