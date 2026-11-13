// Recommendation engine.
// Given a target (a MonsterCatalogEntry) plus the player's bank + GP + skills,
// filter the universal loadout set library by applicability, score each one
// for ownership/affordability, and rank viable sets by DPS against this
// specific target's stats. One curated set serves every boss that matches
// its predicate — no per-boss preset curation needed.

import { SPELLCASTING_STAFF_CATEGORIES } from "@/data/weapon-styles";
import type { DpsResult, PrayerSelection, Skills } from "@/types/osrs";
import { defaultPrayerFor } from "@/data/prayers";
import { calculateDps, forceDistributionEngine, type DpsScenario } from "@/lib/dps/calculate";
import { OBLIGATOR_SMASH_TICKS, obligatorThrust } from "@/data/items/obligator";
import { magicCastSpeedTicks } from "@/lib/dps/magic-cast-speed";
import { usesDefenceLevelForMagicDefence } from "@/data/monsters/magic-defence-uses-defence-level";
import { BIND_SPELL_NAMES, SPELLS_BY_NAME, weaponCanCastSpell } from "@/data/spells/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { canonicalItemId } from "@/data/items/aliases";
import { canonicalItemById, canonicalNameOf } from "@/lib/gear-totals";
import {
  npcHitRules,
  P2_WARDEN_IDS,
  SCURRIUS_GIANT_RAT_ID,
  TOMBS_OF_AMASCUT_IDS,
  vampyreBonuses,
  wearingRatBoneWeapon,
  type AttackContext,
} from "@/data/monsters/hit-rules";
import { scaleDemonbanePct } from "@/data/monsters/demonbane-vulnerability";
import { ECLIPSE_ATLATL_ID, HUNTERS_SPEAR_ID } from "@/data/items/special-strength";
import { wikiDefaultHp } from "@/data/monsters/raid-hp";
import { SLAYER_HEAD_IDS } from "@/data/items/slayer-helm";
import { BONUS_TRIGGER_ITEM_IDS } from "@/data/bonus-trigger-items";
import { resolveBoltProc } from "@/lib/dps/bolts";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { applyCombatBoost, type CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet } from "@/types/loadout";
import { defaultDamageModifier } from "@/data/bosses/mechanic-phases";
import type { PhasedMonster } from "@/lib/phases";
import { categoryForMonster } from "@/data/monsters/categories";
import { demonbaneVulnerabilityFor } from "@/data/monsters/demonbane-vulnerability";
import { damageCapFor } from "@/data/monsters/damage-cap";
import { styleDamageScaleFor } from "@/data/monsters/style-damage-scale";
import {
  activeBonusesForTarget,
  defenceBonusForAttackType,
  firesAmmo,
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
function defenceBonusForSet(set: LoadoutSet, target: PhasedMonster): number {
  if (set.attackType === "ranged") {
    // Dispatch by weapon category: Crossbow → heavy, Bow → standard,
    // Thrown/Blowpipe → light. Falls back to "standard" if the field is
    // missing (legacy sets built before weaponCategory was added).
    return rangedDefenceBonusFor(target, set.weaponCategory);
  }
  return defenceBonusForAttackType(target, set.attackType);
}

function targetDefenceLevelFor(set: LoadoutSet, target: PhasedMonster): number {
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
// Soulreaper axe + its (o) ornament kit variant — identical stats and stack
// mechanic; the 2026-07-22 Summer Sweep-Up covers both ("Soulreaper Axe and
// Soulreaper Axe (o)"). Exported so UI gates (the max-stacks toggle) share one
// list instead of re-hardcoding 28338.
export const SOULREAPER_AXE_IDS: ReadonlySet<number> = new Set([28338, 33335]);
// Blue Moon spear (item id 28988). Corpbane exclusion keys off the ID, not the
// name: the 2026-09-16 Summer Sweep-Up pet-improvements update renamed it in
// game from "Blue moon spear" to "Blue Moon spear" and a vendor refresh will
// eventually carry the new casing — a case-sensitive name compare would then
// silently flip it to a corpbane spear (full damage vs Corporeal Beast).
const BLUE_MOON_SPEAR_ID = 28988;
// Sanguinesti staff variants (regular + Holy, charged + uncharged) — the same
// ids as their entries in data/items/powered-staff-spells.ts.
const SANGUINESTI_STAFF_IDS = new Set([22323, 22481, 25731, 25733]);

export function computeSetDps(
  set: LoadoutSet,
  target: PhasedMonster,
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
  /** Ruby bolt special assumed to fire (default ON). OFF = ruby bolts valued on raw stats only. */
  rubyProcEnabled = true,
  /**
   * Mark of Darkness active (default OFF, the wiki calc's default). Only
   * matters when casting a demonbane spell vs a demon: accuracy 20%→40% and
   * a +25% damage bonus appears (both doubled by the Purging staff).
   */
  markOfDarkness = false,
): DpsResult {
  const activeBonuses = activeBonusesForTarget(set, target);
  // Every worn item is read as its canonical item (a locked / ornamented /
  // recoloured / degraded variant behaves as the base item, as upstream's
  // getCanonicalEquipment has it). -1 = an empty slot.
  const slotId = (slot: keyof LoadoutSet["slots"]): number => {
    const id = set.slots[slot]?.itemId;
    return id === undefined ? -1 : canonicalItemId(id);
  };
  const wornNames = new Set<string>();
  for (const worn of Object.values(set.slots)) {
    if (worn) wornNames.add(canonicalNameOf(worn.itemId, worn.itemName).toLowerCase());
  }
  const wears = (...names: string[]): boolean => names.every((n) => wornNames.has(n.toLowerCase()));
  // Amulet of avarice vs a Revenant: takes the Salve / black mask slot.
  const avarice = wears("Amulet of avarice") && (target.name ?? "").startsWith("Revenant");
  // Black mask / slayer helm (i): only on-task, and only when no Salve is active
  // (they don't stack — Salve takes priority vs undead).
  const salveActive =
    activeBonuses.conditionalBonuses.salveAmulet || activeBonuses.conditionalBonuses.salveAmuletEi;
  // The imbued head works on every style; a plain black mask / slayer helmet
  // only in melee (and on the Strength-scaled thrown weapons). Slayer monsters
  // only, as upstream's isSlayerMonster gates it.
  const plainSlayerHead = SLAYER_HEAD_IDS.has(slotId("head"));
  const slayerHeadApplies =
    set.itemBonusFlags.slayerHelmImbued || (plainSlayerHead && set.style === "melee");
  const slayerOnTask =
    slayerHeadApplies && onTask && target.isSlayerMonster !== false && !salveActive && !avarice;
  let effectiveSkills = applyCombatBoost(skills, boost);
  // Soulreaper axe (28338, and the (o) variant 33335): +6% Strength level per
  // stack × 5 max stacks = +30%. The wiki confirms the boost applies to the
  // visible Strength level (after boost potion), multiplicative, floored —
  // identical to how Piety/Turmoil apply.
  const weaponId = slotId("weapon");
  // Soulreaper axe at 5 stacks: + trunc(Strength x 30/100) on the EFFECTIVE
  // level, after the prayer (upstream: "does not stack multiplicatively with
  // prayers"), off the potion-boosted visible level.
  const strengthLevelBonus =
    soulreaperMaxStacks && SOULREAPER_AXE_IDS.has(weaponId) && set.style === "melee"
      ? Math.trunc((effectiveSkills.strength * 30) / 100)
      : undefined;
  effectiveSkills = { ...effectiveSkills };
  // Dharok's full set: max-hit scales with missing HP. Detect all 4 pieces worn
  // in their correct slots; degradation variants all share the same set effect.
  const dharokFullSet =
    set.style === "melee" &&
    weaponId !== undefined && DHAROK_GREATAXE_IDS.has(weaponId) &&
    slotId("head") !== undefined && DHAROK_HELM_IDS.has(slotId("head")) &&
    slotId("body") !== undefined && DHAROK_BODY_IDS.has(slotId("body")) &&
    slotId("legs") !== undefined && DHAROK_LEGS_IDS.has(slotId("legs"));
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
    slotId("head") !== undefined && BLOOD_MOON_HELM_IDS.has(slotId("head")) &&
    slotId("body") !== undefined && BLOOD_MOON_BODY_IDS.has(slotId("body")) &&
    slotId("legs") !== undefined && BLOOD_MOON_LEGS_IDS.has(slotId("legs"));
  // Berserker necklace (11128) + a TzHaar/obsidian MELEE weapon → ×6/5 damage.
  // Stacks on top of the Obsidian armour set's ×11/10 (which arrives via
  // set.armorSetBonus). Neck-slot item, so it's not part of the armor set.
  const berserkerObsidian =
    set.style === "melee" &&
    slotId("neck") === 11128 &&
    weaponId !== undefined &&
    TZHAAR_MELEE_WEAPON_IDS.has(weaponId);
  // Corporeal Beast halves damage from non-"corpbane" weapons: full damage only
  // from magic, or a STAB-style spear / halberd / Osmumten's fang (Blue Moon
  // spear excluded). Mirrors wgloop's isWearingCorpbaneWeapon. The Blue Moon
  // spear is excluded by item id (28988) — see BLUE_MOON_SPEAR_ID — with a
  // case-insensitive name fallback for callers/sets that carry no item id.
  const weaponName = set.slots.weapon
    ? canonicalNameOf(set.slots.weapon.itemId, set.slots.weapon.itemName)
    : "";
  const isBlueMoonSpear =
    weaponId === BLUE_MOON_SPEAR_ID || weaponName.toLowerCase() === "blue moon spear";
  const isCorpbane =
    set.style === "magic" ||
    (set.attackType === "stab" &&
      (set.itemBonusFlags?.fang === true ||
        weaponName.toLowerCase().includes("halberd") ||
        (weaponName.toLowerCase().includes("spear") && !isBlueMoonSpear)));
  const corpDamageHalved = target.slug === "corporeal-beast" && !isCorpbane;
  // Per-monster/per-phase damage scale (Tormented Demon's shield ×4/5, Abyssal
  // Sire transition ×1/2, Hueycoatl pillar ×13/10, Doom immunity ×0). The
  // active phase supplies it on the target (null = a chosen phase with no
  // modifier); a raw catalog entry falls back to the boss's DEFAULT mechanic
  // phase, so non-UI callers match the wiki calc's defaults. Pierce rules
  // mirror wgloop's isUsingDemonbane / isUsingAbyssal: demonbane is the
  // Silverlight line + Bone/Burning claws (melee), Scorching bow (ranged), or
  // a Demonbane spell (magic); abyssal is the whip/tentacle/dagger/bludgeon.
  const modifier =
    target.damageModifier !== undefined
      ? target.damageModifier
      : defaultDamageModifier(target.slug);
  let targetDamageFactor: [number, number] | undefined;
  let targetDamageMinimum: number | undefined;
  if (modifier && (!modifier.styles || modifier.styles.includes(set.style))) {
    const demonbanePierce =
      modifier.piercedByDemonbane === true &&
      (set.style === "magic"
        ? (set.autoSpellName ?? "").includes("Demonbane")
        : set.style === "ranged"
          ? weaponName === "Scorching bow"
          : ["Silverlight", "Darklight", "Arclight", "Emberlight", "Bone claws", "Burning claws"]
              .includes(weaponName));
    const abyssalPierce =
      modifier.piercedByAbyssal === true &&
      set.style === "melee" &&
      weaponName.toLowerCase().includes("abyssal");
    if (!demonbanePierce && !abyssalPierce) {
      targetDamageFactor = modifier.factor;
      targetDamageMinimum = modifier.minimum;
    }
  }
  // Per-phase accuracy scale + can't-miss states (Royal Titans, Doom). These
  // only exist on phased targets — no slug fallback needed because no boss's
  // DEFAULT phase carries them.
  const acc = target.accuracyModifier;
  const targetAccuracyFactor =
    acc && (!acc.styles || acc.styles.includes(set.style)) ? acc.factor : undefined;
  const targetAlwaysHit = target.alwaysHits === true;
  // The unshielded Tormented Demon's speed-scaled bonus, for crush melee, a
  // cast spell (not a powered staff's or salamander's own attack) or heavy
  // ranged: crossbows, ballistas included, and chinchompas — wgloop
  // tdUnshieldedBonusApplies / getRangedDamageType 'heavy'.
  const speedScaledHitBonus =
    target.speedScaledHitBonus === true &&
    (set.style === "melee"
      ? set.attackType === "crush"
      : set.style === "ranged"
        ? set.weaponCategory === "Crossbow" || set.weaponCategory === "Chinchompas"
        : SPELLCASTING_STAFF_CATEGORIES.has(set.weaponCategory ?? "") || set.autoSpellName !== undefined);
  const targetMinHitFactor = target.minHitFactor;
  // The Maggot King's melee punish window: ×3/2 on the first melee hitsplat,
  // and crush attacks roll against trunc(def × 15/100).
  const punish = set.style === "melee" ? target.meleePunish : undefined;
  // Crush only, damage and defence alike (upstream isMaggotKingMeleePunish).
  const firstHitDamageFactor = punish && set.attackType === "crush" ? punish.damageFactor : undefined;
  const firstHitDefenceRollFactor =
    punish && set.attackType === "crush" ? punish.crushDefenceFactor : undefined;
  // Enchanted-bolt proc (crossbows only). Resolved here because the boosted
  // visible ranged level and the target's immunities are both in scope.
  const boltProc = set.style === "ranged"
    ? resolveBoltProc({
        ammoItemId: slotId("ammo"),
        weaponItemId: slotId("weapon"),
        weaponCategory: set.weaponCategory,
        visibleRangedLevel: effectiveSkills.ranged,
        // Hitpoints at the wiki calc's default raid scale (ruby procs read them).
        target: { hp: wikiDefaultHp(target), attributes: target.attributes, slug: target.slug },
        rubyProcEnabled,
      })
    : undefined;
  // Seeking arrows fired by the bow: wgloop floors every landed hitsplat at 3.
  const seekingArrows =
    set.style === "ranged" && (set.slots.ammo?.itemName ?? "").includes("Seeking") && firesAmmo(set);
  // Multi-hit weapons (Scythe size-gated, Dual macuahuitl, Dark bow,
  // Tonalztics, the two-hit Torag's / Sulphur / Temotli / Tecpatl).
  const hitProfile = hitProfileForWeapon(slotId("weapon"), {
    targetSize: target.size,
  });
  // Sanguinesti staff (incl. Holy, charged + uncharged catalog variants): the
  // 1/5 life-leech proc deals 8 bonus damage since the 2026-07-22 Summer
  // Sweep-Up. Engine adds the expected-value term when this is set.
  const sanguinestiProc =
    set.style === "magic" &&
    weaponId !== undefined &&
    SANGUINESTI_STAFF_IDS.has(weaponId);
  // Tumeken's shadow (charged 27275 / uncharged 27277) triples worn magic bonuses
  // — quadruples them inside the Tombs of Amascut (magic damage still capped 100%).
  const shadowEquipped = weaponId === 27275 || weaponId === 27277;
  const shadowToaQuadruple = shadowEquipped && categoryForMonster(target.slug) === "toa";
  // Keris partisan of amascut: the catalog carries its in-raid stats; outside
  // the Tombs of Amascut it loses 50 stab attack and 22 strength (wgloop
  // calculateEquipmentBonusesFromGear).
  const kerisAmascutWeakened =
    set.style === "melee" &&
    set.itemBonusFlags.kerisAmascut === true &&
    categoryForMonster(target.slug) !== "toa";
  const castSpell = set.style === "magic" && set.autoSpellName
    ? SPELLS_BY_NAME.get(set.autoSpellName)
    : undefined;
  // Smoke battlestaff (11998), Mystic smoke staff (12000) and Twinflame staff
  // (30634) — wgloop's isWearingSmokeStaff — add +10% accuracy & damage to
  // standard-spellbook spells. The cast spell's book decides; with no named
  // spell, an elemental element implies a standard one (no other book has
  // them). The Twinflame also casts a second hit (~40%) on Bolt/Blast/Wave.
  // A spell the weapon can't cast is no spell at all (no smoke-staff bonus).
  const spellUsable = !castSpell || weaponCanCastSpell(castSpell.name, weaponName);
  const castsStandardSpell = castSpell
    ? castSpell.spellbook === "standard" && spellUsable
    : set.spellElement !== undefined && set.spellElement !== "none";
  const smokeStaffStandard =
    set.style === "magic" &&
    (weaponId === 11998 || weaponId === 12000 || weaponId === 30634) &&
    castsStandardSpell;
  const twinflameDoubleCast =
    smokeStaffStandard && weaponId === 30634 && /(Bolt|Blast|Wave)$/.test(set.autoSpellName ?? "");
  // Demonbane spells (Arceuus) — fire only when the cast spell is a demonbane
  // spell AND the target carries the "demon" attribute. Mirrors wgloop:
  //   accuracy: +20% base, +40% with Mark of Darkness, ×2 with Purging staff
  //   damage:   only with Mark of Darkness — +25%, or +50% with Purging staff
  const demonbaneSpellActive =
    castSpell?.vsDemonAccuracyPct !== undefined && target.attributes.includes("demon");
  const purgingStaffEquipped = weaponId === BONUS_TRIGGER_ITEM_IDS.PURGING_STAFF;
  const demonbaneSpellAccuracyPct = demonbaneSpellActive
    ? (markOfDarkness ? 40 : 20) * (purgingStaffEquipped ? 2 : 1)
    : undefined;
  const demonbaneSpellDamagePct =
    demonbaneSpellActive && markOfDarkness ? (purgingStaffEquipped ? 50 : 25) : undefined;

  // Virtus armour: the base +2% magic-damage per piece is already in
  // totals.magicDamagePct (vendor magic_str). When casting Ancient Magicks each
  // worn piece grants +3% MORE (2%→5%). Count worn pieces and add the delta.
  const VIRTUS_PIECE_IDS = new Set([26241, 26243, 26245]); // mask, robe top, robe bottom
  const virtusPiecesWorn = [
    slotId("head"),
    slotId("body"),
    slotId("legs"),
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
    set.style === "magic" && SPELLCASTING_STAFF_CATEGORIES.has(set.weaponCategory ?? "")
      ? magicCastSpeedTicks(weaponId!, set.attackSpeedTicks, isStandardSpell)
      : set.attackSpeedTicks;

  // ── Magic: what the cast actually is ──
  // Powered staves and Magic Dart scale off the BOOSTED Magic level; a spell
  // the weapon can't cast (Iban Blast without Iban's staff), a demonbane
  // spell on a non-demon or Crumble Undead on the living does nothing.
  let baseSpellMaxHit = set.style === "magic" ? set.baseSpellMaxHit : undefined;
  if (set.style === "magic") {
    const formula = POWERED_STAFF_FORMULA.get(weaponId);
    if (formula && !castSpell) baseSpellMaxHit = formula(effectiveSkills.magic);
    if (castSpell?.name === "Magic Dart") {
      baseSpellMaxHit =
        wears("Slayer's staff (e)") && onTask && target.isSlayerMonster !== false
          ? Math.trunc(13 + effectiveSkills.magic / 6)
          : Math.trunc(10 + effectiveSkills.magic / 10);
    }
    if (castSpell && baseSpellMaxHit) {
      // Chaos gauntlets: +3 on the Bolt spells' base hit.
      if (wears("Chaos gauntlets") && castSpell.name.toLowerCase().includes("bolt")) baseSpellMaxHit += 3;
      if (
        !weaponCanCastSpell(castSpell.name, weaponName) ||
        (castSpell.requiresAttribute && !target.attributes.includes(castSpell.requiresAttribute))
      ) {
        baseSpellMaxHit = 0;
      }
    }
  }

  // ── Thrown weapons that scale off Strength, and fixed max hits ──
  const strengthScaled =
    set.style === "ranged" && (weaponId === ECLIPSE_ATLATL_ID || weaponId === HUNTERS_SPEAR_ID);
  // Their damage takes the MELEE Salve / black mask rules (accuracy keeps the
  // ranged ones): a plain Salve or Salve (e) counts, and any black mask or
  // slayer helmet gives x7/6 on task, ahead of the imbued x23/20.
  let slotDamageFactor: [number, number] | undefined;
  if (strengthScaled && !avarice) {
    const undead = target.attributes.includes("undead");
    if (undead && (wears("Salve amulet(ei)") || wears("Salve amulet (e)"))) slotDamageFactor = [6, 5];
    else if (undead && (wears("Salve amulet(i)") || wears("Salve amulet"))) slotDamageFactor = [7, 6];
    else if (plainSlayerHead && onTask && target.isSlayerMonster !== false) slotDamageFactor = [7, 6];
  }
  let fixedMaxHit: number | undefined;
  if (set.style === "ranged" && (weaponName === "Ogre bow" || weaponName === "Comp ogre bow")) {
    // Ignores all gear but the arrow: trunc(((Ranged + 10) x (arrow str + 64) + 320) / 640).
    const arrowStr = firesAmmo(set) ? (canonicalItemById(slotId("ammo"))?.rangedStr ?? 0) : 0;
    fixedMaxHit = Math.trunc(((effectiveSkills.ranged + 10) * (arrowStr + 64) + 320) / 640);
  } else if (set.style === "ranged" && weaponName === "Holy water") {
    if (!target.attributes.includes("demon")) fixedMaxHit = 0;
    else {
      const str = 64 + (canonicalItemById(weaponId)?.rangedStr ?? 0);
      const base = Math.trunc(((effectiveSkills.ranged + 10) * str + 320) / 640);
      fixedMaxHit =
        base +
        Math.trunc((base * scaleDemonbanePct(60, demonbaneVulnerabilityFor(target))) / 100) +
        (target.name === "Nezikchened" ? 5 : 0);
    }
  }

  // ── Set effects and one-off items ──
  const veracs = set.style === "melee" &&
    wears("Verac's helm", "Verac's brassard", "Verac's plateskirt", "Verac's flail");
  const karils = set.style === "ranged" &&
    wears("Karil's coif", "Karil's leathertop", "Karil's leatherskirt", "Karil's crossbow", "Amulet of the damned");
  const ahrims = set.style === "magic" &&
    wears("Ahrim's staff", "Ahrim's hood", "Ahrim's robetop", "Ahrim's robeskirt", "Amulet of the damned");
  const gadderhammer = set.style === "melee" && wears("Gadderhammer") && target.attributes.includes("shade");

  // ── The target's own rules (data/monsters/hit-rules.ts) ──
  const stanceSpeed =
    attackSpeedTicks + (set.style === "ranged" && set.attackStyleChoice === "rapid" ? -1 : 0);
  const usingDemonbane =
    set.style === "magic"
      ? (set.autoSpellName ?? "").includes("Demonbane")
      : set.style === "ranged"
        ? weaponName === "Scorching bow"
        : ["Silverlight", "Darklight", "Arclight", "Emberlight", "Bone claws", "Burning claws"].includes(weaponName);
  const attackCtx: AttackContext = {
    style: set.style,
    attackType: set.attackType,
    weaponName,
    weaponCategory: set.weaponCategory ?? "",
    ammoName: set.slots.ammo ? canonicalNameOf(set.slots.ammo.itemId, set.slots.ammo.itemName) : "",
    worn: wornNames,
    spellName: set.style === "magic" ? set.autoSpellName : undefined,
    spellElement: set.style === "magic" ? set.spellElement : undefined,
    offensive: set.totals.offensive,
    ammoInvalid: activeBonuses.ammoInvalid,
    usingDemonbane,
    attackSpeed: stanceSpeed > 0 ? stanceSpeed : 4,
    wikiPhase: target.wikiPhase,
  };
  const rules = npcHitRules(target, attackCtx);
  const vampyre = vampyreBonuses(target.attributes, attackCtx);
  const ratBone = wearingRatBoneWeapon(attackCtx);
  // Flat max-hit bonuses after the weapon banes: the Colossal blade's
  // + min(2 x size, 10), ratbane's +10 (the Bone staff's is in its formula).
  const flatMaxHitBonus =
    (set.style === "melee" && wears("Colossal blade") ? Math.min((target.size ?? 1) * 2, 10) : 0) +
    (set.style !== "magic" && ratBone && target.attributes.includes("rat") ? 10 : 0);
  // Yama's Glyphic Attenuation: damage scales with the worn prayer bonus.
  let finalMaxHitFactor: [number, number] | undefined;
  if ((target.version ?? "").includes("Glyphic Attenuation")) {
    const prayerBonus = set.totals.prayerBonus;
    const bonus =
      Math.floor(0.85 * prayerBonus) +
      (prayerBonus >= 20 ? 7 : 0) +
      (prayerBonus >= 30 ? 10 : 0) +
      (prayerBonus >= 40 ? 15 : 0) +
      (prayerBonus >= 50 ? 15 : 0);
    finalMaxHitFactor = [100 + bonus, 100];
  }
  // The Mad Angel's reaction buffs condition the FIRST hit only (it always
  // lands, then is floored or maxed); later hitsplats roll as usual.
  const madAngel: DpsScenario["madAngel"] = targetMinHitFactor
    ? targetMinHitFactor[0] >= targetMinHitFactor[1]
      ? "lightning"
      : "cleave"
    : undefined;
  // Scurrius's giant rats: a rat-bone weapon attacks every tick.
  const ratSpeed =
    target.wikiId === SCURRIUS_GIANT_RAT_ID && ratBone
      ? 1 + (set.style === "ranged" && set.attackStyleChoice === "rapid" ? 1 : 0)
      : undefined;

  const scenario: DpsScenario = {
    style: set.style,
    attackStyle: set.attackStyleChoice,
    prayers: prayer ?? DEFAULT_PRAYERS[set.style],
    skills: effectiveSkills,
    attackBonus:
      set.totals.attackBonus - (kerisAmascutWeakened && set.attackType === "stab" ? 50 : 0),
    strengthBonus: set.totals.strengthBonus - (kerisAmascutWeakened ? 22 : 0),
    magicDamagePercent,
    baseSpellMaxHit,
    // The wiki calc skips the accurate-zero raise for Magic Dart (its listed
    // spell max is 0, read as a no-damage spell).
    noAccurateZeroRaise: castSpell?.name === "Magic Dart",
    attackSpeedTicks: ratSpeed ?? attackSpeedTicks,
    strengthLevelBonus,
    rangedDamageLevel: strengthScaled ? effectiveSkills.strength : undefined,
    fixedMaxHit,
    slotDamageFactor,
    avarice,
    extraAccuracyFactors: vampyre.accuracyFactors,
    magicAccuracyPctBonus: vampyre.magicAccuracyPct || undefined,
    damageScales: vampyre.damageScales,
    veracs,
    karils,
    ahrims,
    gadderhammer,
    flatMaxHitBonus: flatMaxHitBonus || undefined,
    finalMaxHitFactor,
    brimstoneRing: set.style === "magic" && wears("Brimstone ring"),
    fangToa: TOMBS_OF_AMASCUT_IDS.has(target.wikiId),
    dawnbringer: set.style === "magic" && weaponName === "Dawnbringer",
    p2Warden: P2_WARDEN_IDS.has(target.wikiId),
    accuracyOverride: rules.accuracyOverride,
    alwaysMax: rules.alwaysMax,
    oneHitDamage: rules.oneHitDamage,
    accurateKillDamage: rules.accurateKillDamage,
    guaranteedMaxEarly: rules.guaranteedMaxEarly,
    minHitHalfMax: rules.minHitHalfMax,
    extraNpcTransforms: rules.transforms,
    lateNpcTransforms: rules.lateTransforms,
    expectedSpeedOverride: rules.attackSpeedOverride,
    madAngel,
    targetDefenceLevel: targetDefenceLevelFor(set, target),
    targetDefenceBonusForStyle: defenceBonusForSet(set, target),
    conditionalBonuses: activeBonuses.conditionalBonuses,
    spellElement: set.spellElement,
    tomeOfFireEquipped: activeBonuses.tomeOfFireEquipped,
    tomeOfWaterEquipped: activeBonuses.tomeOfWaterEquipped,
    tomeOfWaterBindSpell:
      set.style === "magic" && set.itemBonusFlags.tomeOfWater === true &&
      castSpell !== undefined && BIND_SPELL_NAMES.has(castSpell.name),
    tomeOfEarthEquipped: activeBonuses.tomeOfEarthEquipped,
    // Elemental amulet +2 on the cast spell's base hit (0 -> undefined = inactive).
    elementalSpellFlatBonus: activeBonuses.elementalAmuletMaxHitBonus || undefined,
    shadowEquipped,
    shadowToaQuadruple,
    // Melee only, like wgloop's isUsingMeleeStyle() gate on the keris dist.
    kalphiteTripleProc:
      set.style === "melee" && activeBonuses.conditionalBonuses.kerisVsKalphite === true,
    sanguinestiProc,
    // Per-monster demonbane vulnerability (Duke Sucellus 70, Yama 120, Yama void
    // flares 200, Ice demon 115, else 100) scales every demonbane source —
    // weapon tiers, Scorching bow, and the spell bonuses above.
    demonbaneVulnerability: demonbaneVulnerabilityFor(target),
    demonbaneSpellAccuracyPct,
    demonbaneSpellDamagePct,
    smokeStaffStandard,
    twinflameDoubleCast,
    twistedBowEquipped: activeBonuses.twistedBowEquipped,
    fangEquipped: activeBonuses.fangEquipped,
    conflictionGauntlets: activeBonuses.conflictionGauntlets,
    // The fang's damage trim applies on every melee style, not just stab.
    fangHitTrim: set.style === "melee" && set.itemBonusFlags.fang === true,
    seekingArrows,
    targetMonsterMagicLevel: activeBonuses.targetMonsterMagicLevel,
    targetMagicAttackBonus: activeBonuses.targetMagicAttackBonus,
    targetIsXerician: activeBonuses.targetIsXerician,
    armorSetBonus: set.armorSetBonus,
    boltProc,
    hitProfile,
    dharok,
    // A pickaxe vs a CoX Guardian: (50 + Mining 99 + pick bonus) / 150.
    guardianDamageFactor: activeBonuses.guardianPickaxeFactor,
    bloodrager,
    berserkerObsidian,
    corpDamageHalved,
    targetDamageFactor,
    targetDamageMinimum,
    targetAccuracyFactor,
    firstHitDefenceRollFactor,
    firstHitDamageFactor,
    // A Mad Angel buff makes only the first hit sure (`madAngel`), not all.
    targetAlwaysHit: targetAlwaysHit && !madAngel,
    speedScaledHitBonus,
    // Leafy (Turoth/Kurask) without a leaf-bladed weapon / broad ammo / Magic
    // Dart, melee vs a flying target without a halberd / salamander, melee vs
    // a monster immune to it (the Kraken, TzKal-Zuk, the Leviathan, …; Zulrah
    // bar a halberd), anything but a pickaxe in melee vs a CoX Guardian, or a
    // phase that zeroes damage (Doom's shield) — wgloop isImmune. A ×0 phase
    // is immunity, not a scale: it must also zero bolt procs. A salamander
    // without its own tar deals 0 on every style too (upstream isAmmoInvalid
    // zeroes the roll and max hit).
    // No ammo the weapon can fire: no attack at all (roll and max hit 0).
    attackInvalid: activeBonuses.ammoInvalid,
    targetImmune:
      rules.immune ||
      activeBonuses.leafyImmune ||
      activeBonuses.flyingMeleeImmune ||
      activeBonuses.npcMeleeImmune !== null ||
      activeBonuses.guardianImmune ||
      targetDamageFactor?.[0] === 0,
    targetMinHitFactor: undefined,
    // Flat armour (Gargoyle -2, Heavy skeleton +1, …) on every accurate
    // melee/ranged hitsplat; the engine ignores it for magic.
    targetFlatArmour: target.defenceBonuses.flatArmour,
    targetMagicResistance: target.defenceBonuses.magicResistance,
    // Zulrah: every hitsplat over 50 deals 45-50, any style.
    targetDamageCap: damageCapFor(target),
    // The Kraken / Cave kraken take ranged at trunc(d/7), minimum 1.
    targetStyleDamageScale: styleDamageScaleFor(target, set.style),
    slayerOnTask,
    targetWeakness: target.weakness
      ? {
          element: target.weakness.element as never,
          severity: target.weakness.severity,
        }
      : undefined,
  };

  // The Obligator has two styles the catalog can't both carry: thrust (its 5
  // ticks, best of 2-4 damage rolls, +20% / +40% vs 2x2 / 3x3+) and smash (3
  // ticks, a plain hit). Score both and keep the better — smash edges thrust
  // vs most 1x1 targets, thrust wins vs big ones (data/items/obligator.ts).
  const thrust = set.style === "melee" ? obligatorThrust(weaponId, target) : undefined;
  if (thrust) {
    const thrustDps = calculateDps({
      ...scenario,
      damageRolls: thrust.damageRolls,
      sizeDamageFactor: thrust.sizeDamageFactor,
    });
    // Smash is an Aggressive style only (Thrust has Accurate and Aggressive).
    const smashDps =
      set.attackStyleChoice === "aggressive"
        ? calculateDps({ ...scenario, attackSpeedTicks: OBLIGATOR_SMASH_TICKS })
        : undefined;
    return smashDps && smashDps.dps > thrustDps.dps
      ? {
          ...smashDps,
          obligatorStyle: { style: "smash", attackSpeedTicks: OBLIGATOR_SMASH_TICKS, damageRolls: 1 },
        }
      : {
          ...thrustDps,
          obligatorStyle: {
            style: "thrust",
            attackSpeedTicks: scenario.attackSpeedTicks,
            damageRolls: thrust.damageRolls,
          },
        };
  }

  return calculateDps(scenario);
}

/**
 * The max hit as the wiki DPS calc shows it (everything one attack can deal:
 * all hitsplats and procs summed, the fang's trimmed roll), for the loadout
 * `computeSetDps` would score with the same arguments. Display only: it runs
 * the exact hit distribution, which the optimizer's hot path skips. Undefined
 * for a loadout that can't attack.
 */
export function wikiMaxHitForSet(...args: Parameters<typeof computeSetDps>): number | undefined {
  const previous = forceDistributionEngine(true);
  try {
    return computeSetDps(...args).wikiMaxHit;
  } finally {
    forceDistributionEngine(previous);
  }
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
