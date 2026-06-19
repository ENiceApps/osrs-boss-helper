// Phase 3 — budget-aware upgrade finder.
// Given a player's bank + GP + mode, returns:
//   - the best loadout buildable RIGHT NOW from the bank (Phase 2 output)
//   - an ordered "upgrade path" of single-item purchases ranked by DPS gained
//     per GP spent — committing one at a time, re-evaluating against the new
//     loadout (iterative greedy)
//   - in sell-to-fund mode, the list of bank items recommended for liquidation
//
// The iterative greedy commits the best single-item upgrade each round. This
// naturally handles:
//   - bundles (multi-item improvements emerge as path's first 2-3 steps)
//   - recursive sell-to-fund (each commit can newly-displace a bank item,
//     which then funds the next upgrade)
//
// v1 limitations (documented as TODOs for Phase 3 v2):
//   - Cross-style upgrades (e.g. melee bank → first ranged buy) aren't
//     explored — the candidate eval keeps the current loadout's attackStyle
//     and lets scoreScenario reject incompatible combos.
//   - Empty bank (no valid base loadout) returns an empty result rather than
//     bootstrapping from catalog.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { checkAmmoCompatWithCategory, SELF_AMMO_WEAPON_CATEGORIES } from "@/data/ammo-compatibility";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type {
  AttackStyleChoice,
  Skills,
  SpellElement,
  WeaponAttackType,
} from "@/types/osrs";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { isHalberdWeapon } from "@/data/items/halberd-weapons";
import { scoreScenario, type ScoredScenario } from "@/lib/optimize/scenario";
import type { BoostResolver } from "@/lib/dps/boost";

const ITEM_BY_ID = new Map<number, ItemCatalogEntry>(
  ITEM_CATALOG.map((it) => [it.id, it]),
);

const NON_WEAPON_SLOTS: LoadoutSlotKey[] = [
  "head", "cape", "neck", "body", "legs", "hands", "feet", "ring", "ammo", "shield",
];
const ALL_SLOTS: LoadoutSlotKey[] = ["weapon", ...NON_WEAPON_SLOTS];

// "wildy-risk" is a Wilderness-only framing of "budget": build the best loadout
// whose total worn value stays within the GP you're willing to risk to PKers.
// Same math as bestLoadoutForBudget (value cap), shown only for wilderness bosses.
export type BudgetMode = "own-only" | "gp-only" | "sell-to-fund" | "budget" | "wildy-risk";
export type PriceLookup = (itemId: number) => number | null;

export interface FindUpgradesInput {
  bank: Set<number> | number[];
  target: MonsterCatalogEntry;
  skills: Skills;
  gp: number;
  mode: BudgetMode;
  /**
   * sell-to-fund only: ids of bank items the user chose to liquidate. Their
   * summed GE value is added to the budget. Selling is fully user-driven —
   * see recommendedSellToFund for the default-checked set.
   */
  sellItemIds?: number[];
  /** Caller wires this from /api/prices or test fixtures. */
  priceLookup: PriceLookup;
  /** Cap on iterations to avoid runaway when no upgrade is meaningfully better. Default 8. */
  maxIterations?: number;
  /** Magic-only — passed through to scoreScenario. */
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  /** Resolves the boost potion the player owns for a given style (from the bank). */
  boostResolver?: BoostResolver;
  /** Whether the player is on a slayer task — gates the imbued black mask / slayer helm bonus. */
  onTask?: boolean;
  /** Target can only be meleed with a 2-tile reach weapon (halberd / Scythe). */
  requiresMeleeReach2?: boolean;
}

export interface UpgradeStep {
  bought: { itemId: number; name: string; slot: LoadoutSlotKey; costGp: number };
  swappedOut: { itemId: number; name: string } | null;
  dpsBefore: number;
  dpsAfter: number;
  dpsDelta: number;
  dpsPerGp: number;
}

export interface ItemValue {
  itemId: number;
  name: string;
  valueGp: number;
}

