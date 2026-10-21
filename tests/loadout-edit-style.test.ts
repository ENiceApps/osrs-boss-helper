/**
 * Regression: the boss page's manual gear editor (applyOverrides) must let
 * the combat style follow the WEAPON. It used to keep the base tab's style,
 * attack type, style choice and spell no matter what was swapped in, so a
 * blowpipe dropped into the magic set was scored as a 3-tick Fire Surge and
 * a staff dropped into the ranged set was scored as a ranged weapon with no
 * spell at all.
 */
import { describe, expect, it } from "vitest";
import { applyOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { autoPickSpell } from "@/lib/auto-spell";
import { scoreScenario, type ScenarioInput } from "@/lib/optimize/scenario";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SPELLS_BY_NAME } from "@/data/spells/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import type { LoadoutSet } from "@/types/loadout";

const TOXIC_BLOWPIPE = 12926; // Charged
const DRAGON_DART = 11230;
const TWISTED_BOW = 20997;
const DRAGON_CROSSBOW = 21902;
const DRAGON_ARROW = 11212;
const RUBY_DRAGON_BOLTS_E = 21944;
const KODAI_WAND = 21006; // Staff: casts spells
const ANCIENT_STAFF = 4675; // Staff: casts spells
const SANGUINESTI_STAFF = 22323; // Powered Staff (Charged)
const ABYSSAL_WHIP = 4151; // slash only
const ELDER_MAUL = 21003; // crush only
const BARROWS_GLOVES = 7462;

const ZULRAH = MONSTER_BY_SLUG["zulrah"];

const item = (id: number) => findCatalogItem(id)!;

function scored(input: Omit<ScenarioInput, "target" | "skills">) {
  const s = scoreScenario({ ...input, target: ZULRAH, skills: SKILLS_AT_99 });
  if (!s.valid) throw new Error(`invalid scenario: ${s.reasons.join("; ")}`);
  return s;
}

/** A magic set the way the optimizer builds one: style pinned, spell auto-picked. */
function scoredMagic(itemIds: number[]) {
  const spell = autoPickSpell(item(itemIds[0]), itemIds, "magic", 99, ZULRAH);
  return scored({ itemIds, attackStyle: { attackType: "magic", choice: "longrange" }, ...spell });
}

function expectSameDps(edited: LoadoutSet, optimizer: ReturnType<typeof scored>) {
  expect(edited.style).toBe(optimizer.loadout.style);
  expect(edited.attackType).toBe(optimizer.loadout.attackType);
  expect(edited.attackStyleChoice).toBe(optimizer.loadout.attackStyleChoice);
  expect(edited.totals).toEqual(optimizer.loadout.totals);
  expect(edited.attackSpeedTicks).toBe(optimizer.loadout.attackSpeedTicks);
  const dps = computeSetDps(edited, ZULRAH, SKILLS_AT_99);
  expect(dps.maxHit).toBe(optimizer.dps.maxHit);
  expect(dps.dps).toBeCloseTo(optimizer.dps.dps, 10);
}

