// Bank sync endpoint (Phase 6.3/6.4 — persistent, multi-account).
//
// POST /api/bank        ← RuneLite plugin posts a character's bank.
//   Auth: `Authorization: Bearer <plugin token>` (minted at /settings). The
//   token resolves to a user id; the bank is upserted keyed (userId, rsn).
// GET  /api/bank?rsn=   ← The web app reads the signed-in user's saved banks.
//   Auth: the Auth.js session cookie. Returns the user's characters and the
//   selected character's bank (defaults to the most-recently-synced one).
//
// No CORS headers: the browser app is same-origin, and the RuneLite plugin
// isn't a browser, so the old `Access-Control-Allow-Origin: *` (which let any
// site read a player's bank) is intentionally gone.

import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  upsertCharacterBank,
  userIdForPluginToken,
  listCharacters,
  getCharacterBank,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const PayloadSchema = z.object({
  // Owned-items pool = bank + worn + inventory, merged by the plugin. Capped so
  // a malformed/huge POST can't blow up the row. Only ids matter to the
  // optimizer; qty is kept for future use (sell value, stack display).
  items: z
    .array(z.object({ id: z.number().int().nonnegative(), qty: z.number().int().nonnegative() }))
    .max(10_000),
  skills: z.object({
    attack: z.number().int().min(1).max(99),
    strength: z.number().int().min(1).max(99),
    defence: z.number().int().min(1).max(99),
    ranged: z.number().int().min(1).max(99),
    magic: z.number().int().min(1).max(99),
    hitpoints: z.number().int().min(1).max(99),
    prayer: z.number().int().min(1).max(99),
  }),
  /** GP across inventory + bank coin slot. */
  gp: z.number().int().nonnegative(),
  /** Character name — REQUIRED now: it's the per-character key (userId, rsn). */
  playerName: z.string().trim().min(1).max(64),
});

/** Extract a Bearer token from the Authorization header, or null. */
function bearerToken(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return Response.json({ error: "Missing plugin token" }, { status: 401 });
  }
  const userId = await userIdForPluginToken(token);
  if (!userId) {
    return Response.json({ error: "Invalid plugin token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Payload validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { items, skills, gp, playerName } = parsed.data;
  await upsertCharacterBank(userId, { rsn: playerName, items, skills, gp });
  return Response.json({ ok: true, itemCount: items.length });
}

export async function GET(request: Request) {
  // Two ways to identify the reader: an email session (account flow), or an
  // anonymous sync key sent as a header (no-email flow). The key is read from a
  // header — never the URL — so it can't leak into server access logs.
  const session = await auth();
  let userId = session?.user?.id ?? null;
  let anon = false;
  if (!userId) {
    const syncKey = request.headers.get("x-sync-key");
    if (syncKey) {
      userId = await userIdForPluginToken(syncKey);
      anon = userId !== null;
    }
  }

  if (!userId) {
    // Not an error — the page renders an unauthenticated / Budget-mode state.
    return Response.json(
      { authed: false, anon: false, characters: [], selected: null, bank: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const characters = await listCharacters(userId);
  const requested = new URL(request.url).searchParams.get("rsn");
  const selected =
    requested && characters.some((c) => c.rsn === requested)
      ? requested
      : (characters[0]?.rsn ?? null);
  const bank = selected ? await getCharacterBank(userId, selected) : null;

  return Response.json(
    { authed: true, anon, characters, selected, bank },
    { headers: { "Cache-Control": "no-store" } },
  );
}
