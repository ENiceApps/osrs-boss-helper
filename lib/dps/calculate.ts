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
   * Magic-only: Tumeken's shadow is being used inside the Tombs of Amascut —
   * the worn-bonus multiplier becomes ×4 instead of the overworld ×3 (magic
   * damage still hard-capped at 100%). Only meaningful when `shadowEquipped`.
   */
  shadowToaQuadruple?: boolean;
  /**
   * Melee-only: Keris partisan's 1/51 chance to deal triple damage vs
   * Kalphites/Scabarites. Mean-only — the +33% damage lives in the conditional
   * factors (and the displayed max hit), while this rare proc lifts only mean
   * DPS by ×53/51. Resolved upstream alongside the kerisVsKalphite flag.
   */
  kalphiteTripleProc?: boolean;
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
  /**
   * Melee-only: Dharok's full set effect — max hit scales with missing HP.
   * Multiplier: 1 + (maxHp − currentHp) × maxHp / 10000.
   * Only active when all four Dharok's pieces are equipped. Resolved upstream.
   */
  dharok?: { maxHp: number; currentHp: number };
  /**
   * Blood moon "Bloodrager" set effect — full Blood moon armour (helm + chest +
   * tassets) worn with the Dual macuahuitl. Each successful hit has a 33% chance
   * to make the next attack land a tick sooner (3 ticks instead of 4). The
   * macuahuitl hits twice per attack (sequential), so the per-attack chance to
   * accelerate is P = 0.33·a·(1 + 0.67·a) where `a` is the per-hit accuracy.
   * Long-run effective interval = baseSpeed − P ticks. Accuracy-dependent, so
   * it's applied AFTER accuracy is known. Only active when the full set + weapon
   * are detected; resolved upstream (computeSetDps).
   */
  bloodrager?: boolean;
  /**
   * Melee-only: Berserker necklace worn with a TzHaar/obsidian melee weapon —
   * ×6/5 damage. Applied at the very end of the max-hit pipeline (after the
   * Obsidian armour set bonus and every other multiplier), mirroring wgloop's
   * final distribution scale. Stacks with the Obsidian set's ×11/10 (which
   * arrives via armorSetBonus). Resolved upstream (computeSetDps).
   */
  berserkerObsidian?: boolean;
  /**
   * Corporeal Beast halves damage from non-"corpbane" weapons (everything except
   * magic, or a stab-style spear/halberd/fang, or King's barrage). When set, the
   * final max hit is halved — mirroring wgloop's divisionTransformer(2) on the
   * damage distribution. Resolved upstream (computeSetDps) where the weapon name,
   * attack type and target identity are all known.
   */
  corpDamageHalved?: boolean;
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
  // A weapon with no recorded speed (e.g. holiday/cosmetic items wrongly in the
  // weapon slot) must NOT be treated as a 1-tick attack — that 4× inflates DPS
  // and makes the optimizer recommend junk. Default to 4 ticks, matching
  // wgloop's `weapon.speed || DEFAULT_ATTACK_SPEED`.
  const baseSpeedTicks = scenario.attackSpeedTicks > 0 ? scenario.attackSpeedTicks : 4;
  const effectiveAttackSpeed = Math.max(1, baseSpeedTicks + sb.attackSpeedAdjust);
  const mult = conditionalMultipliers(scenario.conditionalBonuses);
  const defenceRoll = npcDefenceRoll(scenario.targetDefenceLevel, scenario.targetDefenceBonusForStyle);

  let attackRoll: number;
  let maxHit: number;

  // Void's accuracy bonus multiplies the EFFECTIVE LEVEL (floored before the
  // gear multiply), not the final roll — see ArmorSetBonus.accuracyOnEffectiveLevel.
  const voidEffLvlAcc =
    scenario.armorSetBonus?.accuracyOnEffectiveLevel && scenario.armorSetBonus.accuracyFactor
      ? scenario.armorSetBonus.accuracyFactor
      : undefined;
  const applyEffLvlAcc = (level: number): number =>
    voidEffLvlAcc ? Math.trunc((level * voidEffLvlAcc[0]) / voidEffLvlAcc[1]) : level;
  // Void's melee/ranged DAMAGE bonus likewise multiplies the effective STRENGTH
  // level (floored before the max-hit formula) — see damageOnEffectiveLevel.
  const voidEffLvlDmg =
    scenario.armorSetBonus?.damageOnEffectiveLevel && scenario.armorSetBonus.damageFactor
      ? scenario.armorSetBonus.damageFactor
      : undefined;
  const applyEffLvlDmg = (level: number): number =>
    voidEffLvlDmg ? Math.trunc((level * voidEffLvlDmg[0]) / voidEffLvlDmg[1]) : level;

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
      attackRoll = meleeAttackRoll(applyEffLvlAcc(effAtk), scenario.attackBonus);
      maxHit = meleeMaxHit(applyEffLvlDmg(effStr), scenario.strengthBonus);
      if (scenario.dharok) {
        const { maxHp, currentHp } = scenario.dharok;
        maxHit = Math.trunc(maxHit * (1 + (maxHp - currentHp) * maxHp / 10000));
      }
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
      attackRoll = rangedAttackRoll(applyEffLvlAcc(effAtk), scenario.attackBonus);
      maxHit = rangedMaxHit(applyEffLvlDmg(effStr), scenario.strengthBonus);
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
      const shadowMult = scenario.shadowToaQuadruple ? 4 : 3;
      const magicAtkBonus = scenario.shadowEquipped
        ? scenario.attackBonus * shadowMult
        : scenario.attackBonus;
      attackRoll = magicAttackRoll(applyEffLvlAcc(effMag), magicAtkBonus);

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
      // Shadow ×3 (overworld) / ×4 (Tombs of Amascut) on gear magic damage,
      // hard-capped at a total of 100%.
      if (scenario.shadowEquipped) pctFromGear = Math.min(pctFromGear * shadowMult, 100);
      // Prayer magic damage % (e.g. Augury = +4%) folds into the single
      // equipment-percent application, matching wgloop's behaviour where
      // both contribute to magicDmgBonus before trackAddFactor.
      const prayerPctBoost = (scenario.prayers.magicDamageMultiplier - 1) * 100;
      maxHit = magicMaxHit(base, pctFromGear + prayerPctBoost);

      // Spellement weakness + elemental tomes affect BOTH accuracy and damage.
      // The ACCURACY side (multiplicative) is applied here; the DAMAGE side is
      // applied LATER (see the magic damage block after the conditional bonuses)
      // because the weakness max-hit bonus is ADDITIVE from baseMax and must not
      // be scaled by DHW / Salve / Void / Slayer multipliers — matching wgloop's
      // order (those multiply first, THEN the weakness is added, THEN the tome).
      const spellElement = scenario.spellElement;
      const weak = scenario.targetWeakness;
      if (weak && spellElement && weak.element === spellElement) {
        attackRoll = Math.trunc((attackRoll * (100 + weak.severity)) / 100);
      }
      // Tome of Water / Earth accuracy (×6/5, ×11/10). Tome of Fire is damage-only.
      if (scenario.tomeOfWaterEquipped && spellElement === "water") {
        attackRoll = Math.trunc((attackRoll * 6) / 5);
      }
      if (scenario.tomeOfEarthEquipped && spellElement === "earth") {
        attackRoll = Math.trunc((attackRoll * 11) / 10);
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
    // Void's accuracy factor was already applied to the effective level above;
    // applying it again here would double-count it.
    if (setBonus.accuracyFactor && !setBonus.accuracyOnEffectiveLevel) {
      const [n, d] = setBonus.accuracyFactor;
      attackRoll = Math.trunc((attackRoll * n) / d);
    }
    if (setBonus.damageFactor && !setBonus.damageOnEffectiveLevel) {
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
  // wgloop's order of operations. The bonus % is computed with INTEGER-truncated
  // intermediate terms and has NO upper clamp (the natural peak is e.g. 141%
  // accuracy at magic 250, not 140) — mirroring wgloop's tbowScaling exactly.
  // Source: https://oldschool.runescape.wiki/w/Twisted_bow
  if (scenario.twistedBowEquipped && scenario.style === "ranged") {
    const cap = scenario.targetIsXerician ? 350 : 250;
    const m = Math.min(cap, scenario.targetMonsterMagicLevel ?? 0);
    // factor/base differ for accuracy (10/140) vs damage (14/250).
    const tbowBonus = (factor: number, base: number): number => {
      const t2 = Math.trunc((3 * m - factor) / 100);
      const t3 = Math.trunc((Math.trunc((3 * m) / 10) - 10 * factor) ** 2 / 100);
      return base + t2 - t3;
    };
    attackRoll = Math.trunc((attackRoll * tbowBonus(10, 140)) / 100);
    maxHit = Math.trunc((maxHit * tbowBonus(14, 250)) / 100);
  }

  // Magic damage: elemental weakness then elemental tome — applied AFTER the
  // multiplicative bonuses (DHW / Salve / Void / Slayer above) so the ADDITIVE
  // weakness bonus (⌊baseMax × severity/100⌋) isn't scaled by them. Mirrors
  // wgloop: ...×DHW → +weakness → ×tome. The tome multiplies the weakness, the
  // dragon-hunter/salve/slayer multipliers do not.
  if (scenario.style === "magic") {
    const base = scenario.baseSpellMaxHit ?? 0;
    const el = scenario.spellElement;
    const weak = scenario.targetWeakness;
    if (weak && el && weak.element === el) {
      maxHit = maxHit + Math.trunc((base * weak.severity) / 100);
    }
    if (scenario.tomeOfFireEquipped && el === "fire") maxHit = Math.trunc((maxHit * 11) / 10);
    if (scenario.tomeOfWaterEquipped && el === "water") maxHit = Math.trunc((maxHit * 6) / 5);
    if (scenario.tomeOfEarthEquipped && el === "earth") maxHit = Math.trunc((maxHit * 11) / 10);
  }

  // Berserker necklace + TzHaar/obsidian melee weapon: ×6/5 damage, applied last
  // (after the obsidian armour set's ×11/10), matching wgloop's final damage
  // scale. e.g. obsidian set base 36 → trunc(36 × 6/5) = 43.
  if (scenario.berserkerObsidian && scenario.style === "melee") {
    maxHit = Math.trunc((maxHit * 6) / 5);
  }

  // Corporeal Beast halves damage from non-corpbane weapons. Applied last (after
  // every damage multiplier), before the bolt/multi-hit expected-damage calc so
  // it propagates to those means too.
  if (scenario.corpDamageHalved) {
    maxHit = Math.trunc(maxHit / 2);
  }

  const accuracy = scenario.fangEquipped
    ? fangHitChance(attackRoll, defenceRoll)
    : hitChance(attackRoll, defenceRoll);

  // Blood moon "Bloodrager" set effect: the Dual macuahuitl's two sequential
  // hits each have a 33% chance to accelerate the next attack by one tick. The
  // per-attack chance to accelerate is P = 0.33·a·(1 + 0.67·a) (a = per-hit
  // accuracy: hit 1 lands w.p. a, hit 2 only if hit 1 did, so w.p. a²). The
  // long-run effective interval drops by P ticks. Accuracy-dependent, so it's
  // resolved here rather than in the up-front styleBonuses speed adjust.
  const bloodragerSpeed = scenario.bloodrager
    ? Math.max(1, effectiveAttackSpeed - 0.33 * accuracy * (1 + 0.67 * accuracy))
    : effectiveAttackSpeed;

  let dps = dpsFromHitChance(accuracy, maxHit, bloodragerSpeed);

  if (scenario.boltProc && scenario.style === "ranged") {
    const expected = expectedBoltDamagePerAttack(accuracy, maxHit, scenario.boltProc);
    dps = expected / (bloodragerSpeed * 0.6);
  } else if (scenario.hitProfile && scenario.hitProfile.length > 0) {
    // Multi-hit weapons override the single-hit mean with their hit profile.
    // (Mutually exclusive with bolts — a crossbow is never a multi-hit weapon.)
    const expected = expectedMultiHitDamage(scenario.hitProfile, accuracy, maxHit);
    dps = expected / (bloodragerSpeed * 0.6);
  }

  // Keris partisan's 1/51 triple-damage proc vs Kalphites lifts mean DPS by
  // (50·1 + 1·3)/51 = ×53/51. The +33% damage is already baked into maxHit via
  // the conditional factors; this is the rare-proc expectation on top, applied
  // to whichever mean (single-hit / bolt / multi-hit) was computed above.
  if (scenario.kalphiteTripleProc) {
    dps = (dps * 53) / 51;
  }

  return { dps, maxHit, accuracy };
}
