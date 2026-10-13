import { describe, expect, it } from "vitest";
import { applyPhase, phaseOptionsFor, type PhaseOption } from "@/lib/phases";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { buildWikiPayload } from "@/lib/wiki-export";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { MECHANIC_PHASES } from "@/data/bosses/mechanic-phases";
import type { LoadoutSet } from "@/types/loadout";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { isSplitProfile } from "@/lib/dps/multihit";
import { scoreScenario } from "@/lib/optimize/scenario";
import { maggotKingPunishCombos, phaseDamageCombos } from "@/scripts/oracle/combos";
import type { CombatStyle } from "@/types/osrs";

const NO_FLAGS = {
  dragonHunterCrossbow: false,
  dragonHunterLance: false,
  dragonHunterWand: false,
  salveAmuletEi: false,
  salveAmulet: false,
  demonbane: false,
  tomeOfFire: false,
  tomeOfWater: false,
  tomeOfEarth: false,
  twistedBow: false,
  fang: false,
  slayerHelmImbued: false,
};

function setFor(style: CombatStyle, weaponName = "Test weapon"): LoadoutSet {
  return {
    id: `mech-test-${style}`,
    name: weaponName,
    style,
    tier: "end",
    attackType: style === "ranged" ? "ranged" : style === "magic" ? "magic" : "slash",
    attackStyleChoice: style === "ranged" ? "rapid" : "aggressive",
    slots: { weapon: { itemId: 4151, itemName: weaponName } },
    totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
    attackSpeedTicks: 4,
    weaponCategory: style === "ranged" ? "Bow" : "Slash Sword",
    itemBonusFlags: NO_FLAGS,
  };
}

function mech(slug: string, id: string): PhaseOption {
  const opt = phaseOptionsFor(MONSTER_BY_SLUG[slug]).find((o) => o.id === `m:${id}`);
  expect(opt, `${slug} m:${id}`).toBeDefined();
  return opt!;
}

