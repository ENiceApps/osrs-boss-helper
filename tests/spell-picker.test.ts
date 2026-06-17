import { describe, expect, it } from "vitest";
import {
  bestSpell,
  spellCastableVs,
  spellEffectiveMaxHit,
  SPELLS_BY_NAME,
} from "@/data/spells/catalog";
import { applyOverrides, hasOverrides } from "@/lib/loadout-edit";
import { calculateDps } from "@/lib/dps/calculate";
import {
  autocastableSpellbooks,
  weaponCanAutocastSpellbook,
  weaponSatisfiesStaffRequirement,
} from "@/data/items/magic-weapon-autocast";
import type { ItemBonusFlags, LoadoutSet } from "@/types/loadout";

// Weapon ids (from data/items/catalog.ts).
const STAFF_OF_WATER = 1383;
const ANCIENT_STAFF = 4675;
const KODAI_WAND = 21006;
const HARMONISED_NIGHTMARE_STAFF = 24423;
const NIGHTMARE_STAFF = 24422;
const TRIDENT_OF_THE_SEAS = 11905;
const IBANS_STAFF = 1409;

const NO_BONUSES: ItemBonusFlags = {
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
};

// Minimal magic loadout — no equipped items needed to exercise the spell-field
// resolver (applyOverrides only touches spell fields when style === "magic").
const MAGIC_SET: LoadoutSet = {
  id: "test-magic",
  name: "Test magic",
  style: "magic",
  tier: "end",
  attackType: "magic",
  attackStyleChoice: "accurate",
  slots: {},
  totals: { attackBonus: 0, strengthBonus: 0, prayerBonus: 0, magicDamagePct: 0 },
  attackSpeedTicks: 5,
  itemBonusFlags: NO_BONUSES,
  baseSpellMaxHit: 24,
  spellElement: "fire",
  autoSpellName: "Fire Surge",
};

describe("bestSpell — cross-spellbook auto-selection", () => {
  it("picks Ice Barrage for a 94 mage with no target restriction (highest max hit)", () => {
    const spell = bestSpell({ magicLevel: 94, targetAttributes: [] });
    expect(spell?.name).toBe("Ice Barrage");
  });

  it("never auto-picks a demonbane spell vs a non-demon (attribute gate)", () => {
    const vsNonDemon = bestSpell({ magicLevel: 99, targetAttributes: [] });
    expect(vsNonDemon?.requiresAttribute).toBeUndefined();
  });

  it("gates demonbane casting by the target's demon attribute", () => {
    const darkDemonbane = SPELLS_BY_NAME.get("Dark Demonbane")!;
    expect(spellCastableVs(darkDemonbane, 99, [])).toBe(false);
    expect(spellCastableVs(darkDemonbane, 99, ["demon"])).toBe(true);
  });

  it("excludes staff-locked specials (Iban Blast / Magic Dart) from the auto-pick", () => {
    // They need a specific staff we can't assume is equipped — picker-only.
    for (let lvl = 50; lvl <= 99; lvl++) {
      const spell = bestSpell({ magicLevel: lvl, targetAttributes: [] });
      expect(spell?.requiresStaff).toBeUndefined();
    }
  });
});

describe("spellEffectiveMaxHit — tome interaction (ranking)", () => {
  it("Tome of Fire boosts a fire spell ×11/10", () => {
    const fireSurge = SPELLS_BY_NAME.get("Fire Surge")!; // base 24
    expect(spellEffectiveMaxHit(fireSurge, { magicLevel: 99, targetAttributes: [], tomeOfFire: true })).toBe(26); // floor(24×11/10)
  });

  it("Tome of Water boosts a water spell ×6/5", () => {
    const waterSurge = SPELLS_BY_NAME.get("Water Surge")!; // base 22
    expect(spellEffectiveMaxHit(waterSurge, { magicLevel: 99, targetAttributes: [], tomeOfWater: true })).toBe(26); // floor(22×6/5)
  });

  it("Tome of Earth boosts an earth spell ×11/10", () => {
    const earthSurge = SPELLS_BY_NAME.get("Earth Surge")!; // base 23
    expect(spellEffectiveMaxHit(earthSurge, { magicLevel: 99, targetAttributes: [], tomeOfEarth: true })).toBe(25); // floor(23×11/10)
  });

  it("a tome does not touch a spell of a different element", () => {
    const waterSurge = SPELLS_BY_NAME.get("Water Surge")!; // base 22
    expect(spellEffectiveMaxHit(waterSurge, { magicLevel: 99, targetAttributes: [], tomeOfFire: true })).toBe(22);
  });
});

