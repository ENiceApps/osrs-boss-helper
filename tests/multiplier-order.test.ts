// Multiplier ORDER — regression tests for matching upstream's sequence.
//
// Every accuracy / damage multiplier truncates, so the order they apply in
// moves results by ~1 max hit or a few attack-roll points. Upstream
// weirdgloop/osrs-dps-calc (src/lib/PlayerVsNPCCalc.ts @ 89c3e25, 2026-09-02):
//   - melee: Salve / black mask FIRST (one slot, never both), then Obsidian
//     (+ trunc(base/10)), then the weapon banes (demonbane, dragonbane, keris,
//     golembane, wilderness, leafy), Inquisitor's last. Keris is ×133/100
//     (×115/100 amascut), not ×4/3.
//   - ranged: Salve (i)/(ei) / imbued mask first (DHCB, wilderness and
//     Scorching bow damage folded into the mask on task), then Tbow / banes.
//   - magic: Salve (ei) +20 / (i) +15 and the smoke-staff family +10 are flat
//     percents — one attack-roll percent, and added to the magic damage bonus
//     (with Elite Void's +5). Damage: % → black mask → dragonbane → wilderness
//     → weakness → tome; accuracy: % → dragonbane → mask → demonbane spell →
//     wilderness → Tome of Water → weakness. The Accursed / Thammaron's
//     sceptre's built-in spell takes the same path (wilderness after the mask). The Twinflame's second cast
//     (trunc(h × 4/10)) is taken from the final hit.
//   - only the imbued Salves work for ranged / magic.
// Section 1 checks the engine with hand-derived numbers; section 2 locks the
// wgloop numbers for every multiplier-order combo in scripts/oracle/combos.ts.

import { describe, expect, it } from "vitest";
import { calculateDps, type DpsScenario } from "@/lib/dps/calculate";
import { hitChance, npcDefenceRoll } from "@/lib/dps/common";
import { magicMaxHit } from "@/lib/dps/magic";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { orderingCombos } from "@/scripts/oracle/combos";
import { buildActiveFlags } from "@/components/ResultsPanel";
import { explainSlots } from "@/lib/loadout-explain";
import type { ArmorSetBonus } from "@/data/armor-sets";

// ---- 1. engine, hand-derived -------------------------------------------------

const NO_PRAYER = {
  attackMultiplier: 1, strengthMultiplier: 1, rangedAttackMultiplier: 1,
  rangedStrengthMultiplier: 1, magicAttackMultiplier: 1, magicDamageMultiplier: 1,
  defenceMultiplier: 1,
};
const SKILLS = { attack: 99, strength: 99, defence: 99, ranged: 99, magic: 99, hitpoints: 99, prayer: 99 };
// Defence roll (91 + 9) × (36 + 64) = 10000 for every scenario below.
const DEF_ROLL = npcDefenceRoll(91, 36);

/**
 * Melee, aggressive, no prayer: effective attack 99+8 = 107, strength
 * 99+3+8 = 110. Attack bonus 100 → roll 107 × 164 = 17548; strength bonus 175
 * → base max hit floor(0.5 + 110 × 239/640) = 41.
 */
function melee(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "melee", attackStyle: "aggressive", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus: 175, attackSpeedTicks: 4,
    targetDefenceLevel: 91, targetDefenceBonusForStyle: 36, ...over,
  };
}

/**
 * Ranged, rapid, no prayer: effective level 99+8 = 107 for both. Ranged
 * strength 80 → base max hit floor(0.5 + 107 × 144/640) = 24.
 */
function ranged(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "ranged", attackStyle: "rapid", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 100, strengthBonus: 80, attackSpeedTicks: 5,
    targetDefenceLevel: 91, targetDefenceBonusForStyle: 36, ...over,
  };
}

/**
 * Magic, longrange (no stance bonus), no prayer: effective level 99+9 = 108.
 * Attack bonus 30 → roll 108 × 94 = 10152.
 */
function magic(over: Partial<DpsScenario> = {}): DpsScenario {
  return {
    style: "magic", attackStyle: "longrange", prayers: NO_PRAYER, skills: SKILLS,
    attackBonus: 30, strengthBonus: 0, attackSpeedTicks: 5,
    baseSpellMaxHit: 24, spellElement: "fire", magicDamagePercent: 25,
    targetDefenceLevel: 91, targetDefenceBonusForStyle: 36, ...over,
  };
}

