// Summer Sweep-Up Miscellaneous (2026-09-02): Amulet of air/water/earth/fire and
// the Elemental amulet add +2 max hit to spells of the matching element. This file
// pins three things that land together:
//
//   1. The elemental SPELL LADDER (a prerequisite): every standard elemental spell
//      hits as hard as the highest-unlocked spell of its class at the player's
//      Magic level (Wind Surge 21 -> 22 -> 23 -> 24). Mirrors upstream
//      osrs-dps-calc `getSpellMaxHit`.
//   2. The ENGINE: the +2 is flat, added to the spell's base hit BEFORE the magic
//      damage % and INSIDE the base the elemental-weakness bonus is taken from
//      (upstream #966 `hasMatchingElementalAmulet` in getPlayerMaxMagicHit).
//   3. Everything around it: flag derivation, resolution against the cast spell,
//      element-aware spell selection (the ladder makes every Surge tie at 95+, so
//      the amulet and the target's weakness now decide the element), optimizer
//      force-includes, and the display strings.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_SPELLS,
  SPELLS_BY_NAME,
  bestSpell,
  canCastElement,
  elementalLadderMaxHit,
  spellEffectiveMaxHit,
  spellMaxHit,
  type SpellEntry,
} from "@/data/spells/catalog";
import {
  amuletBoostsElement,
  elementalAmuletKind,
  ownedElementalAmuletIds,
} from "@/data/bonus-trigger-items";
import { MONSTER_BY_SLUG, type MonsterCatalogEntry } from "@/data/monsters/catalog";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { activeBonusesForTarget } from "@/lib/loadout";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { applyOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { explainSlots } from "@/lib/loadout-explain";
import { amuletCanMatter, autoPickSpell, optimizeForBoss } from "@/lib/optimize/bank";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";
import { scoreScenario } from "@/lib/optimize/scenario";
import { buildActiveFlags } from "@/components/ResultsPanel";
import type { Skills } from "@/types/osrs";

// ---- ids -----------------------------------------------------------------
const STAFF_OF_AIR = 1381;
const STAFF_OF_WATER = 1383;
const STAFF_OF_EARTH = 1385;
const STAFF_OF_FIRE = 1387;
const AMULET_OF_AIR = 34407;
const AMULET_OF_WATER = 34413;
const AMULET_OF_EARTH = 34419;
const AMULET_OF_FIRE = 34425;
const ELEMENTAL_AMULET = 34428;
const OCCULT_NECKLACE = 12002;
const TOME_OF_FIRE = 20714;
const TOME_OF_WATER = 25574;
const TUMEKENS_SHADOW = 27275;
const TRIDENT_OF_THE_SWAMP = 12899;
const TWINFLAME_STAFF = 30634;
const ARCLIGHT = 19675;
const ANCESTRAL = [21018, 21021, 21024]; // hat, robe top, robe bottom
const SALVE_EI = 12018;
const ABYSSAL_WHIP = 4151;

const spell = (name: string): SpellEntry => {
  const s = SPELLS_BY_NAME.get(name);
  if (!s) throw new Error(`unknown spell ${name}`);
  return s;
};

// ---- 1. the elemental ladder ----------------------------------------------

/** Upstream getSpellMaxHit, re-implemented independently (Spell.ts, HEAD 89c3e25b). */
function upstreamElementalMaxHit(cls: string, level: number): number {
  const own: Record<string, [number, number, number, number]> = {
    // [wind, water, earth, fire] listed max hits (spells.json)
    Strike: [2, 4, 6, 8],
    Bolt: [9, 10, 11, 12],
    Blast: [13, 14, 15, 16],
    Wave: [17, 18, 19, 20],
    Surge: [21, 22, 23, 24],
  };
  const thresholds: Record<string, [number, number, number]> = {
    // [fire, earth, water] unlock levels
    Strike: [13, 9, 5],
    Bolt: [35, 29, 23],
    Blast: [59, 53, 47],
    Wave: [75, 70, 65],
    Surge: [95, 90, 85],
  };
  const [fire, earth, water] = thresholds[cls];
  const [wind, w, e, f] = own[cls];
  if (level >= fire) return f;
  if (level >= earth) return e;
  if (level >= water) return w;
  return wind;
}

describe("elemental spell ladder (spellMaxHit)", () => {
  it("Wind Surge: 21 at 81, 22 at 85, 23 at 90, 24 at 95+", () => {
    const windSurge = spell("Wind Surge");
    expect(spellMaxHit(windSurge, 81)).toBe(21);
    expect(spellMaxHit(windSurge, 84)).toBe(21);
    expect(spellMaxHit(windSurge, 85)).toBe(22);
    expect(spellMaxHit(windSurge, 89)).toBe(22);
    expect(spellMaxHit(windSurge, 90)).toBe(23);
    expect(spellMaxHit(windSurge, 94)).toBe(23);
    expect(spellMaxHit(windSurge, 95)).toBe(24);
    expect(spellMaxHit(windSurge, 99)).toBe(24);
  });

  it("Wind Strike is 2 at level 1 and 8 at 99 (Fire Strike's tier, unlocked at 13)", () => {
    const windStrike = spell("Wind Strike");
    expect(spellMaxHit(windStrike, 1)).toBe(2);
    expect(spellMaxHit(windStrike, 5)).toBe(4);
    expect(spellMaxHit(windStrike, 9)).toBe(6);
    expect(spellMaxHit(windStrike, 13)).toBe(8);
    expect(spellMaxHit(windStrike, 99)).toBe(8);
  });

  it("Fire Bolt is 12 at 35; Water Bolt takes Fire Bolt's 12 once it is unlocked", () => {
    expect(spellMaxHit(spell("Fire Bolt"), 35)).toBe(12);
    expect(spellMaxHit(spell("Water Bolt"), 34)).toBe(11); // Earth Bolt tier (29+)
    expect(spellMaxHit(spell("Water Bolt"), 35)).toBe(12);
  });

  it("all four Surges tie at 24 at 99 Magic", () => {
    for (const n of ["Fire Surge", "Earth Surge", "Water Surge", "Wind Surge"]) {
      expect(spellMaxHit(spell(n), 99)).toBe(24);
    }
  });

  it("all 20 elemental spells match upstream getSpellMaxHit at every castable level", () => {
    const elemental = ALL_SPELLS.filter((s) => s.elementalClass);
    expect(elemental).toHaveLength(20);
    for (const s of elemental) {
      for (let lvl = s.minLevel; lvl <= 99; lvl++) {
        expect(spellMaxHit(s, lvl), `${s.name} at ${lvl}`).toBe(
          upstreamElementalMaxHit(s.elementalClass!, lvl),
        );
      }
    }
  });

  it("elementalLadderMaxHit is the highest unlocked tier of the class", () => {
    expect(elementalLadderMaxHit("Wave", 62)).toBe(17);
    expect(elementalLadderMaxHit("Wave", 65)).toBe(18);
    expect(elementalLadderMaxHit("Wave", 70)).toBe(19);
    expect(elementalLadderMaxHit("Wave", 75)).toBe(20);
  });

  it("non-elemental spells are unchanged", () => {
    expect(spellMaxHit(spell("Iban Blast"), 99)).toBe(25);
    expect(spellMaxHit(spell("Magic Dart"), 99)).toBe(19);
    expect(spellMaxHit(spell("Ice Barrage"), 99)).toBe(30);
    expect(spellMaxHit(spell("Crumble Undead"), 99)).toBe(15);
    expect(spellMaxHit(spell("Dark Demonbane"), 99)).toBe(30);
    expect(spellMaxHit(spell("Saradomin Strike"), 99)).toBe(20);
  });

  it("no consumer reads a spell's baseMaxHit directly (everything goes through spellMaxHit)", () => {
    // baseMaxHit is only the elemental spells' nominal tier now; reading it would
    // silently reintroduce the pre-ladder values. Only the catalog (and the
    // oracle script that maps nominal tiers to wiki spell names) may touch it.
    const root = path.resolve(__dirname, "..");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) {
          if (name === "node_modules" || name === ".next" || name === "vendor") continue;
          walk(p);
        } else if (/\.(ts|tsx)$/.test(name)) {
          const rel = path.relative(root, p).split(path.sep).join("/");
          if (rel === "data/spells/catalog.ts") continue;
          if (/\bbaseMaxHit\b/.test(readFileSync(p, "utf8"))) offenders.push(rel);
        }
      }
    };
    for (const d of ["lib", "components", "app", "data", "types"]) walk(path.join(root, d));
    expect(offenders).toEqual([]);
  });
});

