// formatAgo (lib/liveBank.ts) — the copy under the bank panel that tells the
// player how old the BANK section of bank.json is. It can legitimately be days
// old (the plugin only refreshes it when a bank is opened in-game), so the
// units have to scale; "86400s ago" was the thing to avoid.

import { afterEach, describe, expect, it, vi } from "vitest";
import { formatAgo } from "@/lib/liveBank";

const NOW = 1_700_000_000_000;

function agoBy(ms: number): string | null {
  vi.setSystemTime(NOW);
  return formatAgo(NOW - ms);
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when nothing has been read", () => {
    expect(formatAgo(null)).toBeNull();
  });

  it("scales the unit with the age", () => {
    vi.useFakeTimers();
    expect(agoBy(5 * SEC)).toBe("just now");
    expect(agoBy(59 * SEC)).toBe("just now");
    expect(agoBy(MIN)).toBe("1m ago");
    expect(agoBy(59 * MIN)).toBe("59m ago");
    expect(agoBy(HOUR)).toBe("1h ago");
    expect(agoBy(23 * HOUR)).toBe("23h ago");
    expect(agoBy(DAY)).toBe("1d ago");
    expect(agoBy(9 * DAY)).toBe("9d ago");
  });

  it("clamps a future timestamp to 'just now' instead of going negative", () => {
    // Clock skew between the plugin's System.currentTimeMillis() and the
    // browser is entirely possible; "-3m ago" would look broken.
    vi.useFakeTimers();
    expect(agoBy(-5 * MIN)).toBe("just now");
  });
});
