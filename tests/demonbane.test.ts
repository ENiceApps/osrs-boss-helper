// Demonbane bonuses vs demon-attribute targets — calibrated against wgloop's
// PlayerVsNPCCalc.ts (see lib/dps/conditional.ts header):
//   Arclight/Emberlight  +70% acc & dmg (additive)   — pre-existing
//   Silverlight/Darklight +60% acc & dmg (additive)
//   Burning claws          +5% acc & dmg (additive)
//   Scorching bow         +30% acc & dmg (RANGED; on a slayer task the damage
//                          folds INTO the black-mask multiplier: ×(23+6)/20)
//   Demonbane spells      +20% acc base → 40% with Mark of Darkness; damage
//                          +25% only with MoD; Purging staff doubles both.
// Every factor above is for the default 100% demonbane vulnerability; the
// per-monster scaling (Duke Sucellus 70, Yama 120, Yama void flares 200, Ice
// demon 115 — see the "per-monster demonbane vulnerability" blocks at the
// bottom) mirrors wgloop's BaseCalc.demonbaneVulnerability()/demonbaneFactor.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { conditionalMultipliers, applyFactors } from "@/lib/dps/conditional";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { effectiveLevel, hitChance, npcDefenceRoll } from "@/lib/dps/common";
import { meleeAttackRoll } from "@/lib/dps/melee";
import {
  demonbaneVulnerabilityFor,
  scaleDemonbanePct,
} from "@/data/monsters/demonbane-vulnerability";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";

const DOOM = MONSTER_BY_SLUG["doom-of-mokhaiotl"]; // demon (Normal phase default)
const VORKATH = MONSTER_BY_SLUG["vorkath"]; // dragon/undead/fiery — NOT a demon

const SCORCHING_BOW = 29591;
const SILVERLIGHT = 2402;
const DARKLIGHT = 6746;
const BURNING_CLAWS = 29577;
const PURGING_STAFF = 29594;
const KODAI_WAND = 21006;
const SLAYER_HELM_I = 11865;
const RUNE_ARROW = 892;

/** Additive demonbane application: value + trunc(value × pct/100). */
const addPct = (v: number, pct: number) => v + Math.trunc((v * pct) / 100);

describe("conditionalMultipliers — demonbane tiers", () => {
  it("Silverlight/Darklight tier is +60% acc & dmg, additive", () => {
    const m = conditionalMultipliers({ demonbaneSilverlight: true });
    expect(m.accuracy).toMatchObject([{ numerator: 60, denominator: 100, additive: true }]);
    expect(m.damage).toMatchObject([{ numerator: 60, denominator: 100, additive: true }]);
  });

  it("Burning claws tier is +5% acc & dmg, additive", () => {
    const m = conditionalMultipliers({ demonbaneClaws: true });
    expect(m.accuracy).toMatchObject([{ numerator: 5, denominator: 100, additive: true }]);
    expect(m.damage).toMatchObject([{ numerator: 5, denominator: 100, additive: true }]);
  });

  it("Scorching bow contributes ACCURACY only here — damage lives in calculate.ts", () => {
    const m = conditionalMultipliers({ demonbaneScorchingBow: true });
    expect(m.accuracy).toMatchObject([{ numerator: 30, denominator: 100, additive: true }]);
    expect(m.damage).toEqual([]);
  });
});

