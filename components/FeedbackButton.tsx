"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackForm, useFeedback } from "@/components/FeedbackForm";

/**
 * Floating "Feedback" button pinned to the top-right corner, just below the
 * sticky header, on every page (mounted in app/layout.tsx). Opens a small
 * modal with FeedbackForm, which POSTs to /api/feedback and emails the
 * maintainer. No sign-in required. /about has the same form inline.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const feedback = useFeedback();

  function close() {
    setOpen(false);
    // Reset after the modal is dismissed so a re-open starts clean, unless the
    // last send failed (keep the text so the user doesn't lose it).
    if (feedback.status !== "error") feedback.reset();
  }

  // Close on Escape (matches the app's other modals). Via a ref so the
  // listener always calls the latest close() without re-subscribing per keystroke.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-16 right-4 z-40 osrs-panel rounded-full px-4 py-2 text-sm font-semibold text-osrs-gold shadow-lg hover:bg-osrs-gold/15 transition-colors"
          aria-label="Send feedback"
        >
          💬 Feedback
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <div
            className="osrs-panel rounded p-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-semibold text-osrs-brown">Send feedback</h3>
              <button
                type="button"
                onClick={close}
                className="text-osrs-brown hover:text-osrs-gold text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {feedback.status !== "sent" && (
              <p className="text-caption text-osrs-muted mb-2">
                Found a bug or have an idea? It comes straight to me.
              </p>
            )}
            <FeedbackForm feedback={feedback} onClose={close} autoFocus />
          </div>
        </div>
      )}
    </>
  );
}
