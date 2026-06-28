"use client";

// Budget-mode selector card (left rail). Chooses how loadouts are sourced:
// "Own only" (just your bank), "With GP" (buy with wallet GP), "Sell to fund"
// (liquidate gear to bankroll upgrades), "Budget" (from-scratch spend cap), and
// "Risk it" for wilderness bosses. Renders the setup toggles (on-task,
// Soulreaper, Dharok) passed in as children.

import { type ReactNode } from "react";
import type { BudgetMode } from "@/lib/optimize/budget";

interface Props {
  mode: BudgetMode;
  onModeChange: (mode: BudgetMode) => void;
  /** True for wilderness bosses — unlocks the "Risk it" (wildy-risk) mode. */
  isWildernessBoss?: boolean;
  /** Setup toggles (on-task, Soulreaper, Dharok), rendered inside the card. */
  children?: ReactNode;
}

const MODE_OPTIONS: Array<{ mode: BudgetMode; label: string; caption: string }> = [
  {
    mode: "own-only",
    label: "Own only",
    caption: "Best loadout from items already in my bank.",
  },
  {
    mode: "gp-only",
    label: "With GP",
    caption: "What should I buy with my wallet GP?",
  },
  {
    mode: "sell-to-fund",
    label: "Sell to fund",
    caption: "Sell chosen bank items to bankroll bigger upgrades.",
  },
  {
    mode: "budget",
    label: "Budget",
    caption: "Best loadout for a set amount, ignoring my bank.",
  },
];

// Wilderness-only mode, appended when the boss is in the Wilderness.
const WILDY_RISK_OPTION: { mode: BudgetMode; label: string; caption: string } = {
  mode: "wildy-risk",
  label: "Risk it (Wilderness)",
  caption: "Best loadout worth no more than the GP I'll risk to PKers.",
};

/**
 * Left-rail setup card: pick how the optimizer should source gear (mode) plus
 * the fight-setup toggles. Every control applies immediately — there is no
 * "update" button; the optimizer recomputes reactively. The budget/GP amount
 * itself lives in <BudgetControl>, mounted above the gear doll.
 */
export function SetupPanel({
  mode,
  onModeChange,
  isWildernessBoss = false,
  children,
}: Props) {
  const modeOptions = isWildernessBoss
    ? [...MODE_OPTIONS, WILDY_RISK_OPTION]
    : MODE_OPTIONS;

  return (
    <div className="osrs-panel p-4 rounded space-y-4">
      <h3 className="section-title font-semibold text-osrs-brown">Your setup</h3>

      <fieldset>
        <legend className="label-eyebrow mb-1.5">Budget mode</legend>
        <div className="space-y-1.5" role="radiogroup">
          {modeOptions.map((opt) => {
            const active = mode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onModeChange(opt.mode)}
                className={`w-full text-left rounded border px-2.5 py-1.5 ${
                  active
                    ? "bg-osrs-gold border-osrs-gold"
                    : "bg-parchment-dark/10 border-osrs-brown/40 hover:border-osrs-gold/60"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    active ? "text-background" : "text-osrs-brown"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`block text-caption ${
                    active ? "text-background/80" : "text-osrs-muted"
                  }`}
                >
                  {opt.caption}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {children && <div className="space-y-1">{children}</div>}

      <p className="text-caption text-osrs-muted italic">
        Changes apply instantly — no save button needed.
      </p>
    </div>
  );
}
