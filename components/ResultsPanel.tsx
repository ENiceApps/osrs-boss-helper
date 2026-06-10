"use client";

import { ItemIcon } from "@/components/ItemIcon";
import { StatCard } from "@/components/ui";
import { fmtDpsPerM, fmtGp, formatSeconds } from "@/lib/format";
import type { BudgetResult } from "@/lib/optimize/budget";
import type { TargetActiveBonuses } from "@/lib/loadout";
import type { LoadoutSet } from "@/types/loadout";
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
  if (activeBonuses?.conditionalBonuses.salveAmuletEi) flags.push("Salve(ei) +20%");
  if (activeBonuses?.conditionalBonuses.salveAmulet) flags.push("Salve +16.7%");
  if (activeBonuses?.tomeOfFireEquipped) flags.push("Tome of Fire +10%");
  if (activeBonuses?.twistedBowEquipped)
    flags.push(
      `Tbow scaling (M=${activeBonuses.targetMonsterMagicLevel}${activeBonuses.targetIsXerician ? ", CoX cap" : ""})`,
    );
  return flags;
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
}: Props) {
  // Effective attack speed after style adjustments (Rapid = -1 ranged tick),
  // mirroring calculate.ts so the displayed cadence matches the engine.
  const rapidRangedAdjust =
    set?.attackStyleChoice === "rapid" && set?.style === "ranged" ? -1 : 0;
  const effectiveTicks = set ? Math.max(1, set.attackSpeedTicks + rapidRangedAdjust) : 0;
  const activeFlags = set ? buildActiveFlags(set, activeBonuses) : [];
  if (set && boltProcFlag) activeFlags.push(boltProcFlag);

  const upgradePath = result?.upgradePath ?? [];
  const showUpgrades = !edited && result !== null && upgradePath.length > 0;

  return (
    <div className="osrs-panel p-4 rounded space-y-4">
      <h3 className="section-title font-semibold text-osrs-brown">Results</h3>

      <StatCard
        hero
        label={`DPS vs ${bossName}`}
        value={dps ? dps.dps.toFixed(2) : "—"}
        size="md"
      />

      {set && dps && (
        <div>
          <StatRow label="Max hit" value={dps.maxHit} />
          <StatRow label="Accuracy" value={`${(dps.accuracy * 100).toFixed(1)}%`} />
          <StatRow
            label={`Avg kill (${bossHp} hp)`}
            value={formatSeconds(dps.dps > 0 ? bossHp / dps.dps : Infinity)}
          />
          <StatRow
            label="Attack speed"
            value={`${effectiveTicks} ticks (${(effectiveTicks * TICK_SECONDS).toFixed(1)}s)`}
          />
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

      {edited && (
        <p className="text-caption text-osrs-muted italic">
          Showing your custom edits — reset the loadout to see the optimizer&apos;s
          upgrade path again.
        </p>
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
                <span className="font-bold text-osrs-gold w-4 text-right shrink-0">
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
                    +{step.dpsDelta.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-osrs-muted">
                    {fmtGp(step.bought.costGp)} gp
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
        </div>
      )}

      {!edited && result !== null && result.currentBest && upgradePath.length === 0 && (
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
