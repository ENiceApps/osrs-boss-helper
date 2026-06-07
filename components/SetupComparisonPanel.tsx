"use client";

import type { LoadoutEvaluation } from "@/lib/recommend";
import type { CombatStyle } from "@/types/osrs";

interface Props {
  /** Already-ranked evaluations. Component groups them by style internally. */
  evaluations: LoadoutEvaluation[];
  selectedId?: string;
  onSelect: (setId: string) => void;
  /** When true, slot-statuses are meaningful (the user has pasted a bank tag). */
  bankPresent: boolean;
  /** Max cards shown per column. Default 3. */
  perStyle?: number;
}

const STYLE_COLUMNS: Array<{ style: CombatStyle; label: string; accent: string }> = [
  { style: "ranged", label: "Ranged", accent: "border-t-green-700" },
  { style: "melee", label: "Melee", accent: "border-t-red-700" },
  { style: "magic", label: "Magic", accent: "border-t-blue-700" },
];

function formatGp(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/**
 * Side-by-side comparison of best loadouts per combat style for the current
 * target, accounting for the user's bank + budget when present. Inspired by
 * the tab layout on tools.runescape.wiki/osrs-dps but in a single view —
 * easier to answer "should I bring ranged or melee here, and what's the
 * upgrade path within my budget?"
 */
export function SetupComparisonPanel({
  evaluations,
  selectedId,
  onSelect,
  bankPresent,
  perStyle = 3,
}: Props) {
  // Group sorted evaluations by style (preserves the existing DPS-descending order).
  const byStyle: Record<CombatStyle, LoadoutEvaluation[]> = {
    ranged: [],
    melee: [],
    magic: [],
  };
  for (const ev of evaluations) byStyle[ev.set.style].push(ev);

  return (
    <div className="osrs-panel p-4 rounded">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h3 className="section-title font-semibold text-osrs-brown">Setup comparison</h3>
        <p className="text-[11px] text-osrs-muted">
          {bankPresent
            ? "Best loadout per style for your bank + budget. Click to view its equipment."
            : "Best loadout per style at 99 stats. Paste a bank tag for ownership / affordability."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STYLE_COLUMNS.map(({ style, label, accent }) => {
          const items = byStyle[style].slice(0, perStyle);
          const best = items[0];
          return (
            <div
              key={style}
              className={`bg-parchment border-t-4 ${accent} border-l border-r border-b border-osrs-brown rounded p-2`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-bold text-sm text-osrs-brown uppercase tracking-wide">
                  {label}
                </span>
                {best?.dps && (
                  <span className="text-[10px] text-osrs-gold">
                    Best: {best.dps.dps.toFixed(2)} DPS
                  </span>
                )}
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-osrs-muted italic">
                  No {label.toLowerCase()} sets apply to this target yet.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((ev) => {
                    const isSelected = ev.set.id === selectedId;
                    const missingCount = Object.values(ev.slotStatuses).filter(
                      (s) => s === "missing",
                    ).length;
                    return (
                      <li key={ev.set.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(ev.set.id)}
                          className={`w-full text-left p-1.5 rounded border text-xs transition-colors ${
                            isSelected
                              ? "border-osrs-gold bg-parchment-dark"
                              : "border-osrs-brown/40 hover:border-osrs-gold/60 hover:bg-osrs-gold/5"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-semibold text-osrs-brown truncate">
                              {ev.set.name}
                            </span>
                            <span className="text-[10px] text-osrs-brown-light flex-shrink-0">
                              {ev.set.tier}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-2 mt-0.5">
                            {ev.viable && ev.dps ? (
                              <>
                                <span className="text-status-owned font-semibold">
                                  {ev.dps.dps.toFixed(2)} DPS
                                </span>
                                <span className="text-[10px] text-osrs-brown-light">
                                  max {ev.dps.maxHit} · {(ev.dps.accuracy * 100).toFixed(0)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-status-missing text-[11px]">
                                Missing {missingCount} slot{missingCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                          {bankPresent && ev.viable && ev.totalCostToComplete > 0 && (
                            <div className="text-[10px] text-status-affordable mt-0.5">
                              Buy missing: {formatGp(ev.totalCostToComplete)}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
