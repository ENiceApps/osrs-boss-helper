// DPS orchestrator. Combines style-specific formulas with shared roll/hit
// chance math and applies Vorkath multipliers when appropriate.

import type {
  AttackStyleChoice,
  CombatStyle,
  DpsResult,
  MonsterWeakness,
  PrayerSelection,
  Skills,
  SpellElement,
  ConditionalBonusFlags,
} from "@/types/osrs";
import type { ArmorSetBonus } from "@/data/armor-sets";
import {
  dpsFromHitChance,
  effectiveLevel,
  hitChance,
  npcDefenceRoll,
} from "./common";
import { meleeAttackRoll, meleeMaxHit } from "./melee";
import { rangedAttackRoll, rangedMaxHit } from "./ranged";
import { magicAttackRoll, magicMaxHit } from "./magic";
import { applyFactors, conditionalMultipliers } from "./conditional";
import { expectedBoltDamagePerAttack, type BoltProcSpec } from "./bolts";

export interface DpsScenario {
  style: CombatStyle;
  attackStyle: AttackStyleChoice;
  prayers: PrayerSelection;
  skills: Skills;
  attackBonus: number;
  strengthBonus: number;
  magicDamagePercent?: number;
  baseSpellMaxHit?: number;
  attackSpeedTicks: number;
  targetDefenceLevel: number;
  targetDefenceBonusForStyle: number;
  conditionalBonuses?: ConditionalBonusFlags;
  /** Magic-only: element of the cast spell. Gates Tome of Fire and target weakness bonuses. */
  spellElement?: SpellElement;
  /** Magic-only: monster's elemental weakness, severity is percentage points (40 = +40%). */
  targetWeakness?: MonsterWeakness;
  /** Magic-only: applies a +50% damage boost when spellElement === "fire". */
  tomeOfFireEquipped?: boolean;
  /** Ranged-only: Twisted bow is equipped — scales accuracy/damage by target magic level. */
  twistedBowEquipped?: boolean;
  /** Target's magic level for Tbow scaling (max(skills.magic, offensive.magic)). */
  targetMonsterMagicLevel?: number;
  /** True when target is a Chambers of Xeric monster (Tbow cap 350 instead of 250). */
  targetIsXerician?: boolean;
  /**
   * Armor-set bonus active on the loadout (e.g. Void Knight). Applied as a
   * multiplier on attack roll + max hit before conditional bonuses (DHCB/Salve)
   * — per wgloop's PlayerVsNPCCalc order of operations.
   */
  armorSetBonus?: ArmorSetBonus;
  /**
   * Ranged-only: enchanted-bolt proc, resolved upstream (lib/dps/bolts.ts)
   * where the loadout, target immunities, and boosted ranged level are known.
   * Folded into expected damage AFTER every max-hit multiplier, mirroring
   * wgloop's transform order (bolts apply to the final hit distribution).
   */
  boltProc?: BoltProcSpec;
}

interface StyleBonuses {
  attack: number;
  strength: number;
  attackSpeedAdjust: number;
}

function styleBonuses(style: CombatStyle, choice: AttackStyleChoice): StyleBonuses {
  switch (choice) {
    case "accurate":
      return { attack: 3, strength: 0, attackSpeedAdjust: 0 };
    case "aggressive":
      return { attack: 0, strength: 3, attackSpeedAdjust: 0 };
    case "controlled":
      return { attack: 1, strength: 1, attackSpeedAdjust: 0 };
    case "defensive":
      return { attack: 0, strength: 0, attackSpeedAdjust: 0 };
    case "rapid":
      return { attack: 0, strength: 0, attackSpeedAdjust: style === "ranged" ? -1 : 0 };
    case "longrange":
      return { attack: 0, strength: 0, attackSpeedAdjust: 0 };
  }
}