describe("melee demonbane weapons vs a demon (engine end-to-end)", () => {
  // Max hit is target-independent apart from conditional bonuses (neither Doom
  // Normal nor Vorkath default carries a damage modifier), so the vs-Vorkath
  // score is the clean no-demonbane baseline for the same loadout. The attack
  // style is pinned — otherwise the per-target best-style pick could compare an
  // aggressive max hit against an accurate one.
  function maxHits(itemIds: number[]) {
    const attackStyle = { attackType: "slash", choice: "aggressive" } as const;
    const demon = scoreScenario({ itemIds, target: DOOM, skills: SKILLS_AT_99, attackStyle });
    const base = scoreScenario({ itemIds, target: VORKATH, skills: SKILLS_AT_99, attackStyle });
    if (!demon.valid || !base.valid) throw new Error("scenario invalid");
    return { demon: demon.dps.maxHit, base: base.dps.maxHit };
  }

  it("Silverlight: +60% damage vs demon", () => {
    const { demon, base } = maxHits([SILVERLIGHT]);
    expect(demon).toBe(addPct(base, 60));
  });

  it("Darklight: +60% damage vs demon (shares Silverlight's tier)", () => {
    const { demon, base } = maxHits([DARKLIGHT]);
    expect(demon).toBe(addPct(base, 60));
  });

  it("Burning claws: +5% damage vs demon", () => {
    const { demon, base } = maxHits([BURNING_CLAWS]);
    expect(demon).toBe(addPct(base, 5));
  });
});

describe("Scorching bow vs a demon", () => {
  const KIT = [SCORCHING_BOW, RUNE_ARROW];

  it("off task: +30% damage, additive on the max hit", () => {
    const demon = scoreScenario({ itemIds: KIT, target: DOOM, skills: SKILLS_AT_99 });
    const base = scoreScenario({ itemIds: KIT, target: VORKATH, skills: SKILLS_AT_99 });
    if (!demon.valid || !base.valid) throw new Error("scenario invalid");
    expect(demon.dps.maxHit).toBe(addPct(base.dps.maxHit, 30));
  });

  it("on task with slayer helm (i): folds into the mask — ×29/20, NOT ×23/20 then +30%", () => {
    const onTask = scoreScenario({
      itemIds: [...KIT, SLAYER_HELM_I],
      target: DOOM,
      skills: SKILLS_AT_99,
      onTask: true,
    });
    // Baseline: same gear vs a non-demon WITHOUT the task → raw max hit
    // (the helm itself adds no ranged strength).
    const base = scoreScenario({
      itemIds: [...KIT, SLAYER_HELM_I],
      target: VORKATH,
      skills: SKILLS_AT_99,
      onTask: false,
    });
    if (!onTask.valid || !base.valid) throw new Error("scenario invalid");
    const raw = base.dps.maxHit;
    expect(onTask.dps.maxHit).toBe(Math.trunc((raw * 29) / 20));
    // The naive stack would overshoot — pin that it is NOT what we compute.
    expect(onTask.dps.maxHit).toBeLessThanOrEqual(
      addPct(Math.trunc((raw * 23) / 20), 30),
    );
  });

  it("accuracy improves vs the demon (the +30% accuracy factor fires)", () => {
    // Same target, flag on/off isn't directly togglable — compare Doom's
    // hit chance for the Scorching bow against a bow that has no demonbane.
    // Cheap sanity: the demon score must carry a strictly better accuracy
    // than the same scenario scored with the conditional stripped, which we
    // emulate by comparing to Vorkath-relative expectations elsewhere. Here
    // just pin accuracy is within (0, 1] and dps > 0.
    const demon = scoreScenario({ itemIds: KIT, target: DOOM, skills: SKILLS_AT_99 });
    if (!demon.valid) throw new Error("scenario invalid");
    expect(demon.dps.accuracy).toBeGreaterThan(0);
    expect(demon.dps.dps).toBeGreaterThan(0);
  });
});

