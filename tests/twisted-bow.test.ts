// Twisted bow scaling, as weirdgloop/osrs-dps-calc @ 89c3e25 computes it
// (src/lib/PlayerVsNPCCalc.ts L566-573 accuracy, L744-748 max hit,
// `tbowScaling` L2429-2438) and the wiki describes it
// (https://oldschool.runescape.wiki/w/Twisted_bow):
//   - the bow scales off min(cap, max(Magic level, magic attack bonus)),
//     cap 250, or 350 vs Xerician (Chambers of Xeric) targets;
//   - the bonus percents are CLAMPED: 140% accuracy, 250% damage.
// The engine used to skip the clamp (141% accuracy at magic 250, 150% at a
// Xerician 350) and read the Magic level alone (Araxxor 190, not its 260 magic
// attack). Section 1 checks the helpers with hand-derived numbers, section 2
// the engine and the catalog plumbing, section 3 locks the wgloop numbers for
// every twistedBowCombos() combo in scripts/oracle/combos.ts.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance } from "@/lib/dps/common";
import {
  applyTwistedBow,
  twistedBowBonusPct,
  twistedBowMagic,
} from "@/lib/dps/twisted-bow";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { twistedBowReason } from "@/lib/loadout-explain";
import { buildActiveFlags } from "@/components/ResultsPanel";
import { twistedBowCombos } from "@/scripts/oracle/combos";

// ---- 1. the helpers, hand-derived ---------------------------------------------
//
// bonus = base + trunc((3m − f) / 100) − trunc((trunc(3m / 10) − 10f)² / 100),
// f = 10 / base 140 (accuracy), f = 14 / base 250 (damage), then clamped.

describe("twistedBowBonusPct", () => {
  it("magic 250: accuracy 140, clamped from 141; damage 215", () => {
    // accuracy: 140 + trunc(740/100) − trunc((75 − 100)²/100) = 140 + 7 − 6 = 141 → 140
    expect(twistedBowBonusPct(250, "accuracy")).toBe(140);
    // damage: 250 + trunc(736/100) − trunc((75 − 140)²/100) = 250 + 7 − 42 = 215
    expect(twistedBowBonusPct(250, "damage")).toBe(215);
  });

  it("magic 350 (the Xerician cap): accuracy 140, clamped from 150; damage 248", () => {
    // accuracy: 140 + trunc(1040/100) − trunc((105 − 100)²/100) = 140 + 10 − 0 = 150 → 140
    expect(twistedBowBonusPct(350, "accuracy")).toBe(140);
    // damage: 250 + trunc(1036/100) − trunc((105 − 140)²/100) = 250 + 10 − 12 = 248
    expect(twistedBowBonusPct(350, "damage")).toBe(248);
  });

  it("below the clamp the curve is unchanged", () => {
    // Magic 220 (Cerberus): 140 + 6 − trunc(34²/100) = 135; 250 + 6 − trunc(74²/100) = 202.
    expect(twistedBowBonusPct(220, "accuracy")).toBe(135);
    expect(twistedBowBonusPct(220, "damage")).toBe(202);
    // Magic 190 (Araxxor's level): 140 + 5 − 18 = 127; 250 + 5 − 68 = 187.
    expect(twistedBowBonusPct(190, "accuracy")).toBe(127);
    expect(twistedBowBonusPct(190, "damage")).toBe(187);
    // Magic 0: trunc(−10/100) is 0, so 140 − 100 = 40 and 250 − 196 = 54.
    expect(twistedBowBonusPct(0, "accuracy")).toBe(40);
    expect(twistedBowBonusPct(0, "damage")).toBe(54);
  });

  it("applies with one truncation", () => {
    expect(applyTwistedBow(17548, 250, "accuracy")).toBe(24567); // trunc(17548 × 1.40)
    expect(applyTwistedBow(27, 250, "damage")).toBe(58); // trunc(27 × 2.15)
  });
});

