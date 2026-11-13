// Per-monster rules for how a player's hit lands: who is immune to what, who
// always takes a max hit, whose hits are capped or divided. Mirrors
// weirdgloop/osrs-dps-calc @ 74958b1 (PlayerVsNPCCalc isImmune, getHitChance,
// getAttackerDist, applyNpcTransforms and the id lists in constants.ts), which
// cites the wiki / Jagex for each. The older rules keep their own modules
// (melee-reach.ts, damage-cap.ts, style-damage-scale.ts, mechanic phases);
// this file adds the rest.
//
// Ids are the wiki calc's monster ids (MonsterCatalogEntry.wikiId, phase-aware).

import type { NpcTransform } from "@/lib/dps/dist-pipeline";
import type { CombatStyle, SpellElement, WeaponAttackType } from "@/types/osrs";

const VERZIK_P1_IDS: ReadonlySet<number> = new Set([10830, 10831, 10832, 8369, 8370, 8371, 10847, 10848, 10849]);
const TEKTON_IDS: ReadonlySet<number> = new Set([7540, 7543, 7544, 7545]);
const GLOWING_CRYSTAL_IDS: ReadonlySet<number> = new Set([7568]);
const OLM_HEAD_IDS: ReadonlySet<number> = new Set([7551, 7554]);
const OLM_MELEE_HAND_IDS: ReadonlySet<number> = new Set([7552, 7555]);
const OLM_MAGE_HAND_IDS: ReadonlySet<number> = new Set([7550, 7553]);
const ICE_DEMON_IDS: ReadonlySet<number> = new Set([7584, 7585]);
const NIGHTMARE_TOTEM_IDS: ReadonlySet<number> = new Set([9434, 9437, 9440, 9443, 9435, 9438, 9441, 9444]);
const DUSK_IDS: ReadonlySet<number> = new Set([7851, 7854, 7855, 7882, 7883, 7886, 7887, 7888, 7889]);
const WARRIORS_GUILD_CYCLOPES: ReadonlySet<number> = new Set([
  2463, 2465, 2467, 2464, 2466, 2468, 2137, 2138, 2139, 2140, 2141, 2142,
]);
const HUEYCOATL_TAIL_IDS: ReadonlySet<number> = new Set([14014]);
const ECLIPSE_MOON_IDS: ReadonlySet<number> = new Set([13012]);
const OCELLUS_P3_IDS: ReadonlySet<number> = new Set([16677]);
/** The P2 Wardens (Elidinis' / Tumeken's Warden, "Active"). */
export const P2_WARDEN_IDS: ReadonlySet<number> = new Set([11753, 11754, 11756, 11757]);
const WARDEN_CORE_EJECTED_IDS = [11755, 11758];
const YAMA_VOID_FLARE_IDS = [14179];
const JUDGE_OF_YAMA_ID = 14180;
/** Scurrius's giant rats die to any hit. */
const ONE_HIT_IDS: ReadonlySet<number> = new Set([7223, 8584, 11193]);
export const SCURRIUS_GIANT_RAT_ID = 7223;
const GUARANTEED_ACCURACY_IDS: ReadonlySet<number> = new Set([5916, JUDGE_OF_YAMA_ID]);
const ALWAYS_MAX: Record<CombatStyle, ReadonlySet<number>> = {
  melee: new Set([11710, 11713, 12814, ...WARDEN_CORE_EJECTED_IDS, ...YAMA_VOID_FLARE_IDS, JUDGE_OF_YAMA_ID]),
  ranged: new Set([11711, 11714, 12815, 11717, 11715, ...YAMA_VOID_FLARE_IDS, JUDGE_OF_YAMA_ID]),
  magic: new Set([11709, 11712, 12816, 14151, 14150, ...YAMA_VOID_FLARE_IDS, JUDGE_OF_YAMA_ID]),
};

/** Every monster inside the Tombs of Amascut (upstream TOMBS_OF_AMASCUT_MONSTER_IDS). */
export const TOMBS_OF_AMASCUT_IDS: ReadonlySet<number> = new Set([
  11789, 11790, 11791, 11792, 11793, 11794, 11795, 11796, // Akkha
  11797, 11798, 11799, // Akkha's shadow
  11778, 11779, 11780, // Ba-Ba
  11719, 11721, // Kephri (shielded / unshielded)
  11724, 11725, 11726, // Kephri's overlords
  11730, 11732, 11733, // Zebak
  11781, 11709, 11712, 11711, 11714, 11715, 11718, 11710, 11713, 11717, 11716, // Ba-Ba's monkey room
  11751, 11750, 11752, // Obelisk
  ...P2_WARDEN_IDS,
  ...WARDEN_CORE_EJECTED_IDS,
  11761, 11763, 11762, 11764, // P3 Wardens
]);

