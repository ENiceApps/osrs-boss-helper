"use client";

import { useMemo, useState } from "react";
import { ItemIcon } from "@/components/ItemIcon";
import { findUpgrades, type BudgetMode, type BudgetResult } from "@/lib/optimize/budget";
import { setupMechanicConflicts, type SetupMechanicStatus } from "@/lib/setup-mechanics";
import { bestBoostForStyle } from "@/lib/dps/boost";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { MappingEntry, MechanicRequirement, Skills } from "@/types/osrs";

interface Props {
  bank: Set<number> | null;
  target: MonsterCatalogEntry;
  skills: Skills;
  gp: number;
  /** From lib/prices.ts via priceForItem(prices, id) — passed in by caller. */
  priceLookup: (itemId: number) => number | null;
  mapping?: MappingEntry[];
  /** Boss mechanics, used to flag setups that drop a required worn protection item. */
  mechanics?: MechanicRequirement[];
}

const MODE_LABELS: Record<BudgetMode, string> = {
  "own-only": "Own only",
  "gp-only": "With GP",
  "sell-to-fund": "Sell to fund",
};

const MODE_DESCRIPTIONS: Record<BudgetMode, string> = {
  "own-only": "What's the best loadout I can build right now from my bank?",
  "gp-only": "What should I buy with my wallet GP?",
  "sell-to-fund": "Sell unused bank items to bankroll bigger upgrades.",
};

/**
 * Format large GP numbers as "12.4M" / "1.50B" — the wiki tool / RuneLite
 * convention. Sub-million values keep their thousands separator.
 */
