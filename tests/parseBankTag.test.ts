import { describe, expect, it } from "vitest";
import { parseBankTag, BankTagParseError } from "@/lib/parseBankTag";

describe("parseBankTag — old format", () => {
  it("parses a simple old-format string", () => {
    const result = parseBankTag(
      "mining,12797,12020,12019,12016,12015,12014,1712,1710",
    );
    expect(result.tagName).toBe("mining");
    expect(result.itemIds.size).toBe(8);
    expect(result.itemIds.has(12797 as never)).toBe(true);
    expect(result.itemIds.has(1710 as never)).toBe(true);
  });

  it("preserves a tag name with no items", () => {
    const result = parseBankTag("emptytag");
    expect(result.tagName).toBe("emptytag");
    expect(result.itemIds.size).toBe(0);
  });

  it("ignores duplicate item ids", () => {
    const result = parseBankTag("dupes,995,995,995");
    expect(result.itemIds.size).toBe(1);
  });

  it("tolerates surrounding whitespace and empty segments", () => {
    const result = parseBankTag("  herbs , 207 , , 211 ,  ");
    expect(result.tagName).toBe("herbs");
    expect(result.itemIds.size).toBe(2);
  });
});

describe("parseBankTag — new banktags format", () => {
  it("parses banktags,1,name,ids...", () => {
    const result = parseBankTag(
      "banktags,1,cerberus,26996,27281,6570,11773,20223,29589",
    );
    expect(result.tagName).toBe("cerberus");
    expect(result.itemIds.size).toBe(6);
    expect(result.itemIds.has(26996 as never)).toBe(true);
    expect(result.itemIds.has(29589 as never)).toBe(true);
  });

  it("parses banktags with a layout block (id,slot pairs)", () => {
    const result = parseBankTag(
      "banktags,1,herbrun,5291,layout,11105,0,11850,1,12073,4",
    );
    expect(result.tagName).toBe("herbrun");
    expect(result.itemIds.has(5291 as never)).toBe(true);
    expect(result.itemIds.has(11105 as never)).toBe(true);
    expect(result.itemIds.has(11850 as never)).toBe(true);
    expect(result.itemIds.has(12073 as never)).toBe(true);
    expect(result.itemIds.has(0 as never)).toBe(false);
    expect(result.itemIds.has(1 as never)).toBe(false);
    expect(result.itemIds.has(4 as never)).toBe(false);
  });

  it("rejects banktags with non-numeric version", () => {
    expect(() => parseBankTag("banktags,abc,name,123")).toThrow(BankTagParseError);
  });

  it("rejects banktags missing required fields", () => {
    expect(() => parseBankTag("banktags,1")).toThrow(BankTagParseError);
  });
});

describe("parseBankTag — error cases", () => {
  it("rejects empty input", () => {
    expect(() => parseBankTag("")).toThrow(BankTagParseError);
    expect(() => parseBankTag("   ")).toThrow(BankTagParseError);
  });
});