export interface BudgetResult {
  /** Best loadout from the original bank, before any upgrades. */
  currentBest: Extract<ScoredScenario, { valid: true }> | null;
  /** Best loadout after applying all profitable upgrades. Same as currentBest if no upgrades found. */
  upgradedBest: Extract<ScoredScenario, { valid: true }> | null;
  /** Ordered sequence of upgrade purchases. Apply top-to-bottom. */
  upgradePath: UpgradeStep[];
  totalCostGp: number;
  totalDpsDelta: number;
  /** sell-to-fund mode: items the user chose to liquidate to fund the path. */
  sellList: ItemValue[];
  /** GP left over after applying every step in upgradePath and selling sellList. */
  remainingGp: number;
  /** Budget (from-scratch) mode: every item to purchase for the built loadout. */
  shoppingList?: ItemValue[];
  /** True when built from scratch ignoring the bank (Budget mode). */
  fromScratch?: boolean;
}

/** Strict equip check — mirrors lib/optimize/bank.ts and scenario.ts. */
function meetsRequirements(item: ItemCatalogEntry, skills: Skills): boolean {
  if (!item.requirements) return true;
  const r = item.requirements;
  if (r.attack !== undefined && skills.attack < r.attack) return false;
  if (r.strength !== undefined && skills.strength < r.strength) return false;
  if (r.defence !== undefined && skills.defence < r.defence) return false;
  if (r.ranged !== undefined && skills.ranged < r.ranged) return false;
  if (r.magic !== undefined && skills.magic < r.magic) return false;
  if (r.hitpoints !== undefined && skills.hitpoints < r.hitpoints) return false;
  if (r.prayer !== undefined && skills.prayer < r.prayer) return false;
  return true;
}

/** Catalog "2h" slot rolls up to "weapon". */
function loadoutSlotFor(item: ItemCatalogEntry): LoadoutSlotKey {
  return item.slot === "2h" ? "weapon" : (item.slot as LoadoutSlotKey);
}

/**
 * Simulate swapping `candidate` into `activeLoadout`. Returns the item-ID
 * list for scoreScenario. Handles 2H/shield removal and ammo↔weapon compat
 * cleanup automatically. Returns null if the candidate can't be cleanly
 * placed (e.g., shield candidate but current weapon is 2H).
 */
function buildSwappedItemIds(
  activeLoadout: LoadoutSet,
  candidate: ItemCatalogEntry,
): number[] | null {
  const candidateSlot = loadoutSlotFor(candidate);
  const slots: Partial<Record<LoadoutSlotKey, number>> = {};
  for (const [k, v] of Object.entries(activeLoadout.slots) as Array<[LoadoutSlotKey, { itemId: number }]>) {
    if (v) slots[k] = v.itemId;
  }

  // Shield candidate but current weapon is 2H → invalid swap.
  if (candidateSlot === "shield" && slots.weapon !== undefined) {
    const w = ITEM_BY_ID.get(slots.weapon);
    if (w?.isTwoHanded) return null;
  }

  slots[candidateSlot] = candidate.id;

  // Weapon swap fixups: clear shield if new weapon is 2H, drop ammo if new
  // weapon is self-contained (Thrown/Chinchompas) or a different ammo class.
  if (candidateSlot === "weapon") {
    if (candidate.isTwoHanded) delete slots.shield;
    if (SELF_AMMO_WEAPON_CATEGORIES.has(candidate.category)) {
      delete slots.ammo;
    } else if (slots.ammo !== undefined) {
      const ammoItem = ITEM_BY_ID.get(slots.ammo);
      if (ammoItem) {
        const compat = checkAmmoCompatWithCategory(candidate.name, candidate.category, ammoItem.name);
        if (!compat.ok) delete slots.ammo;
      }
    }
  }

  return Object.values(slots).filter((id): id is number => typeof id === "number");
}

interface Candidate {
  item: ItemCatalogEntry;
  costGp: number;
  dpsBefore: number;
  dpsAfter: number;
  dpsDelta: number;
  dpsPerGp: number;
  swappedOutItemId: number | null;
  itemIdsAfter: number[];
}

