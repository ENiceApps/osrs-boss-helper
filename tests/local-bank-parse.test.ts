// parseBankJson (lib/localBank.ts) — validates the bank.json the RuneLite
// plugin writes. The important regression here: bank PLACEHOLDERS arrive as
// items with qty 0 and must be SKIPPED (the player doesn't own them), not
// defaulted to qty 1.

import { describe, expect, it } from "vitest";
import { parseBankJson } from "@/lib/localBank";

const SKILLS = {
  attack: 99,
  strength: 99,
  defence: 99,
  ranged: 99,
  magic: 99,
  hitpoints: 99,
  prayer: 77,
};

function fileWith(items: unknown[]): string {
  return JSON.stringify({
    version: 1,
    rsn: "Tester",
    gp: 1_000_000,
    skills: SKILLS,
    items,
    updatedAt: Date.now(),
  });
}

describe("parseBankJson", () => {
  it("parses a well-formed plugin file", () => {
    const parsed = parseBankJson(fileWith([{ id: 4151, qty: 1 }, { id: 11840, qty: 2 }]));
    expect(parsed).not.toBeNull();
    expect(parsed!.rsn).toBe("Tester");
    expect(parsed!.gp).toBe(1_000_000);
    expect(parsed!.skills.prayer).toBe(77);
    expect(parsed!.items).toEqual([
      { id: 4151, qty: 1 },
      { id: 11840, qty: 2 },
    ]);
  });

  it("skips qty-0 items (bank placeholders) instead of defaulting them to 1", () => {
    const parsed = parseBankJson(fileWith([{ id: 4151, qty: 0 }, { id: 11840, qty: 3 }]));
    expect(parsed!.items).toEqual([{ id: 11840, qty: 3 }]);
  });

  it("skips negative quantities", () => {
    const parsed = parseBankJson(fileWith([{ id: 4151, qty: -2 }]));
    expect(parsed!.items).toEqual([]);
  });

  it("defaults a missing qty to 1 (lenient for hand-made files)", () => {
    const parsed = parseBankJson(fileWith([{ id: 4151 }]));
    expect(parsed!.items).toEqual([{ id: 4151, qty: 1 }]);
  });

  it("drops invalid ids but keeps the rest", () => {
    const parsed = parseBankJson(
      fileWith([{ id: -1, qty: 1 }, { id: 2.5, qty: 1 }, "junk", { id: 4151, qty: 1 }]),
    );
    expect(parsed!.items).toEqual([{ id: 4151, qty: 1 }]);
  });

  it("clamps skills into 1..99 and rejects files with missing skills", () => {
    const good = parseBankJson(
      JSON.stringify({ skills: { ...SKILLS, attack: 130, prayer: 0 }, items: [] }),
    );
    expect(good!.skills.attack).toBe(99);
    expect(good!.skills.prayer).toBe(1);

    const { prayer: _prayer, ...missingOne } = SKILLS;
    const bad = parseBankJson(JSON.stringify({ skills: missingOne, items: [] }));
    expect(bad).toBeNull();
  });

  it("returns null for malformed JSON or non-object roots", () => {
    expect(parseBankJson("not json")).toBeNull();
    expect(parseBankJson("[1,2,3]")).toBeNull();
  });
});
