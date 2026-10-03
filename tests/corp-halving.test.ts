// The Corporeal Beast halves damage from non-corpbane weapons ONE HITSPLAT AT A
// TIME. wgloop's getAttackerDist (src/lib/PlayerVsNPCCalc.ts @ 89c3e25) runs
// `dist.transform(divisionTransformer(2))` — trunc(h/2) on every hitsplat,
// misses included — after the multi-hit split (Scythe / two-hit weapons /
// Dual macuahuitl / Dark bow), the Keris triple, the Sanguinesti leech, the
// opal / pearl / diamond / dragonstone / onyx bolt effects, the seeking-arrow
// floor and the accurate-zero raise (so a raised 1 halves back to 0), and
// BEFORE ruby bolts ("corp takes full ruby bolt effect damage"), the Mad Angel
// buffs and the NPC transforms (phase factors, then flat armour). Corpbane
// (isWearingCorpbaneWeapon): magic, or a stab-style fang / halberd / spear
// other than the Blue moon spear.
//
// Halving the max hit once and taking half of that, as the engine did, runs
// high: Σ_{r=0..M} trunc(r/2) = ⌊M²/4⌋, so the landed mean over 0..M is
// ⌊M²/4⌋/(M+1) — under trunc(M/2)/2 for an even M, equal for an odd one —
// and every split half and bolt bonus truncates on its own. Section 1 checks
// the helper, section 2 every engine mean branch with hand-derived numbers
// (S(M) = ⌊M²/4⌋ below), section 3 locks wgloop's numbers for every
// corpCombos() combo in scripts/oracle/combos.ts.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { fangHitChance, hitChance, meanTransformedRoll, npcDefenceRoll } from "@/lib/dps/common";
import type { BoltProcSpec } from "@/lib/dps/bolts";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { isSplitProfile } from "@/lib/dps/multihit";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { corpCombos } from "@/scripts/oracle/combos";

const halve = (h: number): number => Math.trunc(h / 2);

// ---- 1. the helper -----------------------------------------------------------

describe("meanTransformedRoll — Corp's halving, roll by roll", () => {
  it("0..M halved sums to ⌊M²/4⌋: 0..40 → 400/41, not trunc(40/2)/2 = 10", () => {
    expect(meanTransformedRoll(0, 40, halve)).toBe(400 / 41);
    expect(meanTransformedRoll(0, 28, halve)).toBe(196 / 29);
  });

  it("an odd max halves exactly: 0..41 → 420/42 = 10, 0..11 → 30/12 = 2.5", () => {
    expect(meanTransformedRoll(0, 41, halve)).toBe(10);
    expect(meanTransformedRoll(0, 11, halve)).toBe(2.5);
  });

  it("a range that starts above 0 (the fang's trim, a bolt bonus)", () => {
    // 4..24: S(24) − S(3) = 144 − 2.
    expect(meanTransformedRoll(4, 24, halve)).toBe(142 / 21);
    expect(meanTransformedRoll(5, 4, halve)).toBe(0);
  });
});

// ---- 2. engine mean branches, hand-derived -------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };

/**
 * Melee, aggressive, no prayer, 4-tick (2.4 s), vs Corp's halving. Attack roll
 * 107 × 164 = 17548 vs (100 + 9) × 64 = 6976. Max hit floor(0.5 + 110(S + 64)/640):
 * S = 100 → 28, S = 105 → 29, S = 108 → 30.
 */
function melee(strengthBonus: number, over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "melee", attackStyle: "aggressive", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus, attackSpeedTicks: 4,
    targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
    corpDamageHalved: true, ...over,
  };
}
/** Ranged, rapid (5 → 4 ticks, 2.4 s): the same roll; max floor(0.5 + 107 × 144/640) = 24. */
function ranged(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "ranged", attackStyle: "rapid", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus: 80, attackSpeedTicks: 5,
    targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
    corpDamageHalved: true, ...over,
  };
}
const ACC = hitChance(17548, npcDefenceRoll(100, 0));
const SECONDS = 2.4;

