// Leafy monsters (Turoth / Kurask family) — regression tests for the 2026-10
// leaf-bladed model. Upstream weirdgloop/osrs-dps-calc (89c3e25, 2026-09-02):
//   - isImmune: a LEAFY target takes no damage unless isWearingLeafBladedWeapon
//     — a Leaf-bladed battleaxe/spear/sword on a melee style, broad ammo
//     (Broad arrows/bolts, Amethyst broad bolts, Seeking broad arrows — #967)
//     on a ranged style, or the Magic Dart spell.
//   - MAX_HIT_LEAFY: the Leaf-bladed battleaxe deals ×47/40 (+17.5%) to them.
// Wiki: https://oldschool.runescape.wiki/w/Leafy_(attribute)
//
// Before this, the engine had no leafy handling: every weapon did full damage
// to a Kurask, and the battleaxe got no bonus.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG, type MonsterCatalogEntry } from "@/data/monsters/catalog";
import { ITEM_CATALOG } from "@/data/items/catalog";
import {
  BROAD_AMMO_IDS,
  LEAF_BLADED_BATTLEAXE_ID,
  LEAF_BLADED_MELEE_WEAPON_IDS,
} from "@/data/items/leaf-bladed";
import { conditionalMultipliers } from "@/lib/dps/conditional";
import { canDamageLeafy } from "@/lib/loadout";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { autoPickSpell, optimizeForBoss } from "@/lib/optimize/bank";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";
import { explainSlots } from "@/lib/loadout-explain";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { buildActiveFlags } from "@/components/ResultsPanel";
import type { AttackStyleChoice, WeaponAttackType } from "@/types/osrs";
import type { LoadoutSet } from "@/types/loadout";

const KURASK = MONSTER_BY_SLUG["kurask"];
const TUROTH = MONSTER_BY_SLUG["turoth"];
/** The same Kurask without the leafy attribute — the "no leafy rules" baseline. */
const PLAIN_KURASK: MonsterCatalogEntry = {
  ...KURASK,
  attributes: KURASK.attributes.filter((a) => a !== "leafy"),
};

const ABYSSAL_WHIP = 4151;
const LEAF_BLADED_SWORD = 11902;
const LEAF_BLADED_SPEAR = 4158;
const RUNE_CROSSBOW = 9185;
const RUNITE_BOLTS = 9144;
const RUBY_BOLTS_E = 9242;
const BROAD_BOLTS = 11875;
const BROAD_ARROWS = 4160;
const MAGIC_SHORTBOW_I = 12788;
const SEEKING_BROAD_ARROWS = 33601;
const TOXIC_BLOWPIPE = 12926;
const SLAYERS_STAFF = 4170;
const STAFF_OF_FIRE = 1387;

const ITEM = new Map(ITEM_CATALOG.map((i) => [i.id, i]));

function score(
  itemIds: number[],
  target: MonsterCatalogEntry,
  extra: {
    attackStyle?: { attackType: WeaponAttackType; choice: AttackStyleChoice };
    baseSpellMaxHit?: number;
    spellElement?: "none" | "fire";
    autoSpellName?: string;
  } = {},
) {
  const scored = scoreScenario({ itemIds, target, skills: SKILLS_AT_99, ...extra });
  if (!scored.valid) throw new Error(scored.reasons.join("; "));
  return scored;
}

const SLASH = { attackType: "slash" as const, choice: "aggressive" as const };

