import { describe, expect, it } from "vitest";
import { buildWikiPayload } from "@/lib/wiki-export";
import { applyPhase, phaseOptionsFor } from "@/lib/phases";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import type { LoadoutSet } from "@/types/loadout";

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

const SET: LoadoutSet = {
  id: "wiki-export-test",
  name: "Exporter",
  style: "melee",
  tier: "end",
  attackType: "slash",
  attackStyleChoice: "aggressive",
  slots: { weapon: { itemId: 4151, itemName: "Plain sword" } },
  totals: { attackBonus: 100, strengthBonus: 100, prayerBonus: 0 },
  attackSpeedTicks: 4,
  weaponCategory: "Slash Sword",
  itemBonusFlags: NO_FLAGS,
};

// The payload is `object` by design (opaque wire format); narrow what we read.
interface PayloadMonster {
  monster: {
    version: string;
    skills: { hp: number; def: number };
    defensive: { standard: number };
    inputs: { phase?: string; monsterCurrentHp: number };
  };
}

function payloadFor(monster: Parameters<typeof buildWikiPayload>[2]) {
  return buildWikiPayload(SET, SKILLS_AT_99, monster, false, undefined) as unknown as PayloadMonster;
}

describe("wiki export carries the active phase", () => {
  it("Tormented Demon mechanic phases map to the calc's inputs.phase", () => {
    const td = MONSTER_BY_SLUG["tormented-demon"];
    const [shielded, unshielded] = phaseOptionsFor(td);
    expect(payloadFor(applyPhase(td, shielded)).monster.inputs.phase).toBe("Shielded");
    expect(payloadFor(applyPhase(td, unshielded)).monster.inputs.phase).toBe("Unshielded");
    // Raw catalog entry (no phase applied): leave the calc on its own default —
    // which is also Shielded, so numbers still line up.
    expect(payloadFor(td).monster.inputs.phase).toBeUndefined();
  });

  it("stat phases export the phase's stat block, version, and current HP", () => {
    const zulrah = MONSTER_BY_SLUG["zulrah"];
    const magma = phaseOptionsFor(zulrah).find((o) => o.label === "Magma")!;
    const p = payloadFor(applyPhase(zulrah, magma)).monster;
    expect(p.version).toBe("Magma");
    expect(p.defensive.standard).toBe(300); // Magma's ranged defence, not Serpentine's 50
    expect(p.skills.hp).toBe(500);
    expect(p.inputs.monsterCurrentHp).toBe(500);
    expect(p.inputs.phase).toBeUndefined(); // stat phases aren't a phase input
  });
});
