// Armor-set bonuses — multipliers applied when a full set's pieces are all
// equipped. Phase 2/3 optimizer addition (post-launch): the greedy K=1
// per-slot picker can't see set synergies without help, so the bank
// optimizer force-builds a candidate per detected set.
//
// Currently modelled:
//   - Void Knight (Melee / Ranged / Magic), regular and Elite variants
//   - Inquisitor's armour — crush-style only
//   - Obsidian armour — only with TzHaar weapons (Melee/Ranged/Magic variants)
//
// Future candidates (not yet modelled):
//   - Dharok's set — damage scales with missing HP. The +N% bonus depends on
//     current HP / max HP at the time of the attack; the optimizer assumes
//     full HP, so Dharok's would model as 0% bonus. Needs a separate "low-HP
//     mode" plumb-through before it's worth adding.
//   - Crystal armour + Bow of Faerdhinen — set bonus already baked into vendor
//     item stats, so individual-item bonuses include it. No separate model
//     needed (see Phase-5 memory note).
//
// References:
//   https://oldschool.runescape.wiki/w/Void_Knight_equipment
//   https://oldschool.runescape.wiki/w/Inquisitor%27s_armour
//   https://oldschool.runescape.wiki/w/Obsidian_armour

import type { CombatStyle, WeaponAttackType } from "@/types/osrs";
import type { LoadoutSlotKey } from "@/types/loadout";

/**
 * The runtime "this set is currently active on the loadout" object.
 * Multipliers are [numerator, denominator] pairs (e.g. [11, 10] = +10%)
 * applied via the existing `applyFactors` helper in lib/dps/conditional.ts.
 */
export interface ArmorSetBonus {
  id: string;
  name: string;
  accuracyFactor?: readonly [number, number];
  damageFactor?: readonly [number, number];
}

/**
 * A required slot: any one of `itemIds` satisfies it. Lets us express
 * "body slot accepts EITHER regular OR elite top" without two definitions.
 */
interface SetSlotRequirement {
  slot: LoadoutSlotKey;
  itemIds: readonly number[];
}

interface ArmorSetDefinition {
  id: string;
  name: string;
  /** Set bonus only fires for this combat style. */
  style: CombatStyle;
  /** Every requirement must be satisfied for the set bonus to fire. */
  pieces: readonly SetSlotRequirement[];
  bonus: Omit<ArmorSetBonus, "id" | "name">;
  /**
   * Optional: only fires when the weapon's attack type matches one of these.
   * E.g. Inquisitor's armour boosts crush attacks only.
   */
  attackTypes?: readonly WeaponAttackType[];
  /**
   * Optional: only fires when the equipped weapon's item ID is in this list.
   * E.g. Obsidian armour only boosts TzHaar weapons (Toktz-xil-ak, etc.).
   */
  requiredWeaponIds?: readonly number[];
}

// ---- Void piece IDs (verified against ITEM_CATALOG) ----
const VOID_TOP_REGULAR = 8839;
const VOID_TOP_ELITE = 13072;
const VOID_ROBE_REGULAR = 8840;
const VOID_ROBE_ELITE = 13073;
const VOID_GLOVES = 8842;
const VOID_HELM_RANGER = 11664;
const VOID_HELM_MELEE = 11665;
const VOID_HELM_MAGE = 11663;