describe("applyOverrides — combat style follows the weapon", () => {
  it("a blowpipe dropped into the magic set becomes a ranged/rapid set with no spell", () => {
    const base = scoredMagic([KODAI_WAND]).loadout;
    expect(base.style).toBe("magic");
    expect(base.autoSpellName).toBeDefined();

    const edited = applyOverrides(base, { weapon: item(TOXIC_BLOWPIPE) }, undefined, 99, undefined, ZULRAH);
    expect(edited.style).toBe("ranged");
    expect(edited.attackType).toBe("ranged");
    expect(edited.attackStyleChoice).toBe("rapid");
    expect(edited.baseSpellMaxHit).toBeUndefined();
    expect(edited.spellElement).toBeUndefined();
    expect(edited.autoSpellName).toBeUndefined();
    expect(edited.totals.magicDamagePct).toBeUndefined();
    expect(edited.internalAmmo?.itemId).toBe(DRAGON_DART);
    expectSameDps(edited, scored({ itemIds: [TOXIC_BLOWPIPE], internalAmmoId: DRAGON_DART }));
  });

  it("a casting staff dropped into the ranged set becomes magic with an auto-picked spell", () => {
    const base = scored({ itemIds: [TWISTED_BOW, DRAGON_ARROW] }).loadout;
    expect(base.style).toBe("ranged");

    const edited = applyOverrides(base, { weapon: item(KODAI_WAND), ammo: null }, undefined, 99, undefined, ZULRAH);
    expect(edited.style).toBe("magic");
    expect(edited.attackType).toBe("magic");
    expect(edited.attackStyleChoice).toBe("longrange");
    const optimizer = scoredMagic([KODAI_WAND]);
    expect(edited.autoSpellName).toBe(optimizer.loadout.autoSpellName);
    expect(edited.baseSpellMaxHit).toBe(optimizer.loadout.baseSpellMaxHit);
    expect(edited.spellElement).toBe(optimizer.loadout.spellElement);
    expectSameDps(edited, optimizer);
  });

  it("a powered staff dropped into the ranged set uses its own formula, no spell name", () => {
    const base = scored({ itemIds: [TWISTED_BOW, DRAGON_ARROW] }).loadout;
    const edited = applyOverrides(base, { weapon: item(SANGUINESTI_STAFF), ammo: null }, undefined, 99, undefined, ZULRAH);
    expect(edited.style).toBe("magic");
    expect(edited.attackStyleChoice).toBe("accurate");
    expect(edited.baseSpellMaxHit).toBe(POWERED_STAFF_FORMULA.get(SANGUINESTI_STAFF)!(99));
    expect(edited.autoSpellName).toBeUndefined();
    expect(edited.spellElement).toBeUndefined();
    expectSameDps(edited, scored({ itemIds: [SANGUINESTI_STAFF] }));
  });

  it("without a target a set moved into magic on a casting staff carries no spell", () => {
    const base = scored({ itemIds: [TWISTED_BOW, DRAGON_ARROW] }).loadout;
    const edited = applyOverrides(base, { weapon: item(KODAI_WAND), ammo: null }, undefined, 99);
    expect(edited.style).toBe("magic");
    expect(edited.baseSpellMaxHit).toBeUndefined();
    expect(edited.autoSpellName).toBeUndefined();
  });

  it("a crush-only weapon in a slash set re-derives the melee attack type", () => {
    const base = scored({ itemIds: [ABYSSAL_WHIP], attackStyle: { attackType: "slash", choice: "accurate" } }).loadout;
    const edited = applyOverrides(base, { weapon: item(ELDER_MAUL) }, undefined, 99, undefined, ZULRAH);
    expect(edited.style).toBe("melee");
    expect(edited.attackType).toBe("crush");
    expect(edited.attackStyleChoice).toBe("aggressive");
    expectSameDps(edited, scored({ itemIds: [ELDER_MAUL] }));
  });

  it("keeps the base style choice when the new weapon still offers it", () => {
    const base = scored({
      itemIds: [DRAGON_CROSSBOW, RUBY_DRAGON_BOLTS_E],
      attackStyle: { attackType: "ranged", choice: "accurate" },
    }).loadout;
    const edited = applyOverrides(base, { weapon: item(TWISTED_BOW), ammo: item(DRAGON_ARROW) }, undefined, 99, undefined, ZULRAH);
    expect(edited.attackStyleChoice).toBe("accurate");
    expectSameDps(
      edited,
      scored({ itemIds: [TWISTED_BOW, DRAGON_ARROW], attackStyle: { attackType: "ranged", choice: "accurate" } }),
    );
  });

  it("editing armour on a magic set keeps its weapon, style and spell untouched", () => {
    const base = scoredMagic([KODAI_WAND]).loadout;
    const edited = applyOverrides(base, { hands: item(BARROWS_GLOVES) }, undefined, 99, undefined, ZULRAH);
    expect(edited.style).toBe("magic");
    expect(edited.attackStyleChoice).toBe(base.attackStyleChoice);
    expect(edited.autoSpellName).toBe(base.autoSpellName);
    expect(edited.baseSpellMaxHit).toBe(base.baseSpellMaxHit);
    expectSameDps(edited, scoredMagic([KODAI_WAND, BARROWS_GLOVES]));
  });

  it("a manual spell survives a swap to another casting staff", () => {
    const base = scoredMagic([KODAI_WAND]).loadout;
    const iceBarrage = SPELLS_BY_NAME.get("Ice Barrage")!;
    const edited = applyOverrides(base, { weapon: item(ANCIENT_STAFF) }, iceBarrage, 99, undefined, ZULRAH);
    expect(edited.style).toBe("magic");
    expect(edited.autoSpellName).toBe("Ice Barrage");
    expect(edited.spellElement).toBe(iceBarrage.element);
  });

  it("swapping a magic set back out of magic and in again re-picks the spell for the new staff", () => {
    const base = scoredMagic([KODAI_WAND]).loadout;
    const asRanged = applyOverrides(base, { weapon: item(TWISTED_BOW), ammo: item(DRAGON_ARROW) }, undefined, 99, undefined, ZULRAH);
    expect(asRanged.style).toBe("ranged");
    expect(asRanged.autoSpellName).toBeUndefined();

    const back = applyOverrides(asRanged, { weapon: item(ANCIENT_STAFF), ammo: null }, undefined, 99, undefined, ZULRAH);
    expect(back.style).toBe("magic");
    expect(back.autoSpellName).toBe(scoredMagic([ANCIENT_STAFF]).loadout.autoSpellName);
  });
});