/** Find all single-item upgrades that improve DPS within budget. */
function findCandidates(
  activeLoadout: Extract<ScoredScenario, { valid: true }>["loadout"],
  activeDps: number,
  effectiveBank: Set<number>,
  target: MonsterCatalogEntry,
  skills: Skills,
  budget: number,
  priceLookup: PriceLookup,
  baseSpellMaxHit?: number,
  spellElement?: SpellElement,
  boostResolver?: BoostResolver,
  requiresMeleeReach2?: boolean,
): Candidate[] {
  const candidates: Candidate[] = [];
  const attackStyle = {
    attackType: activeLoadout.attackType as WeaponAttackType,
    choice: activeLoadout.attackStyleChoice as AttackStyleChoice,
  };

  for (const item of ITEM_CATALOG) {
    if (effectiveBank.has(item.id)) continue;
    if (!meetsRequirements(item, skills)) continue;
    const slot = loadoutSlotFor(item);
    if (!ALL_SLOTS.includes(slot)) continue;
    // Reach gate: on a halberd-only boss, never suggest swapping a melee setup's
    // weapon to a non-halberd weapon.
    if (
      requiresMeleeReach2 &&
      slot === "weapon" &&
      activeLoadout.style === "melee" &&
      !isHalberdWeapon(item.id)
    ) {
      continue;
    }
    const price = priceLookup(item.id);
    if (price === null || price > budget) continue;
    // Cheap pre-filter: ammo slot items must match the current weapon's ammo
    // class. Self-ammo weapons (Thrown, Chinchompas) never use the ammo slot.
    if (slot === "ammo") {
      const w = activeLoadout.slots.weapon;
      if (!w) continue;
      const wi = ITEM_BY_ID.get(w.itemId);
      if (!wi) continue;
      if (SELF_AMMO_WEAPON_CATEGORIES.has(wi.category)) continue;
      if (!checkAmmoCompatWithCategory(wi.name, wi.category, item.name).ok) continue;
    }

    const itemIdsAfter = buildSwappedItemIds(activeLoadout, item);
    if (!itemIdsAfter) continue;

    const scored = scoreScenario({
      itemIds: itemIdsAfter,
      target,
      skills,
      attackStyle,
      baseSpellMaxHit,
      spellElement,
      boostResolver,
    });
    if (!scored.valid) continue;
    const dpsDelta = scored.dps.dps - activeDps;
    if (dpsDelta <= 0) continue;

    // What did this swap displace? For the loadout slot the candidate occupies.
    const displaced = activeLoadout.slots[slot];
    const swappedOutItemId = displaced ? displaced.itemId : null;

    candidates.push({
      item,
      costGp: price,
      dpsBefore: activeDps,
      dpsAfter: scored.dps.dps,
      dpsDelta,
      dpsPerGp: dpsDelta / price,
      swappedOutItemId,
      itemIdsAfter,
    });
  }

  return candidates;
}

/**
 * Main entry point — see module header for algorithm + limitations.
 */
