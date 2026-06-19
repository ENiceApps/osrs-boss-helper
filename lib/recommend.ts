// Recommendation engine.
// Given a target (a MonsterCatalogEntry) plus the player's bank + GP + skills,
// filter the universal loadout set library by applicability, score each one
// for ownership/affordability, and rank viable sets by DPS against this
// specific target's stats. One curated set serves every boss that matches
// its predicate — no per-boss preset curation needed.

import type { DpsResult, Skills } from "@/types/osrs";
import { calculateDps } from "@/lib/dps/calculate";
import { SPELLS_BY_NAME } from "@/data/spells/catalog";
import { resolveBoltProc } from "@/lib/dps/bolts";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { applyCombatBoost, type CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet } from "@/types/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import {
  activeBonusesForTarget,
  defenceBonusForAttackType,
  rangedDefenceBonusFor,
} from "@/lib/loadout";

const DEFAULT_PRAYERS = {
  melee: {
    attackMultiplier: 1.2,
    strengthMultiplier: 1.23,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1.25,
  },
  ranged: {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1.2,
    rangedStrengthMultiplier: 1.23,
    magicAttackMultiplier: 1,
    magicDamageMultiplier: 1,
    defenceMultiplier: 1.25,
  },
  magic: {
    attackMultiplier: 1,
    strengthMultiplier: 1,
    rangedAttackMultiplier: 1,
    rangedStrengthMultiplier: 1,
    magicAttackMultiplier: 1.25,
    // Augury gives +25% magic accuracy AND +4% magic damage.
    magicDamageMultiplier: 1.04,
    defenceMultiplier: 1.25,
  },
} as const;

/**
 * The offensive prayer the DPS calc assumes per combat style (mirrors the
 * multipliers in DEFAULT_PRAYERS above). Surfaced in the results rail so the
 * player knows which prayer the DPS number bakes in. `effect` is the short
 * offensive summary — defence (+25%) is omitted since it doesn't affect DPS.
 */
export const ASSUMED_PRAYER: Record<
  LoadoutSet["style"],
  { name: string; effect: string }
> = {
  melee: { name: "Piety", effect: "+23% str · +20% atk" },
  ranged: { name: "Rigour", effect: "+23% ranged str · +20% ranged atk" },
  magic: { name: "Augury", effect: "+4% magic dmg · +25% magic acc" },
};

/** Resolve which defence-bonus number to feed the DPS calc given the loadout's attack profile. */
function defenceBonusForSet(set: LoadoutSet, target: MonsterCatalogEntry): number {
  if (set.attackType === "ranged") {
    // Dispatch by weapon category: Crossbow → heavy, Bow → standard,
    // Thrown/Blowpipe → light. Falls back to "standard" if the field is
    // missing (legacy sets built before weaponCategory was added).
    return rangedDefenceBonusFor(target, set.weaponCategory);
  }
  return defenceBonusForAttackType(target, set.attackType);
}

function targetDefenceLevelFor(set: LoadoutSet, target: MonsterCatalogEntry): number {
  // For magic, NPC defence roll uses skills.magic — every other style uses skills.def.
  return set.style === "magic" ? target.magicLevel : target.defenceLevel;
}

/**
 * Pure DPS calculation for a set against a target — no bank / ownership /
 * affordability concerns. Used both by the full evaluator and by the
 * browse-mode previewer on the dynamic boss page.
 */
