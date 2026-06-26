// Stateless share-link encode/decode (lib/share-link.ts). The link must survive
// a round-trip and degrade safely on garbage input (never throw).

import { describe, expect, it } from "vitest";
import { encodeLoadout, decodeLoadout, type SharedLoadoutState } from "@/lib/share-link";

const sample: SharedLoadoutState = {
  v: 1,
  slots: { head: 21018, weapon: 22325, body: 21021, ring: 28307 },
  dart: 11230,
  spell: "Ice Barrage",
  mode: "budget",
  budgetGp: 50_000_000,
  gp: 100_000_000,
  onTask: true,
  tab: "magic",
  soulreaper: false,
  dharokHp: 12,
};

describe("share link round-trip", () => {
  it("encodes and decodes back to the same state", () => {
    const code = encodeLoadout(sample);
    expect(decodeLoadout(code)).toEqual(sample);
  });

  it("produces a URL-safe string (no +, /, or = padding)", () => {
    const code = encodeLoadout(sample);
    expect(code).not.toMatch(/[+/=]/);
  });

  it("preserves a minimal gear-only state", () => {
    const minimal: SharedLoadoutState = { v: 1, slots: { weapon: 4151 } };
    expect(decodeLoadout(encodeLoadout(minimal))).toEqual(minimal);
  });
});

describe("share link safety", () => {
  it("returns null for garbage input instead of throwing", () => {
    expect(decodeLoadout("not-valid-base64!!!")).toBeNull();
    expect(decodeLoadout("")).toBeNull();
  });

  it("rejects a payload missing the slots object", () => {
    const code = encodeLoadout({ v: 1 } as unknown as SharedLoadoutState);
    expect(decodeLoadout(code)).toBeNull();
  });

  it("rejects an unknown version", () => {
    // Hand-encode a v:2 blob the same way encodeLoadout would.
    const blob = Buffer.from(JSON.stringify({ v: 2, slots: {} }), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeLoadout(blob)).toBeNull();
  });
});
