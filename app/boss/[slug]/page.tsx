"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { LOADOUT_SETS } from "@/data/loadouts/sets.generated";
import {
  computeSetDps,
  previewLoadoutsForBoss,
  rankLoadoutsForBoss,
  SKILLS_AT_99,
  type LoadoutEvaluation,
} from "@/lib/recommend";
import { MECHANICS_BY_SLUG } from "@/data/bosses/mechanics";
import { CONSUMABLES_BY_SLUG } from "@/data/bosses/consumables";
import { evaluateMechanics } from "@/lib/mechanics";
import { activeBonusesForTarget } from "@/lib/loadout";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { useLiveBank, secondsSince } from "@/lib/liveBank";
import { usePlayer } from "@/lib/wom";
import { PlayerSetup } from "@/components/PlayerSetup";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { EquipmentPanel } from "@/components/EquipmentPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { SetupComparisonPanel } from "@/components/SetupComparisonPanel";
import { MechanicsPanel } from "@/components/MechanicsPanel";
import { ItemPickerModal } from "@/components/ItemPickerModal";
import { DpsResultsPanel } from "@/components/DpsResultsPanel";
import { SpecWeaponsPanel } from "@/components/SpecWeaponsPanel";
import { OptimizerPanel } from "@/components/OptimizerPanel";
import { applyOverrides, hasOverrides } from "@/lib/loadout-edit";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { BankContents, CombatStyle } from "@/types/osrs";
import { asItemId } from "@/types/osrs";

