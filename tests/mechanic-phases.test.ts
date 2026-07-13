import { describe, expect, it } from "vitest";
import { applyPhase, phaseOptionsFor, type PhaseOption } from "@/lib/phases";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { buildWikiPayload } from "@/lib/wiki-export";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { MECHANIC_PHASES } from "@/data/bosses/mechanic-phases";
import type { LoadoutSet } from "@/types/loadout";
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