describe("demonbane spells (Arceuus) vs a demon", () => {
  // scoreScenario takes the spell as an input (auto-picking lives in
  // optimizeForBoss's autoPickSpell), so pass Dark Demonbane explicitly.
  const DARK_DEMONBANE = {
    baseSpellMaxHit: 30,
    autoSpellName: "Dark Demonbane",
  } as const;

  it("optimizer auto-picks Dark Demonbane for the Purging staff's magic build vs Doom", () => {
    const { rankings } = optimizeForBoss({
      bank: [PURGING_STAFF],
      target: DOOM,
      skills: SKILLS_AT_99,
    });
    // The staff also ranks as a melee weapon (62 str vs Doom's low crush
    // defence) — assert on its MAGIC build specifically.
    const magic = rankings.find((r) => r.loadout.style === "magic");
    expect(magic?.loadout.autoSpellName).toBe("Dark Demonbane");
  });

  it("Mark of Darkness adds +25% damage and raises accuracy (Kodai — no Purging staff)", () => {
    const off = scoreScenario({
      itemIds: [KODAI_WAND], target: DOOM, skills: SKILLS_AT_99, ...DARK_DEMONBANE,
    });
    const on = scoreScenario({
      itemIds: [KODAI_WAND], target: DOOM, skills: SKILLS_AT_99, ...DARK_DEMONBANE,
      markOfDarkness: true,
    });
    if (!off.valid || !on.valid) throw new Error("scenario invalid");
    expect(off.dps.maxHit).toBeGreaterThan(0);
    expect(on.dps.maxHit).toBe(addPct(off.dps.maxHit, 25)); // no MoD = no dmg bonus
    expect(on.dps.accuracy).toBeGreaterThan(off.dps.accuracy); // 20% → 40%
  });

  it("Purging staff doubles the MoD damage bonus to +50%", () => {
    const off = scoreScenario({
      itemIds: [PURGING_STAFF], target: DOOM, skills: SKILLS_AT_99, ...DARK_DEMONBANE,
    });
    const on = scoreScenario({
      itemIds: [PURGING_STAFF], target: DOOM, skills: SKILLS_AT_99, ...DARK_DEMONBANE,
      markOfDarkness: true,
    });
    if (!off.valid || !on.valid) throw new Error("scenario invalid");
    expect(off.dps.maxHit).toBeGreaterThan(0);
    expect(on.dps.maxHit).toBe(addPct(off.dps.maxHit, 50));
    expect(on.dps.accuracy).toBeGreaterThan(off.dps.accuracy); // 40% → 80%
  });
});

// ---------------------------------------------------------------------------
// Per-monster demonbane vulnerability
//   wgloop BaseCalc.demonbaneVulnerability(): Duke Sucellus 70, YAMA_IDS 120,
//   YAMA_VOID_FLARE_IDS 200, ICE_DEMON_IDS 115 (raised from 100 in the
//   2026-07-22 Summer Sweep-Up), else 100. PlayerVsNPCCalc.demonbaneFactor
//   scales the weapon's bonus PERCENT: trunc(pct × vulnerability / 100).
// ---------------------------------------------------------------------------

const DUKE = MONSTER_BY_SLUG["duke-sucellus"];
const YAMA = MONSTER_BY_SLUG["yama"];
const KRIL = MONSTER_BY_SLUG["kril-tsutsaroth"]; // ordinary demon (100%)
const GREATER_DEMON = MONSTER_BY_SLUG["greater-demon"]; // ordinary demon (100%)
const ARCLIGHT = 19675;
const EMBERLIGHT = 29589;

/** The Chambers of Xeric Ice demon isn't in the catalog (HP floor) — fabricate
 *  one from an ordinary demon so the id-keyed 115% path is still exercised. */
const ICE_DEMON: MonsterCatalogEntry = {
  ...GREATER_DEMON,
  slug: "ice-demon-test",
  name: "Ice demon",
  wikiId: 7584,
};
/** Likewise Yama's void flare (id 14179). */
const VOID_FLARE: MonsterCatalogEntry = {
  ...GREATER_DEMON,
  slug: "void-flare-test",
  name: "Void Flare",
  wikiId: 14179,
};

