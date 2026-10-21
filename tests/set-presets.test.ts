// The loadout panel's Sets dropdown: every preset resolves to real catalog
// items in the right slots, owned variants win, and equipping a set through
// the manual editor lights up the matching set effect.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { findCatalogItem, applyOverrides } from "@/lib/loadout-edit";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import {
  SET_PRESETS,
  setPresetOverrides,
  setPresetsByStyle,
  wornSetPreset,
} from "@/lib/set-presets";
import type { LoadoutSet } from "@/types/loadout";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

const RUNE_SCIMITAR = 1333;
const RUNE_FULL_HELM = 1163;
const RUNE_PLATEBODY = 1127;
const RUNE_PLATELEGS = 1079;
const DRAGON_DAGGER = 1215;
const RUNE_CROSSBOW = 9185;
const DIAMOND_BOLTS_E = 9243;
const VOID_RANGER_HELM = 11664;
const VOID_TOP = 8839;
const VOID_ROBE = 8840;
const ELITE_VOID_TOP = 13072;
const ELITE_VOID_ROBE = 13073;
const VOID_GLOVES = 8842;
const DHAROK_HELM_75 = 4881;
const TOKTZ_XIL_EK = 6525;

function meleeBase(): LoadoutSet {
  const result = optimizeForBoss({
    bank: new Set([RUNE_SCIMITAR, RUNE_FULL_HELM, RUNE_PLATEBODY, RUNE_PLATELEGS]),
    target: VORKATH,
    skills: SKILLS_AT_99,
  });
  const melee = result.rankings.find((s) => s.loadout.style === "melee");
  if (!melee) throw new Error("expected a melee scenario");
  return melee.loadout;
}

function rangedBase(): LoadoutSet {
  const result = optimizeForBoss({
    bank: new Set([RUNE_CROSSBOW, DIAMOND_BOLTS_E]),
    target: VORKATH,
    skills: SKILLS_AT_99,
  });
  const ranged = result.rankings.find((s) => s.loadout.style === "ranged");
  if (!ranged) throw new Error("expected a ranged scenario");
  return ranged.loadout;
}

describe("set presets — catalog", () => {
  it("every piece id is a catalog item in the piece's slot", () => {
    for (const preset of SET_PRESETS) {
      for (const piece of preset.pieces) {
        for (const id of piece.itemIds) {
          const item = findCatalogItem(id);
          expect(item, `${preset.id} ${piece.slot} ${id}`).toBeDefined();
          // The catalog files 2H weapons under "2h"; the loadout slot is still "weapon".
          const slot = item?.slot === "2h" ? "weapon" : item?.slot;
          expect(slot, `${preset.id} ${id}`).toBe(piece.slot);
        }
      }
    }
  });

  it("lists every modelled set once, grouped by style", () => {
    const ids = SET_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      "void-melee", "void-ranged", "void-magic", "elite-void-ranged", "elite-void-magic",
      "dharoks", "obsidian-melee", "inquisitors", "blood-moon", "crystal-armour",
    ]));
    const groups = setPresetsByStyle();
    expect(groups.map((g) => g.style)).toEqual(["melee", "ranged", "magic"]);
    expect(groups.flatMap((g) => g.presets).length).toBe(SET_PRESETS.length);
  });
});

describe("set presets — overrides", () => {
  const voidRanged = SET_PRESETS.find((p) => p.id === "void-ranged")!;
  const dharoks = SET_PRESETS.find((p) => p.id === "dharoks")!;
  const obsidianMelee = SET_PRESETS.find((p) => p.id === "obsidian-melee")!;

  it("defaults to the first listed variant when nothing is owned", () => {
    const ov = setPresetOverrides(voidRanged);
    expect(ov.head?.id).toBe(VOID_RANGER_HELM);
    expect(ov.body?.id).toBe(VOID_TOP);
    expect(ov.legs?.id).toBe(VOID_ROBE);
    expect(ov.hands?.id).toBe(VOID_GLOVES);
  });

  it("prefers the owned variant of a piece", () => {
    const owned = new Set([ELITE_VOID_TOP, ELITE_VOID_ROBE, DHAROK_HELM_75]);
    const ov = setPresetOverrides(voidRanged, { owned });
    expect(ov.body?.id).toBe(ELITE_VOID_TOP);
    expect(ov.legs?.id).toBe(ELITE_VOID_ROBE);
    expect(setPresetOverrides(dharoks, { owned }).head?.id).toBe(DHAROK_HELM_75);
  });

  it("keeps a worn weapon that already satisfies the set", () => {
    const base = applyOverrides(meleeBase(), { weapon: findCatalogItem(TOKTZ_XIL_EK)! });
    const ov = setPresetOverrides(obsidianMelee, { current: base });
    expect(ov.weapon).toBeUndefined();
    expect(Object.keys(ov).sort()).toEqual(["body", "head", "legs"]);
  });

  it("swaps in the set's weapon when the worn one doesn't qualify", () => {
    const base = applyOverrides(meleeBase(), { weapon: findCatalogItem(DRAGON_DAGGER)! });
    const ov = setPresetOverrides(obsidianMelee, { current: base });
    expect(ov.weapon?.id).toBe(6523);
  });
});

describe("set presets — worn detection and set effects", () => {
  it("equipping Void (Ranged) through the editor activates the set bonus", () => {
    const base = rangedBase();
    expect(wornSetPreset(base)).toBeUndefined();
    const preset = SET_PRESETS.find((p) => p.id === "void-ranged")!;
    const edited = applyOverrides(base, setPresetOverrides(preset));
    expect(wornSetPreset(edited)?.id).toBe("void-ranged");
    expect(edited.armorSetBonus?.id).toBe("void-ranged");
  });

  it("elite pieces report the elite set, not the regular one", () => {
    const preset = SET_PRESETS.find((p) => p.id === "elite-void-ranged")!;
    const edited = applyOverrides(rangedBase(), setPresetOverrides(preset));
    expect(wornSetPreset(edited)?.id).toBe("elite-void-ranged");
  });

  it("equipping Dharok's makes the low-HP bonus apply", () => {
    const preset = SET_PRESETS.find((p) => p.id === "dharoks")!;
    const edited = applyOverrides(meleeBase(), setPresetOverrides(preset));
    expect(wornSetPreset(edited)?.id).toBe("dharoks");
    const fullHp = computeSetDps(edited, VORKATH, SKILLS_AT_99, undefined, false, false, undefined);
    const lowHp = computeSetDps(edited, VORKATH, SKILLS_AT_99, undefined, false, false, 1);
    expect(lowHp.dps).toBeGreaterThan(fullHp.dps);
  });

  it("a set for another style is never reported as worn", () => {
    const preset = SET_PRESETS.find((p) => p.id === "void-ranged")!;
    const edited = applyOverrides(meleeBase(), setPresetOverrides(preset));
    expect(wornSetPreset(edited)).toBeUndefined();
  });
});
