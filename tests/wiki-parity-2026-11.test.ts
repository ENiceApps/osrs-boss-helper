// Mechanics added in the 2026-11-13 wiki-calc parity sweep (every item x
// monster family checked against weirdgloop/osrs-dps-calc @ 74958b1 with
// scripts/oracle/full-sweep.ts). One representative per rule; the sweep is the
// exhaustive check.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { scoreScenario } from "@/lib/optimize/scenario";
import { computeSetDps, SKILLS_AT_99, wikiMaxHitForSet } from "@/lib/recommend";
import { hitChance } from "@/lib/dps/common";
import { ammoApplicability } from "@/data/items/ammo-applicability";
import { canonicalItemId } from "@/data/items/aliases";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import { SPELLS_BY_NAME, weaponCanCastSpell } from "@/data/spells/catalog";
import type { AttackStyleChoice, WeaponAttackType } from "@/types/osrs";

const RAPIER = 22324;
const WHIP = 4151;
const TBOW = 20997;
const DRAGON_ARROW = 11212;
const BLISTERWOOD_FLAIL = 24699;
const MELEE_REST = [24271, 19553, 21295, 11832, 11834, 22981, 13239, 11773];

function score(
  itemIds: number[],
  slug: string,
  attackType: WeaponAttackType,
  choice: AttackStyleChoice,
) {
  const r = scoreScenario({
    itemIds,
    target: MONSTER_BY_SLUG[slug],
    skills: SKILLS_AT_99,
    attackStyle: { attackType, choice },
  });
  if (!r.valid) throw new Error(r.reasons.join("; "));
  return r.dps;
}

describe("ammo the weapon can fire", () => {
  it("a bow with an empty ammo slot is not a loadout", () => {
    const r = scoreScenario({ itemIds: [TBOW], target: MONSTER_BY_SLUG["general-graardor"], skills: SKILLS_AT_99 });
    expect(r.valid).toBe(false);
  });
  it("uses the wiki calc's table: included / allowed / invalid", () => {
    expect(ammoApplicability(TBOW, DRAGON_ARROW)).toBe("included");
    expect(ammoApplicability(TBOW, undefined)).toBe("invalid");
    expect(ammoApplicability(TBOW, 9144)).toBe("invalid"); // Runite bolts
    expect(ammoApplicability(12926, DRAGON_ARROW)).toBe("allowed"); // Toxic blowpipe ignores the slot
    expect(ammoApplicability(RAPIER, DRAGON_ARROW)).toBe("allowed");
  });
  it("arrows under a thrown weapon add nothing", () => {
    const knife = 22804; // Dragon knife
    const rest = [11826, 19547, 21914, 11828, 11830, 26235, 13237, 11771];
    const bare = score([knife, ...rest], "general-graardor", "ranged", "rapid");
    const withArrows = score([knife, DRAGON_ARROW, ...rest], "general-graardor", "ranged", "rapid");
    expect(withArrows.maxHit).toBe(bare.maxHit);
  });
});

describe("item variants read as their base item", () => {
  it("an ornamented Void set is a Void set", () => {
    expect(canonicalItemId(26463)).toBe(8839); // Void knight top (or)
    const base = score([WHIP, 11665, 8839, 8840, 8842], "general-graardor", "slash", "controlled");
    const ornamented = score([WHIP, 26477, 26463, 26465, 26467], "general-graardor", "slash", "controlled");
    expect(ornamented.maxHit).toBe(base.maxHit);
    expect(ornamented.dps).toBeCloseTo(base.dps, 12);
  });
});