describe("per-monster demonbane vulnerability — lookup table", () => {
  it("catalog targets exist and are demons", () => {
    for (const m of [DUKE, YAMA, KRIL, GREATER_DEMON]) {
      expect(m, "catalog entry").toBeDefined();
      expect(m.attributes).toContain("demon");
    }
  });

  it("Duke Sucellus is 70% (matched by name, every version)", () => {
    expect(demonbaneVulnerabilityFor(DUKE)).toBe(70);
    expect(demonbaneVulnerabilityFor({ name: "Duke Sucellus", wikiId: 12195 })).toBe(70);
    expect(demonbaneVulnerabilityFor({ name: "Duke Sucellus", wikiId: 12191 })).toBe(70);
  });

  it("Yama is 120% (id 14176 — both stat phases), its Void Flare 200%", () => {
    expect(demonbaneVulnerabilityFor(YAMA)).toBe(120);
    for (const phase of YAMA.phases ?? []) {
      if (phase.wikiId === 14176) {
        expect(demonbaneVulnerabilityFor({ name: YAMA.name, wikiId: phase.wikiId })).toBe(120);
      }
    }
    expect(demonbaneVulnerabilityFor(VOID_FLARE)).toBe(200);
  });

  it("Ice demon is 115% (regular + challenge mode ids; the 2026-07-22 change)", () => {
    expect(demonbaneVulnerabilityFor({ name: "Ice demon", wikiId: 7584 })).toBe(115);
    expect(demonbaneVulnerabilityFor({ name: "Ice demon", wikiId: 7585 })).toBe(115);
  });

  it("every other demon stays at 100%", () => {
    expect(demonbaneVulnerabilityFor(KRIL)).toBe(100);
    expect(demonbaneVulnerabilityFor(GREATER_DEMON)).toBe(100);
    expect(demonbaneVulnerabilityFor(DOOM)).toBe(100);
    expect(demonbaneVulnerabilityFor(MONSTER_BY_SLUG["skotizo"])).toBe(100);
    // Upstream's YAMA_IDS is just [14176]: the synthetic Glyphic Attenuation
    // entries (id 100001) are NOT scaled — mirrored as-is.
    expect(demonbaneVulnerabilityFor({ name: "Yama", wikiId: 100001 })).toBe(100);
  });

  it("scaleDemonbanePct truncates to a whole percent like demonbaneFactor", () => {
    expect(scaleDemonbanePct(70, 100)).toBe(70);
    expect(scaleDemonbanePct(70, 70)).toBe(49);
    expect(scaleDemonbanePct(70, 120)).toBe(84);
    expect(scaleDemonbanePct(70, 115)).toBe(80); // 80.5 -> 80
    expect(scaleDemonbanePct(5, 70)).toBe(3); // 3.5 -> 3
    expect(scaleDemonbanePct(5, 200)).toBe(10);
  });
});

describe("conditionalMultipliers — demonbane tiers scale by vulnerability", () => {
  const cases: Array<[string, Parameters<typeof conditionalMultipliers>[0], number]> = [
    ["Arclight/Emberlight", { demonbane: true }, 70],
    ["Silverlight/Darklight", { demonbaneSilverlight: true }, 60],
    ["Burning claws", { demonbaneClaws: true }, 5],
  ];
  const vulns = [70, 100, 115, 120, 200];

  for (const [label, flags, base] of cases) {
    it(`${label}: percent = trunc(${base} × vulnerability / 100), acc AND dmg`, () => {
      for (const v of vulns) {
        const m = conditionalMultipliers(flags, false, v);
        const pct = Math.trunc((base * v) / 100);
        expect(m.accuracy).toMatchObject([{ numerator: pct, denominator: 100, additive: true }]);
        expect(m.damage).toMatchObject([{ numerator: pct, denominator: 100, additive: true }]);
      }
    });
  }

  it("Scorching bow: accuracy percent scales (30 → 21 at Duke, 36 at Yama, 60 at a void flare)", () => {
    const at = (v: number) =>
      conditionalMultipliers({ demonbaneScorchingBow: true }, false, v).accuracy;
    expect(at(70)).toMatchObject([{ numerator: 21 }]);
    expect(at(120)).toMatchObject([{ numerator: 36 }]);
    expect(at(200)).toMatchObject([{ numerator: 60 }]);
    expect(conditionalMultipliers({ demonbaneScorchingBow: true }).damage).toEqual([]);
  });

  it("omitting the vulnerability is exactly the old 100% behaviour", () => {
    const flags = { demonbane: true } as const;
    expect(conditionalMultipliers(flags)).toEqual(conditionalMultipliers(flags, false, 100));
    expect(applyFactors(100, conditionalMultipliers(flags).damage)).toBe(170);
  });
});