// ---- 2. the engine ----------------------------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1,
  strengthMultiplier: 1,
  rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1,
  magicAttackMultiplier: 1,
  magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};

/** A bare magic scenario (no gear, no prayer) — upstream's "test monster" setup. */
function magicScenario(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic",
    attackStyle: "accurate",
    prayers: NO_PRAYER,
    skills: { attack: 1, strength: 1, defence: 1, ranged: 1, magic: 99, hitpoints: 99, prayer: 99 },
    attackBonus: 0,
    strengthBonus: 0,
    magicDamagePercent: 0,
    baseSpellMaxHit: 8, // Wind Strike at 99
    spellElement: "air",
    attackSpeedTicks: 5,
    targetDefenceLevel: 1,
    targetDefenceBonusForStyle: 0,
    ...over,
  };
}

describe("engine — elementalSpellFlatBonus (replicates upstream ElementalSpells test)", () => {
  it("Wind Strike at 99: 8 without an amulet, 10 with the +2", () => {
    expect(calculateDps(magicScenario()).maxHit).toBe(8);
    expect(calculateDps(magicScenario({ elementalSpellFlatBonus: 2 })).maxHit).toBe(10);
  });

  it("with a 100% air weakness: 16 without, 20 with (the +2 is inside the weakness base)", () => {
    const weak = { element: "air" as const, severity: 100 };
    expect(calculateDps(magicScenario({ targetWeakness: weak })).maxHit).toBe(16);
    expect(
      calculateDps(magicScenario({ targetWeakness: weak, elementalSpellFlatBonus: 2 })).maxHit,
    ).toBe(20);
  });

  it("the +2 is MULTIPLIED by the magic damage % (base 24 + 2, x1.10 -> 28 vs 26)", () => {
    const base = { baseSpellMaxHit: 24, spellElement: "fire" as const, magicDamagePercent: 10 };
    expect(calculateDps(magicScenario(base)).maxHit).toBe(26); // trunc(24 x 1.10)
    expect(calculateDps(magicScenario({ ...base, elementalSpellFlatBonus: 2 })).maxHit).toBe(28); // trunc(26 x 1.10)
  });

  it("damage % and weakness together: 24+2=26 -> x1.10 = 28 -> +trunc(26 x 50%) = 41 (vs 26 + 12 = 38)", () => {
    const base = {
      baseSpellMaxHit: 24,
      spellElement: "fire" as const,
      magicDamagePercent: 10,
      targetWeakness: { element: "fire" as const, severity: 50 },
    };
    expect(calculateDps(magicScenario(base)).maxHit).toBe(26 + 12); // 26 = trunc(24 x 1.10); weakness off the unboosted base 24
    expect(calculateDps(magicScenario({ ...base, elementalSpellFlatBonus: 2 })).maxHit).toBe(28 + 13);
  });

  it("the tome multiplies the amulet-inclusive hit (tome of water, base 24: 24+2 -> x6/5 = 31, not 24 x 6/5 + 2 = 30)", () => {
    const base = { baseSpellMaxHit: 24, spellElement: "water" as const, tomeOfWaterEquipped: true };
    expect(calculateDps(magicScenario(base)).maxHit).toBe(28); // trunc(24 x 6/5)
    expect(calculateDps(magicScenario({ ...base, elementalSpellFlatBonus: 2 })).maxHit).toBe(31); // trunc(26 x 6/5)
  });

  it("flows into the Twinflame casts (Fire Wave 20+2 -> x11/10 -> x7/5 = 33 vs 30)", () => {
    const base = {
      baseSpellMaxHit: 20,
      spellElement: "fire" as const,
      twinflameStandard: true,
      twinflameDoubleCast: true,
    };
    expect(calculateDps(magicScenario(base)).maxHit).toBe(30);
    expect(calculateDps(magicScenario({ ...base, elementalSpellFlatBonus: 2 })).maxHit).toBe(33); // trunc(trunc(22 x 1.1) x 1.4) = trunc(24 x 1.4)
  });

  it("accuracy is unaffected (the +10 magic attack is a normal item stat)", () => {
    const off = calculateDps(magicScenario({ attackBonus: 10 }));
    const on = calculateDps(magicScenario({ attackBonus: 10, elementalSpellFlatBonus: 2 }));
    expect(on.accuracy).toBe(off.accuracy);
  });

  it("does nothing without a spell element or a spell (powered staves / zero-damage spells)", () => {
    expect(
      calculateDps(magicScenario({ spellElement: undefined, elementalSpellFlatBonus: 2 })).maxHit,
    ).toBe(8);
    expect(
      calculateDps(magicScenario({ spellElement: "none", elementalSpellFlatBonus: 2 })).maxHit,
    ).toBe(8);
    expect(
      calculateDps(magicScenario({ baseSpellMaxHit: 0, elementalSpellFlatBonus: 2 })).maxHit,
    ).toBe(0);
  });
});

