// Special-attack max-hit display helper. Verifies the normal/spec split matches
// weirdgloop's PlayerVsNPCCalc.ts spec factors (the engine the OSRS Wiki runs).

import { describe, expect, it } from "vitest";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { SPEC_MAX_HIT } from "@/data/spec-weapons";
import { specMaxHitDisplay } from "@/lib/dps/spec-max-hit";

const ITEM_BY_ID = new Map(ITEM_CATALOG.map((i) => [i.id, i]));

describe("specMaxHitDisplay", () => {
  it("returns null for a weapon with no max-hit-affecting spec", () => {
    expect(specMaxHitDisplay(11806 + 1, 50)).toBeNull(); // unknown id
    expect(specMaxHitDisplay(21015, 50)).toBeNull(); // Dinh's bulwark — AoE, no max change
  });

  it("Osmumten's fang: headline is the capped normal max, spec is the true max", () => {
    // Matches the wiki for this loadout: true max 59 → normal 51 (59 − trunc(59×3/20)).
    const r = specMaxHitDisplay(26219, 59)!;
    expect(r.specName).toBe("Eviscerate");
    expect(r.normalMaxHit).toBe(51);
    expect(r.specMaxHit).toBe(59);
    expect(r.hits).toBe(1);
  });

  it("Armadyl godsword: +37.5% spec, normal unchanged", () => {
    const r = specMaxHitDisplay(11802, 40)!;
    expect(r.normalMaxHit).toBe(40);
    expect(r.specMaxHit).toBe(Math.trunc((40 * 11) / 8)); // 55
  });

  it("Dragon dagger: +15% per hit, two hits", () => {
    const r = specMaxHitDisplay(5698, 40)!;
    expect(r.specMaxHit).toBe(Math.trunc((40 * 23) / 20)); // 46
    expect(r.hits).toBe(2);
  });

  it("Abyssal dagger: spec REDUCES the max hit", () => {
    const r = specMaxHitDisplay(13271, 40)!;
    expect(r.specMaxHit).toBe(Math.trunc((40 * 17) / 20)); // 34
    expect(r.specMaxHit!).toBeLessThan(r.normalMaxHit);
  });

  it("Voidwaker: rolls 50%–150%, exposes min and max", () => {
    const r = specMaxHitDisplay(27690, 40)!;
    expect(r.specMaxHit).toBe(60); // 150%
    expect(r.minHit).toBe(20); //   50%
  });

  it("Dark bow: +50% per hit (dragon arrows), guaranteed min 8, two hits", () => {
    const r = specMaxHitDisplay(11235, 40)!;
    expect(r.specMaxHit).toBe(60);
    expect(r.minHit).toBe(8);
    expect(r.hits).toBe(2);
  });

  it("Abyssal bludgeon: variable spec — no fixed number", () => {
    const r = specMaxHitDisplay(13263, 40)!;
    expect(r.specMaxHit).toBeNull();
    expect(r.varies).toBeTruthy();
    expect(r.normalMaxHit).toBe(40);
  });
});

describe("SPEC_MAX_HIT data integrity", () => {
  it("every keyed item id is a real weapon in the catalog", () => {
    for (const idStr of Object.keys(SPEC_MAX_HIT)) {
      const item = ITEM_BY_ID.get(Number(idStr));
      expect(item, `spec-max-hit item ${idStr}`).toBeDefined();
      expect(item!.slot, `${item!.name}`).toBe("weapon");
    }
  });

  it("each entry sets exactly one of factor / uncapped / varies", () => {
    for (const [idStr, mod] of Object.entries(SPEC_MAX_HIT)) {
      const set = [mod.factor, mod.uncapped, mod.varies].filter(
        (v) => v !== undefined,
      ).length;
      expect(set, `item ${idStr} should set one of factor/uncapped/varies`).toBe(1);
    }
  });
});