describe("leafy data", () => {
  it("the leafy monsters carry the attribute", () => {
    for (const slug of ["kurask", "king-kurask", "turoth", "spiked-turoth"]) {
      expect(MONSTER_BY_SLUG[slug]?.attributes, slug).toContain("leafy");
    }
  });

  it("every leaf-bladed / broad id resolves to the item it claims to be", () => {
    const names = (ids: Iterable<number>) => [...ids].map((id) => ITEM.get(id)?.name).sort();
    expect(names(LEAF_BLADED_MELEE_WEAPON_IDS)).toEqual([
      "Leaf-bladed battleaxe",
      "Leaf-bladed spear",
      "Leaf-bladed sword",
    ]);
    expect(ITEM.get(LEAF_BLADED_BATTLEAXE_ID)?.name).toBe("Leaf-bladed battleaxe");
    expect(names(BROAD_AMMO_IDS)).toEqual([
      "Amethyst broad bolts",
      "Broad arrows",
      "Broad bolts",
      "Seeking broad arrows",
    ]);
  });

  it("the battleaxe factor is ×47/40 damage only", () => {
    const m = conditionalMultipliers({ leafBladedBattleaxe: true });
    expect(m.accuracy).toEqual([]);
    expect(m.damage).toEqual([expect.objectContaining({ numerator: 47, denominator: 40 })]);
  });
});

describe("leafy immunity — melee", () => {
  it("an Abyssal whip deals nothing to a Kurask (it does vs the non-leafy baseline)", () => {
    const leafy = score([ABYSSAL_WHIP], KURASK);
    expect(leafy.activeBonuses.leafyImmune).toBe(true);
    expect(leafy.dps.dps).toBe(0);
    expect(leafy.dps.maxHit).toBe(0);
    expect(leafy.dps.accuracy).toBeGreaterThan(0); // the roll still happens
    expect(score([ABYSSAL_WHIP], PLAIN_KURASK).dps.dps).toBeGreaterThan(0);
  });

  it("the Leaf-bladed sword and spear hurt it, with no damage bonus", () => {
    for (const id of [LEAF_BLADED_SWORD, LEAF_BLADED_SPEAR]) {
      const leafy = score([id], KURASK);
      const plain = score([id], PLAIN_KURASK);
      expect(leafy.activeBonuses.leafyImmune, String(id)).toBe(false);
      expect(leafy.dps.maxHit, String(id)).toBe(plain.dps.maxHit);
      expect(leafy.dps.dps, String(id)).toBeCloseTo(plain.dps.dps, 12);
    }
  });

  it("the Leaf-bladed battleaxe gets ×47/40: 32 -> 37", () => {
    // Piety (×1.23), aggressive: eff str floor(99 × 1.23) + 3 + 8 = 132;
    // floor(0.5 + 132 × (92 + 64) / 640) = 32; trunc(32 × 47/40) = 37.
    expect(score([LEAF_BLADED_BATTLEAXE_ID], PLAIN_KURASK, { attackStyle: SLASH }).dps.maxHit).toBe(32);
    const leafy = score([LEAF_BLADED_BATTLEAXE_ID], KURASK, { attackStyle: SLASH });
    expect(leafy.activeBonuses.conditionalBonuses.leafBladedBattleaxe).toBe(true);
    expect(leafy.dps.maxHit).toBe(37);
  });

  it("the battleaxe bonus is leafy-only", () => {
    const plain = score([LEAF_BLADED_BATTLEAXE_ID], PLAIN_KURASK, { attackStyle: SLASH });
    expect(plain.activeBonuses.conditionalBonuses.leafBladedBattleaxe).toBe(false);
  });
});