describe("twistedBowMagic", () => {
  it("takes the magic attack bonus when it is higher (Araxxor 190 / 260 → capped 250)", () => {
    expect(twistedBowMagic(190, 260, false)).toEqual({
      magic: 250, source: "magicAttackBonus", cap: 250, capped: true,
    });
  });

  it("an uncapped magic attack bonus is used as is (Zebak 100 / 215)", () => {
    expect(twistedBowMagic(100, 215, false)).toEqual({
      magic: 215, source: "magicAttackBonus", cap: 250, capped: false,
    });
  });

  it("the Magic level wins ties and lower bonuses", () => {
    expect(twistedBowMagic(150, 150, false).source).toBe("magicLevel"); // Vorkath
    expect(twistedBowMagic(220, 50, false)).toEqual({
      magic: 220, source: "magicLevel", cap: 250, capped: false,
    });
  });

  it("caps at 250, or 350 vs Xerician targets", () => {
    expect(twistedBowMagic(300, 200, false).magic).toBe(250); // Commander Zilyana
    expect(twistedBowMagic(250, 60, true)).toEqual({
      magic: 250, source: "magicLevel", cap: 350, capped: false,
    }); // Great Olm's head
    expect(twistedBowMagic(390, 0, true)).toEqual({
      magic: 350, source: "magicLevel", cap: 350, capped: true,
    }); // Ice demon
  });
});

// ---- 2. the engine ------------------------------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };

/**
 * Ranged, rapid, no prayer: effective level 99 + 8 = 107, attack roll
 * 107 × (100 + 64) = 17548, max hit floor(0.5 + 107 × 164/640) = 27, vs a
 * defence roll of (100 + 9) × (50 + 64) = 12426.
 */
function tbow(over: Partial<DpsScenario>): DpsScenario {
  return {
    style: "ranged", attackStyle: "rapid", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus: 100, attackSpeedTicks: 5,
    targetDefenceLevel: 100, targetDefenceBonusForStyle: 50,
    twistedBowEquipped: true, ...over,
  };
}
const DEF = 12426;

describe("Twisted bow in the engine", () => {
  it("magic 250: ×140/100 accuracy (not ×141), ×215/100 damage", () => {
    const r = calculateDps(tbow({ targetMonsterMagicLevel: 250 }));
    expect(r.accuracy).toBe(hitChance(24567, DEF)); // trunc(17548 × 140/100); 141 gave 24742
    expect(r.maxHit).toBe(58);
  });

  it("Xerician magic 350: ×140/100 accuracy (not ×150), ×248/100 damage", () => {
    const r = calculateDps(tbow({ targetMonsterMagicLevel: 350, targetIsXerician: true }));
    expect(r.accuracy).toBe(hitChance(24567, DEF)); // 150 gave 26322
    expect(r.maxHit).toBe(66); // trunc(27 × 248/100)
    // Over the cap (Ice demon, 390) is the same as at it.
    expect(calculateDps(tbow({ targetMonsterMagicLevel: 390, targetIsXerician: true }))).toEqual(r);
  });

  it("outside the Chambers the 250 cap holds", () => {
    expect(calculateDps(tbow({ targetMonsterMagicLevel: 350 }))).toEqual(
      calculateDps(tbow({ targetMonsterMagicLevel: 250 })),
    );
  });

  it("scales off the magic attack bonus when it beats the Magic level (Araxxor 190 / 260)", () => {
    const r = calculateDps(tbow({ targetMonsterMagicLevel: 190, targetMagicAttackBonus: 260 }));
    // 260 → capped 250: the same as magic 250, not magic 190 (127% / 187%: max 50).
    expect(r).toEqual(calculateDps(tbow({ targetMonsterMagicLevel: 250 })));
    expect(r.maxHit).toBe(58);
    expect(calculateDps(tbow({ targetMonsterMagicLevel: 190 })).maxHit).toBe(50);
  });

  it("a lower magic attack bonus changes nothing", () => {
    expect(calculateDps(tbow({ targetMonsterMagicLevel: 220, targetMagicAttackBonus: 50 }))).toEqual(
      calculateDps(tbow({ targetMonsterMagicLevel: 220 })),
    );
  });

  it("no Tbow, no scaling", () => {
    const off = { twistedBowEquipped: false };
    expect(calculateDps(tbow({ ...off, targetMonsterMagicLevel: 250, targetMagicAttackBonus: 600 }))).toEqual(
      calculateDps(tbow({ ...off })),
    );
  });
});

