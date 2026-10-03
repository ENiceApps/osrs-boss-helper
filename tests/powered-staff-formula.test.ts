import { describe, expect, it } from "vitest";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { autocastableSpellbooks } from "@/data/items/magic-weapon-autocast";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import type { LoadoutSet } from "@/types/loadout";

const CATALOG_IDS = new Set(ITEM_CATALOG.map((i) => i.id));

// The equippable "Trident of the Seas" the generated catalog exposes (Uncharged
// row) — this is the id the optimizer/loadout actually carries. Before the fix
// it was absent from POWERED_STAFF_FORMULA, so magic DPS computed as ~0.
const TRIDENT_OF_THE_SEAS_UNCHARGED = 11908;

describe("POWERED_STAFF_FORMULA — catalog reconciliation", () => {
  it("every formula key is an id present in ITEM_CATALOG", () => {
    const orphans = [...POWERED_STAFF_FORMULA.keys()].filter((id) => !CATALOG_IDS.has(id));
    expect(orphans).toEqual([]);
  });

  it("every powered-staff key is a Powered Staff in the catalog", () => {
    const byId = new Map(ITEM_CATALOG.map((i) => [i.id, i]));
    for (const id of POWERED_STAFF_FORMULA.keys()) {
      expect(byId.get(id)?.category).toBe("Powered Staff");
    }
  });

  it("includes the equippable Trident of the Seas id the catalog exposes", () => {
    expect(POWERED_STAFF_FORMULA.has(TRIDENT_OF_THE_SEAS_UNCHARGED)).toBe(true);
  });
});

// Build a Trident of the Seas magic loadout exactly the way lib/optimize/bank.ts
// does: derive baseSpellMaxHit from POWERED_STAFF_FORMULA keyed by the weapon id.
// If the id is missing from the map (the old bug) this is undefined → ~0 DPS.
function tridentSet(weaponId: number): LoadoutSet {
  const formula = POWERED_STAFF_FORMULA.get(weaponId);
  return {
    id: "trident-test",
    name: "Trident of the Seas",
    style: "magic",
    tier: "mid",
    attackType: "magic",
    attackStyleChoice: "accurate",
    slots: { weapon: { itemId: weaponId, itemName: "Trident of the Seas" } },
    totals: { attackBonus: 15, strengthBonus: 0, prayerBonus: 0, magicDamagePct: 0 },
    attackSpeedTicks: 4,
    weaponCategory: "Powered Staff",
    baseSpellMaxHit: formula ? formula(SKILLS_AT_99.magic) : undefined,
    spellElement: "water",
    itemBonusFlags: {
      dragonHunterCrossbow: false,
      dragonHunterLance: false,
      dragonHunterWand: false,
      salveAmuletEi: false,
      salveAmulet: false,
      demonbane: false,
      tomeOfFire: false,
      tomeOfWater: false,
      tomeOfEarth: false,
      twistedBow: false,
      fang: false,
      slayerHelmImbued: false,
    },
  };
}

describe("Trident of the Seas — magic loadout", () => {
  const target = MONSTER_BY_SLUG["general-graardor"];

  it("computes non-zero magic DPS for the catalog's trident id", () => {
    const result = computeSetDps(tridentSet(TRIDENT_OF_THE_SEAS_UNCHARGED), target, SKILLS_AT_99);
    expect(result.maxHit).toBeGreaterThan(0);
    expect(result.dps).toBeGreaterThan(0);
  });

  it("does not surface a spell-picker chip (powered staves have no autocast)", () => {
    expect(autocastableSpellbooks(TRIDENT_OF_THE_SEAS_UNCHARGED)).toEqual([]);
  });
});

// Wilderness sceptres (wgloop getPlayerMaxMagicHit). Before 2026-10-03 they
// had no entry, so their max hit was 0 and the optimizer's wilderness-weapon
// force-include could never win.
describe("Accursed / Thammaron's sceptre — built-in spell", () => {
  const THAMMARONS = [22555, 22552]; // Charged, Uncharged
  const ACCURSED = [27665, 27662]; // Charged, Uncharged
  const ATTUNED = [27788, 27785, 27679, 27676]; // (a): regular staves, autocast spells

  it("Thammaron's sceptre: max(1, trunc(magic/3 - 8)) — 25 at 99, 12 at its 60 requirement", () => {
    for (const id of THAMMARONS) {
      const f = POWERED_STAFF_FORMULA.get(id);
      expect(f?.(99)).toBe(25);
      expect(f?.(60)).toBe(12);
    }
  });

  it("Accursed sceptre: max(1, trunc(magic/3 - 6)) — 27 at 99, 17 at its 70 requirement", () => {
    for (const id of ACCURSED) {
      const f = POWERED_STAFF_FORMULA.get(id);
      expect(f?.(99)).toBe(27);
      expect(f?.(70)).toBe(17); // trunc(23.33… - 6)
    }
  });

  it("the (a) sceptres cast spellbook spells, so they have no built-in formula", () => {
    for (const id of ATTUNED) expect(POWERED_STAFF_FORMULA.has(id)).toBe(false);
  });
});
