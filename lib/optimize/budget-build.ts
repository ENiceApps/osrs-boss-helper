// Bank-free "Budget" mode — build the best loadout purchasable for a fixed GP
// amount, ignoring whatever the player already owns.
//
// This is a DIFFERENT objective from lib/optimize/budget.ts:findUpgrades, which
// starts from the bank and ranks single-item swaps by DPS-per-GP. Here there is
// no bank and no "before" — we want the highest-DPS full loadout whose total
// cost stays within the budget. So 10M, 100M and 1B each produce a genuinely
// different, progressively stronger setup.
//
// Structure mirrors optimizeForBoss (enumerate weapon×style anchors, greedy
// slot fill, conditional force-includes, spell auto-pick, score via
// scoreScenario) but adds budget accounting: every pick must fit the remaining
// GP, and we keep the best-scoring loadout whose total cost ≤ budget.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { rangedDamageUsesMeleeStrength } from "@/data/items/special-strength";
import { BONUS_TRIGGER_VARIANTS, ownedTriggerIds } from "@/data/bonus-trigger-items";
import {
  checkAmmoCompatWithCategory,
  SELF_AMMO_WEAPON_CATEGORIES,
  AMMO_TYPES,
} from "@/data/ammo-compatibility";
import { INTERNAL_AMMO_WEAPONS } from "@/data/items/internal-ammo-weapons";
import { UNCHARGED_PRICE_ID } from "@/data/items/charged-items";
import { BOLT_EFFECT_BY_ITEM_ID, type BoltEffect } from "@/data/items/bolt-procs";
import { boltEffectApplies } from "@/lib/dps/bolts";
import { WEAPON_STYLES } from "@/data/weapon-styles";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { CombatStyle, Skills, SpellElement, WeaponAttackType } from "@/types/osrs";
import {
  autoPickSpell,
  combatStyleFor,
  enumerateWeaponStyles,
  itemScore,
  loadoutSlotFor,
  meetsRequirements,
  NON_WEAPON_SLOTS,
  optimizeForBoss,
  type WeaponStyleCandidate,
} from "@/lib/optimize/bank";
import { scoreScenario, type ScoredScenario } from "@/lib/optimize/scenario";
import type { BudgetResult, ItemValue, PriceLookup } from "@/lib/optimize/budget";
import type { BoostResolver } from "@/lib/dps/boost";

const ITEM_BY_ID = new Map<number, ItemCatalogEntry>(
  ITEM_CATALOG.map((it) => [it.id, it]),
);

/** Distinct affordable weapons kept per combat style, to bound scoreScenario calls. */
const WEAPONS_PER_STYLE = 24;

export interface BudgetBuildInput {
  target: MonsterCatalogEntry;
  skills: Skills;
  /** Total GP to spend. The whole loadout must cost ≤ this. */
  gp: number;
  priceLookup: PriceLookup;
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  boostResolver?: BoostResolver;
  onTask?: boolean;
}

const STYLES: CombatStyle[] = ["melee", "ranged", "magic"];

/** Representative attack type for ranking gear within a combat style. */
function attackTypeForStyle(style: CombatStyle): WeaponAttackType {
  return style === "ranged" ? "ranged" : style === "magic" ? "magic" : "slash";
}

/** Best per-style DPS proxy for a weapon across its legal non-defensive styles. */
function bestWeaponScore(w: ItemCatalogEntry, style: CombatStyle): number {
  const opts = WEAPON_STYLES[w.category];
  if (!opts) return 0;
  let best = 0;
  for (const o of opts) {
    if (o.defensive) continue;
    if (combatStyleFor(o.attackType) !== style) continue;
    best = Math.max(best, itemScore(w, o.attackType, style));
  }
  return best;
}

