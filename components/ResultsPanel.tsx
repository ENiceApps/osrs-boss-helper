"use client";

import { useState } from "react";

import { ItemIcon } from "@/components/ItemIcon";
import { StatCard } from "@/components/ui";
import { estimatePrayerSupplies } from "@/data/prayer-drain";
import { expectedGpPerKill, profitPerHour, type PriceLookup } from "@/lib/profit";
import { fmtDpsPerM, fmtGp, formatKph, formatSeconds } from "@/lib/format";
import { specMaxHitDisplay } from "@/lib/dps/spec-max-hit";
import type { BudgetResult } from "@/lib/optimize/budget";
import type { TargetActiveBonuses } from "@/lib/loadout";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { DpsResult, MappingEntry } from "@/types/osrs";

interface Props {
  bossName: string;
  bossHp: number;
  /** The active loadout and its DPS (reflects manual slot edits). */
  set?: LoadoutSet;
  dps?: DpsResult;
  activeBonuses: TargetActiveBonuses | null;
  /** Budget-mode optimizer output — upgrade path, sell list, totals. */
  result: BudgetResult | null;
  /** True when manual slot edits are active (the upgrade path then refers to
      the optimizer's pick, not the edited loadout, so it's hidden). */
  edited: boolean;
  /** Enchanted-bolt proc description, when the active loadout's ammo procs. */
  boltProcFlag?: string;
  mapping?: MappingEntry[];
  /** Player Prayer level — scales prayer-potion restore per dose. */
  prayerLevel: number;
  /** The offensive prayer the displayed DPS bakes in (name + short effect). */
  selectedPrayer: { name: string; effect: string };
  /** Drain effect of the selected prayer — drives the prayer-pot supply cost. */
  prayerDrainEffect: number;
  /** Open the prayer picker. When omitted, the Prayer row is read-only text. */
  onOpenPrayerPicker?: () => void;
  /** Live GE price of a Prayer potion(4), or null when prices are unavailable. */
  prayerPotPriceGp: number | null;
  /** Boss slug — keys the drop table for the profit/hr estimate. */
  bossSlug: string;
  /** Live GE price lookup for drop-value / profit calc. */
  priceLookup: PriceLookup;
  /** Upgrade-path items the user has toggled OFF (won't buy). */
  excludedUpgrades?: { itemId: number; name: string }[];
  /** Toggle an item in/out of the excluded set; re-plans the upgrade path. */
  onToggleUpgradeItem?: (itemId: number, name: string) => void;
  /** Player-set trip assumptions driving the kills/hr + supply + profit math. */
  trip: TripAssumptions;
  onTripChange: (patch: Partial<TripAssumptions>) => void;
  /** Live GE price of a Saradomin brew(4), or null when unavailable. */
  brewPriceGp: number | null;
}

export interface TripAssumptions {
  /** Share of the hour actually fighting (0..1). */
  uptime: number;
  /** Running a protection prayer alongside the offensive overhead. */
  protectionPrayer: boolean;
  /** Brews (4-dose) drunk per hour. */
  brewsPerHour: number;
}

/** OSRS tick is 0.6 seconds. */
const TICK_SECONDS = 0.6;