export function findUpgrades(input: FindUpgradesInput): BudgetResult {
  const originalBank = new Set<number>(
    input.bank instanceof Set ? input.bank : input.bank,
  );
  const maxIterations = input.maxIterations ?? 8;
  const sellItemIds = input.sellItemIds ?? [];

  // Step 1: best loadout from the original bank.
  const { rankings } = optimizeForBoss({
    bank: originalBank,
    target: input.target,
    skills: input.skills,
    topN: 1,
    baseSpellMaxHit: input.baseSpellMaxHit,
    spellElement: input.spellElement,
    boostResolver: input.boostResolver,
    onTask: input.onTask,
    requiresMeleeReach2: input.requiresMeleeReach2,
  });
  const currentBest = rankings[0] ?? null;

  // Empty-bank early-out — see "limitations" in module header.
  if (!currentBest) {
    return {
      currentBest: null,
      upgradedBest: null,
      upgradePath: [],
      totalCostGp: 0,
      totalDpsDelta: 0,
      sellList: [],
      remainingGp: input.gp,
    };
  }

  if (input.mode === "own-only") {
    return {
      currentBest,
      upgradedBest: currentBest,
      upgradePath: [],
      totalCostGp: 0,
      totalDpsDelta: 0,
      sellList: [],
      remainingGp: input.gp,
    };
  }

  // Step 2: determine starting budget + sell list. In sell-to-fund mode the
  // player explicitly picks which bank items to liquidate; their summed GE
  // value tops up the budget. (recommendedSellToFund seeds the default picks.)
  const sellList: ItemValue[] = [];
  let budget = input.gp;
  if (input.mode === "sell-to-fund") {
    for (const id of sellItemIds) {
      const item = ITEM_BY_ID.get(id);
      if (!item) continue;
      const price = input.priceLookup(id);
      if (price === null) continue;
      sellList.push({ itemId: id, name: item.name, valueGp: price });
      budget += price;
    }
  }

  // Step 3: iterative greedy. Each round picks the best DPS/GP upgrade
  // affordable within budget, commits it, then re-evaluates.
  const upgradePath: UpgradeStep[] = [];
  let activeLoadout = currentBest.loadout;
  let activeDps = currentBest.dps.dps;
  const effectiveBank = new Set(originalBank);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Spell info: prefer caller-supplied, fall back to the active loadout's
    // computed values so powered-staff formulas and auto-selected standard
    // spells are preserved when evaluating non-weapon slot upgrades.
    const upgradeSpellMaxHit =
      input.baseSpellMaxHit ??
      (activeLoadout.style === "magic" ? activeLoadout.baseSpellMaxHit : undefined);
    const upgradeSpellElement =
      input.spellElement ??
      (activeLoadout.style === "magic" ? activeLoadout.spellElement : undefined);

    const candidates = findCandidates(
      activeLoadout,
      activeDps,
      effectiveBank,
      input.target,
      input.skills,
      budget,
      input.priceLookup,
      upgradeSpellMaxHit,
      upgradeSpellElement,
      input.boostResolver,
      input.requiresMeleeReach2,
    );
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.dpsPerGp - a.dpsPerGp);
    const best = candidates[0];

    // Commit the upgrade.
    const swappedOutItem = best.swappedOutItemId !== null
      ? ITEM_BY_ID.get(best.swappedOutItemId)
      : null;
    upgradePath.push({
      bought: {
        itemId: best.item.id,
        name: best.item.name,
        slot: loadoutSlotFor(best.item),
        costGp: best.costGp,
      },
      swappedOut: swappedOutItem
        ? { itemId: swappedOutItem.id, name: swappedOutItem.name }
        : null,
      dpsBefore: best.dpsBefore,
      dpsAfter: best.dpsAfter,
      dpsDelta: best.dpsDelta,
      dpsPerGp: best.dpsPerGp,
    });

    effectiveBank.add(best.item.id);
    budget -= best.costGp;

    // Update the active loadout. Re-score the new gear from scratch so the
    // loadout shape is consistent with optimizeForBoss's output.
    const rescored = scoreScenario({
      itemIds: best.itemIdsAfter,
      target: input.target,
      skills: input.skills,
      attackStyle: {
        attackType: activeLoadout.attackType as WeaponAttackType,
        choice: activeLoadout.attackStyleChoice as AttackStyleChoice,
      },
      baseSpellMaxHit: input.baseSpellMaxHit,
      spellElement: input.spellElement,
      boostResolver: input.boostResolver,
    onTask: input.onTask,
    });
    if (!rescored.valid) break; // shouldn't happen — we just scored it above
    activeLoadout = rescored.loadout;
    activeDps = rescored.dps.dps;
  }

  // Re-score the final activeLoadout one more time so upgradedBest's dps
  // has accurate maxHit + accuracy (not just dps).
  let upgradedBest = currentBest;
  if (upgradePath.length > 0) {
    const finalScore = scoreScenario({
      itemIds: Object.values(activeLoadout.slots).map((s) => s.itemId),
      target: input.target,
      skills: input.skills,
      attackStyle: {
        attackType: activeLoadout.attackType as WeaponAttackType,
        choice: activeLoadout.attackStyleChoice as AttackStyleChoice,
      },
      baseSpellMaxHit: input.baseSpellMaxHit,
      spellElement: input.spellElement,
      boostResolver: input.boostResolver,
    onTask: input.onTask,
    });
    if (finalScore.valid) upgradedBest = finalScore;
  }

  const totalCostGp = upgradePath.reduce((s, u) => s + u.bought.costGp, 0);
  const totalDpsDelta = upgradedBest.dps.dps - currentBest.dps.dps;

  return {
    currentBest,
    upgradedBest,
    upgradePath,
    totalCostGp,
    totalDpsDelta,
    sellList,
    remainingGp: budget,
  };
}

export interface RecommendSellInput {
  bank: Set<number> | number[];
  target: MonsterCatalogEntry;
  skills: Skills;
  /** Wallet GP the player can spend before any sales. */
  gp: number;
  priceLookup: PriceLookup;
  maxIterations?: number;
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  boostResolver?: BoostResolver;
  onTask?: boolean;
  requiresMeleeReach2?: boolean;
}

