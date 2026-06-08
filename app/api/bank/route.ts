// Live-bank sync endpoint for the RuneLite plugin.
//
// POST /api/bank     ← RuneLite plugin posts current bank/skills/gp here.
// GET  /api/bank     ← Browser polls here for the latest payload.
//
// Storage is in-memory (module-scope), single-tenant: this is designed for
// the user running their own dev server on the same machine as RuneLite.
// Surviving a server restart isn't a goal — the plugin pushes again next
// time you open the bank. For multi-tenant / hosted use, swap the store
// for a backing DB and add a pairing-code path.

import { z } from "zod";

export const dynamic = "force-dynamic";

const PayloadSchema = z.object({
  // Owned-items pool = bank + worn equipment + inventory, merged by the
  // plugin. The optimizer builds loadouts from the gear in here; the boost-
  // potion and mechanic checks look for consumables (potions, antidotes,
  // antifires) in the same list. Only item IDs matter for the optimizer; qty
  // is accepted for future use (sell value, stack-size display).
  items: z.array(
    z.object({
      id: z.number().int().nonnegative(),
      qty: z.number().int().nonnegative(),
    }),
  ),
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
  /** Optional player name for UI display ("Live bank: PlayerName · synced 5s ago"). */
  playerName: z.string().max(64).optional(),
});

export type BankPayload = z.infer<typeof PayloadSchema> & {
  /** Server-assigned timestamp at receive time (ms since epoch). */
  receivedAt: number;
};

// Single-tenant in-memory store. Kept on globalThis (not a plain module-scoped
// `let`) so it survives Turbopack hot-reloads / on-demand route recompilation in
// dev. A module-scoped variable silently resets to null whenever the route module
// is re-evaluated, which makes the live banner flicker back to "Sample bank in use"
// even though the plugin posted successfully. globalThis lives at the process level.
const bankStore = globalThis as unknown as { __osrsBankLatest: BankPayload | null };
bankStore.__osrsBankLatest ??= null;

const CORS_HEADERS = {
  // RuneLite's HTTP client doesn't actually care about CORS (it's not a
  // browser), but if you ever serve this from a different origin to the
  // web app, you'll want these. Open to everything is fine for localhost.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Payload validation failed", issues: parsed.error.issues },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  const latest = { ...parsed.data, receivedAt: Date.now() };
  bankStore.__osrsBankLatest = latest;
  return Response.json(
    { ok: true, itemCount: latest.items.length, receivedAt: latest.receivedAt },
    { headers: CORS_HEADERS },
  );
}

export async function GET() {
  const latest = bankStore.__osrsBankLatest;
  if (!latest) {
    return Response.json(
      { latest: null },
      { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { latest },
    { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
  );
}
