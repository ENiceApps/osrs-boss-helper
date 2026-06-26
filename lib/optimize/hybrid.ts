// Hybrid armor / armor-switching optimizer.
//
// Given the player's bank + a boss + a chosen set of combat styles + a "switch
// budget", build the gear configuration that maximises BLENDED dps across those
// styles while sharing as much armor as the budget allows.
//
// The dial is the switch budget N = number of equipment slots permitted to differ
// across styles. The weapon (with its style-owned offhand/ammo) always differs, so
// it always consumes 1 — you can't attack two styles with one weapon. Every extra
// point of budget unlocks one ARMOR slot to go per-style-optimal. So:
//   N = 1  → swap weapon only, all 8 armor slots shared        (a "mixed hide" set)
//   N = 2  → weapon + 1 armor slot (e.g. Void's per-style helm)
//   N = 9  → weapon + all 8 armor slots = today's independent per-style optima
//
// Objective: maximise  Σ_s w_s · DPS_s(loadout_s)  subject to (#switched slots) ≤ N,
// where w_s are user-supplied style weights (default equal). DPS-only — survivability
// is out of scope for v1 (defence is only the existing zero-DPS-cost tiebreak inside
// the per-slot scorer).
//
// Design notes:
//   • Weapon, ammo, and shield are "style-owned" — each style keeps the weapon/
//     offhand/ammo from its own independent best build. You swap your offhand and
//     ammo together with your weapon in-game, so they fold into the one mandatory
//     weapon switch rather than counting separately. Only the 8 armor/jewelry slots
//     {head, cape, neck, body, legs, hands, feet, ring} are shareable and counted.
//   • Per-slot candidates come from each style's independent-best loadout. For a
//     DPS-only objective that's the correct pool: cross-style armor contributes ~0
//     to the "wrong" style, so the best shared item in a slot is always one of the
//     styles' own picks (no hybrid-tank compromise pieces to weigh — that's the
//     survivability case we deferred).
//   • Greedy, matching the rest of the optimizer (bank.ts): build the fully-shared
//     base, then spend the budget by repeatedly unlocking the slot with the largest
//     marginal blended-DPS gain. Set bonuses (Void) are re-detected on every
//     scoreScenario call, so unlocking the head to per-style Void helms is found
//     automatically when Void is each style's best armor.

import { findCatalogItem } from "@/lib/loadout-edit";
import { availableHybridSets, type ResolvedHybridSet } from "@/data/hybrid-sets";
import { autoPickSpell, optimizeForBoss } from "@/lib/optimize/bank";
import { scoreScenario, type ScoredScenario } from "@/lib/optimize/scenario";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { BoostResolver } from "@/lib/dps/boost";
import type { CombatStyle, Skills, SpellElement } from "@/types/osrs";
import type {
  LoadoutSet,
  LoadoutSlotComputed,
  LoadoutSlotKey,
} from "@/types/loadout";

type ValidScenario = Extract<ScoredScenario, { valid: true }>;

/**
 * Slots that can be shared or switched, and that count as a "click" when they
 * differ across styles. Includes the shield: it's a separate inventory click, so
 * it counts (a 2H weapon simply can't hold one — handled in scoring). The weapon
 * is counted separately (always differs). Ammo is NOT here — see STYLE_OWNED_SLOTS.
 */
export const HYBRID_ARMOR_SLOTS: readonly LoadoutSlotKey[] = [
  "head", "cape", "neck", "body", "legs", "hands", "feet", "ring", "shield",
];

/**
 * Style-owned, FREE slots — never counted as a switch. Only ammo: you leave the
 * ranged ammo (or a blessing) in the slot the whole fight, so it's never a click.
 */
const STYLE_OWNED_SLOTS: readonly LoadoutSlotKey[] = ["ammo"];

export interface HybridOptimizerInput {
  bank: Set<number> | number[];
  target: MonsterCatalogEntry;
  skills: Skills;
  /** Styles to blend — any subset of melee/ranged/magic. Hybrid is meaningful for ≥2. */
  styles: CombatStyle[];
  /** Max number of slots allowed to differ across styles (weapon counts; ≥1). */
  switchBudget: number;
  /** Per-style time-share weights. Missing styles default to 1; normalized to sum 1. */
  weights?: Partial<Record<CombatStyle, number>>;
  boostResolver?: BoostResolver;
  onTask?: boolean;
  soulreaperMaxStacks?: boolean;
  requiresMeleeReach2?: boolean;
  /** Magic fallbacks (normally left unset — the engine auto-picks the spell). */
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
}