// ---- 3. flags + resolution against the cast spell ---------------------------

const MUSPAH = MONSTER_BY_SLUG["phantom-muspah"]; // 65% air weakness
const KRIL = MONSTER_BY_SLUG["kril-tsutsaroth"]; // demon, 30% water weakness
const NEUTRAL: MonsterCatalogEntry = { ...MUSPAH, weakness: null };
const airWeak = (severity: number): MonsterCatalogEntry => ({
  ...MUSPAH,
  weakness: { element: "air", severity },
});

function scoreCast(
  itemIds: number[],
  target: MonsterCatalogEntry,
  spellName?: string,
  skills: Skills = SKILLS_AT_99,
) {
  const sp = spellName ? spell(spellName) : undefined;
  const scored = scoreScenario({
    itemIds,
    target,
    skills,
    baseSpellMaxHit: sp ? spellMaxHit(sp, skills.magic) : undefined,
    spellElement: sp?.element,
    autoSpellName: sp?.name,
  });
  if (!scored.valid) throw new Error(`invalid scenario: ${scored.reasons.join("; ")}`);
  return scored;
}

describe("flag derivation and resolution against the cast spell", () => {
  it("elementalAmuletKind reads each amulet (and nothing else)", () => {
    expect(elementalAmuletKind(new Set([AMULET_OF_AIR]))).toBe("air");
    expect(elementalAmuletKind(new Set([AMULET_OF_WATER]))).toBe("water");
    expect(elementalAmuletKind(new Set([AMULET_OF_EARTH]))).toBe("earth");
    expect(elementalAmuletKind(new Set([AMULET_OF_FIRE]))).toBe("fire");
    expect(elementalAmuletKind(new Set([ELEMENTAL_AMULET]))).toBe("all");
    expect(elementalAmuletKind(new Set([OCCULT_NECKLACE, STAFF_OF_AIR]))).toBeUndefined();
    expect(ownedElementalAmuletIds(new Set([AMULET_OF_AIR, ELEMENTAL_AMULET, 1]))).toEqual([
      AMULET_OF_AIR,
      ELEMENTAL_AMULET,
    ]);
  });

  it("amuletBoostsElement: single amulets match only their own element, the Elemental amulet any", () => {
    expect(amuletBoostsElement("air", "air")).toBe(true);
    expect(amuletBoostsElement("air", "fire")).toBe(false);
    expect(amuletBoostsElement("all", "earth")).toBe(true);
    expect(amuletBoostsElement("all", "none")).toBe(false);
    expect(amuletBoostsElement("all", undefined)).toBe(false);
    expect(amuletBoostsElement(undefined, "air")).toBe(false);
  });

  it("the worn amulet is recorded on itemBonusFlags (optimizer scoring path and manual-edit path)", () => {
    const scored = scoreCast([STAFF_OF_AIR, AMULET_OF_WATER], NEUTRAL, "Water Surge");
    expect(scored.loadout.itemBonusFlags.elementalAmulet).toBe("water");

    const edited = applyOverrides(
      scoreCast([STAFF_OF_AIR], NEUTRAL, "Wind Strike").loadout,
      { neck: findCatalogItem(AMULET_OF_FIRE)! },
    );
    expect(edited.itemBonusFlags.elementalAmulet).toBe("fire");
  });

  it("Wind Strike at 99: max hit 8, with Amulet of air 10; 100% air weakness 16 -> 20", () => {
    const weak = airWeak(100);
    const spellName = "Wind Strike";
    // Default prayer is Augury (+4% magic dmg): floor(8 x 1.04) = 8, floor(10 x 1.04) = 10.
    expect(scoreCast([STAFF_OF_AIR], NEUTRAL, spellName).dps.maxHit).toBe(8);
    expect(scoreCast([STAFF_OF_AIR, AMULET_OF_AIR], NEUTRAL, spellName).dps.maxHit).toBe(10);
    expect(scoreCast([STAFF_OF_AIR], weak, spellName).dps.maxHit).toBe(16);
    expect(scoreCast([STAFF_OF_AIR, AMULET_OF_AIR], weak, spellName).dps.maxHit).toBe(20);
  });

  it("the Elemental amulet behaves the same on any element", () => {
    const weak = airWeak(100);
    expect(scoreCast([STAFF_OF_AIR, ELEMENTAL_AMULET], NEUTRAL, "Wind Strike").dps.maxHit).toBe(10);
    expect(scoreCast([STAFF_OF_AIR, ELEMENTAL_AMULET], weak, "Wind Strike").dps.maxHit).toBe(20);
    // ... and on Fire Strike (8 -> 10) even though its element isn't air.
    expect(scoreCast([STAFF_OF_FIRE, ELEMENTAL_AMULET], NEUTRAL, "Fire Strike").dps.maxHit).toBe(10);
  });

  it("an Amulet of fire does nothing for Wind Strike (element mismatch)", () => {
    const weak = airWeak(100);
    const scored = scoreCast([STAFF_OF_AIR, AMULET_OF_FIRE], weak, "Wind Strike");
    expect(scored.dps.maxHit).toBe(16);
    expect(scored.activeBonuses.elementalAmuletMaxHitBonus).toBe(0);
    // And it equals the no-amulet build's max hit exactly.
    expect(scored.dps.maxHit).toBe(scoreCast([STAFF_OF_AIR], weak, "Wind Strike").dps.maxHit);
  });

  it("matching amulet reports the +2 through activeBonusesForTarget", () => {
    const scored = scoreCast([STAFF_OF_WATER, AMULET_OF_WATER], NEUTRAL, "Water Surge");
    expect(scored.activeBonuses.elementalAmuletMaxHitBonus).toBe(2);
    expect(activeBonusesForTarget(scored.loadout, NEUTRAL).elementalAmuletMaxHitBonus).toBe(2);
  });

  it("powered staves are unaffected: Tumeken's shadow and the Trident of the Swamp ignore the amulet", () => {
    for (const weapon of [TUMEKENS_SHADOW, TRIDENT_OF_THE_SWAMP]) {
      const plain = scoreCast([weapon, OCCULT_NECKLACE], MUSPAH);
      const withAmulet = scoreCast([weapon, AMULET_OF_AIR], MUSPAH);
      const withElemental = scoreCast([weapon, ELEMENTAL_AMULET], MUSPAH);
      expect(withAmulet.loadout.spellElement).toBeUndefined();
      expect(withAmulet.loadout.itemBonusFlags.elementalAmulet).toBe("air");
      expect(withAmulet.activeBonuses.elementalAmuletMaxHitBonus).toBe(0);
      expect(withElemental.activeBonuses.elementalAmuletMaxHitBonus).toBe(0);
      // Neither the occult necklace nor the amulet carries magic damage into a
      // powered staff's formula here, so all three build identical max hits.
      expect(withAmulet.dps.maxHit).toBe(withElemental.dps.maxHit);
      expect(withAmulet.dps.maxHit).toBeGreaterThan(0);
      // The Occult necklace's +5% magic damage can only add, never the amulet.
      expect(plain.dps.maxHit).toBeGreaterThanOrEqual(withAmulet.dps.maxHit);
    }
  });

  it("Twinflame staff: the +2 flows into both casts (Fire Wave 20+2 -> 24 -> 33, vs 30)", () => {
    // End-to-end through computeSetDps (twinflameStandard + double cast are
    // resolved from the weapon id and the spell name).
    const plain = scoreCast([TWINFLAME_STAFF], NEUTRAL, "Fire Wave");
    const amulet = scoreCast([TWINFLAME_STAFF, AMULET_OF_FIRE], NEUTRAL, "Fire Wave");
    expect(plain.dps.maxHit).toBe(30);
    expect(amulet.dps.maxHit).toBe(33);
  });

  it("non-elemental spells never get the +2 (Ice Barrage, Iban Blast)", () => {
    const base = scoreCast([4675 /* Ancient staff */, OCCULT_NECKLACE], NEUTRAL, "Ice Barrage");
    const withAmulet = scoreCast([4675, AMULET_OF_AIR], NEUTRAL, "Ice Barrage");
    expect(withAmulet.activeBonuses.elementalAmuletMaxHitBonus).toBe(0);
    // Same base 30; only the occult necklace's damage % differs, so the amulet build is not higher.
    expect(withAmulet.dps.maxHit).toBeLessThanOrEqual(base.dps.maxHit);
  });

  it("a melee loadout carrying an amulet resolves to no bonus", () => {
    const melee = scoreScenario({
      itemIds: [ABYSSAL_WHIP, AMULET_OF_AIR],
      target: NEUTRAL,
      skills: SKILLS_AT_99,
    });
    expect(melee.valid).toBe(true);
    if (melee.valid) expect(melee.activeBonuses.elementalAmuletMaxHitBonus).toBe(0);
  });

  it("manual gear edit: swapping the neck to the matching amulet adds the +2 without re-picking the spell", () => {
    const base = scoreCast([STAFF_OF_AIR, OCCULT_NECKLACE], airWeak(100), "Wind Strike");
    const target = airWeak(100);
    const before = computeSetDps(base.loadout, target, SKILLS_AT_99);
    const edited = applyOverrides(base.loadout, { neck: findCatalogItem(AMULET_OF_AIR)! });
    const after = computeSetDps(edited, target, SKILLS_AT_99);
    expect(edited.autoSpellName).toBe("Wind Strike");
    // Occult necklace's +5% damage: floor(8 x 1.09) = 8 -> 8 + 8 = 16 before; amulet: 10 -> 20.
    expect(before.maxHit).toBe(16);
    expect(after.maxHit).toBe(20);
  });
});

