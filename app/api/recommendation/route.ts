// Recommendation channel for the RuneLite plugin — the reverse direction of
// /api/bank.
//
// POST /api/recommendation   ← Browser posts the active boss's recommended gear.
// GET  /api/recommendation   ← RuneLite plugin polls here to highlight / filter
//                              the in-game bank to the recommended items.
//
// Storage is in-memory (globalThis), single-tenant: the user runs their own dev
// server on the same machine as RuneLite. Surviving a restart isn't a goal — the
// browser re-posts whenever the active loadout changes. Mirrors /api/bank.

import { z } from "zod";

export const dynamic = "force-dynamic";

const PayloadSchema = z.object({
  /** Display label, e.g. "Vorkath — Budget Magic". */
  label: z.string().max(128),
  /** Boss slug the recommendation is for (optional, for plugin display). */
  bossSlug: z.string().max(64).optional(),
  /**
   * Item IDs per worn slot, best-first (index 0 = optimizer pick, rest are
   * owned alternatives the player could swap in). Slot keys are free-form
   * strings (LoadoutSlotKey); the plugin only needs the flattened id set.
   */
  slots: z.record(z.string(), z.array(z.number().int().nonnegative())),
});

export type RecommendationStored = z.infer<typeof PayloadSchema> & {
  /** Server-assigned receive timestamp (ms since epoch). */
  receivedAt: number;
};

// Single-tenant in-memory store on globalThis (survives Turbopack hot-reloads in
// dev, where a module-scoped `let` would silently reset). See /api/bank for the
// rationale.
const store = globalThis as unknown as { __osrsRecommendationLatest: RecommendationStored | null };
store.__osrsRecommendationLatest ??= null;

const CORS_HEADERS = {
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
  store.__osrsRecommendationLatest = latest;
  return Response.json(
    { ok: true, receivedAt: latest.receivedAt },
    { headers: CORS_HEADERS },
  );
}

export async function GET() {
  const latest = store.__osrsRecommendationLatest;
  return Response.json(
    { latest: latest ?? null },
    { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
  );
}