export function calculateDps(scenario: DpsScenario): DpsResult {
  const sb = styleBonuses(scenario.style, scenario.attackStyle);
  const effectiveAttackSpeed = Math.max(1, scenario.attackSpeedTicks + sb.attackSpeedAdjust);
  const mult = conditionalMultipliers(scenario.conditionalBonuses);
  const defenceRoll = npcDefenceRoll(scenario.targetDefenceLevel, scenario.targetDefenceBonusForStyle);

  let attackRoll: number;
  let maxHit: number;

  switch (scenario.style) {
    case "melee": {
      const effAtk = effectiveLevel(
        scenario.skills.attack,
        scenario.prayers.attackMultiplier,
        sb.attack,
      );
      const effStr = effectiveLevel(
        scenario.skills.strength,
        scenario.prayers.strengthMultiplier,
        sb.strength,
      );
      attackRoll = meleeAttackRoll(effAtk, scenario.attackBonus);
      maxHit = meleeMaxHit(effStr, scenario.strengthBonus);
      break;
    }
    case "ranged": {
      const effAtk = effectiveLevel(
        scenario.skills.ranged,
        scenario.prayers.rangedAttackMultiplier,
        sb.attack,
      );
      const effStr = effectiveLevel(
        scenario.skills.ranged,
        scenario.prayers.rangedStrengthMultiplier,
        sb.strength,
      );
      attackRoll = rangedAttackRoll(effAtk, scenario.attackBonus);
      maxHit = rangedMaxHit(effStr, scenario.strengthBonus);
      break;
    }
    case "magic": {
      // Magic uses +9 base offset for effective level (melee/ranged use +8).
      const effMag = effectiveLevel(
        scenario.skills.magic,
        scenario.prayers.magicAttackMultiplier,
        sb.attack,
        0,
        9,
      );
      attackRoll = magicAttackRoll(effMag, scenario.attackBonus);

      const base = scenario.baseSpellMaxHit ?? 0;
      const pctFromGear = scenario.magicDamagePercent ?? 0;
      // Prayer magic damage % (e.g. Augury = +4%) folds into the single
      // equipment-percent application, matching wgloop's behaviour where
      // both contribute to magicDmgBonus before trackAddFactor.
      const prayerPctBoost = (scenario.prayers.magicDamageMultiplier - 1) * 100;
      maxHit = magicMaxHit(base, pctFromGear + prayerPctBoost);

      // Spellement weakness — applies to BOTH attack roll and max hit when
      // the spell's element matches the monster's weakness. Per wgloop:
      //   atkRoll = trunc(atkRoll * (100 + severity) / 100)
      //   maxHit  = maxHit + floor(baseMax * severity / 100)
      // Note the max-hit application is ADDITIVE from baseMax, not a
      // multiplicative factor on the running max hit.
      const spellElement = scenario.spellElement;
      const weak = scenario.targetWeakness;
      if (weak && spellElement && weak.element === spellElement) {
        attackRoll = Math.trunc((attackRoll * (100 + weak.severity)) / 100);
        const weaknessBonus = Math.trunc((base * weak.severity) / 100);
        maxHit = maxHit + weaknessBonus;
      }

      // Tome of Fire on fire spells — +10% (×11/10) to max hit. The wgloop
      // factor is [11, 10], NOT [3, 2] as I'd originally assumed. Does not
      // affect accuracy.
      if (scenario.tomeOfFireEquipped && spellElement === "fire") {
        maxHit = Math.trunc((maxHit * 11) / 10);
      }
      break;
    }
  }

  // Armor-set bonus (Void / Elite Void) — applied BEFORE conditional bonuses
  // (DHCB / Salve / demonbane) per wgloop's order. Pure multiplicative, no
  // additive trick. Multiplier expressed as [n, d] (e.g. [11, 10] = ×1.10).
  if (scenario.armorSetBonus) {
    const setBonus = scenario.armorSetBonus;
    if (setBonus.accuracyFactor) {
      const [n, d] = setBonus.accuracyFactor;
      attackRoll = Math.trunc((attackRoll * n) / d);
    }
    if (setBonus.damageFactor) {
      const [n, d] = setBonus.damageFactor;
      maxHit = Math.trunc((maxHit * n) / d);
    }
  }

  attackRoll = applyFactors(attackRoll, mult.accuracy);
  maxHit = applyFactors(maxHit, mult.damage);

  // Twisted bow scaling: applies AFTER dragonbane / Salve multipliers per
  // wgloop's order of operations. Accuracy mod capped at 140%, damage mod
  // at 250%. Source: https://oldschool.runescape.wiki/w/Twisted_bow
  if (scenario.twistedBowEquipped && scenario.style === "ranged") {
    const M = scenario.targetMonsterMagicLevel ?? 0;
    const cap = scenario.targetIsXerician ? 350 : 250;
    const m = Math.min(cap, M);
    const accPctRaw = 140 + (3 * m - 10) / 100 - Math.pow((3 * m) / 10 - 100, 2) / 100;
    const dmgPctRaw = 250 + (3 * m - 14) / 100 - Math.pow((3 * m) / 10 - 140, 2) / 100;
    const accPct = Math.max(0, Math.min(140, accPctRaw));
    const dmgPct = Math.max(0, Math.min(250, dmgPctRaw));
    // Multiplier applied as trunc(roll × pct / 100) to mirror the integer math.
    attackRoll = Math.trunc((attackRoll * accPct) / 100);
    maxHit = Math.trunc((maxHit * dmgPct) / 100);
  }

  const accuracy = hitChance(attackRoll, defenceRoll);
  let dps = dpsFromHitChance(accuracy, maxHit, effectiveAttackSpeed);

  if (scenario.boltProc && scenario.style === "ranged") {
    const expected = expectedBoltDamagePerAttack(accuracy, maxHit, scenario.boltProc);
    dps = expected / (effectiveAttackSpeed * 0.6);
  }

  return { dps, maxHit, accuracy };
}
