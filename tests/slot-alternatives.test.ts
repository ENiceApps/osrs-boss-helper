// Next-best-option tests: the tooltip's clickable alternatives must rank by
// trial DPS, exclude the equipped item (and its same-name variants), respect
// the bank restriction, and collapse name-sharing variants to one row.

import { describe, expect, it } from "vitest";
import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { rankSlotAlternatives } from "@/lib/slot-alternatives";
import type { LoadoutSlotKey } from "@/types/loadout";

function byName(name: string): ItemCatalogEntry[] {
  const items = ITEM_CATALOG.filter((it) => it.name === name);
  expect(items.length).toBeGreaterThan(0);
  return items;
}

const BLOOD_FURY = byName("Amulet of blood fury");
const FURY = byName("Amulet of fury");
const GLORY = byName("Amulet of glory");

// Deterministic stand-in for the cockpit's DPS engine callback.
function stubDps(dpsByName: Record<string, number>) {
  return (_slot: LoadoutSlotKey, item: ItemCatalogEntry) => dpsByName[item.name];
}

describe("rankSlotAlternatives — tooltip next-best options", () => {
  const owned = new Set(
    [...BLOOD_FURY, ...FURY, ...GLORY].map((it) => it.id),
  );
  const dpsForItem = stubDps({
    "Amulet of blood fury": 10,
    "Amulet of fury": 9.5,
    "Amulet of glory": 8,
  });

  it("ranks owned alternatives by DPS and excludes the equipped item's name", () => {
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Amulet of blood fury",
      currentDps: 10,
      ownedItemIds: owned,
      skills: SKILLS_AT_99,
      dpsForItem,
    });
    expect(alts.map((a) => a.item.name)).toEqual([
      "Amulet of fury",
      "Amulet of glory",
    ]);
    expect(alts[0].delta).toBeCloseTo(-0.5);
    expect(alts[1].delta).toBeCloseTo(-2);
  });

  it("excludes the equipped item's own recolour variants", () => {
    const anguish = byName("Necklace of anguish");
    const anguishOr = byName("Necklace of anguish (or)");
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Necklace of anguish",
      currentDps: 10,
      ownedItemIds: new Set(
        [...anguish, ...anguishOr, ...FURY].map((it) => it.id),
      ),
      skills: SKILLS_AT_99,
      dpsForItem: stubDps({
        "Necklace of anguish": 10,
        "Necklace of anguish (or)": 10,
        "Amulet of fury": 9,
      }),
    });
    expect(alts.map((a) => a.item.name)).toEqual(["Amulet of fury"]);
  });

  it("collapses same-name variants to a single row", () => {
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Amulet of blood fury",
      currentDps: 10,
      ownedItemIds: owned,
      skills: SKILLS_AT_99,
      dpsForItem,
    });
    const names = alts.map((a) => a.item.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("only offers items from the bank when one is provided", () => {
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Amulet of blood fury",
      currentDps: 10,
      ownedItemIds: new Set(BLOOD_FURY.map((it) => it.id)),
      skills: SKILLS_AT_99,
      dpsForItem,
    });
    expect(alts).toEqual([]);
  });

  it("caps the list at the limit", () => {
    // Whole-catalog pool (budget mode): every neck item scores something.
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Amulet of blood fury",
      currentDps: 10,
      skills: SKILLS_AT_99,
      dpsForItem: () => 5,
    });
    expect(alts.length).toBe(3);
  });

  it("drops candidates the engine can't score", () => {
    const alts = rankSlotAlternatives({
      slot: "neck",
      currentItemName: "Amulet of blood fury",
      currentDps: 10,
      ownedItemIds: owned,
      skills: SKILLS_AT_99,
      dpsForItem: stubDps({ "Amulet of fury": 9.5 }), // glory → undefined
    });
    expect(alts.map((a) => a.item.name)).toEqual(["Amulet of fury"]);
  });
});
