"use client";

import { useEffect, useState } from "react";
import {
  ACCENTS,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_ID,
  applyAccent,
  type AccentId,
} from "@/lib/accent";

/**
 * A small row of colored boxes in the header. Clicking one re-tints every
 * accent (`osrs-gold`) surface in the app by swapping the --accent /
 * --accent-light CSS variables, and remembers the choice in localStorage.
 *
 * On mount this applies the saved color (and in production the layout's
 * pre-paint script has already applied it, so there's no flash). After that it
 * owns the active-swatch highlight and click handling.
 */
export function AccentPicker() {
  const [activeId, setActiveId] = useState<AccentId>(DEFAULT_ACCENT_ID);

  // Apply the saved accent and sync the highlighted swatch on mount. localStorage
  // is unavailable during SSR, so this one-time read must run after mount — which
  // makes the setState-in-effect legitimate here (same pattern as the boss page's
  // hydration effect).
  useEffect(() => {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentId | null;
    const accent = ACCENTS.find((a) => a.id === stored);
    if (accent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(accent.id);
      applyAccent(accent);
    }
  }, []);

  function choose(id: AccentId) {
    const accent = ACCENTS.find((a) => a.id === id);
    if (!accent) return;
    applyAccent(accent);
    localStorage.setItem(ACCENT_STORAGE_KEY, id);
    setActiveId(id);
  }

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Highlight color"
    >
      {ACCENTS.map((a) => {
        const active = a.id === activeId;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={a.label}
            title={a.label}
            onClick={() => choose(a.id)}
            className={`h-4 w-4 rounded-sm border transition-transform hover:scale-110 ${
              active
                ? "border-foreground ring-1 ring-foreground/70"
                : "border-black/40"
            }`}
            style={{ backgroundColor: a.base }}
          />
        );
      })}
    </div>
  );
}
