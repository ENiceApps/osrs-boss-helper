// Conditional-bonus + defence-bucket helpers for scoring a loadout against a
// target. (The old universal-set applicability predicates were removed with
// the curated loadout architecture.)

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import {
  guardianPickaxeFactor,
  isFlyingImmuneToMelee,
  isGuardianImmune,
  npcMeleeImmunity,
} from "@/data/monsters/melee-reach";
import type { LoadoutSet } from "@/types/loadout";
import type { ConditionalBonusFlags } from "@/types/osrs";
import {
  amuletBoostsElement,
  ELEMENTAL_AMULET_MAX_HIT_BONUS,
} from "@/data/bonus-trigger-items";
import { ammoApplicability } from "@/data/items/ammo-applicability";
import {
  BROAD_AMMO_IDS,
  LEAF_BLADED_BATTLEAXE_ID,
  LEAF_BLADED_MELEE_WEAPON_IDS,
  LEAFY_SPELL_NAME,
} from "@/data/items/leaf-bladed";

export interface TargetActiveBonuses {
  conditionalBonuses: ConditionalBonusFlags;
  tomeOfFireEquipped: boolean;
  tomeOfWaterEquipped: boolean;
  tomeOfEarthEquipped: boolean;
  /**
   * Flat max-hit bonus an elemental amulet adds to the cast spell's base hit:
   * 2 when the worn Amulet of air/water/earth/fire matches `set.spellElement`
   * (or the Elemental amulet is worn with any elemental spell), else 0. Powered
   * staves and non-elemental spells have no element, so are always 0.
   */
  elementalAmuletMaxHitBonus: number;
  /** True iff this loadout's weapon is Twisted bow. */
  twistedBowEquipped: boolean;
  /** True iff Osmumten's fang is the weapon AND it's swung on a stab style. */
  fangEquipped: boolean;
  /** Confliction gauntlets + a one-handed weapon on a magic style (double roll after a miss). */
  conflictionGauntlets: boolean;
  /** Target's Magic level — a Tbow scaling input. */
  targetMonsterMagicLevel: number;
  /**
   * Target's magic attack bonus (0 when the catalog omits it). The Tbow scales
   * off the higher of this and the Magic level (lib/dps/twisted-bow.ts).
   */
  targetMagicAttackBonus: number;
  /** Whether target is in Chambers of Xeric (350 cap vs 250). */
  targetIsXerician: boolean;
  /**
   * The target is LEAFY (Turoth/Kurask) and this loadout has no leaf-bladed
   * damage source — it deals no damage at all (see `canDamageLeafy`).
   */
  leafyImmune: boolean;
  /**
   * A MELEE loadout against a flying target its weapon can't reach (anything
   * but a halberd / salamander; Vespula always) — it deals no damage at all
   * (see `isFlyingImmuneToMelee`).
   */
  flyingMeleeImmune: boolean;
  /**
   * A MELEE loadout against a monster upstream lists as immune to melee — it
   * deals no damage at all (see `npcMeleeImmunity`): "all" when no melee
   * weapon can (the Kraken, TzKal-Zuk, Jal-MejJak, the Leviathan, the Abyssal
   * portal), "halberd" at Zulrah when the weapon isn't a halberd. null
   * otherwise (and for every ranged / magic loadout).
   */
  npcMeleeImmune: "all" | "halberd" | null;
  /**
   * The target is a CoX Guardian and this loadout isn't a pickaxe swung in
   * melee — it deals no damage at all (see `isGuardianImmune`).
   */
  guardianImmune: boolean;
  /**
   * A pickaxe melee swing at a CoX Guardian: every hitsplat scales by
   * [50 + Mining + pick bonus, 150] at Mining 99 (see `guardianPickaxeFactor`).
   * Undefined otherwise.
   */
  guardianPickaxeFactor?: [number, number];
  /**
   * A salamander without its own tar in the ammo slot — every style (Scorch,
   * Flare, Blaze) deals 0, like upstream's isAmmoInvalid zeroing the attack
   * roll and max hit (see `salamanderMissingTar`). Target-independent.
   */
  salamanderMissingTar: boolean;
  /**
   * The weapon needs ammo and has none it can fire: the attack does nothing
   * at all, accuracy included (see `ammoInvalid`). Target-independent.
   */
  ammoInvalid: boolean;
}

/**
 * True iff the loadout can damage a LEAFY monster: a leaf-bladed melee weapon
 * on a melee style, broad ammo actually fired by the ranged weapon, or the
 * Magic Dart spell. Mirrors wgloop's isWearingLeafBladedWeapon, with one
 * deliberate tightening: upstream accepts broad ammo in the ammo slot with ANY
 * ranged weapon, but a weapon that doesn't fire it (blowpipe, crystal bow, Bow
 * of Faerdhinen, a crossbow under broad arrows) can't land a broad projectile,
 * so the ammo must pass the weapon's ammo check here.
 */