describe("monsters with their own hit rules", () => {
  it("a tier-3 vampyre takes nothing without a blisterwood weapon", () => {
    expect(score([RAPIER, ...MELEE_REST], "vyrewatch", "stab", "aggressive").dps).toBe(0);
    expect(score([BLISTERWOOD_FLAIL, ...MELEE_REST], "vyrewatch", "crush", "aggressive").dps).toBeGreaterThan(0);
  });
  it("zogres take a quarter of each hit", () => {
    const plain = score([RAPIER, ...MELEE_REST], "general-graardor", "stab", "aggressive");
    const zogre = score([RAPIER, ...MELEE_REST], "zogre", "stab", "aggressive");
    expect(zogre.maxHit).toBe(Math.trunc(plain.maxHit / 4));
  });
  it("Scurrius's giant rats die to any hit, and it can't miss", () => {
    const rat = MONSTER_BY_SLUG["giant-rat-scurrius"];
    const r = score([RAPIER, ...MELEE_REST], "giant-rat-scurrius", "stab", "aggressive");
    expect(r.accuracy).toBe(1);
    expect(r.maxHit).toBe(rat.hp);
    expect(r.dps).toBeCloseTo(rat.hp / (4 * 0.6), 12);
  });
  it("the Fragment of Seren caps every hit at 22-24", () => {
    const r = score([RAPIER, ...MELEE_REST], "fragment-of-seren", "stab", "aggressive");
    expect(r.maxHit).toBe(24);
  });
});

describe("the max hit the results rail shows (wiki convention)", () => {
  const graardor = MONSTER_BY_SLUG["general-graardor"];
  const set = (weaponId: number, attackType: WeaponAttackType) => {
    const r = scoreScenario({
      itemIds: [weaponId, ...MELEE_REST],
      target: graardor,
      skills: SKILLS_AT_99,
      attackStyle: { attackType, choice: "aggressive" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    return r;
  };
  it("a Scythe's three swings are summed", () => {
    const r = set(22325, "slash");
    const m = r.dps.maxHit;
    expect(wikiMaxHitForSet(r.loadout, graardor, SKILLS_AT_99)).toBe(
      m + Math.trunc(m / 2) + Math.trunc(m / 4),
    );
  });
  it("a plain weapon's is its max hit, and the engine goes back to the fast path", () => {
    const r = set(RAPIER, "stab");
    expect(wikiMaxHitForSet(r.loadout, graardor, SKILLS_AT_99)).toBe(r.dps.maxHit);
    expect(computeSetDps(r.loadout, graardor, SKILLS_AT_99).wikiMaxHit).toBeUndefined();
  });
});

describe("accuracy against a negative defence roll", () => {
  it("stays under 1 (the Nightmare's totems, -100 defence bonuses)", () => {
    const chance = hitChance(25000, -324);
    expect(chance).toBeLessThan(1);
    expect(chance).toBeCloseTo(1 - 1 / 323 / 25001, 12);
  });
  it("is unchanged for ordinary rolls", () => {
    expect(hitChance(20000, 10000)).toBeCloseTo(1 - 10002 / (2 * 20001), 12);
    expect(hitChance(10000, 20000)).toBeCloseTo(10000 / (2 * 20001), 12);
  });
});

describe("data corrections", () => {
  it("a stab sword's Slash is Aggressive", () => {
    const slash = WEAPON_STYLES["Stab Sword"].find((o) => o.name === "Slash");
    expect(slash?.choice).toBe("aggressive");
  });
  it("Ancient Rush / Burst base max hits", () => {
    expect(SPELLS_BY_NAME.get("Smoke Rush")?.baseMaxHit).toBe(13);
    expect(SPELLS_BY_NAME.get("Shadow Rush")?.baseMaxHit).toBe(14);
    expect(SPELLS_BY_NAME.get("Smoke Burst")?.baseMaxHit).toBe(17);
    expect(SPELLS_BY_NAME.get("Shadow Burst")?.baseMaxHit).toBe(18);
  });
  it("staff-locked spells need their staff", () => {
    expect(weaponCanCastSpell("Iban Blast", "Kodai wand")).toBe(false);
    expect(weaponCanCastSpell("Iban Blast", "Iban's staff (u)")).toBe(true);
    expect(weaponCanCastSpell("Magic Dart", "Toxic staff of the dead")).toBe(true);
    expect(weaponCanCastSpell("Fire Surge", "Kodai wand")).toBe(true);
  });
});
