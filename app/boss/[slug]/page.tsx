"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { findUpgrades, type BudgetMode } from "@/lib/optimize/budget";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { bestBoostForStyle, bankBoostResolver, boostFromBank } from "@/lib/dps/boost";
import { mechanicsForBoss } from "@/data/bosses/mechanics";
import { CONSUMABLES_BY_SLUG } from "@/data/bosses/consumables";
import { evaluateMechanics } from "@/lib/mechanics";
import { setupMechanicConflicts } from "@/lib/setup-mechanics";
import { activeBonusesForTarget } from "@/lib/loadout";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { useLiveBank } from "@/lib/liveBank";
import { SetupPanel } from "@/components/SetupPanel";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { LoadoutPanel } from "@/components/LoadoutPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { MechanicsPanel } from "@/components/MechanicsPanel";
import { ItemPickerModal } from "@/components/ItemPickerModal";
import { SpecWeaponsPanel } from "@/components/SpecWeaponsPanel";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";
import { BossStatsPanel } from "@/components/BossStatsPanel";
import { wikiIconUrl } from "@/lib/icons";
import { applyOverrides, hasOverrides } from "@/lib/loadout-edit";
import type { ItemCatalogEntry } from "@/data/items/catalog";
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
  const [sellThresholdM, setSellThresholdM] = useState(1); // millions
  // Per-slot gear overrides on top of the optimizer's best setup. "Reset"
  // clears this map.
  const [overrides, setOverrides] = useState<
    Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>
  >({});
  // Which slot the user clicked → opens ItemPickerModal. null = closed.
  const [pickerSlot, setPickerSlot] = useState<LoadoutSlotKey | null>(null);

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

  // The single optimizer run feeding the whole cockpit: best buildable
  // loadout, plus the budget-mode upgrade path / sell list. (Previously the
  // page ran optimizeForBoss separately for the tweak drawer — one run now.)
  const budgetResult = useMemo(() => {
    if (!bank) return null;
    return findUpgrades({
      bank: ownedItemIds,
      target: monster,
      skills,
      gp,
      mode,
      sellThreshold: sellThresholdM * 1_000_000,
      priceLookup: (id) => priceForItem(prices, id),
      boostResolver,
    });
  }, [bank, ownedItemIds, monster, skills, gp, mode, sellThresholdM, prices, boostResolver]);

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
  }, [bank, ownedItemIds, monster, skills, boostResolver]);

  // Which comparison tab is active. A style tab can disappear if the bank
  // changes (e.g. last melee weapon removed) — fall back to "best" then.
  const [activeTabRaw, setActiveTab] = useState<LoadoutTabId>("best");
  const activeTab: LoadoutTabId =
    activeTabRaw !== "best" && !styleBests?.[activeTabRaw] ? "best" : activeTabRaw;

  const loadoutTabs = useMemo(() => {
    if (!bank) return [];
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
  }, [bank, budgetResult, styleBests]);

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
    if (!hasOverrides(baseSet, overrides)) return baseSet;
    return applyOverrides(baseSet, overrides);
  }, [baseSet, overrides]);

  const overridesActive = baseSet ? hasOverrides(baseSet, overrides) : false;

  function resetOverrides() {
    setOverrides({});
  }
  // Each tab is its own starting point — carrying slot edits across tabs
  // would silently mix setups, so switching discards them.
  function handleTabChange(id: LoadoutTabId) {
    setActiveTab(id);
    setOverrides({});
  }
  function onPickerSelect(item: ItemCatalogEntry | null) {
    if (!pickerSlot) return;
    setOverrides((prev) => ({ ...prev, [pickerSlot]: item }));
    setPickerSlot(null);
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
    return computeSetDps(selectedSet, monster, skills, boostResolver(selectedSet.style));
  }, [selectedSet, overridesActive, activeScenario, monster, skills, boostResolver]);

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
      : mode !== "own-only" && (budgetResult?.upgradePath.length ?? 0) > 0
        ? "after upgrades — see results"
        : "best from your bank";

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
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
            <div className="shrink-0 osrs-panel rounded flex items-center justify-center"
              style={{ width: 96, height: 96 }}>
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
            <h1 className="text-3xl font-bold text-osrs-gold">
              {monster.name}
              {monster.version && (
                <span className="text-base font-normal text-parchment-dark ml-2">
                  ({monster.version})
                </span>
              )}
            </h1>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-16">
          <SetupPanel
            mode={mode}
            onModeChange={setMode}
            gp={gp}
            gpIsLive={live.gp != null}
            onGpChange={setGpManual}
            sellThresholdM={sellThresholdM}
            onSellThresholdChange={setSellThresholdM}
          >
            <PlayerStatsPanel skills={skills} isLive={live.isLive} />
          </SetupPanel>
        </aside>

        <section className="lg:col-span-5">
          <LoadoutPanel
            tabs={loadoutTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            set={selectedSet}
            dps={selectedDps}
            connected={bank !== null}
            sourceLabel={sourceLabel}
            ownedItemIds={ownedItemIds}
            mapping={mapping}
            onSlotClick={(slot) => setPickerSlot(slot)}
            editedSlots={overridesActive ? (Object.keys(overrides) as LoadoutSlotKey[]) : []}
            onResetEdits={resetOverrides}
            conflicts={setupConflicts}
            boostName={ownedBoost?.name}
          />
        </section>

        <section className="lg:col-span-4">
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
