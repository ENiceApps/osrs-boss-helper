// Dinh's bulwark, modelled after wgloop @ 89c3e25:
//  - Pummel (crush / Accurate) is its only attack; Block can't attack
//  - strength += max(0, trunc((stab + slash + crush + ranged defence - 800) / 12) - 38),
//    summed over every worn item (calculateEquipmentBonusesFromGear)
// The DPS numbers themselves are pinned by the oracle's cat-dinhs-* combos.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario } from "@/lib/optimize/scenario";
import { applyOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { bulwarkDefence, bulwarkStrengthBonus } from "@/data/items/special-strength";
import { WEAPON_STYLES } from "@/data/weapon-styles";

const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];

const DINHS_BULWARK = 21015;
const DINHS_BLAZING_BULWARK = 28682;
const ABYSSAL_WHIP = 4151;
// Justiciar faceguard / chestguard / legguards, Infernal cape, Amulet of fury,
// Barrows gloves, Guardian boots, Ring of suffering (i): 1508 defence + 472.
const TANK = [22326, 22327, 22328, 21295, 6585, 7462, 21733, 19710];

const strengthOf = (ids: number[], attackType: "crush" | "slash" = "crush") => {
  const s = scoreScenario({
    itemIds: ids,
    target: GRAARDOR,
    skills: SKILLS_AT_99,
    attackStyle: attackType === "crush"
      ? { attackType: "crush", choice: "accurate" }
      : { attackType: "slash", choice: "controlled" },
  });
  if (!s.valid) throw new Error(s.reasons.join("; "));
  return s.loadout.totals.strengthBonus;
};

describe("Dinh's bulwark strength", () => {
  it("follows upstream's formula, floored at 0", () => {
    expect(bulwarkStrengthBonus(DINHS_BULWARK, 472)).toBe(0);
    expect(bulwarkStrengthBonus(DINHS_BULWARK, 1256)).toBe(0); // trunc(456/12) = 38
    expect(bulwarkStrengthBonus(DINHS_BULWARK, 1268)).toBe(1);
    expect(bulwarkStrengthBonus(DINHS_BULWARK, 1980)).toBe(60);
    expect(bulwarkStrengthBonus(DINHS_BLAZING_BULWARK, 1980)).toBe(60);
    expect(bulwarkStrengthBonus(ABYSSAL_WHIP, 1980)).toBe(0);
  });

  it("ignores magic defence", () => {
    const bulwark = findCatalogItem(DINHS_BULWARK)!;
    expect(bulwarkDefence(bulwark)).toBe(106 + 109 + 109 + 148);
  });

  it("adds the defence-derived strength in scoreScenario (tank gear: 1980 def → +60)", () => {
    const itemStr = [DINHS_BULWARK, ...TANK].reduce((t, id) => t + findCatalogItem(id)!.str, 0);
    expect(strengthOf([DINHS_BULWARK, ...TANK])).toBe(itemStr + 60);
    expect(strengthOf([DINHS_BULWARK])).toBe(38); // below the threshold
  });

  it("only for the bulwark: the same armour under a whip adds nothing", () => {
    const itemStr = [ABYSSAL_WHIP, ...TANK].reduce((t, id) => t + findCatalogItem(id)!.str, 0);
    expect(strengthOf([ABYSSAL_WHIP, ...TANK], "slash")).toBe(itemStr);
  });

  it("the gear editor recomputes it when armour changes", () => {
    const s = scoreScenario({
      itemIds: [DINHS_BULWARK, ...TANK],
      target: GRAARDOR,
      skills: SKILLS_AT_99,
      attackStyle: { attackType: "crush", choice: "accurate" },
    });
    if (!s.valid) throw new Error("invalid");
    // Swap the Justiciar chestguard (521 def, 0 str) for nothing: 1459 def → +16.
    const edited = applyOverrides(s.loadout, { body: null });
    const itemStr = [DINHS_BULWARK, ...TANK].reduce((t, id) => t + findCatalogItem(id)!.str, 0);
    expect(edited.totals.strengthBonus).toBe(itemStr + 16);
  });

  it("offers Pummel only", () => {
    expect(WEAPON_STYLES.Bulwark.map((o) => [o.name, o.attackType, o.choice])).toEqual([
      ["Pummel", "crush", "accurate"],
    ]);
  });
});

describe("Dinh's bulwark in the bank optimizer", () => {
  it("fills the slots with defence (Justiciar over Bandos) under a bulwark", () => {
    const { rankings } = optimizeForBoss({
      bank: [DINHS_BULWARK, ...TANK, 11832, 11834], // + Bandos chestplate / tassets
      target: GRAARDOR,
      skills: SKILLS_AT_99,
    });
    const top = rankings.find((r) => r.loadout.slots.weapon?.itemId === DINHS_BULWARK);
    expect(top).toBeDefined();
    expect(top!.loadout.attackType).toBe("crush");
    expect(top!.loadout.slots.body?.itemId).toBe(22327); // Justiciar chestguard
    expect(top!.dps.dps).toBeGreaterThan(0);
  });
});
