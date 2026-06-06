// Phase 4 — spec weapon catalog + per-boss recommendations.
// Verifies the data layer is internally consistent: every item ID resolves
// against the live item catalog; every per-boss recommendation references a
// spec weapon that exists in the spec catalog; every boss slug is real.

import { describe, expect, it } from "vitest";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import {
  SPEC_WEAPONS,
  findSpecWeapon,
  specWeaponsByRole,
} from "@/data/spec-weapons";
import {
  BOSS_SPEC_RECOMMENDATIONS,
  specRecommendationsForBoss,
} from "@/data/bosses/spec-weapons";

const ITEM_BY_ID = new Map(ITEM_CATALOG.map((i) => [i.id, i]));

describe("spec-weapons catalog — internal consistency", () => {
  it("every catalog entry's itemId resolves to a real item", () => {
    for (const w of SPEC_WEAPONS) {
      const item = ITEM_BY_ID.get(w.itemId);
      expect(item, `spec weapon ${w.name} (id ${w.itemId})`).toBeDefined();
    }
  });

  it("every catalog entry's name field matches the item catalog name", () => {
    for (const w of SPEC_WEAPONS) {
      const item = ITEM_BY_ID.get(w.itemId)!;
      expect(item.name, `spec weapon ${w.itemId}`).toBe(w.name);
    }
  });

  it("every catalog entry lives in the weapon slot", () => {
    for (const w of SPEC_WEAPONS) {
      const item = ITEM_BY_ID.get(w.itemId)!;
      expect(item.slot, `${w.name}`).toBe("weapon");
    }
  });

  it("no duplicate item IDs in the catalog", () => {
    const ids = SPEC_WEAPONS.map((w) => w.itemId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("findSpecWeapon returns the entry for a known id, undefined otherwise", () => {
    expect(findSpecWeapon(13652)?.name).toBe("Dragon claws");
    expect(findSpecWeapon(999_999_999)).toBeUndefined();
  });

  it("specWeaponsByRole returns at least one entry per role used in the catalog", () => {
    const roles = new Set(SPEC_WEAPONS.map((w) => w.role));
    for (const role of roles) {
      expect(specWeaponsByRole(role).length).toBeGreaterThan(0);
    }
  });
});

describe("per-boss spec recommendations — referential integrity", () => {
  it("every boss slug in the recommendations map exists in MONSTER_BY_SLUG", () => {
    for (const slug of Object.keys(BOSS_SPEC_RECOMMENDATIONS)) {
      const monster = MONSTER_BY_SLUG[slug];
      expect(monster, `slug "${slug}"`).toBeDefined();
    }
  });

  it("every recommended itemId is in the spec weapons catalog", () => {
    for (const [slug, recs] of Object.entries(BOSS_SPEC_RECOMMENDATIONS)) {
      for (const rec of recs) {
        expect(
          findSpecWeapon(rec.specWeaponId),
          `boss "${slug}" recommends item ${rec.specWeaponId} which isn't in spec catalog`,
        ).toBeDefined();
      }
    }
  });

  it("every recommendation note is non-empty", () => {
    for (const [slug, recs] of Object.entries(BOSS_SPEC_RECOMMENDATIONS)) {
      for (const rec of recs) {
        expect(rec.note.length, `boss "${slug}" item ${rec.specWeaponId} has empty note`).toBeGreaterThan(0);
      }
    }
  });

  it("specRecommendationsForBoss returns recommendations for curated bosses", () => {
    const vorkath = specRecommendationsForBoss("vorkath");
    expect(vorkath.length).toBeGreaterThan(0);
    expect(vorkath[0].specWeaponId).toBe(11804); // BGS
  });

  it("specRecommendationsForBoss returns empty for uncurated bosses, no crash", () => {
    expect(specRecommendationsForBoss("not-a-real-boss")).toEqual([]);
    expect(specRecommendationsForBoss("kalphite-soldier")).toEqual([]); // real monster, no curation
  });
});

describe("spot-check role tagging", () => {
  it("Bandos godsword is tagged defence-reduction", () => {
    expect(findSpecWeapon(11804)?.role).toBe("defence-reduction");
  });
  it("Dragon claws is tagged dps-spike", () => {
    expect(findSpecWeapon(13652)?.role).toBe("dps-spike");
  });
  it("Saradomin godsword is tagged healing", () => {
    expect(findSpecWeapon(11806)?.role).toBe("healing");
  });
  it("Zamorak godsword is tagged freeze-stun", () => {
    expect(findSpecWeapon(11808)?.role).toBe("freeze-stun");
  });
  it("Osmumten's fang is tagged true-max", () => {
    expect(findSpecWeapon(26219)?.role).toBe("true-max");
  });
  it("Dinh's bulwark is tagged aoe", () => {
    expect(findSpecWeapon(21015)?.role).toBe("aoe");
  });
});