// Order matters: detectArmorSetBonus iterates and returns the FIRST match.
// List elite variants before regulars per style so Elite Void wins when both
// would apply (a player wearing elite top+robe satisfies both definitions).
export const ARMOR_SETS: readonly ArmorSetDefinition[] = [
  // ============ Ranged ============
  {
    id: "elite-void-ranged",
    name: "Elite Void Knight (Ranged)",
    style: "ranged",
    pieces: [
      { slot: "head", itemIds: [VOID_HELM_RANGER] },
      { slot: "body", itemIds: [VOID_TOP_ELITE] },
      { slot: "legs", itemIds: [VOID_ROBE_ELITE] },
      { slot: "hands", itemIds: [VOID_GLOVES] },
    ],
    // +10% accuracy + +12.5% damage. Elite ranged's signature bonus.
    bonus: { accuracyFactor: [11, 10], damageFactor: [9, 8] },
  },
  {
    id: "void-ranged",
    name: "Void Knight (Ranged)",
    style: "ranged",
    pieces: [
      { slot: "head", itemIds: [VOID_HELM_RANGER] },
      { slot: "body", itemIds: [VOID_TOP_REGULAR, VOID_TOP_ELITE] },
      { slot: "legs", itemIds: [VOID_ROBE_REGULAR, VOID_ROBE_ELITE] },
      { slot: "hands", itemIds: [VOID_GLOVES] },
    ],
    // +10% accuracy + +10% damage. Standard bonus, also fires if the player
    // mixes elite/regular pieces (no elite-set tax in that case).
    bonus: { accuracyFactor: [11, 10], damageFactor: [11, 10] },
  },

  // ============ Magic ============
  {
    id: "elite-void-magic",
    name: "Elite Void Knight (Magic)",
    style: "magic",
    pieces: [
      { slot: "head", itemIds: [VOID_HELM_MAGE] },
      { slot: "body", itemIds: [VOID_TOP_ELITE] },
      { slot: "legs", itemIds: [VOID_ROBE_ELITE] },
      { slot: "hands", itemIds: [VOID_GLOVES] },
    ],
    // +45% accuracy + +2.5% damage. Elite adds the small damage boost on
    // top of regular's accuracy-only bonus.
    bonus: { accuracyFactor: [29, 20], damageFactor: [41, 40] },
  },
  {
    id: "void-magic",
    name: "Void Knight (Magic)",
    style: "magic",
    pieces: [
      { slot: "head", itemIds: [VOID_HELM_MAGE] },
      { slot: "body", itemIds: [VOID_TOP_REGULAR, VOID_TOP_ELITE] },
      { slot: "legs", itemIds: [VOID_ROBE_REGULAR, VOID_ROBE_ELITE] },
      { slot: "hands", itemIds: [VOID_GLOVES] },
    ],
    // +45% accuracy, no damage bonus. Elite mage helm doesn't exist
    // separately — same mage helm used for both regular and elite.
    bonus: { accuracyFactor: [29, 20] },
  },

  // ============ Melee ============
  {
    id: "void-melee",
    name: "Void Knight (Melee)",
    style: "melee",
    pieces: [
      { slot: "head", itemIds: [VOID_HELM_MELEE] },
      { slot: "body", itemIds: [VOID_TOP_REGULAR, VOID_TOP_ELITE] },
      { slot: "legs", itemIds: [VOID_ROBE_REGULAR, VOID_ROBE_ELITE] },
      { slot: "hands", itemIds: [VOID_GLOVES] },
    ],
    // +10% acc + +10% dmg. Elite top/robe DON'T add damage for melee
    // (elite ranged/magic only), so there's no separate "elite-void-melee".
    bonus: { accuracyFactor: [11, 10], damageFactor: [11, 10] },
  },

  // ============ Inquisitor's (crush only) ============
  {
    id: "inquisitors",
    name: "Inquisitor's armour",
    style: "melee",
    // Bonus only fires with a crush attack. Full set's headline value is
    // +2.5% accuracy + 2.5% damage (post-2024 buff curve; per-piece values
    // are 0.5% / 1% / 2.5% for 1/2/3 pieces). We only model the full-set
    // case — partials don't have a force-include path in the optimizer.
    attackTypes: ["crush"],
    pieces: [
      { slot: "head", itemIds: [24419] }, // Inquisitor's great helm
      { slot: "body", itemIds: [24420] }, // Inquisitor's hauberk
      { slot: "legs", itemIds: [24421] }, // Inquisitor's plateskirt
    ],
    bonus: { accuracyFactor: [41, 40], damageFactor: [41, 40] }, // +2.5% / +2.5%
  },

  // ============ Obsidian armour — only fires with a TzHaar weapon ============
  // The same armor set boosts melee, ranged, and magic — we just split by
  // weapon style so the optimizer's per-(weapon, style) force-include can
  // filter correctly. Berserker necklace adds an additional +20% damage on
  // top with melee obsidian weapons; not modelled (it's a neck slot item,
  // not part of the armor set).
  {
    id: "obsidian-melee",
    name: "Obsidian armour (Melee)",
    style: "melee",
    requiredWeaponIds: [
      6523, // Toktz-xil-ak (Obsidian sword, stab)
      6525, // Toktz-xil-ek (Obsidian dagger, slash)
      6527, // Tzhaar-ket-em (Obsidian mace, crush)
      6528, // Tzhaar-ket-om (Obsidian maul, crush)
    ],
    pieces: [
      { slot: "head", itemIds: [21298] }, // Obsidian helmet
      { slot: "body", itemIds: [21301] }, // Obsidian platebody
      { slot: "legs", itemIds: [21304] }, // Obsidian platelegs
    ],
    bonus: { accuracyFactor: [11, 10], damageFactor: [11, 10] }, // +10% / +10%
  },
  {
    id: "obsidian-ranged",
    name: "Obsidian armour (Ranged)",
    style: "ranged",
    requiredWeaponIds: [6522], // Toktz-xil-ul (obsidian rings, thrown)
    pieces: [
      { slot: "head", itemIds: [21298] },
      { slot: "body", itemIds: [21301] },
      { slot: "legs", itemIds: [21304] },
    ],
    bonus: { accuracyFactor: [11, 10], damageFactor: [11, 10] },
  },
  {
    id: "obsidian-magic",
    name: "Obsidian armour (Magic)",
    style: "magic",
    requiredWeaponIds: [6526], // Toktz-mej-tal (obsidian staff)
    pieces: [
      { slot: "head", itemIds: [21298] },
      { slot: "body", itemIds: [21301] },
      { slot: "legs", itemIds: [21304] },
    ],
    bonus: { accuracyFactor: [11, 10], damageFactor: [11, 10] },
  },
];

