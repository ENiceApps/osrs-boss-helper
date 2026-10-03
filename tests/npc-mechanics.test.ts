// NPC-side mechanics wgloop applies after the player's hit is rolled
// (src/lib/PlayerVsNPCCalc.ts @ 89c3e25):
//   - flat armour — applyNpcTransforms' last transform,
//     flatAddTransformer(-flat_armour) on ACCURATE hitsplats, floored at 0,
//     skipped for magic;
//   - flying — isImmune: melee deals nothing to a "flying" monster unless the
//     weapon category is Polearm or Salamander; Vespula is immune to all melee.
// Section 1 checks the helpers and every engine mean branch with hand-derived
// numbers; section 2 the flying rule; section 3 locks the wgloop numbers for
// every npcMechanicCombos() combo in scripts/oracle/combos.ts.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { fangHitChance, hitChance, npcDefenceRoll } from "@/lib/dps/common";
import { armouredHit, meanArmouredHit, sumArmouredHits } from "@/lib/dps/flat-armour";
import { expectedBoltDamagePerAttack, type BoltProcSpec } from "@/lib/dps/bolts";
import { specMaxHitDisplay } from "@/lib/dps/spec-max-hit";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { isSplitProfile } from "@/lib/dps/multihit";
import { isFlyingImmuneToMelee } from "@/data/monsters/melee-reach";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { npcMechanicCombos } from "@/scripts/oracle/combos";
import { buildActiveFlags } from "@/components/ResultsPanel";

// ---- 1. flat armour, hand-derived --------------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };

/**
 * Melee, aggressive, no prayer, 4-tick (2.4 s): attack roll 107 × 164 = 17548
 * vs defence roll (91 + 9) × (36 + 64) = 10000; max hit
 * floor(0.5 + 110 × 239/640) = 41.
 */
function melee(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "melee", attackStyle: "aggressive", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus: 175, attackSpeedTicks: 4,
    targetDefenceLevel: 91, targetDefenceBonusForStyle: 36, ...over,
  };
}
const ACC = hitChance(17548, npcDefenceRoll(91, 36));
const SECONDS = 2.4;

describe("flat armour helpers", () => {
  it("shifts every landed roll, floored at 0", () => {
    expect(meanArmouredHit(0, 39, 0)).toBe(19.5);
    expect(meanArmouredHit(0, 39, -4)).toBe(23.5); // +4 on every roll, the 0 included
    // +1 turns the rolls 0 and 1 into 0: (1 + … + 38) / 40 = 741 / 40.
    expect(sumArmouredHits(0, 39, 1)).toBe(741);
    expect(meanArmouredHit(0, 39, 1)).toBe(18.525);
    expect(meanArmouredHit(0, 10, 15)).toBe(0); // armour above the max hit
    expect(meanArmouredHit(0, 41, -2, 3)).toBe(63.5); // Keris triple: 3 × 20.5 + 2
    expect(meanArmouredHit(6, 35, 3)).toBe(17.5); // a fang roll never reaches the floor
    expect(armouredHit(45, 15)).toBe(30);
    expect(armouredHit(1, 2)).toBe(0);
  });
});