export function canDamageLeafy(set: LoadoutSet): boolean {
  switch (set.style) {
    case "melee":
      return LEAF_BLADED_MELEE_WEAPON_IDS.has(set.slots.weapon?.itemId ?? -1);
    case "magic":
      return set.autoSpellName === LEAFY_SPELL_NAME;
    case "ranged":
      return BROAD_AMMO_IDS.has(set.slots.ammo?.itemId ?? -1) && firesAmmo(set);
  }
}

/**
 * Whether the set's bow or crossbow actually fires the ammo in its ammo slot —
 * wgloop's ammoApplicability === INCLUDED. A weapon without ammo (blowpipe,
 * crystal bow, Bow of Faerdhinen) or of the wrong class fires none of it.
 */
export function firesAmmo(set: LoadoutSet): boolean {
  const { weapon, ammo } = set.slots;
  if (!weapon || !ammo) return false;
  return ammoApplicability(weapon.itemId, ammo.itemId) === "included";
}

/**
 * True iff the weapon needs ammo and the ammo slot holds none it can fire (an
 * empty slot, a blessing, the wrong class or tier): upstream's isAmmoInvalid,
 * which zeroes the attack roll and the max hit on every style. A Twisted bow
 * with no arrows deals nothing, and neither does a salamander without its tar.
 */
export function ammoInvalid(set: LoadoutSet): boolean {
  const { weapon, ammo } = set.slots;
  if (!weapon) return false;
  return ammoApplicability(weapon.itemId, ammo?.itemId) === "invalid";
}

/**
 * True iff the set's weapon is a salamander and its ammo slot does NOT hold
 * that salamander's own tar (Swamp lizard ↔ Guam tar, …, Tecu ↔ Irit). Upstream
 * (wgloop ammoApplicability === INVALID) then zeroes every style, melee and
 * magic included, since the salamander burns the tar for all three.
 */
export function salamanderMissingTar(set: LoadoutSet): boolean {
  return set.weaponCategory === "Salamander" && ammoInvalid(set);
}

/** The combat style a Wilderness weapon's bonus works on, by its name. */
function wildernessWeaponStyle(weaponName: string): "melee" | "ranged" | "magic" | undefined {
  const name = weaponName.toLowerCase();
  if (name.includes("chainmace")) return "melee";
  if (name.includes("craw's bow") || name.includes("webweaver bow")) return "ranged";
  if (name.includes("sceptre")) return "magic";
  return undefined;
}

/**
 * Resolve which of the set's item-implied bonuses actually fire against this
 * target. DHCB only matters if the target is dragon-classified; Salve(ei)
 * only matters vs undead; Tome of Fire only matters when the cast spell is
 * fire-element AND the target is fire-weak.
 */
