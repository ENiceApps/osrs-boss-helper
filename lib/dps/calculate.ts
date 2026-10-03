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
  landedFloorLift,
  meanTransformedRoll,
  npcDefenceRoll,
  scaleHitsplat,
} from "./common";
import { meleeAttackRoll, meleeMaxHit } from "./melee";
import { rangedAttackRoll, rangedMaxHit } from "./ranged";
import { magicAttackRoll, magicMaxHit } from "./magic";
import {
  applyFactors,
  conditionalMultipliers,
  salveFactor,
  salveMagicPct,
} from "./conditional";
import {
  boltAccurateZeroes,
  expectedBoltDamagePerAttack,
  transformedBoltDamagePerAttack,
  type BoltProcSpec,
} from "./bolts";
import {
  expectedMultiHitDamage,
  hitsplatMaxima,
  hitsplatRolls,
  isSplitProfile,
  type HitProfile,
} from "./multihit";
import { armouredHit, meanArmouredHit, sumArmouredHits } from "./flat-armour";
import type { DamageCap } from "./damage-cap";
import { hasNpcHitTransforms, npcHitMax, npcHitMean, type NpcHitTransforms } from "./npc-transforms";
import type { StyleDamageScale } from "@/data/monsters/style-damage-scale";
import { twinflameDamage, twinflameSecondHit } from "./twinflame";
import { applyTwistedBow, twistedBowMagic } from "./twisted-bow";
import {
  DEFAULT_DEMONBANE_VULNERABILITY,
  scaleDemonbanePct,
} from "@/data/monsters/demonbane-vulnerability";

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
  /**
   * Magic-only: flat max-hit bonus on the spell's BASE hit — the +2 an Amulet of
   * air/water/earth/fire (matching `spellElement`) or the Elemental amulet grants
   * on elemental spells (Summer Sweep-Up Miscellaneous, 2026-09-02). Resolved
   * upstream (`activeBonusesForTarget` -> computeSetDps) against the cast spell's
   * element; undefined/0 when no matching amulet. Mirrors upstream
   * osrs-dps-calc #966 `hasMatchingElementalAmulet`: the +2 is added to the base
   * spell max hit (after Charge, before the magic damage %), so it is MULTIPLIED
   * by the magic damage % / Twinflame / Void-style factors and also lands inside
   * the `baseMax` snapshot the elemental-weakness bonus is taken from. Powered
   * staves and Ancient/Arceuus spells have no element, so never get it.
   */
  elementalSpellFlatBonus?: number;
  /** Magic-only: ×11/10 damage when spellElement === "fire". */
  tomeOfFireEquipped?: boolean;
  /**
   * Magic-only: ×6/5 accuracy + ×11/10 damage when spellElement === "water".
   * The damage boost vs NPCs dropped from 20% to 10% in Project Rebalance
   * (2024-05-29); the accuracy stays ×6/5, as in wgloop (see the accuracy
   * step below for why).
   */
  tomeOfWaterEquipped?: boolean;
  /** Magic-only: ×11/10 damage when spellElement === "earth" (no accuracy bonus). */
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
   * Melee-only: a Keris's 1/51 chance to deal triple damage vs
   * Kalphites/Scabarites. Mean-only — the ×133/100 damage lives in the
   * conditional factors (and the displayed max hit), while this rare proc lifts
   * only mean DPS by ×53/51. Resolved upstream alongside the kerisVsKalphite flag.
   */
  kalphiteTripleProc?: boolean;
  /**
   * Magic-only: Sanguinesti staff's 1/5 life-leech proc deals 8 bonus damage
   * (Summer Sweep-Up, 2026-07-22). Mean-only — expected +8/5 per landed hit,
   * flat (no magic-damage scaling). Resolved upstream from the weapon id.
   */
  sanguinestiProc?: boolean;
  /**
   * Target's demonbane vulnerability as a percent (default 100 = an ordinary
   * demon). Resolved upstream (computeSetDps) from the target's name/id via
   * data/monsters/demonbane-vulnerability.ts (Duke Sucellus 70, Yama 120, Yama
   * void flares 200, Ice demon 115 — raised from 100 in the 2026-07-22 Summer
   * Sweep-Up). Scales EVERY demonbane source below / in the conditional
   * factors, mirroring wgloop's demonbaneFactor (bonus percent becomes
   * trunc(pct × vulnerability / 100)), except the on-task Scorching-bow fold
   * into the slayer mask, which upstream leaves unscaled (see the fold below).
   */
  demonbaneVulnerability?: number;
  /**
   * Magic-only: a demonbane spell (Inferior/Superior/Dark Demonbane) cast vs a
   * demon — raises magic accuracy by this percentage (e.g. 20 → ×120/100).
   * Resolved upstream (computeSetDps) where the cast spell, target attributes,
   * Mark of Darkness, and Purging staff are all known: base 20, Mark of
   * Darkness 40, Purging staff doubles either (→ 40/80). Undefined when N/A.
   * This is the UNSCALED percent — the engine applies `demonbaneVulnerability`.
   */
  demonbaneSpellAccuracyPct?: number;
  /**
   * Magic-only: demonbane spell DAMAGE bonus percentage — non-zero only with
   * Mark of Darkness active (25, or 50 with the Purging staff). wgloop applies
   * it per-hitsplat (h + trunc(trunc(h×pct/100) × vulnerability/100)); this
   * mean engine applies the same formula to the max hit, which matches to
   * within the per-roll truncation (<0.5 damage). Also UNSCALED — the engine
   * applies `demonbaneVulnerability`.
   */
  demonbaneSpellDamagePct?: number;
  /**
   * Magic-only: a Smoke battlestaff, Mystic smoke staff or Twinflame staff
   * casting a standard-spellbook spell — +10% accuracy & damage. Upstream adds
   * the 10 to the same percents as the Salve (i)/(ei) (one attack-roll percent,
   * one magic damage bonus), so it is not a separate ×11/10.
   */
  smokeStaffStandard?: boolean;
  /**
   * Magic-only: Twinflame staff casting a qualifying Bolt/Blast/Wave — a second
   * hitsplat of trunc(h × 4/10) on the FINAL first-cast hit h (after slayer
   * helm, dragonbane, weakness, tome), as upstream's distribution transform
   * does. Max hit h + trunc(h × 4/10); the mean is taken per roll, hitsplat by
   * hitsplat (lib/dps/twinflame.ts), not as 7/10 of that max.
   */
  twinflameDoubleCast?: boolean;
  /**
   * Ranged-only: Twisted bow is equipped — scales accuracy/damage by the higher
   * of the target's Magic level and magic attack bonus (lib/dps/twisted-bow.ts).
   */
  twistedBowEquipped?: boolean;
  /** Target's Magic level (upstream `skills.magic`) — one Tbow scaling input. */
  targetMonsterMagicLevel?: number;
  /** Target's magic attack bonus (upstream `offensive.magic`) — the other. */
  targetMagicAttackBonus?: number;
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
   * Osmumten's fang is the weapon (any style): its normal hits roll uniformly
   * over lo..max−lo, lo = trunc(max × 3/20) (wgloop getPlayerMaxMeleeHit). The
   * trim is mean-neutral on its own, but positive flat armour clips that range
   * differently from 0..max, and once max ≥ 7 it leaves no 0 for the
   * accurate-zero raise to lift.
   */
  fangHitTrim?: boolean;
  /**
   * Ranged-only: Seeking arrows fired by the bow. wgloop floors every landed
   * hitsplat at 3, just ahead of its accurate-zero raise (`landedFloorLift`).
   */
  seekingArrows?: boolean;
  /**
   * Black mask / slayer helmet (i) bonus is active — imbued head worn, on a
   * slayer task, and not superseded by an active Salve (they don't stack).
   * Style-dependent: ×7/6 melee, ×23/20 ranged & magic, on accuracy AND damage.
   * Resolved upstream (computeSetDps) where the on-task flag + Salve are known.
   * Where it lands follows wgloop: melee/ranged first (Salve's slot, before
   * every weapon bane); magic damage right after the magic damage %, magic
   * accuracy after the dragonbane factor.
   */
  slayerOnTask?: boolean;
  /**
   * Armor-set bonus active on the loadout (e.g. Void Knight). Applied as a
   * multiplier on attack roll + max hit before conditional bonuses (DHCB/Salve)
   * — per wgloop's PlayerVsNPCCalc order of operations — except where the set
   * says otherwise: Inquisitor's after every target bonus
   * (`afterTargetBonuses`), Obsidian added from the base after Salve
   * (`additiveFromBase`).
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
   * magic, or a stab-style spear/halberd/fang). wgloop's divisionTransformer(2)
   * halves EACH hitsplat — after the multi-hit split, the bolt effects and the
   * accurate-zero raise, before ruby bolts and the NPC transforms — so every
   * mean branch rolls from the pre-halving max and halves each landed
   * hitsplat (`perHitsplat` in calculateDps). Resolved upstream (computeSetDps)
   * where the weapon name, attack type and target identity are all known.
   */
  corpDamageHalved?: boolean;
  /**
   * Per-monster/per-phase damage scale as a [numerator, denominator] factor:
   * [4, 5] for the Tormented Demon's shield, [1, 2] for the Abyssal Sire's
   * transition, [13, 10] for the Hueycoatl's pillar buff, [0, 1] for Doom's
   * immunity. Applied to the final max hit after every other multiplier,
   * mirroring wgloop's applyNpcTransforms order. Resolved upstream
   * (computeSetDps) where the target's phase, style gates, and any bypassing
   * weapons (demonbane/abyssal) are known.
   */
  targetDamageFactor?: [number, number];
  /**
   * wgloop's multiplyTransformer minimum for `targetDamageFactor`: a hitsplat
   * of at least this much is never scaled below it (the Tormented Demon's
   * shield: 1). It shows up only through the accurate-zero raise: a raised 1
   * survives the TD shield, where trunc(1 × 4/5) would zero it.
   */
  targetDamageMinimum?: number;
  /**
   * Per-phase attack-roll scale (Royal Titans: ranged ×6 out of melee range).
   * Applied to the final attack roll just before the hit-chance calc.
   * Style-gated upstream.
   */
  targetAccuracyFactor?: [number, number];
  /** Player attacks cannot miss (Doom of Mokhaiotl burrowing/shielded). */
  targetAlwaysHit?: boolean;
  /**
   * The target takes NO damage from this loadout — a leafy monster without a
   * leaf-bladed source, or a zero damage-modifier phase (Doom's shield).
   * wgloop's isImmune turns the whole hit distribution into a 0, so procs and
   * extra hitsplats (enchanted bolts, Sanguinesti leech, Keris) are zeroed
   * too, not just the max hit. Accuracy is still reported. Resolved upstream
   * (computeSetDps).
   */
  targetImmune?: boolean;
  /**
   * Raised minimum hit as [numerator, denominator] of the final max hit (Mad
   * Angel reaction buffs: dodged Sweep = [1,2], perfect Smite flick = [1,1]).
   * The hit still ROLLS uniformly over 0..max and is then floored to
   * min = trunc(max×n/d) — wgloop's `firstHitMinimum` since upstream #948 —
   * so the landed-hit mean is [min(min+1) + max(max+1)] / (2(max+1)), NOT
   * (min+max)/2. See `meanLandedHitWithMinimum`. A Twinflame double cast
   * applies it to each of its two hitsplats instead (lib/dps/twinflame.ts).
   */
  targetMinHitFactor?: [number, number];
  /**
   * Target's flat armour (catalog `defenceBonuses.flatArmour`, upstream
   * `defensive.flat_armour`): wgloop's LAST NPC transform turns every accurate
   * melee/ranged hitsplat d into max(0, d − armour). Negative armour adds
   * damage (Gargoyle −2, Earthen nagua −4), positive subtracts it (Heavy
   * skeleton +1). Ignored for magic. Shifts the reported max hit and every mean
   * branch — single hit, raised minimum, bolt procs, each multi-hit hitsplat,
   * Keris's triple — see lib/dps/flat-armour.ts.
   */
  targetFlatArmour?: number;
  /**
   * The target's damage cap (Zulrah: every hitsplat over 50 deals 45-50, any
   * style — data/monsters/damage-cap.ts). Upstream's FIRST NPC transform
   * (cappedRerollTransformer(50, 5, 45), PlayerVsNPCCalc L1937-1940 @
   * 89c3e25), so it hits each hitsplat after the attacker side (the
   * accurate-zero raise, Corp, ruby bolts, a Mad Angel floor) and before the
   * phase damage factor and flat armour. Every mean branch then takes each
   * landed hitsplat through it (`perHitsplat` in calculateDps) — bolt procs,
   * the Sanguinesti leech, each multi-hit hitsplat, the Twinflame pair — and
   * the reported max hit is capped per hitsplat, as upstream's getMax() reads it.
   */
  targetDamageCap?: DamageCap;
  /**
   * A per-monster damage scale for this loadout's style — ranged vs the Kraken
   * / Cave kraken: trunc(d/7), minimum 1 (upstream divisionTransformer(7, 1),
   * PlayerVsNPCCalc L1945-1948; data/monsters/style-damage-scale.ts). An NPC
   * transform: after the damage cap, before the phase factor and flat armour,
   * on every hitsplat — a raised 0 stays 1, a ruby proc of 51 lands 7, a miss
   * stays 0. Resolved upstream (computeSetDps) only for the matching style.
   */
  targetStyleDamageScale?: StyleDamageScale;
}

