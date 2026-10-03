// Two of upstream's NPC rules (weirdgloop/osrs-dps-calc @ 89c3e25):
//
//  1. Melee immunity. PlayerVsNPCCalc.isImmune (L2057-2060) zeroes every melee
//     attack on IMMUNE_TO_MELEE_DAMAGE_NPC_IDS (constants.ts L347-354): the
//     Kraken (494), the Abyssal portal (7533), TzKal-Zuk (7706), Jal-MejJak
//     (7708), the Leviathan (12214, 12215, 12219) and Zulrah (2042-2044) —
//     except that Zulrah takes melee from a weapon of category Polearm (a
//     halberd). The Scythe of Vitur is category Scythe, so it does nothing to
//     any of them, Zulrah included.
//  2. Zulrah's damage cap. applyNpcTransforms' first transform (L1937-1940) is
//     cappedRerollTransformer(50, 5, 45) (HitDist.ts L481-497): every
//     hitsplat over 50 is rerolled uniformly into 45..50 (mean 47.5), any
//     style, after the attacker side (the accurate-zero raise, ruby bolts)
//     and before flat armour. The reported max hit is capped per hitsplat, as
//     getMax() reads the transformed distribution.
//
// Section 1 checks the immunity table, section 2 how a scored loadout carries
// it, section 3 every engine mean branch under the cap with hand-derived
// numbers, section 4 locks wgloop's numbers for npcImmunityAndCapCombos().

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance, npcDefenceRoll } from "@/lib/dps/common";
import { cappedHitsplat, cappedMaxHit } from "@/lib/dps/damage-cap";
import type { BoltProcSpec } from "@/lib/dps/bolts";
import {
  meleeImmunityNote,
  npcMeleeImmunity,
  requiresMeleeReach2,
} from "@/data/monsters/melee-reach";
import { damageCapFor, ZULRAH_DAMAGE_CAP } from "@/data/monsters/damage-cap";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { buildActiveFlags } from "@/components/ResultsPanel";
import { npcImmunityAndCapCombos } from "@/scripts/oracle/combos";

// ---- 1. which monsters, which weapons ---------------------------------------

describe("npcMeleeImmunity — upstream's IMMUNE_TO_MELEE_DAMAGE_NPC_IDS", () => {
  const CATEGORIES = ["Slash Sword", "Scythe", "Polearm", "Salamander", "Whip", undefined];

  it("the Kraken, the Abyssal portal, Zuk, Jal-MejJak and the Leviathan: no melee weapon, a halberd included", () => {
    for (const wikiId of [494, 7533, 7706, 7708, 12214, 12215, 12219]) {
      for (const category of CATEGORIES) {
        expect(npcMeleeImmunity({ wikiId }, category), `${wikiId} / ${category}`).toBe("all");
      }
    }
  });

  it("Zulrah, all three forms: only a Polearm (halberd) — not the Scythe, not a salamander", () => {
    for (const wikiId of [2042, 2043, 2044]) {
      expect(npcMeleeImmunity({ wikiId }, "Polearm")).toBeNull();
      for (const category of ["Scythe", "Salamander", "Stab Sword", "Whip", undefined]) {
        expect(npcMeleeImmunity({ wikiId }, category), `${wikiId} / ${category}`).toBe("halberd");
      }
    }
  });

  it("not listed: the Kraken's Whirlpool (496), the Cave kraken, Vorkath", () => {
    expect(npcMeleeImmunity({ wikiId: 496 }, "Whip")).toBeNull();
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["cave-kraken"], "Whip")).toBeNull();
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["vorkath"], "Scythe")).toBeNull();
  });

  it("the catalog entries carry those ids (the default phase of each boss)", () => {
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["tzkal-zuk"], "Scythe")).toBe("all");
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["kraken"], "Whip")).toBe("all");
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["the-leviathan"], "Scythe")).toBe("all");
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["jal-mejjak"], "Whip")).toBe("all");
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["abyssal-portal"], "Whip")).toBe("all");
    expect(npcMeleeImmunity(MONSTER_BY_SLUG["zulrah"], "Scythe")).toBe("halberd");
  });

  it("the reach gate agrees with it on Zulrah in every form: gated, and only a halberd hits", () => {
    const zulrah = MONSTER_BY_SLUG["zulrah"];
    for (const option of phaseOptionsFor(zulrah)) {
      const form = applyPhase(zulrah, option);
      expect(requiresMeleeReach2(form), option.label).toBe(true);
      expect(npcMeleeImmunity(form, "Polearm"), option.label).toBeNull();
      expect(npcMeleeImmunity(form, "Scythe"), option.label).toBe("halberd");
    }
    // No weapon reaches the all-immune bosses, so they aren't reach-gated.
    expect(requiresMeleeReach2(MONSTER_BY_SLUG["tzkal-zuk"])).toBe(false);
  });

  it("the melee tab's note names the reason", () => {
    expect(meleeImmunityNote(MONSTER_BY_SLUG["tzkal-zuk"])).toBe(
      "TzKal-Zuk is immune to melee — use ranged or magic.",
    );
    expect(meleeImmunityNote(MONSTER_BY_SLUG["zulrah"])).toBe(
      "Zulrah only takes melee damage from a halberd.",
    );
    expect(meleeImmunityNote(MONSTER_BY_SLUG["kreearra"])).toBe(
      "Kree'arra flies: only a halberd or salamander can melee it.",
    );
    expect(meleeImmunityNote(MONSTER_BY_SLUG["vorkath"])).toBeUndefined();
  });
});

