"use client";

// Boss-phase selector — pill row under the boss stats table. Shown only for
// fights with more than one selectable state (Zulrah's forms, Verzik's phases,
// Tormented Demon's shield…). Selecting a phase swaps the target the entire
// cockpit computes against, so the stats table, optimizer, and DPS all follow.

import type { PhaseOption } from "@/lib/phases";

interface Props {
  options: PhaseOption[];
  /** Active option id (the first option is the boss's default). */
  activeId: string;
  onChange: (id: string) => void;
}

export function BossPhasePanel({ options, activeId, onChange }: Props) {
  if (options.length < 2) return null;
  const active = options.find((o) => o.id === activeId) ?? options[0];

  return (
    <div className="osrs-panel rounded px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="label-eyebrow">Boss phase</span>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Boss phase">
          {options.map((opt) => {
            const isActive = opt.id === active.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(opt.id)}
                className={`rounded border px-2.5 py-1 text-sm font-semibold ${
                  isActive
                    ? "bg-osrs-gold border-osrs-gold text-background"
                    : "bg-parchment-dark/10 border-osrs-brown/40 text-osrs-brown hover:border-osrs-gold/60"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      {active.note && (
        <p className="text-caption text-osrs-muted mt-1.5">{active.note}</p>
      )}
    </div>
  );
}