/**
 * Conditional weapons whose multipliers `itemScore` can't see (DHCB/DHL/DH-wand
 * vs dragons, Arclight/Emberlight vs demons, Tbow always). Force them past the
 * top-K cap so a dragon budget always considers the DHCB even though its raw
 * bonuses don't dominate. Returns ids present in the affordable set.
 */
function forcedWeaponIds(affordable: Set<number>, target: MonsterCatalogEntry): number[] {
  const attrs = target.attributes;
  const out: number[] = [];
  if (attrs.includes("dragon")) {
    out.push(...ownedTriggerIds(affordable, "DRAGON_HUNTER_CROSSBOW"));
    out.push(...ownedTriggerIds(affordable, "DRAGON_HUNTER_LANCE"));
    out.push(...ownedTriggerIds(affordable, "DRAGON_HUNTER_WAND"));
  }
  if (attrs.includes("demon")) {
    out.push(...ownedTriggerIds(affordable, "ARCLIGHT"));
    out.push(...ownedTriggerIds(affordable, "EMBERLIGHT"));
  }
  out.push(...ownedTriggerIds(affordable, "TWISTED_BOW")); // scales with target magic
  return out;
}

/**
 * Non-weapon conditional items whose bonus the per-slot scorer can't see:
 * Salve variants (undead) in the neck slot, elemental tomes (magic) in the
 * shield slot. Returns ids present in the affordable set.
 */
function forcedNonWeaponIds(affordable: Set<number>, target: MonsterCatalogEntry): number[] {
  const attrs = target.attributes;
  const out: number[] = [];
  if (attrs.includes("undead")) {
    out.push(...ownedTriggerIds(affordable, "SALVE_AMULET_EI"));
    out.push(...ownedTriggerIds(affordable, "SALVE_AMULET_E"));
    out.push(...ownedTriggerIds(affordable, "SALVE_AMULET_I"));
    out.push(...ownedTriggerIds(affordable, "SALVE_AMULET"));
  }
  out.push(...ownedTriggerIds(affordable, "TOME_OF_FIRE_CHARGED"));
  out.push(...ownedTriggerIds(affordable, "TOME_OF_WATER_CHARGED"));
  out.push(...ownedTriggerIds(affordable, "TOME_OF_EARTH_CHARGED"));
  return out;
}

const TOME_IDS = new Set<number>([
  ...BONUS_TRIGGER_VARIANTS.TOME_OF_FIRE_CHARGED,
  ...BONUS_TRIGGER_VARIANTS.TOME_OF_WATER_CHARGED,
  ...BONUS_TRIGGER_VARIANTS.TOME_OF_EARTH_CHARGED,
]);

/** Sum the GE price of a list of item ids (+ any internal ammo). */
function totalCost(ids: number[], internalAmmoId: number | undefined, priceLookup: PriceLookup): number {
  let t = 0;
  for (const id of ids) {
    const p = priceLookup(id);
    if (p !== null) t += p;
  }
  if (internalAmmoId !== undefined) {
    const p = priceLookup(internalAmmoId);
    if (p !== null) t += p;
  }
  return t;
}

/**
 * Budget-constrained greedy slot fill for one (weapon, style) anchor.
 *
 * Picks at most one item per non-weapon slot to maximise total DPS proxy within
 * the remaining budget. Uses a refundable efficiency greedy: each round applies
 * the (slot, item) with the best score-gain per extra GP that fits the budget,
 * treating the slot's current pick as refundable so swaps never waste GP. This
 * converges toward the best affordable single-choice-per-slot combination.
 */