describe("flat armour in the engine (single hit)", () => {
  it("negative armour adds to every landed hit and the max hit", () => {
    const r = calculateDps(melee({ targetFlatArmour: -2 }));
    expect(r.maxHit).toBe(43);
    expect(r.flatArmour).toEqual({ armour: -2, rawMaxHit: 41 });
    expect(r.dps).toBeCloseTo((ACC * 22.5) / SECONDS, 12);
  });

  it("positive armour subtracts, clipping low rolls at 0", () => {
    // Rolls 4..41 deal 1..38; 0..3 deal 0: 741 / 42 per landed hit.
    const r = calculateDps(melee({ targetFlatArmour: 3 }));
    expect(r.maxHit).toBe(38);
    expect(r.dps).toBeCloseTo((ACC * 741) / 42 / SECONDS, 12);
  });

  it("armour at or above the max hit deals nothing", () => {
    const r = calculateDps(melee({ targetFlatArmour: 50 }));
    expect(r.maxHit).toBe(0);
    expect(r.dps).toBe(0);
  });

  it("no armour leaves the result untouched (no flatArmour key)", () => {
    expect(calculateDps(melee({ targetFlatArmour: 0 }))).toEqual(calculateDps(melee()));
    expect(calculateDps(melee())).not.toHaveProperty("flatArmour");
  });

  it("magic ignores flat armour", () => {
    const magic: DpsScenario = {
      style: "magic", attackStyle: "longrange", prayers: NO_PRAYER, skills: SKILLS,
      attackBonus: 30, strengthBonus: 0, attackSpeedTicks: 5,
      baseSpellMaxHit: 24, spellElement: "fire", magicDamagePercent: 25,
      targetDefenceLevel: 91, targetDefenceBonusForStyle: 36,
    };
    expect(calculateDps({ ...magic, targetFlatArmour: -2 })).toEqual(calculateDps(magic));
  });

  it("a 0 max hit stays 0 (upstream returns all misses before any NPC transform)", () => {
    // Strength bonus −64 zeroes the max hit: floor(0.5 + 110 × 0 / 640) = 0.
    const r = calculateDps(melee({ strengthBonus: -64, targetFlatArmour: -2 }));
    expect(r).toEqual({ dps: 0, maxHit: 0, accuracy: r.accuracy });
  });

  it("immunity still wins", () => {
    const r = calculateDps(melee({ targetFlatArmour: -2, targetImmune: true }));
    expect(r).toEqual({ dps: 0, maxHit: 0, accuracy: ACC });
  });

  it("raised minimum hit: the floor is applied first, then the armour", () => {
    // Mad Angel ×1/2: min 20, so rolls 0..20 all deal 20.
    // −2: [21 × 22 + Σ(23..43)] / 42 = 1155 / 42 = 27.5.
    const neg = calculateDps(melee({ targetMinHitFactor: [1, 2], targetFlatArmour: -2 }));
    expect(neg.dps).toBeCloseTo((ACC * 27.5) / SECONDS, 12);
    // +3: [21 × 17 + Σ(18..38)] / 42 = 945 / 42 = 22.5.
    const pos = calculateDps(melee({ targetMinHitFactor: [1, 2], targetFlatArmour: 3 }));
    expect(pos.dps).toBeCloseTo((ACC * 22.5) / SECONDS, 12);
  });

  it("Keris vs an armoured kalphite: the armour shifts the TRIPLED hit", () => {
    // (50 × (20.5 + 2) + (61.5 + 2)) / 51 per landed hit — not ×53/51 of 22.5.
    // wgloop, Keris dagger vs Locust rider (−2), same rule: max 125 = 3 × 41 + 2,
    // DPS 5.548985 = this formula at acc 0.570890 + its accurate-zero term.
    const r = calculateDps(melee({ kalphiteTripleProc: true, targetFlatArmour: -2 }));
    expect(r.dps).toBeCloseTo((ACC * (50 * 22.5 + 63.5)) / 51 / SECONDS, 12);
    expect(r.maxHit).toBe(43);
  });

  it("Osmumten's fang: positive armour clips the trimmed roll, not 0..max", () => {
    // max 41 rolls 6..35 (6 = trunc(41 × 3/20)); +3 never reaches 0: 20.5 − 3.
    const r = calculateDps(melee({ fangHitTrim: true, targetFlatArmour: 3 }));
    expect(r.dps).toBeCloseTo((ACC * 17.5) / SECONDS, 12);
    // Without armour the trim is mean-neutral.
    expect(calculateDps(melee({ fangHitTrim: true }))).toEqual(calculateDps(melee()));
  });
});