// ---- 2. scored loadouts --------------------------------------------------------

/** Infernal cape, Bandos chestplate + tassets, Ferocious gloves, Primordial boots, Berserker ring (i). */
const meleeGear = (weapon: number): number[] =>
  [weapon, 24271, 19553, 21295, 11832, 11834, 22981, 13239, 11773];
const SCYTHE = 22325;
const WHIP = 4151;
const NOXIOUS_HALBERD = 29796;
const ACB_RANGED = [11785, 9144, 11826, 19547, 21914, 11828, 11830, 26235, 13237, 11771];

function score(slug: string, itemIds: number[], attackType: "slash" | "ranged", choice: "aggressive" | "controlled" | "rapid") {
  const r = scoreScenario({
    itemIds,
    target: MONSTER_BY_SLUG[slug],
    skills: SKILLS_AT_99,
    attackStyle: { attackType, choice },
  });
  if (!r.valid) throw new Error(r.reasons.join("; "));
  return r;
}

describe("a melee loadout vs a melee-immune monster scores 0", () => {
  it("Scythe vs TzKal-Zuk: 0 DPS, 0 max hit, accuracy still reported, and the flag says why", () => {
    const r = score("tzkal-zuk", meleeGear(SCYTHE), "slash", "aggressive");
    expect(r.activeBonuses.npcMeleeImmune).toBe("all");
    expect(r.activeBonuses.flyingMeleeImmune).toBe(false);
    expect(r.dps.dps).toBe(0);
    expect(r.dps.maxHit).toBe(0);
    expect(r.dps.accuracy).toBeGreaterThan(0);
    expect(buildActiveFlags(r.loadout, r.activeBonuses)).toContain(
      "Immune to melee: only ranged or magic can damage it",
    );
  });

  it("every all-immune boss, Whip and Scythe alike", () => {
    for (const slug of ["kraken", "the-leviathan", "jal-mejjak", "abyssal-portal"]) {
      const whip = score(slug, meleeGear(WHIP), "slash", "controlled");
      const scythe = score(slug, meleeGear(SCYTHE), "slash", "aggressive");
      expect(whip.dps.dps, `${slug} / whip`).toBe(0);
      expect(scythe.dps.dps, `${slug} / scythe`).toBe(0);
    }
  });

  it("ranged is untouched: an Armadyl crossbow still hits Zuk and the Leviathan", () => {
    for (const slug of ["tzkal-zuk", "the-leviathan"]) {
      const r = score(slug, ACB_RANGED, "ranged", "rapid");
      expect(r.activeBonuses.npcMeleeImmune).toBeNull();
      expect(r.dps.dps, slug).toBeGreaterThan(0);
    }
  });

  it("Zulrah: the Scythe scores 0 with the halberd flag; a Noxious halberd hits", () => {
    const scythe = score("zulrah", meleeGear(SCYTHE), "slash", "aggressive");
    expect(scythe.activeBonuses.npcMeleeImmune).toBe("halberd");
    expect(scythe.dps.dps).toBe(0);
    expect(buildActiveFlags(scythe.loadout, scythe.activeBonuses)).toContain(
      "Zulrah: melee can't reach it without a halberd",
    );

    const halberd = score("zulrah", meleeGear(NOXIOUS_HALBERD), "slash", "aggressive");
    expect(halberd.activeBonuses.npcMeleeImmune).toBeNull();
    expect(halberd.dps.dps).toBeGreaterThan(0);
  });
});

// ---- 3. Zulrah's cap, engine mean branches, hand-derived ------------------------