export function computeSetDps(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
  skills: Skills,
  /** Optional combat-boost potion. Applied to the visible level before the engine. */
  boost?: CombatBoost,
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask = false,
): DpsResult {
  const activeBonuses = activeBonusesForTarget(set, target);
  // Black mask / slayer helm (i): only on-task, and only when no Salve is active
  // (they don't stack — Salve takes priority vs undead).
  const salveActive =
    activeBonuses.conditionalBonuses.salveAmulet || activeBonuses.conditionalBonuses.salveAmuletEi;
  const slayerOnTask = set.itemBonusFlags.slayerHelmImbued && onTask && !salveActive;
  const effectiveSkills = applyCombatBoost(skills, boost);
  // Enchanted-bolt proc (crossbows only). Resolved here because the boosted
  // visible ranged level and the target's immunities are both in scope.
  const boltProc = set.style === "ranged"
    ? resolveBoltProc({
        ammoItemId: set.slots.ammo?.itemId,
        weaponItemId: set.slots.weapon?.itemId,
        weaponCategory: set.weaponCategory,
        visibleRangedLevel: effectiveSkills.ranged,
        target: { hp: target.hp, attributes: target.attributes, slug: target.slug },
      })
    : undefined;
  // Multi-hit weapons (Scythe size-gated, Dual macuahuitl, Dark bow, Tonalztics).
  const hitProfile = hitProfileForWeapon(set.slots.weapon?.itemId, {
    targetSize: target.size,
  });
  // Tumeken's shadow (charged 27275 / uncharged 27277) triples worn magic bonuses.
  const weaponId = set.slots.weapon?.itemId;
  const shadowEquipped = weaponId === 27275 || weaponId === 27277;
  // Twinflame staff (30634): +10% acc/dmg on any standard spell, plus a second
  // cast (~40%) on Bolt/Blast/Wave. It casts standard spells, so the auto-/picked
  // spell's element is elemental and its name reveals whether it qualifies.
  const twinflameStandard =
    weaponId === 30634 &&
    set.style === "magic" &&
    set.spellElement !== undefined &&
    set.spellElement !== "none";
  const twinflameDoubleCast =
    twinflameStandard && /(Bolt|Blast|Wave)$/.test(set.autoSpellName ?? "");
  // Demonbane spell accuracy (Arceuus) — fires only when the cast spell is a
  // demonbane spell AND the target carries the "demon" attribute.
  const castSpell = set.style === "magic" && set.autoSpellName
    ? SPELLS_BY_NAME.get(set.autoSpellName)
    : undefined;
  const demonbaneSpellAccuracyPct =
    castSpell?.vsDemonAccuracyPct && target.attributes.includes("demon")
      ? castSpell.vsDemonAccuracyPct
      : undefined;
  return calculateDps({
    style: set.style,
    attackStyle: set.attackStyleChoice,
    prayers: DEFAULT_PRAYERS[set.style],
    skills: effectiveSkills,
    attackBonus: set.totals.attackBonus,
    strengthBonus: set.totals.strengthBonus,
    magicDamagePercent: set.totals.magicDamagePct,
    baseSpellMaxHit: set.style === "magic" ? set.baseSpellMaxHit : undefined,
    attackSpeedTicks: set.attackSpeedTicks,
    targetDefenceLevel: targetDefenceLevelFor(set, target),
    targetDefenceBonusForStyle: defenceBonusForSet(set, target),
    conditionalBonuses: activeBonuses.conditionalBonuses,
    spellElement: set.spellElement,
    tomeOfFireEquipped: activeBonuses.tomeOfFireEquipped,
    tomeOfWaterEquipped: activeBonuses.tomeOfWaterEquipped,
    tomeOfEarthEquipped: activeBonuses.tomeOfEarthEquipped,
    shadowEquipped,
    demonbaneSpellAccuracyPct,
    twinflameStandard,
    twinflameDoubleCast,
    twistedBowEquipped: activeBonuses.twistedBowEquipped,
    fangEquipped: activeBonuses.fangEquipped,
    targetMonsterMagicLevel: activeBonuses.targetMonsterMagicLevel,
    targetIsXerician: activeBonuses.targetIsXerician,
    armorSetBonus: set.armorSetBonus,
    boltProc,
    hitProfile,
    slayerOnTask,
    targetWeakness: target.weakness
      ? {
          element: target.weakness.element as never,
          severity: target.weakness.severity,
        }
      : undefined,
  });
}

/** Convenience for pages that just want recommendations at default level-99 skills. */
export const SKILLS_AT_99: Skills = {
  attack: 99,
  strength: 99,
  defence: 99,
  ranged: 99,
  magic: 99,
  hitpoints: 99,
  prayer: 99,
};