const ZOGRE_NAMES: ReadonlySet<string> = new Set(["Slash Bash", "Zogre", "Skogre"]);
const ARAXYTE_SHELL_NAMES: ReadonlySet<string> = new Set(["Acidic Araxyte", "Mirrorback Araxyte"]);

export type VampyreTier = 1 | 2 | 3;
export function vampyreTier(attributes: readonly string[]): VampyreTier | undefined {
  if (attributes.includes("vampyre3")) return 3;
  if (attributes.includes("vampyre2")) return 2;
  if (attributes.includes("vampyre1")) return 1;
  return undefined;
}

/** What the rules need to know about the attack (names are CANONICAL item names). */
export interface AttackContext {
  style: CombatStyle;
  attackType: WeaponAttackType;
  weaponName: string;
  weaponCategory: string;
  ammoName: string;
  /** Every worn item's canonical name, lower-cased. */
  worn: ReadonlySet<string>;
  spellName?: string;
  spellElement?: SpellElement;
  /** Summed offensive bonuses (for "crush is my best style" checks). */
  offensive?: { stab: number; slash: number; crush: number; magic: number; ranged: number };
  /** True when the weapon needs ammo and has none it can fire. */
  ammoInvalid: boolean;
  /** Wearing a demonbane source for this style (upstream isUsingDemonbane). */
  usingDemonbane: boolean;
  /** The attack speed in ticks, stance included. */
  attackSpeed: number;
  /** The target's mechanic phase as the wiki calc names it, when one is chosen. */
  wikiPhase?: string;
}

export interface MonsterTarget {
  wikiId: number;
  name: string;
  version: string;
  hp: number;
  attributes: readonly string[];
}

export interface NpcHitRules {
  /** No damage at all from this attack. */
  immune: boolean;
  /** The attack cannot miss (or, with another value, lands exactly this often). */
  accuracyOverride?: number;
  alwaysMax?: boolean;
  oneHitDamage?: number;
  accurateKillDamage?: number;
  guaranteedMaxEarly?: boolean;
  minHitHalfMax?: boolean;
  /** Transforms between the damage cap / style scale and the phase damage factor. */
  transforms: NpcTransform[];
  /** Transforms after the phase damage factor. */
  lateTransforms: NpcTransform[];
  /** Attack speed forced by the phase (Ocellus's explosions with the speed-up). */
  attackSpeedOverride?: number;
}

const SILVER_MELEE: ReadonlySet<string> = new Set([
  "Blessed axe", "Ivandis flail", "Blisterwood flail", "Hallowed flail", "Silver sickle", "Silver sickle (b)",
  "Emerald sickle", "Emerald sickle (b)", "Enchanted emerald sickle (b)", "Ruby sickle (b)",
  "Enchanted ruby sickle (b)", "Blisterwood sickle", "Silverlight", "Darklight", "Arclight", "Rod of Ivandis",
  "Wolfbane",
]);
const VAMPYREBANE_MELEE: ReadonlySet<string> = new Set([
  "Ivandis flail", "Blisterwood sickle", "Blisterwood flail", "Hallowed flail", "Sunspear",
]);
const RAT_BONE_WEAPONS: ReadonlySet<string> = new Set(["Bone mace", "Bone shortbow", "Bone staff"]);

/** `ctx.worn` holds lower-cased names (the wiki's capitalisation of an item drifts). */
const wears = (ctx: AttackContext, name: string): boolean => ctx.worn.has(name.toLowerCase());
const wearsAny = (ctx: AttackContext, names: ReadonlySet<string>): boolean => {
  for (const n of names) if (wears(ctx, n)) return true;
  return false;
};
const weaponIs = (ctx: AttackContext, name: string): boolean => ctx.weaponName.toLowerCase() === name.toLowerCase();

/** A silver weapon for this style (upstream isWearingSilverWeapon). */
export function wearingSilverWeapon(ctx: AttackContext): boolean {
  if (ctx.style === "ranged") return wears(ctx, "Silver bolts") || wears(ctx, "Blisterwood stake");
  return ctx.style === "melee" && wearsAny(ctx, SILVER_MELEE);
}