function budgetGreedyFill(
  ws: WeaponStyleCandidate,
  bySlot: Map<LoadoutSlotKey, ItemCatalogEntry[]>,
  budget: number,
  priceLookup: PriceLookup,
): { ids: number[]; internalAmmoId?: number } {
  const priceOf = (it: ItemCatalogEntry) => priceLookup(it.id) ?? Infinity;
  const meleeStrForRanged = rangedDamageUsesMeleeStrength(ws.weapon.id);
  const score = (it: ItemCatalogEntry) => itemScore(it, ws.attackType, ws.combatStyle, meleeStrForRanged);
  const ids: number[] = [ws.weapon.id];
  let remaining = budget;

  // Blowpipe internal dart — best affordable dart by ranged strength.
  let internalAmmoId: number | undefined;
  if (INTERNAL_AMMO_WEAPONS.has(ws.weapon.id)) {
    const darts = (bySlot.get("weapon") ?? [])
      .filter((i) => AMMO_TYPES[i.name]?.class === "dart" && priceOf(i) <= remaining)
      .sort((a, b) => b.rangedStr - a.rangedStr);
    if (darts[0]) {
      internalAmmoId = darts[0].id;
      remaining -= priceOf(darts[0]);
    }
  }

  const chosen: Partial<Record<LoadoutSlotKey, ItemCatalogEntry>> = {};
  const slotCands = new Map<LoadoutSlotKey, ItemCatalogEntry[]>();

  for (const slot of NON_WEAPON_SLOTS) {
    if (slot === "shield" && ws.weapon.isTwoHanded) continue;
    // Free prayer-ammo slot: melee/magic weapons and self-ammo ranged weapons
    // don't fire a separate projectile, so fill the ammo slot with the best
    // affordable prayer item (blessing) at zero DPS cost — mirrors bank.ts.
    if (slot === "ammo" && (SELF_AMMO_WEAPON_CATEGORIES.has(ws.weapon.category) || ws.combatStyle !== "ranged")) {
      const prayerPool = (bySlot.get("ammo") ?? []).filter((a) => a.prayer > 0 && priceOf(a) <= remaining);
      if (prayerPool.length > 0) {
        const bestPrayer = prayerPool.reduce((b, a) => (a.prayer > b.prayer ? a : b));
        chosen.ammo = bestPrayer;
        remaining -= priceOf(bestPrayer);
      }
      continue;
    }
    let pool = bySlot.get(slot) ?? [];
    if (slot === "ammo") {
      pool = pool.filter((a) => checkAmmoCompatWithCategory(ws.weapon.name, ws.weapon.category, a.name).ok);
    }
    // Only DPS-relevant items are worth spending GP on (positive str/offence).
    pool = pool.filter((it) => score(it) > 0);
    if (pool.length > 0) slotCands.set(slot, pool);
  }

  // Refundable efficiency greedy. Strictly increases total score each round, so
  // it terminates; an Infinity efficiency (cheaper-or-equal upgrade) is taken first.
  for (;;) {
    let bestSlot: LoadoutSlotKey | null = null;
    let bestItem: ItemCatalogEntry | null = null;
    let bestEff = 0;
    let bestGain = 0;
    for (const [slot, pool] of slotCands) {
      const cur = chosen[slot];
      const curPrice = cur ? priceOf(cur) : 0;
      const curScore = cur ? score(cur) : 0;
      const budgetForSlot = remaining + curPrice; // current pick is refundable
      for (const cand of pool) {
        const p = priceOf(cand);
        if (p > budgetForSlot) continue;
        const gain = score(cand) - curScore;
        if (gain <= 0) continue;
        const incCost = p - curPrice;
        const eff = incCost > 0 ? gain / incCost : Infinity;
        if (eff > bestEff || (eff === bestEff && gain > bestGain)) {
          bestEff = eff;
          bestGain = gain;
          bestSlot = slot;
          bestItem = cand;
        }
      }
    }
    if (!bestSlot || !bestItem) break;
    const prevPrice = chosen[bestSlot] ? priceOf(chosen[bestSlot]!) : 0;
    remaining = remaining + prevPrice - priceOf(bestItem);
    chosen[bestSlot] = bestItem;
  }

  for (const it of Object.values(chosen)) {
    if (it) ids.push(it.id);
  }
  return { ids, internalAmmoId };
}