describe("cappedHitsplat / cappedMaxHit", () => {
  it("leaves a hit of at most 50 alone and rerolls a bigger one into 45..50 (mean 47.5)", () => {
    expect(cappedHitsplat(50, ZULRAH_DAMAGE_CAP)).toBe(50);
    expect(cappedHitsplat(51, ZULRAH_DAMAGE_CAP)).toBe(47.5);
    expect(cappedHitsplat(110, ZULRAH_DAMAGE_CAP)).toBe(47.5);
    // A later transform sees each reroll: +2 → 47..52, mean 49.5.
    expect(cappedHitsplat(80, ZULRAH_DAMAGE_CAP, (h) => h + 2)).toBe(49.5);
    expect(cappedMaxHit(66, ZULRAH_DAMAGE_CAP)).toBe(50);
    expect(cappedMaxHit(43, ZULRAH_DAMAGE_CAP)).toBe(43);
    expect(cappedMaxHit(66, undefined)).toBe(66);
  });

  it("is Zulrah's alone, in every form (matched by name, as upstream)", () => {
    const zulrah = MONSTER_BY_SLUG["zulrah"];
    for (const option of phaseOptionsFor(zulrah)) {
      expect(damageCapFor(applyPhase(zulrah, option)), option.label).toBe(ZULRAH_DAMAGE_CAP);
    }
    expect(damageCapFor(MONSTER_BY_SLUG["vorkath"])).toBeUndefined();
    expect(damageCapFor(MONSTER_BY_SLUG["tzkal-zuk"])).toBeUndefined();
  });
});

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };
const ZULRAH = ZULRAH_DAMAGE_CAP;

/** Magic, 5 ticks (3 s), no damage %: the max hit is the base spell hit. */
function magic(baseSpellMaxHit: number, over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 30, strengthBonus: 0, magicDamagePercent: 0, baseSpellMaxHit,
    attackSpeedTicks: 5, targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
    targetDamageCap: ZULRAH, ...over,
  };
}
/**
 * Ranged, rapid (5 → 4 ticks, 2.4 s), no prayer: effective strength 107.
 * Max floor(0.5 + 107 × (S + 64)/640): S = 292 → 60, S = 80 → 24. Attack roll
 * 107 × 164 = 17548 vs (100 + 9) × 64 = 6976.
 */
function ranged(strengthBonus: number, over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "ranged", attackStyle: "rapid", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus, attackSpeedTicks: 5,
    targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
    targetDamageCap: ZULRAH, ...over,
  };
}
const RANGED_ACC = hitChance(17548, npcDefenceRoll(100, 0));

// Σ_{r=0..50} r = 1275. A roll over 0..60 lands 1275 + 1 (the accurate-zero
// raise: 0 → 1) + 10 × 47.5 (rolls 51..60) = 1751, over 61 rolls — where the
// uncapped mean is (1830 + 1)/61.
const CAPPED_0_60 = 1751 / 61;

describe("calculateDps vs Zulrah — a single hit", () => {
  it("max 60: landed mean 1751/61 ≈ 28.70, not 1831/61 ≈ 30.02; max hit 50", () => {
    const r = calculateDps(magic(60));
    expect(r.maxHit).toBe(50);
    expect(r.dps).toBeCloseTo((r.accuracy * CAPPED_0_60) / 3, 12);
  });

  it("max 51: only the roll of 51 rerolls — (1276 + 47.5)/52; max 50 and under are untouched", () => {
    const r = calculateDps(magic(51));
    expect(r.maxHit).toBe(50);
    expect(r.dps).toBeCloseTo((r.accuracy * 1323.5) / 52 / 3, 12);

    // (1275 + 1)/51 and (820 + 1)/41: the uncapped means.
    const at = calculateDps(magic(50));
    expect(at.maxHit).toBe(50);
    expect(at.dps).toBeCloseTo((at.accuracy * 1276) / 51 / 3, 12);
    const under = calculateDps(magic(40));
    expect(under.maxHit).toBe(40);
    expect(under.dps).toBeCloseTo(calculateDps(magic(40, { targetDamageCap: undefined })).dps, 12);
  });

  it("ranged, the same roll: max 60 → 1751/61 a landed hit", () => {
    const r = calculateDps(ranged(292));
    expect(r.accuracy).toBe(RANGED_ACC);
    expect(r.maxHit).toBe(50);
    expect(r.dps).toBeCloseTo((RANGED_ACC * CAPPED_0_60) / 2.4, 12);
  });

  it("the cap runs BEFORE flat armour: −2 armour shifts the capped hit (max 52, 1873/61)", () => {
    // Order check only (Zulrah has no armour): rolls 0..50 raised then +2 →
    // 1 + 1275 + 51·2 = 1378; rolls 51..60 → 47..52, 10 × 49.5 = 495.
    const r = calculateDps(ranged(292, { targetFlatArmour: -2 }));
    expect(r.maxHit).toBe(52);
    expect(r.dps).toBeCloseTo((RANGED_ACC * 1873) / 61 / 2.4, 12);
  });
});

