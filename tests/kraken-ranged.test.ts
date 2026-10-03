// The Kraken's ranged ÷7 (weirdgloop/osrs-dps-calc @ 89c3e25):
//
//   if (['Kraken', 'Cave kraken'].includes(this.monster.name) && styleType === 'ranged') {
//     relevantEffects.push([divisionTransformer(7, 1)]);   // PlayerVsNPCCalc L1945-1948
//   }
//
// divisionTransformer(7, 1) = multiplyTransformer(1, 7, 1) (HitDist.ts
// L499-519): a hitsplat d of at least 1 lands max(1, trunc(d/7)); a 0 stays 0.
// With the default transform options it reaches inaccurate hitsplats too (an
// opal bonus on a miss). It is an NPC transform, so it runs after the
// accurate-zero raise and ruby bolts (getAttackerDist), after Zulrah's cap
// (the first NPC transform) and before the phase factors and flat armour.
// The wiki (Kraken): ranged "deals 1/7th of its normal damage".
//
// Section 1 checks which targets / styles, section 2 every engine mean branch
// with hand-derived numbers, section 3 the spec-max display (and Zulrah's cap
// there), section 4 locks wgloop's numbers for krakenRangedCombos().

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance, npcDefenceRoll } from "@/lib/dps/common";
import type { BoltProcSpec } from "@/lib/dps/bolts";
import { specMaxHitDisplay } from "@/lib/dps/spec-max-hit";
import { ZULRAH_DAMAGE_CAP } from "@/data/monsters/damage-cap";
import { KRAKEN_RANGED_SCALE, styleDamageScaleFor } from "@/data/monsters/style-damage-scale";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { krakenRangedCombos } from "@/scripts/oracle/combos";

// ---- 1. which targets, which styles -------------------------------------------