describe("flat armour on multi-hit weapons — every landed hitsplat", () => {
  const scythe3 = hitProfileForWeapon(22325, { targetSize: 3 })!;

  it("Scythe (3 hitsplats) vs −2: +2 on each", () => {
    // 41/2 + 20.5/2 + 10.25/2 + 3 × 2 = 41.875 per landed-all attack.
    const r = calculateDps(melee({ hitProfile: scythe3, targetFlatArmour: -2 }));
    expect(r.dps).toBeCloseTo((ACC * 41.875) / SECONDS, 12);
  });

  it("Scythe vs +3: each hitsplat clips at its own integer max (41 / 20 / 10)", () => {
    // f·M/2 + [mean of 0..m after armour − m/2] per hitsplat.
    const perAttack = 741 / 42 + (0.25 + 153 / 21) + (0.125 + 28 / 11);
    const r = calculateDps(melee({ hitProfile: scythe3, targetFlatArmour: 3 }));
    expect(r.dps).toBeCloseTo((ACC * perAttack) / SECONDS, 12);
  });

  it("Dual macuahuitl: the second half only lands after the first", () => {
    const r = calculateDps(melee({ hitProfile: hitProfileForWeapon(28997), targetFlatArmour: -2 }));
    expect(r.dps).toBeCloseTo(((ACC + ACC * ACC) * (10.25 + 2)) / SECONDS, 12);
  });

  it("max hit: a split weapon shifts each half, others their largest hitsplat", () => {
    // Halves of 41 are 20 + 21 (upstream's trunc(M/2) and M − trunc(M/2)).
    const mac = hitProfileForWeapon(28997);
    expect(calculateDps(melee({ hitProfile: mac, targetFlatArmour: -2 })).maxHit).toBe(22 + 23);
    expect(calculateDps(melee({ hitProfile: mac, targetFlatArmour: 3 })).maxHit).toBe(17 + 18);
    // Scythe: the first (largest) hitsplat, as without armour.
    expect(calculateDps(melee({ hitProfile: scythe3, targetFlatArmour: -2 })).maxHit).toBe(43);
  });

  it("two-halves weapons get a profile only vs flat armour", () => {
    for (const id of [4747, 4958, 29084, 29889, 30957]) {
      expect(hitProfileForWeapon(id)).toBeUndefined();
      expect(hitProfileForWeapon(id, { targetFlatArmour: 0 })).toBeUndefined();
      expect(hitProfileForWeapon(id, { targetFlatArmour: -2 })).toEqual([
        { maxFraction: 0.5 },
        { maxFraction: 0.5 },
      ]);
    }
    // Torag's hammers vs −2: two independent halves, +2 each.
    const r = calculateDps(melee({
      hitProfile: hitProfileForWeapon(4747, { targetFlatArmour: -2 }),
      targetFlatArmour: -2,
    }));
    expect(r.dps).toBeCloseTo((ACC * (41 / 2 + 4)) / SECONDS, 12);
  });
});