// Sample bank for the optimizer demo — used until the RuneLite plugin lands.
// Mid-tier ranged kit that gives the optimizer real headroom to show off:
// basic crossbow → DHCB, bronze bolts → diamond, etc. Phase 5 v1 ships
// without bank-tag paste UI; this stand-in keeps the optimizer panel useful.
const SAMPLE_BANK: ReadonlySet<number> = new Set([
  11826, // Armadyl helmet
  22109, // Ava's assembler
  12018, // Salve amulet(ei)
  11828, // Armadyl chestplate
  11830, // Armadyl chainskirt
  7462,  // Barrows gloves
  13237, // Pegasian boots
  6737,  // Berserker ring
  837,   // Crossbow (basic)
  877,   // Bronze bolts
]);

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

  // Live RuneLite plugin sync — see lib/liveBank.ts. When nothing has been
  // posted by the plugin yet, fall back to the sample bank so the optimizer
  // panel still has data to show.
  const live = useLiveBank();
  const sampleBank: BankContents = useMemo(
    () => ({
      tagName: "Sample",
      itemIds: new Set(Array.from(SAMPLE_BANK).map(asItemId)),
    }),
    [],
  );
  const bank: BankContents = live.bank ?? sampleBank;
  const [username, setUsername] = useState("");
  const [gpManual, setGpManual] = useState(500_000_000);
  // Live GP overrides the manual GP input when the plugin has reported one.
  const gp = live.gp ?? gpManual;
  const [styleFilter, setStyleFilter] = useState<CombatStyle | "all">("all");
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  // Per-slot gear overrides on top of the selected base loadout. Selecting
  // a new preset (or "Reset to default") clears this map.
  const [overrides, setOverrides] = useState<
    Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>
  >({});
  // Which slot the user clicked → opens ItemPickerModal. null = closed.
  const [pickerSlot, setPickerSlot] = useState<LoadoutSlotKey | null>(null);

  const { data: mapping } = useMapping();
  const { data: prices } = usePrices();
  const { player, isLoading: playerLoading, error: playerError } = usePlayer(username);

  // Skill priority: plugin-reported (live) → WOM lookup → 99/99/99 fallback.
  const skills = live.skills ?? player?.skills ?? SKILLS_AT_99;
  const consumables = CONSUMABLES_BY_SLUG[slug];
  const mechanics = MECHANICS_BY_SLUG[slug];

  // Loadouts filtered by the optional style selector (so user can narrow to
  // just ranged sets, for example).
  const styleFiltered = useMemo(
    () =>
      styleFilter === "all"
        ? LOADOUT_SETS
        : LOADOUT_SETS.filter((s) => s.style === styleFilter),
    [styleFilter],
  );

  // Two ranking modes:
  // 1. Bank pasted: full rankLoadoutsForBoss with owned / affordable / missing
  //    flags and DPS over the user's actual stats.
  // 2. No bank: previewLoadoutsForBoss at 99 stats, wrapped in the same
  //    LoadoutEvaluation shape so the UI doesn't branch on presence-of-bank.
  const evaluations: LoadoutEvaluation[] = useMemo(() => {
    if (bank) {
      const lookup = (id: number) => priceForItem(prices, id);
      return rankLoadoutsForBoss(styleFiltered, monster, bank, gp, lookup, skills);
    }
    return previewLoadoutsForBoss(styleFiltered, monster, skills).map((p) => ({
      set: p.set,
      slotStatuses: {},
      totalCostToComplete: 0,
      viable: true,
      dps: p.dps,
      activeBonuses: p.activeBonuses,
    }));
  }, [bank, gp, prices, styleFiltered, monster, skills]);

  const mechanicEvaluations = useMemo(() => {
    if (!mechanics) return [];
    if (bank) return evaluateMechanics(mechanics, bank);
    return mechanics.map((req) => ({
      requirement: req,
      satisfied: null as boolean | null,
    }));
  }, [mechanics, bank]);

  const baseSet = useMemo(() => {
    if (evaluations.length === 0) return undefined;
    const explicitly = evaluations.find((e) => e.set.id === selectedSetId);
    return (explicitly ?? evaluations[0]).set;
  }, [evaluations, selectedSetId]);

  // Effective loadout = base + any per-slot overrides the user has applied
  // via the gear picker. Used for the equipment grid, DPS recompute, and
  // mechanic active-bonuses calc. If no overrides, this is identical to base.
  const selectedSet = useMemo(() => {
    if (!baseSet) return undefined;
    if (!hasOverrides(baseSet, overrides)) return baseSet;
    return applyOverrides(baseSet, overrides);
  }, [baseSet, overrides]);

  const overridesActive = baseSet ? hasOverrides(baseSet, overrides) : false;

  // Picking a new preset card or resetting clears overrides.
  function selectSet(id: string) {
    if (id !== selectedSetId) setOverrides({});
    setSelectedSetId(id);
  }
  function resetOverrides() {
    setOverrides({});
  }
  function onPickerSelect(item: ItemCatalogEntry | null) {
    if (!pickerSlot) return;
    setOverrides((prev) => ({ ...prev, [pickerSlot]: item }));
    setPickerSlot(null);
  }

  // Diagnostic line under the selected loadout listing which conditional
  // bonuses are firing — DHCB vs dragon, Salve(ei) vs undead, Tbow scaling, etc.
  const selectedActiveBonuses = useMemo(() => {
    if (!selectedSet) return null;
    return activeBonusesForTarget(selectedSet, monster);
  }, [selectedSet, monster]);

  const selectedDps = useMemo(() => {
    if (!selectedSet) return undefined;
    return computeSetDps(selectedSet, monster, skills);
  }, [selectedSet, monster, skills]);

  const ownedItemIds = useMemo(
    () =>
      bank ? new Set(Array.from(bank.itemIds).map((id) => Number(id))) : new Set<number>(),
    [bank],
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <nav className="mb-4 text-sm">
        <Link href="/" className="text-osrs-gold hover:underline">
          ← All bosses
        </Link>
        <span className="mx-2 text-parchment-dark">·</span>
        <Link href="/items" className="text-osrs-gold hover:underline">
          Item browser
        </Link>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-bold text-osrs-gold">
          {monster.name}
          {monster.version && (
            <span className="text-base font-normal text-parchment-dark ml-2">
              ({monster.version})
            </span>
          )}
        </h1>
        <p className="text-sm text-parchment-dark mt-1">
          Combat level {monster.combatLevel} · {monster.hp} HP · size {monster.size}
          {monster.weakness &&
            ` · weak to ${monster.weakness.element} +${monster.weakness.severity}%`}
          {monster.attributes.length > 0 && ` · ${monster.attributes.join(", ")}`}
        </p>
      </header>

      {/* Bank-source notice — shows live status when the RuneLite plugin
          has pushed, falls back to sample data otherwise. */}
      <div
        className={`osrs-panel rounded p-3 mb-4 text-xs flex items-center justify-between gap-3 flex-wrap ${
          live.isLive ? "border-l-4 border-status-owned text-osrs-brown" : "text-osrs-brown"
        }`}
      >
        <span>
          {live.isLive ? (
            <>
              <strong className="text-status-owned">● Live bank</strong>
              {live.playerName && <> · <span>{live.playerName}</span></>}
              {" · "}synced {secondsSince(live.receivedAt) ?? 0}s ago via RuneLite plugin
            </>
          ) : (
            <>
              <strong>Sample bank in use.</strong> Showing optimizer output for
              a representative mid-tier ranged kit. Install the RuneLite plugin
              and POST to <code>/api/bank</code> for live sync.
            </>
          )}
        </span>
        <span className="text-osrs-muted">
          {bank.itemIds.size} items · {gp.toLocaleString()} gp wallet
        </span>
      </div>

      {/* HERO — Phase 5 v1 promotes the optimizer to the top of the page.
          The big DPS number + upgrade path is the answer to "what should I do?",
          so it leads. Curated builds and manual tweaking moved below. */}
      <div className="mb-4">
        <OptimizerPanel
          bank={ownedItemIds}
          target={monster}
          skills={skills}
          gp={gp}
          priceLookup={(id) => priceForItem(prices, id)}
          mapping={mapping}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column — slimmed: player inputs + skills, no bank UI. */}
        <aside className="lg:col-span-3 space-y-4">
          <PlayerSetup
            onSubmit={({ username, gp, style }) => {
              setUsername(username);
              setGpManual(gp);
              setStyleFilter(style);
            }}
          >
            <PlayerStatsPanel
              player={player}
              isLoading={playerLoading}
              error={playerError}
            />
          </PlayerSetup>
        </aside>

        {/* Middle + right collapsed — context cards. Mechanics on the left
            of this section, spec weapons on the right. Equal weight; both
            are reference info rather than headline answers. */}
        <section className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {mechanicEvaluations.length > 0 && (
            <MechanicsPanel evaluations={mechanicEvaluations} />
          )}
          <SpecWeaponsPanel
            slug={slug}
            mapping={mapping}
            ownedItemIds={ownedItemIds}
          />
        </section>
      </div>

      {/* Curated builds — demoted to a collapsible drawer. Power users who
          want to pick a specific curated set and tweak slots can open it;
          everyone else sees the optimizer's pick instead. */}
      <details className="mt-6 osrs-panel rounded">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-osrs-brown hover:bg-parchment-dark/30 select-none">
          Compare all builds + manually tweak gear ({evaluations.length} curated)
        </summary>
        <div className="p-4 border-t border-osrs-brown/30 space-y-4">
          <p className="text-xs text-osrs-muted">
            Pick a curated set, then click any equipment slot below to swap
            individual items. DPS recomputes against this boss as you tweak.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <EquipmentPanel
                set={selectedSet}
                ownedItemIds={ownedItemIds}
                mapping={mapping}
                onSlotClick={(slot) => setPickerSlot(slot)}
              />
              {overridesActive && (
                <div className="text-xs text-osrs-brown flex items-center justify-between gap-2">
                  <span>
                    <strong>Custom loadout</strong> — {Object.keys(overrides).length} slot
                    {Object.keys(overrides).length === 1 ? "" : "s"} edited on top of{" "}
                    {baseSet?.name}.
                  </span>
                  <button
                    type="button"
                    onClick={resetOverrides}
                    className="text-osrs-gold hover:underline text-[11px]"
                  >
                    Reset
                  </button>
                </div>
              )}
              {selectedSet && selectedDps && (
                <DpsResultsPanel
                  set={selectedSet}
                  dps={selectedDps}
                  activeBonuses={selectedActiveBonuses}
                  targetHp={monster.hp}
                />
              )}
              {consumables && consumables.length > 0 && (
                <InventoryPanel consumables={consumables} mapping={mapping} />
              )}
            </div>
            <div>
              <SetupComparisonPanel
                evaluations={evaluations}
                selectedId={baseSet?.id}
                onSelect={selectSet}
                bankPresent={true}
              />
            </div>
          </div>
        </div>
      </details>

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
