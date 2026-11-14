// Mechanics added in the 2026-11-13 wiki-calc parity sweep (every item x
// monster family checked against weirdgloop/osrs-dps-calc @ 74958b1 with
// scripts/oracle/full-sweep.ts). One representative per rule; the sweep is the
// exhaustive check.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { scoreScenario } from "@/lib/optimize/scenario";
import { computeSetDps, SKILLS_AT_99, wikiMaxHitForSet } from "@/lib/recommend";
import { effectiveLevel, hitChance } from "@/lib/dps/common";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { prayerById } from "@/data/prayers";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { autoPickSpell } from "@/lib/auto-spell";
import { ammoApplicability } from "@/data/items/ammo-applicability";
import { canonicalItemId } from "@/data/items/aliases";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import { SPELLS_BY_NAME, spellMaxHit, weaponCanCastSpell } from "@/data/spells/catalog";
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

// Magic sweep (2026-11-13): every spell on every casting staff, every Magic
// level, every magic prayer, vs the wiki calc at 74958b1.
describe("magic: prayers, levels and staff-locked spells", () => {
  const cast = (
    weapon: string,
    spellName: string,
    slug: string,
    opts: { prayerId?: string; magic?: number; onTask?: boolean; extra?: string[]; version?: string } = {},
  ) => {
    const id = (n: string) => ITEM_CATALOG.find((i) => i.name.toLowerCase() === n.toLowerCase())!.id;
    const s = SPELLS_BY_NAME.get(spellName)!;
    const base = MONSTER_BY_SLUG[slug];
    const phase = opts.version ? phaseOptionsFor(base).find((o) => o.id === `s:${opts.version}`) : undefined;
    const r = scoreScenario({
      itemIds: [id(weapon), ...(opts.extra ?? []).map(id)],
      target: applyPhase(base, phase),
      skills: { ...SKILLS_AT_99, magic: opts.magic ?? 99 },
      attackStyle: { attackType: "magic", choice: "longrange" },
      baseSpellMaxHit: spellMaxHit(s, opts.magic ?? 99),
      spellElement: s.element,
      autoSpellName: s.name,
      onTask: opts.onTask,
      prayer: opts.prayerId ? prayerById("magic", opts.prayerId).selection : undefined,
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    return r.dps;
  };

  it("Mystic Lore / Might / Vigour add 1 / 2 / 3% magic damage", () => {
    // Fire Surge 24 on a Kodai wand (+15%): 24 + trunc(24 x 150/1000) = 27;
    // with Mystic Vigour 24 + trunc(24 x 180/1000) = 28.
    expect(cast("Kodai wand", "Fire Surge", "general-graardor", { prayerId: "none" }).maxHit).toBe(27);
    expect(cast("Kodai wand", "Fire Surge", "general-graardor", { prayerId: "mystic-vigour" }).maxHit).toBe(28);
    expect(prayerById("magic", "mystic-might").selection.magicDamageMultiplier).toBe(1.02);
    expect(prayerById("magic", "mystic-lore").selection.magicDamageMultiplier).toBe(1.01);
    expect(prayerById("ranged", "deadeye").selection.rangedStrengthMultiplier).toBe(1.18);
  });
  it("a prayer scales the level in whole percents (100 x 1.15 is 115, not 114)", () => {
    expect(effectiveLevel(100, 1.15, 0, 0, 9)).toBe(124);
  });
  it("an ornamented Iban's staff casts Iban Blast", () => {
    expect(cast("Iban's staff (u) (o)", "Iban Blast", "general-graardor").maxHit).toBe(
      cast("Iban's staff (u)", "Iban Blast", "general-graardor").maxHit,
    );
  });
  it("an Awakened boss is not a slayer monster: no on-task Magic Dart bonus", () => {
    const onTask = { onTask: true };
    const post = cast("Slayer's staff (e)", "Magic Dart", "vardorvis", onTask).maxHit;
    const awakened = cast("Slayer's staff (e)", "Magic Dart", "vardorvis", { ...onTask, version: "Awakened" }).maxHit;
    expect(post).toBeGreaterThan(awakened);
  });
  it("a Tome of water adds its accuracy to Snare", () => {
    const bare = cast("Kodai wand", "Snare", "general-graardor");
    const tome = cast("Kodai wand", "Snare", "general-graardor", { extra: ["Tome of water"] });
    expect(tome.maxHit).toBe(bare.maxHit);
    expect(tome.accuracy).toBeGreaterThan(bare.accuracy);
  });
  it("the auto-pick uses a staff-locked spell when the staff casts it", () => {
    const id = (n: string) => ITEM_CATALOG.find((i) => i.name.toLowerCase() === n.toLowerCase())!;
    // A target with no elemental weakness (a weakness rightly outranks Iban Blast).
    const graardor = Object.values(MONSTER_BY_SLUG).find(
      (m) => !m.weakness && m.isSlayerMonster && !m.attributes.includes("demon") && !m.attributes.includes("undead"),
    )!;
    const demon = graardor; // not a demon: Dark Demonbane (30) would outrank the Dart's 29
    expect(autoPickSpell(id("Iban's staff (u)"), [], "magic", 99, graardor).autoSpellName).toBe("Iban Blast");
    expect(autoPickSpell(id("Slayer's staff (e)"), [], "magic", 99, demon, undefined, undefined, true).autoSpellName).toBe("Magic Dart");
    expect(autoPickSpell(id("Slayer's staff (e)"), [], "magic", 99, demon).autoSpellName).not.toBe("Magic Dart");
    expect(autoPickSpell(id("Kodai wand"), [], "magic", 99, graardor).autoSpellName).not.toBe("Iban Blast");
  });
});

// Ranged sweep (2026-11-13): every ranged weapon x ammo, every Ranged level,
// every ranged prayer, vs the wiki calc at 74958b1.
describe("ranged: low-level prayers and the Tonalztics order", () => {
  it("a +5% prayer gives at least one damage level at 20 and below", () => {
    // Sharp Eye / Burst of Strength at level 10: 10 + 1, not trunc(10.5) = 10.
    expect(effectiveLevel(10, 1.05, 0, 0, 8, true)).toBe(19);
    expect(effectiveLevel(10, 1.05, 0, 0, 8)).toBe(18); // accuracy keeps the plain 5%
    expect(effectiveLevel(40, 1.05, 0, 0, 8, true)).toBe(50);
  });
  it("Tonalztics of Ralos vs a P2 Warden: the quarter comes off before the Warden modifier", () => {
    const id = (n: string) => ITEM_CATALOG.find((i) => i.name.toLowerCase() === n.toLowerCase() && i.version !== "Uncharged")!.id;
    const base = MONSTER_BY_SLUG["elidinis-warden"];
    const phase = phaseOptionsFor(base).find((o) => o.id === "s:Active");
    const r = scoreScenario({
      itemIds: [id("Tonalztics of ralos"), 11826, 19547, 21898, 11828, 11830, 26235, 13237, 11771],
      target: applyPhase(base, phase),
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "ranged", choice: "rapid" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(r.dps.wikiMaxHit).toBe(20);
  });
});