/**
 * Find the highest-priority armor set that matches the equipped item set,
 * given the active combat style (and optionally the weapon's attackType +
 * itemId, which some sets require). Returns undefined if no set qualifies.
 *
 * Order of checks: style → attackType filter → required-weapon filter →
 * pieces all present. ARMOR_SETS order in the file controls which set wins
 * when multiple qualify (elite variants are listed before regulars).
 */
export function detectArmorSetBonus(
  itemIds: ReadonlySet<number>,
  style: CombatStyle,
  options?: { attackType?: WeaponAttackType; weaponId?: number },
): ArmorSetBonus | undefined {
  const attackType = options?.attackType;
  const weaponId = options?.weaponId;
  for (const set of ARMOR_SETS) {
    if (set.style !== style) continue;
    if (set.attackTypes && (!attackType || !set.attackTypes.includes(attackType))) continue;
    if (set.requiredWeaponIds && (weaponId === undefined || !set.requiredWeaponIds.includes(weaponId))) continue;
    const allPresent = set.pieces.every((p) =>
      p.itemIds.some((id) => itemIds.has(id)),
    );
    if (allPresent) {
      return { id: set.id, name: set.name, ...set.bonus };
    }
  }
  return undefined;
}

/**
 * Every armor set in the catalog whose pieces are all in the bank — AND, if
 * the set requires a specific weapon (Obsidian → TzHaar), at least one such
 * weapon is also in the bank. Used by the bank optimizer to enumerate
 * force-include branches.
 *
 * Note: this DOES NOT filter by attackType (Inquisitor's still appears here
 * even if no crush weapon is in the bank, because the bank's crush-capable
 * weapons may not be predictable from item-slot alone). The optimizer's
 * per-(weapon, style) loop does that filter when iterating.
 */
export function availableArmorSetsInBank(
  bankIds: ReadonlySet<number>,
): readonly ArmorSetDefinition[] {
  return ARMOR_SETS.filter((set) => {
    if (!set.pieces.every((p) => p.itemIds.some((id) => bankIds.has(id)))) return false;
    if (set.requiredWeaponIds && !set.requiredWeaponIds.some((id) => bankIds.has(id))) return false;
    return true;
  });
}

/** Resolve which specific item IDs satisfy each slot for a given set. */
export function piecesToEquipForSet(
  setDef: ArmorSetDefinition,
  bankIds: ReadonlySet<number>,
): Array<{ slot: LoadoutSlotKey; itemId: number }> {
  return setDef.pieces.map((p) => {
    const id = p.itemIds.find((id) => bankIds.has(id));
    if (id === undefined) {
      throw new Error(`Set ${setDef.id} slot ${p.slot}: no matching item in bank`);
    }
    return { slot: p.slot, itemId: id };
  });
}

export type { ArmorSetDefinition };
