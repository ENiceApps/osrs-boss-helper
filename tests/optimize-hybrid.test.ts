// Hybrid optimizer acceptance tests. The engine must:
//  (1) at N=1 share all armor across styles (only the weapon differs)
//  (2) discover Void as a 1-helm-switch hybrid at N=2
//  (3) converge to the independent per-style optima as N → max
//  (4) shift the shared-armor picks toward the heavier-weighted style
//  (5) never exceed the switch budget (switchCount ≤ budget invariant)

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { optimizeHybrid, HYBRID_ARMOR_SLOTS } from "@/lib/optimize/hybrid";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

// Void piece IDs (mirror data/armor-sets.ts).
const VOID = {
  top: 8839,
  robe: 8840,
  gloves: 8842,
  helmRanged: 11664,
  helmMage: 11663,
  helmMelee: 11665,
};

const TRIDENT_SWAMP = 12899; // powered staff (magic, one-handed)
const SHADOW = 27275;        // Tumeken's shadow (magic, two-handed)
const DHCB = 21012;          // dragon hunter crossbow (ranged)
const DIAMOND_E = 9243;      // diamond bolts (e)
const WHIP = 4151;           // abyssal whip (melee)
const PLAIN_CROSSBOW = 837;  // crossbow, no requirement (ranged)
const BRONZE_BOLTS = 877;
const FURY = 6585;           // amulet of fury — melee strength
const ANGUISH = 19547;       // necklace of anguish — ranged strength

describe("optimize/hybrid — N=1 shares all armor", () => {
  it("melee+magic at budget 1 → switchCount 1, no per-style armor switches", () => {
    const bank = [
      WHIP, TRIDENT_SWAMP,
      FURY, 6570 /* fire cape */, 11832 /* bandos body */, 11834 /* bandos legs */,
      7462 /* barrows gloves */, 11840 /* dragon boots */, 6737 /* berserker ring */,
      12002 /* occult necklace */,
    ];
    const { hybrid } = optimizeHybrid({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["melee", "magic"],
      switchBudget: 1,
    });
    expect(hybrid).not.toBeNull();
    expect(hybrid!.switchCount).toBe(1);
    expect(hybrid!.styles).toEqual(["melee", "magic"]);
    expect(hybrid!.blendedDps).toBeGreaterThan(0);
    // Every style shares the base — nothing is switched.
    for (const style of hybrid!.styles) {
      expect(hybrid!.perStyle[style]!.switchedSlots).toEqual([]);
    }
  });
});

describe("optimize/hybrid — Void as a 1-helm-switch hybrid", () => {
  // Bank = full Void + a ranged weapon + a magic weapon. Void is each style's
  // best armor here, so the only slot that differs is the helm.
  const VOID_BANK = [
    VOID.top, VOID.robe, VOID.gloves, VOID.helmRanged, VOID.helmMage,
    DHCB, DIAMOND_E, TRIDENT_SWAMP,
  ];

  it("ranged+magic at budget 2 → body/legs/gloves shared, helm switched per style", () => {
    const { hybrid } = optimizeHybrid({
      bank: VOID_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["ranged", "magic"],
      switchBudget: 2,
    });
    expect(hybrid).not.toBeNull();
    expect(hybrid!.switchCount).toBe(2);
    // The shared base keeps the three common Void pieces.
    expect(hybrid!.sharedSlots.body?.itemId).toBe(VOID.top);
    expect(hybrid!.sharedSlots.legs?.itemId).toBe(VOID.robe);
    expect(hybrid!.sharedSlots.hands?.itemId).toBe(VOID.gloves);
    // The head is the switched slot, with the right helm per style.
    expect(hybrid!.perStyle.ranged!.switchedSlots).toContain("head");
    expect(hybrid!.perStyle.ranged!.loadout.slots.head?.itemId).toBe(VOID.helmRanged);
    expect(hybrid!.perStyle.magic!.loadout.slots.head?.itemId).toBe(VOID.helmMage);
    // Each style's Void set bonus should be active (helm completes the set).
    expect(hybrid!.perStyle.ranged!.loadout.armorSetBonus).toBeDefined();
    expect(hybrid!.perStyle.magic!.loadout.armorSetBonus).toBeDefined();
  });

  it("budget 1 cannot afford the helm switch → no set bonus for the off-helm style", () => {
    const { hybrid } = optimizeHybrid({
      bank: VOID_BANK,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["ranged", "magic"],
      switchBudget: 1,
    });
    expect(hybrid!.switchCount).toBe(1);
    // Head is shared → only one style gets a matching helm; the other loses its set.
    const bonuses = hybrid!.styles.map((s) => hybrid!.perStyle[s]!.loadout.armorSetBonus);
    expect(bonuses.filter(Boolean).length).toBeLessThan(2);
  });
});

