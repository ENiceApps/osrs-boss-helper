// Recommendation engine.
// Given a target (a MonsterCatalogEntry) plus the player's bank + GP + skills,
// filter the universal loadout set library by applicability, score each one
// for ownership/affordability, and rank viable sets by DPS against this
// specific target's stats. One curated set serves every boss that matches
// its predicate — no per-boss preset curation needed.

import type { DpsResult, PrayerSelection, Skills } from "@/types/osrs";
import { defaultPrayerFor } from "@/data/prayers";
import { calculateDps } from "@/lib/dps/calculate";
import { magicCastSpeedTicks } from "@/lib/dps/magic-cast-speed";
import { usesDefenceLevelForMagicDefence } from "@/data/monsters/magic-defence-uses-defence-level";
import { SPELLS_BY_NAME } from "@/data/spells/catalog";
import { resolveBoltProc } from "@/lib/dps/bolts";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { applyCombatBoost, type CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet } from "@/types/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { categoryForMonster } from "@/data/monsters/categories";
import {
  activeBonusesForTarget,
  defenceBonusForAttackType,
  rangedDefenceBonusFor,
} from "@/lib/loadout";

// The offensive prayer the calc defaults to per style — the best one (Piety /
// Rigour / Augury). Sourced from the prayer catalog so the multipliers, the
// drain model, and the picker can never drift apart. Callers that don't pass a
// `prayer` override (the optimizer, tests) get this.
const DEFAULT_PRAYERS: Record<LoadoutSet["style"], PrayerSelection> = {
  melee: defaultPrayerFor("melee").selection,
  ranged: defaultPrayerFor("ranged").selection,
  magic: defaultPrayerFor("magic").selection,
};

/**
 * The default offensive prayer per combat style (name + short effect summary),
 * surfaced in the results rail. Derived from the catalog's default option.
 */
export const ASSUMED_PRAYER: Record<
  LoadoutSet["style"],
  { name: string; effect: string }
> = {
  melee: pick("melee"),
  ranged: pick("ranged"),
  magic: pick("magic"),
};

function pick(style: LoadoutSet["style"]): { name: string; effect: string } {
  const p = defaultPrayerFor(style);
  return { name: p.name, effect: p.effect };
}

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
  if (set.style !== "magic") return target.defenceLevel;
  // For magic, NPC defence rolls off skills.magic — EXCEPT a curated set of
  // bosses (Verzik, Ice demon, Fragment of Seren, Rabbit, …) that use Defence
  // level instead. https://oldschool.runescape.wiki / wgloop.
  return usesDefenceLevelForMagicDefence(target.wikiId)
    ? target.defenceLevel
    : target.magicLevel;
}

/**
 * Pure DPS calculation for a set against a target — no bank / ownership /
 * affordability concerns. Used both by the full evaluator and by the
 * browse-mode previewer on the dynamic boss page.
 */
// Dharok's greataxe + armour piece IDs (all degradation states: 100/75/50/25).
const DHAROK_GREATAXE_IDS = new Set([4718, 4886, 4887, 4888]);
const DHAROK_HELM_IDS = new Set([4716, 4880, 4881, 4882]);
const DHAROK_BODY_IDS = new Set([4720, 4892, 4893, 4894]);
const DHAROK_LEGS_IDS = new Set([4722, 4898, 4899, 4900]);

// Blood moon "Bloodrager" set: Dual macuahuitl + full Blood moon armour. Each
// armour piece has three variants (New / Used / Broken — Broken still counts
// for the set effect, only its stats differ).
const DUAL_MACUAHUITL_ID = 28997;
const BLOOD_MOON_HELM_IDS = new Set([29028, 29047, 29073]);
const BLOOD_MOON_BODY_IDS = new Set([29022, 29043, 29067]);
const BLOOD_MOON_LEGS_IDS = new Set([29025, 29045, 29070]);
// TzHaar/obsidian MELEE weapons — Berserker necklace gives +20% damage with these.
// Toktz-xil-ak (sword), Toktz-xil-ek (dagger), Tzhaar-ket-em (mace), Tzhaar-ket-om (maul).
const TZHAAR_MELEE_WEAPON_IDS = new Set([6523, 6525, 6527, 6528]);

