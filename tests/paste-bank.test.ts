// parsePastedBank (lib/localBank.ts) — the one paste box takes two things: the
// plugin's "Copy my bank" (bank.json as text) and Bank Memory's TSV export.

import { describe, expect, it } from "vitest";
import { parsePastedBank } from "@/lib/localBank";
import { BankMemoryParseError } from "@/lib/parseBankMemoryTsv";

const SKILLS = {
  attack: 90,
  strength: 91,
  defence: 80,
  ranged: 85,
  magic: 75,
  hitpoints: 88,
  prayer: 70,
};

// The shape the plugin's copy button produces: the bank.json payload with no
// `accounts` section.
const PLUGIN_COPY = JSON.stringify({
  version: 2,
  rsn: "Tester",
  gp: 2_500_000,
  skills: SKILLS,
  items: [
    { id: 4151, qty: 1 },
    { id: 11802, qty: 1 },
  ],
  bank: [{ id: 4151, qty: 1 }],
  equipment: [{ id: 11802, qty: 1 }],
  inventory: [],
  bankGp: 2_000_000,
  bankUpdatedAt: 1_760_000_000_000,
  bankCached: false,
  updatedAt: 1_760_000_000_000,
});

describe("parsePastedBank", () => {
  it("reads the plugin's copied bank, levels and all", () => {
    const bank = parsePastedBank(PLUGIN_COPY, null);
    expect(bank.source).toBe("pluginPaste");
    expect(bank.rsn).toBe("Tester");
    expect(bank.gp).toBe(2_500_000);
    expect(bank.skills).toEqual(SKILLS);
    expect(bank.items).toEqual([
      { id: 4151, qty: 1 },
      { id: 11802, qty: 1 },
    ]);
  });

  it("tolerates whitespace around the copied text", () => {
    expect(parsePastedBank(`\n  ${PLUGIN_COPY}  \n`, null).items).toHaveLength(2);
  });

  it("rejects a plugin copy that got cut off", () => {
    expect(() => parsePastedBank(PLUGIN_COPY.slice(0, 80), null)).toThrow(BankMemoryParseError);
  });

  it("still reads Bank Memory's export, keeping the levels it was given", () => {
    const tsv = "Item id\tItem name\tItem quantity\n4151\tAbyssal whip\t1\n995\tCoins\t500\n";
    const bank = parsePastedBank(tsv, SKILLS);
    expect(bank.source).toBe("bankMemory");
    expect(bank.items).toEqual([{ id: 4151, qty: 1 }]);
    expect(bank.gp).toBe(500);
    expect(bank.skills).toEqual(SKILLS);
  });
});