describe("calculateDps vs Corp — single hits", () => {
  it("even max 28: landed mean S(28)/29 = 196/29, not 14/2 (the raised 1 halves to 0)", () => {
    const r = calculateDps(melee(100));
    expect(r.accuracy).toBe(ACC);
    expect(r.maxHit).toBe(14);
    expect(r.dps).toBeCloseTo((ACC * 196) / 29 / SECONDS, 12);
  });

  it("odd max 29: S(29)/30 = 210/30 = 7, what halving the max gave", () => {
    const r = calculateDps(melee(105));
    expect(r.maxHit).toBe(14);
    expect(r.dps).toBeCloseTo((ACC * 7) / SECONDS, 12);
  });

  it("Osmumten's fang (slash): the trim comes off the pre-halving max — 4..24, S(24) − S(3) = 142", () => {
    // trunc(28 × 3/20) = 4; the roll never reaches 0, so nothing to raise.
    const r = calculateDps(melee(100, { fangHitTrim: true }));
    expect(r.dps).toBeCloseTo((ACC * 142) / 21 / SECONDS, 12);
  });

  it("seeking arrows floor at 3 before the halving: (S(24) + 2)/25, 0 1 2 → 1 1 1 not 0 0 1", () => {
    const r = calculateDps(ranged({ seekingArrows: true }));
    expect(r.maxHit).toBe(12);
    expect(r.dps).toBeCloseTo((ACC * 146) / 25 / SECONDS, 12);
  });

  it("a Mad Angel floor runs after the halving: 0..10 halved, floored at trunc(5/2) = 2 → 31/11", () => {
    // Order check only (no Mad Angel is the Corp): halved 0 0 1 1 2 2 3 3 4 4 5,
    // floored at 2 → 2·6 + 3·2 + 4·2 + 5 = 31.
    const r = calculateDps({
      style: "magic", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
      attackBonus: 30, strengthBonus: 0, magicDamagePercent: 0, baseSpellMaxHit: 10,
      attackSpeedTicks: 5, targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
      corpDamageHalved: true, targetAlwaysHit: true, targetMinHitFactor: [1, 2],
    });
    expect(r.maxHit).toBe(5);
    expect(r.dps).toBeCloseTo(31 / 11 / 3, 12);
  });
});

describe("calculateDps vs Corp — each hitsplat of a multi-hit weapon halves on its own", () => {
  it("two halves (Torag's), max 30: 15 + 15, each S(15)/16 = 3.5; max hit 7 + 7 = 14, not 15", () => {
    // Halving the max first split 15 into 7 + 8: mean 7.5 a hit.
    const r = calculateDps(melee(108, { hitProfile: [{ maxFraction: 0.5 }, { maxFraction: 0.5 }] }));
    expect(r.maxHit).toBe(14);
    expect(r.dps).toBeCloseTo((ACC * 7) / SECONDS, 12);
  });

  it("Dual macuahuitl, max 30: the second 3.5 only when the first landed; max 14", () => {
    const r = calculateDps(melee(108, {
      hitProfile: [{ maxFraction: 0.5 }, { maxFraction: 0.5, requiresPrevious: true }],
    }));
    expect(r.maxHit).toBe(14);
    expect(r.dps).toBeCloseTo((ACC * 3.5 + ACC * ACC * 3.5) / SECONDS, 12);
  });

  it("Scythe, max 28: rolls 0..28 / 0..14 / 0..7 → 196/29 + 49/15 + 12/8", () => {
    const r = calculateDps(melee(100, {
      hitProfile: [{ maxFraction: 1 }, { maxFraction: 0.5 }, { maxFraction: 0.25 }],
    }));
    expect(r.maxHit).toBe(14); // the largest hitsplat
    expect(r.dps).toBeCloseTo((ACC * (196 / 29 + 49 / 15 + 1.5)) / SECONDS, 12);
  });

  it("Keris triple: trunc(3d/2), so 50/51 × 196/29 + 1/51 × 602/29", () => {
    // Σ_{d=0..28} trunc(3d/2) = 3·(0+…+14) + (3·(0+…+13) + 14) = 315 + 287.
    const r = calculateDps(melee(100, { kalphiteTripleProc: true }));
    expect(r.dps).toBeCloseTo((ACC * (50 * 196 + 602)) / (29 * 51) / SECONDS, 12);
  });

  it("Sanguinesti's +8 rides on the hit and halves with it: 0.8 · S(10)/11 + 0.2 · (S(18) − S(7))/11", () => {
    // Magic is corpbane, so this never happens in game — order check only.
    const r = calculateDps({
      style: "magic", attackStyle: "accurate", prayers: NO_PRAYER, skills: SKILLS,
      attackBonus: 30, strengthBonus: 0, magicDamagePercent: 0, baseSpellMaxHit: 10,
      attackSpeedTicks: 5, targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
      corpDamageHalved: true, sanguinestiProc: true,
    });
    expect(r.dps).toBeCloseTo((r.accuracy * (0.8 * 25 + 0.2 * 69)) / 11 / 3, 12);
  });
});