export interface HybridStyleResult {
  loadout: LoadoutSet;
  dps: number;
  /** Weight applied to this style in the blend. */
  weight: number;
  /** Armor slots where this style's item differs from the shared base. */
  switchedSlots: LoadoutSlotKey[];
}

export interface HybridLoadout {
  styles: CombatStyle[];
  weights: Record<string, number>;
  switchBudget: number;
  /** Actual number of differing slots = 1 (weapon) + unlocked armor slots. */
  switchCount: number;
  /** The armor shared across every style. */
  sharedSlots: Partial<Record<LoadoutSlotKey, LoadoutSlotComputed>>;
  /** Per-style resolved loadout, DPS, and which slots it switches. */
  perStyle: Partial<Record<CombatStyle, HybridStyleResult>>;
  /** Σ w_s · DPS_s — the value being maximised. */
  blendedDps: number;
}

export interface HybridResult {
  hybrid: HybridLoadout | null;
  diagnostics: {
    stylesRequested: CombatStyle[];
    stylesBuilt: CombatStyle[];
    scenariosScored: number;
  };
}

/**
 * Per-style "anchor": the weapon + style-owned slots + this style's independent-best
 * armor item per slot, derived from optimizeForBoss's best build for the style.
 */
interface StyleAnchor {
  style: CombatStyle;
  weaponId: number;
  attackStyle: { attackType: LoadoutSet["attackType"]; choice: LoadoutSet["attackStyleChoice"] };
  internalAmmoId?: number;
  /** Whether the weapon is two-handed — a 2H weapon can't equip a shield. */
  isTwoHanded: boolean;
  /** Style-owned FREE slot items (ammo) carried verbatim into every scored loadout. */
  ownedItemIds: number[];
  /** This style's best item per shareable slot (incl. shield, when 1H). */
  bestArmor: Map<LoadoutSlotKey, number>;
  /** This style's independent-best (full-switch) DPS. */
  baseDps: number;
}

function buildAnchor(scored: ValidScenario): StyleAnchor | null {
  const l = scored.loadout;
  const weaponId = l.slots.weapon?.itemId;
  if (weaponId === undefined) return null;

  const ownedItemIds: number[] = [];
  for (const slot of STYLE_OWNED_SLOTS) {
    const id = l.slots[slot]?.itemId;
    if (id !== undefined) ownedItemIds.push(id);
  }

  const bestArmor = new Map<LoadoutSlotKey, number>();
  for (const slot of HYBRID_ARMOR_SLOTS) {
    const id = l.slots[slot]?.itemId;
    if (id !== undefined) bestArmor.set(slot, id);
  }

  return {
    style: l.style,
    weaponId,
    attackStyle: { attackType: l.attackType, choice: l.attackStyleChoice },
    internalAmmoId: l.internalAmmo?.itemId,
    isTwoHanded: findCatalogItem(weaponId)?.isTwoHanded ?? false,
    ownedItemIds,
    bestArmor,
    baseDps: scored.dps.dps,
  };
}

/**
 * The item this style equips in an armor slot under a given (unlocked, shared) state:
 * its own best item if the slot is unlocked, else the shared item (may be absent).
 */
function armorItemFor(
  anchor: StyleAnchor,
  slot: LoadoutSlotKey,
  unlocked: ReadonlySet<LoadoutSlotKey>,
  shared: ReadonlyMap<LoadoutSlotKey, number>,
): number | undefined {
  return unlocked.has(slot) ? anchor.bestArmor.get(slot) : shared.get(slot);
}

/**
 * The single item that stays in the ammo slot for EVERY style — it's never a
 * switch. Prefer real ranged ammo (when a ranged style fires from the ammo slot
 * you leave its bolts/arrows in place for the whole fight); otherwise a blessing
 * if one is owned. Returns undefined when nothing belongs there.
 */
function pickSharedAmmo(anchors: StyleAnchor[]): number | undefined {
  let blessing: number | undefined;
  for (const a of anchors) {
    for (const id of a.ownedItemIds) {
      const it = findCatalogItem(id);
      if (!it) continue;
      if (it.rangedStr > 0 || it.attackRanged > 0) return it.id; // real ammo — always keep it on
      if (it.prayer > 0 && blessing === undefined) blessing = it.id;
    }
  }
  return blessing;
}