/** The accuracy an exact attack roll produces against DEF_ROLL. */
const accFor = (attackRoll: number) => hitChance(attackRoll, DEF_ROLL);

describe("melee: Salve / black mask before the weapon's target bonus", () => {
  it("slayer helm then Leaf-bladed battleaxe: 41 → 47 → 55 (was 41 → 48 → 56)", () => {
    const r = calculateDps(melee({ slayerOnTask: true, conditionalBonuses: { leafBladedBattleaxe: true } }));
    expect(r.maxHit).toBe(55); // trunc(trunc(41 × 7/6) × 47/40)
    expect(r.accuracy).toBe(accFor(20472)); // trunc(17548 × 7/6); the axe is damage-only
  });

  it("slayer helm then wilderness ×3/2: 41 → 47 → 70, roll 17548 → 20472 → 30708 (was 71 / 30709)", () => {
    const r = calculateDps(melee({ slayerOnTask: true, conditionalBonuses: { wildernessWeapon: true } }));
    expect(r.maxHit).toBe(70);
    expect(r.accuracy).toBe(accFor(30708));
  });

  it("Salve then Dragon hunter lance: 41 → 47 → 56 (was 41 → 49 → 57)", () => {
    const r = calculateDps(melee({ conditionalBonuses: { salveAmulet: true, dragonHunterLance: true } }));
    expect(r.maxHit).toBe(56); // trunc(trunc(41 × 7/6) × 6/5)
  });

  it("slayer helm then Granite hammer accuracy: 17548 → 20472 → 26613 (was 26614)", () => {
    const r = calculateDps(melee({ slayerOnTask: true, conditionalBonuses: { golembaneGraniteHammer: true } }));
    expect(r.accuracy).toBe(accFor(26613));
    expect(r.maxHit).toBe(61); // trunc(47 × 13/10)
  });

  it("Obsidian adds trunc(base/10) after the Salve: 41 → 49 + 4 = 53 (was ×11/10 first: 54)", () => {
    const obsidian: ArmorSetBonus = {
      id: "obsidian-melee", name: "Obsidian armour (Melee)",
      accuracyFactor: [11, 10], damageFactor: [11, 10], additiveFromBase: true,
    };
    const r = calculateDps(melee({ armorSetBonus: obsidian, conditionalBonuses: { salveAmuletEi: true } }));
    expect(r.maxHit).toBe(53); // trunc(41 × 6/5) + trunc(41/10)
    expect(r.accuracy).toBe(accFor(22811)); // trunc(17548 × 6/5) + trunc(17548/10) (was 23162)
    // Alone it still equals the old ×11/10.
    expect(calculateDps(melee({ armorSetBonus: obsidian })).maxHit).toBe(45);
  });

  it("Inquisitor's applies last: 41 → 47 → 56 → 57 (was ×205/200 first: 58)", () => {
    const inquisitor: ArmorSetBonus = {
      id: "inquisitors", name: "Inquisitor's armour",
      accuracyFactor: [205, 200], damageFactor: [205, 200], afterTargetBonuses: true,
    };
    const r = calculateDps(melee({
      armorSetBonus: inquisitor, slayerOnTask: true, conditionalBonuses: { dragonHunterLance: true },
    }));
    expect(r.maxHit).toBe(57); // trunc(trunc(trunc(41 × 7/6) × 6/5) × 205/200)
  });
});

/**
 * Keris vs a Kalphite. Strength bonus 145 puts the base max hit on
 * floor(0.5 + 110 × 209/640) = 36 — a multiple of 3, where the old ×4/3 and
 * upstream's ×133/100 disagree.
 */
