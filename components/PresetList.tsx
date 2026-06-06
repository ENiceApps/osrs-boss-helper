"use client";

import type { LoadoutEvaluation } from "@/lib/recommend";

interface Props {
  evaluations: LoadoutEvaluation[];
  selectedId?: string;
  onSelect: (setId: string) => void;
}

function formatGp(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function PresetList({ evaluations, selectedId, onSelect }: Props) {
  if (evaluations.length === 0) {
    return (
      <div className="osrs-panel p-4 rounded">
        <p className="text-xs text-osrs-brown">No applicable loadouts for this target.</p>
      </div>
    );
  }

  return (
    <div className="osrs-panel p-4 rounded space-y-2">
      <h3 className="font-semibold text-osrs-brown">Recommended builds</h3>
      <ul className="space-y-2">
        {evaluations.map(({ set, viable, slotStatuses, totalCostToComplete, dps }) => {
          const isSelected = set.id === selectedId;
          const missingCount = Object.values(slotStatuses).filter((s) => s === "missing").length;
          return (
            <li key={set.id}>
              <button
                onClick={() => onSelect(set.id)}
                className={`w-full text-left p-2 rounded border ${
                  isSelected ? "border-osrs-gold bg-parchment-dark" : "border-osrs-brown bg-parchment"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-osrs-brown">{set.name}</span>
                  <span className="text-xs text-osrs-brown-light capitalize">
                    {set.style} · {set.tier}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-1 text-xs">
                  {viable ? (
                    <>
                      <span className="text-status-owned">
                        DPS: {dps ? dps.dps.toFixed(2) : "—"}
                      </span>
                      <span className="text-osrs-brown-light">
                        max hit {dps?.maxHit ?? "—"} · acc {dps ? (dps.accuracy * 100).toFixed(1) : "—"}%
                      </span>
                    </>
                  ) : (
                    <span className="text-status-missing">
                      Missing {missingCount} slot{missingCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {viable && totalCostToComplete > 0 && (
                  <p className="text-[10px] text-osrs-brown-light mt-1">
                    Buy missing items: {formatGp(totalCostToComplete)} gp
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