export function activeBonusesForTarget(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
): TargetActiveBonuses {
  const isDragon = target.attributes.includes("dragon");
  const isUndead = target.attributes.includes("undead");
  const isDemon = target.attributes.includes("demon");
  const isKalphite = target.attributes.includes("kalphite");
  const isGolem = target.attributes.includes("golem");
  const isLeafy = target.attributes.includes("leafy");
  // Dragon hunter wand vs a dragon. It stacks with a Salve on an undead dragon
  // (Vorkath): upstream applies the Salve percent and the wand's factor
  // independently, in melee and magic alike.
  const wandActive = set.itemBonusFlags.dragonHunterWand && isDragon;
  // The regular and (e) Salve amulets boost melee only; ranged and magic need
  // the imbued (i)/(ei) (wgloop gates Salve per style the same way). A
  // non-firing Salve also leaves the black mask free to apply on task.
  const salveFits = set.style === "melee" || set.itemBonusFlags.salveImbued === true;
  const isXerician = target.attributes.includes("xerician");
  const castsFire = set.spellElement === "fire";
  const castsWater = set.spellElement === "water";
  const castsEarth = set.spellElement === "earth";
  return {
    conditionalBonuses: {
      dragonHunterCrossbow: set.itemBonusFlags.dragonHunterCrossbow && isDragon,
      dragonHunterLance: set.itemBonusFlags.dragonHunterLance && isDragon,
      dragonHunterWand: wandActive,
      salveAmuletEi: set.itemBonusFlags.salveAmuletEi && isUndead && salveFits,
      salveAmulet: set.itemBonusFlags.salveAmulet && isUndead && salveFits,
      demonbane: set.itemBonusFlags.demonbane && isDemon,
      demonbaneSilverlight: (set.itemBonusFlags.demonbaneSilverlight ?? false) && isDemon,
      demonbaneClaws: (set.itemBonusFlags.demonbaneClaws ?? false) && isDemon,
      demonbaneScorchingBow: (set.itemBonusFlags.demonbaneScorchingBow ?? false) && isDemon,
      kerisVsKalphite: (set.itemBonusFlags.kerisPartisan ?? false) && isKalphite,
      kerisAmascutVsKalphite: (set.itemBonusFlags.kerisAmascut ?? false) && isKalphite,
      kerisBreachVsKalphite: (set.itemBonusFlags.kerisBreaching ?? false) && isKalphite,
      golembaneBarronite: (set.itemBonusFlags.golembaneBarronite ?? false) && isGolem,
      golembaneGraniteHammer: (set.itemBonusFlags.golembaneGraniteHammer ?? false) && isGolem,
      // Keyed off the weapon slot (like the corpbane check in recommend.ts)
      // rather than an item flag, so every loadout source — optimizer, gear
      // editor — gets it without a flag to keep in sync.
      leafBladedBattleaxe:
        isLeafy &&
        set.style === "melee" &&
        set.slots.weapon?.itemId === LEAF_BLADED_BATTLEAXE_ID,
      // Wilderness weapons only get their ×3/2 vs NPCs fought in the Wilderness.
      // Each on its own style only (upstream isRevWeaponBuffApplicable): the
      // chainmaces in melee, the bows at range, the sceptres on magic. A
      // sceptre swung as a mace gets nothing.
      wildernessWeapon:
        (set.itemBonusFlags.wildernessWeapon ?? false) &&
        isWildernessBoss(target.slug) &&
        wildernessWeaponStyle(set.slots.weapon?.itemName ?? "") === set.style,
    },
    // Tomes boost their element's spells vs all NPCs — not just element-weak
    // targets. (Element weakness is a separate accuracy+damage bonus modelled
    // in calculate.ts; the tome multiplier stacks on top of it.)
    tomeOfFireEquipped: set.itemBonusFlags.tomeOfFire && castsFire,
    tomeOfWaterEquipped: set.itemBonusFlags.tomeOfWater && castsWater,
    tomeOfEarthEquipped: set.itemBonusFlags.tomeOfEarth && castsEarth,
    // Elemental amulet: +2 on spells of the matching element, vs all NPCs.
    elementalAmuletMaxHitBonus:
      set.style === "magic" &&
      amuletBoostsElement(set.itemBonusFlags.elementalAmulet, set.spellElement)
        ? ELEMENTAL_AMULET_MAX_HIT_BONUS
        : 0,
    twistedBowEquipped: set.itemBonusFlags.twistedBow,
    // Fang's double accuracy roll only fires on stab styles (Stab/Lunge/Block);
    // its slash style is a vanilla swing. Target-independent — works on any NPC.
    fangEquipped: set.itemBonusFlags.fang && set.attackType === "stab",
    conflictionGauntlets: (set.itemBonusFlags.conflictionGauntlets ?? false) && set.style === "magic",
    // Tbow inputs: upstream scales off min(cap, max(skills.magic,
    // offensive.magic)); the engine takes the max and applies the cap.
    targetMonsterMagicLevel: target.magicLevel,
    targetMagicAttackBonus: target.magicAttackBonus ?? 0,
    targetIsXerician: isXerician,
    leafyImmune: isLeafy && !canDamageLeafy(set),
    flyingMeleeImmune: set.style === "melee" && isFlyingImmuneToMelee(target, set.weaponCategory),
    npcMeleeImmune: set.style === "melee" ? npcMeleeImmunity(target, set.weaponCategory) : null,
    guardianImmune: isGuardianImmune(target, set.style, set.weaponCategory),
    guardianPickaxeFactor: guardianPickaxeFactor(
      target,
      set.style,
      set.weaponCategory,
      set.slots.weapon?.itemName,
    ),
    salamanderMissingTar: salamanderMissingTar(set),
    ammoInvalid: ammoInvalid(set),
  };
}

/** Pick the wiki ranged-defence bucket that corresponds to a weapon attack profile. */
export function rangedDefenceBonusFor(
  target: MonsterCatalogEntry,
  /** Use weapon category if known; defaults to "standard" (bow) bucket. */
  weaponCategory?: string,
): number {
  switch (weaponCategory) {
    case "Crossbow":
      return target.defenceBonuses.rangedHeavy;
    case "Chinchompas": // upstream getRangedDamageType: heavy
      return target.defenceBonuses.rangedHeavy;
    case "Thrown": // includes blowpipe, darts, knives
      return target.defenceBonuses.rangedLight;
    case "Salamander": {
      // Flare rolls against the "mixed" bucket: the truncated mean of all three
      // (upstream getRangedDamageType 'mixed').
      const d = target.defenceBonuses;
      return Math.trunc((d.rangedLight + d.rangedStandard + d.rangedHeavy) / 3);
    }
    default: // Bow, etc.
      return target.defenceBonuses.rangedStandard;
  }
}

/** Get the right defence bonus from the target for a given attack type. */
export function defenceBonusForAttackType(
  target: MonsterCatalogEntry,
  attackType: "stab" | "slash" | "crush" | "magic" | "ranged",
): number {
  switch (attackType) {
    case "stab":
      return target.defenceBonuses.stab;
    case "slash":
      return target.defenceBonuses.slash;
    case "crush":
      return target.defenceBonuses.crush;
    case "magic":
      return target.defenceBonuses.magic;
    case "ranged":
      // Default to heavy (crossbow) — for non-crossbow weapons recommend.ts
      // looks up the weapon category and calls rangedDefenceBonusFor instead.
      return target.defenceBonuses.rangedHeavy;
  }
}