describe("leafy immunity — ranged", () => {
  it("Rune crossbow: Broad bolts hurt a Kurask, Runite bolts don't", () => {
    expect(score([RUNE_CROSSBOW, BROAD_BOLTS], KURASK).dps.dps).toBeGreaterThan(0);
    const runite = score([RUNE_CROSSBOW, RUNITE_BOLTS], KURASK);
    expect(runite.activeBonuses.leafyImmune).toBe(true);
    expect(runite.dps.dps).toBe(0);
  });

  it("an enchanted bolt's proc does not leak damage through the immunity (Ruby bolts (e))", () => {
    // The Ruby proc hits for 20% of the target's HP regardless of max hit, so
    // zeroing only the max hit would leave it standing.
    expect(score([RUNE_CROSSBOW, RUBY_BOLTS_E], PLAIN_KURASK).dps.dps).toBeGreaterThan(0);
    expect(score([RUNE_CROSSBOW, RUBY_BOLTS_E], KURASK).dps.dps).toBe(0);
  });

  it("Seeking broad arrows count (upstream #967)", () => {
    expect(score([MAGIC_SHORTBOW_I, SEEKING_BROAD_ARROWS], TUROTH).dps.dps).toBeGreaterThan(0);
    expect(score([MAGIC_SHORTBOW_I, BROAD_ARROWS], TUROTH).dps.dps).toBeGreaterThan(0);
  });

  it("broad ammo must be fired by the weapon (blowpipe / wrong ammo class don't count)", () => {
    const set = (weaponId: number, category: string, ammoId: number): LoadoutSet => ({
      id: "t",
      name: "t",
      style: "ranged",
      tier: "end",
      attackType: "ranged",
      attackStyleChoice: "rapid",
      slots: {
        weapon: { itemId: weaponId, itemName: ITEM.get(weaponId)!.name },
        ammo: { itemId: ammoId, itemName: ITEM.get(ammoId)!.name },
      },
      totals: { attackBonus: 0, strengthBonus: 0, prayerBonus: 0 },
      attackSpeedTicks: 5,
      weaponCategory: category,
      itemBonusFlags: {} as LoadoutSet["itemBonusFlags"],
    });
    expect(canDamageLeafy(set(RUNE_CROSSBOW, "Crossbow", BROAD_BOLTS))).toBe(true);
    expect(canDamageLeafy(set(RUNE_CROSSBOW, "Crossbow", BROAD_ARROWS))).toBe(false); // arrows on a crossbow
    expect(canDamageLeafy(set(TOXIC_BLOWPIPE, ITEM.get(TOXIC_BLOWPIPE)!.category, BROAD_ARROWS))).toBe(false);
  });
});

describe("leafy immunity — magic", () => {
  it("Magic Dart hurts a Kurask; Fire Surge doesn't", () => {
    const dart = score([SLAYERS_STAFF], KURASK, {
      baseSpellMaxHit: 19,
      spellElement: "none",
      autoSpellName: "Magic Dart",
    });
    expect(dart.dps.dps).toBeGreaterThan(0);
    const surge = score([STAFF_OF_FIRE], KURASK, {
      baseSpellMaxHit: 24,
      spellElement: "fire",
      autoSpellName: "Fire Surge",
    });
    expect(surge.activeBonuses.leafyImmune).toBe(true);
    expect(surge.dps.dps).toBe(0);
  });

  it("the spell auto-pick casts Magic Dart from a Slayer's staff vs leafy targets only", () => {
    const staff = ITEM.get(SLAYERS_STAFF)!;
    const vsKurask = autoPickSpell(staff, [SLAYERS_STAFF], "magic", 99, KURASK);
    expect(vsKurask.autoSpellName).toBe("Magic Dart");
    expect(vsKurask.baseSpellMaxHit).toBe(19); // floor(99 / 10) + 10
    expect(autoPickSpell(staff, [SLAYERS_STAFF], "magic", 99, PLAIN_KURASK).autoSpellName).not.toBe(
      "Magic Dart",
    );
    // A staff that can't cast it keeps the normal pick (and is immune).
    expect(autoPickSpell(ITEM.get(STAFF_OF_FIRE)!, [STAFF_OF_FIRE], "magic", 99, KURASK).autoSpellName).not.toBe(
      "Magic Dart",
    );
  });
});

