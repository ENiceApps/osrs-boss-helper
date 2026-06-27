"use client";

import { useState, type ReactNode } from "react";

interface Props {
  /** Header label. Rendered with the standard gold-rule section title. */
  title: ReactNode;
  /** Open on first render. Controlled internally afterwards so user toggles stick. */
  defaultOpen?: boolean;
  /** Optional right-aligned header slot — a count chip, DPS, "0 checked", etc. */
  right?: ReactNode;
  children: ReactNode;
  /** Extra classes on the <details> wrapper. */
  className?: string;
}

/**
 * Progressive-disclosure wrapper: a panel whose body collapses behind a
 * clickable header. Built on native <details>/<summary> so keyboard support and
 * focus are free; kept in React state so toggles survive re-renders. Used to
 * push secondary sections (hybrid, reference, untradeables, skills) out of the
 * first screen without losing access to them.
 */
export function CollapsibleSection({
  title,
  defaultOpen = false,
  right,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className={`osrs-panel rounded group ${className}`}
    >
      <summary className="list-none cursor-pointer select-none flex items-center gap-2 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
        <h3 className="section-title font-semibold text-osrs-brown flex-1 min-w-0">
          {title}
        </h3>
        {right}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-osrs-muted transition-transform group-open:rotate-90"
        >
          <path
            d="M6 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
