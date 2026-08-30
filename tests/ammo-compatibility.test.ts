import { describe, expect, it } from "vitest";
import { checkAmmoCompat, checkAmmoCompatWithCategory, SELF_AMMO_WEAPON_CATEGORIES } from "@/data/ammo-compatibility";

describe("checkAmmoCompat", () => {
  it("accepts a matching tier (Ruby bolts (e) on Rune crossbow)", () => {
    expect(checkAmmoCompat("Rune crossbow", "Ruby bolts (e)")).toEqual({ ok: true });
  });

  it("accepts lower-tier ammo on a higher-tier weapon (Diamond bolts (e) on DHCB)", () => {
    expect(checkAmmoCompat("Dragon hunter crossbow", "Diamond bolts (e)")).toEqual({ ok: true });
  });

  it("rejects above-tier ammo (the bug we hit: Ruby dragon bolts (e) on Rune crossbow)", () => {
    const result = checkAmmoCompat("Rune crossbow", "Ruby dragon bolts (e)");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/tier 7/);
      expect(result.reason).toMatch(/Rune crossbow/);
    }
  });

  it("rejects ammo-class mismatch (arrow on a crossbow)", () => {
    const result = checkAmmoCompat("Rune crossbow", "Rune arrow");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/bolts/);
      expect(result.reason).toMatch(/arrow/);
    }
  });

  it("rejects bolt on a bow (Twisted bow + Dragon bolts)", () => {
    const result = checkAmmoCompat("Twisted bow", "Dragon bolts");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/arrow/);
    }
  });

  it("Hunters' sunlight crossbow fires antler bolts ONLY (the bolt-proc bug: it paired with Ruby dragon bolts)", () => {
    expect(checkAmmoCompat("Hunters' sunlight crossbow", "Sunlight antler bolts")).toEqual({ ok: true });
    expect(checkAmmoCompat("Hunters' sunlight crossbow", "Moonlight antler bolts")).toEqual({ ok: true });
    expect(checkAmmoCompat("Hunters' sunlight crossbow", "Ruby dragon bolts (e)").ok).toBe(false);
    expect(checkAmmoCompat("Hunters' sunlight crossbow", "Diamond bolts (e)").ok).toBe(false);
    // And the antler bolts don't load into normal crossbows.
    expect(checkAmmoCompat("Rune crossbow", "Sunlight antler bolts").ok).toBe(false);
  });

  it("flags unknown ammo as an authoring error to extend the table", () => {
    const result = checkAmmoCompat("Rune crossbow", "Made up bolts");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Unknown ammo/);
      expect(result.reason).toMatch(/AMMO_TYPES/);
    }
  });

  it("accepts javelins on a ballista (now that javelins are in AMMO_TYPES)", () => {
    expect(checkAmmoCompat("Heavy ballista", "Dragon javelin")).toEqual({ ok: true });
    expect(checkAmmoCompat("Heavy ballista", "Rune javelin")).toEqual({ ok: true });
    expect(checkAmmoCompat("Light ballista", "Adamant javelin")).toEqual({ ok: true });
  });

  it("rejects dart on a ballista (class mismatch: javelin vs dart)", () => {
    const result = checkAmmoCompat("Heavy ballista", "Dragon dart");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/javelin/);
  });

  it("skips the check for weapons that don't use the ammo slot (e.g. spear, staff)", () => {
    // The codegen passes ammoName through unconditionally when the preset has
    // an ammo slot; the compat function should silently no-op when the weapon
    // isn't an ammo-consumer. (DHL is a melee weapon, but a hypothetical
    // preset that tried to put bolts in the ammo slot of a melee weapon
    // would skip — that's caught instead by the slot-not-being-set on the
    // preset itself.)
    expect(checkAmmoCompat("Dragon hunter lance", "Ruby bolts (e)")).toEqual({ ok: true });
    expect(checkAmmoCompat("Harmonised Nightmare staff", "Diamond bolts (e)")).toEqual({ ok: true });
  });
});