describe("calculateDps vs Corp — enchanted bolts (max 24, normal hit S(24)/25 = 144/25)", () => {
  const bolt = (boltProc: BoltProcSpec) => calculateDps(ranged({ boltProc })).dps * SECONDS;

  it("opal: the +9 is added to the roll, then halved with it — and a missed +9 lands 4", () => {
    // 9..33: S(33) − S(8) = 272 − 16 = 256. Halving the max first said 6 + 9.
    const opal: BoltProcSpec = { effect: "opal", kind: "flatBonus", chance: 0.055, bonusDamage: 9, accurateOnly: false };
    expect(bolt(opal)).toBeCloseTo(
      ACC * (0.945 * 144 / 25 + 0.055 * 256 / 25) + (1 - ACC) * 0.055 * 4,
      12,
    );
  });

  it("pearl: +4 → 4..28, S(28) − S(3) = 194; a missed +4 lands 2", () => {
    const pearl: BoltProcSpec = { effect: "pearl", kind: "flatBonus", chance: 0.066, bonusDamage: 4, accurateOnly: false };
    expect(bolt(pearl)).toBeCloseTo(
      ACC * (0.934 * 144 / 25 + 0.066 * 194 / 25) + (1 - ACC) * 0.066 * 2,
      12,
    );
  });

  it("dragonstone: accurate hits only, +19 → 19..43, S(43) − S(18) = 381", () => {
    const ds: BoltProcSpec = { effect: "dragonstone", kind: "flatBonus", chance: 0.066, bonusDamage: 19, accurateOnly: true };
    expect(bolt(ds)).toBeCloseTo(ACC * (0.934 * 144 / 25 + 0.066 * 381 / 25), 12);
  });

  it("diamond: the proc rolls 0..trunc(24 × 115/100) = 27 off the pre-halving max, then halves: 182/28", () => {
    const diamond: BoltProcSpec = { effect: "diamond", kind: "scaledMax", chance: 0.11, effectMaxPercent: 115, accurateOnly: false };
    expect(bolt(diamond)).toBeCloseTo(0.11 * 182 / 28 + 0.89 * ACC * 144 / 25, 12);
  });

  it("onyx: 0..trunc(24 × 120/100) = 28 → 196/29, accurate hits only", () => {
    const onyx: BoltProcSpec = { effect: "onyx", kind: "scaledMax", chance: 0.121, effectMaxPercent: 120, accurateOnly: true };
    expect(bolt(onyx)).toBeCloseTo(ACC * (0.121 * 196 / 29 + 0.879 * 144 / 25), 12);
  });

  it("ruby: fires after the halving — the 100 lands whole, the normal hit is halved", () => {
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: 0.066, procDamage: 100 };
    expect(bolt(ruby)).toBeCloseTo(0.066 * 100 + 0.934 * ACC * 144 / 25, 12);
  });
});

// ---- 3. wgloop ---------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each corpCombos() combo: max
 * hit, the exact attack / NPC defence rolls, and DPS. Before this change the
 * engine halved the max hit once: whip-glory (max 40) +2.5%, Torag's +5.0%,
 * Scythe +4.2%, Dual macuahuitl max 21 (wgloop 20) and +2.1%, seeking arrows
 * +2.9% / +3.8%, and the Armadyl crossbow's opal +20.4%, dragonstone +8.8%,
 * pearl +6.0%, diamond +2.0%, ruby +0.8%, onyx −0.3%. Odd maxes (whip 41,
 * Dark bow 27) and the corpbane rows matched already.
 *
 * Max hits: the Scythe / Dark bow rows report the SUM of their hitsplats'
 * maxima upstream and the bolt rows include the proc hit; ours is one hitsplat
 * / the normal hit, so those aren't compared. The fang reports its trimmed
 * normal max upstream, ours the true max. Split weapons report the whole
 * attack on both sides (Dual macuahuitl 20 = 10 + 10).
 */