describe("magic weapon autocast capability", () => {
  it("a plain elemental staff autocasts Standard only", () => {
    expect(autocastableSpellbooks(STAFF_OF_WATER)).toEqual(["standard"]);
    expect(weaponCanAutocastSpellbook(STAFF_OF_WATER, "ancient")).toBe(false);
  });

  it("the Ancient staff autocasts Standard + Ancient (not Arceuus)", () => {
    expect(weaponCanAutocastSpellbook(ANCIENT_STAFF, "ancient")).toBe(true);
    expect(weaponCanAutocastSpellbook(ANCIENT_STAFF, "arceuus")).toBe(false);
  });

  it("the Kodai wand autocasts all three spellbooks", () => {
    expect(autocastableSpellbooks(KODAI_WAND).sort()).toEqual(["ancient", "arceuus", "standard"]);
  });

  it("the Harmonised nightmare staff is Standard-only despite matching 'nightmare staff'", () => {
    expect(weaponCanAutocastSpellbook(HARMONISED_NIGHTMARE_STAFF, "ancient")).toBe(false);
    expect(weaponCanAutocastSpellbook(NIGHTMARE_STAFF, "ancient")).toBe(true);
  });

  it("powered staves can't autocast any spell", () => {
    expect(autocastableSpellbooks(TRIDENT_OF_THE_SEAS)).toEqual([]);
  });

  it("matches a spell's specific-staff requirement loosely", () => {
    expect(weaponSatisfiesStaffRequirement(IBANS_STAFF, "Iban's staff")).toBe(true);
    expect(weaponSatisfiesStaffRequirement(STAFF_OF_WATER, "Iban's staff")).toBe(false);
  });
});

describe("demonbane spell accuracy (DPS engine)", () => {
  const magicBase = {
    style: "magic" as const,
    attackStyle: "accurate" as const,
    prayers: {
      attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    },
    skills: { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99 },
    attackBonus: 30,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit: 30, // Dark Demonbane
    spellElement: "none" as const,
    attackSpeedTicks: 5,
    targetDefenceLevel: 100,
    targetDefenceBonusForStyle: 0,
  };

  it("raises accuracy vs a demon, and leaves max hit untouched", () => {
    const off = calculateDps(magicBase);
    const on = calculateDps({ ...magicBase, demonbaneSpellAccuracyPct: 20 });
    expect(on.accuracy).toBeGreaterThan(off.accuracy);
    expect(on.maxHit).toBe(off.maxHit); // demonbane spell bonus is accuracy-only
  });
});

describe("applyOverrides — manual spell override", () => {
  it("rewrites baseSpellMaxHit / spellElement / autoSpellName from the chosen spell", () => {
    const iceBarrage = SPELLS_BY_NAME.get("Ice Barrage")!;
    const out = applyOverrides(MAGIC_SET, {}, iceBarrage, 99);
    expect(out.autoSpellName).toBe("Ice Barrage");
    expect(out.baseSpellMaxHit).toBe(30);
    expect(out.spellElement).toBe("none");
  });

  it("resolves level-scaled spells (Magic Dart) against the supplied magic level", () => {
    const magicDart = SPELLS_BY_NAME.get("Magic Dart")!;
    const out = applyOverrides(MAGIC_SET, {}, magicDart, 99);
    expect(out.baseSpellMaxHit).toBe(19); // floor(99/10) + 10
  });

  it("null (or undefined) keeps the base set's auto-selected spell", () => {
    const out = applyOverrides(MAGIC_SET, {}, null, 99);
    expect(out.autoSpellName).toBe("Fire Surge");
    expect(out.baseSpellMaxHit).toBe(24);
  });

  it("hasOverrides reports a spell change, and ignores re-selecting the current spell", () => {
    const fireSurge = SPELLS_BY_NAME.get("Fire Surge")!;
    const iceBarrage = SPELLS_BY_NAME.get("Ice Barrage")!;
    expect(hasOverrides(MAGIC_SET, {}, iceBarrage)).toBe(true);
    expect(hasOverrides(MAGIC_SET, {}, fireSurge)).toBe(false); // same as base
    expect(hasOverrides(MAGIC_SET, {}, null)).toBe(false);
  });
});
