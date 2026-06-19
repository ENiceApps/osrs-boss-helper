"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmtGp } from "@/lib/format";
import type { BudgetMode } from "@/lib/optimize/budget";

interface Props {
  mode: BudgetMode;
  onModeChange: (mode: BudgetMode) => void;
  /** Effective wallet GP (live value when the plugin reports one). */
  gp: number;
  /** True when GP comes from the RuneLite plugin — the input becomes read-only. */
  gpIsLive: boolean;
  onGpChange: (gp: number) => void;
  /** Budget-mode spend (from-scratch), independent of wallet GP. Also the
   *  risk cap reused by "wildy-risk" mode. */
  budgetGp: number;
  onBudgetChange: (gp: number) => void;
  /** True for wilderness bosses — unlocks the "Risk it" (wildy-risk) mode. */
  isWildernessBoss?: boolean;
  /** Skills block (PlayerStatsPanel), rendered inside the same card. */
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

// Budget slider runs on a log scale — most of the interesting range is below
// 200M, so a linear slider would bunch it all into the first 10%.
const BUDGET_MIN = 1_000_000;
const BUDGET_MAX = 2_000_000_000;
const SLIDER_STEPS = 1000;
const LN_MIN = Math.log(BUDGET_MIN);
const LN_SPAN = Math.log(BUDGET_MAX) - LN_MIN;

function roundNiceGp(gp: number): number {
  if (gp >= 100_000_000) return Math.round(gp / 5_000_000) * 5_000_000;
  if (gp >= 10_000_000) return Math.round(gp / 1_000_000) * 1_000_000;
  if (gp >= 1_000_000) return Math.round(gp / 100_000) * 100_000;
  return Math.round(gp / 10_000) * 10_000;
}

function gpToSlider(gp: number): number {
  const clamped = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, gp));
  return Math.round(((Math.log(clamped) - LN_MIN) / LN_SPAN) * SLIDER_STEPS);
}

function sliderToGp(pos: number): number {
  return roundNiceGp(Math.exp(LN_MIN + (pos / SLIDER_STEPS) * LN_SPAN));
}

/**
 * Left-rail setup card. Every control applies immediately — there is no
 * "update" button; the optimizer recomputes reactively as inputs change.
 */
export function SetupPanel({
  mode,
  onModeChange,
  gp,
  gpIsLive,
  onGpChange,
  budgetGp,
  onBudgetChange,
  isWildernessBoss = false,
  children,
}: Props) {
  const modeOptions = isWildernessBoss
    ? [...MODE_OPTIONS, WILDY_RISK_OPTION]
    : MODE_OPTIONS;
  // Both "budget" and "wildy-risk" use the same GP-cap slider (spend vs risk).
  const showCapSlider = mode === "budget" || mode === "wildy-risk";
  const [gpText, setGpText] = useState(() => String(gp));
  const [budgetText, setBudgetText] = useState(() => String(budgetGp));
  const [budgetSlider, setBudgetSlider] = useState(() => gpToSlider(budgetGp));
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const budgetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      clearTimeout(commitTimer.current);
      clearTimeout(budgetTimer.current);
    },
    [],
  );

  // Debounced commit: the optimizer run is not free, so wait for the user to
  // stop typing/dragging rather than recomputing on every keystroke.
  function handleGpInput(text: string) {
    setGpText(text);
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      const parsed = Number(text.replace(/[^0-9]/g, ""));
      onGpChange(Number.isFinite(parsed) ? parsed : 0);
    }, 250);
  }

  function commitBudget(gpValue: number) {
    clearTimeout(budgetTimer.current);
    budgetTimer.current = setTimeout(() => onBudgetChange(gpValue), 250);
  }

  function handleBudgetSlider(pos: number) {
    setBudgetSlider(pos);
    const gpValue = sliderToGp(pos);
    setBudgetText(String(gpValue));
    commitBudget(gpValue);
  }

  function handleBudgetInput(text: string) {
    setBudgetText(text);
    const parsed = Number(text.replace(/[^0-9]/g, ""));
    const gpValue = Number.isFinite(parsed) ? parsed : 0;
    setBudgetSlider(gpToSlider(gpValue));
    commitBudget(gpValue);
  }

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

      {(mode === "gp-only" || mode === "sell-to-fund") && (
        <div>
          <label className="block">
            <span className="label-eyebrow">Wallet GP</span>
            {gpIsLive ? (
              <div className="mt-1 p-2 bg-parchment-dark/40 border border-osrs-brown/40 rounded">
                <span className="text-lg font-bold text-osrs-brown">{fmtGp(gp)}</span>
                <span className="text-caption text-osrs-muted ml-2">
                  live from the plugin
                </span>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  value={gpText}
                  onChange={(e) => handleGpInput(e.target.value)}
                  className="mt-1 w-full p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown"
                  placeholder="500000000"
                />
                <span className="block text-caption text-osrs-muted mt-1">
                  = {fmtGp(Number(gpText.replace(/[^0-9]/g, "")) || 0)} gp to spend
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {showCapSlider && (
        <div>
          <label className="block">
            <span className="label-eyebrow">{mode === "wildy-risk" ? "Risk cap" : "Budget"}</span>
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS}
              step={1}
              value={budgetSlider}
              onChange={(e) => handleBudgetSlider(Number(e.target.value))}
              className="mt-1 w-full"
              aria-label={mode === "wildy-risk" ? "Risk cap" : "Loadout budget"}
            />
            <input
              type="text"
              inputMode="numeric"
              value={budgetText}
              onChange={(e) => handleBudgetInput(e.target.value)}
              className="mt-1 w-full p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown"
              placeholder="100000000"
            />
            <span className="block text-caption text-osrs-muted mt-1">
              {mode === "wildy-risk"
                ? `= ${fmtGp(budgetGp)} max worn value to risk`
                : `= ${fmtGp(budgetGp)} to spend, ignoring your bank`}
            </span>
          </label>
        </div>
      )}

      {children && (
        <div className="pt-3 border-t border-osrs-brown/30">{children}</div>
      )}

      <p className="text-caption text-osrs-muted italic">
        Changes apply instantly — no save button needed.
      </p>
    </div>
  );
}