describe("Twisted bow through the catalog", () => {
  const GEAR = [20997, 11212, 11826, 19547, 21914, 11828, 11830, 26235, 13237, 11771];
  const score = (target: Parameters<typeof scoreScenario>[0]["target"]) => {
    const r = scoreScenario({
      itemIds: GEAR,
      target,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "ranged", choice: "rapid" },
      onTask: false,
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    return r;
  };

  it("the catalog carries the magic attack bonus (upstream offensive.magic)", () => {
    expect(MONSTER_BY_SLUG["araxxor"].magicAttackBonus).toBe(260);
    expect(MONSTER_BY_SLUG["nylocas-vasilias"].magicAttackBonus).toBe(600);
    expect(MONSTER_BY_SLUG["great-olm"].magicAttackBonus).toBe(60);
    // Omitted when 0.
    expect(MONSTER_BY_SLUG["general-graardor"]).not.toHaveProperty("magicAttackBonus");
  });

  it("Araxxor scales off 250 (its magic attack, capped), not its Magic level of 190", () => {
    const r = score(MONSTER_BY_SLUG["araxxor"]);
    expect(r.activeBonuses.targetMagicAttackBonus).toBe(260);
    expect(r.dps.maxHit).toBe(66); // the cap's 215%; Magic 190's 187% gave 57
    expect(twistedBowReason(r.activeBonuses)).toBe(
      "scales with the target's magic attack bonus (260, above its Magic level of 190), capped at 250: +40% accuracy, +115% damage",
    );
    expect(buildActiveFlags(r.loadout, r.activeBonuses)).toContain(
      "Tbow +40% acc / +115% dmg (magic attack 260, capped at 250)",
    );
  });

  it("the explanation names the Magic level when it wins, and the Chambers cap", () => {
    const olm = score(MONSTER_BY_SLUG["great-olm"]);
    expect(twistedBowReason(olm.activeBonuses)).toBe(
      "scales with the target's Magic level (250), under the Chambers of Xeric cap of 350: +40% accuracy, +115% damage",
    );
    expect(buildActiveFlags(olm.loadout, olm.activeBonuses)).toContain(
      "Tbow +40% acc / +115% dmg (Magic 250, CoX cap 350)",
    );
    const cerb = score(MONSTER_BY_SLUG["cerberus"]);
    expect(twistedBowReason(cerb.activeBonuses)).toBe(
      "scales with the target's Magic level (220): +35% accuracy, +102% damage",
    );
  });

  it("a stat phase brings its own magic attack bonus, or none", () => {
    // Mad Angel: post-quest 280 (Magic 150), quest 180 (Magic 100).
    const angel = MONSTER_BY_SLUG["mad-angel"];
    const quest = phaseOptionsFor(angel).find((o) => o.stats?.version === "Quest");
    expect(applyPhase(angel, quest).magicAttackBonus).toBe(180);
    // Spiritual mage: Zaros 52, the Armadyl version has none — it must not
    // inherit Zaros's 52 through the phase spread.
    const mage = MONSTER_BY_SLUG["spiritual-mage"];
    const armadyl = phaseOptionsFor(mage).find((o) => o.stats?.version === "Armadyl");
    expect(mage.magicAttackBonus).toBe(52);
    expect(applyPhase(mage, armadyl).magicAttackBonus).toBeUndefined();
  });
});

// ---- 3. wgloop ----------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each twistedBowCombos() combo:
 * max hit, the exact attack / NPC defence rolls, and DPS. Before this change
 * every row diverged:
 *   - Great Olm (Magic 250, Xerician): roll 45836 at 141% (wgloop 45511 at
 *     140%), DPS 8.829 vs 8.813;
 *   - Commander Zilyana (Magic 300 → 250): the same roll, DPS 4.977 vs 4.942;
 *   - Araxxor (Magic 190, magic attack 260): max 57, DPS 4.831 vs 66 / 6.095;
 *   - Nylocas Vasilias (Magic 50, magic attack 600): max 29, DPS 4.436 vs
 *     66 / 10.548;
 *   - Zebak (Magic 100, magic attack 215): max 40, DPS 5.157 vs 61 / 8.567.
 */
const WGLOOP: Record<string, { maxHit: number; attackRoll: number; defenceRoll: number; dps: number }> = {
  "tbow-great-olm": { maxHit: 66, attackRoll: 45511, defenceRoll: 18126, dps: 8.813265365910821 },
  "tbow-commander-zilyana": { maxHit: 66, attackRoll: 45511, defenceRoll: 50676, dps: 4.941565432894332 },
  "tbow-araxxor": { maxHit: 66, attackRoll: 45511, defenceRoll: 40608, dps: 6.09514870715853 },
  "tbow-nylocas-vasilias": { maxHit: 66, attackRoll: 45511, defenceRoll: 3776, dps: 10.548207722155613 },
  "tbow-zebak": { maxHit: 61, attackRoll: 43560, defenceRoll: 13746, dps: 8.566877297019902 },
};

describe("Twisted bow combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = twistedBowCombos();

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
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