describe("calculateDps vs Zulrah — every hitsplat on its own", () => {
  it("two full hits (Dark bow), max 60 each: 2 × 1751/61; max hit 50 (the largest hitsplat)", () => {
    const r = calculateDps(magic(60, { hitProfile: [{ maxFraction: 1 }, { maxFraction: 1 }] }));
    expect(r.maxHit).toBe(50);
    expect(r.dps).toBeCloseTo((2 * r.accuracy * CAPPED_0_60) / 3, 12);
  });

  it("two halves of 120: 60 + 60, each capped — max hit 50 + 50 = 100, mean 2 × 1751/61", () => {
    const r = calculateDps(magic(120, { hitProfile: [{ maxFraction: 0.5 }, { maxFraction: 0.5 }] }));
    expect(r.maxHit).toBe(100);
    expect(r.dps).toBeCloseTo((2 * r.accuracy * CAPPED_0_60) / 3, 12);
  });

  it("a ruby proc of 100 lands 47.5, not 100 (max 24: c × 47.5 + (1 − c) × acc × 301/25)", () => {
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: 0.066, procDamage: 100 };
    const r = calculateDps(ranged(80, { boltProc: ruby }));
    expect(r.maxHit).toBe(24);
    // Σ_{r=0..24} r = 300, + 1 for the raised 0.
    const perAttack = 0.066 * 47.5 + (1 - 0.066) * RANGED_ACC * (301 / 25);
    expect(r.dps).toBeCloseTo(perAttack / 2.4, 12);
  });

  it("the Sanguinesti's +8 rides on the hit before the cap: (0.8 × 1082 + 0.2 × 1437)/47 at max 46", () => {
    // Normal: Σ0..46 = 1081, + 1 raised. Leech: 8..54, the four over 50
    // reroll — Σ8..50 = 1247, + 4 × 47.5 = 1437.
    const r = calculateDps(magic(46, { sanguinestiProc: true }));
    expect(r.dps).toBeCloseTo((r.accuracy * (0.8 * 1082 + 0.2 * 1437)) / 47 / 3, 12);
  });

  it("Twinflame, first cast max 60: [cap(h), trunc(2h/5)] — (1751 + 708)/61; max 50 + 24 = 74", () => {
    // Second casts Σ_{h=1..60} ⌊2h/5⌋ = 708 (the raised 0 → 1 gives 0).
    const r = calculateDps(magic(60, { twinflameDoubleCast: true }));
    expect(r.maxHit).toBe(74);
    expect(r.dps).toBeCloseTo((r.accuracy * 2459) / 61 / 3, 12);
  });
});

// ---- 4. wgloop ---------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each npcImmunityAndCapCombos()
 * combo: max hit, the exact attack / NPC defence rolls, and DPS. Before this
 * change the engine scored melee vs these monsters (Scythe vs Zuk 8.178 dps,
 * Whip vs the Kraken 8.434, Scythe vs the Leviathan 2.537, Whip vs Jal-MejJak
 * 7.268, Scythe vs Zulrah 7.651) and never capped Zulrah: Tbow max 66 /
 * 6.746 dps, Tumeken's shadow 51 / 8.112, Noxious halberd 54 / 5.973, Zaryte
 * crossbow + ruby bolts 5.730 (the 110 proc landed whole).
 *
 * The Zaryte crossbow's max hit is not compared: wgloop's includes the
 * (capped) ruby proc, 50; ours is the normal hit, 40.
 */
const WGLOOP: Record<
  string,
  { maxHit: number; attackRoll: number; defenceRoll: number; dps: number }
> = {
  "immune-scythe-tzkal-zuk": { maxHit: 0, attackRoll: 28476, defenceRoll: 17216, dps: 0 },
  "immune-whip-kraken": { maxHit: 0, attackRoll: 23241, defenceRoll: 640, dps: 0 },
  "immune-scythe-the-leviathan": { maxHit: 0, attackRoll: 28476, defenceRoll: 65786, dps: 0 },
  "immune-whip-jal-mejjak": { maxHit: 0, attackRoll: 23241, defenceRoll: 6976, dps: 0 },
  "immune-scythe-zulrah": { maxHit: 0, attackRoll: 28476, defenceRoll: 19776, dps: 0 },
  "zulrah-tbow": { maxHit: 50, attackRoll: 45511, defenceRoll: 35226, dps: 6.209103017169382 },
  "zulrah-tumekens-shadow": { maxHit: 50, attackRoll: 63248, defenceRoll: 5871, dps: 8.090083693428214 },
  "zulrah-noxious-halberd": { maxHit: 50, attackRoll: 29358, defenceRoll: 19776, dps: 5.892162539596035 },
  "zulrah-zcb-ruby-bolts": { maxHit: 50, attackRoll: 37548, defenceRoll: 35226, dps: 4.354807886800273 },
};

describe("immunity and Zulrah-cap combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = npcImmunityAndCapCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: MONSTER_BY_SLUG[combo.bossSlug],
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        baseSpellMaxHit: combo.baseSpellMaxHit,
        spellElement: combo.spellElement,
        autoSpellName: combo.spellName,
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      if (!combo.knownMaxHitResidual) expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