// ---- 4. element-aware spell selection ---------------------------------------

describe("bestSpell — elemental amulet and target weakness decide the element", () => {
  // A Standard-only staff (the common case): an Ancient-capable weapon would
  // simply pick Ice Barrage (30) over any un-weakened Surge.
  const ctx = {
    magicLevel: 99,
    targetAttributes: [] as string[],
    allowedSpellbooks: ["standard" as const],
  };

  it("magic 99 + Amulet of water -> Water Surge", () => {
    for (const [kind, expected] of [
      ["air", "Wind Surge"],
      ["water", "Water Surge"],
      ["earth", "Earth Surge"],
      ["fire", "Fire Surge"],
    ] as const) {
      expect(bestSpell({ ...ctx, elementalAmulet: kind })?.name).toBe(expected);
    }
  });

  it("a target weak to earth -> Earth Surge, with no amulet or any single amulet", () => {
    const weakness = { element: "earth", severity: 35 };
    expect(bestSpell({ ...ctx, targetWeakness: weakness })?.name).toBe("Earth Surge");
    for (const kind of ["air", "water", "fire", "all"] as const) {
      expect(bestSpell({ ...ctx, targetWeakness: weakness, elementalAmulet: kind })?.name).toBe(
        "Earth Surge",
      );
    }
  });

  it("Tome of Fire, no amulet, no weakness -> Fire Surge still", () => {
    expect(bestSpell({ ...ctx, tomeOfFire: true })?.name).toBe("Fire Surge");
  });

  it("nothing distinguishing the elements -> Fire Surge (the default tie-break)", () => {
    expect(bestSpell(ctx)?.name).toBe("Fire Surge");
    expect(bestSpell({ ...ctx, targetWeakness: null })?.name).toBe("Fire Surge");
    // The Elemental amulet lifts all four equally, so it still ties to Fire.
    expect(bestSpell({ ...ctx, elementalAmulet: "all" })?.name).toBe("Fire Surge");
    // Twinflame (Standard-only) is unaffected too apart from its own Wave pick.
    expect(bestSpell({ ...ctx, twinflame: true })?.name).toBe("Fire Wave");
  });

  it("amulet +2 and the weakness bonus stack: Wind Surge beats Earth Surge on a small earth weakness only with the Amulet of air", () => {
    // Earth Surge vs 5% earth weakness: 24 + trunc(24 x 5/100) = 25; Wind Surge + Amulet of air = 26.
    const weakness = { element: "earth", severity: 5 };
    expect(bestSpell({ ...ctx, targetWeakness: weakness })?.name).toBe("Earth Surge");
    expect(bestSpell({ ...ctx, targetWeakness: weakness, elementalAmulet: "air" })?.name).toBe(
      "Wind Surge",
    );
  });

  it("ranking order: amulet +2 on the base, then weakness off that base, then the tome", () => {
    const waterSurge = spell("Water Surge");
    const eff = (extra: object) => spellEffectiveMaxHit(waterSurge, { ...ctx, ...extra });
    expect(eff({})).toBe(24);
    expect(eff({ elementalAmulet: "water" })).toBe(26);
    expect(eff({ elementalAmulet: "fire" })).toBe(24); // mismatched amulet
    expect(eff({ elementalAmulet: "all" })).toBe(26);
    expect(eff({ elementalAmulet: "water", targetWeakness: { element: "water", severity: 50 } })).toBe(
      26 + 13,
    );
    expect(eff({ elementalAmulet: "water", tomeOfWater: true })).toBe(31); // trunc(26 x 6/5), not 28 + 2
    expect(
      eff({
        elementalAmulet: "water",
        targetWeakness: { element: "water", severity: 50 },
        tomeOfWater: true,
      }),
    ).toBe(46); // trunc(39 x 6/5)
    // A weakness to another element, or "none", is ignored.
    expect(eff({ targetWeakness: { element: "fire", severity: 90 } })).toBe(24);
    expect(eff({ targetWeakness: { element: "none", severity: 90 } })).toBe(24);
  });

  it("ancient/arceuus/special spells never take the amulet or weakness", () => {
    const barrage = spell("Ice Barrage");
    expect(spellEffectiveMaxHit(barrage, { ...ctx, elementalAmulet: "all" })).toBe(30);
    expect(
      spellEffectiveMaxHit(barrage, { ...ctx, targetWeakness: { element: "none", severity: 50 } }),
    ).toBe(30);
  });

  it("below 95 Magic the ladder still orders the classes (Wave beats Blast) and weakness can promote a lower class", () => {
    expect(bestSpell({ magicLevel: 81, targetAttributes: [], allowedSpellbooks: ["standard"] })?.name).toBe(
      "Wind Surge",
    ); // Surge 21 > Fire Wave 20
    expect(
      bestSpell({
        magicLevel: 81,
        targetAttributes: [],
        allowedSpellbooks: ["standard"],
        targetWeakness: { element: "earth", severity: 35 },
      })?.name,
    ).toBe("Earth Wave"); // 20 + 7 = 27 > 21
  });

  it("autoPickSpell wires the worn amulet and the target's weakness into the pick", () => {
    const weapon = findCatalogItem(STAFF_OF_AIR)!;
    const pick = (ids: number[], target: MonsterCatalogEntry) =>
      autoPickSpell(weapon, ids, "magic", 99, target);
    expect(pick([STAFF_OF_AIR], NEUTRAL).autoSpellName).toBe("Fire Surge");
    expect(pick([STAFF_OF_AIR, AMULET_OF_WATER], NEUTRAL).autoSpellName).toBe("Water Surge");
    expect(pick([STAFF_OF_AIR, AMULET_OF_WATER], NEUTRAL).baseSpellMaxHit).toBe(24);
    expect(pick([STAFF_OF_AIR], MUSPAH).autoSpellName).toBe("Wind Surge"); // air-weak target
    expect(pick([STAFF_OF_AIR, TOME_OF_FIRE], NEUTRAL).autoSpellName).toBe("Fire Surge");
  });
});