describe("melee: Keris ×133/100 vs Kalphites (was ×4/3)", () => {
  const keris = (over: Partial<DpsScenario> = {}) =>
    melee({ strengthBonus: 145, ...over, conditionalBonuses: { kerisVsKalphite: true, ...over.conditionalBonuses } });

  it("damage: 36 → trunc(36 × 133/100) = 47 (×4/3 gave 48)", () => {
    expect(calculateDps(keris()).maxHit).toBe(47);
  });

  it("the partisan of amascut is ×115/100: 36 → 41", () => {
    expect(calculateDps(keris({ conditionalBonuses: { kerisAmascutVsKalphite: true } })).maxHit).toBe(41);
  });

  it("breaching accuracy: 17548 → trunc(17548 × 133/100) = 23338 (×4/3 gave 23397)", () => {
    const r = calculateDps(keris({ conditionalBonuses: { kerisBreachVsKalphite: true } }));
    expect(r.accuracy).toBe(accFor(23338));
  });

  it("on task the slayer helm comes first: 36 → 42 → 55, roll 17548 → 20472 → 27227", () => {
    const r = calculateDps(keris({ slayerOnTask: true, conditionalBonuses: { kerisBreachVsKalphite: true } }));
    expect(r.maxHit).toBe(55); // trunc(trunc(36 × 7/6) × 133/100); ×4/3 gave 56
    expect(r.accuracy).toBe(accFor(27227)); // trunc(trunc(17548 × 7/6) × 133/100)
  });

  it("the 1/51 triple proc is ×53/51 on mean DPS, max hit unchanged", () => {
    const plain = calculateDps(keris());
    const proc = calculateDps(keris({ kalphiteTripleProc: true }));
    expect(proc.maxHit).toBe(47);
    expect(proc.dps / plain.dps).toBeCloseTo(53 / 51, 12);
  });
});

describe("ranged: Salve / imbued mask before DHCB", () => {
  it("Salve(ei) then DHCB: 24 → 28 → 35, roll 21828 → 26193 → 34050 (was 36 / 34051)", () => {
    const r = calculateDps(ranged({
      attackBonus: 140, conditionalBonuses: { salveAmuletEi: true, dragonHunterCrossbow: true },
    }));
    expect(r.maxHit).toBe(35); // trunc(trunc(24 × 6/5) × 5/4)
    expect(r.accuracy).toBe(accFor(34050)); // 107 × 204 = 21828 → ×6/5 → ×13/10
  });

  it("on task: mask then DHCB accuracy 17548 → 20180 → 26234 (was 26233); damage still folds to ×28/20", () => {
    const r = calculateDps(ranged({ slayerOnTask: true, conditionalBonuses: { dragonHunterCrossbow: true } }));
    expect(r.accuracy).toBe(accFor(26234));
    expect(r.maxHit).toBe(33); // trunc(24 × 28/20)
  });
});

describe("magic: flat Salve / smoke-staff percents and the mask's two slots", () => {
  it("Salve(i) is +15% accuracy and +15% magic damage: roll 11674, max 24 + trunc(24 × 40%) = 33 (was ×7/6: 11844 / 35)", () => {
    const r = calculateDps(magic({ conditionalBonuses: { salveAmulet: true } }));
    expect(r.accuracy).toBe(accFor(11674));
    expect(r.maxHit).toBe(33);
  });

  it("Salve(ei) + a smoke staff sum to one +30% roll and +30% damage (was ×6/5 × ×11/10)", () => {
    const r = calculateDps(magic({
      baseSpellMaxHit: 20, smokeStaffStandard: true, conditionalBonuses: { salveAmuletEi: true },
    }));
    expect(r.accuracy).toBe(accFor(13197)); // trunc(10152 × 130/100) (was 13400)
    expect(r.maxHit).toBe(31); // 20 + trunc(20 × 55%) (was 32)
  });

  it("damage: black mask before the Dragon hunter wand, 30 → 34 → 47 (was 42 → 48); accuracy wand first", () => {
    const r = calculateDps(magic({ slayerOnTask: true, conditionalBonuses: { dragonHunterWand: true } }));
    expect(r.maxHit).toBe(47); // 24 + trunc(24 × 25%) = 30 → ×23/20 → ×7/5
    expect(r.accuracy).toBe(accFor(20430)); // trunc(trunc(10152 × 7/4) × 23/20)
  });

  it("accuracy: the demonbane spell lands after the mask, 10152 → 11674 → 14008 (was 14009)", () => {
    const r = calculateDps(magic({
      spellElement: "none", slayerOnTask: true, demonbaneSpellAccuracyPct: 20,
    }));
    expect(r.accuracy).toBe(accFor(14008));
  });

  it("Twinflame's second cast comes off the final hit: 22 → 25 → 35 (was 22 → 30 → 34)", () => {
    const r = calculateDps(magic({
      baseSpellMaxHit: 20, magicDamagePercent: 0, slayerOnTask: true,
      smokeStaffStandard: true, twinflameDoubleCast: true,
    }));
    expect(r.maxHit).toBe(35); // 20 + trunc(20 × 10%) → ×23/20 → ×7/5
    expect(r.accuracy).toBe(accFor(12842)); // trunc(trunc(10152 × 110/100) × 23/20)
  });

  it("Elite Void's +5% joins the magic damage percent: 24 + trunc(24 × 25%) = 30 (was 28 → ×21/20 = 29)", () => {
    const eliteVoid: ArmorSetBonus = {
      id: "elite-void-magic", name: "Elite Void Knight (Magic)",
      accuracyFactor: [29, 20], damageFactor: [21, 20],
      accuracyOnEffectiveLevel: true, damageOnMagicPercent: true,
    };
    expect(calculateDps(magic({ magicDamagePercent: 20, armorSetBonus: eliteVoid })).maxHit).toBe(30);
  });

  it("on-task Accursed sceptre: mask before the wilderness ×3/2 — 32 → 36 → 54 (×3/2 first: 55)", () => {
    // Built-in spell 27 at 99 Magic, +20% magic damage → 27 + trunc(27 × 20%) = 32.
    const r = calculateDps(magic({
      baseSpellMaxHit: 27, spellElement: undefined, magicDamagePercent: 20,
      slayerOnTask: true, conditionalBonuses: { wildernessWeapon: true },
    }));
    expect(r.maxHit).toBe(54); // trunc(trunc(32 × 23/20) × 3/2)
    expect(r.accuracy).toBe(accFor(17511)); // trunc(trunc(10152 × 23/20) × 3/2); ×3/2 first: 17512
  });

  it("magic damage % is integer math: 25 at +16% is 29 (25 × 1.16 = 28.999… floored to 28 before)", () => {
    expect(magicMaxHit(25, 16)).toBe(29);
    expect(magicMaxHit(45, 40)).toBe(63);
    expect(magicMaxHit(24, 0)).toBe(24);
  });
});