describe("wgloop phase bosses", () => {
  it("every mechanic phase list starts with the wiki calc's default and exports its wikiPhase", () => {
    for (const [slug, phases] of Object.entries(MECHANIC_PHASES)) {
      const monster = MONSTER_BY_SLUG[slug];
      expect(monster, `slug ${slug} exists in catalog`).toBeDefined();
      for (const p of phases) expect(p.wikiPhase, `${slug}/${p.id} wikiPhase`).toBeTruthy();
      const phased = applyPhase(monster, phaseOptionsFor(monster)[0]);
      const payload = buildWikiPayload(setFor("melee"), SKILLS_AT_99, phased, false, undefined) as {
        monster: { inputs: { phase?: string } };
      };
      expect(payload.monster.inputs.phase).toBe(phases[0].wikiPhase);
    }
  });

  it("Abyssal Sire: transition halves the max hit", () => {
    const sire = MONSTER_BY_SLUG["abyssal-sire"];
    const set = setFor("melee");
    const std = computeSetDps(set, applyPhase(sire, mech("abyssal-sire", "standard")), SKILLS_AT_99);
    const tr = computeSetDps(set, applyPhase(sire, mech("abyssal-sire", "transition")), SKILLS_AT_99);
    expect(tr.maxHit).toBe(Math.trunc(std.maxHit / 2));
    expect(tr.accuracy).toBe(std.accuracy);
  });

  it("Araxxor: enrage raises defence and magic levels, dropping accuracy", () => {
    const arax = MONSTER_BY_SLUG["araxxor"];
    const enragedTarget = applyPhase(arax, mech("araxxor", "enraged"));
    expect(enragedTarget.defenceLevel).toBe(arax.defenceLevel + 35);
    expect(enragedTarget.magicLevel).toBe(arax.magicLevel + 28);
    const set = setFor("melee");
    const std = computeSetDps(set, applyPhase(arax, mech("araxxor", "standard")), SKILLS_AT_99);
    const enr = computeSetDps(set, enragedTarget, SKILLS_AT_99);
    expect(enr.accuracy).toBeLessThan(std.accuracy);
    expect(enr.maxHit).toBe(std.maxHit);
  });

  it("Hueycoatl: pillar buff scales damage ×13/10 for every style", () => {
    const huey = MONSTER_BY_SLUG["the-hueycoatl"];
    const set = setFor("ranged");
    const without = computeSetDps(set, applyPhase(huey, mech("the-hueycoatl", "without-pillar")), SKILLS_AT_99);
    const withP = computeSetDps(set, applyPhase(huey, mech("the-hueycoatl", "with-pillar")), SKILLS_AT_99);
    expect(withP.maxHit).toBe(Math.trunc((without.maxHit * 13) / 10));
  });

  it("Yama: tank style pins the magic defence bonus to +60 / −30", () => {
    const yama = MONSTER_BY_SLUG["yama"];
    const magicTank = applyPhase(yama, mech("yama", "tank-magic"));
    const otherTank = applyPhase(yama, mech("yama", "tank-other"));
    expect(magicTank.defenceBonuses.magic).toBe(60);
    expect(otherTank.defenceBonuses.magic).toBe(-30);
    // Other bonuses untouched.
    expect(magicTank.defenceBonuses.slash).toBe(yama.defenceBonuses.slash);
  });

  it("Doom of Mokhaiotl: shielded is immune to non-demonbane but demonbane can't miss", () => {
    const doom = MONSTER_BY_SLUG["doom-of-mokhaiotl"];
    const shielded = applyPhase(doom, mech("doom-of-mokhaiotl", "shielded"));
    const plain = computeSetDps(setFor("melee"), shielded, SKILLS_AT_99);
    expect(plain.maxHit).toBe(0);
    expect(plain.dps).toBe(0);
    const arclight = computeSetDps(setFor("melee", "Arclight"), shielded, SKILLS_AT_99);
    expect(arclight.maxHit).toBeGreaterThan(0);
    expect(arclight.accuracy).toBe(1);
  });

  it("Doom of Mokhaiotl: burrowing attacks cannot miss", () => {
    const doom = MONSTER_BY_SLUG["doom-of-mokhaiotl"];
    const burrowing = computeSetDps(
      setFor("melee"),
      applyPhase(doom, mech("doom-of-mokhaiotl", "burrowing")),
      SKILLS_AT_99,
    );
    expect(burrowing.accuracy).toBe(1);
  });

  it("Royal Titans: out of melee range boosts ranged accuracy only", () => {
    for (const slug of ["branda-the-fire-queen", "eldric-the-ice-king"]) {
      const titan = MONSTER_BY_SLUG[slug];
      const inRange = applyPhase(titan, mech(slug, "in-melee-range"));
      const outRange = applyPhase(titan, mech(slug, "out-of-melee-range"));
      const rangedIn = computeSetDps(setFor("ranged"), inRange, SKILLS_AT_99);
      const rangedOut = computeSetDps(setFor("ranged"), outRange, SKILLS_AT_99);
      expect(rangedOut.accuracy).toBeGreaterThan(rangedIn.accuracy);
      const meleeIn = computeSetDps(setFor("melee"), inRange, SKILLS_AT_99);
      const meleeOut = computeSetDps(setFor("melee"), outRange, SKILLS_AT_99);
      expect(meleeOut.accuracy).toBe(meleeIn.accuracy);
    }
  });

  it("Maggot King: melee punish boosts melee ×3/2 but not ranged", () => {
    const king = MONSTER_BY_SLUG["maggot-king"];
    const std = applyPhase(king, mech("maggot-king", "standard"));
    const punish = applyPhase(king, mech("maggot-king", "melee-punish"));
    const meleeStd = computeSetDps(setFor("melee"), std, SKILLS_AT_99);
    const meleePunish = computeSetDps(setFor("melee"), punish, SKILLS_AT_99);
    expect(meleePunish.maxHit).toBe(Math.trunc((meleeStd.maxHit * 3) / 2));
    const rangedStd = computeSetDps(setFor("ranged"), std, SKILLS_AT_99);
    const rangedPunish = computeSetDps(setFor("ranged"), punish, SKILLS_AT_99);
    expect(rangedPunish.maxHit).toBe(rangedStd.maxHit);
  });
});

