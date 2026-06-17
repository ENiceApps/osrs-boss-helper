// Phase 2 acceptance tests. The optimizer must:
//  (1) rediscover known-good curated sets when the bank contains their items
//  (2) fall back to the right alternative when conditional-bonus items are
//      not in the bank (Tbow swap)
//  (3) honour force-include branches for demonbane against demon targets
//  (4) not crash on degenerate inputs (empty bank, weaponless bank)
//  (5) score powered staves (Trident of the seas/swamp) with their built-in
//      damage formula — not zero — so magic is considered for magic-weak bosses

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario } from "@/lib/optimize/scenario";

const VORKATH = MONSTER_BY_SLUG["vorkath"];
const KRIL = MONSTER_BY_SLUG["kril-tsutsaroth"];

// Curated set item IDs — see data/loadouts/sets.source.ts. Listed here so
// the tests break loudly if anyone edits the source without updating both.
const DHCB_SALVE_EI_IDS = [
  27235, // Masori mask (f)
  22109, // Ava's assembler
  12018, // Salve amulet(ei)
  27238, // Masori body (f)
  27241, // Masori chaps (f)
  26235, // Zaryte vambraces
  13237, // Pegasian boots
  28310, // Venator ring
  21012, // Dragon hunter crossbow
  9243, // Diamond bolts (e)
  22002, // Dragonfire ward
];

const TBOW_SET_IDS = [
  27235, // Masori mask (f)
  22109, // Ava's assembler
  19547, // Necklace of anguish
  27238, // Masori body (f)
  27241, // Masori chaps (f)
  26235, // Zaryte vambraces
  13237, // Pegasian boots
  28310, // Venator ring
  20997, // Twisted bow
  11212, // Dragon arrow
];