describe("flat armour on enchanted-bolt procs", () => {
  const acc = 0.8;
  const max = 24; // rolls 0..24: mean 12

  it("no armour keeps the original formula exactly", () => {
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: 0.066, procDamage: 45 };
    expect(expectedBoltDamagePerAttack(acc, max, ruby, 0)).toBe(
      expectedBoltDamagePerAttack(acc, max, ruby),
    );
  });

  it("ruby: the fixed proc hit takes the armour too", () => {
    // +15: proc 45 → 30; a normal landed hit (16..24 → 1..9) averages 45/25.
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: 0.066, procDamage: 45 };
    expect(expectedBoltDamagePerAttack(acc, max, ruby, 15)).toBeCloseTo(
      0.066 * 30 + 0.934 * acc * (45 / 25),
      12,
    );
  });

  it("opal: bonus on a landed hit is shifted, bonus on a miss is not", () => {
    const opal: BoltProcSpec = {
      effect: "opal", kind: "flatBonus", chance: 0.055, bonusDamage: 9, accurateOnly: false,
    };
    expect(expectedBoltDamagePerAttack(acc, max, opal, -2)).toBeCloseTo(
      acc * (0.055 * (12 + 9 + 2) + 0.945 * (12 + 2)) + (1 - acc) * 0.055 * 9,
      12,
    );
  });

  it("dragonstone: accurate-only bonus", () => {
    const ds: BoltProcSpec = {
      effect: "dragonstone", kind: "flatBonus", chance: 0.066, bonusDamage: 19, accurateOnly: true,
    };
    expect(expectedBoltDamagePerAttack(acc, max, ds, -2)).toBeCloseTo(
      acc * (0.066 * (12 + 19 + 2) + 0.934 * (12 + 2)),
      12,
    );
  });

  it("diamond: the proc roll (0..trunc(24 × 115/100) = 27) lands as an accurate hit", () => {
    const diamond: BoltProcSpec = {
      effect: "diamond", kind: "scaledMax", chance: 0.11, effectMaxPercent: 115, accurateOnly: false,
    };
    expect(expectedBoltDamagePerAttack(acc, max, diamond, -2)).toBeCloseTo(
      0.11 * (13.5 + 2) + 0.89 * acc * (12 + 2),
      12,
    );
  });

  it("onyx vs positive armour: both rolls clip", () => {
    // +3: proc 0..28 → (1 + … + 25) / 29; normal 0..24 → (1 + … + 21) / 25.
    const onyx: BoltProcSpec = {
      effect: "onyx", kind: "scaledMax", chance: 0.121, effectMaxPercent: 120, accurateOnly: true,
    };
    expect(expectedBoltDamagePerAttack(acc, max, onyx, 3)).toBeCloseTo(
      acc * (0.121 * (325 / 29) + 0.879 * (231 / 25)),
      12,
    );
  });
});

