// Salamanders (Swamp lizard → Tecu salamander), modelled after wgloop @ 89c3e25:
//  - each one takes only its own tar, worn in the AMMO slot (ammoForRangedWeapons)
//  - without that tar every style deals 0 (BaseCalc isAmmoInvalid)
//  - Scorch slash/Aggressive, Flare ranged/Rapid, Blaze magic/Defensive
//  - Flare rolls vs the mixed ranged defence = trunc((light+standard+heavy)/3)
//  - Blaze max hit = trunc((magic * (blaze + 64) + 320) / 640)
// The DPS numbers themselves are pinned by the oracle's cat-*salamander* combos.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario } from "@/lib/optimize/scenario";
import { rangedDefenceBonusFor } from "@/lib/loadout";
import { checkAmmoCompatWithCategory, SELF_AMMO_WEAPON_CATEGORIES } from "@/data/ammo-compatibility";
import { WEAPON_STYLES } from "@/data/weapon-styles";

const ZILYANA = MONSTER_BY_SLUG["commander-zilyana"];
const KREEARRA = MONSTER_BY_SLUG["kreearra"];

const BLACK_SALAMANDER = 10148;
const GUAM_TAR = 10142;
const HARRALANDER_TAR = 10145;
const RADAS_BLESSING_4 = 22947;

const PAIRS: [string, string][] = [
  ["Swamp lizard", "Guam tar"],
  ["Orange salamander", "Marrentill tar"],
  ["Red salamander", "Tarromin tar"],
  ["Black salamander", "Harralander tar"],
  ["Tecu salamander", "Irit tar"],
];

describe("salamander ammo", () => {
  it("each salamander takes exactly its own tar", () => {
    for (const [weapon, tar] of PAIRS) {
      for (const [, other] of PAIRS) {
        expect(checkAmmoCompatWithCategory(weapon, "Salamander", other).ok).toBe(other === tar);
      }
      expect(checkAmmoCompatWithCategory(weapon, "Salamander", "Dragon arrow").ok).toBe(false);
    }
  });

  it("is not a self-ammo category (the tar sits in the ammo slot)", () => {
    expect(SELF_AMMO_WEAPON_CATEGORIES.has("Salamander")).toBe(false);
  });

  it("offers Scorch / Flare / Blaze", () => {
    expect(WEAPON_STYLES.Salamander.map((o) => [o.name, o.attackType, o.choice])).toEqual([
      ["Scorch", "slash", "aggressive"],
      ["Flare", "ranged", "rapid"],
      ["Blaze", "magic", "defensive"],
    ]);
  });
});

describe("salamander scoring", () => {
  it("Flare rolls against the truncated mean of the three ranged defences", () => {
    const d = ZILYANA.defenceBonuses;
    expect(rangedDefenceBonusFor(ZILYANA, "Salamander")).toBe(
      Math.trunc((d.rangedLight + d.rangedStandard + d.rangedHeavy) / 3),
    );
  });

  it("Blaze uses the salamander's own max hit, with no spell or element", () => {
    const s = scoreScenario({
      itemIds: [BLACK_SALAMANDER, HARRALANDER_TAR],
      target: ZILYANA,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "magic", choice: "defensive" },
      spellElement: "fire",
    });
    expect(s.valid).toBe(true);
    if (!s.valid) return;
    expect(s.loadout.baseSpellMaxHit).toBe(24); // trunc((99 * 156 + 320) / 640)
    expect(s.loadout.spellElement).toBeUndefined();
    expect(s.dps.maxHit).toBe(24);
    expect(s.loadout.attackSpeedTicks).toBe(5);
  });

  it("the tar's ranged strength counts on Flare", () => {
    const withTar = scoreScenario({
      itemIds: [BLACK_SALAMANDER, HARRALANDER_TAR],
      target: ZILYANA,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "ranged", choice: "rapid" },
    });
    expect(withTar.valid && withTar.loadout.totals.strengthBonus).toBe(49);
  });

  it("is rejected without its own tar, on every style", () => {
    for (const style of WEAPON_STYLES.Salamander) {
      for (const ammo of [[], [GUAM_TAR], [RADAS_BLESSING_4]]) {
        const s = scoreScenario({
          itemIds: [BLACK_SALAMANDER, ...ammo],
          target: ZILYANA,
          skills: SKILLS_AT_99,
          attackStyle: { attackType: style.attackType, choice: style.choice },
        });
        expect(s.valid).toBe(false);
      }
    }
  });
});

describe("salamander in the bank optimizer", () => {
  it("loads the matching tar on every style, even over a blessing", () => {
    const { rankings } = optimizeForBoss({
      bank: [BLACK_SALAMANDER, GUAM_TAR, HARRALANDER_TAR, RADAS_BLESSING_4],
      target: KREEARRA,
      skills: SKILLS_AT_99,
      topN: 10,
    });
    const salamander = rankings.filter((r) => r.loadout.weaponCategory === "Salamander");
    expect(new Set(salamander.map((r) => r.loadout.style))).toEqual(new Set(["melee", "ranged", "magic"]));
    for (const r of salamander) {
      expect(r.loadout.slots.ammo?.itemId).toBe(HARRALANDER_TAR);
      expect(r.dps.dps).toBeGreaterThan(0);
    }
  });

  it("never recommends a salamander without its tar", () => {
    const { rankings } = optimizeForBoss({
      bank: [BLACK_SALAMANDER, GUAM_TAR, RADAS_BLESSING_4],
      target: KREEARRA,
      skills: SKILLS_AT_99,
    });
    expect(rankings.some((r) => r.loadout.weaponCategory === "Salamander")).toBe(false);
  });
});