describe("optimize/bank — rediscovers curated loadouts", () => {
  it("DHCB+Salve(ei) bank → #1 result on Vorkath matches the curated set's engine DPS", () => {
    const { rankings, diagnostics } = optimizeForBoss({
      bank: DHCB_SALVE_EI_IDS,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    expect(diagnostics.weaponsConsidered).toBe(1); // only DHCB in this bank

    // The optimizer should rediscover the DHCB+Salve(ei) setup and reproduce
    // its baseline DPS — see tests/fixtures/verified-setups.ts. 8.227 includes
    // the Diamond bolts (e) proc (11% defence-ignoring hit at +15% max),
    // matching the wiki calc's always-on bolt modelling.
    const top = rankings[0];
    expect(top.dps.maxHit).toBe(57);
    expect(top.dps.dps).toBeCloseTo(8.227, 1);
    expect(top.activeBonuses.conditionalBonuses.dragonHunterCrossbow).toBe(true);
    expect(top.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
  });

  it("Tbow-only ranged bank → picks Twisted bow on Vorkath", () => {
    const { rankings } = optimizeForBoss({
      bank: TBOW_SET_IDS,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.slots.weapon?.itemId).toBe(20997); // Twisted bow
    expect(top.activeBonuses.twistedBowEquipped).toBe(true);
  });

  it("Combined DHCB + Tbow bank on Vorkath → DHCB + Diamond (e) + Salve(ei) wins now that bolt procs are modelled", () => {
    // History: before bolt procs were modelled, Tbow+Salve(ei) (8.06) edged
    // out DHCB+Salve(ei) (7.90) here. With the Diamond bolts (e) proc priced
    // in (11% defence-ignoring hit at +15% max), DHCB reaches 8.23 and takes
    // the top spot back — matching the wiki calc, where bolt effects are
    // always on. Tbow can't use bolts, so its number is unchanged.
    const { rankings } = optimizeForBoss({
      bank: [...DHCB_SALVE_EI_IDS, ...TBOW_SET_IDS],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    const top = rankings[0];
    expect(top.loadout.slots.weapon?.itemId).toBe(21012); // DHCB
    expect(top.loadout.slots.ammo?.itemId).toBe(9243); // Diamond bolts (e)
    expect(top.activeBonuses.conditionalBonuses.dragonHunterCrossbow).toBe(true);
    expect(top.activeBonuses.conditionalBonuses.salveAmuletEi).toBe(true);
    // The Tbow build should still appear right behind (force-include guarantee).
    const tbow = rankings.find((r) => r.loadout.slots.weapon?.itemId === 20997);
    expect(tbow).toBeDefined();
    expect(tbow!.dps.dps).toBeCloseTo(8.058, 1);
  });
});

describe("optimize/bank — demonbane force-include", () => {
  it("bank with Arclight against K'ril (demon) → Arclight loadout appears in rankings with demonbane firing", () => {
    // Arclight (19675) — Charged. Plus minimal melee kit so the build is
    // valid. We're not asserting Arclight is #1 (depends on what else is
    // in the bank), only that it appears with demonbane=true.
    const bank = [
      19675, // Arclight (Charged)
      11335, // Dragon full helm
      6570, // Fire cape
      6585, // Amulet of fury
      11832, // Bandos chestplate
      11834, // Bandos tassets
      7462, // Barrows gloves
      11840, // Dragon boots
      6737, // Berserker ring
      22322, // Avernic defender
    ];
    const { rankings } = optimizeForBoss({
      bank,
      target: KRIL,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const arclightHit = rankings.find((r) => r.loadout.slots.weapon?.itemId === 19675);
    expect(arclightHit).toBeDefined();
    expect(arclightHit!.activeBonuses.conditionalBonuses.demonbane).toBe(true);
  });
});

describe("optimize/bank — degenerate inputs", () => {
  it("empty bank → no rankings, no crash", () => {
    const { rankings, diagnostics } = optimizeForBoss({
      bank: [],
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings).toEqual([]);
    expect(diagnostics.weaponsConsidered).toBe(0);
  });

  it("weaponless bank → no rankings (DPS requires a weapon)", () => {
    const { rankings, diagnostics } = optimizeForBoss({
      bank: [27235, 22109, 12018], // helm + cape + amulet only
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings).toEqual([]);
    expect(diagnostics.weaponsConsidered).toBe(0);
  });

  it("bank with items above player's skill level → those items are filtered out", () => {
    // Player has only ranged 50 — Masori (req 80) and DHCB (req 70) should be excluded;
    // Rune crossbow (req 61) should also be excluded. Bronze crossbow (no req) is fine.
    const lowSkills = { ...SKILLS_AT_99, ranged: 50 };
    const bank = [
      27235, // Masori mask (f) — requires ranged 80, filtered
      21012, // DHCB — requires ranged 70, filtered
      877, // Bronze bolts (no req)
      837, // Crossbow (no req)
    ];
    const { rankings } = optimizeForBoss({
      bank,
      target: VORKATH,
      skills: lowSkills,
    });
    // Crossbow + bolts should give a valid (if weak) loadout.
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.slots.weapon?.itemId).toBe(837);
    // None of the filtered items should appear in any loadout.
    for (const r of rankings) {
      const ids = Object.values(r.loadout.slots).map((s) => s.itemId);
      expect(ids).not.toContain(27235);
      expect(ids).not.toContain(21012);
    }
  });
});

describe("optimize/bank — ammo slot guarding", () => {
  it("Thrown weapon (Dragon dart) never picks javelin as ammo — javelin stays out of the setup", () => {
    // Dragon dart id=11230 (slot:weapon, category:Thrown). Dragon javelin
    // id=19484 (slot:ammo, rangedStr=150). Before the fix, the greedy build
    // would pick Dragon javelin as the best ammo since Thrown weapons weren't
    // in WEAPON_AMMO and any ammo passed the compat check.
    const { rankings } = optimizeForBoss({
      bank: [11230, 19484], // Dragon dart (Unpoisoned) + Dragon javelin (Unpoisoned)
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    // If there are rankings, none should contain Dragon javelin in any slot.
    for (const r of rankings) {
      const ids = Object.values(r.loadout.slots).map((s) => s.itemId);
      expect(ids).not.toContain(19484); // Dragon javelin must never appear
    }
  });

  it("Heavy ballista bank picks Dragon javelin as ammo (not filtered as unknown)", () => {
    // Before the fix, javelins were missing from AMMO_TYPES → "Unknown ammo"
    // error → all javelins rejected → ballista setups had no ammo at all.
    const { rankings } = optimizeForBoss({
      bank: [19481, 19484], // Heavy ballista + Dragon javelin (Unpoisoned)
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.slots.weapon?.itemId).toBe(19481); // Heavy ballista
    expect(top.loadout.slots.ammo?.itemId).toBe(19484);   // Dragon javelin
  });
});

describe("optimize/bank — parity check vs Phase 1 scoreScenario", () => {
  it("optimizer's #1 DPS matches manually computed scoreScenario for the same gear", () => {
    // If we hand-pick the optimizer's top loadout's items and feed them
    // back through scoreScenario directly, we should get the same DPS —
    // proves the optimizer isn't accidentally mutating the engine inputs.
    const { rankings } = optimizeForBoss({
      bank: DHCB_SALVE_EI_IDS,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    const top = rankings[0];
    const topItemIds = Object.values(top.loadout.slots).map((s) => s.itemId);
    const direct = scoreScenario({
      itemIds: topItemIds,
      target: VORKATH,
      skills: SKILLS_AT_99,
      attackStyle: {
        attackType: top.loadout.attackType,
        choice: top.loadout.attackStyleChoice,
      },
    });
    if (!direct.valid) throw new Error("Direct re-score should be valid");
    expect(top.dps.dps).toBeCloseTo(direct.dps.dps, 6);
    expect(top.dps.maxHit).toBe(direct.dps.maxHit);
  });
});

// Dagannoth Rex: magic def 10, all physical/ranged def 255.
// Pre-fix: powered staves scored 0 DPS (no spell passed) → ranged 2.675 won.
// Post-fix: built-in formula fires → magic ~6.8 DPS dominates.
const REX = MONSTER_BY_SLUG["dagannoth-rex"];

describe("optimize/bank — powered staff formula (Trident fix)", () => {
  it("Trident of the swamp alone yields non-zero magic DPS", () => {
    const { rankings } = optimizeForBoss({
      bank: [12899], // Trident of the swamp
      target: REX,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.style).toBe("magic");
    expect(top.loadout.slots.weapon?.itemId).toBe(12899);
    expect(top.dps.dps).toBeGreaterThan(0);
  });

  it("Trident of the swamp max hit at 99 magic = 30 (formula 29 + Augury +4%)", () => {
    const { rankings } = optimizeForBoss({
      bank: [12899],
      target: REX,
      skills: SKILLS_AT_99,
    });
    // formula: floor(99/3) - 4 = 29; Augury default prayer adds +4% magic damage:
    // floor(29 × 1.04) = floor(30.16) = 30.
    expect(rankings[0].dps.maxHit).toBe(30);
  });

  it("Trident of the seas max hit at 99 magic = 29 (formula 28 + Augury +4%)", () => {
    const { rankings } = optimizeForBoss({
      bank: [11907], // Trident of the seas
      target: REX,
      skills: SKILLS_AT_99,
    });
    // formula: floor(99/3) - 5 = 28; Augury: floor(28 × 1.04) = floor(29.12) = 29.
    expect(rankings[0].dps.maxHit).toBe(29);
  });

  it("bank with Trident of swamp + DHCB kit → optimizer picks magic on Rex (not ranged)", () => {
    // DHCB has dragon bonus vs Vorkath but is still a strong crossbow —
    // against Rex's 255 ranged def it would have scored 0 pre-fix (magic=0)
    // and still loses post-fix because Rex's magic def is only 10.
    const bank = [
      12899, // Trident of the swamp
      21012, // Dragon hunter crossbow
      9243,  // Diamond bolts (e)
      22109, // Ava's assembler
    ];
    const { rankings } = optimizeForBoss({
      bank,
      target: REX,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.style).toBe("magic");
    expect(top.loadout.slots.weapon?.itemId).toBe(12899);
    // Should be dramatically better than the pre-fix ranged result (2.675).
    expect(top.dps.dps).toBeGreaterThan(5);
  });
});

// Staves get cross-spellbook auto-spell selection via bestSpell, but the pick is
// constrained to spellbooks the EQUIPPED WEAPON can autocast (see
// data/items/magic-weapon-autocast.ts). The Staff of water is a plain elemental
// staff — Standard-only — so it can never autocast an Ancient barrage.
const STAFF_OF_WATER = 1383; // category: Staff, magic+10, Standard-only autocast
const ANCIENT_STAFF = 4675;  // autocasts Ancient Magicks + Standard

describe("optimize/bank — cross-spellbook auto-spell selection", () => {
  it("Staff of water alone yields non-zero magic DPS on Rex", () => {
    // Pre-fix: standard staves had baseSpellMaxHit = undefined → magic DPS 0.
    const { rankings } = optimizeForBoss({
      bank: [STAFF_OF_WATER],
      target: REX,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const top = rankings[0];
    expect(top.loadout.style).toBe("magic");
    expect(top.loadout.slots.weapon?.itemId).toBe(STAFF_OF_WATER);
    expect(top.dps.dps).toBeGreaterThan(0);
  });

  it("Standard-only staff at magic 99 → Fire Surge (best autocastable standard spell), NOT Ice Barrage", () => {
    const { rankings } = optimizeForBoss({
      bank: [STAFF_OF_WATER],
      target: REX,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    expect(rankings[0].loadout.autoSpellName).toBe("Fire Surge");
  });

  it("Standard-only staff at magic 81 → Wind Surge (best autocastable standard spell at that level)", () => {
    const { rankings } = optimizeForBoss({
      bank: [STAFF_OF_WATER],
      target: REX,
      skills: { ...SKILLS_AT_99, magic: 81 },
    });
    expect(rankings.length).toBeGreaterThan(0);
    expect(rankings[0].loadout.autoSpellName).toBe("Wind Surge");
  });

  it("an Ancient-capable staff DOES auto-select Ice Barrage at magic 99", () => {
    const { rankings } = optimizeForBoss({
      bank: [ANCIENT_STAFF],
      target: REX,
      skills: SKILLS_AT_99,
    });
    const magic = rankings.find((r) => r.loadout.style === "magic");
    expect(magic?.loadout.autoSpellName).toBe("Ice Barrage");
  });
});
