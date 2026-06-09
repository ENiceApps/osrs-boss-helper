"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { computeSetDps, SKILLS_AT_99 } from "@/lib/recommend";
import { optimizeForBoss } from "@/lib/optimize/bank";
import { bestBoostForStyle, bankBoostResolver } from "@/lib/dps/boost";
import { mechanicsForBoss } from "@/data/bosses/mechanics";
import { CONSUMABLES_BY_SLUG } from "@/data/bosses/consumables";
import { evaluateMechanics } from "@/lib/mechanics";
import { activeBonusesForTarget } from "@/lib/loadout";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { useLiveBank } from "@/lib/liveBank";
import { PlayerSetup } from "@/components/PlayerSetup";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { EquipmentPanel } from "@/components/EquipmentPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { MechanicsPanel } from "@/components/MechanicsPanel";
import { ItemPickerModal } from "@/components/ItemPickerModal";
import { DpsResultsPanel } from "@/components/DpsResultsPanel";
import { SpecWeaponsPanel } from "@/components/SpecWeaponsPanel";
import { OptimizerPanel } from "@/components/OptimizerPanel";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";
import { applyOverrides, hasOverrides } from "@/lib/loadout-edit";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import type { BankContents, ItemId } from "@/types/osrs";
import { asItemId } from "@/types/osrs";

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

  // The editable base is the single best setup the bank can build right now —
  // no premade/curated sets. Manual edits (below) layer on top of it. Null
  // when not connected → equipment renders empty.
  const baseSet = useMemo(() => {
    if (!bank) return undefined;
    const { rankings } = optimizeForBoss({
      bank: bank.itemIds,
      target: monster,
      skills,
      topN: 1,
      boostResolver,
    });
    return rankings[0]?.loadout;
  }, [bank, monster, skills, boostResolver]);

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
    return computeSetDps(selectedSet, monster, skills, boostResolver(selectedSet.style));
  }, [selectedSet, monster, skills, boostResolver]);

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

  const ownedItemIds = useMemo(
    () =>
      bank ? new Set(Array.from(bank.itemIds).map((id) => Number(id))) : new Set<number>(),
    [bank],
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <nav className="mb-3 text-sm">
        <Link href="/bosses" className="text-osrs-gold hover:underline">
          ← All bosses
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
      </header>

      {/* Compact context line — full connection status lives in the app
          header. Here we only note the pool + wallet feeding this boss's
          optimisation. */}
      <p className="text-caption text-osrs-muted mb-4">
        {bank
          ? `Optimising from your live bank — ${bank.itemIds.size} items · ${gp.toLocaleString()} gp wallet.`
          : "Not connected — run the osrs-boss-sync RuneLite plugin to load your bank, inventory, worn gear, and skills. Until then, equipment is empty."}
      </p>

      {/* HERO — Phase 5 v1 promotes the optimizer to the top of the page.
          The big DPS number + upgrade path is the answer to "what should I do?",
          so it leads. Curated builds and manual tweaking moved below. */}
      <div className="mb-4">
        <OptimizerPanel
          bank={bank ? ownedItemIds : null}
          target={monster}
          skills={skills}
          gp={gp}
          priceLookup={(id) => priceForItem(prices, id)}
          mapping={mapping}
          mechanics={mechanics}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column — slimmed: player inputs + skills, no bank UI. */}
        <aside className="lg:col-span-3 space-y-4">
          <PlayerSetup
            onSubmit={({ gp }) => {
              setGpManual(gp);
            }}
          >
            <PlayerStatsPanel skills={skills} isLive={live.isLive} />
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

      {/* Manual gear editing — start from the optimizer's best buildable setup
          and freely swap any slot. No premade sets; full flexibility. */}
      <details className="mt-6 osrs-panel rounded">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-osrs-brown hover:bg-parchment-dark/30 select-none">
          Tweak the setup — swap any slot
        </summary>
        <div className="p-4 border-t border-osrs-brown/30 space-y-4">
          {baseSet ? (
            <>
              <p className="text-xs text-osrs-muted">
                This starts from the best setup your bank can build, above. Click
                any equipment slot to swap in a different item — DPS recomputes
                against this boss as you tweak.
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
                        {Object.keys(overrides).length === 1 ? "" : "s"} edited on top of the optimizer&apos;s pick.
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
                  {consumablesWithBoost.length > 0 && (
                    <InventoryPanel consumables={consumablesWithBoost} mapping={mapping} />
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-osrs-brown">
              Connect your bank via the osrs-boss-sync RuneLite plugin to build
              and tweak a loadout for this boss.
            </p>
          )}
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