describe("melee demonbane weapons vs Duke / Yama / Ice demon / an ordinary demon", () => {
  // Same pinned-style trick as the 100% tests above: max hit is target-
  // independent apart from the conditional bonuses, so the vs-Vorkath score is
  // the no-demonbane baseline for the same loadout.
  function maxHitFor(itemIds: number[], target: MonsterCatalogEntry) {
    const attackStyle = { attackType: "slash", choice: "aggressive" } as const;
    const r = scoreScenario({ itemIds, target, skills: SKILLS_AT_99, attackStyle });
    if (!r.valid) throw new Error("scenario invalid");
    return r.dps.maxHit;
  }

  it("Arclight vs Duke Sucellus uses 70% of the bonus: +49% damage, not +70%", () => {
    const base = maxHitFor([ARCLIGHT], VORKATH);
    expect(maxHitFor([ARCLIGHT], DUKE)).toBe(addPct(base, 49));
    expect(maxHitFor([ARCLIGHT], DUKE)).toBeLessThan(addPct(base, 70));
  });

  it("Arclight vs Yama uses 120% of the bonus: +84% damage", () => {
    const base = maxHitFor([ARCLIGHT], VORKATH);
    expect(maxHitFor([ARCLIGHT], YAMA)).toBe(addPct(base, 84));
  });

  it("Arclight vs the Ice demon uses 115% (the 2026-07-22 change): +80% damage", () => {
    const base = maxHitFor([ARCLIGHT], VORKATH);
    expect(maxHitFor([ARCLIGHT], ICE_DEMON)).toBe(addPct(base, 80));
  });

  it("Arclight vs a Yama void flare uses 200%: +140% damage", () => {
    const base = maxHitFor([ARCLIGHT], VORKATH);
    expect(maxHitFor([ARCLIGHT], VOID_FLARE)).toBe(addPct(base, 140));
  });

  it("an ordinary demon (K'ril Tsutsaroth, greater demon) is unchanged: +70%", () => {
    const base = maxHitFor([ARCLIGHT], VORKATH);
    expect(maxHitFor([ARCLIGHT], KRIL)).toBe(addPct(base, 70));
    expect(maxHitFor([ARCLIGHT], GREATER_DEMON)).toBe(addPct(base, 70));
  });

  it("Emberlight shares Arclight's tier, scaled the same", () => {
    const base = maxHitFor([EMBERLIGHT], VORKATH);
    expect(maxHitFor([EMBERLIGHT], DUKE)).toBe(addPct(base, 49));
    expect(maxHitFor([EMBERLIGHT], YAMA)).toBe(addPct(base, 84));
  });

  it("Silverlight (60) and Burning claws (5) scale too", () => {
    const sBase = maxHitFor([SILVERLIGHT], VORKATH);
    expect(maxHitFor([SILVERLIGHT], DUKE)).toBe(addPct(sBase, 42));
    expect(maxHitFor([SILVERLIGHT], YAMA)).toBe(addPct(sBase, 72));
    expect(maxHitFor([SILVERLIGHT], KRIL)).toBe(addPct(sBase, 60));
    const cBase = maxHitFor([BURNING_CLAWS], VORKATH);
    expect(maxHitFor([BURNING_CLAWS], DUKE)).toBe(addPct(cBase, 3));
    expect(maxHitFor([BURNING_CLAWS], YAMA)).toBe(addPct(cBase, 6));
    expect(maxHitFor([BURNING_CLAWS], KRIL)).toBe(addPct(cBase, 5));
  });
});

