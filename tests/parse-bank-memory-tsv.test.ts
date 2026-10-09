// parseBankMemoryTsv — the Bank Memory plugin's "Copy item data to clipboard"
// export (Item id / Item name / Item quantity, tab-separated, OS line endings).

import { describe, expect, it } from "vitest";
import { BankMemoryParseError, parseBankMemoryTsv } from "@/lib/parseBankMemoryTsv";

const HEADER = "Item id\tItem name\tItem quantity";

describe("parseBankMemoryTsv", () => {
  it("reads id + quantity per row and pulls coins out as GP", () => {
    const text = [HEADER, "4151\tAbyssal whip\t1", "995\tCoins\t12345678", "554\tFire rune\t5000", ""].join("\r\n");
    expect(parseBankMemoryTsv(text)).toEqual({
      items: [
        { id: 4151, qty: 1 },
        { id: 554, qty: 5000 },
      ],
      gp: 12345678,
    });
  });

  it("works with LF endings and without the header row", () => {
    const parsed = parseBankMemoryTsv("4151\tAbyssal whip\t1\n11832\tBandos chestplate\t1");
    expect(parsed.items.map((i) => i.id)).toEqual([4151, 11832]);
    expect(parsed.gp).toBe(0);
  });

  it("skips placeholders (qty 0) and sums duplicate ids", () => {
    const parsed = parseBankMemoryTsv(
      [HEADER, "4151\tAbyssal whip\t0", "554\tFire rune\t10", "554\tFire rune\t5"].join("\n"),
    );
    expect(parsed.items).toEqual([{ id: 554, qty: 15 }]);
  });

  it("ignores junk rows but keeps the good ones", () => {
    const parsed = parseBankMemoryTsv([HEADER, "nope", "abc\tX\t1", "4151\tAbyssal whip\t1"].join("\n"));
    expect(parsed.items).toEqual([{ id: 4151, qty: 1 }]);
  });

  it("rejects empty input and text that isn't an export", () => {
    expect(() => parseBankMemoryTsv("   ")).toThrow(BankMemoryParseError);
    expect(() => parseBankMemoryTsv("banktags,1,whip,4151,4151")).toThrow(BankMemoryParseError);
    expect(() => parseBankMemoryTsv(HEADER)).toThrow(BankMemoryParseError);
  });
});