describe("checkAmmoCompatWithCategory — category fallback", () => {
  it("rejects bolts on an unlisted arrow-firing bow (Dark bow + Ruby dragon bolts (e))", () => {
    // Dark bow is not in WEAPON_AMMO; the category fallback infers arrows.
    const result = checkAmmoCompatWithCategory("Dark bow", "Bow", "Ruby dragon bolts (e)");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/arrow/);
  });

  it("accepts arrows on an unlisted arrow-firing bow (Dark bow + Dragon arrow)", () => {
    expect(checkAmmoCompatWithCategory("Dark bow", "Bow", "Dragon arrow")).toEqual({ ok: true });
  });

  it("rejects all ammo on Crystal bow — it fires from charges, no arrows", () => {
    // Crystal bow is now in WEAPON_AMMO with maxTier:0 (explicit entry takes
    // priority over the category fallback).
    const arrow = checkAmmoCompatWithCategory("Crystal bow", "Bow", "Dragon arrow");
    expect(arrow.ok).toBe(false);
    const bolt = checkAmmoCompatWithCategory("Crystal bow", "Bow", "Ruby dragon bolts (e)");
    expect(bolt.ok).toBe(false);
  });

  it("accepts bolts on an unlisted crossbow variant", () => {
    expect(checkAmmoCompatWithCategory("Dragon hunter crossbow (t)", "Crossbow", "Dragon bolts (e)")).toEqual({ ok: true });
  });

  it("rejects arrows on an unlisted crossbow variant", () => {
    const result = checkAmmoCompatWithCategory("Dragon hunter crossbow (t)", "Crossbow", "Dragon arrow");
    expect(result.ok).toBe(false);
  });

  it("still uses explicit WEAPON_AMMO entry when present (Heavy ballista → javelin, not bolt)", () => {
    // Heavy ballista is category "Crossbow" but explicitly registered as javelin.
    expect(checkAmmoCompatWithCategory("Heavy ballista", "Crossbow", "Dragon javelin")).toEqual({ ok: true });
    const bolts = checkAmmoCompatWithCategory("Heavy ballista", "Crossbow", "Dragon bolts (e)");
    expect(bolts.ok).toBe(false);
  });

  it("rejects all ammo on self-firing Wilderness bows (Craw's / Webweaver)", () => {
    expect(checkAmmoCompatWithCategory("Craw's bow", "Bow", "Dragon arrow").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Webweaver bow", "Bow", "Dragon arrow").ok).toBe(false);
  });

  it("Eclipse atlatl fires only Atlatl darts, not arrows or bolts", () => {
    expect(checkAmmoCompatWithCategory("Eclipse atlatl", "Bow", "Atlatl dart")).toEqual({ ok: true });
    expect(checkAmmoCompatWithCategory("Eclipse atlatl", "Bow", "Dragon arrow").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Eclipse atlatl", "Bow", "Dragon bolts (e)").ok).toBe(false);
  });

  it("caps low-tier crossbows so they cannot fire dragon bolts", () => {
    // Basic Crossbow / Phoenix / Blurite — bronze tier only.
    expect(checkAmmoCompatWithCategory("Crossbow", "Crossbow", "Dragon bolts (e)").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Phoenix crossbow", "Crossbow", "Dragon bolts (e)").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Blurite crossbow", "Crossbow", "Dragon bolts (e)").ok).toBe(false);
    // Dorgeshuun — adamant cap; rejects runite & dragon.
    expect(checkAmmoCompatWithCategory("Dorgeshuun crossbow", "Crossbow", "Adamant bolts")).toEqual({ ok: true });
    expect(checkAmmoCompatWithCategory("Dorgeshuun crossbow", "Crossbow", "Runite bolts").ok).toBe(false);
    // Cosmetic Rune crossbow — tier 6, no dragon bolts.
    expect(checkAmmoCompatWithCategory("Rune crossbow (or)", "Crossbow", "Dragon bolts (e)").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Rune crossbow (or)", "Crossbow", "Onyx bolts (e)")).toEqual({ ok: true });
  });
});

describe("SELF_AMMO_WEAPON_CATEGORIES", () => {
  it("includes Thrown, Chinchompas, Salamander, and Gun", () => {
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Thrown")).toBe(true);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Chinchompas")).toBe(true);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Salamander")).toBe(true);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Gun")).toBe(true);
  });

  it("does not include ammo-using weapon categories", () => {
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Crossbow")).toBe(false);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Bow")).toBe(false);
  });
});