// ---- 5. optimizer force-includes --------------------------------------------

/** Rebuild the optimizer's top magic set with a different neck item. */
function dpsWithNeck(
  gear: number[],
  neckId: number,
  target: MonsterCatalogEntry,
  style: { attackType: "magic"; choice: "longrange" } = { attackType: "magic", choice: "longrange" },
): number {
  const ids = [...gear, neckId];
  const weapon = findCatalogItem(gear[0])!;
  const sp = autoPickSpell(weapon, ids, "magic", 99, target);
  const scored = scoreScenario({
    itemIds: ids,
    target,
    skills: SKILLS_AT_99,
    attackStyle: style,
    baseSpellMaxHit: sp.baseSpellMaxHit,
    spellElement: sp.spellElement,
    autoSpellName: sp.autoSpellName,
  });
  if (!scored.valid) throw new Error(scored.reasons.join("; "));
  return scored.dps.dps;
}

describe("optimizer — elemental amulets are force-included for magic builds", () => {
  const MAGE_GEAR = [STAFF_OF_AIR, ...ANCESTRAL];

  it("Amulet of air + Occult necklace vs a big air weakness: the amulet and Wind Surge win", () => {
    expect(MUSPAH.weakness).toEqual({ element: "air", severity: 65 });
    const { rankings } = optimizeForBoss({
      bank: [...MAGE_GEAR, OCCULT_NECKLACE, AMULET_OF_AIR],
      target: MUSPAH,
      skills: SKILLS_AT_99,
    });
    const top = rankings[0];
    expect(top.loadout.style).toBe("magic");
    expect(top.loadout.slots.neck?.itemId).toBe(AMULET_OF_AIR);
    expect(top.loadout.autoSpellName).toBe("Wind Surge");
    expect(top.activeBonuses.elementalAmuletMaxHitBonus).toBe(2);
    // The amulet build really is the better one by actual DPS.
    expect(dpsWithNeck(MAGE_GEAR, AMULET_OF_AIR, MUSPAH)).toBeGreaterThan(
      dpsWithNeck(MAGE_GEAR, OCCULT_NECKLACE, MUSPAH),
    );
  });

  it("vs a neutral target the optimizer keeps whichever neck has the higher computed DPS", () => {
    for (const amulet of [AMULET_OF_AIR, AMULET_OF_FIRE, ELEMENTAL_AMULET]) {
      const { rankings } = optimizeForBoss({
        bank: [...MAGE_GEAR, OCCULT_NECKLACE, amulet],
        target: NEUTRAL,
        skills: SKILLS_AT_99,
      });
      const top = rankings[0];
      const amuletDps = dpsWithNeck(MAGE_GEAR, amulet, NEUTRAL);
      const occultDps = dpsWithNeck(MAGE_GEAR, OCCULT_NECKLACE, NEUTRAL);
      // The optimizer scored both necks, so it can never do worse than either.
      expect(top.dps.dps).toBeGreaterThanOrEqual(Math.max(amuletDps, occultDps) - 1e-9);
      if (Math.abs(amuletDps - occultDps) > 1e-6) {
        expect(top.loadout.slots.neck?.itemId).toBe(amuletDps > occultDps ? amulet : OCCULT_NECKLACE);
      }
    }
  });

  it("composes with the elemental tome: Tome of Water + Amulet of water + Occult necklace", () => {
    const gear = [STAFF_OF_WATER, ...ANCESTRAL];
    // Mage's book (6889) wins the greedy shield pick, so the tome only enters via
    // its own force-include branch — the amulet pass must build on top of it.
    const MAGES_BOOK = 6889;
    const bank = [...gear, OCCULT_NECKLACE, AMULET_OF_WATER, TOME_OF_WATER, MAGES_BOOK];
    const { rankings } = optimizeForBoss({ bank, target: KRIL, skills: SKILLS_AT_99 });
    const manual = scoreCast([...gear, AMULET_OF_WATER, TOME_OF_WATER], KRIL, "Water Surge");
    // The manual tome + amulet build is a legal candidate, so the optimizer's best
    // can never be worse (it would be if the amulet pass ignored tome branches).
    expect(rankings[0].dps.dps).toBeGreaterThanOrEqual(manual.dps.dps - 1e-9);
  });

  it("is only forced onto magic builds that autocast: powered staves never branch on the amulet", () => {
    const without = optimizeForBoss({
      bank: [TUMEKENS_SHADOW, ...ANCESTRAL, OCCULT_NECKLACE],
      target: MUSPAH,
      skills: SKILLS_AT_99,
    });
    const withAmulet = optimizeForBoss({
      bank: [TUMEKENS_SHADOW, ...ANCESTRAL, OCCULT_NECKLACE, AMULET_OF_AIR],
      target: MUSPAH,
      skills: SKILLS_AT_99,
    });
    expect(withAmulet.diagnostics.candidatesGenerated).toBe(without.diagnostics.candidatesGenerated);
    expect(withAmulet.rankings[0].loadout.slots.neck?.itemId).toBe(OCCULT_NECKLACE);
  });

  it("a staff DOES branch on the amulet (positive control for the candidate count)", () => {
    const without = optimizeForBoss({
      bank: [...MAGE_GEAR, OCCULT_NECKLACE],
      target: MUSPAH,
      skills: SKILLS_AT_99,
    });
    const withAmulet = optimizeForBoss({
      bank: [...MAGE_GEAR, OCCULT_NECKLACE, AMULET_OF_AIR],
      target: MUSPAH,
      skills: SKILLS_AT_99,
    });
    expect(withAmulet.diagnostics.candidatesGenerated).toBeGreaterThan(
      without.diagnostics.candidatesGenerated,
    );
  });

  it("amuletCanMatter gates by combat style, autocast ability and castable element", () => {
    const staff = findCatalogItem(STAFF_OF_AIR)!;
    const shadow = findCatalogItem(TUMEKENS_SHADOW)!;
    expect(amuletCanMatter({ weapon: staff, combatStyle: "magic" }, "air", 99)).toBe(true);
    expect(amuletCanMatter({ weapon: staff, combatStyle: "melee" }, "air", 99)).toBe(false);
    expect(amuletCanMatter({ weapon: shadow, combatStyle: "magic" }, "air", 99)).toBe(false);
    expect(amuletCanMatter({ weapon: staff, combatStyle: "magic" }, "fire", 12)).toBe(false); // Fire Strike needs 13
    expect(amuletCanMatter({ weapon: staff, combatStyle: "magic" }, "fire", 13)).toBe(true);
    expect(amuletCanMatter({ weapon: staff, combatStyle: "magic" }, "all", 1)).toBe(true); // Wind Strike
    expect(canCastElement("water", 4)).toBe(false);
    expect(canCastElement("water", 5)).toBe(true);
    expect(canCastElement("none", 99)).toBe(false);
  });

  it("budget builder: an affordable Amulet of air is considered and wins vs a big air weakness", () => {
    const prices: Record<number, number> = {
      [STAFF_OF_AIR]: 1_000,
      [OCCULT_NECKLACE]: 1_000_000,
      [AMULET_OF_AIR]: 500_000,
      21018: 500_000,
      21021: 500_000,
      21024: 500_000,
    };
    const result = bestLoadoutForBudget({
      target: MUSPAH,
      skills: SKILLS_AT_99,
      gp: 100_000_000,
      priceLookup: (id) => prices[id] ?? null,
    });
    const built = result.upgradedBest!.loadout;
    expect(built.style).toBe("magic");
    expect(built.slots.neck?.itemId).toBe(AMULET_OF_AIR);
    expect(built.autoSpellName).toBe("Wind Surge");
    expect(result.upgradedBest!.dps.dps).toBeGreaterThanOrEqual(
      dpsWithNeck([STAFF_OF_AIR, ...ANCESTRAL], OCCULT_NECKLACE, MUSPAH) - 1e-9,
    );
  });
});

