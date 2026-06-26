// Stateless shareable-loadout links. Encodes the displayed loadout + setup into
// a compact URL-safe string (the `?b=` query param) so a player can paste it
// anywhere — no database, no sign-in. The boss itself lives in the path slug;
// this carries the gear and the setup controls on top of it.
//
// Design notes:
//  - We encode the FINAL worn item ids per slot (from the displayed set), not a
//    "re-run the optimizer" recipe, so the link reproduces the exact loadout for
//    a recipient who has a different bank (or none).
//  - On decode the gear is applied as per-slot overrides (see the boss page),
//    which is why the recipient sees the "custom edits" banner — that's correct:
//    they're viewing a specific shared loadout, and Reset rebuilds from their own
//    bank/budget.
//  - Skills are intentionally NOT encoded yet (they aren't locally editable when
//    not plugin-synced; most users are maxed). Revisit if a skills editor lands.

import type { LoadoutSlotKey } from "@/types/loadout";

/** Bump when the shape changes incompatibly; decode rejects unknown versions. */
const SHARE_VERSION = 1;

export interface SharedLoadoutState {
  v: typeof SHARE_VERSION;
  /** Worn item id per equipment slot. */
  slots: Partial<Record<LoadoutSlotKey, number>>;
  /** Blowpipe dart held inside the weapon (set.internalAmmo), if any. */
  dart?: number;
  /** Effective combat spell name (magic loadouts). */
  spell?: string;
  /** Budget mode id (own / gp-only / sell / budget / wildy-risk). */
  mode?: string;
  /** From-scratch budget spend cap. */
  budgetGp?: number;
  /** Wallet GP (manual). */
  gp?: number;
  /** On-slayer-task assumption. */
  onTask?: boolean;
  /** Active comparison tab (best / melee / ranged / magic). */
  tab?: string;
  /** Soulreaper axe max-stacks assumption. */
  soulreaper?: boolean;
  /** Dharok's current-HP value for the missing-HP max-hit bonus. */
  dharokHp?: number;
  /** Chosen offensive prayer id per style (only non-default styles encoded). */
  prayers?: Partial<Record<"melee" | "ranged" | "magic", string>>;
}

/** UTF-8-safe base64url encode that works in both the browser and Node (tests). */
function toBase64Url(json: string): string {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(json, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  return typeof Buffer !== "undefined"
    ? Buffer.from(b64, "base64").toString("utf8")
    : decodeURIComponent(escape(atob(b64)));
}

/** Serialize loadout+setup state into the URL-safe `?b=` value. */
export function encodeLoadout(state: SharedLoadoutState): string {
  return toBase64Url(JSON.stringify(state));
}

/**
 * Parse a `?b=` value back into state. Returns null on any malformed or
 * unknown-version input — callers fall back to default page behavior, so a
 * garbage link never throws or wipes the page.
 */
export function decodeLoadout(code: string): SharedLoadoutState | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code)) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as { v?: unknown }).v !== SHARE_VERSION ||
      typeof (parsed as { slots?: unknown }).slots !== "object" ||
      (parsed as { slots?: unknown }).slots === null
    ) {
      return null;
    }
    return parsed as SharedLoadoutState;
  } catch {
    return null;
  }
}