const WGLOOP: Record<
  string,
  { maxHit: number; attackRoll: number; defenceRoll: number; dps: number }
> = {
  "corp-whip": { maxHit: 20, attackRoll: 23241, defenceRoll: 84216, dps: 0.5749284586247432 },
  "corp-whip-glory": { maxHit: 20, attackRoll: 22606, defenceRoll: 84216, dps: 0.5455805178472841 },
  "corp-dragon-spear-slash": { maxHit: 18, attackRoll: 19812, defenceRoll: 84216, dps: 0.4410926535022621 },
  "corp-torags-hammers": { maxHit: 20, attackRoll: 23436, defenceRoll: 52316, dps: 0.7110499455243993 },
  "corp-scythe": { maxHit: 35, attackRoll: 28476, defenceRoll: 84216, dps: 0.9462317900275939 },
  "corp-dual-macuahuitl": { maxHit: 20, attackRoll: 27972, defenceRoll: 52316, dps: 0.7058294924895463 },
  "corp-dark-bow": { maxHit: 26, attackRoll: 35658, defenceRoll: 93786, dps: 0.5148568031816776 },
  "corp-scorching-bow-seeking-arrows": { maxHit: 17, attackRoll: 41202, defenceRoll: 93786, dps: 0.760955676159809 },
  "corp-dark-bow-seeking-arrows": { maxHit: 26, attackRoll: 37548, defenceRoll: 93786, dps: 0.5282448526981351 },
  "corp-acb-opal-bolts": { maxHit: 13, attackRoll: 36288, defenceRoll: 52316, dps: 0.5691787614572299 },
  "corp-acb-pearl-bolts": { maxHit: 14, attackRoll: 36288, defenceRoll: 52316, dps: 0.7376177533115431 },
  "corp-acb-dragonstone-bolts": { maxHit: 28, attackRoll: 36288, defenceRoll: 52316, dps: 1.1424536516296364 },
  "corp-acb-diamond-bolts": { maxHit: 20, attackRoll: 36288, defenceRoll: 52316, dps: 1.2676198889410648 },
  "corp-acb-onyx-bolts": { maxHit: 23, attackRoll: 36288, defenceRoll: 52316, dps: 1.1227814399859446 },
  "corp-acb-ruby-bolts": { maxHit: 100, attackRoll: 36288, defenceRoll: 52316, dps: 3.14549472989246 },
  "corp-dragon-spear-stab": { maxHit: 37, attackRoll: 19812, defenceRoll: 28391, dps: 2.693271640640062 },
  "corp-fang-stab": { maxHit: 40, attackRoll: 25956, defenceRoll: 28391, dps: 4.672628829548855 },
  "corp-kodai-fire-surge": { maxHit: 32, attackRoll: 25476, defenceRoll: 76826, dps: 0.8859472147378743 },
};

describe("Corp combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = corpCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const boss = MONSTER_BY_SLUG[combo.bossSlug];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: boss,
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        baseSpellMaxHit: combo.baseSpellMaxHit,
        spellElement: combo.spellElement,
        autoSpellName: combo.spellName,
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));

      const profile = hitProfileForWeapon(r.loadout.slots.weapon?.itemId, { targetSize: boss.size });
      const comparable = (!profile || isSplitProfile(profile)) && !combo.knownMaxHitResidual;
      if (comparable) expect(r.dps.maxHit).toBe(want.maxHit);

      if (r.loadout.slots.weapon?.itemId === 26219 && combo.attackType === "stab") {
        expect(r.dps.accuracy).toBeCloseTo(fangHitChance(want.attackRoll, want.defenceRoll), 12);
      } else {
        expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      }

      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