export function computeSetDps(
  set: LoadoutSet,
  target: MonsterCatalogEntry,
  skills: Skills,
  /** Optional combat-boost potion. Applied to the visible level before the engine. */
  boost?: CombatBoost,
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask = false,
  /** Soulreaper axe: assume max 5 stacks (+30% Strength level). */
  soulreaperMaxStacks = false,
  /**
   * Dharok's set: player's current HP. When the full Dharok set is detected
   * and this is below max HP, applies the missing-HP max-hit multiplier.
   * Undefined = no override (full HP, no bonus).
   */
  currentHp?: number,
  /**
   * The offensive prayer to apply. Omit to use the style's best prayer
   * (DEFAULT_PRAYERS) — that's what the optimizer ranks gear against. The boss
   * page passes the player's chosen prayer here so the displayed DPS reflects it.
   */
  prayer?: PrayerSelection,
): DpsResult {
  const activeBonuses = activeBonusesForTarget(set, target);
  // Black mask / slayer helm (i): only on-task, and only when no Salve is active
  // (they don't stack — Salve takes priority vs undead).
  const salveActive =
    activeBonuses.conditionalBonuses.salveAmulet || activeBonuses.conditionalBonuses.salveAmuletEi;
  const slayerOnTask = set.itemBonusFlags.slayerHelmImbued && onTask && !salveActive;
  let effectiveSkills = applyCombatBoost(skills, boost);
  // Soulreaper axe (28338): +6% Strength level per stack × 5 max stacks = +30%.
  // The wiki confirms the boost applies to the visible Strength level (after boost
  // potion), multiplicative, floored — identical to how Piety/Turmoil apply.
  const weaponId = set.slots.weapon?.itemId;
  if (soulreaperMaxStacks && weaponId === 28338) {
    effectiveSkills = { ...effectiveSkills, strength: Math.floor(effectiveSkills.strength * 1.3) };
  }
  // Dharok's full set: max-hit scales with missing HP. Detect all 4 pieces worn
  // in their correct slots; degradation variants all share the same set effect.
  const dharokFullSet =
    set.style === "melee" &&
    weaponId !== undefined && DHAROK_GREATAXE_IDS.has(weaponId) &&
    set.slots.head?.itemId !== undefined && DHAROK_HELM_IDS.has(set.slots.head.itemId) &&
    set.slots.body?.itemId !== undefined && DHAROK_BODY_IDS.has(set.slots.body.itemId) &&
    set.slots.legs?.itemId !== undefined && DHAROK_LEGS_IDS.has(set.slots.legs.itemId);
  const maxHp = skills.hitpoints;
  const dharok =
    dharokFullSet && currentHp !== undefined && currentHp < maxHp
      ? { maxHp, currentHp }
      : undefined;
  // Blood moon "Bloodrager": full Blood moon armour + Dual macuahuitl. Engine
  // applies the accuracy-dependent attack-speed acceleration when this is set.
  const bloodrager =
    set.style === "melee" &&
    weaponId === DUAL_MACUAHUITL_ID &&
    set.slots.head?.itemId !== undefined && BLOOD_MOON_HELM_IDS.has(set.slots.head.itemId) &&
    set.slots.body?.itemId !== undefined && BLOOD_MOON_BODY_IDS.has(set.slots.body.itemId) &&
    set.slots.legs?.itemId !== undefined && BLOOD_MOON_LEGS_IDS.has(set.slots.legs.itemId);
  // Berserker necklace (11128) + a TzHaar/obsidian MELEE weapon → ×6/5 damage.
  // Stacks on top of the Obsidian armour set's ×11/10 (which arrives via
  // set.armorSetBonus). Neck-slot item, so it's not part of the armor set.
  const berserkerObsidian =
    set.style === "melee" &&
    set.slots.neck?.itemId === 11128 &&
    weaponId !== undefined &&
    TZHAAR_MELEE_WEAPON_IDS.has(weaponId);
  // Corporeal Beast halves damage from non-"corpbane" weapons: full damage only
  // from magic, or a STAB-style spear / halberd / Osmumten's fang (Blue moon
  // spear excluded). Mirrors wgloop's isWearingCorpbaneWeapon.
  const weaponName = set.slots.weapon?.itemName ?? "";
  const isCorpbane =
    set.style === "magic" ||
    (set.attackType === "stab" &&
      (set.itemBonusFlags?.fang === true ||
        weaponName.endsWith("halberd") ||
        (weaponName.toLowerCase().includes("spear") && weaponName !== "Blue moon spear")));
  const corpDamageHalved = target.slug === "corporeal-beast" && !isCorpbane;
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
  // Tumeken's shadow (charged 27275 / uncharged 27277) triples worn magic bonuses
  // — quadruples them inside the Tombs of Amascut (magic damage still capped 100%).
  const shadowEquipped = weaponId === 27275 || weaponId === 27277;
  const shadowToaQuadruple = shadowEquipped && categoryForMonster(target.slug) === "toa";
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

  // Virtus armour: the base +2% magic-damage per piece is already in
  // totals.magicDamagePct (vendor magic_str). When casting Ancient Magicks each
  // worn piece grants +3% MORE (2%→5%). Count worn pieces and add the delta.
  const VIRTUS_PIECE_IDS = new Set([26241, 26243, 26245]); // mask, robe top, robe bottom
  const virtusPiecesWorn = [
    set.slots.head?.itemId,
    set.slots.body?.itemId,
    set.slots.legs?.itemId,
  ].filter((id) => id !== undefined && VIRTUS_PIECE_IDS.has(id)).length;
  const virtusAncientBonusPct =
    castSpell?.spellbook === "ancient" ? virtusPiecesWorn * 3 : 0;
  const magicDamagePercent =
    set.style === "magic" && (set.totals.magicDamagePct ?? 0) + virtusAncientBonusPct > 0
      ? (set.totals.magicDamagePct ?? 0) + virtusAncientBonusPct
      : set.totals.magicDamagePct;

  // Magic cast speed: a regular staff/wand autocasting a spellbook spell fires at
  // the SPELL's cast speed (5 ticks; Harmonised standard → 4, Twinflame → 6), not
  // the staff's recorded melee speed. A fast wand (Kodai = 4-tick melee) still
  // casts at 5 — the bug the oracle caught (magic DPS was ×5/4 too high). Powered
  // staves keep their own speed; non-staff magic (salamanders) falls through.
  const isStandardSpell = castSpell
    ? castSpell.spellbook === "standard"
    : set.spellElement !== undefined && set.spellElement !== "none";
  const attackSpeedTicks =
    set.style === "magic" && set.weaponCategory === "Staff"
      ? magicCastSpeedTicks(weaponId!, set.attackSpeedTicks, isStandardSpell)
      : set.attackSpeedTicks;

  return calculateDps({
    style: set.style,
    attackStyle: set.attackStyleChoice,
    prayers: prayer ?? DEFAULT_PRAYERS[set.style],
    skills: effectiveSkills,
    attackBonus: set.totals.attackBonus,
    strengthBonus: set.totals.strengthBonus,
    magicDamagePercent,
    baseSpellMaxHit: set.style === "magic" ? set.baseSpellMaxHit : undefined,
    attackSpeedTicks,
    targetDefenceLevel: targetDefenceLevelFor(set, target),
    targetDefenceBonusForStyle: defenceBonusForSet(set, target),
    conditionalBonuses: activeBonuses.conditionalBonuses,
    spellElement: set.spellElement,
    tomeOfFireEquipped: activeBonuses.tomeOfFireEquipped,
    tomeOfWaterEquipped: activeBonuses.tomeOfWaterEquipped,
    tomeOfEarthEquipped: activeBonuses.tomeOfEarthEquipped,
    shadowEquipped,
    shadowToaQuadruple,
    kalphiteTripleProc: activeBonuses.conditionalBonuses.kerisVsKalphite,
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
    dharok,
    bloodrager,
    berserkerObsidian,
    corpDamageHalved,
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