// ---- 6. display --------------------------------------------------------------

describe("display — explain line and results-panel flag", () => {
  const explainNeck = (itemIds: number[], target: MonsterCatalogEntry, spellName: string) => {
    const scored = scoreCast(itemIds, target, spellName);
    const details = explainSlots(
      scored.loadout,
      scored.dps,
      target,
      SKILLS_AT_99,
      undefined,
      scored.activeBonuses,
    );
    return { scored, reasons: details.neck?.reasons ?? [] };
  };

  it("neck tooltip shows the +2 for a matching element and nothing for a mismatched one", () => {
    const match = explainNeck([STAFF_OF_WATER, AMULET_OF_WATER], NEUTRAL, "Water Surge");
    expect(match.reasons).toContain("+2 max hit on water spells");

    const mismatch = explainNeck([STAFF_OF_WATER, AMULET_OF_FIRE], NEUTRAL, "Water Surge");
    expect(mismatch.reasons.some((r) => /max hit/.test(r))).toBe(false);

    const elemental = explainNeck([STAFF_OF_EARTH, ELEMENTAL_AMULET], NEUTRAL, "Earth Surge");
    expect(elemental.reasons).toContain("+2 max hit on earth spells");

    const none = explainNeck([STAFF_OF_WATER, OCCULT_NECKLACE], NEUTRAL, "Water Surge");
    expect(none.reasons.some((r) => /max hit/.test(r))).toBe(false);
  });

  it("results-panel flag names the amulet and element when active, and is absent otherwise", () => {
    const match = scoreCast([STAFF_OF_WATER, AMULET_OF_WATER], NEUTRAL, "Water Surge");
    expect(buildActiveFlags(match.loadout, match.activeBonuses)).toContain(
      "Amulet of water: +2 max hit on water spells",
    );
    const elemental = scoreCast([STAFF_OF_FIRE, ELEMENTAL_AMULET], NEUTRAL, "Fire Surge");
    expect(buildActiveFlags(elemental.loadout, elemental.activeBonuses)).toContain(
      "Elemental amulet: +2 max hit on fire spells",
    );
    const mismatch = scoreCast([STAFF_OF_WATER, AMULET_OF_FIRE], NEUTRAL, "Water Surge");
    expect(buildActiveFlags(mismatch.loadout, mismatch.activeBonuses).some((f) => /max hit/.test(f))).toBe(
      false,
    );
    const powered = scoreCast([TUMEKENS_SHADOW, AMULET_OF_FIRE], NEUTRAL);
    expect(buildActiveFlags(powered.loadout, powered.activeBonuses).some((f) => /max hit/.test(f))).toBe(
      false,
    );
  });
});