/** Conditional bonuses firing against this target, as short display flags. */
function buildActiveFlags(
  set: LoadoutSet,
  activeBonuses: TargetActiveBonuses | null,
): string[] {
  const flags: string[] = [];
  if (set.armorSetBonus) {
    // Format e.g. "Elite Void Knight (Ranged) +10%/+12.5%". Factor [n,d] →
    // percent display via (n/d - 1) * 100.
    const pct = (f?: readonly [number, number]) =>
      f ? `${((f[0] / f[1] - 1) * 100).toFixed(f[0] / f[1] >= 1.1 ? 0 : 1)}%` : null;
    const acc = pct(set.armorSetBonus.accuracyFactor);
    const dmg = pct(set.armorSetBonus.damageFactor);
    const parts = [acc && `+${acc} acc`, dmg && `+${dmg} dmg`].filter(Boolean).join(" / ");
    flags.push(`${set.armorSetBonus.name} (${parts})`);
  }
  if (activeBonuses?.conditionalBonuses.demonbane) flags.push("Demonbane +70%");
  if (activeBonuses?.conditionalBonuses.dragonHunterCrossbow) flags.push("DHCB +30/+25%");
  if (activeBonuses?.conditionalBonuses.dragonHunterLance) flags.push("DHL +20%");
  if (activeBonuses?.conditionalBonuses.dragonHunterWand) flags.push("DH wand +75/+40%");
  if (activeBonuses?.conditionalBonuses.salveAmuletEi) flags.push("Salve(ei) +20%");
  if (activeBonuses?.conditionalBonuses.salveAmulet) flags.push("Salve +16.7%");
  if (activeBonuses?.conditionalBonuses.wildernessWeapon) flags.push("Wilderness weapon +50%");
  if (activeBonuses?.tomeOfFireEquipped)  flags.push("Tome of Fire +10% dmg");
  if (activeBonuses?.tomeOfWaterEquipped) flags.push("Tome of Water +20% acc+dmg");
  if (activeBonuses?.tomeOfEarthEquipped) flags.push("Tome of Earth +10% acc+dmg");
  if (activeBonuses?.twistedBowEquipped)
    flags.push(
      `Tbow scaling (M=${activeBonuses.targetMonsterMagicLevel}${activeBonuses.targetIsXerician ? ", CoX cap" : ""})`,
    );
  if (activeBonuses?.fangEquipped) flags.push("Fang 2× accuracy roll");
  return flags;
}

/** Worn-slot display order, mirroring the in-game equipment layout. */
const GEAR_SLOT_ORDER: LoadoutSlotKey[] = [
  "head",
  "cape",
  "neck",
  "ammo",
  "weapon",
  "body",
  "shield",
  "legs",
  "hands",
  "feet",
  "ring",
];

/** Ordered, de-duplicated item names of every piece in the active loadout. */
function gearItemNames(set: LoadoutSet): string[] {
  const names: string[] = [];
  for (const slot of GEAR_SLOT_ORDER) {
    const piece = set.slots[slot];
    if (piece) names.push(piece.itemName);
  }
  // Blowpipe darts live inside the weapon, not the ammo slot — include them so
  // the withdrawal checklist is complete.
  if (set.internalAmmo) names.push(set.internalAmmo.itemName);
  return [...new Set(names)];
}

/**
 * "Copy gear list" → comma-separated item names, a withdrawal checklist the
 * player keeps on hand while pulling gear from the bank.
 */
function LoadoutExport({
  set,
}: {
  set: LoadoutSet;
}) {
  const [copied, setCopied] = useState(false);
  const names = gearItemNames(set);
  if (names.length === 0) return null;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / denied permission) — fail
      // quietly; the gear is still listed elsewhere on the page.
    }
  };

  const btnClass =
    "flex-1 osrs-well rounded px-3 py-2 text-xs font-semibold text-osrs-brown hover:text-osrs-gold transition-colors";

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => copy(names.join(", "))}
          className={btnClass}
        >
          {copied ? "Copied!" : `Copy gear list (${names.length})`}
        </button>
      </div>
      <p className="text-caption text-osrs-muted mt-1.5">
        Names for a withdrawal checklist while pulling gear from the bank.
      </p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1 border-b border-osrs-brown/15 last:border-b-0">
      <span className="label-eyebrow">{label}</span>
      <span className="text-sm font-semibold text-osrs-brown text-right">{value}</span>
    </div>
  );
}

/**
 * Right rail of the boss-page cockpit: the outcome. Hero DPS for whatever
 * loadout is active in the center column, supporting stats, the conditional
 * bonuses firing against this target, and the budget-mode upgrade path.
 */