export function optimizeHybrid(input: HybridOptimizerInput): HybridResult {
  const requested = dedupeStyles(input.styles);

  // Step 1: per-style independent optima → anchors. One optimizeForBoss run, bucketed.
  const bankArr = input.bank instanceof Set ? [...input.bank] : input.bank;
  const ranked = optimizeForBoss({
    bank: bankArr,
    target: input.target,
    skills: input.skills,
    topN: 500,
    boostResolver: input.boostResolver,
    onTask: input.onTask,
    soulreaperMaxStacks: input.soulreaperMaxStacks,
    requiresMeleeReach2: input.requiresMeleeReach2,
    baseSpellMaxHit: input.baseSpellMaxHit,
    spellElement: input.spellElement,
  }).rankings;

  const bestPerStyle = new Map<CombatStyle, ValidScenario>();
  for (const r of ranked) {
    const st = r.loadout.style;
    if (!requested.includes(st)) continue;
    const cur = bestPerStyle.get(st);
    if (!cur || r.dps.dps > cur.dps.dps) bestPerStyle.set(st, r);
  }

  const anchors: StyleAnchor[] = [];
  for (const st of requested) {
    const scored = bestPerStyle.get(st);
    if (!scored) continue; // bank can't perform this style — drop it
    const a = buildAnchor(scored);
    if (a) anchors.push(a);
  }

  const built = anchors.map((a) => a.style);
  const diagnostics = {
    stylesRequested: requested,
    stylesBuilt: built,
    scenariosScored: 0,
  };
  if (anchors.length === 0) return { hybrid: null, diagnostics };

  const weights = normalizeWeights(anchors, input.weights);

  // Step 2: candidate anchor-sets — the generic per-style optima, plus a re-geared
  // copy for each hybrid set in the bank (Void etc.). The re-geared candidates let
  // a low-switch set hybrid be weighed against the generic build even when the set
  // is no style's independent best (the generic seeds would never try it).
  const anchorSets: StyleAnchor[][] = [anchors];
  for (const set of availableHybridSets(new Set(bankArr), built)) {
    anchorSets.push(regearAnchors(anchors, set));
  }

  let best: HybridLoadout | null = null;
  let scenariosScored = 0;
  for (const set of anchorSets) {
    const r = solveHybrid(set, weights, input);
    scenariosScored += r.scenariosScored;
    if (!best || r.hybrid.blendedDps > best.blendedDps) best = r.hybrid;
  }

  diagnostics.scenariosScored = scenariosScored;
  return { hybrid: best, diagnostics };
}

/** Re-gear the per-style anchors to a hybrid set's pieces (shared armor + per-style helm). */
function regearAnchors(anchors: StyleAnchor[], set: ResolvedHybridSet): StyleAnchor[] {
  return anchors.map((a) => {
    const sw = set.switchByStyle.get(a.style);
    if (!sw) return a; // style not covered by this set → leave it on its own gear
    const bestArmor = new Map(a.bestArmor);
    for (const [slot, id] of set.shared) bestArmor.set(slot, id);
    bestArmor.set(sw.slot, sw.itemId);
    return { ...a, bestArmor };
  });
}

interface SolveResult {
  hybrid: HybridLoadout;
  scenariosScored: number;
}

/**
 * Given a fixed set of per-style anchors, build the best shared base and spend the
 * switch budget. Used once for the generic per-style optima and once per hybrid-set
 * re-gearing; the caller keeps whichever blends to the highest DPS.
 */
