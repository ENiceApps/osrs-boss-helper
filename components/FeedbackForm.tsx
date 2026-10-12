"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/** Draft + send state for one feedback form, POSTing to /api/feedback. */
export function useFeedback() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

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

  function reset() {
    setMessage("");
    setEmail("");
    setStatus("idle");
    setError("");
  }

  return { message, setMessage, email, setEmail, status, error, submit, reset };
}

export type Feedback = ReturnType<typeof useFeedback>;

/**
 * The feedback message box + optional reply email. Shared by the floating
 * FeedbackButton modal (which passes its own `feedback` state so a failed
 * send survives closing the modal) and the inline form on /about. `onClose`
 * adds Cancel/Close buttons (modal only); without it, a sent form offers
 * "Send another" instead.
 */
export function FeedbackForm({
  feedback,
  onClose,
  autoFocus = false,
}: {
  feedback?: Feedback;
  onClose?: () => void;
  autoFocus?: boolean;
}) {
  const own = useFeedback();
  const fb = feedback ?? own;

  // The live region is always mounted (empty until a send succeeds) so screen
  // readers announce it; one that mounts already filled is often skipped.
  return (
    <>
      <p role="status" className="sr-only">
        {fb.status === "sent" ? "Thanks! Your feedback was sent." : ""}
      </p>
      {fb.status === "sent" ? (
        <div className="text-sm text-osrs-brown">
          <p className="mb-3" aria-hidden>
            Thanks! Your feedback was sent. 🎉
          </p>
          <button
            type="button"
            onClick={onClose ?? fb.reset}
            className="osrs-panel rounded px-3 py-1.5 text-sm font-semibold text-osrs-gold hover:bg-osrs-gold/15"
          >
            {onClose ? "Close" : "Send another"}
          </button>
        </div>
      ) : (
        <FormFields fb={fb} onClose={onClose} autoFocus={autoFocus} />
      )}
    </>
  );
}

function FormFields({
  fb,
  onClose,
  autoFocus,
}: {
  fb: Feedback;
  onClose?: () => void;
  autoFocus: boolean;
}) {
  return (
    <>
      <textarea
        autoFocus={autoFocus}
        value={fb.message}
        onChange={(e) => fb.setMessage(e.target.value)}
        rows={5}
        maxLength={4000}
        aria-label="Your feedback"
        placeholder="What's on your mind?"
        className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-2 text-sm text-osrs-brown mb-2 resize-y"
      />
      <input
        type="email"
        value={fb.email}
        onChange={(e) => fb.setEmail(e.target.value)}
        aria-label="Your email (optional)"
        placeholder="Your email (optional, if you want a reply)"
        className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown mb-3"
      />

      {fb.status === "error" && (
        <p className="text-caption text-status-missing mb-2" role="alert">
          {fb.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-osrs-brown hover:text-osrs-gold"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={fb.submit}
          disabled={!fb.message.trim() || fb.status === "sending"}
          className="osrs-panel rounded px-3 py-1.5 text-sm font-semibold text-osrs-gold hover:bg-osrs-gold/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fb.status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
    </>
  );
}
