// Best-effort, in-memory, fixed-window rate limiter for the *unauthenticated*
// endpoints (anonymous sync-key creation and feedback). It keeps a per-key
// counter in module memory and resets it once each window elapses.
//
// IMPORTANT LIMITATION: on a serverless host (e.g. Vercel) every instance has
// its own memory, so this is NOT a hard global cap — it raises the bar against
// casual abuse/spam but a determined attacker spreading requests across many
// cold instances can exceed it. For a strong global limit, back this with a
// shared store (Upstash / Vercel KV). This trade-off is documented in
// SECURITY.md.

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

// Bound memory: if the map grows large (lots of distinct IPs), drop expired
// windows opportunistically so it can't grow without limit.
const MAX_BUCKETS = 10_000;
function purgeIfLarge(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [k, w] of buckets) {
    if (now >= w.resetAt) buckets.delete(k);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Requests still allowed in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the window resets — surface as a Retry-After header on 429. */
  retryAfterSec: number;
}

/**
 * Record a hit for `key` and report whether it's within `limit` per `windowMs`.
 * The first call in a window starts the clock; subsequent calls increment until
 * the limit is hit.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  purgeIfLarge(now);

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

/**
 * Best-effort client IP from the standard proxy headers (Vercel sets
 * `x-forwarded-for`). Falls back to a single shared key so a missing header
 * still gets rate-limited rather than bypassing the check entirely.
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
