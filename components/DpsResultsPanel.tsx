"use client";

import type { DpsResult } from "@/types/osrs";
import type { LoadoutSet } from "@/types/loadout";
import type { TargetActiveBonuses } from "@/lib/loadout";

interface Props {
  set: LoadoutSet;
  dps: DpsResult;
  activeBonuses: TargetActiveBonuses | null;
  /** Target HP — drives time-to-kill computation. */
  targetHp: number;
}

/** OSRS tick is 0.6 seconds. */
const TICK_SECONDS = 0.6;

function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "—";
  if (s < 60) return `${s.toFixed(1)}s`;
  const minutes = Math.floor(s / 60);
  const seconds = Math.round(s % 60);
  return `${minutes}m ${seconds}s`;
}

/**
 * Big, prominent DPS scorecard — modelled on the "Results" panel in the
 * wgloop DPS calculator. Each stat gets its own column with a large value
 * and a small label, so a quick glance answers "is this loadout good?".
 */
export function DpsResultsPanel({ set, dps, activeBonuses, targetHp }: Props) {
  // Effective attack speed after style adjustments (Rapid = -1 ranged tick).
  // Pulled from the set + attackStyleChoice — mirror of the logic in
  // calculate.ts so the number we display matches the engine's actual ticks.
  const rapidRangedAdjust = set.attackStyleChoice === "rapid" && set.style === "ranged" ? -1 : 0;
  const effectiveTicks = Math.max(1, set.attackSpeedTicks + rapidRangedAdjust);
  const secondsPerHit = effectiveTicks * TICK_SECONDS;
  const avgTtkSeconds = dps.dps > 0 ? targetHp / dps.dps : Infinity;

  const activeFlags: string[] = [];
  if (set.armorSetBonus) {
    // Format e.g. "Elite Void Knight (Ranged) +10%/+12.5%". Factor [n,d] →
    // percent display via (n/d - 1) * 100.
    const pct = (f?: readonly [number, number]) =>
      f ? `${((f[0] / f[1] - 1) * 100).toFixed(f[0] / f[1] >= 1.1 ? 0 : 1)}%` : null;
    const acc = pct(set.armorSetBonus.accuracyFactor);
    const dmg = pct(set.armorSetBonus.damageFactor);
    const parts = [acc && `+${acc} acc`, dmg && `+${dmg} dmg`].filter(Boolean).join(" / ");
    activeFlags.push(`${set.armorSetBonus.name} (${parts})`);
  }
  if (activeBonuses?.conditionalBonuses.demonbane)
    activeFlags.push("Demonbane +70%");
  if (activeBonuses?.conditionalBonuses.dragonHunterCrossbow)
    activeFlags.push("DHCB +30/+25%");
  if (activeBonuses?.conditionalBonuses.dragonHunterLance)
    activeFlags.push("DHL +20%");
  if (activeBonuses?.conditionalBonuses.salveAmuletEi)
    activeFlags.push("Salve(ei) +20%");
  if (activeBonuses?.conditionalBonuses.salveAmulet)
    activeFlags.push("Salve +16.7%");
  if (activeBonuses?.tomeOfFireEquipped) activeFlags.push("Tome of Fire +10%");
  if (activeBonuses?.twistedBowEquipped)
    activeFlags.push(
      `Tbow scaling (M=${activeBonuses.targetMonsterMagicLevel}${activeBonuses.targetIsXerician ? ", CoX cap" : ""})`,
    );

  return (
    <div className="osrs-panel rounded p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-osrs-brown">DPS results</h3>
        <span className="text-[11px] text-parchment-dark">
          vs {targetHp} HP target
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          label="DPS"
          value={dps.dps.toFixed(2)}
          accent="text-status-owned"
          primary
        />
        <Stat label="Max hit" value={String(dps.maxHit)} />
        <Stat
          label="Accuracy"
          value={`${(dps.accuracy * 100).toFixed(1)}%`}
        />
        <Stat label="Avg. TTK" value={formatSeconds(avgTtkSeconds)} />
      </div>

      <div className="mt-3 pt-3 border-t border-osrs-brown/30 space-y-1 text-xs text-osrs-brown">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span>
            <span className="text-parchment-dark">Style:</span>{" "}
            <span className="capitalize">{set.style}</span> ·{" "}
            <span>{set.attackStyleChoice}</span>
          </span>
          <span>
            <span className="text-parchment-dark">Attack:</span>{" "}
            {effectiveTicks} tick{effectiveTicks === 1 ? "" : "s"} (
            {secondsPerHit.toFixed(1)}s)
          </span>
          <span>
            <span className="text-parchment-dark">Bonuses:</span> +
            {set.totals.attackBonus} atk
            {set.totals.strengthBonus !== 0 &&
              ` · +${set.totals.strengthBonus} str`}
            {set.totals.magicDamagePct !== undefined &&
              ` · ${set.totals.magicDamagePct.toFixed(1)}% mag dmg`}
          </span>
        </div>
        {activeFlags.length > 0 ? (
          <div className="text-osrs-gold">
            <span className="text-parchment-dark">Active vs this target:</span>{" "}
            {activeFlags.join(" · ")}
          </div>
        ) : (
          <div className="text-parchment-dark italic">
            No conditional bonuses active for this target.
          </div>
        )}
        {set.notes && (
          <p className="text-osrs-brown-light italic pt-1">{set.notes}</p>
        )}
      </div>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  accent?: string;
  primary?: boolean;
}

function Stat({ label, value, accent = "text-osrs-brown", primary }: StatProps) {
  return (
    <div className="bg-parchment border border-osrs-brown rounded p-2 text-center">
      <div
        className={`font-bold ${accent} ${primary ? "text-3xl" : "text-2xl"} leading-tight`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-parchment-dark mt-0.5">
        {label}
      </div>
    </div>
  );
}
