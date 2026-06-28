import { describe, expect, it } from "vitest";
import { parseGp } from "@/lib/format";

describe("parseGp — k/m/b abbreviations", () => {
  it("parses k / m / b suffixes", () => {
    expect(parseGp("1k")).toBe(1_000);
    expect(parseGp("10m")).toBe(10_000_000);
    expect(parseGp("2b")).toBe(2_000_000_000);
  });

  it("is case-insensitive", () => {
    expect(parseGp("1K")).toBe(1_000);
    expect(parseGp("10M")).toBe(10_000_000);
    expect(parseGp("1B")).toBe(1_000_000_000);
  });

  it("handles decimals on a suffix", () => {
    expect(parseGp("1.5m")).toBe(1_500_000);
    expect(parseGp("2.5k")).toBe(2_500);
    expect(parseGp("0.5b")).toBe(500_000_000);
    expect(parseGp(".5m")).toBe(500_000);
  });

  it("rounds fractional results to whole gp", () => {
    expect(parseGp("1.3335k")).toBe(1_334);
  });
});

describe("parseGp — plain and messy input", () => {
  it("parses a bare number", () => {
    expect(parseGp("5000000")).toBe(5_000_000);
  });

  it("strips commas and whitespace", () => {
    expect(parseGp("1,000,000")).toBe(1_000_000);
    expect(parseGp("  2 500  ")).toBe(2_500);
  });

  it("resolves empty / junk input to 0", () => {
    expect(parseGp("")).toBe(0);
    expect(parseGp("   ")).toBe(0);
    expect(parseGp("m")).toBe(0);
    expect(parseGp("abc")).toBe(0);
  });

  it("falls back to digits when the suffix is malformed", () => {
    // unparseable shape → keep digits only, never throw
    expect(parseGp("10mb")).toBe(10);
    expect(parseGp("1.2.3m")).toBe(123);
  });
});