// The Maggot King's melee punish, locked to wgloop @ 89c3e25 for every
// maggotKingPunishCombos() combo (npm run oracle -- --only=mk-). Crush rolls
// against trunc(def × 15/100) (accuracy is the wiki calc's DISPLAYED first-hit
// chance), the first hitsplat is ×3/2: per roll on a single hit, on the first
// hitsplat's max for the Scythe / macuahuitl / Torag's.
describe("Maggot King melee punish vs wgloop", () => {
  const WGLOOP: Record<string, { maxHit: number; accuracy: number; dps: number }> = {
    "mk-punish-zombie-axe-crush": { maxHit: 70, accuracy: 0.9289691278514148, dps: 10.844424332765476 },
    "mk-punish-zombie-axe-slash": { maxHit: 70, accuracy: 0.3786212328966946, dps: 4.419877031245441 },
    "mk-punish-dharoks-crush": { maxHit: 66, accuracy: 0.9289691278514148, dps: 7.249891341697551 },
    "mk-punish-bludgeon": { maxHit: 63, accuracy: 0.933167832987998, dps: 12.161925730318384 },
    "mk-punish-scythe-slash": { maxHit: 90, accuracy: 0.41538057589637367, dps: 6.252159110311378 },
    "mk-punish-scythe-crush": { maxHit: 90, accuracy: 0.8964378748409766, dps: 10.797303429151455 },
    "mk-punish-dual-macuahuitl": { maxHit: 52, accuracy: 0.9388874986594216, dps: 8.521287495533388 },
    "mk-punish-torags-hammers": { maxHit: 50, accuracy: 0.9270597772752486, dps: 7.750181763222214 },
    "mk-punish-twisted-bow": { maxHit: 59, accuracy: 0.45189551498954716, dps: 4.446149761369379 },
    "mk-standard-zombie-axe-crush": { maxHit: 47, accuracy: 0.5266755308098225, dps: 4.129282460307568 },
  };
  const combos = maggotKingPunishCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const king = MONSTER_BY_SLUG[combo.bossSlug];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: applyPhase(king, mech(combo.bossSlug, combo.bossPhase!.mechanicId)),
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        onTask: false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      // The Scythe reports its largest hitsplat, wgloop the sum of all three.
      const profile = hitProfileForWeapon(r.loadout.slots.weapon?.itemId, { targetSize: king.size });
      if (!profile || isSplitProfile(profile)) expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBeCloseTo(want.accuracy, 12);
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }

  it("Dharok's at 1 HP out-damages the zombie axe once crush ignores the defence", () => {
    const king = applyPhase(MONSTER_BY_SLUG["maggot-king"], mech("maggot-king", "melee-punish"));
    const score = (id: string, currentHp?: number) => {
      const combo = combos.find((c) => c.id === id)!;
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: king,
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        onTask: false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      return computeSetDps(r.loadout, king, SKILLS_AT_99, undefined, false, false, currentHp).dps;
    };
    expect(score("mk-punish-dharoks-crush", 1)).toBeGreaterThan(score("mk-punish-zombie-axe-crush"));
  });
});