/** A weapon that deals full damage to this vampyre tier (upstream wearingVampyrebane). */
export function wearingVampyrebane(ctx: AttackContext, tier: 2 | 3): boolean {
  if (ctx.style === "ranged" && weaponIs(ctx, "Blisterwood stake")) return true;
  if (tier === 3 && ctx.style !== "melee") return false;
  if (tier === 2 && wears(ctx, "Rod of Ivandis")) return true;
  return wearsAny(ctx, VAMPYREBANE_MELEE);
}

export function wearingRatBoneWeapon(ctx: AttackContext): boolean {
  return wearsAny(ctx, RAT_BONE_WEAPONS);
}

/**
 * Vampyrebane on the hit itself: melee attack-roll factors, the magic
 * accuracy percent and the per-hitsplat damage scales, in upstream's order.
 */
export function vampyreBonuses(
  attributes: readonly string[],
  ctx: AttackContext,
): { accuracyFactors: [number, number][]; magicAccuracyPct: number; damageScales: [number, number][] } {
  const out = { accuracyFactors: [] as [number, number][], magicAccuracyPct: 0, damageScales: [] as [number, number][] };
  const tier = vampyreTier(attributes);
  if (tier === undefined) return out;
  const efaritay = wears(ctx, "Efaritay's aid");
  const silver = wearingSilverWeapon(ctx);
  if (ctx.style === "melee") {
    if (wears(ctx, "Blisterwood flail") || wears(ctx, "Blisterwood sickle")) out.accuracyFactors.push([105, 100]);
    if (wears(ctx, "Hallowed flail") || wears(ctx, "Sunspear")) out.accuracyFactors.push([125, 100]);
    if (silver && efaritay) out.accuracyFactors.push([23, 20]);
  } else if (ctx.style === "magic" && efaritay && silver) {
    out.magicAccuracyPct = 15;
  }
  let scale: [number, number] | undefined;
  if (wears(ctx, "Blisterwood flail") || wears(ctx, "Hallowed flail") || wears(ctx, "Blisterwood stake")) {
    scale = [125, 100];
  } else if (wears(ctx, "Sunspear")) scale = [150, 100];
  else if (wears(ctx, "Blisterwood sickle")) scale = [23, 20];
  else if (wears(ctx, "Ivandis flail")) scale = [6, 5];
  else if (wears(ctx, "Rod of Ivandis") && tier !== 3) scale = [11, 10];
  else if (silver && tier === 1) scale = [11, 10];
  if (scale) {
    if (efaritay) out.damageScales.push([11, 10]);
    out.damageScales.push(scale);
  }
  return out;
}

