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
  fangHitChance,
  hitChance,
  npcDefenceRoll,
} from "./common";
import { meleeAttackRoll, meleeMaxHit } from "./melee";
import { rangedAttackRoll, rangedMaxHit } from "./ranged";
import { magicAttackRoll, magicMaxHit } from "./magic";
import { applyFactors, conditionalMultipliers } from "./conditional";
import { expectedBoltDamagePerAttack, type BoltProcSpec } from "./bolts";
import { expectedMultiHitDamage, type HitProfile } from "./multihit";

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
  tomeOfFireEquipped?: boolean;
  /** Magic-only: ×6/5 accuracy + ×6/5 damage when spellElement === "water". */
  tomeOfWaterEquipped?: boolean;
  /** Magic-only: ×11/10 accuracy + ×11/10 damage when spellElement === "earth". */
  tomeOfEarthEquipped?: boolean;
  /**
   * Magic-only: Tumeken's shadow is equipped — triples the worn magic attack
   * bonus and magic damage % (overworld ×3; ToA ×4 not modeled), magic damage
   * capped at 100%.
   */
  shadowEquipped?: boolean;
  /**
   * Magic-only: a demonbane spell (Inferior/Superior/Dark Demonbane) cast vs a
   * demon — raises magic accuracy by this percentage (e.g. 20 → ×120/100).
   * Mark of Darkness would raise it further (not modeled). Damage is unaffected.
   * Resolved upstream (computeSetDps) where the cast spell + target attributes
   * are both known; left undefined when not applicable.
   */
  demonbaneSpellAccuracyPct?: number;
  /** Magic-only: Twinflame staff casting a standard spellbook spell — +10% accuracy & damage. */
  twinflameStandard?: boolean;
  /** Magic-only: Twinflame staff casting a qualifying Bolt/Blast/Wave — second cast (×7/5 damage). */
  twinflameDoubleCast?: boolean;
  /** Ranged-only: Twisted bow is equipped — scales accuracy/damage by target magic level. */
  twistedBowEquipped?: boolean;
  /** Target's magic level for Tbow scaling (max(skills.magic, offensive.magic)). */
  targetMonsterMagicLevel?: number;
  /** True when target is a Chambers of Xeric monster (Tbow cap 350 instead of 250). */
  targetIsXerician?: boolean;
  /**
   * Melee-only: Osmumten's fang on a stab style — replaces the single accuracy
   * roll with its two-roll hit chance (see `fangHitChance`). Resolved upstream
   * so the stab-vs-slash gate lives with the loadout, not the engine. The
   * fang's damage trim is mean-preserving, so only accuracy changes here.
   */
  fangEquipped?: boolean;
  /**
   * Black mask / slayer helmet (i) bonus is active — imbued head worn, on a
   * slayer task, and not superseded by an active Salve (they don't stack).
   * Style-dependent: ×7/6 melee, ×23/20 ranged & magic, on accuracy AND damage.
   * Resolved upstream (computeSetDps) where the on-task flag + Salve are known.
   */
  slayerOnTask?: boolean;
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
  /**
   * Multi-hit weapons (Scythe, Dual macuahuitl, Dark bow, Tonalztics, …). When
   * present, expected damage is taken from this hit profile instead of the
   * single-hit `maxHit/2` mean. Resolved upstream from the weapon id (+ target
   * size for the Scythe). See lib/dps/multihit.ts.
   */
  hitProfile?: HitProfile;
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
      // Tumeken's shadow triples the worn magic ATTACK bonus (and damage, below)
      // — ×4 inside the Tombs of Amascut, but this helper models the overworld
      // ×3 case. Void/Salve/Slayer-helm sit outside this multiplier; in this
      // engine they're already separate factors, so tripling the gear bonus is
      // correct. https://oldschool.runescape.wiki/w/Tumeken's_shadow
      const magicAtkBonus = scenario.shadowEquipped
        ? scenario.attackBonus * 3
        : scenario.attackBonus;
      attackRoll = magicAttackRoll(effMag, magicAtkBonus);

      // Demonbane spell (Arceuus) vs a demon — magic accuracy only. Applied to
      // the raw attack roll before tome/weakness/conditional mods, mirroring how
      // the spell's own accuracy bonus folds in upstream of gear multipliers.
      if (scenario.demonbaneSpellAccuracyPct) {
        attackRoll = Math.trunc(
          (attackRoll * (100 + scenario.demonbaneSpellAccuracyPct)) / 100,
        );
      }

      const base = scenario.baseSpellMaxHit ?? 0;
      let pctFromGear = scenario.magicDamagePercent ?? 0;
      // Shadow ×3 on gear magic damage, hard-capped at a total of 100%.
      if (scenario.shadowEquipped) pctFromGear = Math.min(pctFromGear * 3, 100);
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

      // Tome of Fire: +10% damage only (×11/10) on fire spells vs all NPCs.
      if (scenario.tomeOfFireEquipped && spellElement === "fire") {
        maxHit = Math.trunc((maxHit * 11) / 10);
      }
      // Tome of Water: +20% accuracy AND +20% damage (×6/5) on water spells.
      if (scenario.tomeOfWaterEquipped && spellElement === "water") {
        attackRoll = Math.trunc((attackRoll * 6) / 5);
        maxHit = Math.trunc((maxHit * 6) / 5);
      }
      // Tome of Earth: +10% accuracy AND +10% damage (×11/10) on earth spells.
      if (scenario.tomeOfEarthEquipped && spellElement === "earth") {
        attackRoll = Math.trunc((attackRoll * 11) / 10);
        maxHit = Math.trunc((maxHit * 11) / 10);
      }
      // Twinflame staff: +10% accuracy & damage on any standard spellbook spell,
      // plus a second cast worth ~40% of the first on Bolt/Blast/Wave (Strike and
      // Surge get only the +10%). The double-cast is mean-equivalent to a ×7/5
      // damage multiplier here. https://oldschool.runescape.wiki/w/Twinflame_staff
      if (scenario.twinflameStandard) {
        attackRoll = Math.trunc((attackRoll * 11) / 10);
        maxHit = Math.trunc((maxHit * 11) / 10);
      }
      if (scenario.twinflameDoubleCast) {
        maxHit = Math.trunc((maxHit * 7) / 5);
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

  // Black mask / slayer helmet (i) on-task — same bonus group as Salve/dragonbane.
  // Suppressed upstream when a Salve is active, so this never double-counts.
  if (scenario.slayerOnTask) {
    const [n, d] = scenario.style === "melee" ? [7, 6] : [23, 20];
    attackRoll = Math.trunc((attackRoll * n) / d);
    maxHit = Math.trunc((maxHit * n) / d);
  }

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

  const accuracy = scenario.fangEquipped
    ? fangHitChance(attackRoll, defenceRoll)
    : hitChance(attackRoll, defenceRoll);
  let dps = dpsFromHitChance(accuracy, maxHit, effectiveAttackSpeed);

  if (scenario.boltProc && scenario.style === "ranged") {
    const expected = expectedBoltDamagePerAttack(accuracy, maxHit, scenario.boltProc);
    dps = expected / (effectiveAttackSpeed * 0.6);
  } else if (scenario.hitProfile && scenario.hitProfile.length > 0) {
    // Multi-hit weapons override the single-hit mean with their hit profile.
    // (Mutually exclusive with bolts — a crossbow is never a multi-hit weapon.)
    const expected = expectedMultiHitDamage(scenario.hitProfile, accuracy, maxHit);
    dps = expected / (effectiveAttackSpeed * 0.6);
  }

  return { dps, maxHit, accuracy };
}