describe("flat armour in the catalog, phases and displays", () => {
  it("the catalog carries flatArmour only where it's non-zero", () => {
    expect(MONSTER_BY_SLUG["gargoyle"].defenceBonuses.flatArmour).toBe(-2);
    expect(MONSTER_BY_SLUG["earthen-nagua"].defenceBonuses.flatArmour).toBe(-4);
    expect(MONSTER_BY_SLUG["skeleton-heavy"].defenceBonuses.flatArmour).toBe(1);
    expect(MONSTER_BY_SLUG["general-graardor"].defenceBonuses).not.toHaveProperty("flatArmour");
  });

  it("a phase's own value replaces the parent's (Dusk −1 → second form 0)", () => {
    const dusk = MONSTER_BY_SLUG["dusk"];
    expect(dusk.defenceBonuses.flatArmour).toBe(-1);
    const second = phaseOptionsFor(dusk).find((o) => o.stats?.version === "Second form");
    expect(second).toBeDefined();
    expect(applyPhase(dusk, second).defenceBonuses.flatArmour).toBeUndefined();
  });

  it("magic loadouts never report it", () => {
    const r = scoreScenario({
      itemIds: [21006, 21018, 12002, 21021, 21024, 13235, 11770],
      target: MONSTER_BY_SLUG["gargoyle"],
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "magic", choice: "longrange" },
      baseSpellMaxHit: 24,
      spellElement: "fire",
      autoSpellName: "Fire Surge",
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(r.dps).not.toHaveProperty("flatArmour");
  });

  it("spec max hits are derived from the pre-armour hit, then shifted", () => {
    // Fang: true max 41 + 2 = 43 reported. Normal 41 − 6 = 35 → 37; spec 41 → 43.
    const fang = specMaxHitDisplay(26219, 43, { armour: -2, rawMaxHit: 41 })!;
    expect(fang.normalMaxHit).toBe(37);
    expect(fang.specMaxHit).toBe(43);
    // AGS vs +2: raw 40 → spec trunc(40 × 11/8) = 55 → 53.
    const ags = specMaxHitDisplay(11802, 38, { armour: 2, rawMaxHit: 40 })!;
    expect(ags.normalMaxHit).toBe(38);
    expect(ags.specMaxHit).toBe(53);
    // Voidwaker's spec is magic damage — no armour on the spec roll (60 / 20 from raw 40).
    const vw = specMaxHitDisplay(27690, 42, { armour: -2, rawMaxHit: 40 })!;
    expect(vw.normalMaxHit).toBe(42);
    expect(vw.specMaxHit).toBe(60);
    expect(vw.minHit).toBe(20);
  });
});

// ---- 2. flying ---------------------------------------------------------------

describe("flying monsters and melee", () => {
  const kree = MONSTER_BY_SLUG["kreearra"];
  const vespula = MONSTER_BY_SLUG["vespula"];

  it("only a Polearm or Salamander reaches a flying target; Vespula never", () => {
    expect(isFlyingImmuneToMelee(kree, "Whip")).toBe(true);
    expect(isFlyingImmuneToMelee(kree, "Scythe")).toBe(true); // upstream doesn't exempt it
    expect(isFlyingImmuneToMelee(kree, undefined)).toBe(true);
    expect(isFlyingImmuneToMelee(kree, "Polearm")).toBe(false);
    expect(isFlyingImmuneToMelee(kree, "Salamander")).toBe(false);
    expect(isFlyingImmuneToMelee(vespula, "Polearm")).toBe(true);
    expect(isFlyingImmuneToMelee(MONSTER_BY_SLUG["general-graardor"], "Whip")).toBe(false);
  });

  it("melee without reach scores 0 (accuracy still reported); ranged is unaffected", () => {
    const whip = scoreScenario({
      itemIds: [4151, 24271, 19553, 21295, 11832, 11834, 22981, 13239, 11773],
      target: kree,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "slash", choice: "controlled" },
    });
    if (!whip.valid) throw new Error(whip.reasons.join("; "));
    expect(whip.activeBonuses.flyingMeleeImmune).toBe(true);
    expect(buildActiveFlags(whip.loadout, whip.activeBonuses)).toContain(
      "Flying: melee can't reach it without a halberd or salamander",
    );
    expect(whip.dps.dps).toBe(0);
    expect(whip.dps.maxHit).toBe(0);
    expect(whip.dps.accuracy).toBeGreaterThan(0);

    const acb = scoreScenario({
      itemIds: [11785, 9144, 11826, 19547, 21914, 11828, 11830, 26235, 13237, 11771],
      target: kree,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "ranged", choice: "rapid" },
    });
    if (!acb.valid) throw new Error(acb.reasons.join("; "));
    expect(acb.activeBonuses.flyingMeleeImmune).toBe(false);
    expect(acb.dps.dps).toBeGreaterThan(0);
  });
});