describe("leafy — optimizers", () => {
  it("bank: picks Broad bolts over the stronger Runite bolts and ranks the whip last", () => {
    const { rankings } = optimizeForBoss({
      bank: [ABYSSAL_WHIP, RUNE_CROSSBOW, RUNITE_BOLTS, BROAD_BOLTS],
      target: KURASK,
      skills: SKILLS_AT_99,
    });
    expect(rankings[0].dps.dps).toBeGreaterThan(0);
    expect(rankings[0].loadout.slots.weapon?.itemId).toBe(RUNE_CROSSBOW);
    expect(rankings[0].loadout.slots.ammo?.itemId).toBe(BROAD_BOLTS);
    for (const r of rankings) {
      if (r.loadout.slots.weapon?.itemId === ABYSSAL_WHIP) expect(r.dps.dps).toBe(0);
    }
  });

  it("bank: the Leaf-bladed sword beats a stronger whip", () => {
    const { rankings } = optimizeForBoss({
      bank: [ABYSSAL_WHIP, LEAF_BLADED_SWORD],
      target: KURASK,
      skills: SKILLS_AT_99,
    });
    expect(rankings[0].loadout.slots.weapon?.itemId).toBe(LEAF_BLADED_SWORD);
    expect(rankings[0].dps.dps).toBeGreaterThan(0);
  });

  it("bank: a Slayer's staff casts Magic Dart", () => {
    const { rankings } = optimizeForBoss({
      bank: [SLAYERS_STAFF, STAFF_OF_FIRE],
      target: KURASK,
      skills: SKILLS_AT_99,
    });
    const magic = rankings.find((r) => r.loadout.style === "magic" && r.dps.dps > 0);
    expect(magic?.loadout.slots.weapon?.itemId).toBe(SLAYERS_STAFF);
    expect(magic?.loadout.autoSpellName).toBe("Magic Dart");
  });

  it("budget: builds a loadout that can actually hurt a Kurask", () => {
    const prices: Record<number, number> = {
      [ABYSSAL_WHIP]: 1_500_000,
      [RUNE_CROSSBOW]: 10_000,
      [RUNITE_BOLTS]: 60,
      [BROAD_BOLTS]: 50,
      [LEAF_BLADED_SWORD]: 60_000,
    };
    const result = bestLoadoutForBudget({
      target: KURASK,
      skills: SKILLS_AT_99,
      gp: 2_000_000,
      priceLookup: (id) => prices[id] ?? null,
    });
    expect(result.upgradedBest).not.toBeNull();
    expect(result.upgradedBest!.dps.dps).toBeGreaterThan(0);
    expect(canDamageLeafy(result.upgradedBest!.loadout)).toBe(true);
  });
});

describe("leafy — display", () => {
  it("results panel: the immunity and the battleaxe bonus are explained", () => {
    const whip = score([ABYSSAL_WHIP], KURASK);
    expect(buildActiveFlags(whip.loadout, whip.activeBonuses)).toContain(
      "Leafy: no damage without a leaf-bladed weapon, broad ammo or Magic Dart",
    );
    const axe = score([LEAF_BLADED_BATTLEAXE_ID], KURASK, { attackStyle: SLASH });
    expect(buildActiveFlags(axe.loadout, axe.activeBonuses)).toContain("Leaf-bladed battleaxe +17.5% dmg");
  });

  it("slot explanations: broad ammo is the whole build", () => {
    const xbow = score([RUNE_CROSSBOW, BROAD_BOLTS], KURASK);
    const explained = explainSlots(xbow.loadout, xbow.dps, KURASK, SKILLS_AT_99, undefined, xbow.activeBonuses);
    expect(explained.ammo?.reasons).toContain(
      "broad ammo — the only ranged ammo that can hurt this leafy target",
    );
    // Removing the broad bolts leaves nothing that can hurt it.
    expect(explained.ammo?.marginalDps).toBeCloseTo(xbow.dps.dps, 12);
  });
});

describe("zero damage-modifier phases are immunity too (Doom of Mokhaiotl's shield)", () => {
  it("an enchanted bolt's proc no longer leaks through the shield", () => {
    const doom = MONSTER_BY_SLUG["doom-of-mokhaiotl"];
    const shielded = applyPhase(
      doom,
      phaseOptionsFor(doom).find((o) => o.id === "m:shielded")!,
    );
    const ruby = score([RUNE_CROSSBOW, RUBY_BOLTS_E], doom);
    expect(computeSetDps(ruby.loadout, doom, SKILLS_AT_99).dps).toBeGreaterThan(0);
    expect(computeSetDps(ruby.loadout, shielded, SKILLS_AT_99).dps).toBe(0);
  });
});
