"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Floating "Feedback" button pinned to the top-right corner, just below the
 * sticky header, on every page (mounted in app/layout.tsx). Opens a small
 * modal with a message box and an optional reply email, then POSTs to
 * /api/feedback which emails the maintainer. No sign-in required.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Close on Escape (matches the app's other modals).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    // Reset after the modal is dismissed so a re-open starts clean, unless the
    // last send failed (keep the text so the user doesn't lose it).
    if (status !== "error") {
      setMessage("");
      setEmail("");
      setStatus("idle");
      setError("");
    }
  }

  async function submit() {
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Something went wrong");
      }
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

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

            {status === "sent" ? (
              <div className="text-sm text-osrs-brown">
                <p className="mb-3">Thanks — your feedback was sent. 🎉</p>
                <button
                  type="button"
                  onClick={close}
                  className="osrs-panel rounded px-3 py-1.5 text-sm font-semibold text-osrs-gold hover:bg-osrs-gold/15"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-caption text-osrs-muted mb-2">
                  Found a bug or have an idea? It goes straight to the developer.
                </p>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={4000}
                  placeholder="What's on your mind?"
                  className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-2 text-sm text-osrs-brown mb-2 resize-y"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (optional — for a reply)"
                  className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown mb-3"
                />

                {status === "error" && (
                  <p className="text-caption text-status-missing mb-2">{error}</p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="px-3 py-1.5 text-sm text-osrs-brown hover:text-osrs-gold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!message.trim() || status === "sending"}
                    className="osrs-panel rounded px-3 py-1.5 text-sm font-semibold text-osrs-gold hover:bg-osrs-gold/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