export function ResultsPanel({
  bossName,
  bossHp,
  set,
  dps,
  activeBonuses,
  result,
  edited,
  boltProcFlag,
  mapping,
  prayerLevel,
  prayerPotPriceGp,
  selectedPrayer,
  prayerDrainEffect,
  onOpenPrayerPicker,
  bossSlug,
  priceLookup,
  excludedUpgrades = [],
  onToggleUpgradeItem,
  trip,
  onTripChange,
  brewPriceGp,
}: Props) {
  const [showDrops, setShowDrops] = useState(false);
  const [showTrip, setShowTrip] = useState(false);
  // Effective attack speed after style adjustments (Rapid = -1 ranged tick),
  // mirroring calculate.ts so the displayed cadence matches the engine.
  const rapidRangedAdjust =
    set?.attackStyleChoice === "rapid" && set?.style === "ranged" ? -1 : 0;
  const effectiveTicks = set ? Math.max(1, set.attackSpeedTicks + rapidRangedAdjust) : 0;
  const activeFlags = set ? buildActiveFlags(set, activeBonuses) : [];
  if (set && boltProcFlag) activeFlags.push(boltProcFlag);

  // Per-hour economics. The theoretical-max kills/hr is scaled by the player's
  // combat-uptime assumption; supplies and profit all use that effective rate.
  const supply = set
    ? estimatePrayerSupplies(set.style, prayerLevel, set.totals.prayerBonus, prayerPotPriceGp, {
        useProtectionPrayer: trip.protectionPrayer,
        uptime: trip.uptime,
        offensiveDrainEffect: prayerDrainEffect,
      })
    : null;
  const maxKillsPerHour = dps && dps.dps > 0 ? (3600 * dps.dps) / bossHp : 0;
  const killsPerHour = maxKillsPerHour * trip.uptime;
  // Food cost scales with how much you actually fight (uptime).
  const foodGpPerHour =
    brewPriceGp != null ? trip.brewsPerHour * brewPriceGp * trip.uptime : 0;
  const supplyGpPerHour = (supply?.gpPerHour ?? 0) + foodGpPerHour;
  const profit = expectedGpPerKill(bossSlug, priceLookup);
  const profitHr = profitPerHour(profit.gpPerKill, killsPerHour, supplyGpPerHour);

  const upgradePath = result?.upgradePath ?? [];
  const showUpgrades =
    !edited && result !== null && (upgradePath.length > 0 || excludedUpgrades.length > 0);
  const shoppingList = result?.shoppingList ?? [];
  const showShoppingList = !edited && (result?.fromScratch ?? false) && shoppingList.length > 0;

  return (
    <div className="osrs-panel p-4 rounded space-y-4">
      <h3 className="section-title font-semibold text-osrs-brown">Results</h3>

      <StatCard
        hero
        label={`DPS vs ${bossName}`}
        value={dps ? dps.dps.toFixed(2) : "—"}
        size="md"
      />

      {set && dps && (() => {
        // For weapons whose special attack changes the max hit (Osmumten's fang,
        // godswords, Voidwaker, …), split the headline into the normal-attack max
        // and a separate special-attack max so they aren't conflated.
        const specMax = set.slots.weapon
          ? specMaxHitDisplay(set.slots.weapon.itemId, dps.maxHit)
          : null;
        const specValue = specMax
          ? specMax.varies ??
            `${specMax.minHit != null ? `${specMax.minHit}–` : ""}${specMax.specMaxHit}` +
              (specMax.hits > 1 ? ` ×${specMax.hits}` : "")
          : null;
        return (
        <div>
          <StatRow label="Max hit" value={specMax ? specMax.normalMaxHit : dps.maxHit} />
          {specMax && (
            <StatRow label={`Spec max (${specMax.specName})`} value={specValue} />
          )}
          <StatRow label="Accuracy" value={`${(dps.accuracy * 100).toFixed(1)}%`} />
          <StatRow
            label={`Avg kill (${bossHp} hp)`}
            value={formatSeconds(dps.dps > 0 ? bossHp / dps.dps : Infinity)}
          />
          <StatRow
            label="Kills / hr"
            value={
              <span>
                {formatKph(killsPerHour)}
                {trip.uptime < 1 && (
                  <span className="text-caption font-normal text-osrs-muted">
                    {" "}
                    (max {formatKph(maxKillsPerHour)})
                  </span>
                )}
              </span>
            }
          />
          <StatRow
            label="Attack speed"
            value={`${effectiveTicks} ticks (${(effectiveTicks * TICK_SECONDS).toFixed(1)}s)`}
          />
          <StatRow
            label="Prayer"
            value={
              onOpenPrayerPicker ? (
                <button
                  type="button"
                  onClick={onOpenPrayerPicker}
                  className="text-left hover:text-osrs-gold underline decoration-dotted decoration-osrs-brown/40 underline-offset-2"
                  title="Change prayer"
                >
                  {selectedPrayer.name}{" "}
                  <span className="text-caption font-normal text-osrs-muted">
                    {selectedPrayer.effect}
                  </span>
                </button>
              ) : (
                <span>
                  {selectedPrayer.name}{" "}
                  <span className="text-caption font-normal text-osrs-muted">
                    {selectedPrayer.effect}
                  </span>
                </span>
              )
            }
          />
          {supply && (
            <StatRow
              label="Supplies / hr"
              value={
                <span>
                  {supply.potionsPerHour.toFixed(1)} prayer pots
                  {trip.brewsPerHour > 0 && ` · ${trip.brewsPerHour} brews`}
                  {supplyGpPerHour > 0 && (
                    <span className="text-caption font-normal text-osrs-muted">
                      {" "}
                      · {fmtGp(Math.round(supplyGpPerHour))} gp
                    </span>
                  )}
                </span>
              }
            />
          )}
          <StatRow
            label="Profit / hr"
            value={
              profit.hasData ? (
                <span className={profitHr >= 0 ? "text-status-owned" : "text-status-missing"}>
                  {profitHr >= 0 ? "" : "−"}
                  {fmtGp(Math.abs(Math.round(profitHr)))} gp
                  <span className="text-caption font-normal text-osrs-muted">
                    {" "}
                    · {fmtGp(Math.round(profit.gpPerKill))}/kill
                  </span>
                </span>
              ) : (
                <span className="text-osrs-muted">—</span>
              )
            }
          />
        </div>
        );
      })()}

      {set && dps && (
        <div className="text-caption">
          <button
            type="button"
            onClick={() => setShowTrip((v) => !v)}
            className="text-osrs-gold hover:underline"
          >
            {showTrip ? "Hide" : "Adjust"} trip assumptions
          </button>
          {showTrip && (
            <div className="mt-2 osrs-well rounded p-2.5 space-y-2.5">
              <label className="block">
                <div className="flex items-baseline justify-between">
                  <span className="text-osrs-brown font-semibold">Combat uptime</span>
                  <span className="text-osrs-muted">{Math.round(trip.uptime * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round(trip.uptime * 100)}
                  onChange={(e) => onTripChange({ uptime: Number(e.target.value) / 100 })}
                  className="w-full accent-osrs-gold"
                />
                <span className="text-osrs-muted">
                  Share of the hour actually fighting (vs banking, walking, downtime).
                </span>
              </label>
              <label className="flex items-center justify-between gap-2">
                <span className="text-osrs-brown font-semibold">Protection prayer</span>
                <input
                  type="checkbox"
                  checked={trip.protectionPrayer}
                  onChange={(e) => onTripChange({ protectionPrayer: e.target.checked })}
                  className="accent-osrs-gold w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                <span className="text-osrs-brown font-semibold">Brews / hr</span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={trip.brewsPerHour}
                  onChange={(e) =>
                    onTripChange({ brewsPerHour: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
                  }
                  className="w-16 bg-osrs-field border border-osrs-brown/30 rounded px-1.5 py-0.5 text-right text-osrs-brown"
                />
              </label>
              <p className="text-osrs-muted italic">
                Per-hour numbers assume continuous{" "}
                {trip.protectionPrayer ? "offensive + protection" : "offensive"} prayer while
                fighting. These factors vary by player — set them to your real rate.
              </p>
            </div>
          )}
        </div>
      )}

      {set && dps && profit.hasData && profit.breakdown.length > 0 && (
        <div className="text-caption">
          <button
            type="button"
            onClick={() => setShowDrops((v) => !v)}
            className="text-osrs-gold hover:underline"
          >
            {showDrops ? "Hide" : "Show"} drop value breakdown
          </button>
          {showDrops && (
            <ul className="mt-1.5 space-y-0.5">
              {profit.breakdown.slice(0, 8).map((d) => (
                <li key={d.itemId} className="flex items-baseline justify-between gap-2">
                  <span className="text-osrs-brown truncate">{d.name}</span>
                  <span className="text-osrs-muted shrink-0">{fmtGp(Math.round(d.gpPerKill))}/kill</span>
                </li>
              ))}
              <li className="text-osrs-muted italic pt-0.5">
                Expected value from the wiki drop table at live prices.
              </li>
            </ul>
          )}
        </div>
      )}

      {set && (
        <div className="text-caption">
          {activeFlags.length > 0 ? (
            <span className="text-osrs-gold">
              <span className="text-osrs-muted">Active vs this target:</span>{" "}
              {activeFlags.join(" · ")}
            </span>
          ) : (
            <span className="text-osrs-muted italic">
              No conditional bonuses active for this target.
            </span>
          )}
        </div>
      )}

      {set && (
        <LoadoutExport set={set} />
      )}

      {edited && (
        <p className="text-caption text-osrs-muted italic">
          Showing your custom edits — reset the loadout to see the optimizer&apos;s
          upgrade path again.
        </p>
      )}

      {showShoppingList && (
        <div>
          <div className="flex items-baseline justify-between mb-1 gap-2">
            <h4 className="section-title text-sm font-semibold text-osrs-brown">
              Shopping list
            </h4>
            <span className="text-caption text-osrs-muted shrink-0">
              {fmtGp(result!.totalCostGp)} gp · {fmtGp(result!.remainingGp)} left
            </span>
          </div>
          <ul className="space-y-1">
            {shoppingList.map((item) => (
              <li
                key={item.itemId}
                className="flex items-center gap-2 osrs-well rounded px-2 py-1.5 text-xs"
              >
                <ItemIcon
                  itemId={item.itemId}
                  size={28}
                  mapping={mapping}
                  title={item.name}
                />
                <span className="flex-1 truncate font-semibold text-osrs-brown">
                  {item.name}
                </span>
                <span className="text-osrs-muted shrink-0">
                  {item.valueGp === 0 ? "owned" : fmtGp(item.valueGp)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-caption text-osrs-muted mt-1.5">
            Best loadout buildable for this budget, ignoring your bank.
          </p>
        </div>
      )}

      {showUpgrades && (
        <div>
          <div className="flex items-baseline justify-between mb-1 gap-2">
            <h4 className="section-title text-sm font-semibold text-osrs-brown">
              Upgrade path
            </h4>
            <span className="text-caption text-osrs-muted shrink-0">
              {fmtGp(result.totalCostGp)} gp · {fmtGp(result.remainingGp)} left
            </span>
          </div>
          <ol className="space-y-1">
            {upgradePath.map((step, i) => (
              <li
                key={i}
                className="flex items-center gap-2 osrs-well rounded px-2 py-1.5 text-xs"
              >
                {onToggleUpgradeItem ? (
                  <input
                    type="checkbox"
                    checked
                    onChange={() => onToggleUpgradeItem(step.bought.itemId, step.bought.name)}
                    title="Uncheck to skip this item and re-plan the path around it"
                    className="shrink-0 accent-osrs-gold cursor-pointer"
                    aria-label={`Use ${step.bought.name} in the upgrade path`}
                  />
                ) : (
                  <span className="font-bold text-osrs-gold w-4 text-right shrink-0">
                    {i + 1}.
                  </span>
                )}
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
                  <div className="label-eyebrow text-osrs-muted">
                    {step.swappedOut
                      ? `Replaces ${step.swappedOut.name}`
                      : `Fills empty ${step.bought.slot} slot`}
                  </div>
                </div>
                <div className="text-right shrink-0 min-w-fit">
                  <div className="text-status-owned font-semibold">
                    +{step.dpsDelta.toFixed(2)}
                    {step.dpsBefore > 0 && (
                      <span className="text-caption font-normal text-osrs-muted">
                        {" "}
                        (+{((step.dpsDelta / step.dpsBefore) * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <div className="label-eyebrow text-osrs-muted">
                    {fmtGp(step.bought.costGp)} gp · {fmtDpsPerM(step.dpsPerGp)}/M
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {result.currentBest && result.totalDpsDelta > 0 && (
            <p className="text-caption text-osrs-muted mt-1.5">
              From your bank today: {result.currentBest.dps.dps.toFixed(2)} →{" "}
              <span className="text-status-owned font-semibold">
                {result.upgradedBest!.dps.dps.toFixed(2)} DPS
              </span>{" "}
              after buying · {fmtDpsPerM(result.totalDpsDelta / Math.max(1, result.totalCostGp))}{" "}
              DPS per 1M gp.
            </p>
          )}

          {upgradePath.length === 0 && excludedUpgrades.length > 0 && (
            <p className="text-caption text-osrs-muted italic">
              Every upgrade is excluded. Re-check an item below to plan around it.
            </p>
          )}

          {excludedUpgrades.length > 0 && onToggleUpgradeItem && (
            <div className="mt-2">
              <h5 className="label-eyebrow text-osrs-muted mb-1">
                Excluded (won&apos;t buy)
              </h5>
              <ul className="space-y-1">
                {excludedUpgrades.map((ex) => (
                  <li
                    key={ex.itemId}
                    className="flex items-center gap-2 osrs-well rounded px-2 py-1.5 text-xs opacity-70"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => onToggleUpgradeItem(ex.itemId, ex.name)}
                      title="Re-check to consider this item again"
                      className="shrink-0 accent-osrs-gold cursor-pointer"
                      aria-label={`Reconsider ${ex.name}`}
                    />
                    <ItemIcon itemId={ex.itemId} size={28} mapping={mapping} title={ex.name} />
                    <span className="flex-1 truncate text-osrs-brown line-through">
                      {ex.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!edited && result !== null && result.currentBest && upgradePath.length === 0 && excludedUpgrades.length === 0 && (
        <p className="text-caption text-osrs-muted italic">
          No profitable upgrades found within budget. Your bank is already
          optimal at this price point — try Sell-to-fund mode if you have items
          you&apos;d be willing to part with.
        </p>
      )}

      {!edited && (result?.sellList.length ?? 0) > 0 && (
        <div>
          <h4 className="section-title text-sm font-semibold text-osrs-brown mb-1">
            Sell to fund ({fmtGp(result!.sellList.reduce((s, i) => s + i.valueGp, 0))} total)
          </h4>
          <ul className="space-y-1">
            {result!.sellList.map((item) => (
              <li
                key={item.itemId}
                className="flex items-center gap-2 osrs-well rounded p-1 text-xs"
              >
                <ItemIcon
                  itemId={item.itemId}
                  size={20}
                  mapping={mapping}
                  title={item.name}
                />
                <span className="flex-1 truncate text-osrs-brown">{item.name}</span>
                <span className="text-osrs-muted">{fmtGp(item.valueGp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
