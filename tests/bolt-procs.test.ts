// Enchanted-bolt proc tests. Formulas mirror weirdgloop's osrs-dps-calc
// src/lib/dists/bolts.ts (kandarin diary ON by default, matching their
// default state; ZCB modifies effect values, not chance).

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import {
  boltEffectApplies,
  expectedBoltDamagePerAttack,
  resolveBoltProc,
} from "@/lib/dps/bolts";

const VORKATH = MONSTER_BY_SLUG["vorkath"]; // dragon + undead + fiery, 750 hp

const DHCB = 21012;
const ZCB = 26374;
const RUBY_DRAGON_E = 21944;
const DIAMOND_DRAGON_E = 21946;
const ONYX_DRAGON_E = 21950;
const DRAGONSTONE_DRAGON_E = 21948;

describe("resolveBoltProc — gating", () => {
  const base = {
    weaponItemId: DHCB,
    weaponCategory: "Crossbow",
    visibleRangedLevel: 99,
    target: { hp: VORKATH.hp, attributes: VORKATH.attributes, slug: VORKATH.slug },
  };

  it("ruby vs Vorkath: 6.6% chance, proc capped at 100 (20% of 750 = 150 → cap)", () => {
    const spec = resolveBoltProc({ ...base, ammoItemId: RUBY_DRAGON_E });
    expect(spec).toEqual({
      effect: "ruby",
      kind: "replaceFixed",
      chance: expect.closeTo(0.066, 5),
      procDamage: 100,
    });
  });

  it("ZCB strengthens ruby: 22% of HP, cap 110", () => {
    const spec = resolveBoltProc({ ...base, weaponItemId: ZCB, ammoItemId: RUBY_DRAGON_E });
    expect(spec).toMatchObject({ procDamage: 110 });
  });

  it("kandarin diary off → base 6% chance", () => {
    const spec = resolveBoltProc({ ...base, ammoItemId: RUBY_DRAGON_E, kandarinDiary: false });
    expect(spec).toMatchObject({ chance: expect.closeTo(0.06, 5) });
  });

  it("onyx is inert vs undead Vorkath; dragonstone inert vs dragon/fiery", () => {
    expect(resolveBoltProc({ ...base, ammoItemId: ONYX_DRAGON_E })).toBeUndefined();
    expect(resolveBoltProc({ ...base, ammoItemId: DRAGONSTONE_DRAGON_E })).toBeUndefined();
    expect(boltEffectApplies("onyx", ["undead"])).toBe(false);
    expect(boltEffectApplies("dragonstone", ["fiery"])).toBe(false);
    expect(boltEffectApplies("ruby", VORKATH.attributes)).toBe(true);
  });

  it("only category Crossbow procs (no bows, no 2H crossbows — mirrors wgloop)", () => {
    expect(
      resolveBoltProc({ ...base, weaponCategory: "Bow", ammoItemId: RUBY_DRAGON_E }),
    ).toBeUndefined();
    expect(
      resolveBoltProc({ ...base, weaponCategory: "Two-handed Crossbow", ammoItemId: RUBY_DRAGON_E }),
    ).toBeUndefined();
  });

  it("plain (non-enchanted) ammo never procs", () => {
    expect(resolveBoltProc({ ...base, ammoItemId: 21905 /* Dragon bolts */ })).toBeUndefined();
  });
});

describe("expectedBoltDamagePerAttack — hand-computed expectations", () => {
  it("ruby bypasses accuracy: E = p·dmg + (1−p)·acc·max/2", () => {
    const e = expectedBoltDamagePerAttack(0.8, 50, {
      effect: "ruby",
      kind: "replaceFixed",
      chance: 0.066,
      procDamage: 100,
    });
    expect(e).toBeCloseTo(0.066 * 100 + 0.934 * 0.8 * 25, 10);
  });

  it("diamond bypasses accuracy with +15% max: E = p·em/2 + (1−p)·acc·max/2", () => {
    const e = expectedBoltDamagePerAttack(0.8, 50, {
      effect: "diamond",
      kind: "scaledMax",
      chance: 0.11,
      effectMaxPercent: 115,
      accurateOnly: false,
    });
    // em = trunc(50 × 115/100) = 57
    expect(e).toBeCloseTo(0.11 * (57 / 2) + 0.89 * 0.8 * 25, 10);
  });

  it("onyx is accuracy-gated: E = acc·(p·em/2 + (1−p)·max/2)", () => {
    const e = expectedBoltDamagePerAttack(0.8, 50, {
      effect: "onyx",
      kind: "scaledMax",
      chance: 0.121,
      effectMaxPercent: 120,
      accurateOnly: true,
    });
    expect(e).toBeCloseTo(0.8 * (0.121 * 30 + 0.879 * 25), 10);
  });

  it("opal adds flat damage on any attack; dragonstone only on accurate hits", () => {
    const opal = expectedBoltDamagePerAttack(0.8, 50, {
      effect: "opal",
      kind: "flatBonus",
      chance: 0.055,
      bonusDamage: 9,
      accurateOnly: false,
    });
    expect(opal).toBeCloseTo(0.8 * 25 + 0.055 * 9, 10);
    const dstone = expectedBoltDamagePerAttack(0.8, 50, {
      effect: "dragonstone",
      kind: "flatBonus",
      chance: 0.066,
      bonusDamage: 19,
      accurateOnly: true,
    });
    expect(dstone).toBeCloseTo(0.8 * 25 + 0.8 * 0.066 * 19, 10);
  });
});

describe("optimizer — proc-aware ammo selection vs Vorkath", () => {
  // DHCB kit with BOTH plain dragon bolts and the proc variants banked.
  const BANK = [
    27235, // Masori mask (f)
    22109, // Ava's assembler
    12018, // Salve amulet(ei)
    27238, // Masori body (f)
    27241, // Masori chaps (f)
    26235, // Zaryte vambraces
    13237, // Pegasian boots
    28310, // Venator ring
    DHCB,
    21905, // Dragon bolts (plain — same rangedStr as the (e) variants)
    DIAMOND_DRAGON_E,
    RUBY_DRAGON_E,
    22002, // Dragonfire ward
  ];

  it("ruby dragon bolts (e) win the ammo slot at full HP (the Vorkath meta)", () => {
    const { rankings } = optimizeForBoss({
      bank: BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.slots.ammo?.itemId).toBe(RUBY_DRAGON_E);

    // And the ordering is ruby > diamond > plain bolts for the same kit.
    const dpsByAmmo = new Map<number, number>();
    for (const r of rankings) {
      const ammo = r.loadout.slots.ammo?.itemId;
      if (ammo !== undefined && !dpsByAmmo.has(ammo) && r.loadout.slots.weapon?.itemId === DHCB) {
        dpsByAmmo.set(ammo, r.dps.dps);
      }
    }
    const ruby = dpsByAmmo.get(RUBY_DRAGON_E)!;
    const diamond = dpsByAmmo.get(DIAMOND_DRAGON_E)!;
    expect(ruby).toBeGreaterThan(diamond);
    // Ruby's edge at full HP is large — roughly +1 DPS over diamond here.
    expect(ruby - diamond).toBeGreaterThan(0.5);
  });
});