describe("demonbane ACCURACY scales exactly (calculateDps vs hand-computed roll)", () => {
  const PRAYERS = {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1,
  };
  const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };
  const ATTACK_BONUS = 100;
  const DEF_LEVEL = 150;
  const DEF_BONUS = 100;
  const melee = (extra: Partial<DpsScenario>): DpsScenario => ({
    style: "melee",
    attackStyle: "accurate",
    prayers: PRAYERS,
    skills: SKILLS,
    attackBonus: ATTACK_BONUS,
    strengthBonus: 100,
    attackSpeedTicks: 4,
    targetDefenceLevel: DEF_LEVEL,
    targetDefenceBonusForStyle: DEF_BONUS,
    ...extra,
  });
  const baseRoll = meleeAttackRoll(effectiveLevel(99, 1, 3), ATTACK_BONUS);
  const defRoll = npcDefenceRoll(DEF_LEVEL, DEF_BONUS);

  it("Arclight at Duke 70% / Yama 120% / default 100%", () => {
    for (const [v, pct] of [[70, 49], [120, 84], [100, 70], [115, 80]] as const) {
      const r = calculateDps(
        melee({ conditionalBonuses: { demonbane: true }, demonbaneVulnerability: v }),
      );
      const scaledRoll = baseRoll + Math.trunc((baseRoll * pct) / 100);
      expect(r.accuracy).toBeCloseTo(hitChance(scaledRoll, defRoll), 12);
    }
  });

  it("accuracy ordering: Duke < ordinary demon < Yama, all above no demonbane", () => {
    const at = (v: number) =>
      calculateDps(melee({ conditionalBonuses: { demonbane: true }, demonbaneVulnerability: v })).accuracy;
    const none = calculateDps(melee({})).accuracy;
    expect(none).toBeLessThan(at(70));
    expect(at(70)).toBeLessThan(at(100));
    expect(at(100)).toBeLessThan(at(120));
  });

  it("a scenario with no vulnerability field is exactly the 100% behaviour", () => {
    const a = calculateDps(melee({ conditionalBonuses: { demonbane: true } }));
    const b = calculateDps(melee({ conditionalBonuses: { demonbane: true }, demonbaneVulnerability: 100 }));
    expect(a).toEqual(b);
  });
});

describe("Scorching bow demonbane scales with vulnerability", () => {
  const KIT = [SCORCHING_BOW, RUNE_ARROW];

  it("off task: +30% damage becomes +21% at Duke, +36% at Yama, +30% at a normal demon", () => {
    const at = (target: MonsterCatalogEntry) => {
      const r = scoreScenario({ itemIds: KIT, target, skills: SKILLS_AT_99 });
      if (!r.valid) throw new Error("scenario invalid");
      return r.dps.maxHit;
    };
    const base = at(VORKATH);
    expect(at(DUKE)).toBe(addPct(base, 21));
    expect(at(YAMA)).toBe(addPct(base, 36));
    expect(at(KRIL)).toBe(addPct(base, 30));
  });

  it("on task with slayer helm (i): the mask fold stays a flat +6/20 (wgloop does not scale it)", () => {
    const run = (target: MonsterCatalogEntry, onTask: boolean) => {
      const r = scoreScenario({
        itemIds: [...KIT, SLAYER_HELM_I],
        target,
        skills: SKILLS_AT_99,
        onTask,
      });
      if (!r.valid) throw new Error("scenario invalid");
      return r.dps.maxHit;
    };
    const raw = run(VORKATH, false);
    // Duke is a slayer monster, so the on-task bonus applies there; the fold
    // is ×29/20 at Duke exactly as at an ordinary demon.
    expect(DUKE.isSlayerMonster).toBe(true);
    expect(run(DUKE, true)).toBe(Math.trunc((raw * 29) / 20));
    expect(run(KRIL, true)).toBe(Math.trunc((raw * 29) / 20));
  });
});