const EMPTY_RESULT = (gp: number): BudgetResult => ({
  currentBest: null,
  upgradedBest: null,
  upgradePath: [],
  totalCostGp: 0,
  totalDpsDelta: 0,
  sellList: [],
  remainingGp: gp,
  shoppingList: [],
  fromScratch: true,
});

/**
 * Build the best loadout purchasable for `gp`, ignoring the bank entirely.
 * Returns a BudgetResult-shaped object: `upgradedBest` is the built loadout,
 * `shoppingList` is every item to buy, and `currentBest` is null (no "before").
 */
export function bestLoadoutForBudget(input: BudgetBuildInput): BudgetResult {
  if (input.gp <= 0) return EMPTY_RESULT(input.gp);
  const priceOf = (it: ItemCatalogEntry) => input.priceLookup(it.id) ?? Infinity;

  // Affordable, equippable, tradeable catalog — the purchasable universe.
  const affordable = ITEM_CATALOG.filter(
    (it) => meetsRequirements(it, input.skills) && priceOf(it) <= input.gp,
  );
  if (affordable.length === 0) return EMPTY_RESULT(input.gp);

  const bySlot = new Map<LoadoutSlotKey, ItemCatalogEntry[]>();
  for (const it of affordable) {
    const slot = loadoutSlotFor(it);
    const list = bySlot.get(slot) ?? [];
    list.push(it);
    bySlot.set(slot, list);
  }
  const weapons = bySlot.get("weapon") ?? [];
  if (weapons.length === 0) return EMPTY_RESULT(input.gp);

  // Bound the anchor count: keep the top-K affordable weapons per combat style,
  // then always add applicable conditional weapons past the cap.
  const affordableIds = new Set(affordable.map((i) => i.id));
  const keptWeaponIds = new Set<number>();
  for (const style of STYLES) {
    const styleWeapons = weapons
      .filter((w) => bestWeaponScore(w, style) > 0)
      .sort((a, b) => bestWeaponScore(b, style) - bestWeaponScore(a, style));
    for (const w of styleWeapons.slice(0, WEAPONS_PER_STYLE)) keptWeaponIds.add(w.id);
  }
  for (const id of forcedWeaponIds(affordableIds, input.target)) keptWeaponIds.add(id);
  // Always consider affordable charged weapons (powered staves, tridents, the
  // blowpipe, BoFA, wilderness weapons). Their powered-staff / fast-hit damage
  // is invisible to the itemScore proxy, so the top-K cap would otherwise drop
  // them — yet they're frequent budget BIS once priced at the uncharged value.
  for (const w of weapons) {
    if (UNCHARGED_PRICE_ID.has(w.id)) keptWeaponIds.add(w.id);
  }

  const anchors = enumerateWeaponStyles(weapons.filter((w) => keptWeaponIds.has(w.id)));

  type Cand = { ids: number[]; internalAmmoId?: number; ws: WeaponStyleCandidate };
  const cands: Cand[] = [];
  for (const anchor of anchors) {
    const wp = priceOf(anchor.weapon);
    if (wp > input.gp) continue;
    const build = budgetGreedyFill(anchor, bySlot, input.gp - wp, input.priceLookup);
    cands.push({ ids: build.ids, internalAmmoId: build.internalAmmoId, ws: anchor });
  }

  // Non-weapon force variants (Salve neck on undead, elemental tome shield on
  // magic). Swap the forced item into its slot when it still fits the budget;
  // scoreScenario then prices the conditional multiplier honestly.
  const forcedNW = forcedNonWeaponIds(affordableIds, input.target);
  if (forcedNW.length > 0) {
    const snapshot = [...cands];
    for (const fid of forcedNW) {
      const fitem = ITEM_BY_ID.get(fid);
      if (!fitem) continue;
      const fslot = loadoutSlotFor(fitem);
      const fprice = priceOf(fitem);
      const isTome = TOME_IDS.has(fid);
      for (const c of snapshot) {
        if (isTome && c.ws.combatStyle !== "magic") continue;
        if (fslot === "shield" && c.ws.weapon.isTwoHanded) continue;
        const curCost = totalCost(c.ids, c.internalAmmoId, input.priceLookup);
        const displacedId = c.ids.find((id) => {
          const it = ITEM_BY_ID.get(id);
          return it !== undefined && loadoutSlotFor(it) === fslot;
        });
        const displacedPrice = displacedId !== undefined ? (input.priceLookup(displacedId) ?? 0) : 0;
        if (curCost - displacedPrice + fprice > input.gp) continue;
        const ids = c.ids.filter((id) => {
          const it = ITEM_BY_ID.get(id);
          return !it || loadoutSlotFor(it) !== fslot;
        });
        ids.push(fid);
        cands.push({ ids, internalAmmoId: c.internalAmmoId, ws: c.ws });
      }
    }
  }

  // Enchanted-bolt branches for crossbow candidates. The greedy ammo pick ranks
  // by raw ranged strength and so misses proc bolts (Diamond/Ruby/etc.), whose
  // value scoreScenario prices. Branch once per applicable proc effect that fits
  // the budget — this is what lets a constrained Vorkath build pick DHCB +
  // Diamond bolts (e) rather than a plain high-strength bolt.
  const boltBranches: Cand[] = [];
  for (const c of cands) {
    if (c.ws.weapon.category !== "Crossbow" || c.ws.combatStyle !== "ranged") continue;
    const procBolts = (bySlot.get("ammo") ?? []).filter((a) => {
      const effect = BOLT_EFFECT_BY_ITEM_ID.get(a.id);
      if (!effect) return false;
      if (!boltEffectApplies(effect, input.target.attributes)) return false;
      return checkAmmoCompatWithCategory(c.ws.weapon.name, c.ws.weapon.category, a.name).ok;
    });
    if (procBolts.length === 0) continue;
    const bestPerEffect = new Map<BoltEffect, ItemCatalogEntry>();
    for (const bolt of procBolts) {
      const effect = BOLT_EFFECT_BY_ITEM_ID.get(bolt.id)!;
      const cur = bestPerEffect.get(effect);
      if (!cur || bolt.rangedStr > cur.rangedStr) bestPerEffect.set(effect, bolt);
    }
    const baseCost = totalCost(c.ids, c.internalAmmoId, input.priceLookup);
    const curAmmoId = c.ids.find((id) => {
      const it = ITEM_BY_ID.get(id);
      return it !== undefined && loadoutSlotFor(it) === "ammo";
    });
    const curAmmoPrice = curAmmoId !== undefined ? (input.priceLookup(curAmmoId) ?? 0) : 0;
    for (const bolt of bestPerEffect.values()) {
      if (baseCost - curAmmoPrice + (input.priceLookup(bolt.id) ?? 0) > input.gp) continue;
      const withoutAmmo = c.ids.filter((id) => {
        const it = ITEM_BY_ID.get(id);
        return !it || loadoutSlotFor(it) !== "ammo";
      });
      boltBranches.push({ ids: [...withoutAmmo, bolt.id], internalAmmoId: c.internalAmmoId, ws: c.ws });
    }
  }
  cands.push(...boltBranches);

  const scoredCands: { scored: Extract<ScoredScenario, { valid: true }>; cost: number }[] = [];

  // Source B: the budget-greedy candidates (constraint-aware; the only source
  // when no full-quality build fits the budget).
  for (const c of cands) {
    const spell = autoPickSpell(
      c.ws.weapon,
      c.ids,
      c.ws.combatStyle,
      input.skills.magic,
      input.target,
      input.baseSpellMaxHit,
      input.spellElement,
    );
    const scored = scoreScenario({
      itemIds: c.ids,
      internalAmmoId: c.internalAmmoId,
      target: input.target,
      skills: input.skills,
      attackStyle: { attackType: c.ws.attackType, choice: c.ws.choice },
      baseSpellMaxHit: spell.baseSpellMaxHit,
      spellElement: spell.spellElement,
      autoSpellName: spell.autoSpellName,
      boostResolver: input.boostResolver,
      onTask: input.onTask,
    });
    if (!scored.valid || scored.dps.dps <= 0) continue;
    const cost = totalCost(c.ids, c.internalAmmoId, input.priceLookup);
    if (cost > input.gp) continue; // safety — greedy already respects the budget
    scoredCands.push({ scored, cost });
  }

  // Source A: full-quality builds from optimizeForBoss over a trimmed affordable
  // pseudo-bank. optimizeForBoss has the bolt-proc / force-include / spell-pick
  // branches the per-slot proxy lacks, so whenever one of its builds fits the
  // budget it dominates — recovering the true BIS at generous budgets (e.g. the
  // DHCB + Diamond bolts (e) Vorkath setup). It ignores the sum-budget, so we
  // keep only the rankings that actually fit.
  const pseudoBank = new Set<number>(keptWeaponIds);
  const PER_SLOT = 12;
  for (const slot of NON_WEAPON_SLOTS) {
    const pool = bySlot.get(slot) ?? [];
    for (const style of STYLES) {
      const at = attackTypeForStyle(style);
      const ranked = [...pool].sort((a, b) => itemScore(b, at, style) - itemScore(a, at, style));
      for (const it of ranked.slice(0, PER_SLOT)) pseudoBank.add(it.id);
    }
  }
  for (const id of forcedNonWeaponIds(affordableIds, input.target)) pseudoBank.add(id);
  for (const a of bySlot.get("ammo") ?? []) {
    if (BOLT_EFFECT_BY_ITEM_ID.has(a.id)) pseudoBank.add(a.id);
  }

  const aRankings = optimizeForBoss({
    bank: pseudoBank,
    target: input.target,
    skills: input.skills,
    topN: 50,
    boostResolver: input.boostResolver,
    onTask: input.onTask,
    baseSpellMaxHit: input.baseSpellMaxHit,
    spellElement: input.spellElement,
  }).rankings;
  for (const r of aRankings) {
    if (r.dps.dps <= 0) continue;
    const ids = Object.values(r.loadout.slots).map((s) => s.itemId);
    const cost = totalCost(ids, r.loadout.internalAmmo?.itemId, input.priceLookup);
    if (cost > input.gp) continue;
    scoredCands.push({ scored: r, cost });
  }

  let best: { scored: Extract<ScoredScenario, { valid: true }>; cost: number } | null = null;
  for (const sc of scoredCands) {
    if (!best || sc.scored.dps.dps > best.scored.dps.dps) best = sc;
  }
  if (!best) return EMPTY_RESULT(input.gp);

  // Shopping list = every purchased slot item (+ internal ammo), priciest first.
  const shoppingList: ItemValue[] = [];
  for (const s of Object.values(best.scored.loadout.slots)) {
    const p = input.priceLookup(s.itemId);
    if (p === null) continue;
    shoppingList.push({ itemId: s.itemId, name: s.itemName, valueGp: p });
  }
  const ia = best.scored.loadout.internalAmmo;
  if (ia) {
    const p = input.priceLookup(ia.itemId);
    if (p !== null) shoppingList.push({ itemId: ia.itemId, name: ia.itemName, valueGp: p });
  }
  shoppingList.sort((a, b) => b.valueGp - a.valueGp);

  return {
    currentBest: null,
    upgradedBest: best.scored,
    upgradePath: [],
    totalCostGp: best.cost,
    totalDpsDelta: 0,
    sellList: [],
    remainingGp: input.gp - best.cost,
    shoppingList,
    fromScratch: true,
  };
}
