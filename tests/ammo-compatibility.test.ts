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
    expect(checkAmmoCompat("Harmonised nightmare staff", "Diamond bolts (e)")).toEqual({ ok: true });
  });
});

describe("checkAmmoCompatWithCategory — category fallback", () => {
  it("rejects bolts on an unlisted bow (Crystal bow + Ruby dragon bolts (e))", () => {
    // Crystal bow is not in WEAPON_AMMO; before this fix it returned ok:true
    // for any ammo, letting bolts (higher rangedStr) win the greedy pick.
    const result = checkAmmoCompatWithCategory("Crystal bow", "Bow", "Ruby dragon bolts (e)");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/arrow/);
  });

  it("accepts arrows on an unlisted bow (Crystal bow + Dragon arrow)", () => {
    expect(checkAmmoCompatWithCategory("Crystal bow", "Bow", "Dragon arrow")).toEqual({ ok: true });
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
});

describe("SELF_AMMO_WEAPON_CATEGORIES", () => {
  it("includes Thrown and Chinchompas", () => {
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Thrown")).toBe(true);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Chinchompas")).toBe(true);
  });

  it("does not include ammo-using weapon categories", () => {
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Crossbow")).toBe(false);
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Bow")).toBe(false);
  });
});