// The phase damage modifiers, locked to wgloop @ 89c3e25 for every
// phaseDamageCombos() combo (npm run oracle -- --only=td- / sire- / huey-).
// The TD's Unshielded rows also check upstream's tdUnshieldedBonusApplies:
// always hits, a speed-scaled flat bonus and one tick faster.
// Upstream's multiplyTransformer scales EACH hitsplat after the accurate-zero
// raise: the mean of trunc(r × n/d), each half of a split weapon on its own,
// and ruby / diamond procs too — scaling the max and halving it ran 1-4% high
// (a ruby proc that skipped the Sire's transition, 39%).
describe("phase damage modifiers vs wgloop", () => {
  const WGLOOP: Record<string, { maxHit: number; accuracy: number; dps: number }> = {
    "td-shielded-rapier": { maxHit: 35, accuracy: 0.5636474908200735, dps: 4.049911600707196 },
    "td-shielded-fang": { maxHit: 32, accuracy: 0.7583079451983326, dps: 4.549847671189995 },
    "td-shielded-scythe": { maxHit: 56, accuracy: 0.3746644913425609, dps: 3.395834575633842 },
    "td-shielded-torags-hammers": { maxHit: 32, accuracy: 0.5522037803473141, dps: 2.8399051560719015 },
    "td-shielded-tbow": { maxHit: 52, accuracy: 0.6261645280365618, dps: 5.432989735799819 },
    "td-shielded-zcb-ruby-bolts": { maxHit: 88, accuracy: 0.6739194119683614, dps: 5.221373570404591 },
    "td-shielded-zcb-diamond-bolts": { maxHit: 40, accuracy: 0.6739194119683614, dps: 3.8509943813382126 },
    "td-shielded-tumekens-shadow": { maxHit: 40, accuracy: 0.8559819127575139, dps: 5.717520212136728 },
    "td-shielded-emberlight": { maxHit: 47, accuracy: 0.4819220041050471, dps: 4.723002974258664 },
    "td-shielded-abyssal-whip": { maxHit: 41, accuracy: 0.3057865375506552, dps: 2.6149602715145317 },
    // Unshielded: accuracy 1; crush / a cast spell / heavy ranged add
    // max(0, speed² − 16) per accurate hitsplat and attack a tick sooner.
    "td-unshielded-rapier": { maxHit: 44, accuracy: 1, dps: 9.175925925925927 },
    "td-unshielded-bludgeon": { maxHit: 42, accuracy: 1, dps: 11.679586563307495 },
    "td-unshielded-elder-maul": { maxHit: 75, accuracy: 1, dps: 15.833333333333337 },
    "td-unshielded-dharoks": { maxHit: 77, accuracy: 1, dps: 15.277777777777775 },
    "td-unshielded-ket-om-berserker": { maxHit: 90, accuracy: 1, dps: 17.887596899224803 },
    "td-unshielded-torags-hammers": { maxHit: 58, accuracy: 1, dps: 15.833333333333329 },
    "td-unshielded-scythe-crush": { maxHit: 97, accuracy: 1, dps: 25.833333333333336 },
    "td-unshielded-tbow": { maxHit: 66, accuracy: 1, dps: 11.004975124378111 },
    "td-unshielded-zcb-diamond-rapid": { maxHit: 50, accuracy: 1, dps: 11.900898692810465 },
    "td-unshielded-zcb-diamond-accurate": { maxHit: 60, accuracy: 1, dps: 12.784052287581707 },
    "td-unshielded-zcb-ruby-accurate": { maxHit: 110, accuracy: 1, dps: 14.873333333333338 },
    "td-unshielded-heavy-ballista": { maxHit: 68, accuracy: 1, dps: 14.666666666666663 },
    "td-unshielded-black-chinchompa": { maxHit: 21, accuracy: 1, dps: 8.787878787878787 },
    "td-unshielded-tumekens-shadow": { maxHit: 51, accuracy: 1, dps: 8.506410256410257 },
    "td-unshielded-kodai-fire-surge": { maxHit: 41, accuracy: 1, dps: 10.416666666666668 },
    "td-unshielded-twinflame-fire-wave": { maxHit: 63, accuracy: 1, dps: 15.038461538461542 },
    "sire-transition-rapier": { maxHit: 22, accuracy: 0.4700968927497494, dps: 2.106730519359988 },
    "sire-transition-scythe": { maxHit: 35, accuracy: 0.44331662359498086, dps: 2.4812031840070334 },
    "sire-transition-dual-macuahuitl": { maxHit: 20, accuracy: 0.4736681681173164, dps: 1.4542285450102725 },
    "sire-transition-zcb-ruby-bolts": { maxHit: 46, accuracy: 0.5723188367200192, dps: 2.7503603040536517 },
    "sire-transition-tumekens-shadow": { maxHit: 25, accuracy: 0.861199386551566, dps: 3.588330777298192 },
    "huey-pillar-rapier": { maxHit: 57, accuracy: 0.5661152130137798, dps: 6.646611945384006 },
    "huey-pillar-scythe": { maxHit: 91, accuracy: 0.6141096323348667, dps: 9.086004134030057 },
    "huey-pillar-torags-hammers": { maxHit: 52, accuracy: 0.8169987626402697, dps: 6.873164193640363 },
    "huey-pillar-tbow": { maxHit: 76, accuracy: 0.3779494204805595, dps: 4.776860731073739 },
    "huey-pillar-dark-bow": { maxHit: 70, accuracy: 0.3213764262667412, dps: 2.295545901905294 },
    "huey-pillar-zcb-diamond-bolts": { maxHit: 65, accuracy: 0.338410512464625, dps: 3.744854992132478 },
    "huey-pillar-tumekens-shadow": { maxHit: 66, accuracy: 0.8768518079337223, dps: 9.566678058353816 },
  };
  const combos = phaseDamageCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const boss = MONSTER_BY_SLUG[combo.bossSlug];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: applyPhase(boss, mech(combo.bossSlug, combo.bossPhase!.mechanicId)),
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        baseSpellMaxHit: combo.baseSpellMaxHit,
        spellElement: combo.spellElement,
        autoSpellName: combo.spellName,
        onTask: false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      // The Scythe / Dark bow report their largest hitsplat (wgloop the sum),
      // bolts the normal hit (wgloop the proc), the fang its untrimmed max.
      const profile = hitProfileForWeapon(r.loadout.slots.weapon?.itemId, { targetSize: boss.size });
      const comparableMax = (!profile || isSplitProfile(profile)) && !combo.knownMaxHitResidual;
      if (comparableMax) expect(r.dps.maxHit).toBe(want.maxHit);
      expect(r.dps.accuracy).toBeCloseTo(want.accuracy, 12);
      expect(r.dps.dps).toBeCloseTo(want.dps, 9);
    });
  }
});
