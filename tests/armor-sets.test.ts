// Phase-2 set-bonus addition: armor-set multipliers (Void / Elite Void).
// Verifies the catalog + detection + DPS-engine integration + bank-optimizer
// force-include all line up.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import {
  detectArmorSetBonus,
  availableArmorSetsInBank,
  piecesToEquipForSet,
  ARMOR_SETS,
} from "@/data/armor-sets";
import { scoreScenario } from "@/lib/optimize/scenario";
import { optimizeForBoss } from "@/lib/optimize/bank";

const VORKATH = MONSTER_BY_SLUG["vorkath"];

// Verified item IDs — see scripts/_tmp-void-ids.ts run during build.
const VOID_RANGER_HELM = 11664;
const VOID_TOP = 8839;
const VOID_ROBE = 8840;
const ELITE_VOID_TOP = 13072;
const ELITE_VOID_ROBE = 13073;
const VOID_GLOVES = 8842;
const RUNE_CROSSBOW = 9185;
const DIAMOND_BOLTS_E = 9243; // tier 6 — Rune crossbow can fire these.

describe("armor-sets catalog — detection", () => {
  it("detects Elite Void Ranged when all elite pieces are present", () => {
    const ids = new Set([VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES]);
    const bonus = detectArmorSetBonus(ids, "ranged");
    expect(bonus?.id).toBe("elite-void-ranged");
    expect(bonus?.accuracyFactor).toEqual([11, 10]);
    expect(bonus?.damageFactor).toEqual([9, 8]);
  });

  it("detects regular Void Ranged when only regular pieces are present", () => {
    const ids = new Set([VOID_RANGER_HELM, VOID_TOP, VOID_ROBE, VOID_GLOVES]);
    const bonus = detectArmorSetBonus(ids, "ranged");
    expect(bonus?.id).toBe("void-ranged");
    expect(bonus?.damageFactor).toEqual([11, 10]);
  });

  it("prefers Elite over regular when both top variants are equipped (elite wins)", () => {
    // Catalog order puts elite-void-ranged before void-ranged, so the first
    // match — the elite — wins. A player wouldn't equip both at once, but
    // the detection is robust to that.
    const ids = new Set([
      VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES,
    ]);
    const bonus = detectArmorSetBonus(ids, "ranged");
    expect(bonus?.id).toBe("elite-void-ranged");
  });

  it("returns undefined when a set piece is missing", () => {
    const ids = new Set([VOID_RANGER_HELM, ELITE_VOID_TOP, VOID_GLOVES]); // no robe
    const bonus = detectArmorSetBonus(ids, "ranged");
    expect(bonus).toBeUndefined();
  });

  it("returns undefined when the style doesn't match the equipped helm", () => {
    // Ranger helm + ranged body/robe/gloves, asking for melee bonus → no match.
    const ids = new Set([VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES]);
    const bonus = detectArmorSetBonus(ids, "melee");
    expect(bonus).toBeUndefined();
  });

  it("ARMOR_SETS has at least one definition per combat style", () => {
    const styles = new Set(ARMOR_SETS.map((s) => s.style));
    expect(styles.has("ranged")).toBe(true);
    expect(styles.has("magic")).toBe(true);
    expect(styles.has("melee")).toBe(true);
  });
});