export function npcHitRules(target: MonsterTarget, ctx: AttackContext): NpcHitRules {
  const id = target.wikiId;
  const attrs = target.attributes;
  const { style } = ctx;
  const rules: NpcHitRules = { immune: false, transforms: [], lateTransforms: [] };

  // ── Immunities ──
  const tier = vampyreTier(attrs);
  const eclipseClone = ECLIPSE_MOON_IDS.has(id) && target.version === "Clone";
  if (
    (style === "magic" && (DUSK_IDS.has(id) || WARRIORS_GUILD_CYCLOPES.has(id))) ||
    (style === "ranged" &&
      (TEKTON_IDS.has(id) || DUSK_IDS.has(id) || GLOWING_CRYSTAL_IDS.has(id) || WARRIORS_GUILD_CYCLOPES.has(id))) ||
    (tier === 3 && !wearingVampyrebane(ctx, 3)) ||
    (tier === 2 && !wearingVampyrebane(ctx, 2) && !wears(ctx, "Efaritay's aid") && !wearingSilverWeapon(ctx)) ||
    (!attrs.includes("rat") && wearingRatBoneWeapon(ctx)) ||
    (eclipseClone && style !== "melee")
  ) {
    rules.immune = true;
  }

  // ── Accuracy ──
  const araxyteShell =
    ARAXYTE_SHELL_NAMES.has(target.name) &&
    (weaponIs(ctx, "Noxious halberd") ||
      (style === "ranged" &&
        bestOffensive(ctx) === "ranged" &&
        (weaponIs(ctx, "Heavy ballista") || weaponIs(ctx, "Light ballista") || ctx.weaponCategory === "Crossbow")) ||
      (ctx.attackType === "crush" && bestOffensive(ctx) === "crush"));
  if (
    GUARANTEED_ACCURACY_IDS.has(id) ||
    (VERZIK_P1_IDS.has(id) && wears(ctx, "Dawnbringer")) ||
    P2_WARDEN_IDS.has(id) ||
    id === SCURRIUS_GIANT_RAT_ID ||
    (eclipseClone && style === "melee") ||
    ALWAYS_MAX[style].has(id) ||
    (araxyteShell && !(style === "ranged" && ctx.ammoInvalid))
  ) {
    rules.accuracyOverride = 1;
  }

  // ── The attacker's distribution ──
  if (ONE_HIT_IDS.has(id)) rules.oneHitDamage = target.hp;
  if (target.name === "Respiratory system") {
    rules.minHitHalfMax = true;
    if (ctx.usingDemonbane) rules.accurateKillDamage = target.hp;
  }
  if (araxyteShell) rules.guaranteedMaxEarly = true;
  if (ALWAYS_MAX[style].has(id)) rules.alwaysMax = true;

  // ── The monster's transforms, in upstream's order ──
  const t = rules.transforms;
  if (target.name === "Fragment of Seren") t.push({ kind: "linearMin", maximum: 2, offset: 22 });
  if (VERZIK_P1_IDS.has(id) && !wears(ctx, "Dawnbringer")) {
    t.push({ kind: "linearMin", maximum: style === "melee" ? 10 : 3 });
  }
  if (TEKTON_IDS.has(id) && style === "magic") t.push({ kind: "multiply", factor: [1, 5], minimum: 1 });
  if (GLOWING_CRYSTAL_IDS.has(id) && style === "magic") t.push({ kind: "multiply", factor: [1, 3] });
  if ((OLM_MELEE_HAND_IDS.has(id) || OLM_HEAD_IDS.has(id)) && style === "magic") {
    t.push({ kind: "multiply", factor: [1, 3] });
  }
  if ((OLM_MAGE_HAND_IDS.has(id) || OLM_MELEE_HAND_IDS.has(id)) && style === "ranged") {
    t.push({ kind: "multiply", factor: [1, 3] });
  }
  if (ICE_DEMON_IDS.has(id) && ctx.spellElement !== "fire" && !ctx.usingDemonbane) {
    t.push({ kind: "multiply", factor: [1, 3] });
  }
  if (target.name === "Slagilith" && ctx.weaponCategory !== "Pickaxe") t.push({ kind: "multiply", factor: [1, 3] });
  if (NIGHTMARE_TOTEM_IDS.has(id) && style === "magic") t.push({ kind: "multiply", factor: [2, 1] });
  if (ZOGRE_NAMES.has(target.name)) {
    if (ctx.spellName === "Crumble Undead") t.push({ kind: "multiply", factor: [1, 2] });
    else if (style !== "ranged" || !ctx.ammoName.includes(" brutal") || !weaponIs(ctx, "Comp ogre bow")) {
      t.push({ kind: "multiply", factor: [1, 4] });
    }
  }
  if (tier === 2 && !wearingVampyrebane(ctx, 2)) {
    if (wears(ctx, "Efaritay's aid")) t.push({ kind: "multiply", factor: [1, 2] });
    else if (wearingSilverWeapon(ctx)) t.push({ kind: "flatLimit", maximum: 10 });
  }
  if (HUEYCOATL_TAIL_IDS.has(id)) {
    const o = ctx.offensive;
    const crush = ctx.attackType === "crush" && o !== undefined && o.crush > o.slash && o.crush > o.stab;
    const earth = ctx.spellElement === "earth";
    t.push({ kind: "linearMin", maximum: crush || earth ? 9 : 4 });
    if (crush) t.push({ kind: "zeroToOne" });
  }

  if (OCELLUS_P3_IDS.has(id) && ctx.wikiPhase?.startsWith("Phase 4 Explosions")) {
    // The scale reads the weapon's own speed even when the speed-up sets the
    // attack interval to 2 ticks.
    if (ctx.wikiPhase === "Phase 4 Explosions - With Speed-Up") rules.attackSpeedOverride = 2;
    rules.lateTransforms.push({ kind: "explosion", attackSpeed: ctx.attackSpeed });
  }

  return rules;
}

/** The highest of the summed offensive bonuses (first wins a tie, in upstream's key order). */
function bestOffensive(ctx: AttackContext): "stab" | "slash" | "crush" | "magic" | "ranged" | undefined {
  const o = ctx.offensive;
  if (!o) return undefined;
  // Upstream reduces over the PlayerOffensive keys in declaration order and
  // keeps the earlier key on a tie.
  const order = ["stab", "slash", "crush", "magic", "ranged"] as const;
  let best: (typeof order)[number] = order[0];
  for (const k of order) if (o[k] > o[best]) best = k;
  return best;
}