function solveHybrid(
  anchors: StyleAnchor[],
  weights: Record<string, number>,
  input: HybridOptimizerInput,
): SolveResult {
  const built = anchors.map((a) => a.style);
  let scenariosScored = 0;

  // Per-style DPS for a (unlocked, shared) state.
  const scoreState = (
    unlocked: ReadonlySet<LoadoutSlotKey>,
    shared: ReadonlyMap<LoadoutSlotKey, number>,
  ): Map<CombatStyle, { dps: number; scored: ValidScenario | null }> => {
    const out = new Map<CombatStyle, { dps: number; scored: ValidScenario | null }>();
    for (const anchor of anchors) {
      const ids: number[] = [anchor.weaponId, ...anchor.ownedItemIds];
      for (const slot of HYBRID_ARMOR_SLOTS) {
        if (slot === "shield" && anchor.isTwoHanded) continue; // 2H can't hold a shield
        const id = armorItemFor(anchor, slot, unlocked, shared);
        if (id !== undefined) ids.push(id);
      }
      const spell = anchor.style === "magic"
        ? autoPickSpell(
            findCatalogItem(anchor.weaponId)!,
            ids,
            "magic",
            input.skills.magic,
            input.target,
            input.baseSpellMaxHit,
            input.spellElement,
          )
        : { baseSpellMaxHit: input.baseSpellMaxHit, spellElement: input.spellElement, autoSpellName: undefined };
      const scored = scoreScenario({
        itemIds: ids,
        internalAmmoId: anchor.internalAmmoId,
        target: input.target,
        skills: input.skills,
        attackStyle: anchor.attackStyle,
        baseSpellMaxHit: spell.baseSpellMaxHit,
        spellElement: spell.spellElement,
        autoSpellName: spell.autoSpellName,
        boostResolver: input.boostResolver,
        onTask: input.onTask,
        soulreaperMaxStacks: input.soulreaperMaxStacks,
      });
      scenariosScored++;
      out.set(anchor.style, scored.valid ? { dps: scored.dps.dps, scored } : { dps: 0, scored: null });
    }
    return out;
  };

  const blendedOf = (state: Map<CombatStyle, { dps: number; scored: ValidScenario | null }>): number => {
    let total = 0;
    for (const anchor of anchors) total += (weights[anchor.style] ?? 0) * (state.get(anchor.style)?.dps ?? 0);
    return total;
  };

  // Step 3: build the fully-shared base. Greedy-from-empty can't assemble set
  // bonuses (Void pieces have weak raw stats until the whole set is present, so
  // each piece looks like a DPS loss added alone). Instead SEED the base with each
  // style's full armor in turn and greedily improve each slot, then keep whichever
  // seed yields the best blended DPS. This preserves set structure the way the
  // single-style optimizer's armor-set force-includes do: the shared Void
  // body/legs/gloves survive, so later unlocking just the helm completes each
  // style's set.
  const unlocked = new Set<LoadoutSlotKey>();
  const slotCandidates = new Map<LoadoutSlotKey, number[]>();
  for (const slot of HYBRID_ARMOR_SLOTS) {
    const ids = new Set<number>();
    for (const anchor of anchors) {
      const id = anchor.bestArmor.get(slot);
      if (id !== undefined) ids.add(id);
    }
    if (ids.size > 0) slotCandidates.set(slot, [...ids]);
  }

  // Seed the base from each style's full armor in this anchor set (the set has
  // already been re-geared by the caller when it's a hybrid-set candidate).
  const seedMaps: Map<LoadoutSlotKey, number>[] = anchors.map((a) => new Map(a.bestArmor));

  // A shared shield can only be worn by every style when none is two-handed.
  // If any selected style is 2H, the shared base keeps the shield empty (0 clicks)
  // and the shield becomes a real switch via the unlock step below.
  const anyTwoHanded = anchors.some((a) => a.isTwoHanded);

  let shared = new Map<LoadoutSlotKey, number>();
  let sharedBlended = -Infinity;
  for (const seedMap of seedMaps) {
    const cand = new Map<LoadoutSlotKey, number>(seedMap);
    // Greedy slot improvement: for each slot try "none" + every style's item.
    for (const slot of HYBRID_ARMOR_SLOTS) {
      const options: (number | undefined)[] =
        slot === "shield" && anyTwoHanded
          ? [undefined]
          : [undefined, ...(slotCandidates.get(slot) ?? [])];
      let bestId: number | undefined;
      let bestB = -Infinity;
      for (const id of options) {
        if (id === undefined) cand.delete(slot); else cand.set(slot, id);
        const b = blendedOf(scoreState(unlocked, cand));
        if (b > bestB) { bestB = b; bestId = id; }
      }
      if (bestId === undefined) cand.delete(slot); else cand.set(slot, bestId);
    }
    const b = blendedOf(scoreState(unlocked, cand));
    if (b > sharedBlended) { sharedBlended = b; shared = cand; }
  }

  // Step 4: spend the budget. switchCount = 1 (weapon) + unlocked armor slots.
  // A slot is only worth unlocking if the styles actually differ there.
  const differingSlots = HYBRID_ARMOR_SLOTS.filter(
    (slot) => new Set(anchors.map((a) => a.bestArmor.get(slot))).size > 1,
  );
  const armorBudget = Math.max(0, input.switchBudget - 1); // weapon consumes 1

  let currentBlended = blendedOf(scoreState(unlocked, shared));
  if (armorBudget >= differingSlots.length) {
    // Budget covers every differing slot → full per-style switching. Unlock them
    // all at once. This is exact (each style reaches its independent optimum) and
    // sidesteps the marginal-greedy's blind spot for thresholded gains, where
    // several sub-max-hit strength swaps each look like 0 gain alone but add up.
    for (const slot of differingSlots) unlocked.add(slot);
    currentBlended = blendedOf(scoreState(unlocked, shared));
  } else {
    // Partial budget → greedily unlock the highest marginal-gain slot each round.
    // Only commit switches that actually pay off (gain > 0) so we never recommend
    // a pointless swap; the budget is a cap, not a quota.
    while (unlocked.size < armorBudget) {
      let bestSlot: LoadoutSlotKey | undefined;
      let bestGain = 1e-9;
      let bestBlended = currentBlended;
      for (const slot of differingSlots) {
        if (unlocked.has(slot)) continue;
        unlocked.add(slot);
        const b = blendedOf(scoreState(unlocked, shared));
        unlocked.delete(slot);
        const gain = b - currentBlended;
        if (gain > bestGain) { bestGain = gain; bestSlot = slot; bestBlended = b; }
      }
      if (!bestSlot) break;
      unlocked.add(bestSlot);
      currentBlended = bestBlended;
    }
  }

  // Step 5: materialize the result.
  const finalState = scoreState(unlocked, shared);
  const sharedSlots: Partial<Record<LoadoutSlotKey, LoadoutSlotComputed>> = {};
  for (const [slot, id] of shared) {
    if (unlocked.has(slot)) continue;
    const item = findCatalogItem(id);
    if (item) sharedSlots[slot] = { itemId: id, itemName: item.name, version: item.version || undefined };
  }

  // The ammo slot is the same for every style — never a switch. Surface it in the
  // shared base (and pin it into each per-style loadout below) so it never reads
  // as a swap, even when ranged keeps real ammo in the slot.
  const sharedAmmoId = pickSharedAmmo(anchors);
  const sharedAmmoSlot = sharedAmmoId !== undefined
    ? (() => {
        const it = findCatalogItem(sharedAmmoId);
        return it ? { itemId: it.id, itemName: it.name, version: it.version || undefined } : undefined;
      })()
    : undefined;
  if (sharedAmmoSlot) sharedSlots.ammo = sharedAmmoSlot;

  const perStyle: Partial<Record<CombatStyle, HybridStyleResult>> = {};
  for (const anchor of anchors) {
    const s = finalState.get(anchor.style);
    if (!s?.scored) continue;
    // Pin every style's ammo slot to the shared ammo so it's never shown as a swap
    // (display-only — the ammo slot doesn't affect melee/magic DPS, and the ranged
    // style already fired its real ammo when its DPS was computed).
    if (sharedAmmoSlot) s.scored.loadout.slots.ammo = sharedAmmoSlot;
    else delete s.scored.loadout.slots.ammo;
    // The switched (per-style) slots this style equips an item in. A 2H style has
    // no shield, so its empty shield isn't listed even though the slot is unlocked.
    const switchedSlots: LoadoutSlotKey[] = [];
    for (const slot of HYBRID_ARMOR_SLOTS) {
      if (!unlocked.has(slot)) continue;
      const styleItem = slot === "shield" && anchor.isTwoHanded ? undefined : anchor.bestArmor.get(slot);
      if (styleItem !== undefined) switchedSlots.push(slot);
    }
    perStyle[anchor.style] = {
      loadout: s.scored.loadout,
      dps: s.dps,
      weight: weights[anchor.style] ?? 0,
      switchedSlots,
    };
  }

  const hybrid: HybridLoadout = {
    styles: built,
    weights,
    switchBudget: input.switchBudget,
    switchCount: 1 + unlocked.size,
    sharedSlots,
    perStyle,
    blendedDps: currentBlended,
  };

  return { hybrid, scenariosScored };
}

function dedupeStyles(styles: CombatStyle[]): CombatStyle[] {
  const order: CombatStyle[] = ["melee", "ranged", "magic"];
  return order.filter((s) => styles.includes(s));
}

function normalizeWeights(
  anchors: StyleAnchor[],
  weights: Partial<Record<CombatStyle, number>> | undefined,
): Record<string, number> {
  const raw: Record<string, number> = {};
  let sum = 0;
  for (const a of anchors) {
    const w = Math.max(0, weights?.[a.style] ?? 1);
    raw[a.style] = w;
    sum += w;
  }
  if (sum <= 0) {
    // All-zero (or absent) → fall back to equal weighting.
    const eq = 1 / anchors.length;
    for (const a of anchors) raw[a.style] = eq;
    return raw;
  }
  for (const a of anchors) raw[a.style] = raw[a.style] / sum;
  return raw;
}