describe("optimize/hybrid — the shield counts as a switch (a separate click)", () => {
  // Melee uses a 1H weapon + a shield (dragon defender); magic uses a 2H staff.
  // The shield is its own inventory click, so it should count — but only when the
  // budget can afford it. With a 2H style present, the shared base keeps the shield
  // empty (a shared shield the 2H style can't wear would be a hidden click).
  const bank = [
    WHIP, 20463 /* dragon defender */, SHADOW /* 2H magic */,
    6585 /* fury */, 11832, 11834, 7462, 11840, 6737, 12002 /* occult */,
  ];

  it("budget 1 → shield is not a switch (shared base keeps it empty)", () => {
    const { hybrid } = optimizeHybrid({
      bank, target: VORKATH, skills: SKILLS_AT_99,
      styles: ["melee", "magic"], switchBudget: 1,
    });
    expect(hybrid!.switchCount).toBe(1);
    expect(hybrid!.perStyle.melee!.switchedSlots).not.toContain("shield");
    expect(hybrid!.perStyle.melee!.loadout.slots.shield).toBeUndefined();
  });

  it("ample budget → melee switches in the shield; magic (2H) has none", () => {
    const { hybrid } = optimizeHybrid({
      bank, target: VORKATH, skills: SKILLS_AT_99,
      styles: ["melee", "magic"], switchBudget: 10,
    });
    expect(hybrid!.perStyle.melee!.switchedSlots).toContain("shield");
    expect(hybrid!.perStyle.melee!.loadout.slots.shield?.itemId).toBe(20463);
    expect(hybrid!.perStyle.magic!.loadout.slots.shield).toBeUndefined();
    expect(hybrid!.perStyle.magic!.switchedSlots).not.toContain("shield");
  });
});

describe("optimize/hybrid — converges to per-style optima at max budget", () => {
  it("ranged+melee at budget 10 → each style matches its independent best DPS", () => {
    const bank = [
      // Ranged kit
      DHCB, DIAMOND_E, 27235 /* masori mask f */, 27238 /* masori body f */,
      27241 /* masori chaps f */, 26235 /* zaryte vambs */, 22109 /* ava assembler */,
      19547 /* anguish */, 13237 /* pegasian */, 28310 /* venator ring */,
      // Melee kit
      WHIP, 11832 /* bandos body */, 11834 /* bandos legs */, 7462 /* barrows gloves */,
      6570 /* fire cape */, 6585 /* fury */, 11840 /* dragon boots */, 6737 /* b ring */,
      20463 /* dragon defender */,
    ];
    const indep = optimizeForBoss({ bank, target: VORKATH, skills: SKILLS_AT_99, topN: 500 }).rankings;
    const bestOf = (style: string) =>
      Math.max(...indep.filter((r) => r.loadout.style === style).map((r) => r.dps.dps));

    const { hybrid } = optimizeHybrid({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["ranged", "melee"],
      switchBudget: 10,
    });
    expect(hybrid).not.toBeNull();
    expect(hybrid!.perStyle.ranged!.dps).toBeCloseTo(bestOf("ranged"), 4);
    expect(hybrid!.perStyle.melee!.dps).toBeCloseTo(bestOf("melee"), 4);
  });
});

describe("optimize/hybrid — weighting biases the shared armor", () => {
  // Bank shares a neck slot: fury (melee str) vs anguish (ranged str). At N=1 the
  // neck is shared, so the weighting decides which amulet everyone wears.
  const bank = [WHIP, PLAIN_CROSSBOW, BRONZE_BOLTS, FURY, ANGUISH];

  it("melee-heavy weight → shared neck is the melee amulet (fury)", () => {
    const { hybrid } = optimizeHybrid({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["melee", "ranged"],
      switchBudget: 1,
      weights: { melee: 0.9, ranged: 0.1 },
    });
    expect(hybrid!.sharedSlots.neck?.itemId).toBe(FURY);
  });

  it("ranged-heavy weight → shared neck is the ranged amulet (anguish)", () => {
    const { hybrid } = optimizeHybrid({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["melee", "ranged"],
      switchBudget: 1,
      weights: { melee: 0.1, ranged: 0.9 },
    });
    expect(hybrid!.sharedSlots.neck?.itemId).toBe(ANGUISH);
  });
});

describe("optimize/hybrid — invariants & degenerate inputs", () => {
  const bank = [
    DHCB, DIAMOND_E, TRIDENT_SWAMP, WHIP,
    VOID.top, VOID.robe, VOID.gloves, VOID.helmRanged, VOID.helmMage, VOID.helmMelee,
    6585, 6570, 11840, 6737,
  ];

  it("switchCount never exceeds the budget, across budgets 1..10", () => {
    for (let n = 1; n <= 10; n++) {
      const { hybrid } = optimizeHybrid({
        bank,
        target: VORKATH,
        skills: SKILLS_AT_99,
        styles: ["melee", "ranged", "magic"],
        switchBudget: n,
      });
      expect(hybrid).not.toBeNull();
      expect(hybrid!.switchCount).toBeLessThanOrEqual(n);
      // switchedSlots are a subset of the shareable armor slots.
      for (const style of hybrid!.styles) {
        for (const slot of hybrid!.perStyle[style]!.switchedSlots) {
          expect(HYBRID_ARMOR_SLOTS).toContain(slot);
        }
      }
    }
  });

  it("a style the bank can't perform is dropped from the hybrid", () => {
    // Only a melee weapon → magic/ranged have no anchor.
    const { hybrid, diagnostics } = optimizeHybrid({
      bank: [WHIP, 6585, 11832, 11834],
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["melee", "ranged", "magic"],
      switchBudget: 3,
    });
    expect(hybrid!.styles).toEqual(["melee"]);
    expect(diagnostics.stylesBuilt).toEqual(["melee"]);
  });

  it("empty bank → null hybrid, no crash", () => {
    const { hybrid } = optimizeHybrid({
      bank: [],
      target: VORKATH,
      skills: SKILLS_AT_99,
      styles: ["melee", "ranged"],
      switchBudget: 2,
    });
    expect(hybrid).toBeNull();
  });
});