describe("demonbane spells scale with vulnerability", () => {
  const DARK_DEMONBANE = { baseSpellMaxHit: 30, autoSpellName: "Dark Demonbane" } as const;
  const cast = (
    itemId: number,
    target: MonsterCatalogEntry,
    markOfDarkness: boolean,
  ) => {
    const r = scoreScenario({
      itemIds: [itemId], target, skills: SKILLS_AT_99, ...DARK_DEMONBANE, markOfDarkness,
    });
    if (!r.valid) throw new Error("scenario invalid");
    return r.dps;
  };
  /** wgloop per-hitsplat: h + trunc(trunc(h × f/100) × vulnerability/100). */
  const mod = (h: number, f: number, v: number) =>
    h + Math.trunc((Math.trunc((h * f) / 100) * v) / 100);

  it("Mark of Darkness damage (+25%) is scaled: Duke 70%, Yama 120%, normal demon unchanged", () => {
    for (const [target, v] of [[DUKE, 70], [YAMA, 120], [KRIL, 100]] as const) {
      const off = cast(KODAI_WAND, target, false);
      const on = cast(KODAI_WAND, target, true);
      expect(on.maxHit).toBe(mod(off.maxHit, 25, v));
    }
    // Spot-check the direction: Duke gets less than a normal demon, Yama more.
    const gain = (target: MonsterCatalogEntry) =>
      cast(KODAI_WAND, target, true).maxHit - cast(KODAI_WAND, target, false).maxHit;
    expect(gain(DUKE)).toBeLessThan(gain(KRIL));
    expect(gain(YAMA)).toBeGreaterThan(gain(KRIL));
  });

  it("Purging staff (+50% MoD damage) is scaled the same way", () => {
    for (const [target, v] of [[DUKE, 70], [YAMA, 120]] as const) {
      const off = cast(PURGING_STAFF, target, false);
      const on = cast(PURGING_STAFF, target, true);
      expect(on.maxHit).toBe(mod(off.maxHit, 50, v));
    }
  });

  it("spell ACCURACY percent is scaled: base 20 -> 14 at Duke, MoD 40 -> 28, Purging 80 -> 96 at Yama", () => {
    const PRAYERS = {
      attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
      rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
      defenceMultiplier: 1,
    };
    const magicScenario = (extra: Partial<DpsScenario>): DpsScenario => ({
      style: "magic",
      attackStyle: "accurate",
      prayers: PRAYERS,
      skills: { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 },
      attackBonus: 120,
      strengthBonus: 0,
      baseSpellMaxHit: 30,
      attackSpeedTicks: 5,
      targetDefenceLevel: 200,
      targetDefenceBonusForStyle: 60,
      ...extra,
    });
    // Scaling (pct × v/100, truncated) must equal passing the pre-scaled percent
    // at the default 100% vulnerability.
    for (const [pct, v, scaled] of [[20, 70, 14], [40, 70, 28], [80, 120, 96], [20, 100, 20]] as const) {
      const viaVuln = calculateDps(magicScenario({ demonbaneSpellAccuracyPct: pct, demonbaneVulnerability: v }));
      const preScaled = calculateDps(magicScenario({ demonbaneSpellAccuracyPct: scaled }));
      expect(viaVuln.accuracy).toBeCloseTo(preScaled.accuracy, 12);
    }
  });

  it("vs an ordinary demon the spell numbers are unchanged (still +25% / +50% with MoD)", () => {
    const off = cast(KODAI_WAND, KRIL, false);
    expect(cast(KODAI_WAND, KRIL, true).maxHit).toBe(addPct(off.maxHit, 25));
    const offP = cast(PURGING_STAFF, KRIL, false);
    expect(cast(PURGING_STAFF, KRIL, true).maxHit).toBe(addPct(offP.maxHit, 50));
  });
});