interface StyleBonuses {
  attack: number;
  strength: number;
  attackSpeedAdjust: number;
}

function styleBonuses(style: CombatStyle, choice: AttackStyleChoice): StyleBonuses {
  // Magic: only a powered staff's Accurate stance adds anything, and it is +2
  // on magic's +9 base (upstream getPlayerMaxMagicAttackRoll), not melee and
  // ranged's +3 on +8. The wiki's "+3 accurate / +1 longrange" (Bitterkoekje)
  // sits on a +8 base: the same 11 / 9 either way. +3 here gave 12.
  if (style === "magic") {
    return { attack: choice === "accurate" ? 2 : 0, strength: 0, attackSpeedAdjust: 0 };
  }
  switch (choice) {
    case "accurate":
      // Ranged Accurate's invisible +3 boosts damage as well as accuracy
      // (upstream adds it to both ranged rolls, before Void's multiply).
      // https://oldschool.runescape.wiki/w/Combat_Options
      return { attack: 3, strength: style === "ranged" ? 3 : 0, attackSpeedAdjust: 0 };
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

/**
 * Mean damage of a LANDED hit that rolls uniformly over 0..max and is then
 * floored to `min` (wgloop `AttackDistribution.firstHitMinimum`:
 * damage = max(roll, min)). With M = max, m = min:
 *
 *   rolls 0..m all become m          -> (m+1) values worth m
 *   rolls m+1..M stay as rolled      -> sum = (M(M+1) - m(m+1)) / 2
 *   mean = [m(m+1) + (M(M+1) - m(m+1))/2] / (M+1)
 *        = [m(m+1) + M(M+1)] / (2(M+1))
 *
 * Checks: m = 0 -> M/2 (the plain uniform mean); m = M -> M (always max, Perfect
 * Lightning's [1,1]); M = 40, m = 20 -> 1030/41 ~= 25.12 (the old
 * mean-of-endpoints model said 30).
 *
 * With flat armour A (lib/dps/flat-armour.ts) the floored hit is shifted
 * afterwards, as upstream orders it: [(m+1)·max(0, m−A) + Σ_{d=m+1}^{M} max(0, d−A)] / (M+1).
 */
export function meanLandedHitWithMinimum(max: number, min: number, flatArmour = 0): number {
  if (max <= 0) return 0;
  const m = Math.min(Math.max(min, 0), max);
  if (flatArmour !== 0) {
    return ((m + 1) * armouredHit(m, flatArmour) + sumArmouredHits(m + 1, max, flatArmour)) / (max + 1);
  }
  if (m >= max) return max;
  return (m * (m + 1) + max * (max + 1)) / (2 * (max + 1));
}

/**
 * The spell base max hit the magic pipeline starts from: the resolved spell hit
 * plus any matching elemental-amulet flat bonus. Used at BOTH max-hit sites (the
 * magic damage % step and the post-multiplier elemental-weakness step) so the
 * +2 sits before the damage % and inside the weakness base, as upstream does.
 * A zero base (no spell / a 0-damage spell) stays zero — upstream returns
 * [0, 0] before any flat bonus is added.
 */
function spellBaseMaxHit(scenario: DpsScenario): number {
  const base = scenario.baseSpellMaxHit ?? 0;
  if (base <= 0) return 0;
  const el = scenario.spellElement;
  const flat = el && el !== "none" ? (scenario.elementalSpellFlatBonus ?? 0) : 0;
  return base + flat;
}

export function calculateDps(scenario: DpsScenario): DpsResult {
  const sb = styleBonuses(scenario.style, scenario.attackStyle);
  // A weapon with no recorded speed (e.g. holiday/cosmetic items wrongly in the
  // weapon slot) must NOT be treated as a 1-tick attack — that 4× inflates DPS
  // and makes the optimizer recommend junk. Default to 4 ticks, matching
  // wgloop's `weapon.speed || DEFAULT_ATTACK_SPEED`.
  const baseSpeedTicks = scenario.attackSpeedTicks > 0 ? scenario.attackSpeedTicks : 4;
  const effectiveAttackSpeed = Math.max(1, baseSpeedTicks + sb.attackSpeedAdjust);
  const cbFlags = scenario.conditionalBonuses;
  // Salve amulet vs undead (melee / ranged): its own factor, applied first —
  // see the Salve / black mask step below. Magic's Salve is a flat percent
  // instead (salveMagicPct), folded in with the magic damage %.
  const salve = scenario.style === "magic" ? undefined : salveFactor(cbFlags);
  // On-task ranged: ranged-bane damage folds into the mask (see below), so
  // the standalone DHCB/wilderness damage factors are omitted from the list.
  // An active Salve takes the mask's slot, leaving the banes multiplicative.
  const foldRangedBane =
    scenario.slayerOnTask === true && scenario.style === "ranged" && salve === undefined;
  const demonbaneVuln = scenario.demonbaneVulnerability ?? DEFAULT_DEMONBANE_VULNERABILITY;
  const mult = conditionalMultipliers(cbFlags, foldRangedBane, demonbaneVuln);
  const defenceRoll = npcDefenceRoll(scenario.targetDefenceLevel, scenario.targetDefenceBonusForStyle);

  let attackRoll: number;
  let maxHit: number;
  // The attack roll / max hit before ANY multiplier. Bonuses that upstream
  // takes from the base rather than the running value read these: the magic
  // elemental weakness (roll and max hit) and Obsidian's +10% (melee).
  let baseRoll: number;
  let baseMax: number;

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
      baseRoll = attackRoll;
      baseMax = maxHit;
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
      baseRoll = attackRoll;
      baseMax = maxHit;
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
      baseRoll = attackRoll;

      // Salve amulet (i)/(ei) (+15 / +20) and a smoke staff or Twinflame on a
      // standard spell (+10) are flat percents. Upstream sums them into ONE
      // attack-roll percent (getPlayerMaxMagicAttackRoll's additiveBonus) and
      // adds the same values to the magic damage bonus — so Salve(ei) +
      // Twinflame is ×130/100, not trunc(trunc(×6/5)×11/10).
      // https://oldschool.runescape.wiki/w/Twinflame_staff
      const smokePct = scenario.smokeStaffStandard ? 10 : 0;
      const flatPct = salveMagicPct(cbFlags) + smokePct;
      if (flatPct !== 0) attackRoll = Math.trunc((attackRoll * (100 + flatPct)) / 100);

      const base = spellBaseMaxHit(scenario);
      baseMax = base;
      let pctFromGear = scenario.magicDamagePercent ?? 0;
      // Shadow ×3 (overworld) / ×4 (Tombs of Amascut) on gear magic damage,
      // hard-capped at a total of 100%.
      if (scenario.shadowEquipped) pctFromGear = Math.min(pctFromGear * shadowMult, 100);
      // Prayer magic damage % (e.g. Augury = +4%) and the flat Salve / smoke
      // staff percents fold into the single equipment-percent application,
      // matching wgloop's magicDmgBonus before trackAddFactor.
      const prayerPctBoost = (scenario.prayers.magicDamageMultiplier - 1) * 100;
      // Elite Void's +5% is part of the same percent (damageOnMagicPercent).
      const voidMagicDmg = scenario.armorSetBonus?.damageOnMagicPercent
        ? scenario.armorSetBonus.damageFactor
        : undefined;
      const voidPct = voidMagicDmg ? ((voidMagicDmg[0] - voidMagicDmg[1]) / voidMagicDmg[1]) * 100 : 0;
      maxHit = magicMaxHit(base, pctFromGear + prayerPctBoost + flatPct + voidPct);
      break;
    }
  }

  // Armor-set bonus (Void / Elite Void / Crystal) — applied BEFORE Salve, the
  // black mask and the weapon's target bonuses (DHCB / demonbane) per wgloop's
  // order. Pure multiplicative. Multiplier expressed as [n, d] (e.g. [11, 10]
  // = ×1.10). Inquisitor's and Obsidian are placed later (see their flags).
  const setBonus = scenario.armorSetBonus;
  if (setBonus && !setBonus.afterTargetBonuses && !setBonus.additiveFromBase) {
    // Void's accuracy factor was already applied to the effective level above;
    // applying it again here would double-count it.
    if (setBonus.accuracyFactor && !setBonus.accuracyOnEffectiveLevel) {
      const [n, d] = setBonus.accuracyFactor;
      attackRoll = Math.trunc((attackRoll * n) / d);
    }
    // Void's damage factor likewise went into the effective level (melee /
    // ranged) or the magic damage percent (Elite Void magic) above.
    if (setBonus.damageFactor && !setBonus.damageOnEffectiveLevel && !setBonus.damageOnMagicPercent) {
      const [n, d] = setBonus.damageFactor;
      maxHit = Math.trunc((maxHit * n) / d);
    }
  }

  // Salve amulet / black mask — wgloop's first bonus slot ("these bonuses do
  // not stack with each other"). Melee and ranged apply it right after the base
  // roll / max hit, BEFORE every weapon target bonus: e.g. on-task Leaf-bladed
  // battleaxe, base 41 -> trunc(trunc(41×7/6)×47/40) = 55, not 56. The mask is
  // suppressed upstream (computeSetDps) while a Salve is active; Salve wins
  // here too if both arrive. Magic folded its Salve into the percents above
  // and places the mask below.
  const scorchingBowVsDemon =
    scenario.style === "ranged" && cbFlags?.demonbaneScorchingBow === true;
  if (salve) {
    attackRoll = applyFactors(attackRoll, [salve]);
    maxHit = applyFactors(maxHit, [salve]);
  } else if (scenario.slayerOnTask && scenario.style !== "magic") {
    const [n, d] = scenario.style === "melee" ? [7, 6] : [23, 20];
    attackRoll = Math.trunc((attackRoll * n) / d);
    // Ranged-bane DAMAGE bonuses fold additively INTO the mask multiplier on
    // task — wilderness weapon +10, DHCB +5, Scorching bow +6 on the 23/20
    // numerator (e.g. DHCB = ×28/20, NOT ×23/20 × 5/4) — mirroring wgloop's
    // "additive with slayer only" merge. When folding, the standalone
    // DHCB/wilderness DAMAGE factors were omitted from `mult` above (see
    // conditionalMultipliers' foldRangedBaneDamage); accuracy is untouched.
    // NOTE: wgloop's fold adds a FLAT +6 for the Scorching bow
    // (`numerator += 6`) — it does not apply the demonbane vulnerability on
    // task, only off task (below). Mirrored as-is, so at Duke/Yama an on-task
    // Scorching bow matches the wiki calc rather than the "correct" scaling.
    let dmgN = n;
    if (foldRangedBane) {
      if (cbFlags?.wildernessWeapon) dmgN += 10;
      if (cbFlags?.dragonHunterCrossbow) dmgN += 5;
      if (scorchingBowVsDemon) dmgN += 6;
    }
    maxHit = Math.trunc((maxHit * dmgN) / d);
  }

  // Magic black mask: ×23/20 — on damage right after the magic damage % (before
  // dragonbane), on accuracy after dragonbane (below), as wgloop orders it. A
  // Salve (i)/(ei) takes its slot, same as melee/ranged.
  const magicMask =
    scenario.style === "magic" && scenario.slayerOnTask === true && salveMagicPct(cbFlags) === 0;
  if (magicMask) maxHit = Math.trunc((maxHit * 23) / 20);

  // Obsidian armour + TzHaar weapon: + trunc(base/10), from the PRE-multiplier
  // base, added after the Salve (wgloop PLAYER_ACCURACY_OBSIDIAN /
  // MAX_HIT_OBSIDIAN) — not ×11/10 of the Salve-boosted value.
  if (setBonus?.additiveFromBase) {
    if (setBonus.accuracyFactor) {
      const [n, d] = setBonus.accuracyFactor;
      attackRoll = attackRoll + Math.trunc((baseRoll * (n - d)) / d);
    }
    if (setBonus.damageFactor) {
      const [n, d] = setBonus.damageFactor;
      maxHit = maxHit + Math.trunc((baseMax * (n - d)) / d);
    }
  }

  // Weapon target bonuses (demonbane, dragonbane, keris, golembane, leafy,
  // wilderness). Only one weapon is worn, so their order among themselves
  // never matters — only their place after Salve / the mask does.
  if (scenario.style === "magic") {
    // wgloop magic accuracy: dragonbane → black mask → demonbane spell →
    // wilderness (rev weapon).
    attackRoll = applyFactors(attackRoll, mult.accuracy.filter((f) => !f.wilderness));
    if (magicMask) attackRoll = Math.trunc((attackRoll * 23) / 20);
    // Demonbane spell (Arceuus) vs a demon — magic accuracy only. The percent
    // is scaled by the target's demonbane vulnerability first (wgloop
    // demonbaneFactor: trunc(pct × vulnerability/100), e.g. 40% at Duke
    // Sucellus 70% -> 28%).
    if (scenario.demonbaneSpellAccuracyPct) {
      const pct = scaleDemonbanePct(scenario.demonbaneSpellAccuracyPct, demonbaneVuln);
      attackRoll = Math.trunc((attackRoll * (100 + pct)) / 100);
    }
    attackRoll = applyFactors(attackRoll, mult.accuracy.filter((f) => f.wilderness));
  } else {
    attackRoll = applyFactors(attackRoll, mult.accuracy);
  }
  maxHit = applyFactors(maxHit, mult.damage);

  if (scorchingBowVsDemon && !foldRangedBane) {
    // Off-task the +30% damage stands alone (wgloop's
    // trackAddFactor(demonbaneFactor(30))), so it IS scaled by the target's
    // demonbane vulnerability. DHCB/wilderness damage stayed in `mult` as
    // ordinary multiplicative factors, so only the Scorching bow needs
    // handling here.
    maxHit = maxHit + Math.trunc((maxHit * scaleDemonbanePct(30, demonbaneVuln)) / 100);
  }

  // Inquisitor's armour: after every target bonus, as wgloop applies it.
  if (setBonus?.afterTargetBonuses) {
    if (setBonus.accuracyFactor) {
      const [n, d] = setBonus.accuracyFactor;
      attackRoll = Math.trunc((attackRoll * n) / d);
    }
    if (setBonus.damageFactor) {
      const [n, d] = setBonus.damageFactor;
      maxHit = Math.trunc((maxHit * n) / d);
    }
  }

  // Magic accuracy: Tome of Water, then the elemental weakness — the last two
  // steps of wgloop's getPlayerMaxMagicAttackRoll, after every multiplier above.
  //  - Tome of Water: ×6/5 on water spells. The wiki's effect text says 10% vs
  //    NPCs, but that edit (2024-05-29) folded accuracy in with the Project
  //    Rebalance DAMAGE cut, while Jagex's notes only mention damage; wgloop
  //    keeps ×6/5. The Tome of Earth has no accuracy bonus at all.
  //  - Weakness: + trunc(baseRoll × severity/100), additive from the roll
  //    before any multiplier, so neither the tome nor the slayer helm / Salve /
  //    DHW scales it.
  if (scenario.style === "magic") {
    const el = scenario.spellElement;
    if (scenario.tomeOfWaterEquipped && el === "water") {
      attackRoll = Math.trunc((attackRoll * 6) / 5);
    }
    const weak = scenario.targetWeakness;
    if (weak && el && weak.element === el) {
      attackRoll = attackRoll + Math.trunc((baseRoll * weak.severity) / 100);
    }
  }

  // Twisted bow scaling: after the Salve / black mask, as wgloop orders it (no
  // other weapon bane can be worn alongside it). The bow scales off the higher
  // of the target's Magic level and magic attack bonus, capped at 250 (350 vs
  // Xerician targets), and the bonus percents are CLAMPED to 140% accuracy /
  // 250% damage — upstream PlayerVsNPCCalc L566-573 / L744-748 and tbowScaling
  // (L2429-2438) @ 89c3e25; see lib/dps/twisted-bow.ts. Magic 250 is 140%, not
  // the unclamped 141%; a Xerician 350 is 140%, not 150%.
  //
  // Not modelled: at the P2 Wardens (Elidinis' / Tumeken's Warden "Active")
  // upstream applies the ACCURACY scaling twice (a game behaviour since
  // 2023-06-21). There it only feeds applyP2WardensDamageModifier — upstream
  // forces P2 accuracy to 1 and turns the attack roll into a 15-40% damage
  // modifier — and this engine models neither, so doubling the roll alone
  // would only inflate an accuracy that is already the wrong model there.
  if (scenario.twistedBowEquipped && scenario.style === "ranged") {
    const { magic } = twistedBowMagic(
      scenario.targetMonsterMagicLevel ?? 0,
      scenario.targetMagicAttackBonus ?? 0,
      scenario.targetIsXerician === true,
    );
    attackRoll = applyTwistedBow(attackRoll, magic, "accuracy");
    maxHit = applyTwistedBow(maxHit, magic, "damage");
  }

  // The Twinflame's first-cast max, kept for the per-hitsplat model below.
  let twinflameFirstMax: number | undefined;

  // Magic damage: elemental weakness then elemental tome — applied AFTER the
  // multiplicative bonuses (Slayer / DHW / wilderness above) so the ADDITIVE
  // weakness bonus (⌊baseMax × severity/100⌋) isn't scaled by them. Mirrors
  // wgloop: ...×DHW → +weakness → ×tome. The tome multiplies the weakness, the
  // dragon-hunter/slayer multipliers do not. All three charged tomes are
  // ×11/10 vs NPCs (the Tome of Water dropped from ×6/5 in Project Rebalance).
  if (scenario.style === "magic") {
    const el = scenario.spellElement;
    const weak = scenario.targetWeakness;
    if (weak && el && weak.element === el) {
      maxHit = maxHit + Math.trunc((baseMax * weak.severity) / 100);
    }
    if (
      (scenario.tomeOfFireEquipped && el === "fire") ||
      (scenario.tomeOfWaterEquipped && el === "water") ||
      (scenario.tomeOfEarthEquipped && el === "earth")
    ) {
      maxHit = Math.trunc((maxHit * 11) / 10);
    }
  }

  // The max of the damage roll itself (wgloop's getMinAndMax). Everything below
  // rescales the rolled hitsplat in upstream's distribution, so the
  // accurate-zero raise sees a roll over 0..rollMax. (Dharok's scale is
  // upstream's too, but this engine folds it into the base max hit above.)
  const rollMax = maxHit;

  if (scenario.style === "magic") {
    // Mark of Darkness demonbane damage — wgloop transforms each hitsplat at
    // the very end of the pipeline; applied here to the max hit (additive),
    // using their exact per-hitsplat formula including the vulnerability:
    //   h + trunc(trunc(h × pct/100) × vulnerability/100)
    // (two truncations — unlike the accuracy path's scaled percent). At the
    // default 100% this reduces to the plain h + trunc(h×pct/100).
    if (scenario.demonbaneSpellDamagePct) {
      const bonus = Math.trunc((maxHit * scenario.demonbaneSpellDamagePct) / 100);
      maxHit = maxHit + Math.trunc((bonus * demonbaneVuln) / 100);
    }
    // Twinflame's second cast on Bolt/Blast/Wave: a hitsplat of trunc(h × 4/10)
    // on top of the FINAL hit h — upstream transforms the finished distribution,
    // after the slayer helm, dragonbane, weakness and tome — so the pair maxes
    // at h + trunc(h × 4/10). Every second hitsplat truncates, so the mean sits
    // ~0.4 below 7/10 of the max; it is rebuilt per hitsplat after the target
    // transforms below. An elemental amulet's +2 sits in the base, so it
    // reaches both casts.
    if (scenario.twinflameDoubleCast) {
      twinflameFirstMax = maxHit;
      maxHit = maxHit + twinflameSecondHit(maxHit);
    }
  }

  // Berserker necklace + TzHaar/obsidian melee weapon: ×6/5 damage, applied last
  // (after the obsidian armour set's ×11/10), matching wgloop's final damage
  // scale. e.g. obsidian set base 36 → trunc(36 × 6/5) = 43.
  if (scenario.berserkerObsidian && scenario.style === "melee") {
    maxHit = Math.trunc((maxHit * 6) / 5);
  }

  // Corporeal Beast halves damage from non-corpbane weapons, one hitsplat at a
  // time (see `perHitsplat` below): the mean branches roll from this
  // pre-halving max. The max hit halves with it — each half of a split weapon
  // on its own, as upstream's getMax() sums them: 42 → 21 + 21 → 10 + 10 = 20,
  // not trunc(42/2) = 21.
  //
  // A damage cap (Zulrah) is upstream's first NPC transform and the Kraken's
  // ranged ÷7 comes next, so each of those hitsplats takes them in turn, after
  // the halving: the Tbow's 66 vs Zulrah reports 50, a blowpipe's 29 vs the
  // Kraken 4. The mean branches below roll from `preCorpMax` too.
  // `attackerMax` is the max between the two — upstream's attacker-side
  // getMax(), which a Mad Angel floor reads before any NPC transform.
  const preCorpMax = maxHit;
  const npcT: NpcHitTransforms = {
    damageCap: scenario.targetDamageCap,
    styleScale: scenario.targetStyleDamageScale,
  };
  const npcTransforms = hasNpcHitTransforms(npcT);
  let attackerMax = maxHit;
  if (scenario.corpDamageHalved || npcTransforms) {
    const halve = (m: number): number => (scenario.corpDamageHalved ? Math.trunc(m / 2) : m);
    const profile = scenario.hitProfile;
    const splats = profile && isSplitProfile(profile) ? hitsplatMaxima(profile, maxHit) : [maxHit];
    attackerMax = splats.reduce((sum, m) => sum + halve(m), 0);
    maxHit = splats.reduce((sum, m) => sum + npcHitMax(halve(m), npcT), 0);
  }

  // Per-monster/per-phase damage scale (TD shield, Sire transition, Hueycoatl
  // pillar, Doom immunity). Applied after every damage multiplier so it scales
  // the final mean, and before the bolt/multi-hit expected-damage calc.
  if (scenario.targetDamageFactor) {
    const [n, d] = scenario.targetDamageFactor;
    maxHit = Math.trunc((maxHit * n) / d);
  }

  // Twinflame: upstream applies the corp halving, the Mad Angel floors, the
  // damage cap / style scale and the phase factor to EACH of the two
  // hitsplats, so the pair's max and mean are rebuilt from the first cast's
  // max rather than taken from the pair total transformed above.
  const twinflame =
    twinflameFirstMax === undefined
      ? undefined
      : twinflameDamage(twinflameFirstMax, {
          halved: scenario.corpDamageHalved,
          minHitFactor: scenario.targetMinHitFactor,
          npcHit: npcT,
          damageFactor: scenario.targetDamageFactor,
          damageMinimum: scenario.targetDamageMinimum,
        });
  if (twinflame) maxHit = twinflame.maxHit;

  // Per-phase attack-roll scale (Royal Titans ranged ×6) — the last accuracy
  // multiplier before rolling, mirroring wgloop's PLAYER_ACCURACY_TITANS_RANGED.
  if (scenario.targetAccuracyFactor) {
    const [n, d] = scenario.targetAccuracyFactor;
    attackRoll = Math.trunc((attackRoll * n) / d);
  }

  const accuracy = scenario.targetAlwaysHit
    ? 1
    : scenario.fangEquipped
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

  // Flat armour shifts every accurate melee/ranged hitsplat, after everything
  // above (wgloop's last NPC transform). A 0 max hit stays 0: upstream returns
  // an all-miss distribution before any NPC transform runs. Every mean branch
  // below takes it; `maxHit` keeps the pre-armour value they roll from.
  const armour =
    scenario.style !== "magic" && maxHit > 0 ? (scenario.targetFlatArmour ?? 0) : 0;

  // What upstream does to a hitsplat after its accurate-zero raise, in order:
  // the Corp halving (the last step of getAttackerDist that touches it), a Mad
  // Angel floor, then the NPC transforms — the damage cap (Zulrah), the style
  // scale (the Kraken's ranged ÷7), the phase damage factor and, last, flat
  // armour (accurate hitsplats only). The cap rerolls a big hit, so `npcHit`
  // is the MEAN of what lands.
  const phaseHit = (h: number): number =>
    scenario.targetDamageFactor
      ? scaleHitsplat(h, scenario.targetDamageFactor, scenario.targetDamageMinimum)
      : h;
  const npcHit = (h: number, accurate = true): number =>
    npcHitMean(h, npcT, (c) => (accurate ? armouredHit(phaseHit(c), armour) : phaseHit(c)));
  const afterRaise = (h: number, minimum = 0): number => {
    const halved = scenario.corpDamageHalved ? Math.trunc(h / 2) : h;
    return npcHit(Math.max(halved, minimum));
  };

  // Corp halves each hitsplat, so halving the max and taking half of that runs
  // high: the mean of trunc(r/2) over 0..M is ⌊M²/4⌋/(M+1), under trunc(M/2)/2
  // for an even M (M = 40: 400/41 ≈ 9.76, not 10), and each half of a split
  // weapon and each bolt bonus truncates on its own (an opal's +9 on a roll of
  // 10 lands trunc(19/2) = 9, not 5 + 9). The NPC transforms likewise work
  // per roll: Zulrah turns each roll over 50 into 47.5 on average, the Kraken
  // takes max(1, trunc(d/7)) of each ranged roll — no closed form on the
  // transformed max (50, or 4 for a blowpipe's 29) gives either. So vs any of
  // them, every mean branch below rolls from the pre-transform max and takes
  // each landed hitsplat through `afterRaise` (`transformedMean`), in place of
  // the closed forms on the transformed max. A Twinflame double cast does its
  // own hitsplats (twinflameDamage).
  const perHitsplat = (scenario.corpDamageHalved === true || npcTransforms) && !twinflame;
  const transformedMean = (lo: number, hi: number, minimum = 0, scale = 1): number =>
    meanTransformedRoll(lo, hi, (r) => afterRaise(scale * r, minimum));

  // Osmumten's fang rolls lo..max−lo (see fangHitTrim) — same mean as 0..max
  // until positive armour clips the low rolls or Corp halves each one. Vs Corp
  // (or a cap) the trim comes off the untransformed max, as upstream's
  // getMinAndMax takes it.
  const fangLo = scenario.fangHitTrim
    ? Math.trunc(((perHitsplat ? preCorpMax : maxHit) * 3) / 20)
    : 0;

  // A Twinflame double cast (magic, so never armoured) brings its own
  // per-hitsplat landed mean.
  let dps = twinflame
    ? (accuracy * twinflame.meanLanded) / (bloodragerSpeed * 0.6)
    : perHitsplat
      ? (accuracy * transformedMean(fangLo, preCorpMax - fangLo)) / (bloodragerSpeed * 0.6)
      : armour === 0
        ? dpsFromHitChance(accuracy, maxHit, bloodragerSpeed)
        : (accuracy * meanArmouredHit(fangLo, maxHit - fangLo, armour)) / (bloodragerSpeed * 0.6);

  // Raised minimum hit (Mad Angel "Sword Cleave" / "Perfect Lightning"
  // reaction buffs). Upstream #948 (d1ae5b4, 2026-08-22, "Correct Mad Angel
  // cleave to roll from 0-max and increase low hits") models it as: the first
  // hit is guaranteed accurate (`firstHitAccurate`), rolls uniformly over
  // 0..max as normal, and is then floored — `firstHitMinimum(minimum)`, i.e.
  // damage = max(roll, minimum), minimum = trunc(max × n/d) (1/2 for Sword
  // Cleave; Perfect Lightning is `firstHitMax`, equivalent to min = max). The
  // landed-hit mean is therefore meanLandedHitWithMinimum(max, min) =
  // [m(m+1) + M(M+1)] / (2(M+1)) — NOT the (min+max)/2 of a roll uniform over
  // [min, max], which this engine used before the 2026-08-30 sync fix and which
  // overstated Sword Cleave by ~19%.
  //
  // Single-hit path only: the bolt and multi-hit branches below overwrite dps
  // with their own means, so the buff is deliberately NOT applied there. That
  // is the conservative mean-model choice, and a close match for upstream,
  // which never applies the buff to the Dual macuahuitl in its general path
  // (`weapon.name !== 'Dual macuahuitl'`); its macuahuitl-specific path floors
  // only the FIRST hitsplat, at trunc(firstMax / 2) of that hitsplat's own max.
  // A Twinflame double cast already folded the buff into its per-hitsplat mean.
  // Per hitsplat (Corp, a cap), the floor comes off the attacker-side max, as
  // upstream's firstHitMinimum reads it before the NPC transforms.
  let madAngelMin: number | undefined;
  if (scenario.targetMinHitFactor && !twinflame) {
    const [n, d] = scenario.targetMinHitFactor;
    madAngelMin = Math.trunc(((perHitsplat ? attackerMax : maxHit) * n) / d);
    const landed = perHitsplat
      ? transformedMean(0, preCorpMax, madAngelMin)
      : meanLandedHitWithMinimum(maxHit, madAngelMin, armour);
    dps = (accuracy * landed) / (bloodragerSpeed * 0.6);
  }

  const boltProc = scenario.style === "ranged" ? scenario.boltProc : undefined;
  const hitProfile = scenario.hitProfile?.length ? scenario.hitProfile : undefined;
  if (boltProc) {
    // Vs Corp the bolt effect rolls from the pre-halving max (a diamond proc
    // over 0..trunc(M × 115/100)) and is halved with the hit; ruby fires after
    // the halving, so its proc lands whole. Every hitsplat, ruby's included,
    // then meets the NPC transforms: Zulrah rerolls a ruby proc of 100 into
    // 45-50, the Kraken takes trunc(51/7) = 7 of its 51.
    const expected = perHitsplat
      ? transformedBoltDamagePerAttack(accuracy, preCorpMax, boltProc, {
          meanRoll: (lo, hi) => transformedMean(lo, hi),
          // A missed opal / pearl bonus is halved, capped and scaled too
          // (the Kraken: max(1, trunc(bonus/7))), but never armoured (an
          // inaccurate hitsplat).
          miss: (damage) =>
            npcHit(scenario.corpDamageHalved ? Math.trunc(damage / 2) : damage, false),
          ruby: (damage) => npcHit(damage),
        })
      : expectedBoltDamagePerAttack(accuracy, maxHit, boltProc, armour);
    dps = expected / (bloodragerSpeed * 0.6);
  } else if (hitProfile) {
    // Multi-hit weapons override the single-hit mean with their hit profile.
    // (Mutually exclusive with bolts — a crossbow is never a multi-hit weapon.)
    // Vs Corp each hitsplat rolls to its share of the pre-halving max and is
    // halved on its own: Torag's 40 → two rolls over 0..20, 2 × 100/21, where
    // halving first said 10 + 10 → 2 × 5. Zulrah caps each one on its own.
    let expected = 0;
    if (perHitsplat) {
      for (const splat of hitsplatRolls(hitProfile, accuracy, preCorpMax)) {
        expected += splat.landChance * transformedMean(0, splat.maxHit);
      }
    } else {
      expected = expectedMultiHitDamage(hitProfile, accuracy, maxHit, armour);
    }
    dps = expected / (bloodragerSpeed * 0.6);
  }

  // A Keris's 1/51 triple-damage proc vs Kalphites lifts mean DPS by
  // (50·1 + 1·3)/51 = ×53/51 — wgloop's dist is 50/51 of the standard hits plus
  // 1/51 of them at ×3 damage, the same mean. The ×133/100 damage is already
  // baked into maxHit via the conditional factors; this is the rare-proc
  // expectation on top, applied to whichever mean (single-hit / bolt /
  // multi-hit) was computed above.
  // Flat armour shifts the TRIPLED hit (max(0, 3d − A), not 3·(d − A)), so an
  // armoured kalphite (Locust rider, −2) rebuilds the single-hit mean from both
  // rolls instead — a Keris is a single-hit melee weapon, so no bolt or
  // multi-hit mean can be in play. Corp likewise halves the tripled hit,
  // trunc(3d/2), and a cap caps it (no Kalphite is the Corp or Zulrah, but the
  // order is upstream's).
  if (scenario.kalphiteTripleProc) {
    if (perHitsplat) {
      dps =
        (accuracy * (50 * transformedMean(0, preCorpMax) + transformedMean(0, preCorpMax, 0, 3))) /
        51 /
        (bloodragerSpeed * 0.6);
    } else {
      dps =
        armour === 0
          ? (dps * 53) / 51
          : (accuracy *
              (50 * meanArmouredHit(0, maxHit, armour) + meanArmouredHit(0, maxHit, armour, 3))) /
            51 /
            (bloodragerSpeed * 0.6);
    }
  }

  // Sanguinesti staff's life leech (1/5 on landed hits) deals 8 bonus damage
  // since the 2026-07-22 Summer Sweep-Up. The bonus is flat — it skips every
  // damage multiplier above — so it's an additive expected-damage term:
  // accuracy × 8/5 per attack. Upstream adds it before the Corp halving, which
  // would halve it with the hit it rides on (magic is corpbane, so it never is),
  // and before the NPC transforms: vs Zulrah a leeching hit of h + 8 over 50
  // is rerolled into 45-50 like any other.
  if (scenario.sanguinestiProc) {
    const bonus = perHitsplat ? transformedMean(8, preCorpMax + 8) - transformedMean(0, preCorpMax) : 8;
    dps += (accuracy * bonus) / 5 / (bloodragerSpeed * 0.6);
  }

  // Accurate-zero raise: wgloop lifts every ACCURATE hitsplat of 0 to 1
  // (seeking arrows floor it at 3 just before). It runs after the bolt effects,
  // Berserker, Mark of Darkness, the Keris triple, the Sanguinesti leech and
  // the Maggot King punish scale, and BEFORE the Twinflame split, the Corp
  // halving, ruby bolts, the Mad Angel buffs, the damage cap and the phase
  // damage factors. So every landed roll over 0..rollMax gains landedFloorLift
  // (1/(rollMax+1) for a plain hit, added after the Keris ×53/51 so the lifted
  // 1 isn't tripled),
  // and `afterRaise` carries the lifted hitsplat through the later transforms:
  // Corp halves the 1 back to 0, the TD shield keeps it, a Mad Angel floor
  // absorbs it, and flat armour — upstream's last transform — shifts it with
  // the rest (worth nothing against +1, an accurate 0 deals 3 against −2). A
  // Twinflame double cast already raised its first cast before the split
  // (twinflameDamage). A max of 0 (Bind) returns before upstream's raise.
  if (rollMax > 0 && !twinflame) {
    const floor = scenario.seekingArrows ? 3 : 1;
    let raised = 0;
    if (boltProc) {
      raised = boltAccurateZeroes(accuracy, rollMax, boltProc) * (afterRaise(1) - afterRaise(0));
    } else if (hitProfile) {
      for (const splat of hitsplatRolls(hitProfile, accuracy, rollMax)) {
        raised += splat.landChance * landedFloorLift(0, splat.maxHit, floor, afterRaise);
      }
    } else {
      // The fang's trimmed roll starts at trunc(M × 3/20); the Sanguinesti's
      // leech turns 1 in 5 landed 0s into 8 before the raise sees them; the
      // Mad Angel floor is single-hit only, like its mean above.
      const rollMin = scenario.fangHitTrim ? Math.trunc((rollMax * 3) / 20) : 0;
      const zeroesLeft = scenario.sanguinestiProc ? 4 / 5 : 1;
      raised =
        accuracy *
        zeroesLeft *
        landedFloorLift(rollMin, rollMax - rollMin, floor, (h) => afterRaise(h, madAngelMin));
    }
    dps += raised / (bloodragerSpeed * 0.6);
  }

  // Immune target: every hit — procs included — deals 0. Last, so no mean
  // branch above can leak damage through (a Ruby bolt proc ignores max hit).
  if (scenario.targetImmune) return { dps: 0, maxHit: 0, accuracy };

  // Reported max hit after flat armour, as upstream's getMax() reads it off the
  // transformed distribution (e.g. 39 vs Earthen nagua's −4 → 43). A weapon
  // that splits one max hit across hitsplats (Dual macuahuitl, Torag's
  // hammers) reports the whole attack, so each half takes the shift (41 → 22 +
  // 23 = 45 vs −2); other multi-hit weapons report their largest hitsplat.
  // (Corp's own per-half halving is already in maxHit; Corp has no armour.)
  // The cap / style scale are in maxHit too; `npcHitTransforms` carries the
  // max before them, so a spec max can be derived and capped the same way.
  const npcHitTransforms = npcTransforms ? { ...npcT, rawMaxHit: attackerMax } : undefined;
  if (armour !== 0) {
    const profile = scenario.hitProfile;
    const reported =
      profile && isSplitProfile(profile)
        ? hitsplatMaxima(profile, maxHit).reduce((sum, m) => sum + armouredHit(m, armour), 0)
        : armouredHit(maxHit, armour);
    return {
      dps,
      maxHit: reported,
      accuracy,
      flatArmour: { armour, rawMaxHit: maxHit },
      ...(npcHitTransforms ? { npcHitTransforms } : {}),
    };
  }
  return { dps, maxHit, accuracy, ...(npcHitTransforms ? { npcHitTransforms } : {}) };
}
