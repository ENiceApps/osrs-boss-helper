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
  /** Sell-to-fund threshold, in millions. */
  sellThresholdM: number;
  onSellThresholdChange: (millions: number) => void;
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
    caption: "Sell unused bank items to bankroll bigger upgrades.",
  },
];

/**
 * Left-rail setup card. Every control applies immediately — there is no
 * "update" button; the optimizer recomputes reactively as inputs change.
 * Replaces the old PlayerSetup card (whose combat-style buttons were dead
 * controls — the optimizer always auto-picks the best style).
 */
export function SetupPanel({
  mode,
  onModeChange,
  gp,
  gpIsLive,
  onGpChange,
  sellThresholdM,
  onSellThresholdChange,
  children,
}: Props) {
  const [gpText, setGpText] = useState(() => String(gp));
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(commitTimer.current), []);

  // Debounced commit: the optimizer run is not free, so wait for the user to
  // stop typing rather than recomputing on every keystroke.
  function handleGpInput(text: string) {
    setGpText(text);
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      const parsed = Number(text.replace(/[^0-9]/g, ""));
      onGpChange(Number.isFinite(parsed) ? parsed : 0);
    }, 250);
  }

  return (
    <div className="osrs-panel p-4 rounded space-y-4">
      <h3 className="section-title font-semibold text-osrs-brown">Your setup</h3>

      <fieldset>
        <legend className="label-eyebrow mb-1.5">Budget mode</legend>
        <div className="space-y-1.5" role="radiogroup">
          {MODE_OPTIONS.map((opt) => {
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
                    ? "bg-osrs-brown border-osrs-gold"
                    : "bg-parchment-dark/40 border-osrs-brown/40 hover:border-osrs-brown"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    active ? "text-parchment" : "text-osrs-brown"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`block text-caption ${
                    active ? "text-parchment-dark" : "text-osrs-muted"
                  }`}
                >
                  {opt.caption}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {mode !== "own-only" && (
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
                  className="mt-1 w-full p-2 bg-parchment-dark border border-osrs-brown rounded text-osrs-brown"
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

      {mode === "sell-to-fund" && (
        <label className="block">
          <span className="label-eyebrow">Sell threshold</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={sellThresholdM}
              onChange={(e) => onSellThresholdChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-osrs-brown font-mono text-xs w-16 text-right">
              {sellThresholdM === 0 ? "Sell all" : `≥ ${sellThresholdM}M`}
            </span>
          </div>
        </label>
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
