"use client";

// Wallet-GP and budget inputs for the setup panel. The wallet field accepts
// k/m/b shorthand and goes read-only when the plugin reports live GP; the budget
// amount uses a log-scaled slider (most upgrades happen below 200M, so a linear
// slider would bunch them all into the low end). Shared by the gp-only, budget,
// and wildy-risk modes.

import { useEffect, useRef, useState } from "react";
import { fmtGp, parseGp } from "@/lib/format";
import type { BudgetMode } from "@/lib/optimize/budget";

interface Props {
  mode: BudgetMode;
  /** Effective wallet GP (live value when the plugin reports one). */
  gp: number;
  /** True when GP comes from the RuneLite plugin — the input becomes read-only. */
  gpIsLive: boolean;
  onGpChange: (gp: number) => void;
  /** Budget-mode spend (from-scratch), independent of wallet GP. Also the
   *  risk cap reused by "wildy-risk" mode. */
  budgetGp: number;
  onBudgetChange: (gp: number) => void;
}

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
 * Compact budget / wallet-GP control. Lives directly above the gear doll so the
 * slider sits next to the loadout it changes. Renders the input the active mode
 * needs — slider (budget / wildy-risk), wallet-GP (gp-only / sell-to-fund) — and
 * nothing for own-only. Every change applies immediately (debounced), no button.
 */
export function BudgetControl({
  mode,
  gp,
  gpIsLive,
  onGpChange,
  budgetGp,
  onBudgetChange,
}: Props) {
  // Both "budget" and "wildy-risk" use the same GP-cap slider (spend vs risk).
  const showCapSlider = mode === "budget" || mode === "wildy-risk";
  const showWalletGp = mode === "gp-only" || mode === "sell-to-fund";
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
    commitTimer.current = setTimeout(() => onGpChange(parseGp(text)), 250);
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
    const gpValue = parseGp(text);
    setBudgetSlider(gpToSlider(gpValue));
    commitBudget(gpValue);
  }

  // own-only ignores GP entirely — no control to show.
  if (!showCapSlider && !showWalletGp) return null;

  if (showWalletGp) {
    return (
      <div className="osrs-panel rounded p-3">
        {gpIsLive ? (
          <div className="flex items-baseline gap-2">
            <span className="label-eyebrow shrink-0">Wallet GP</span>
            <span className="text-lg font-bold text-osrs-brown">{fmtGp(gp)}</span>
            <span className="text-caption text-osrs-muted">live from the plugin</span>
          </div>
        ) : (
          <label className="flex items-center gap-2">
            <span className="label-eyebrow shrink-0">Wallet GP</span>
            <input
              type="text"
              inputMode="text"
              value={gpText}
              onChange={(e) => handleGpInput(e.target.value)}
              className="flex-1 min-w-0 p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm"
              placeholder="500m"
            />
            <span className="text-caption text-osrs-muted shrink-0 tabular-nums">
              {fmtGp(parseGp(gpText))}
            </span>
          </label>
        )}
      </div>
    );
  }

  // Budget / wildy-risk cap slider.
  const isRisk = mode === "wildy-risk";
  return (
    <div className="osrs-panel rounded p-3">
      <div className="flex items-center gap-3">
        <span className="label-eyebrow shrink-0">{isRisk ? "Risk cap" : "Budget"}</span>
        <input
          type="range"
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={budgetSlider}
          onChange={(e) => handleBudgetSlider(Number(e.target.value))}
          className="flex-1 min-w-0 accent-osrs-gold"
          aria-label={isRisk ? "Risk cap" : "Loadout budget"}
        />
        <input
          type="text"
          inputMode="text"
          value={budgetText}
          onChange={(e) => handleBudgetInput(e.target.value)}
          className="w-28 shrink-0 p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm text-right tabular-nums"
          placeholder="100m"
        />
      </div>
      <p className="text-caption text-osrs-muted mt-1">
        {isRisk
          ? `= ${fmtGp(budgetGp)} max worn value to risk`
          : `= ${fmtGp(budgetGp)} to spend, ignoring your bank`}
      </p>
    </div>
  );
}