function fmtGp(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** DPS gained per million GP — much more readable than raw 1e-9 ratios. */
function fmtDpsPerM(dpsPerGp: number): string {
  const perM = dpsPerGp * 1_000_000;
  if (perM >= 100) return perM.toFixed(0);
  if (perM >= 10) return perM.toFixed(1);
  if (perM >= 1) return perM.toFixed(2);
  return perM.toFixed(3);
}

/**
 * Main Phase 5 panel: pick a budget mode, configure GP / sell threshold,
 * see the optimizer's pick + upgrade path + sell list.
 */
export function OptimizerPanel({ bank, target, skills, gp, priceLookup, mapping, mechanics }: Props) {
  // Default to "gp-only" when the user has a wallet — otherwise the upgrade
  // path (the headline feature) is hidden behind a click. If gp is 0 (real
  // player with nothing to spend), fall back to "own-only".
  const [mode, setMode] = useState<BudgetMode>(gp > 0 ? "gp-only" : "own-only");
  const [sellThresholdM, setSellThresholdM] = useState(1); // millions
  const sellThreshold = sellThresholdM * 1_000_000;

  const result: BudgetResult | null = useMemo(() => {
    if (!bank) return null;
    return findUpgrades({
      bank,
      target,
      skills,
      gp,
      mode,
      sellThreshold,
      priceLookup,
      applyBoost: true, // DPS reflects a standard boost potion (super combat / ranging / saturated heart)
    });
  }, [bank, target, skills, gp, mode, sellThreshold, priceLookup]);

  if (!bank) {
    return (
      <div className="osrs-panel p-4 rounded">
        <h3 className="section-title font-semibold text-osrs-brown mb-2">Bank optimizer</h3>
        <p className="text-sm text-osrs-brown">
          Paste a bank tag on the left to see your best buildable loadout and
          ranked upgrade recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="osrs-panel p-4 rounded space-y-4">
      <div>
        <h3 className="section-title font-semibold text-osrs-brown mb-1">Bank optimizer</h3>
        <p className="text-[11px] text-osrs-muted">
          {MODE_DESCRIPTIONS[mode]}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(Object.keys(MODE_LABELS) as BudgetMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 px-2 py-1 text-sm rounded border ${
              mode === m
                ? "bg-osrs-brown text-parchment border-osrs-gold"
                : "bg-parchment-dark text-osrs-brown border-osrs-brown"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Budget controls — visible only when relevant */}
      {(mode === "gp-only" || mode === "sell-to-fund") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-parchment border border-osrs-brown/40 rounded p-2">
            <div className="text-osrs-muted uppercase text-[10px] tracking-wide">
              Wallet GP
            </div>
            <div className="text-osrs-brown font-bold text-lg">{fmtGp(gp)}</div>
            <div className="text-[10px] text-osrs-muted mt-0.5">
              Set it in &ldquo;Your character&rdquo; below.
            </div>
          </div>
          {mode === "sell-to-fund" && (
            <div className="bg-parchment border border-osrs-brown/40 rounded p-2">
              <label className="block">
                <span className="text-osrs-muted uppercase text-[10px] tracking-wide">
                  Sell threshold
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={sellThresholdM}
                    onChange={(e) => setSellThresholdM(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-osrs-brown font-mono w-16 text-right">
                    {sellThresholdM === 0 ? "Sell all" : `≥ ${sellThresholdM}M`}
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {result && (
        <OptimizerResults
          result={result}
          mapping={mapping}
          mechanics={mechanics}
          bank={bank}
        />
      )}
    </div>
  );
}

function OptimizerResults({
  result,
  mapping,
  mechanics,
  bank,
}: {
  result: BudgetResult;
  mapping?: MappingEntry[];
  mechanics?: MechanicRequirement[];
  bank: Set<number> | null;
}) {
  const { currentBest, upgradedBest, upgradePath, totalCostGp, totalDpsDelta, sellList, remainingGp } = result;

  // Flag worn-slot mechanics the recommended setup drops (e.g. no dragonfire
  // protection in the shield slot AND no Super antifire in the bank).
  const setupConflicts = useMemo(
    () => setupMechanicConflicts(upgradedBest?.loadout, mechanics, bank ?? undefined),
    [upgradedBest, mechanics, bank],
  );

  if (!currentBest) {
    return (
      <div className="bg-parchment border border-osrs-brown/40 rounded p-3 text-sm text-osrs-brown">
        Your bank can&apos;t produce a valid loadout (need at least a weapon you can equip). Buy a starter weapon first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Headline: current → upgraded DPS. Hero treatment when upgrades exist
          (big "after" number, gain badge); collapses to a single stat when
          there's nothing to upgrade. */}
      {totalDpsDelta > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center items-stretch">
          <Stat label="Current DPS" value={currentBest.dps.dps.toFixed(2)} />
          <HeroStat
            label="After upgrades"
            value={upgradedBest!.dps.dps.toFixed(2)}
            badge={`+${totalDpsDelta.toFixed(2)}`}
          />
          <Stat
            label="DPS per 1M gp spent"
            value={fmtDpsPerM(totalDpsDelta / Math.max(1, totalCostGp))}
          />
        </div>
      ) : (
        <HeroStat
          label="Best DPS from your bank"
          value={currentBest.dps.dps.toFixed(2)}
        />
      )}

      {/* Best loadout — full OSRS-style equipment grid. The optimizer's pick
          is the headline answer; rendering it in the same layout as the
          curated-build drawer keeps mental model consistent. */}
      <div className="bg-parchment border border-osrs-brown/40 rounded p-3">
        <div className="text-[11px] text-osrs-muted uppercase tracking-wide mb-2 text-center">
          Best loadout {totalDpsDelta > 0 ? "after upgrades" : "from your bank"}
        </div>
        <EquipmentPanelInline
          set={upgradedBest!.loadout}
          mapping={mapping}
        />
        {/* Named gear list — reading the build shouldn't require decoding
            icons one by one. Weapon first, then the rest. */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug text-osrs-brown">
          {(["weapon", "head", "cape", "neck", "ammo", "body", "shield", "legs", "hands", "feet", "ring"] as const)
            .map((slot) => upgradedBest!.loadout.slots[slot])
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .map((piece, i, arr) => (
              <span key={`${piece.itemId}-${i}`}>
                {piece.itemName}
                {i < arr.length - 1 && <span className="text-osrs-muted"> · </span>}
              </span>
            ))}
        </div>
        <div className="text-[10px] text-osrs-muted mt-2 text-center">
          {upgradedBest!.loadout.style} · {upgradedBest!.loadout.attackStyleChoice} · max hit {upgradedBest!.dps.maxHit} · {(upgradedBest!.dps.accuracy * 100).toFixed(1)}% accuracy
        </div>
        <div className="text-[10px] text-osrs-muted mt-0.5 text-center italic">
          DPS assumes {bestBoostForStyle(upgradedBest!.loadout.style).name}
        </div>
        {setupConflicts.length > 0 && <SetupWarnings conflicts={setupConflicts} />}
      </div>

      {/* Upgrade path */}
      {upgradePath.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-1 gap-2">
            <h4 className="section-title text-sm font-semibold text-osrs-brown">
              Upgrade path
            </h4>
            <span className="text-[11px] text-osrs-muted shrink-0">
              {fmtGp(totalCostGp)} gp total · {fmtGp(remainingGp)} left
            </span>
          </div>
          <ol className="space-y-1">
            {upgradePath.map((step, i) => (
              <li
                key={i}
                className="flex items-center gap-3 bg-parchment border border-osrs-brown/40 rounded px-2 py-1.5 text-xs"
              >
                <span className="font-bold text-osrs-gold w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <ItemIcon
                  itemId={step.bought.itemId}
                  size={28}
                  mapping={mapping}
                  title={step.bought.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-osrs-brown truncate">
                    Buy {step.bought.name}
                  </div>
                  <div className="text-[10px] text-osrs-muted">
                    {step.swappedOut
                      ? `Replaces ${step.swappedOut.name}`
                      : `Fills empty ${step.bought.slot} slot`}
                  </div>
                </div>
                <div className="text-right shrink-0 min-w-fit">
                  <div className="text-status-owned font-semibold">
                    +{step.dpsDelta.toFixed(2)} DPS
                  </div>
                  <div className="text-[10px] text-osrs-muted">
                    {fmtGp(step.bought.costGp)} gp
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Sell list (sell-to-fund mode only — empty array in other modes) */}
      {sellList.length > 0 && (
        <div>
          <h4 className="section-title text-sm font-semibold text-osrs-brown mb-1">
            Sell to fund ({fmtGp(sellList.reduce((s, i) => s + i.valueGp, 0))} total)
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sellList.map((item) => (
              <li
                key={item.itemId}
                className="flex items-center gap-2 bg-parchment border border-osrs-brown/40 rounded p-1 text-xs"
              >
                <ItemIcon
                  itemId={item.itemId}
                  size={20}
                  mapping={mapping}
                  title={item.name}
                />
                <span className="flex-1 truncate text-osrs-brown">
                  {item.name}
                </span>
                <span className="text-osrs-muted">{fmtGp(item.valueGp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upgradePath.length === 0 && (
        <p className="text-xs text-osrs-muted italic">
          No profitable upgrades found within budget. Your bank is already
          optimal at this price point — try Sell-to-fund mode if you have
          items you&apos;d be willing to part with.
        </p>
      )}
    </div>
  );
}

/**
 * Warns that the recommended setup leaves a required worn-slot mechanic unmet
 * (e.g. no dragonfire protection in the shield slot, and no Super antifire in
 * the bank). This is the bridge between pure-DPS optimisation and survivability
 * — the optimiser maximises damage but doesn't know the fight's requirements.
 */
function SetupWarnings({ conflicts }: { conflicts: SetupMechanicStatus[] }) {
  return (
    <div className="mt-3 rounded border border-status-missing/60 bg-status-missing/10 p-2 space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-status-missing flex items-center gap-1">
        <span aria-hidden>⚠</span> Setup leaves a mechanic uncovered
      </div>
      {conflicts.map((c) => (
        <div key={c.requirement.id} className="text-[11px] text-osrs-brown leading-snug">
          <span className="font-semibold">{c.requirement.label}</span>
          {" — "}
          {c.requirement.remediation}
        </div>
      ))}
    </div>
  );
}

/**
 * Inline read-only OSRS-style equipment grid for the optimizer's chosen
 * loadout. Mirrors EquipmentPanel's layout without the "Equipment" heading,
 * ownership fading, or click-to-edit interaction — this is just a display
 * of "here's what to wear", not a slot picker.
 */
function EquipmentPanelInline({
  set,
  mapping,
}: {
  set: import("@/types/loadout").LoadoutSet;
  mapping?: MappingEntry[];
}) {
  return (
    <div
      className="grid mx-auto"
      style={{
        gridTemplateAreas: `
          ".    head .   "
          "cape neck ammo"
          "weap body shld"
          ".    legs .   "
          "hand feet ring"
        `,
        gridTemplateColumns: "56px 56px 56px",
        gap: "6px",
        justifyContent: "center",
      }}
    >
      {(["head", "cape", "neck", "ammo", "weapon", "body", "shield", "legs", "hands", "feet", "ring"] as const).map((slot) => {
        const piece = set.slots[slot];
        const area = (
          { head: "head", cape: "cape", neck: "neck", ammo: "ammo", weapon: "weap",
            body: "body", shield: "shld", legs: "legs", hands: "hand", feet: "feet", ring: "ring" } as const
        )[slot];
        return (
          <div
            key={slot}
            className={`osrs-slot flex items-center justify-center ${piece ? "" : "osrs-slot-empty"}`}
            style={{ gridArea: area, width: 56, height: 56 }}
            title={piece?.itemName ?? slot}
          >
            {piece && (
              <ItemIcon
                itemId={piece.itemId}
                size={44}
                mapping={mapping}
                title={piece.itemName}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-osrs-brown",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-parchment border border-osrs-brown rounded p-2">
      <div className={`font-bold text-2xl leading-tight ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-osrs-muted mt-0.5">
        {label}
      </div>
    </div>
  );
}

/**
 * Bigger Stat for the headline "answer" — the single number the user came
 * to this page for. Optional `badge` shows the delta vs current (green pill).
 */
function HeroStat({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="bg-parchment border-2 border-osrs-gold rounded p-3 flex flex-col items-center justify-center">
      <div className="font-bold text-5xl leading-none text-osrs-brown">
        {value}
        {badge && (
          <span className="ml-2 text-base align-top text-status-owned font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-osrs-muted mt-1">
        {label}
      </div>
    </div>
  );
}

