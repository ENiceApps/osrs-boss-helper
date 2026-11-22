// Combat XP calculator: the per-damage XP split for each attack style, the
// XP/hr it turns a DPS into, and the attack-style switch the XP panel drives
// (a style picked for the worn weapon re-scores the same gear).

import { describe, expect, it } from "vitest";
import { combatXpPerHour, xpPerDamage } from "@/lib/combat-xp";
import { xpMultiplierFor } from "@/data/monsters/xp-multiplier";
import { MECHANICS_BY_SLUG } from "@/data/bosses/mechanics";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import { applyOverrides } from "@/lib/loadout-edit";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";

const split = (...args: Parameters<typeof xpPerDamage>) =>
  Object.fromEntries(xpPerDamage(...args).map((s) => [s.skill, s.xpPerDamage]));

describe("xpPerDamage", () => {
  it("melee styles", () => {
    expect(split("melee", "accurate", false)).toEqual({ attack: 4, hitpoints: 4 / 3 });
    expect(split("melee", "aggressive", false)).toEqual({ strength: 4, hitpoints: 4 / 3 });
    expect(split("melee", "defensive", true)).toEqual({ defence: 4, hitpoints: 4 / 3 });
    expect(split("melee", "controlled", false)).toEqual({
      attack: 4 / 3,
      strength: 4 / 3,
      defence: 4 / 3,
      hitpoints: 4 / 3,
    });
  });

  it("ranged styles", () => {
    expect(split("ranged", "accurate", false)).toEqual({ ranged: 4, hitpoints: 4 / 3 });
    expect(split("ranged", "rapid", false)).toEqual({ ranged: 4, hitpoints: 4 / 3 });
    expect(split("ranged", "longrange", true)).toEqual({ ranged: 2, defence: 2, hitpoints: 4 / 3 });
  });

  it("magic: only a defensive option shares XP with Defence", () => {
    // A staff's plain "Spell" is modelled with the longrange choice.
    expect(split("magic", "longrange", false)).toEqual({ magic: 2, hitpoints: 4 / 3 });
    expect(split("magic", "accurate", false)).toEqual({ magic: 2, hitpoints: 4 / 3 });
    expect(split("magic", "defensive", true)).toEqual({ magic: 4 / 3, defence: 1, hitpoints: 4 / 3 });
    // Powered staff Longrange.
    expect(split("magic", "longrange", true)).toEqual({ magic: 4 / 3, defence: 1, hitpoints: 4 / 3 });
  });
});

describe("combatXpPerHour", () => {
  it("is DPS x 3600 x XP per damage", () => {
    const xp = combatXpPerHour(10, xpPerDamage("melee", "aggressive", false));
    expect(xp.rows).toEqual([
      { skill: "strength", xpPerHour: 144_000 },
      { skill: "hitpoints", xpPerHour: 48_000 },
    ]);
    expect(xp.total).toBe(192_000);
  });

  it("applies the monster multiplier and combat uptime", () => {
    const xp = combatXpPerHour(10, xpPerDamage("ranged", "rapid", false), 0.875, 0.5);
    expect(xp.rows[0]).toEqual({ skill: "ranged", xpPerHour: 63_000 }); // 3.5 XP per damage, half the hour
  });

  it("the Gemstone Crab gives 3.5 XP per damage", () => {
    expect(xpMultiplierFor("gemstone-crab")).toBe(0.875);
    expect(xpMultiplierFor("vorkath")).toBeUndefined();
  });
});

describe("attack style switch", () => {
  const CRAB = MONSTER_BY_SLUG["gemstone-crab"];
  const WHIP = 4151;
  const scored = scoreScenario({ itemIds: [WHIP], target: CRAB, skills: SKILLS_AT_99 });
  if (!scored.valid) throw new Error(scored.reasons.join("; "));
  const base = scored.loadout;
  const dpsAt = (name: string) => {
    const option = WEAPON_STYLES.Whip.find((o) => o.name === name)!;
    const set = applyOverrides(
      { ...base, attackType: option.attackType, attackStyleChoice: option.choice },
      {},
      null,
      99,
      undefined,
      CRAB,
    );
    expect(set.attackStyleChoice).toBe(option.choice);
    return computeSetDps(set, CRAB, SKILLS_AT_99).dps;
  };

  it("re-scores the same gear at the picked style", () => {
    const lash = dpsAt("Lash"); // controlled: +1 strength
    const deflect = dpsAt("Deflect"); // defensive: no bonus
    expect(lash).toBeGreaterThan(deflect);
    expect(deflect).toBeGreaterThan(0);
  });
});

describe("Gemstone Crab guide", () => {
  it("is registered and names the timer, the XP rate and the shell", () => {
    const ids = MECHANICS_BY_SLUG["gemstone-crab"].map((m) => m.id);
    expect(ids).toEqual([
      "gemstone-crab-timer",
      "gemstone-crab-xp",
      "gemstone-crab-shell",
      "gemstone-crab-damage",
      "gemstone-crab-rules",
    ]);
  });
});
