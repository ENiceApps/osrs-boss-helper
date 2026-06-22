// Schema migration for the Postgres data layer (Phase 6.1).
// Run with: npm run migrate
//
// Idempotent — safe to run repeatedly. Loads the connection string from
// .env.local (a standalone tsx script doesn't get Next.js's env loading).

import { readFileSync } from "node:fs";
import { getSql } from "../lib/db.js";

// Minimal .env.local loader (no dotenv dependency). Only sets vars not already
// in the environment, so real env vars (e.g. on CI) still win.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local — rely on the ambient environment (or fail clearly below).
}

async function main() {
  const sql = getSql();

  // --- Auth.js (NextAuth) tables for @auth/pg-adapter (Phase 6.2). ---
  // The adapter inserts users WITHOUT an id (RETURNING id), so id auto-generates.
  // We use TEXT uuid ids throughout (not the canonical SERIAL int) so they line
  // up with character_banks.user_id (TEXT) — no int/text coercion.
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT,
      email           TEXT UNIQUE,
      "emailVerified" TIMESTAMPTZ,
      image           TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type                TEXT NOT NULL,
      provider            TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      refresh_token       TEXT,
      access_token        TEXT,
      expires_at          BIGINT,
      id_token            TEXT,
      scope               TEXT,
      session_state       TEXT,
      token_type          TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId"       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires        TIMESTAMPTZ NOT NULL,
      "sessionToken" TEXT NOT NULL UNIQUE
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS verification_token (
      identifier TEXT NOT NULL,
      expires    TIMESTAMPTZ NOT NULL,
      token      TEXT NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `;

  // --- App table: one saved bank per character per user. ---
  await sql`
    CREATE TABLE IF NOT EXISTS character_banks (
      id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id    TEXT        NOT NULL,
      rsn        TEXT        NOT NULL,
      items      JSONB       NOT NULL,
      skills     JSONB       NOT NULL,
      gp         BIGINT      NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS character_banks_user_rsn_idx
      ON character_banks (user_id, rsn)
  `;
  // Cascade FK so deleting an account removes its banks (retention/consent).
  // Guarded because ALTER ... ADD CONSTRAINT has no IF NOT EXISTS.
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'character_banks_user_fk'
      ) THEN
        ALTER TABLE character_banks
          ADD CONSTRAINT character_banks_user_fk
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$
  `;

  console.log("✓ Migration complete: auth tables + character_banks ready.");
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