describe("styleDamageScaleFor — ranged vs the Kraken and the Cave kraken, by name", () => {
  it("both forms of each (the Whirlpools share the name), ranged only", () => {
    for (const slug of ["kraken", "cave-kraken"]) {
      const boss = MONSTER_BY_SLUG[slug];
      for (const option of phaseOptionsFor(boss)) {
        const form = applyPhase(boss, option);
        expect(styleDamageScaleFor(form, "ranged"), `${slug} ${option.label}`).toBe(KRAKEN_RANGED_SCALE);
        expect(styleDamageScaleFor(form, "magic"), `${slug} ${option.label}`).toBeUndefined();
        expect(styleDamageScaleFor(form, "melee"), `${slug} ${option.label}`).toBeUndefined();
      }
    }
    expect(KRAKEN_RANGED_SCALE).toEqual({ factor: [1, 7], minimum: 1 });
  });

  it("not the other krakens, not Zulrah", () => {
    for (const slug of ["veiled-kraken", "armoured-kraken", "vampyre-kraken", "zulrah"]) {
      expect(styleDamageScaleFor(MONSTER_BY_SLUG[slug], "ranged"), slug).toBeUndefined();
    }
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
 * Ranged, rapid (5 → 4 ticks, 2.4 s), no prayer: effective strength 107, max
 * floor(0.5 + 107 × (S + 64)/640) — S = 80 → 24, S = 292 → 60. Attack roll
 * 107 × 164 = 17548 vs (100 + 9) × 64 = 6976.
 */
function ranged(strengthBonus: number, over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "ranged", attackStyle: "rapid", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus, attackSpeedTicks: 5,
    targetDefenceLevel: 100, targetDefenceBonusForStyle: 0,
    targetStyleDamageScale: KRAKEN_RANGED_SCALE, ...over,
  };
}
const ACC = hitChance(17548, npcDefenceRoll(100, 0));
const SECONDS = 2.4;

// A landed roll over 0..24, each d → max(1, trunc(d/7)) (a raised 0 is 1):
//   0 (raised) → 1, 1..6 → 1 ×6, 7..13 → 1 ×7, 14..20 → 2 ×7, 21..24 → 3 ×4
//   = 1 + 6 + 7 + 14 + 12 = 40, over 25 rolls — not (300 + 1)/25 unscaled.
const SCALED_0_24 = 40 / 25;

describe("calculateDps vs the Kraken (ranged) — a single hit", () => {
  it("max 24: landed mean 40/25 = 1.6, max hit trunc(24/7) = 3", () => {
    const r = calculateDps(ranged(80));
    expect(r.accuracy).toBe(ACC);
    expect(r.maxHit).toBe(3);
    expect(r.dps).toBeCloseTo((ACC * SCALED_0_24) / SECONDS, 12);
  });

  it("the minimum of 1: rolls 1..6 land 1, not trunc(d/7) = 0 (which would be 33/25)", () => {
    const noMin = calculateDps(ranged(80, { targetStyleDamageScale: { factor: [1, 7] } }));
    expect(noMin.dps).toBeCloseTo((ACC * 33) / 25 / SECONDS, 12);
    expect(calculateDps(ranged(80)).dps).toBeGreaterThan(noMin.dps);
  });

  it("after the Zulrah cap, before flat armour (order checks — no target has two of them)", () => {
    // Cap first: rolls 0..50 scaled sum to 168 (raised 0 → 1, then 7 per band
    // of seven: 6 + 7 + 14 + 21 + 28 + 35 + 42 + 2·7), rolls 51..60 reroll to
    // 45..50 → 6 6 6 6 7 7, mean 38/6. Max: trunc(50/7) = 7, not trunc(60/7) = 8.
    const capped = calculateDps(ranged(292, { targetDamageCap: ZULRAH_DAMAGE_CAP }));
    expect(capped.maxHit).toBe(7);
    expect(capped.dps).toBeCloseTo((ACC * (168 + (10 * 38) / 6)) / 61 / SECONDS, 12);
    // Armour −2 last: each landed hitsplat of 0..24 gains 2 after the ÷7:
    // 40 + 25·2 = 90; max 3 + 2.
    const armoured = calculateDps(ranged(80, { targetFlatArmour: -2 }));
    expect(armoured.maxHit).toBe(5);
    expect(armoured.dps).toBeCloseTo((ACC * 90) / 25 / SECONDS, 12);
  });

  it("two full hits (Dark bow), max 24 each: 2 × 40/25; max hit 3", () => {
    const r = calculateDps(ranged(80, { hitProfile: [{ maxFraction: 1 }, { maxFraction: 1 }] }));
    expect(r.maxHit).toBe(3);
    expect(r.dps).toBeCloseTo((2 * ACC * SCALED_0_24) / SECONDS, 12);
  });
});

describe("calculateDps vs the Kraken (ranged) — enchanted bolts", () => {
  const C = 0.066;
  const bolt = (boltProc: BoltProcSpec) => calculateDps(ranged(80, { boltProc })).dps * SECONDS;

  it("ruby: the proc of 51 (20% of 255) lands trunc(51/7) = 7, after the raise", () => {
    const ruby: BoltProcSpec = { effect: "ruby", kind: "replaceFixed", chance: C, procDamage: 51 };
    expect(bolt(ruby)).toBeCloseTo(C * 7 + (1 - C) * ACC * SCALED_0_24, 12);
  });

  it("opal: the +9 rides on the roll before the ÷7, and a missed +9 lands max(1, trunc(9/7)) = 1", () => {
    // 9..33 → 9..13: 1 ×5, 14..20: 2 ×7, 21..27: 3 ×7, 28..33: 4 ×6 = 64.
    // A proc lands on the 0, so only unprocced 0s are raised: 39/25 + 1/25.
    const opal: BoltProcSpec = { effect: "opal", kind: "flatBonus", chance: C, bonusDamage: 9, accurateOnly: false };
    expect(bolt(opal)).toBeCloseTo(ACC * (C * 64 / 25 + (1 - C) * 40 / 25) + (1 - ACC) * C * 1, 12);
  });

  it("diamond: the proc rolls 0..trunc(24 × 115/100) = 27 first, then the ÷7", () => {
    // 0..27 → 0, 1..6 ×1, 7..13 ×1, 14..20 ×2, 21..27 ×3 = 6 + 7 + 14 + 21 = 48;
    // its 0 is accurate, so raised: + 1.
    const diamond: BoltProcSpec = { effect: "diamond", kind: "scaledMax", chance: C, effectMaxPercent: 115, accurateOnly: false };
    expect(bolt(diamond)).toBeCloseTo(C * 49 / 28 + (1 - C) * ACC * SCALED_0_24, 12);
  });
});

describe("scored loadouts", () => {
  /** Armadyl helmet, Anguish, Ava's assembler, Armadyl body + legs, Zaryte vambraces, Pegasian boots, Archers ring (i). */
  const RANGED = [11826, 19547, 21914, 11828, 11830, 26235, 13237, 11771];

  it("a Blazing blowpipe at the Kraken: max 26 → 3, and the result carries the raw max for spec displays", () => {
    const r = scoreScenario({
      itemIds: [28688, ...RANGED], internalAmmoId: 11230,
      target: MONSTER_BY_SLUG["kraken"], skills: SKILLS_AT_99,
      attackStyle: { attackType: "ranged", choice: "rapid" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(r.dps.maxHit).toBe(3);
    expect(r.dps.npcHitTransforms).toEqual({ rawMaxHit: 26, styleScale: KRAKEN_RANGED_SCALE, damageCap: undefined });
  });

  it("the Kraken's Whirlpool form is divided too (same name), the Veiled kraken isn't", () => {
    const kraken = MONSTER_BY_SLUG["kraken"];
    const whirlpool = applyPhase(kraken, phaseOptionsFor(kraken).find((o) => o.label === "Whirlpool")!);
    const score = (target: typeof kraken) => {
      const r = scoreScenario({
        itemIds: [28688, ...RANGED], internalAmmoId: 11230, target, skills: SKILLS_AT_99,
        attackStyle: { attackType: "ranged", choice: "rapid" },
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      return r.dps;
    };
    expect(score(whirlpool).maxHit).toBe(3);
    expect(score(MONSTER_BY_SLUG["veiled-kraken"]).npcHitTransforms).toBeUndefined();
  });
});

// ---- 3. spec max displays --------------------------------------------------------

describe("specMaxHitDisplay — a spec hit takes the NPC transforms like a normal one", () => {
  const HEAVY_BALLISTA = 19481; // ×5/4
  const ABYSSAL_DAGGER = 13271; // ×17/20, two hits
  const DARK_BOW = 11235; // ×3/2, two hits, min 8
  const VOIDWAKER = 27690; // ×3/2, min ×1/2, magic damage

  it("Zulrah caps the spec at 50: a ballista's raw 48 → 60 → 50, raw 60 → 75 → 50 (not trunc(50 × 5/4) = 62)", () => {
    expect(specMaxHitDisplay(HEAVY_BALLISTA, 48, undefined, { rawMaxHit: 48, damageCap: ZULRAH_DAMAGE_CAP })!.specMaxHit).toBe(50);
    const over = specMaxHitDisplay(HEAVY_BALLISTA, 50, undefined, { rawMaxHit: 60, damageCap: ZULRAH_DAMAGE_CAP })!;
    expect(over.normalMaxHit).toBe(50);
    expect(over.specMaxHit).toBe(50);
  });

  it("a weaker spec comes off the raw max too: the abyssal dagger's 60 → 51 → 50, not trunc(50 × 17/20) = 42", () => {
    const r = specMaxHitDisplay(ABYSSAL_DAGGER, 50, undefined, { rawMaxHit: 60, damageCap: ZULRAH_DAMAGE_CAP })!;
    expect(r.specMaxHit).toBe(50);
    expect(r.hits).toBe(2);
  });

  it("a spec minimum over the cap rerolls too: the Voidwaker's 100 → 50..150 lands 45..50", () => {
    const r = specMaxHitDisplay(VOIDWAKER, 50, undefined, { rawMaxHit: 100, damageCap: ZULRAH_DAMAGE_CAP })!;
    expect(r.specMaxHit).toBe(50);
    expect(r.minHit).toBe(45);
    const under = specMaxHitDisplay(VOIDWAKER, 50, undefined, { rawMaxHit: 80, damageCap: ZULRAH_DAMAGE_CAP })!;
    expect(under.minHit).toBe(40);
  });

  it("the Kraken divides a ranged spec: ballista 48 → 60 → 8 (not trunc(6 × 5/4) = 7); Dark bow 27 → 40 → 5, min 8 → 1", () => {
    const ballista = specMaxHitDisplay(HEAVY_BALLISTA, 6, undefined, { rawMaxHit: 48, styleScale: KRAKEN_RANGED_SCALE })!;
    expect(ballista.normalMaxHit).toBe(6);
    expect(ballista.specMaxHit).toBe(8);
    const darkBow = specMaxHitDisplay(DARK_BOW, 3, undefined, { rawMaxHit: 27, styleScale: KRAKEN_RANGED_SCALE })!;
    expect(darkBow.specMaxHit).toBe(5);
    expect(darkBow.minHit).toBe(1);
  });

  it("without NPC transforms nothing changes (flat armour alone, or none)", () => {
    expect(specMaxHitDisplay(HEAVY_BALLISTA, 48)!.specMaxHit).toBe(60);
    const armoured = specMaxHitDisplay(DARK_BOW, 29, { armour: -2, rawMaxHit: 27 })!;
    expect(armoured.specMaxHit).toBe(42);
    expect(armoured.minHit).toBe(10);
  });
});

// ---- 4. wgloop ---------------------------------------------------------------

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each krakenRangedCombos() combo:
 * max hit, the exact attack / NPC defence rolls, and DPS. Before this change
 * the engine dealt full ranged damage: Blazing blowpipe 26 max / ~9.9 dps
 * (wgloop 3 / 1.326). The bolt rows' max hit isn't compared (wgloop's includes
 * the proc: ruby 7, opal 3), nor Dark bow's (wgloop sums both arrows). The
 * Trident row is the magic control: no ÷7.
 */
const WGLOOP: Record<
  string,
  { maxHit: number; attackRoll: number; defenceRoll: number; dps: number }
> = {
  "kraken-blazing-blowpipe": { maxHit: 3, attackRoll: 27468, defenceRoll: 3640, dps: 1.3256335199859415 },
  "kraken-acb-ruby-bolts": { maxHit: 7, attackRoll: 36288, defenceRoll: 3640, dps: 0.8493192189130352 },
  "kraken-acb-diamond-bolts": { maxHit: 5, attackRoll: 36288, defenceRoll: 3640, dps: 0.7603410591831332 },
  "kraken-acb-opal-bolts": { maxHit: 3, attackRoll: 36288, defenceRoll: 3640, dps: 0.4155078577288656 },
  "kraken-dark-bow": { maxHit: 6, attackRoll: 35658, defenceRoll: 3640, dps: 0.6919302747319518 },
  "cave-kraken-blazing-blowpipe": { maxHit: 3, attackRoll: 27468, defenceRoll: 26076, dps: 0.745823911938441 },
  "kraken-trident-of-the-swamp": { maxHit: 37, attackRoll: 25460, defenceRoll: 1940, dps: 7.4249092351081165 },
};

describe("Kraken ranged combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = krakenRangedCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        internalAmmoId: combo.internalAmmoId,
        target: MONSTER_BY_SLUG[combo.bossSlug],
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        baseSpellMaxHit: combo.baseSpellMaxHit,
        spellElement: combo.spellElement,
        autoSpellName: combo.spellName,
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      const multiHit = r.loadout.slots.weapon?.itemId === 11235;
      if (!combo.knownMaxHitResidual && !multiHit) expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
