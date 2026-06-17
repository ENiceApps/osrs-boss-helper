"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades, recommendedSellToFund, type BudgetMode } from "@/lib/optimize/budget";
import { bestLoadoutForBudget } from "@/lib/optimize/budget-build";
import { optimizeForBoss, itemScore, meetsRequirements, loadoutSlotFor } from "@/lib/optimize/bank";
import { applyCombatBoost, bestBoostForStyle, bankBoostResolver, boostFromBank } from "@/lib/dps/boost";
import { describeBoltProc, resolveBoltProc } from "@/lib/dps/bolts";
import { mechanicsForBoss } from "@/data/bosses/mechanics";
import { CONSUMABLES_BY_SLUG } from "@/data/bosses/consumables";
import { evaluateMechanics } from "@/lib/mechanics";
import { setupMechanicConflicts } from "@/lib/setup-mechanics";
import { activeBonusesForTarget } from "@/lib/loadout";
import { explainSlots } from "@/lib/loadout-explain";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { useLiveBank } from "@/lib/liveBank";
import { SetupPanel } from "@/components/SetupPanel";
import { SellSelectionPanel, type SellableItem } from "@/components/SellSelectionPanel";
import { OwnedUntradeablesPanel, type UntradeableSlotGroup } from "@/components/OwnedUntradeablesPanel";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { LoadoutPanel } from "@/components/LoadoutPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { MechanicsPanel } from "@/components/MechanicsPanel";
import { ItemPickerModal } from "@/components/ItemPickerModal";
import { SpellPickerModal } from "@/components/SpellPickerModal";
import { SpecWeaponsPanel } from "@/components/SpecWeaponsPanel";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";
import { BossStatsPanel } from "@/components/BossStatsPanel";
import { wikiIconUrl, wikiPageUrl } from "@/lib/icons";
import { applyOverrides, hasOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { checkAmmoCompatWithCategory } from "@/data/ammo-compatibility";
import { IMBUED_SLAYER_HELM_IDS } from "@/data/items/slayer-helm";
import { NON_PVE_UNTRADEABLE_IDS } from "@/data/items/non-pve-untradeables";
import { openInWikiCalc } from "@/lib/wiki-export";
import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import type { SpellEntry } from "@/data/spells/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { BankContents, CombatStyle, ItemId } from "@/types/osrs";
import { asItemId } from "@/types/osrs";

// Comparison-tab ids: the budget-mode best, or the best build per style.
type LoadoutTabId = "best" | CombatStyle;
const STYLE_TABS: CombatStyle[] = ["melee", "ranged", "magic"];

// Stable empty pools for the "not connected" state. We deliberately show an
// EMPTY equipment/optimizer state until the plugin syncs, rather than invent a
// loadout from sample data — a first-time visitor should never see gear or DPS
// that isn't really theirs.
const EMPTY_ITEM_IDS = new Set<ItemId>();
const EMPTY_BANK: BankContents = { tagName: "", itemIds: EMPTY_ITEM_IDS };

// Per Next.js 16 dynamic-routes docs: `params` is now a Promise. Client
// components consume it via React's `use`.
export default function BossPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const monster = MONSTER_BY_SLUG[slug];
  if (!monster) notFound();

  // Live RuneLite plugin sync — see lib/liveBank.ts. Until the plugin pushes,
  // `bank` is null and the page shows an empty/connect state (no fabricated
  // loadout from sample data).
  const live = useLiveBank();
  const bank: BankContents | null = live.bank;
  const [gpManual, setGpManual] = useState(500_000_000);
  // Live GP overrides the manual GP input when the plugin has reported one.
  const gp = live.gp ?? gpManual;
  // Budget mode + sell threshold drive the optimizer; they live here (not in
  // a panel) because the setup rail sets them and the loadout/results columns
  // consume the output. Every change recomputes immediately — no apply button.
  const [mode, setMode] = useState<BudgetMode>("gp-only");
  // Sell-to-fund: ids of bank items the player has chosen to liquidate. Seeded
  // from the optimizer's recommendation (see the reseed effect below).
  const [sellSelections, setSellSelections] = useState<Set<number>>(new Set());
  // Budget mode: from-scratch spend, independent of wallet GP.
  const [budgetGp, setBudgetGp] = useState(100_000_000);
  // Budget mode: ids of non-tradeable items the player has checked as OWNED.
  // Default empty (own none → all-buyable build); checking an item lets the
  // optimizer use it for free in its slot.
  const [ownedUntradeables, setOwnedUntradeables] = useState<Set<number>>(new Set());
  // Slayer-task assumption. Defaults on (the common bossing context) — gates the
  // imbued black mask / slayer helmet bonus through the optimizer and recompute.
  const [onTask, setOnTask] = useState(true);
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

  const { data: mapping } = useMapping();
  const { data: prices } = usePrices();

  // Skills come from the live RuneLite plugin when connected, else default 99s.
  const skills = live.skills ?? SKILLS_AT_99;
  const consumables = CONSUMABLES_BY_SLUG[slug];
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

  // The imbued black mask / slayer helm the player owns, if any — used to
  // auto-equip it when the on-task box is ticked.
  const ownedSlayerHelm = useMemo(() => {
    const id = [...IMBUED_SLAYER_HELM_IDS].find((helmId) => ownedItemIds.has(helmId));
    return id !== undefined ? findCatalogItem(id) : undefined;
  }, [ownedItemIds]);

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
    if (mode === "budget") {
      return bestLoadoutForBudget({
        target: monster,
        skills,
        gp: budgetGp,
        priceLookup: (id) =>
          ownedUntradeables.has(id) ? 0 : priceForItem(prices, id),
        boostResolver,
        onTask: effectiveOnTask,
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
      priceLookup: (id) => priceForItem(prices, id),
      boostResolver,
      onTask: effectiveOnTask,
    });
  }, [bank, ownedItemIds, monster, skills, gp, budgetGp, mode, sellSelections, ownedUntradeables, prices, boostResolver, effectiveOnTask]);

  // Budget mode: per-slot lists of non-tradeable options the player can mark as
  // owned. Ranked by the current build's combat style (stable per boss), with
  // PvP/cosmetic junk filtered out. The optimizer uses whichever owned options
  // are best; unchecked ones aren't available so a buyable item fills the slot.
  const refLoadout = mode === "budget" ? budgetResult?.upgradedBest?.loadout : undefined;
  const refStyle = refLoadout?.style ?? "ranged";
  const refAttackType = refLoadout?.attackType ?? "ranged";
  const refWeaponId = refLoadout?.slots.weapon?.itemId;
  const untradeableOptionsBySlot = useMemo<UntradeableSlotGroup[]>(() => {
    if (mode !== "budget" || !prices) return [];
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
        if (priceForItem(prices, it.id) !== null) return false; // tradeable
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
  }, [mode, prices, refStyle, refAttackType, refWeaponId, skills]);

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
    });
  }, [mode, bank, ownedItemIds, monster, skills, gp, prices, boostResolver, effectiveOnTask]);

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

  // Best buildable loadout PER ATTACK STYLE, for the comparison tabs. One
  // uncapped run: topN only caps how many ranked scenarios are returned (the
  // default 10 can be a single style entirely), so ask for all of them and
  // keep the first occurrence of each style — rankings are DPS-descending.
  const styleBests = useMemo(() => {
    if (!bank) return null;
    const { rankings } = optimizeForBoss({
      bank: ownedItemIds,
      target: monster,
      skills,
      topN: Number.MAX_SAFE_INTEGER,
      boostResolver,
      onTask: effectiveOnTask,
    });
    const bests: Partial<Record<CombatStyle, (typeof rankings)[number]>> = {};
    for (const r of rankings) {
      // A zero-DPS scenario (e.g. magic with no castable spell modelled) is
      // "valid" to the optimizer but useless as a comparison tab.
      if (r.dps.dps <= 0) continue;
      if (!bests[r.loadout.style]) bests[r.loadout.style] = r;
      if (bests.melee && bests.ranged && bests.magic) break;
    }
    return bests;
  }, [bank, ownedItemIds, monster, skills, boostResolver, effectiveOnTask]);

  // Which comparison tab is active. A style tab can disappear if the bank
  // changes (e.g. last melee weapon removed) — fall back to "best" then.
  const [activeTabRaw, setActiveTab] = useState<LoadoutTabId>("best");
  const activeTab: LoadoutTabId =
    activeTabRaw !== "best" && !styleBests?.[activeTabRaw] ? "best" : activeTabRaw;

  const loadoutTabs = useMemo(() => {
    if (!bank && mode !== "budget") return [];
    const tabs: Array<{ id: LoadoutTabId; label: string; dps?: number }> = [];
    if (budgetResult?.upgradedBest) {
      tabs.push({ id: "best", label: "Best", dps: budgetResult.upgradedBest.dps.dps });
    }
    for (const style of STYLE_TABS) {
      const r = styleBests?.[style];
      if (r) {
        tabs.push({
          id: style,
          label: style.charAt(0).toUpperCase() + style.slice(1),
          dps: r.dps.dps,
        });
      }
    }
    return tabs;
  }, [bank, mode, budgetResult, styleBests]);

  // The editable base is the active tab's scenario: the optimizer's pick for
  // the current budget mode (== best-from-bank when there are no upgrades),
  // or the best own-bank build of one style. Manual edits layer on top.
  const activeScenario =
    activeTab === "best" ? budgetResult?.upgradedBest : styleBests?.[activeTab];
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
    setOverrides((prev) => ({ ...prev, [pickerSlot]: item }));
    setPickerSlot(null);
  }
  function onSpellSelect(spell: SpellEntry | null) {
    setSpellOverride(spell);
    setSpellPickerOpen(false);
  }
  // The head slot present before the on-task box forced the slayer helm — so we
  // can put it back when the box is unticked. undefined = no prior override.
  const headBeforeTaskRef = useRef<ItemCatalogEntry | null | undefined>(undefined);
  function onToggleTask(checked: boolean) {
    setOnTask(checked);
    if (checked) {
      // Auto-equip the owned imbued slayer helm, remembering the prior head.
      if (ownedSlayerHelm) {
        setOverrides((prev) => {
          headBeforeTaskRef.current = "head" in prev ? prev.head : undefined;
          return { ...prev, head: ownedSlayerHelm };
        });
      }
    } else {
      // Revert to whatever head was there before (base optimizer pick if none).
      setOverrides((prev) => ({ ...prev, head: headBeforeTaskRef.current }));
    }
  }

  // Diagnostic line in the results rail listing which conditional bonuses are
  // firing — DHCB vs dragon, Salve(ei) vs undead, Tbow scaling, etc.
  const selectedActiveBonuses = useMemo(() => {
    if (!selectedSet) return null;
    return activeBonusesForTarget(selectedSet, monster);
  }, [selectedSet, monster]);

  // When untouched, reuse the active scenario's own DPS so the hero number
  // always matches the tab/upgrade-path arithmetic; recompute only for edits.
  const selectedDps = useMemo(() => {
    if (!selectedSet) return undefined;
    if (!overridesActive) return activeScenario?.dps;
    return computeSetDps(selectedSet, monster, skills, boostResolver(selectedSet.style), effectiveOnTask);
  }, [selectedSet, overridesActive, activeScenario, monster, skills, boostResolver, effectiveOnTask]);

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
    return explainSlots(
      selectedSet,
      selectedDps,
      monster,
      skills,
      boostResolver(selectedSet.style),
      selectedActiveBonuses,
    );
  }, [selectedSet, selectedDps, monster, skills, boostResolver, selectedActiveBonuses]);

  // Augment the curated consumables with the boost potion that matches the
  // selected loadout's combat style — the same potion baked into the DPS above.
  const consumablesWithBoost = useMemo(() => {
    const base = consumables ?? [];
    if (!selectedSet) return base;
    const boost = bestBoostForStyle(selectedSet.style);
    if (base.some((c) => c.itemId === boost.itemId)) return base;
    return [
      { itemId: asItemId(boost.itemId), name: boost.name, quantity: 1, role: "boost" as const },
      ...base,
    ];
  }, [consumables, selectedSet]);

  const sourceLabel =
    activeTab !== "best"
      ? `best ${activeTab} from your bank`
      : mode === "budget"
        ? "built for your budget — ignoring your bank"
        : mode !== "own-only" && (budgetResult?.upgradePath.length ?? 0) > 0
          ? "after upgrades — see results"
          : "best from your bank";

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 max-w-7xl mx-auto">
      <nav className="mb-3 text-sm">
        <Link href="/bosses" className="text-osrs-gold hover:underline">
          ← All bosses
        </Link>
      </nav>

      <header className="mb-4">
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
            optimizer recommended a particular combat style. */}
        <div className="mt-2">
          <BossStatsPanel monster={monster} />
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
        <aside className="order-3 lg:order-1 lg:col-span-3 lg:sticky lg:top-16">
          <SetupPanel
            mode={mode}
            onModeChange={setMode}
            gp={gp}
            gpIsLive={live.gp != null}
            onGpChange={setGpManual}
            budgetGp={budgetGp}
            onBudgetChange={setBudgetGp}
          >
            <PlayerStatsPanel skills={skills} isLive={live.isLive} />
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

          {mode === "budget" && untradeableOptionsBySlot.length > 0 && (
            <div className="mt-4">
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
            </div>
          )}
        </aside>

        <section className="order-1 lg:order-2 lg:col-span-5">
          <LoadoutPanel
            tabs={loadoutTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            set={selectedSet}
            dps={selectedDps}
            connected={bank !== null || mode === "budget"}
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
                ? async () => { await openInWikiCalc(selectedSet, skills, monster); }
                : undefined
            }
          />
        </section>

        <section className="order-2 lg:order-3 lg:col-span-4">
          <ResultsPanel
            bossName={monster.name}
            bossHp={monster.hp}
            set={selectedSet}
            dps={selectedDps}
            activeBonuses={selectedActiveBonuses}
            // The upgrade path describes the budget-mode pick — it doesn't
            // apply to the per-style tabs, so they get stats only.
            result={activeTab === "best" ? budgetResult : null}
            edited={overridesActive}
            boltProcFlag={boltProcFlag}
            mapping={mapping}
          />
        </section>
      </div>

      {/* Reference row — fight knowledge that doesn't change as you tweak
          gear: mechanics checklist, spec weapons, consumables. */}
      <section className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {mechanicEvaluations.length > 0 && (
          <MechanicsPanel evaluations={mechanicEvaluations} />
        )}
        <SpecWeaponsPanel
          slug={slug}
          mapping={mapping}
          ownedItemIds={ownedItemIds}
        />
        {consumablesWithBoost.length > 0 && (
          <InventoryPanel consumables={consumablesWithBoost} mapping={mapping} />
        )}
      </section>

      {pickerSlot && (
        <ItemPickerModal
          slot={pickerSlot}
          currentItemId={selectedSet?.slots[pickerSlot]?.itemId}
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
