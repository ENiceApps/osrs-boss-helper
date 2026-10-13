import { describe, expect, it } from "vitest";
import { buildUserAgent } from "@/lib/wikiApi";
import { SITE_URL } from "@/lib/site";

describe("buildUserAgent", () => {
  it("names the app and site even with no contact set", () => {
    expect(buildUserAgent(undefined)).toBe(`OSRS-Boss-Helper/0.1 (${SITE_URL})`);
    expect(buildUserAgent("   ")).toBe(`OSRS-Boss-Helper/0.1 (${SITE_URL})`);
  });

  it("appends the contact when set", () => {
    expect(buildUserAgent(" me@example.com ")).toBe(`OSRS-Boss-Helper/0.1 (${SITE_URL}; me@example.com)`);
  });
});