// ---- 2. end to end, locked to wgloop ----------------------------------------

describe("Salve variants by style", () => {
  const VORKATH = MONSTER_BY_SLUG["vorkath"]; // undead dragon
  const score = (itemIds: number[], attackType: "ranged" | "magic" | "stab", spell = false) => {
    const r = scoreScenario({
      itemIds,
      target: VORKATH,
      skills: SKILLS_AT_99,
      ...(spell ? { baseSpellMaxHit: 24, spellElement: "fire" as const, autoSpellName: "Fire Surge" } : {}),
      attackStyle: attackType === "stab"
        ? { attackType, choice: "controlled" }
        : { attackType, choice: attackType === "ranged" ? "rapid" : "longrange" },
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    return r.activeBonuses.conditionalBonuses;
  };
  const DHCB = [21012, 21905];
  const KODAI = [21006];
  const DHL = [22978];

  it("ranged: only the imbued Salves fire", () => {
    expect(score([...DHCB, 12018], "ranged").salveAmuletEi).toBe(true); // (ei)
    expect(score([...DHCB, 12017], "ranged").salveAmulet).toBe(true); // (i)
    expect(score([...DHCB, 10588], "ranged").salveAmuletEi).toBe(false); // (e)
    expect(score([...DHCB, 4081], "ranged").salveAmulet).toBe(false); // regular
  });

  it("magic: only the imbued Salves fire", () => {
    expect(score([...KODAI, 12018], "magic", true).salveAmuletEi).toBe(true);
    expect(score([...KODAI, 12017], "magic", true).salveAmulet).toBe(true);
    expect(score([...KODAI, 10588], "magic", true).salveAmuletEi).toBe(false);
    expect(score([...KODAI, 4081], "magic", true).salveAmulet).toBe(false);
  });

  it("melee: every Salve fires", () => {
    expect(score([...DHL, 10588], "stab").salveAmuletEi).toBe(true);
    expect(score([...DHL, 4081], "stab").salveAmulet).toBe(true);
  });

  it("the results panel and slot reasons quote magic's Salve(i) as +15%", () => {
    const r = scoreScenario({
      itemIds: [...KODAI, 12017],
      target: VORKATH,
      skills: SKILLS_AT_99,
      baseSpellMaxHit: 24,
      spellElement: "fire",
      autoSpellName: "Fire Surge",
    });
    if (!r.valid) throw new Error(r.reasons.join("; "));
    expect(buildActiveFlags(r.loadout, r.activeBonuses)).toContain("Salve(i) +15%");
    const explained = explainSlots(r.loadout, r.dps, VORKATH, SKILLS_AT_99, undefined, r.activeBonuses);
    expect(explained.neck?.reasons).toContain("+15% accuracy & damage vs this undead target");
  });
});

/**
 * wgloop @ 89c3e25 (scripts/oracle worker) for each multiplier-order combo:
 * max hit, and the exact attack / NPC defence rolls. Before this fix every row
 * but one disagreed — by a max hit or a few roll points (ordering), or by more
 * where a Salve (e) / regular Salve wrongly fired for ranged / magic.
 */
const WGLOOP: Record<string, { maxHit: number; attackRoll: number; defenceRoll: number }> = {
  "ontask-dhl-rune-dragon": { maxHit: 48, attackRoll: 32181, defenceRoll: 23940 },
  "ontask-granite-hammer-marble-gargoyle": { maxHit: 50, attackRoll: 29238, defenceRoll: 12736 },
  "ontask-barronite-mace-marble-gargoyle": { maxHit: 41, attackRoll: 19992, defenceRoll: 12736 },
  "ontask-leaf-bladed-battleaxe-kurask": { maxHit: 55, attackRoll: 24696, defenceRoll: 9576 },
  "ontask-arclight-abyssal-demon": { maxHit: 49, attackRoll: 34736, defenceRoll: 12096 },
  "ontask-ursine-chainmace-vetion": { maxHit: 70, attackRoll: 44100, defenceRoll: 21816 },
  "salve-dhl-vorkath": { maxHit: 48, attackRoll: 30403, defenceRoll: 20070 },
  "ontask-inquisitor-pieces-dhl-rune-dragon": { maxHit: 53, attackRoll: 35181, defenceRoll: 43890 },
  "inquisitor-salve-ei-vetion": { maxHit: 52, attackRoll: 35025, defenceRoll: 21816 },
  "obsidian-salve-ei-vetion": { maxHit: 49, attackRoll: 27190, defenceRoll: 21816 },
  "ontask-dhcb-rune-dragon": { maxHit: 56, attackRoll: 49351, defenceRoll: 32490 },
  "salve-ei-dhcb-vorkath": { maxHit: 56, attackRoll: 51890, defenceRoll: 20070 },
  "salve-i-dhcb-vorkath": { maxHit: 55, attackRoll: 51214, defenceRoll: 20070 },
  "salve-e-dhcb-vorkath": { maxHit: 47, attackRoll: 43898, defenceRoll: 20070 },
  "ontask-salve-e-dhcb-vorkath": { maxHit: 53, attackRoll: 49163, defenceRoll: 20070 },
  "ontask-webweaver-vetion": { maxHit: 46, attackRoll: 57814, defenceRoll: 134936 },
  "salve-ei-magic-abhorrent-spectre": { maxHit: 35, attackRoll: 28670, defenceRoll: 19776 },
  "salve-i-magic-abhorrent-spectre": { maxHit: 34, attackRoll: 27475, defenceRoll: 19776 },
  "salve-e-magic-abhorrent-spectre": { maxHit: 31, attackRoll: 23892, defenceRoll: 19776 },
  "salve-magic-abhorrent-spectre": { maxHit: 31, attackRoll: 23892, defenceRoll: 19776 },
  "ontask-salve-e-magic-abhorrent-spectre": { maxHit: 34, attackRoll: 26716, defenceRoll: 19776 },
  "twinflame-fire-wave-general-graardor": { maxHit: 35, attackRoll: 25700, defenceRoll: 32218 },
  "twinflame-salve-ei-fire-wave-abhorrent-spectre": { maxHit: 39, attackRoll: 28314, defenceRoll: 19776 },
  "twinflame-amulet-of-fire-fire-wave-general-graardor": { maxHit: 35, attackRoll: 12487, defenceRoll: 32218 },
  "ontask-twinflame-fire-wave-abyssal-demon": { maxHit: 39, attackRoll: 28720, defenceRoll: 640 },
  "mystic-smoke-staff-fire-surge-general-graardor": { maxHit: 31, attackRoll: 25990, defenceRoll: 32218 },
  "ontask-dhw-rune-dragon": { maxHit: 47, attackRoll: 46754, defenceRoll: 19270 },
  "ontask-dark-demonbane-abyssal-demon": { maxHit: 44, attackRoll: 34791, defenceRoll: 640 },
  "elite-void-magic-fire-surge-general-graardor": { maxHit: 30, attackRoll: 23302, defenceRoll: 32218 },
  // Keris vs a Kalphite: wgloop's max hit is the 1/51 triple hitsplat (3× ours).
  "keris-partisan-kalphite-queen": { maxHit: 141, attackRoll: 23814, defenceRoll: 50676 },
  "keris-partisan-pound-kalphite-queen": { maxHit: 138, attackRoll: 22806, defenceRoll: 50676 },
  "keris-breaching-kalphite-queen": { maxHit: 141, attackRoll: 31672, defenceRoll: 50676 },
  "ontask-keris-breaching-kalphite-queen": { maxHit: 159, attackRoll: 36951, defenceRoll: 50676 },
  "keris-amascut-kalphite-queen": { maxHit: 123, attackRoll: 23814, defenceRoll: 50676 },
  "keris-amascut-general-graardor": { maxHit: 36, attackRoll: 23814, defenceRoll: 39886 },
  "keris-amascut-akkha": { maxHit: 40, attackRoll: 30114, defenceRoll: 11036 },
  "keris-dagger-kalphite-queen": { maxHit: 129, attackRoll: 21546, defenceRoll: 50676 },
  "accursed-sceptre-callisto": { maxHit: 48, attackRoll: 37026, defenceRoll: 9536 },
  "thammarons-sceptre-callisto": { maxHit: 43, attackRoll: 35640, defenceRoll: 9536 },
  "thammarons-sceptre-general-graardor": { maxHit: 29, attackRoll: 23760, defenceRoll: 32218 },
  "ontask-accursed-sceptre-vetion": { maxHit: 54, attackRoll: 43717, defenceRoll: 97026 },
  "accursed-sceptre-a-fire-surge-callisto": { maxHit: 49, attackRoll: 44431, defenceRoll: 9536 },
  // Powered-staff stance: Accurate is (123 + 2 + 9) × (bonus + 64); the engine's
  // old +3 gave 135 × 190 = 25650 and 135 × 472 = 63720. Longrange always matched.
  "powered-staff-accurate-trident-swamp-zulrah": { maxHit: 37, attackRoll: 25460, defenceRoll: 5871 },
  "powered-staff-accurate-tumekens-shadow-vetion": { maxHit: 51, attackRoll: 63248, defenceRoll: 97026 },
  "powered-staff-longrange-tumekens-shadow-vetion": { maxHit: 51, attackRoll: 62304, defenceRoll: 97026 },
  // trunc(134 × 187 × 3/2) = 37587; the old +3 gave trunc(135 × 187 × 3/2) = 37867.
  "powered-staff-accurate-accursed-sceptre-vetion": { maxHit: 48, attackRoll: 37587, defenceRoll: 97026 },
};

describe("multiplier-order combos match wgloop (scripts/oracle/combos.ts)", () => {
  const combos = orderingCombos();

  it("every combo has a locked wgloop result", () => {
    expect(combos.map((c) => c.id).sort()).toEqual(Object.keys(WGLOOP).sort());
  });

  for (const combo of combos) {
    it(combo.id, () => {
      const want = WGLOOP[combo.id];
      const r = scoreScenario({
        itemIds: combo.itemIds,
        target: MONSTER_BY_SLUG[combo.bossSlug],
        skills: SKILLS_AT_99,
        attackStyle: { attackType: combo.attackType, choice: combo.choice },
        baseSpellMaxHit: combo.baseSpellMaxHit,
        spellElement: combo.spellElement,
        autoSpellName: combo.spellName,
        onTask: combo.onTask ?? false,
      });
      if (!r.valid) throw new Error(r.reasons.join("; "));
      // Keris vs a Kalphite: wgloop reports the triple hitsplat as its max.
      const tripled =
        r.loadout.style === "melee" && r.activeBonuses.conditionalBonuses.kerisVsKalphite === true;
      expect(tripled ? r.dps.maxHit * 3 : r.dps.maxHit).toBe(want.maxHit);
      // Exact roll match: same hit-chance formula on the same two rolls.
      expect(r.dps.accuracy).toBe(hitChance(want.attackRoll, want.defenceRoll));
    });
  }
});
