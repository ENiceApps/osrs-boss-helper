"use client";

import { useId, useState, type ReactNode } from "react";

interface Props {
  /** Header label on the phone-only toggle bar. */
  title: ReactNode;
  /** Short state summary shown next to the title while collapsed (e.g. the
   *  active budget mode), so the folded section still says what's set. */
  summary?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Folds its children behind a toggle bar on phones and tablets, and renders
 * them plainly from `lg` up. The content stays in the DOM either way (hidden
 * with CSS below `lg`), so there is no second copy of the children and no
 * hydration mismatch: the server markup is identical for every viewport, and
 * the breakpoint alone decides what shows. Used for the boss page's setup rail,
 * which on a narrow screen would otherwise be a screen's worth of controls
 * between the loadout and the rest of the page.
 */
export function MobileCollapsible({ title, summary, children, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="lg:hidden w-full osrs-panel rounded px-4 py-2.5 flex items-center gap-2 text-left"
      >
        <span className="section-title font-semibold text-osrs-brown shrink-0">{title}</span>
        {summary && (
          <span className="text-caption text-osrs-muted truncate flex-1 min-w-0 text-right">
            {summary}
          </span>
        )}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-osrs-muted transition-transform ${open ? "rotate-90" : ""}`}
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
      </button>
      <div id={id} className={`${open ? "" : "hidden"} lg:block space-y-3 mt-3 lg:mt-0`}>
        {children}
      </div>
    </div>
  );
}