describe("armor-sets DPS engine integration", () => {
  it("Elite Void Ranged + rune crossbow on Vorkath: DPS > same gear without set bonus", () => {
    // Same gear in both, but the partial loadout fails to detect the set
    // (missing gloves) so the multipliers don't fire — control for the
    // multiplier's effect.
    const fullEliteVoid = [
      VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES,
      RUNE_CROSSBOW, // basic ranged weapon, no requirements above 61
    ];
    const partialNoSet = [
      VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE,
      // No gloves → set doesn't fire.
      RUNE_CROSSBOW,
    ];
    const withSet = scoreScenario({
      itemIds: fullEliteVoid,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    const withoutSet = scoreScenario({
      itemIds: partialNoSet,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    if (!withSet.valid) throw new Error(`with-set invalid: ${withSet.reasons.join("; ")}`);
    if (!withoutSet.valid) throw new Error(`without-set invalid: ${withoutSet.reasons.join("; ")}`);

    expect(withSet.loadout.armorSetBonus?.id).toBe("elite-void-ranged");
    expect(withoutSet.loadout.armorSetBonus).toBeUndefined();
    expect(withSet.dps.dps).toBeGreaterThan(withoutSet.dps.dps);
    // The bonus is +10% acc + +12.5% damage, so DPS should improve noticeably (>10%).
    expect(withSet.dps.dps / withoutSet.dps.dps).toBeGreaterThan(1.10);
  });
});

describe("bank optimizer force-includes armor sets", () => {
  it("bank with full Elite Void ranged set + weapons → at least one ranking uses the set", () => {
    // Player owns Elite Void ranged + a basic crossbow + some bolts. No
    // Masori, no DHCB. Set should appear in the rankings via force-include.
    const bank = [
      VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES,
      RUNE_CROSSBOW, DIAMOND_BOLTS_E,
    ];
    const { rankings, diagnostics } = optimizeForBoss({
      bank,
      target: VORKATH,
      skills: SKILLS_AT_99,
    });
    expect(rankings.length).toBeGreaterThan(0);
    const eliteVoidLoadouts = rankings.filter(
      (r) => r.loadout.armorSetBonus?.id === "elite-void-ranged",
    );
    expect(
      eliteVoidLoadouts.length,
      `expected at least one Elite Void candidate; diagnostics=${JSON.stringify(diagnostics)}`,
    ).toBeGreaterThan(0);
  });

  it("availableArmorSetsInBank picks up Elite Void only when all 4 pieces present", () => {
    const partial = new Set([VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE]); // no gloves
    expect(availableArmorSetsInBank(partial).length).toBe(0);
    const full = new Set([VOID_RANGER_HELM, ELITE_VOID_TOP, ELITE_VOID_ROBE, VOID_GLOVES]);
    const found = availableArmorSetsInBank(full).map((s) => s.id);
    // Should find both elite-void-ranged and void-ranged (elite pieces satisfy regular too).
    expect(found).toContain("elite-void-ranged");
    expect(found).toContain("void-ranged");
  });
});

// ============ Inquisitor's armour (crush-only) ============
const INQ_HELM = 24419;
const INQ_BODY = 24420;
const INQ_LEGS = 24421;
const INQ_MACE = 24417;        // Spiked — supports crush and stab styles
const ABYSSAL_WHIP = 4151;     // Slash — should NEVER fire Inquisitor's

// Per-piece rework (Summer Sweep-Up Gear & PvM Changes, 2026-07-22): helm +0.5%,
// hauberk +1%, plateskirt +1% crush accuracy AND damage; no set effect, and the
// Inquisitor's mace no longer amplifies it. Weird Gloop: ×(200+n)/200 with
// n = helm 1 + hauberk 2 + plateskirt 2.
describe("Inquisitor's armour — crush-only, per-piece constraint", () => {
  const crush = (ids: number[], weaponId: number) =>
    detectArmorSetBonus(new Set([...ids, weaponId]), "melee", { attackType: "crush", weaponId });

  it("full set + the Inquisitor's mace is ×205/200 — the mace no longer amplifies it", () => {
    const withMace = crush([INQ_HELM, INQ_BODY, INQ_LEGS], INQ_MACE);
    expect(withMace?.id).toBe("inquisitors");
    expect(withMace?.accuracyFactor).toEqual([205, 200]);
    expect(withMace?.damageFactor).toEqual([205, 200]);
    // Identical to the full set with any other crush weapon.
    const BARRELCHEST_ANCHOR = 10887;
    const withAnchor = crush([INQ_HELM, INQ_BODY, INQ_LEGS], BARRELCHEST_ANCHOR);
    expect(withAnchor?.accuracyFactor).toEqual([205, 200]);
    expect(withAnchor?.damageFactor).toEqual([205, 200]);
  });

  it("great helm alone is +0.5% (×201/200)", () => {
    const bonus = crush([INQ_HELM], INQ_MACE);
    expect(bonus?.id).toBe("inquisitors");
    expect(bonus?.accuracyFactor).toEqual([201, 200]);
    expect(bonus?.damageFactor).toEqual([201, 200]);
  });

  it("helm + hauberk is +1.5% (×203/200)", () => {
    const bonus = crush([INQ_HELM, INQ_BODY], INQ_MACE);
    expect(bonus?.accuracyFactor).toEqual([203, 200]);
    expect(bonus?.damageFactor).toEqual([203, 200]);
  });

  it("hauberk + plateskirt is +2% (×204/200)", () => {
    const bonus = crush([INQ_BODY, INQ_LEGS], INQ_MACE);
    expect(bonus?.accuracyFactor).toEqual([204, 200]);
    expect(bonus?.damageFactor).toEqual([204, 200]);
  });

  it("a single hauberk or plateskirt is +1% (×202/200); no pieces = no bonus", () => {
    expect(crush([INQ_BODY], INQ_MACE)?.damageFactor).toEqual([202, 200]);
    expect(crush([INQ_LEGS], INQ_MACE)?.damageFactor).toEqual([202, 200]);
    expect(crush([], INQ_MACE)).toBeUndefined();
  });

  it("works with any crush weapon, not just the mace", () => {
    const BARRELCHEST_ANCHOR = 10887; // crush
    const bonus = crush([INQ_HELM, INQ_LEGS], BARRELCHEST_ANCHOR);
    expect(bonus?.accuracyFactor).toEqual([203, 200]);
  });

  it("pieces never fire off a non-crush attack type (slash whip, stab, or unknown)", () => {
    const ids = new Set([INQ_HELM, INQ_BODY, INQ_LEGS, ABYSSAL_WHIP]);
    expect(detectArmorSetBonus(ids, "melee", { attackType: "slash", weaponId: ABYSSAL_WHIP })).toBeUndefined();
    expect(detectArmorSetBonus(ids, "melee", { attackType: "stab", weaponId: ABYSSAL_WHIP })).toBeUndefined();
    expect(detectArmorSetBonus(ids, "melee", { weaponId: ABYSSAL_WHIP })).toBeUndefined();
    const helmOnly = new Set([INQ_HELM, ABYSSAL_WHIP]);
    expect(detectArmorSetBonus(helmOnly, "melee", { attackType: "slash", weaponId: ABYSSAL_WHIP })).toBeUndefined();
  });

  it("availableArmorSetsInBank offers every non-empty subset of owned Inquisitor pieces", () => {
    const ids = (sets: ReturnType<typeof availableArmorSetsInBank>) =>
      sets.filter((s) => s.id.startsWith("inquisitors")).map((s) => s.id).sort();
    // No pieces → nothing; one piece → just that piece.
    expect(ids(availableArmorSetsInBank(new Set([INQ_MACE])))).toEqual([]);
    expect(ids(availableArmorSetsInBank(new Set([INQ_BODY])))).toEqual(["inquisitors:body"]);
    // Two pieces → each alone plus the pair (3 candidates).
    expect(ids(availableArmorSetsInBank(new Set([INQ_HELM, INQ_LEGS])))).toEqual([
      "inquisitors:head",
      "inquisitors:head+legs",
      "inquisitors:legs",
    ]);
    // All three → 7 subsets, the full one keeping the bare set id.
    const full = ids(availableArmorSetsInBank(new Set([INQ_HELM, INQ_BODY, INQ_LEGS])));
    expect(full).toHaveLength(7);
    expect(full).toContain("inquisitors");
  });

  it("engine integration: a lone plateskirt + crush weapon fires the partial bonus in scoreScenario", () => {
    const BARRELCHEST_ANCHOR = 10887; // crush
    const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];
    const scored = scoreScenario({
      itemIds: [INQ_LEGS, BARRELCHEST_ANCHOR],
      target: GRAARDOR,
      skills: SKILLS_AT_99,
    });
    if (!scored.valid) throw new Error(`invalid: ${scored.reasons.join("; ")}`);
    expect(scored.loadout.armorSetBonus?.id).toBe("inquisitors");
    expect(scored.loadout.armorSetBonus?.accuracyFactor).toEqual([202, 200]);
    expect(scored.loadout.armorSetBonus?.damageFactor).toEqual([202, 200]);
  });

  it("subset definitions resolve to exactly the owned pieces", () => {
    const bank = new Set([INQ_HELM, INQ_BODY, INQ_LEGS]);
    const sub = availableArmorSetsInBank(bank).find((s) => s.id === "inquisitors:body+legs")!;
    expect(piecesToEquipForSet(sub, bank)).toEqual([
      { slot: "body", itemId: INQ_BODY },
      { slot: "legs", itemId: INQ_LEGS },
    ]);
  });

  it("does NOT fire when same mace is set to stab style", () => {
    const ids = new Set([INQ_HELM, INQ_BODY, INQ_LEGS, INQ_MACE]);
    const bonus = detectArmorSetBonus(ids, "melee", { attackType: "stab", weaponId: INQ_MACE });
    expect(bonus).toBeUndefined();
  });

  it("does NOT fire with a non-crush weapon like the abyssal whip", () => {
    const ids = new Set([INQ_HELM, INQ_BODY, INQ_LEGS, ABYSSAL_WHIP]);
    const bonus = detectArmorSetBonus(ids, "melee", { attackType: "slash", weaponId: ABYSSAL_WHIP });
    expect(bonus).toBeUndefined();
  });
});

// ============ Obsidian armour (TzHaar-weapon-only) ============
const OBBY_HELM = 21298;
const OBBY_BODY = 21301;
const OBBY_LEGS = 21304;
const TOKTZ_XIL_AK = 6523;     // Obsidian sword, stab melee
const TOKTZ_MEJ_TAL = 6526;    // Obsidian staff, magic
const RUNE_SCIMITAR = 1333;    // Slash melee — should NEVER fire Obsidian

describe("Obsidian armour — TzHaar-weapon constraint", () => {
  it("fires with Toktz-xil-ak (obsidian sword) on melee", () => {
    const ids = new Set([OBBY_HELM, OBBY_BODY, OBBY_LEGS, TOKTZ_XIL_AK]);
    const bonus = detectArmorSetBonus(ids, "melee", { attackType: "stab", weaponId: TOKTZ_XIL_AK });
    expect(bonus?.id).toBe("obsidian-melee");
    expect(bonus?.damageFactor).toEqual([11, 10]);
  });

  it("fires with Toktz-mej-tal (obsidian staff) on magic", () => {
    const ids = new Set([OBBY_HELM, OBBY_BODY, OBBY_LEGS, TOKTZ_MEJ_TAL]);
    const bonus = detectArmorSetBonus(ids, "magic", { attackType: "magic", weaponId: TOKTZ_MEJ_TAL });
    expect(bonus?.id).toBe("obsidian-magic");
  });

  it("does NOT fire with a non-TzHaar weapon (rune scimitar)", () => {
    const ids = new Set([OBBY_HELM, OBBY_BODY, OBBY_LEGS, RUNE_SCIMITAR]);
    const bonus = detectArmorSetBonus(ids, "melee", { attackType: "slash", weaponId: RUNE_SCIMITAR });
    expect(bonus).toBeUndefined();
  });

  it("availableArmorSetsInBank only surfaces Obsidian when bank has a TzHaar weapon", () => {
    const armorOnly = new Set([OBBY_HELM, OBBY_BODY, OBBY_LEGS]);
    expect(availableArmorSetsInBank(armorOnly).find((s) => s.id.startsWith("obsidian"))).toBeUndefined();
    const withWeapon = new Set([OBBY_HELM, OBBY_BODY, OBBY_LEGS, TOKTZ_XIL_AK]);
    const found = availableArmorSetsInBank(withWeapon).map((s) => s.id);
    expect(found).toContain("obsidian-melee");
  });
});

// ============ Crystal armour (crystal-bow / BoFA-only) ============
const CRYSTAL_HELM = 23971;
const CRYSTAL_BODY = 23975;
const CRYSTAL_LEGS = 23979;
const CRYSTAL_BOW = 23983;
const BOFA = 25865; // regular Bow of Faerdhinen
const BOFA_CORRUPTED = 25867; // (c) — does NOT benefit from crystal armour
const MAGIC_SHORTBOW = 861; // ordinary bow — should never fire crystal

describe("Crystal armour — crystal-weapon constraint", () => {
  it("fires with the crystal bow (+30% acc / +15% dmg)", () => {
    const ids = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS, CRYSTAL_BOW]);
    const bonus = detectArmorSetBonus(ids, "ranged", { attackType: "ranged", weaponId: CRYSTAL_BOW });
    expect(bonus?.id).toBe("crystal-armour");
    expect(bonus?.accuracyFactor).toEqual([13, 10]);
    expect(bonus?.damageFactor).toEqual([23, 20]);
  });

  it("fires with the regular Bow of Faerdhinen", () => {
    const ids = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS, BOFA]);
    expect(detectArmorSetBonus(ids, "ranged", { weaponId: BOFA })?.id).toBe("crystal-armour");
  });

  it("does NOT fire with the corrupted Bow of Faerdhinen (c)", () => {
    const ids = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS, BOFA_CORRUPTED]);
    expect(detectArmorSetBonus(ids, "ranged", { weaponId: BOFA_CORRUPTED })).toBeUndefined();
  });

  it("does NOT fire with an ordinary bow", () => {
    const ids = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS, MAGIC_SHORTBOW]);
    expect(detectArmorSetBonus(ids, "ranged", { weaponId: MAGIC_SHORTBOW })).toBeUndefined();
  });

  it("availableArmorSetsInBank surfaces crystal only when a crystal weapon is in the bank", () => {
    const armorOnly = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS]);
    expect(availableArmorSetsInBank(armorOnly).find((s) => s.id === "crystal-armour")).toBeUndefined();
    const withBow = new Set([CRYSTAL_HELM, CRYSTAL_BODY, CRYSTAL_LEGS, CRYSTAL_BOW]);
    expect(availableArmorSetsInBank(withBow).map((s) => s.id)).toContain("crystal-armour");
  });
});