/**
 * Sell-as-needed recommender for Sell-to-fund mode's default-checked set.
 *
 * Returns the *minimal* set of unused, tradeable bank items the player should
 * liquidate to fund the worthwhile upgrade path. Unlike "sell everything over a
 * threshold", an item is only earmarked once an upgrade actually needs its GP —
 * and we sell the priciest unused items first so the fewest checkboxes are
 * pre-ticked. Only items absent from the best buildable loadout are eligible,
 * so the recommendation never tells you to sell gear you're wearing.
 */
export function recommendedSellToFund(input: RecommendSellInput): { sellItemIds: number[] } {
  const originalBank = new Set<number>(
    input.bank instanceof Set ? input.bank : input.bank,
  );
  const maxIterations = input.maxIterations ?? 8;

  const { rankings } = optimizeForBoss({
    bank: originalBank,
    target: input.target,
    skills: input.skills,
    topN: 1,
    baseSpellMaxHit: input.baseSpellMaxHit,
    spellElement: input.spellElement,
    boostResolver: input.boostResolver,
    onTask: input.onTask,
    requiresMeleeReach2: input.requiresMeleeReach2,
  });
  const currentBest = rankings[0];
  if (!currentBest) return { sellItemIds: [] };

  const activeItemIds = new Set(
    Object.values(currentBest.loadout.slots).map((s) => s.itemId),
  );
  // Unused, tradeable bank items are the only things eligible to sell — priciest
  // first, so each purchase is covered by selling as few items as possible.
  const unusedSellable = [...originalBank]
    .filter((id) => !activeItemIds.has(id))
    .map((id) => ({ id, item: ITEM_BY_ID.get(id), price: input.priceLookup(id) }))
    .filter(
      (x): x is { id: number; item: ItemCatalogEntry; price: number } =>
        x.item !== undefined && x.price !== null,
    )
    .sort((a, b) => b.price - a.price);

  const recommended = new Set<number>();
  let cash = input.gp;
  let availableFromSales = unusedSellable.reduce((s, x) => s + x.price, 0);

  let activeLoadout = currentBest.loadout;
  let activeDps = currentBest.dps.dps;
  const effectiveBank = new Set(originalBank);

  for (let iter = 0; iter < maxIterations; iter++) {
    const upgradeSpellMaxHit =
      input.baseSpellMaxHit ??
      (activeLoadout.style === "magic" ? activeLoadout.baseSpellMaxHit : undefined);
    const upgradeSpellElement =
      input.spellElement ??
      (activeLoadout.style === "magic" ? activeLoadout.spellElement : undefined);

    // Hypothetical max budget if we sold every remaining unused item — lets the
    // candidate scan surface upgrades we could afford after selling.
    const candidates = findCandidates(
      activeLoadout,
      activeDps,
      effectiveBank,
      input.target,
      input.skills,
      cash + availableFromSales,
      input.priceLookup,
      upgradeSpellMaxHit,
      upgradeSpellElement,
      input.boostResolver,
      input.requiresMeleeReach2,
    );
    if (candidates.length === 0) break;
    candidates.sort((a, b) => b.dpsPerGp - a.dpsPerGp);
    const best = candidates[0];

    // Sell unused items until this upgrade is affordable, recording each sale.
    while (cash < best.costGp && unusedSellable.length > 0) {
      const sold = unusedSellable.shift()!;
      recommended.add(sold.id);
      cash += sold.price;
      availableFromSales -= sold.price;
    }
    if (cash < best.costGp) break; // unaffordable even after selling everything

    cash -= best.costGp;
    effectiveBank.add(best.item.id);

    const rescored = scoreScenario({
      itemIds: best.itemIdsAfter,
      target: input.target,
      skills: input.skills,
      attackStyle: {
        attackType: activeLoadout.attackType as WeaponAttackType,
        choice: activeLoadout.attackStyleChoice as AttackStyleChoice,
      },
      baseSpellMaxHit: input.baseSpellMaxHit,
      spellElement: input.spellElement,
      boostResolver: input.boostResolver,
      onTask: input.onTask,
    });
    if (!rescored.valid) break;
    activeLoadout = rescored.loadout;
    activeDps = rescored.dps.dps;
  }

  return { sellItemIds: [...recommended] };
}