// ---- 3. wgloop ---------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each npcMechanicCombos() combo:
 * max hit, the exact attack / NPC defence rolls, and DPS. Before this change
 * the armoured rows were short by the armour on every landed hitsplat (whip vs
 * Earthen nagua: max 41, not 45) and the flying rows scored melee.
 *
 * Max hits: Scythe / Dark bow rows report the SUM of their hitsplats' maxima
 * upstream (Scythe vs Gargoyle 76 = 42 + 22 + 12) and the bolt rows include
 * the proc hit; ours is one hitsplat / the normal hit, so those aren't
 * compared. Split weapons (Torag's, Dual macuahuitl) report the whole attack
 * on both sides (Torag's vs Gargoyle 44 = 22 + 22). DPS: ours is
 * short by wgloop's accurate-zero raise (an accurate 0 deals 1, which the
 * engine doesn't model) — acc/(max+1) per hitsplat, ~0.1–0.5% here. Positive
 * armour of 1+ swallows that 1, so those rows match exactly.
 */
const WGLOOP: Record<
  string,
  { maxHit: number; attackRoll: number; defenceRoll: number; dps: number; exactDps?: true }
> = {
  "armour-whip-earthen-nagua": { maxHit: 45, attackRoll: 23241, defenceRoll: 5586, dps: 8.989882847554306 },
  "armour-scythe-gargoyle": { maxHit: 76, attackRoll: 28476, defenceRoll: 14384, dps: 10.255194892388621 },
  "armour-torags-hammers-gargoyle": { maxHit: 44, attackRoll: 23436, defenceRoll: 5104, dps: 7.156845335451813 },
  "armour-dual-macuahuitl-earthen-nagua": { maxHit: 50, attackRoll: 27972, defenceRoll: 5586, dps: 10.365638378415543 },
  "armour-fang-drake": { maxHit: 38, attackRoll: 25956, defenceRoll: 8901, dps: 6.725516560724347, exactDps: true },
  "armour-dark-bow-riyl-shade": { maxHit: 60, attackRoll: 35658, defenceRoll: 4416, dps: 6.46306732822409 },
  "armour-ruby-bolts-veiled-kraken": { maxHit: 30, attackRoll: 35028, defenceRoll: 7936, dps: 2.383493260024705, exactDps: true },
  "armour-diamond-bolts-gargoyle": { maxHit: 43, attackRoll: 35028, defenceRoll: 5104, dps: 6.334204012661008 },
  "armour-opal-bolts-gargoyle": { maxHit: 29, attackRoll: 35028, defenceRoll: 5104, dps: 3.579801580444874 },
  "armour-dhcb-drake": { maxHit: 48, attackRoll: 46355, defenceRoll: 8256, dps: 7.001646253462126, exactDps: true },
  "flying-whip-kreearra": { maxHit: 0, attackRoll: 23241, defenceRoll: 65636, dps: 0 },
  "flying-dragon-halberd-kreearra": { maxHit: 43, attackRoll: 24696, defenceRoll: 65636, dps: 0.9640418998707769 },
  "flying-scythe-flight-kilisa": { maxHit: 0, attackRoll: 28476, defenceRoll: 11776, dps: 0 },
  "flying-dragon-halberd-aviansie": { maxHit: 43, attackRoll: 24696, defenceRoll: 10816, dps: 4.0021283058898955 },
  "flying-dragon-halberd-vespula": { maxHit: 0, attackRoll: 24696, defenceRoll: 6208, dps: 0 },
};

describe("NPC-mechanic combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = npcMechanicCombos();

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
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));

      // A split weapon's max hit is the whole attack on both sides; other
      // multi-hit weapons report one hitsplat here, the sum upstream.
      const profile = hitProfileForWeapon(r.loadout.slots.weapon?.itemId, {
        targetSize: boss.size,
        targetFlatArmour: boss.defenceBonuses.flatArmour,
      });
      const comparable = (!profile || isSplitProfile(profile)) && !combo.knownMaxHitResidual;
      if (comparable) expect(r.dps.maxHit).toBe(want.maxHit);

      const isFang = r.loadout.slots.weapon?.itemId === 26219;
      if (isFang) {
        expect(r.dps.accuracy).toBeCloseTo(fangHitChance(want.attackRoll, want.defenceRoll), 12);
      } else {
        expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      }

      if (want.dps === 0 || want.exactDps) {
        expect(r.dps.dps).toBeCloseTo(want.dps, 9);
      } else {
        // Within the oracle's 0.5% DPS tolerance, and never above wgloop (the
        // accurate-zero raise only ever adds damage upstream).
        expect(r.dps.dps).toBeLessThanOrEqual(want.dps);
        expect((want.dps - r.dps.dps) / want.dps).toBeLessThan(0.005);
      }
    });
  }
});
