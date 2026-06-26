"use client";

import { useEffect } from "react";
import { PRAYER_OPTIONS } from "@/data/prayers";
import type { CombatStyle } from "@/types/osrs";

interface Props {
  /** Combat style of the active loadout — selects which prayer ladder to show. */
  style: CombatStyle;
  /** Currently-selected prayer id. */
  currentPrayerId: string;
  /** Player's Prayer level — prayers above it are greyed (but still selectable). */
  prayerLevel: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const STYLE_LABEL: Record<CombatStyle, string> = {
  melee: "melee",
  ranged: "ranged",
  magic: "magic",
};

/**
 * Modal for picking the offensive prayer a loadout prays with. Lists the full
 * ladder for the active combat style (best → worst, plus "None"), highlighting
 * the current pick. Prayers above the player's Prayer level are greyed with a
 * reason but stay selectable for what-if comparison. Mirrors SpellPickerModal's
 * Escape / backdrop behaviour.
 */
export function PrayerPickerModal({
  style,
  currentPrayerId,
  prayerLevel,
  onSelect,
  onClose,
}: Props) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="osrs-panel rounded p-4 w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-semibold text-osrs-brown">Pick prayer</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-osrs-brown hover:text-osrs-gold text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="label-eyebrow text-osrs-muted mb-3">
          offensive {STYLE_LABEL[style]} prayer — changes DPS and prayer-pot cost
        </p>

        <ul className="overflow-y-auto flex-1 space-y-0.5">
          {PRAYER_OPTIONS[style].map((prayer) => {
            const isCurrent = prayer.id === currentPrayerId;
            const tooHigh = prayer.level > prayerLevel;
            return (
              <li key={prayer.id}>
                <button
                  type="button"
                  onClick={() => onSelect(prayer.id)}
                  className={`w-full text-left p-1.5 rounded border text-caption flex items-center gap-2 ${
                    isCurrent
                      ? "border-osrs-gold bg-osrs-gold/15"
                      : "border-transparent hover:border-osrs-gold/40 hover:bg-osrs-gold/5"
                  } ${tooHigh ? "opacity-50" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-osrs-brown truncate">
                      {prayer.name}
                    </div>
                    <div className="label-eyebrow text-osrs-brown-light flex flex-wrap gap-x-2">
                      <span>{prayer.effect}</span>
                      {prayer.drainEffect > 0 && <span>drain {prayer.drainEffect}</span>}
                    </div>
                  </div>
                  {tooHigh && (
                    <span className="label-eyebrow text-status-missing whitespace-nowrap">
                      needs {prayer.level} Prayer
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
