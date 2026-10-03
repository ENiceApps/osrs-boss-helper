// Conditional-bonus + defence-bucket helpers for scoring a loadout against a
// target. (The old universal-set applicability predicates were removed with
// the curated loadout architecture.)

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { isFlyingImmuneToMelee } from "@/data/monsters/melee-reach";
import type { LoadoutSet } from "@/types/loadout";
import type { ConditionalBonusFlags } from "@/types/osrs";
import {
  amuletBoostsElement,
  ELEMENTAL_AMULET_MAX_HIT_BONUS,
} from "@/data/bonus-trigger-items";
import { checkAmmoCompatWithCategory } from "@/data/ammo-compatibility";
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
  /** Target's effective magic level for Tbow scaling. */
  targetMonsterMagicLevel: number;
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
    case "ranged": {
      const { weapon, ammo } = set.slots;
      if (!weapon || !ammo || !BROAD_AMMO_IDS.has(ammo.itemId)) return false;
      const category = set.weaponCategory ?? "";
      if (category !== "Bow" && category !== "Crossbow") return false;
      return checkAmmoCompatWithCategory(weapon.itemName, category, ammo.itemName).ok;
    }
  }
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
  // Dragon hunter wand's dragonbane is active vs dragons AND does NOT stack with
  // Salve (unlike DHCB/DHL, which do). On an undead dragon (e.g. Vorkath) the
  // wand wins (+75/+40 ≫ Salve's +20/+20), so suppress Salve when it's active.
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
      salveAmuletEi: set.itemBonusFlags.salveAmuletEi && isUndead && !wandActive && salveFits,
      salveAmulet: set.itemBonusFlags.salveAmulet && isUndead && !wandActive && salveFits,
      demonbane: set.itemBonusFlags.demonbane && isDemon,
      demonbaneSilverlight: (set.itemBonusFlags.demonbaneSilverlight ?? false) && isDemon,
      demonbaneClaws: (set.itemBonusFlags.demonbaneClaws ?? false) && isDemon,
      demonbaneScorchingBow: (set.itemBonusFlags.demonbaneScorchingBow ?? false) && isDemon,
      kerisVsKalphite: (set.itemBonusFlags.kerisPartisan ?? false) && isKalphite,
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
      wildernessWeapon:
        (set.itemBonusFlags.wildernessWeapon ?? false) && isWildernessBoss(target.slug),
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
    // Per wgloop's source: M = max(skills.magic, offensive.magic). Catalog
    // only exposes skills.magic for now; offensive.magic isn't surfaced.
    // For most monsters these match; we'll plumb offensive.magic if we hit
    // a target where the difference matters.
    targetMonsterMagicLevel: target.magicLevel,
    targetIsXerician: isXerician,
    leafyImmune: isLeafy && !canDamageLeafy(set),
    flyingMeleeImmune: set.style === "melee" && isFlyingImmuneToMelee(target, set.weaponCategory),
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
    case "Thrown": // includes blowpipe, darts, knives
      return target.defenceBonuses.rangedLight;
    default: // Bow, Chinchompas, etc.
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