describe("display — demonbane strings are scaled per monster", () => {
  const duke = MONSTER_BY_SLUG["duke-sucellus"]; // vulnerability 70
  const yama = MONSTER_BY_SLUG["yama"]; // 120
  const arclight = (target: MonsterCatalogEntry) => {
    const scored = scoreScenario({ itemIds: [ARCLIGHT], target, skills: SKILLS_AT_99 });
    if (!scored.valid) throw new Error(scored.reasons.join("; "));
    const details = explainSlots(
      scored.loadout,
      scored.dps,
      target,
      SKILLS_AT_99,
      undefined,
      scored.activeBonuses,
    );
    return { scored, weaponReasons: details.weapon?.reasons ?? [] };
  };

  it("loadout tooltip: Arclight is +70% vs a normal demon, +49% vs Duke Sucellus, +84% vs Yama", () => {
    expect(arclight(KRIL).weaponReasons).toContain("+70% accuracy & damage vs this demon");
    expect(arclight(duke).weaponReasons).toContain("+49% accuracy & damage vs this demon");
    expect(arclight(yama).weaponReasons).toContain("+84% accuracy & damage vs this demon");
    // No stale hard-coded 70% line at Duke.
    expect(arclight(duke).weaponReasons).not.toContain("+70% accuracy & damage vs this demon");
  });

  it("results-panel flag shows the scaled percent, or neutral wording without a target", () => {
    const { scored } = arclight(duke);
    expect(buildActiveFlags(scored.loadout, scored.activeBonuses, 70)).toContain("Demonbane +49%");
    expect(buildActiveFlags(scored.loadout, scored.activeBonuses, 100)).toContain("Demonbane +70%");
    expect(buildActiveFlags(scored.loadout, scored.activeBonuses, 120)).toContain("Demonbane +84%");
    const neutral = buildActiveFlags(scored.loadout, scored.activeBonuses);
    expect(neutral).toContain("Demonbane");
    expect(neutral.some((f) => /\+\d+%/.test(f) && f.startsWith("Demonbane"))).toBe(false);
  });

  it("silverlight / claws / scorching-bow tooltip lines scale the same way", () => {
    const silverlight = scoreScenario({ itemIds: [2402], target: duke, skills: SKILLS_AT_99 });
    if (!silverlight.valid) throw new Error(silverlight.reasons.join("; "));
    const details = explainSlots(
      silverlight.loadout,
      silverlight.dps,
      duke,
      SKILLS_AT_99,
      undefined,
      silverlight.activeBonuses,
    );
    expect(details.weapon?.reasons).toContain("+42% accuracy & damage vs this demon"); // trunc(60 x 70/100)
  });
});

// Keep an unused-import guard honest: SALVE_EI proves the new flag does not
// disturb the existing neck-slot reasons.
describe("existing neck reasons are untouched", () => {
  it("Salve (ei) vs undead still explains its +20% and shows no elemental line", () => {
    const vorkath = MONSTER_BY_SLUG["vorkath"];
    const scored = scoreScenario({
      itemIds: [STAFF_OF_FIRE, SALVE_EI],
      target: vorkath,
      skills: SKILLS_AT_99,
      baseSpellMaxHit: 24,
      spellElement: "fire",
      autoSpellName: "Fire Surge",
    });
    expect(scored.valid).toBe(true);
    if (!scored.valid) return;
    const details = explainSlots(
      scored.loadout,
      scored.dps,
      vorkath,
      SKILLS_AT_99,
      undefined,
      scored.activeBonuses,
    );
    expect(details.neck?.reasons).toContain("+20% accuracy & damage vs this undead target");
    expect(details.neck?.reasons.some((r) => /max hit/.test(r))).toBe(false);
  });
});
