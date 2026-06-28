"use client";

// The single dynamic boss page that EVERY boss shares (/boss/<slug>). This is
// the app's "cockpit": it loads the player's live bank (or a demo bank), runs
// the bank optimizer for the chosen boss, and wires together the setup / loadout
// / results panels, the budget modes, manual slot edits, the spell & prayer
// pickers, mechanics, spec weapons, and shareable links. Most cross-panel state
// lives here and flows down to the panels as props.

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MONSTER_BY_SLUG, type MonsterCatalogEntry } from "@/data/monsters/catalog";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades, recommendedSellToFund, type BudgetMode } from "@/lib/optimize/budget";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";
import { itemScore, meetsRequirements, loadoutSlotFor } from "@/lib/optimize/bank";
import { applyCombatBoost, bankBoostResolver, boostFromBank } from "@/lib/dps/boost";
import { describeBoltProc, resolveBoltProc } from "@/lib/dps/bolts";
import { mechanicsForBoss } from "@/data/bosses/mechanics";
import { requiresMeleeReach2 } from "@/data/monsters/melee-reach";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { evaluateMechanics } from "@/lib/mechanics";
import { setupMechanicConflicts } from "@/lib/setup-mechanics";
import { activeBonusesForTarget } from "@/lib/loadout";
import { explainSlots } from "@/lib/loadout-explain";
import { compareSlotsVsReference, type SlotVsBank } from "@/lib/loadout-compare";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { useLiveBank } from "@/lib/liveBank";
import { BankConnect } from "@/components/BankConnect";
import { SetupPanel } from "@/components/SetupPanel";
import { BudgetControl } from "@/components/BudgetControl";
import { SellSelectionPanel, type SellableItem } from "@/components/SellSelectionPanel";
import { OwnedUntradeablesPanel, type UntradeableSlotGroup } from "@/components/OwnedUntradeablesPanel";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { LoadoutPanel, type LoadoutTab } from "@/components/LoadoutPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { PRAYER_POTION_4_ID, SARADOMIN_BREW_4_ID } from "@/data/prayer-drain";
import { MechanicsPanel } from "@/components/MechanicsPanel";
import { HybridPanel } from "@/components/HybridPanel";
import { ItemPickerModal } from "@/components/ItemPickerModal";
import { SpellPickerModal } from "@/components/SpellPickerModal";
import { PrayerPickerModal } from "@/components/PrayerPickerModal";
import { prayerById, DEFAULT_PRAYER_ID } from "@/data/prayers";
import { SpecWeaponsPanel } from "@/components/SpecWeaponsPanel";
import { MetaChip, WeaknessBadge, AttributePill, CollapsibleSection } from "@/components/ui";
import { BossStatsPanel } from "@/components/BossStatsPanel";
import { DittoEditorPanel } from "@/components/DittoEditorPanel";
import { wikiIconUrl, wikiPageUrl } from "@/lib/icons";
import { applyOverrides, hasOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { checkAmmoCompatWithCategory } from "@/data/ammo-compatibility";
import { UNCHARGED_PRICE_ID } from "@/data/items/charged-items";
import { NON_PVE_UNTRADEABLE_IDS } from "@/data/items/non-pve-untradeables";
import { openInWikiCalc } from "@/lib/wiki-export";
import { encodeLoadout, decodeLoadout } from "@/lib/share-link";
import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { SPELLS_BY_NAME, type SpellEntry } from "@/data/spells/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { BankContents, CombatStyle, ItemId } from "@/types/osrs";

// Comparison-tab ids: the budget-mode best, or the best build per style.
type LoadoutTabId = "best" | CombatStyle;
const STYLE_TABS: CombatStyle[] = ["melee", "ranged", "magic"];

/** Share-link helper: only encode prayer picks that differ from the default. */
function encodeNonDefaultPrayers(
  prayerIds: Record<CombatStyle, string>,
): Partial<Record<CombatStyle, string>> | undefined {
  const out: Partial<Record<CombatStyle, string>> = {};
  for (const style of STYLE_TABS) {
    if (prayerIds[style] !== DEFAULT_PRAYER_ID[style]) out[style] = prayerIds[style];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// Stable empty pools for the "not connected" state. We deliberately show an
// EMPTY equipment/optimizer state until the plugin syncs, rather than invent a
// loadout from sample data — a first-time visitor should never see gear or DPS
// that isn't really theirs.
const EMPTY_ITEM_IDS = new Set<ItemId>();
const EMPTY_BANK: BankContents = { tagName: "", itemIds: EMPTY_ITEM_IDS };

// Some catalog entries use a degraded/variant item id (Barrows "100/75/…",
// degrade states, ornament ids) that the GE prices don't key — yet the item IS
// tradeable under its base id. Map catalog id → name so Budget mode can fall
// back to the same-named tradeable GE id rather than treating it as untradeable.
const NAME_BY_ID = new Map<number, string>(ITEM_CATALOG.map((it) => [it.id, it.name]));

/** Price for a catalog id: its own GE price, else its same-named tradeable
 *  variant's price (degraded Barrows/Moon/spear ids), else null. */
function priceForCatalogId(
  prices: Parameters<typeof priceForItem>[0],
  geIdByName: Map<string, number>,
  id: number,
): number | null {
  const direct = priceForItem(prices, id);
  if (direct !== null) return direct;
  const name = NAME_BY_ID.get(id);
  const geId = name !== undefined ? geIdByName.get(name) : undefined;
  return geId !== undefined && geId !== id ? priceForItem(prices, geId) : null;
}

// Per Next.js 16 dynamic-routes docs: `params` is now a Promise. Client
// components consume it via React's `use`.
export default function BossPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const baseMonster = MONSTER_BY_SLUG[slug];
  if (!baseMonster) notFound();

  // "Ditto" is the theoretical-boss sandbox: its stats are editable at runtime.
  // We hold an editable copy in state seeded from the catalog defaults and feed
  // THAT to the whole cockpit, so every memo recomputes as the user tweaks. For
  // every other boss `monster` is just the static catalog entry.
  const isDitto = slug === "ditto";
  const [dittoMonster, setDittoMonster] = useState<MonsterCatalogEntry>(baseMonster);
  const monster = isDitto ? dittoMonster : baseMonster;

  // Local bank bridge — see lib/liveBank.ts / lib/localBank.ts. `live` reads the
  // bank file the RuneLite plugin writes on this machine; until you connect that
  // file, `bank` is null and the page runs in Budget mode (no fabricated loadout).
  const live = useLiveBank();
  const bank: BankContents | null = live.bank;
  const [gpManual, setGpManual] = useState(500_000_000);
  // Live GP overrides the manual GP input when the plugin has reported one.
  const gp = live.gp ?? gpManual;
  // Budget mode + sell threshold drive the optimizer; they live here (not in
  // a panel) because the setup rail sets them and the loadout/results columns
  // consume the output. Every change recomputes immediately — no apply button.
  // Default to "budget" so a first-time visitor (no bank synced yet) lands with
  // the budget slider to play with from the start — they can switch to a
  // bank-aware mode once they connect their bank file.
  const [modeRaw, setMode] = useState<BudgetMode>("budget");
  // Sell-to-fund: ids of bank items the player has chosen to liquidate. Seeded
  // from the optimizer's recommendation (see the reseed effect below).
  const [sellSelections, setSellSelections] = useState<Set<number>>(new Set());
  // Upgrade path: items the player toggled OFF (won't buy). Stored with their
  // name so the "excluded" list can render without a catalog lookup. Re-planning
  // happens automatically via the budgetResult memo (excludedItemIds dep).
  const [excludedUpgrades, setExcludedUpgrades] = useState<{ itemId: number; name: string }[]>([]);
  const toggleExcludedUpgrade = useCallback((itemId: number, name: string) => {
    setExcludedUpgrades((prev) =>
      prev.some((e) => e.itemId === itemId)
        ? prev.filter((e) => e.itemId !== itemId)
        : [...prev, { itemId, name }],
    );
  }, []);
  // Budget mode: from-scratch spend, independent of wallet GP. Starts at 10M —
  // a friendly mid-range default a new player can dial up or down right away.
  const [budgetGp, setBudgetGp] = useState(10_000_000);
  // Budget mode: ids of non-tradeable items the player has checked as OWNED.
  // Default empty (own none → all-buyable build); checking an item lets the
  // optimizer use it for free in its slot.
  const [ownedUntradeables, setOwnedUntradeables] = useState<Set<number>>(new Set());
  // Slayer-task assumption. Defaults on (the common bossing context) — gates the
  // imbued black mask / slayer helmet bonus through the optimizer and recompute.
  const [onTask, setOnTask] = useState(true);
  // Trip assumptions for the kills/hr + supply + profit estimates. These are
  // the player-specific factors a calculator can't know, so they're adjustable:
  //  - uptime: share of the hour actually fighting (vs banking/walking/downtime)
  //  - protection prayer: whether a Protect-from prayer runs alongside the offensive one
  //  - brews/hr: food the player actually drinks (damage taken varies wildly per player)
  const [combatUptime, setCombatUptime] = useState(1); // 0..1, default theoretical max
  const [useProtectionPrayer, setUseProtectionPrayer] = useState(true);
  const [brewsPerHour, setBrewsPerHour] = useState(0);
  // Soulreaper axe: assume max 5 stacks (+30% Strength level). Only shown when
  // the axe is in the active loadout's weapon slot.
  const [soulreaperMaxStacks, setSoulreaperMaxStacks] = useState(false);
  // Dharok's set: current HP for the missing-HP max-hit multiplier. undefined
  // means "full HP" (no bonus). Only shown when the full Dharok set is detected.
  const [dharokCurrentHp, setDharokCurrentHp] = useState<number | undefined>(undefined);
  // Per-slot gear overrides on top of the optimizer's best setup. "Reset"
  // clears this map.
  const [overrides, setOverrides] = useState<
    Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>
  >({});
  // Which slot the user clicked → opens ItemPickerModal. null = closed.
  const [pickerSlot, setPickerSlot] = useState<LoadoutSlotKey | null>(null);
  // Manually chosen combat spell (magic loadouts). null = auto-pick by optimizer.
  const [spellOverride, setSpellOverride] = useState<SpellEntry | null>(null);
  const [spellPickerOpen, setSpellPickerOpen] = useState(false);
  // Chosen offensive prayer per combat style. Defaults to the best (Piety /
  // Rigour / Augury); the player can pick a weaker one via the results-rail
  // prayer row, which re-runs DPS and the prayer-pot supply cost.
  const [prayerIds, setPrayerIds] = useState<Record<CombatStyle, string>>({
    ...DEFAULT_PRAYER_ID,
  });
  const [prayerPickerOpen, setPrayerPickerOpen] = useState(false);

  const { data: mapping } = useMapping();
  const { data: prices } = usePrices();

  // GE id keyed by item NAME — lets Budget mode price a catalog entry whose own
  // (degraded/variant) id has no GE price via its same-named tradeable base.
  const geIdByName = useMemo(() => {
    const m = new Map<string, number>();
    if (mapping) for (const e of mapping) if (!m.has(e.name)) m.set(e.name, e.id);
    return m;
  }, [mapping]);

  // Skills come from the live RuneLite plugin when connected, else default 99s.
  const skills = live.skills ?? SKILLS_AT_99;
  const mechanics = useMemo(() => mechanicsForBoss(monster), [monster]);

  // DPS reflects a boost potion ONLY if the player actually owns one for the
  // loadout's style — resolved from the bank, best owned potion wins.
  const boostResolver = useMemo(
    () => bankBoostResolver(bank?.itemIds ?? EMPTY_ITEM_IDS),
    [bank],
  );

  const mechanicEvaluations = useMemo(() => {
    if (!mechanics) return [];
    return evaluateMechanics(mechanics, bank ?? EMPTY_BANK);
  }, [mechanics, bank]);

  const ownedItemIds = useMemo(
    () =>
      bank ? new Set(Array.from(bank.itemIds).map((id) => Number(id))) : new Set<number>(),
    [bank],
  );

  // The on-task bonus can only apply to monsters that are actual Slayer
  // assignments — never for e.g. Corporeal Beast. So the checkbox is disabled
  // (and the bonus forced off) for non-Slayer monsters regardless of its state.
  const effectiveOnTask = onTask && monster.isSlayerMonster;

  // Some bosses can only be meleed with a 2-tile reach weapon — flying monsters
  // (Kree'arra, Dawn, Vespula) and terrain-gapped ones (Zulrah). The optimizer
  // drops normal-melee weapons for them. Stable per boss.
  const meleeReach2 = requiresMeleeReach2(monster);

  // Wilderness boss → unlocks the "Risk it" budget mode. Both "budget" and
  // "wildy-risk" build a from-scratch loadout under a GP cap (spend vs risk).
  const wilderness = isWildernessBoss(monster.slug);
  // "Risk it" mode only exists for wilderness bosses. If the player navigates to
  // a non-wilderness boss while in it, fall back to the equivalent Budget mode —
  // derived (not stored) so we never set state in an effect, mirroring activeTab.
  const mode: BudgetMode = modeRaw === "wildy-risk" && !wilderness ? "budget" : modeRaw;
  const fromScratchMode = mode === "budget" || mode === "wildy-risk";

  // The single optimizer run feeding the whole cockpit: best buildable
  // loadout, plus the budget-mode upgrade path / sell list. (Previously the
  // page ran optimizeForBoss separately for the tweak drawer — one run now.)
  const budgetResult = useMemo(() => {
    // Budget mode ignores the bank entirely, so it works with no plugin
    // connected — build the best loadout for the slider amount from the
    // catalog using default (99) skills when the plugin hasn't synced. Owned
    // non-tradeables are free (0 gp); everything else the player hasn't checked
    // stays at its GE price (or unpriced = excluded), so the builder injects a
    // buyable alternative for any slot where the player owns no non-tradeable.
    if (fromScratchMode) {
      return bestLoadoutForBudget({
        target: monster,
        skills,
        gp: budgetGp,
        priceLookup: (id) => {
          // Charged items (Tumeken's shadow, tridents, …) are worn untradeable
          // but bought uncharged — equip the charged item, price it uncharged.
          const unchargedId = UNCHARGED_PRICE_ID.get(id);
          if (unchargedId !== undefined) return priceForItem(prices, unchargedId);
          if (ownedUntradeables.has(id)) return 0;
          return priceForCatalogId(prices, geIdByName, id);
        },
        boostResolver,
        onTask: effectiveOnTask,
        soulreaperMaxStacks,
        requiresMeleeReach2: meleeReach2,
      });
    }
    if (!bank) return null;
    return findUpgrades({
      bank: ownedItemIds,
      target: monster,
      skills,
      gp,
      mode,
      sellItemIds: [...sellSelections],
      excludedItemIds: excludedUpgrades.map((e) => e.itemId),
      priceLookup: (id) => priceForItem(prices, id),
      boostResolver,
      onTask: effectiveOnTask,
      soulreaperMaxStacks,
      requiresMeleeReach2: meleeReach2,
    });
  }, [bank, ownedItemIds, monster, skills, gp, budgetGp, mode, fromScratchMode, sellSelections, excludedUpgrades, ownedUntradeables, prices, geIdByName, boostResolver, effectiveOnTask, soulreaperMaxStacks, meleeReach2]);

  // Budget/risk mode: per-slot lists of non-tradeable options the player can mark
  // as owned. Ranked by the current build's combat style (stable per boss), with
  // PvP/cosmetic junk filtered out. The optimizer uses whichever owned options
  // are best; unchecked ones aren't available so a buyable item fills the slot.
  const refLoadout = fromScratchMode ? budgetResult?.upgradedBest?.loadout : undefined;
  const refStyle = refLoadout?.style ?? "ranged";
  const refAttackType = refLoadout?.attackType ?? "ranged";
  const refWeaponId = refLoadout?.slots.weapon?.itemId;
  const untradeableOptionsBySlot = useMemo<UntradeableSlotGroup[]>(() => {
    if (!fromScratchMode || !prices) return [];
    const SLOT_ORDER = [
      "weapon", "head", "cape", "neck", "body", "legs", "hands", "feet", "ring", "ammo", "shield",
    ];
    const PER_SLOT = 6;
    const score = (it: ItemCatalogEntry) => itemScore(it, refAttackType, refStyle);
    const better = (a: ItemCatalogEntry, b: ItemCatalogEntry) => {
      if (score(a) !== score(b)) return score(a) > score(b);
      const ap = a.name.includes("("), bp = b.name.includes("(");
      if (ap !== bp) return !ap; // tie → prefer the clean, un-suffixed name
      if (a.name.length !== b.name.length) return a.name.length < b.name.length;
      return a.id < b.id;
    };
    // Two dedupe keys collapse the catalog's variant sprawl to one row per real
    // choice: base name folds tiers/infusions/recolours that SHARE a name
    // (Avernic treads (pe)(et), Crystal bow (perfected)); stat fingerprint folds
    // same-stat items with DIFFERENT names (Dizana's quiver = its max cape =
    // blessed quiver; Ava's assembler = its max cape = Masori assembler).
    const baseName = (name: string) => name.split(" (")[0];
    const statSig = (it: ItemCatalogEntry) =>
      [
        it.attackStab, it.attackSlash, it.attackCrush, it.attackMagic, it.attackRanged,
        it.str, it.rangedStr, it.magicStr, it.prayer, it.speed, it.isTwoHanded ? 1 : 0,
        it.defStab, it.defSlash, it.defCrush, it.defMagic, it.defRanged,
      ].join(",");
    const dedupe = (items: ItemCatalogEntry[], key: (it: ItemCatalogEntry) => string) => {
      const m = new Map<string, ItemCatalogEntry>();
      for (const it of items) {
        const k = key(it);
        const cur = m.get(k);
        if (!cur || better(it, cur)) m.set(k, it);
      }
      return [...m.values()];
    };
    // Only offer ammo the current weapon can actually fire (no arrows for a crossbow).
    const refWeapon = refWeaponId !== undefined ? findCatalogItem(refWeaponId) : undefined;

    const groups: UntradeableSlotGroup[] = [];
    for (const slot of SLOT_ORDER) {
      const candidates = ITEM_CATALOG.filter((it) => {
        if (loadoutSlotFor(it) !== slot) return false;
        if (priceForCatalogId(prices, geIdByName, it.id) !== null) return false; // tradeable (incl. variant ids)
        if (UNCHARGED_PRICE_ID.has(it.id)) return false; // charged — buyable uncharged
        if (NON_PVE_UNTRADEABLE_IDS.has(it.id)) return false;
        if (!meetsRequirements(it, skills)) return false;
        if (score(it) <= 0) return false; // irrelevant to this style
        if (
          slot === "ammo" &&
          refWeapon &&
          !checkAmmoCompatWithCategory(refWeapon.name, refWeapon.category, it.name).ok
        ) {
          return false;
        }
        return true;
      });
      const opts = dedupe(dedupe(candidates, (it) => baseName(it.name)), statSig)
        .sort((a, b) => score(b) - score(a))
        .slice(0, PER_SLOT)
        .map((it) => ({ itemId: it.id, name: it.name }));
      if (opts.length > 0) groups.push({ slot, items: opts });
    }
    return groups;
  }, [fromScratchMode, prices, geIdByName, refStyle, refAttackType, refWeaponId, skills]);

  // Sell-to-fund: the optimizer's recommended liquidations (default-checked
  // set) and the full universe of sellable spare items for the checklist.
  const recommendedSells = useMemo(() => {
    if (mode !== "sell-to-fund" || !bank) return { sellItemIds: [] as number[] };
    return recommendedSellToFund({
      bank: ownedItemIds,
      target: monster,
      skills,
      gp,
      priceLookup: (id) => priceForItem(prices, id),
      boostResolver,
      onTask: effectiveOnTask,
      soulreaperMaxStacks,
      requiresMeleeReach2: meleeReach2,
    });
  }, [mode, bank, ownedItemIds, monster, skills, gp, prices, boostResolver, effectiveOnTask, soulreaperMaxStacks, meleeReach2]);

  const sellableItems = useMemo<SellableItem[]>(() => {
    if (mode !== "sell-to-fund" || !budgetResult?.currentBest) return [];
    const usedIds = new Set(
      Object.values(budgetResult.currentBest.loadout.slots).map((s) => s.itemId),
    );
    const out: SellableItem[] = [];
    for (const id of ownedItemIds) {
      if (usedIds.has(id)) continue;
      const item = findCatalogItem(id);
      if (!item) continue;
      const price = priceForItem(prices, id);
      if (price === null) continue;
      out.push({ itemId: id, name: item.name, valueGp: price });
    }
    out.sort((a, b) => b.valueGp - a.valueGp);
    return out;
  }, [mode, budgetResult, ownedItemIds, prices]);

  // Reseed the sell selection to the recommendation when the boss, mode, or
  // bank changes — but not on every GP tweak, so manual checkbox edits survive.
  const sellSeedKeyRef = useRef("");
  useEffect(() => {
    if (mode !== "sell-to-fund" || !bank) return;
    const key = `${slug}|${[...ownedItemIds].sort((a, b) => a - b).join(",")}`;
    if (key === sellSeedKeyRef.current) return;
    sellSeedKeyRef.current = key;
    setSellSelections(new Set(recommendedSells.sellItemIds));
  }, [mode, bank, slug, ownedItemIds, recommendedSells]);

  function toggleSell(id: number) {
    setSellSelections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Budget mode: toggle whether the player owns a non-tradeable option.
  function toggleUntradeableOwned(id: number) {
    setOwnedUntradeables((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Per-style results derived from the same budgetResult that drives the Best
  // tab — so they react to GP, mode, and sell selections automatically.
  const styleResults = budgetResult?.byStyle ?? null;

  // Which comparison tab is active. A style tab can disappear if the bank
  // changes (e.g. last melee weapon removed) — fall back to "best" then.
  const [activeTabRaw, setActiveTab] = useState<LoadoutTabId>("best");
  const activeTab: LoadoutTabId =
    activeTabRaw !== "best" && !styleResults?.[activeTabRaw]?.upgradedBest ? "best" : activeTabRaw;

  // Comparison tabs. Once any loadout is buildable we ALWAYS list Best plus all
  // three styles — a style the current bank/budget can't build still shows, just
  // dimmed + non-selectable with a tooltip, so Melee/Ranged/Magic never vanish.
  const loadoutTabs = useMemo<LoadoutTab<LoadoutTabId>[]>(() => {
    if (!budgetResult?.upgradedBest) return [];
    const tabs: LoadoutTab<LoadoutTabId>[] = [
      { id: "best", label: "Best", dps: budgetResult.upgradedBest.dps.dps, available: true },
    ];
    for (const style of STYLE_TABS) {
      const built = styleResults?.[style]?.upgradedBest;
      tabs.push({
        id: style,
        label: style.charAt(0).toUpperCase() + style.slice(1),
        dps: built?.dps.dps,
        available: !!built,
        // Why it's empty + the quickest way to actually see it. Bank modes
        // (own/gp/sell) can only upgrade styles the bank can already perform,
        // so the route to a missing style is Budget mode or syncing one.
        unavailableReason: built
          ? undefined
          : fromScratchMode
            ? `No ${style} setup fits this budget — raise it to see one.`
            : `Your bank has no ${style} weapon. Switch to Budget mode to preview a ${style} setup, or sync one.`,
      });
    }
    return tabs;
  }, [budgetResult, styleResults, fromScratchMode]);

  // The editable base is the active tab's scenario: the optimizer's pick for
  // the current budget mode (== best-from-bank when there are no upgrades),
  // or the best own-bank build of one style. Manual edits layer on top.
  const activeScenario =
    activeTab === "best" ? budgetResult?.upgradedBest : styleResults?.[activeTab]?.upgradedBest;
  const baseSet = activeScenario?.loadout;

  // Effective loadout = base + any per-slot overrides the user has applied
  // via the gear picker. Used for the equipment grid, DPS recompute, and
  // mechanic active-bonuses calc. If no overrides, this is identical to base.
  const selectedSet = useMemo(() => {
    if (!baseSet) return undefined;
    if (!hasOverrides(baseSet, overrides, spellOverride)) return baseSet;
    return applyOverrides(baseSet, overrides, spellOverride, skills.magic);
  }, [baseSet, overrides, spellOverride, skills.magic]);

  const overridesActive = baseSet ? hasOverrides(baseSet, overrides, spellOverride) : false;

  // Stateless share link: encode the displayed loadout + setup into a `?b=`
  // value (see lib/share-link.ts). `tab` carries the loadout's concrete style so
  // the recipient's base is the matching style and the layered gear computes
  // correct stats even with a different bank (or none).
  const shareCode = useMemo(() => {
    if (!selectedSet) return null;
    const slots: Partial<Record<LoadoutSlotKey, number>> = {};
    for (const [slot, piece] of Object.entries(selectedSet.slots) as Array<
      [LoadoutSlotKey, { itemId: number } | undefined]
    >) {
      if (piece) slots[slot] = piece.itemId;
    }
    return encodeLoadout({
      v: 1,
      slots,
      dart: selectedSet.internalAmmo?.itemId,
      spell: selectedSet.style === "magic" ? selectedSet.autoSpellName : undefined,
      mode: modeRaw,
      budgetGp,
      gp: gpManual,
      onTask,
      tab: selectedSet.style,
      soulreaper: soulreaperMaxStacks || undefined,
      dharokHp: dharokCurrentHp,
      prayers: encodeNonDefaultPrayers(prayerIds),
    });
  }, [selectedSet, modeRaw, budgetGp, gpManual, onTask, soulreaperMaxStacks, dharokCurrentHp, prayerIds]);

  // Hydrate page state from a share link once on mount. Garbage/absent param →
  // decodeLoadout returns null and we leave defaults untouched.
  //
  // The setState calls below are a deliberate one-time hydration guarded by
  // hydratedRef, so the set-state-in-effect rule (which guards against
  // cascading re-renders) doesn't apply — disable it for this effect only.
  const hydratedRef = useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === "undefined") return;
    const code = new URLSearchParams(window.location.search).get("b");
    if (!code) return;
    const state = decodeLoadout(code);
    if (!state) return;

    const ov: Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>> = {};
    for (const [slot, id] of Object.entries(state.slots) as Array<[LoadoutSlotKey, number]>) {
      const item = findCatalogItem(id);
      if (item) ov[slot] = item;
    }
    if (Object.keys(ov).length > 0) setOverrides(ov);
    if (state.spell) {
      const sp = SPELLS_BY_NAME.get(state.spell);
      if (sp) setSpellOverride(sp);
    }
    if (state.mode) setMode(state.mode as BudgetMode);
    if (typeof state.budgetGp === "number") setBudgetGp(state.budgetGp);
    if (typeof state.gp === "number") setGpManual(state.gp);
    if (typeof state.onTask === "boolean") setOnTask(state.onTask);
    if (state.tab) setActiveTab(state.tab as LoadoutTabId);
    if (typeof state.soulreaper === "boolean") setSoulreaperMaxStacks(state.soulreaper);
    if (typeof state.dharokHp === "number") setDharokCurrentHp(state.dharokHp);
    if (state.prayers && typeof state.prayers === "object") {
      setPrayerIds((prev) => {
        const next = { ...prev };
        for (const style of STYLE_TABS) {
          const id = state.prayers?.[style];
          // Only accept ids that exist in the catalog for that style.
          if (id && prayerById(style, id).id === id) next[style] = id;
        }
        return next;
      });
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Soulreaper: only meaningful when the axe is actually equipped.
  const soulreaperEquipped = selectedSet?.slots.weapon?.itemId === 28338;
  // Dharok's: show the HP slider and apply the bonus only when the full set is worn.
  const DHAROK_GREATAXE_PAGE = new Set([4718, 4886, 4887, 4888]);
  const DHAROK_HELM_PAGE = new Set([4716, 4880, 4881, 4882]);
  const DHAROK_BODY_PAGE = new Set([4720, 4892, 4893, 4894]);
  const DHAROK_LEGS_PAGE = new Set([4722, 4898, 4899, 4900]);
  const dharokFullSetEquipped =
    selectedSet?.style === "melee" &&
    selectedSet?.slots.weapon?.itemId !== undefined && DHAROK_GREATAXE_PAGE.has(selectedSet.slots.weapon.itemId) &&
    selectedSet?.slots.head?.itemId !== undefined && DHAROK_HELM_PAGE.has(selectedSet.slots.head.itemId) &&
    selectedSet?.slots.body?.itemId !== undefined && DHAROK_BODY_PAGE.has(selectedSet.slots.body.itemId) &&
    selectedSet?.slots.legs?.itemId !== undefined && DHAROK_LEGS_PAGE.has(selectedSet.slots.legs.itemId);

  function resetOverrides() {
    setOverrides({});
    setSpellOverride(null);
  }
  // Each tab is its own starting point — carrying slot edits across tabs
  // would silently mix setups, so switching discards them.
  function handleTabChange(id: LoadoutTabId) {
    setActiveTab(id);
    setOverrides({});
    setSpellOverride(null);
  }
  function onPickerSelect(item: ItemCatalogEntry | null) {
    if (!pickerSlot) return;
    const slot = pickerSlot;
    setOverrides((prev) => {
      const next = { ...prev, [slot]: item };
      // A 2H weapon can't coexist with a shield — clear the shield slot so the
      // picked weapon doesn't leave a stranded off-hand (defender/shield) behind.
      if (slot === "weapon" && item?.isTwoHanded) next.shield = null;
      return next;
    });
    setPickerSlot(null);
  }
  function onSpellSelect(spell: SpellEntry | null) {
    setSpellOverride(spell);
    setSpellPickerOpen(false);
  }
  // Toggling the task box just flips the flag — the optimizer re-runs with
  // `effectiveOnTask` and rebuilds the WHOLE loadout (force-including the imbued
  // slayer helm and dropping any now-pointless armor-set pieces, e.g. Void).
  // We clear manual overrides so a stale head pick can't strand a broken set;
  // patching only the head slot here was the old bug.
  function onToggleTask(checked: boolean) {
    setOnTask(checked);
    resetOverrides();
  }

  // Diagnostic line in the results rail listing which conditional bonuses are
  // firing — DHCB vs dragon, Salve(ei) vs undead, Tbow scaling, etc.
  const selectedActiveBonuses = useMemo(() => {
    if (!selectedSet) return null;
    return activeBonusesForTarget(selectedSet, monster);
  }, [selectedSet, monster]);

  // When untouched, reuse the active scenario's own DPS so the hero number
  // always matches the tab/upgrade-path arithmetic; recompute only for edits
  // or when the Soulreaper / Dharok toggles diverge from the optimizer's state.
  const needsDpsRecompute =
    overridesActive ||
    (soulreaperMaxStacks && soulreaperEquipped) ||
    // A non-default prayer pick diverges from the optimizer's baked-in best
    // prayer, so the hero number must be recomputed with the chosen one.
    (!!selectedSet && prayerIds[selectedSet.style] !== DEFAULT_PRAYER_ID[selectedSet.style]) ||
    (dharokFullSetEquipped && dharokCurrentHp !== undefined && dharokCurrentHp < (skills.hitpoints ?? 99));
  const selectedDps = useMemo(() => {
    if (!selectedSet) return undefined;
    if (!needsDpsRecompute) return activeScenario?.dps;
    return computeSetDps(
      selectedSet,
      monster,
      skills,
      boostResolver(selectedSet.style),
      effectiveOnTask,
      soulreaperMaxStacks,
      dharokCurrentHp,
      prayerById(selectedSet.style, prayerIds[selectedSet.style]).selection,
    );
  }, [selectedSet, needsDpsRecompute, activeScenario, monster, skills, boostResolver, effectiveOnTask, soulreaperMaxStacks, dharokCurrentHp, prayerIds]);

  // The prayer option backing the displayed DPS — drives the results-rail prayer
  // row, the picker's current selection, and the supply-cost drain effect.
  // Falls back to the melee default when no loadout is active (row is hidden then).
  const selectedPrayerStyle: CombatStyle = selectedSet?.style ?? "melee";
  const selectedPrayerOption = prayerById(selectedPrayerStyle, prayerIds[selectedPrayerStyle]);

  // DPS a candidate item would yield if slotted into `slot` on top of the
  // current loadout (existing overrides preserved). Powers the item picker's
  // "rank by DPS gained/lost" ordering. Same engine + params as selectedDps so
  // the delta vs the active number is apples-to-apples.
  const dpsForSlotItem = useCallback(
    (slot: LoadoutSlotKey, item: ItemCatalogEntry | null): number | undefined => {
      if (!baseSet) return undefined;
      const trial = applyOverrides(
        baseSet,
        { ...overrides, [slot]: item },
        spellOverride,
        skills.magic,
      );
      return computeSetDps(
        trial,
        monster,
        skills,
        boostResolver(trial.style),
        effectiveOnTask,
        soulreaperMaxStacks,
        dharokCurrentHp,
        prayerById(trial.style, prayerIds[trial.style]).selection,
      ).dps;
    },
    [baseSet, overrides, spellOverride, skills, monster, boostResolver, effectiveOnTask, soulreaperMaxStacks, dharokCurrentHp, prayerIds],
  );

  // Flag worn-slot mechanics the ACTIVE setup drops (e.g. no dragonfire
  // protection in the shield slot AND no Super antifire in the bank) — reacts
  // to manual edits too.
  const setupConflicts = useMemo(
    () => setupMechanicConflicts(selectedSet, mechanics, bank ? ownedItemIds : undefined),
    [selectedSet, mechanics, bank, ownedItemIds],
  );

  const ownedBoost = selectedSet
    ? boostFromBank(selectedSet.style, ownedItemIds)
    : undefined;

  // Enchanted-bolt proc on the active loadout (e.g. Ruby bolts' 20%-of-HP
  // hit), surfaced in the results rail's "active vs this target" line.
  const boltProcFlag = useMemo(() => {
    if (!selectedSet || selectedSet.style !== "ranged") return undefined;
    const spec = resolveBoltProc({
      ammoItemId: selectedSet.slots.ammo?.itemId,
      weaponItemId: selectedSet.slots.weapon?.itemId,
      weaponCategory: selectedSet.weaponCategory,
      visibleRangedLevel: applyCombatBoost(skills, boostResolver(selectedSet.style)).ranged,
      target: { hp: monster.hp, attributes: monster.attributes, slug: monster.slug },
    });
    return spec ? describeBoltProc(spec) : undefined;
  }, [selectedSet, skills, boostResolver, monster]);

  // Per-slot "why this item" details for the doll's hover tooltips: stat
  // contribution, marginal DPS with the slot emptied, conditional bonuses.
  const slotDetails = useMemo(() => {
    if (!selectedSet || !selectedDps) return undefined;
    const details = explainSlots(
      selectedSet,
      selectedDps,
      monster,
      skills,
      boostResolver(selectedSet.style),
      selectedActiveBonuses,
    );

    // In GP / sell-to-fund modes the doll shows the POST-upgrade build, so the
    // honest hover comparison is "vs the bank item this slot replaced", not "vs
    // empty". Overlay that delta onto each upgraded slot. Skipped when the user
    // has manually edited (the bank reference no longer matches the doll).
    const reference =
      activeTab === "best"
        ? budgetResult?.currentBest
        : styleResults?.[activeTab]?.currentBest;
    const showVsBank =
      (mode === "gp-only" || mode === "sell-to-fund") &&
      !overridesActive &&
      reference &&
      activeScenario;
    if (showVsBank) {
      const vsBank = compareSlotsVsReference({
        displayed: activeScenario.loadout,
        displayedDps: activeScenario.dps.dps,
        reference: reference.loadout,
        target: monster,
        skills,
        boostResolver,
        onTask: effectiveOnTask,
        soulreaperMaxStacks,
      });
      for (const [slot, cmp] of Object.entries(vsBank) as Array<[LoadoutSlotKey, SlotVsBank]>) {
        const d = details[slot];
        if (d) d.vsBank = cmp;
      }
    }
    return details;
  }, [selectedSet, selectedDps, monster, skills, boostResolver, selectedActiveBonuses, mode, overridesActive, activeScenario, budgetResult, styleResults, activeTab, effectiveOnTask, soulreaperMaxStacks]);

  const sourceLabel =
    activeTab !== "best"
      ? `best ${activeTab} from your bank`
      : mode === "wildy-risk"
        ? "built within your risk cap — for the Wilderness"
        : mode === "budget"
          ? "built for your budget — ignoring your bank"
          : mode !== "own-only" && (budgetResult?.upgradePath.length ?? 0) > 0
            ? "after upgrades — see results"
            : "best from your bank";

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 max-w-7xl mx-auto">
      <nav className="mb-2 text-sm">
        <Link href="/bosses" className="text-osrs-gold hover:underline">
          ← All bosses
        </Link>
      </nav>

      <header className="mb-3">
        <div className="flex items-start gap-4">
          {/* Boss NPC image — sourced from the OSRS wiki CDN. The image field
              in the catalog is the exact wiki filename (e.g. "Vardorvis.png").
              We cap the display box so oversized renders don't blow the layout. */}
          {monster.image && (
            <div className="shrink-0 osrs-panel rounded flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wikiIconUrl(monster.image)}
                alt={monster.name}
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-osrs-gold">
                {monster.name}
                {monster.version && (
                  <span className="text-base font-normal text-parchment-dark ml-2">
                    ({monster.version})
                  </span>
                )}
              </h1>
              <a
                href={wikiPageUrl(monster.name)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-osrs-gold hover:underline"
              >
                Wiki ↗
              </a>
            </div>
            {/* Meta strip — chips + colour-coded weakness/attribute pills on a
                parchment surface (the pills' tints are tuned for parchment, not
                the dark page background). Gives the boss identity real weight and
                makes the weakness scannable at a glance. */}
            <div className="osrs-panel rounded mt-2 px-3 py-2 flex flex-wrap items-center gap-2">
              <MetaChip label="CB">{monster.combatLevel}</MetaChip>
              <MetaChip label="HP">{monster.hp}</MetaChip>
              <MetaChip label="Size">{monster.size}</MetaChip>
              {monster.weakness && (
                <span className="inline-flex items-center gap-1">
                  <span className="label-eyebrow">weak to</span>
                  <WeaknessBadge
                    element={monster.weakness.element}
                    severity={monster.weakness.severity}
                  />
                </span>
              )}
              {monster.attributes.length > 0 && (
                <span className="flex flex-wrap items-center gap-1">
                  {monster.attributes.map((a) => (
                    <AttributePill key={a} attribute={a} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Defence stat table — lets the player immediately see why the
            optimizer recommended a particular combat style. For Ditto, swap in
            the live editor instead so the player drives those stats. */}
        <div className="mt-2">
          {isDitto ? (
            <DittoEditorPanel monster={monster} onChange={setDittoMonster} />
          ) : (
            <BossStatsPanel monster={monster} />
          )}
        </div>
      </header>

      {/* The cockpit: setup rail (inputs) → loadout (the editable answer) →
          results (outcome + upgrade path). Inputs sit beside the outputs they
          drive, and everything recomputes on change — no apply button, no
          drawer. Connection status lives in the app header, said once. */}
      {/* Cockpit: on desktop — setup | loadout | results (3:5:4 columns).
          On mobile — loadout first (what to wear), results second (outcome),
          setup last (configuration). Order utilities rearrange without changing
          the DOM order, which keeps tab-focus logical. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <aside className="order-3 lg:order-1 lg:col-span-3 lg:sticky lg:top-16 space-y-3">
          {/* Player card — identity in one place: who you are (character · GP)
              and the skills the DPS is computed at, tucked behind a disclosure
              since they rarely change (or come live from the plugin). */}
          <div className="space-y-2">
            <BankConnect />
            <CollapsibleSection title="Skills">
              <PlayerStatsPanel skills={skills} isLive={live.isLive} />
            </CollapsibleSection>
          </div>
          <SetupPanel
            mode={mode}
            onModeChange={setMode}
            isWildernessBoss={wilderness}
          >
            <label
              className={`mt-3 flex items-center gap-2 text-sm select-none ${
                monster.isSlayerMonster
                  ? "text-osrs-brown cursor-pointer"
                  : "text-osrs-brown/40 cursor-not-allowed"
              }`}
              title={
                monster.isSlayerMonster
                  ? undefined
                  : `${monster.name} can't be assigned as a Slayer task`
              }
            >
              <input
                type="checkbox"
                checked={effectiveOnTask}
                disabled={!monster.isSlayerMonster}
                onChange={(e) => onToggleTask(e.target.checked)}
                className="h-4 w-4 accent-osrs-gold disabled:opacity-40"
              />
              <span>
                On slayer task{" "}
                <span className={monster.isSlayerMonster ? "text-osrs-brown/60" : ""}>
                  {monster.isSlayerMonster
                    ? "— black mask / slayer helm (i)"
                    : "— not a slayer assignment"}
                </span>
              </span>
            </label>

            {soulreaperEquipped && (
              <label className="mt-3 flex items-center gap-2 text-sm select-none text-osrs-brown cursor-pointer">
                <input
                  type="checkbox"
                  checked={soulreaperMaxStacks}
                  onChange={(e) => setSoulreaperMaxStacks(e.target.checked)}
                  className="h-4 w-4 accent-osrs-gold"
                />
                <span>
                  Soulreaper axe — max stacks{" "}
                  <span className="text-osrs-brown/60">+30% Str level</span>
                </span>
              </label>
            )}

            {dharokFullSetEquipped && (
              <div className="mt-3 space-y-1">
                <label className="block text-sm text-osrs-brown select-none">
                  <span>
                    Dharok&apos;s — current HP{" "}
                    <span className="text-osrs-brown/60">
                      {dharokCurrentHp !== undefined ? `${dharokCurrentHp} HP` : "full HP (no bonus)"}
                    </span>
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={skills.hitpoints ?? 99}
                  step={1}
                  value={dharokCurrentHp ?? (skills.hitpoints ?? 99)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDharokCurrentHp(val >= (skills.hitpoints ?? 99) ? undefined : val);
                  }}
                  className="w-full"
                  aria-label="Dharok's current HP"
                />
              </div>
            )}
          </SetupPanel>

          {mode === "sell-to-fund" && bank !== null && (
            <div className="mt-4">
              <SellSelectionPanel
                items={sellableItems}
                selected={sellSelections}
                recommended={new Set(recommendedSells.sellItemIds)}
                onToggle={toggleSell}
                onSelectAll={() => setSellSelections(new Set(sellableItems.map((i) => i.itemId)))}
                onSelectNone={() => setSellSelections(new Set())}
                onSelectRecommended={() => setSellSelections(new Set(recommendedSells.sellItemIds))}
                mapping={mapping}
              />
            </div>
          )}
        </aside>

        <section className="order-1 lg:order-2 lg:col-span-5 space-y-3">
          {/* Budget / wallet-GP control sits directly above the gear doll it
              changes — drag the slider and watch the loadout rebuild in place. */}
          <BudgetControl
            mode={mode}
            gp={gp}
            gpIsLive={live.gp != null}
            onGpChange={setGpManual}
            budgetGp={budgetGp}
            onBudgetChange={setBudgetGp}
          />
          <LoadoutPanel
            tabs={loadoutTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            set={selectedSet}
            dps={selectedDps}
            connected={bank !== null || fromScratchMode}
            sourceLabel={sourceLabel}
            ownedItemIds={ownedItemIds}
            mapping={mapping}
            onSlotClick={(slot) => setPickerSlot(slot)}
            onSpellClick={() => setSpellPickerOpen(true)}
            slotDetails={slotDetails}
            editedSlots={overridesActive ? (Object.keys(overrides) as LoadoutSlotKey[]) : []}
            onResetEdits={resetOverrides}
            conflicts={setupConflicts}
            boostName={ownedBoost?.name}
            onWikiExport={
              selectedSet
                ? async () => { await openInWikiCalc(selectedSet, skills, monster, effectiveOnTask, boostResolver(selectedSet.style)); }
                : undefined
            }
            shareCode={shareCode}
          />
        </section>

        <section className="order-2 lg:order-3 lg:col-span-4 space-y-4">
          <ResultsPanel
            bossName={monster.name}
            bossHp={monster.hp}
            set={selectedSet}
            dps={selectedDps}
            activeBonuses={selectedActiveBonuses}
            result={activeTab === "best" ? budgetResult : (styleResults?.[activeTab] ?? null)}
            edited={overridesActive}
            boltProcFlag={boltProcFlag}
            mapping={mapping}
            prayerLevel={skills.prayer ?? 99}
            prayerPotPriceGp={priceForItem(prices, PRAYER_POTION_4_ID)}
            selectedPrayer={{ name: selectedPrayerOption.name, effect: selectedPrayerOption.effect }}
            prayerDrainEffect={selectedPrayerOption.drainEffect}
            onOpenPrayerPicker={selectedSet ? () => setPrayerPickerOpen(true) : undefined}
            bossSlug={monster.slug}
            priceLookup={(id) => priceForItem(prices, id)}
            excludedUpgrades={excludedUpgrades}
            onToggleUpgradeItem={toggleExcludedUpgrade}
            trip={{ uptime: combatUptime, protectionPrayer: useProtectionPrayer, brewsPerHour }}
            onTripChange={(patch) => {
              if (patch.uptime !== undefined) setCombatUptime(patch.uptime);
              if (patch.protectionPrayer !== undefined) setUseProtectionPrayer(patch.protectionPrayer);
              if (patch.brewsPerHour !== undefined) setBrewsPerHour(patch.brewsPerHour);
            }}
            brewPriceGp={priceForItem(prices, SARADOMIN_BREW_4_ID)}
          />
          {fromScratchMode && untradeableOptionsBySlot.length > 0 && (
            <OwnedUntradeablesPanel
              groups={untradeableOptionsBySlot}
              owned={ownedUntradeables}
              onToggle={toggleUntradeableOwned}
              onSelectAll={() =>
                setOwnedUntradeables(
                  new Set(untradeableOptionsBySlot.flatMap((g) => g.items.map((i) => i.itemId))),
                )
              }
              onSelectNone={() => setOwnedUntradeables(new Set())}
              mapping={mapping}
            />
          )}
        </section>
      </div>

      {/* Secondary sections — each is a collapsed disclosure (click to open) so
          the core cockpit owns the first screen. Hybrid armour (multi-style
          switching) and the fight-reference panels (mechanics, spec weapons)
          live here, out of the way until wanted. */}
      <div className="mt-4 space-y-3">
        <HybridPanel
          ownedItemIds={ownedItemIds}
          connected={bank !== null}
          target={monster}
          skills={skills}
          boostResolver={boostResolver}
          onTask={effectiveOnTask}
          soulreaperMaxStacks={soulreaperMaxStacks}
          requiresMeleeReach2={meleeReach2}
          mapping={mapping}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {mechanicEvaluations.length > 0 && (
            <MechanicsPanel evaluations={mechanicEvaluations} />
          )}
          <SpecWeaponsPanel
            slug={slug}
            mapping={mapping}
            ownedItemIds={ownedItemIds}
            weaponItemId={selectedSet?.slots.weapon?.itemId}
          />
        </div>
      </div>

      {pickerSlot && (
        <ItemPickerModal
          slot={pickerSlot}
          currentItemId={selectedSet?.slots[pickerSlot]?.itemId}
          currentDps={selectedDps?.dps}
          dpsForItem={dpsForSlotItem}
          onSelect={onPickerSelect}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {spellPickerOpen && (
        <SpellPickerModal
          currentSpellName={spellOverride?.name}
          magicLevel={skills.magic}
          targetAttributes={monster.attributes}
          weaponId={selectedSet?.slots.weapon?.itemId}
          onSelect={onSpellSelect}
          onClose={() => setSpellPickerOpen(false)}
        />
      )}

      {prayerPickerOpen && selectedSet && (
        <PrayerPickerModal
          style={selectedSet.style}
          currentPrayerId={prayerIds[selectedSet.style]}
          prayerLevel={skills.prayer ?? 99}
          onSelect={(id) => {
            const style = selectedSet.style;
            setPrayerIds((prev) => ({ ...prev, [style]: id }));
            setPrayerPickerOpen(false);
          }}
          onClose={() => setPrayerPickerOpen(false)}
        />
      )}

      <footer className="mt-8 text-xs text-parchment-dark">
        DPS numbers calibrated against{" "}
        <a
          className="underline hover:text-osrs-gold"
          href="https://tools.runescape.wiki/osrs-dps/"
          target="_blank"
          rel="noreferrer"
        >
          tools.runescape.wiki/osrs-dps
        </a>
        . Stats and item data from the same dataset (vendored at
        data/vendor/wgloop/).
      </footer>
    </div>
  );
}
