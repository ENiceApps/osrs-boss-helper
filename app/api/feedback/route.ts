// User feedback inbox — the one place the app sends anything to a server, and it
// carries no game data: just a short message plus an optional reply-to email and
// the page it came from, emailed to the maintainer via Resend.
//
// Dev (no RESEND key): the message prints to the server console instead of
// emailing, so the flow is testable without an email service.

import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Unauthenticated and triggers an outbound email per call, so cap submissions
// per IP to deter spam / email-cost abuse.
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Resend config. The AUTH_* names are read as a fallback so an existing
// deployment keeps working until its env vars are renamed.
const RESEND_KEY = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev";
// The recipient comes ONLY from the environment — never hardcode a personal
// address in (open-source) code. Unset → feedback is logged server-side instead
// of emailed (see the fallback below). Lowercased because email is effectively
// case-insensitive and Resend matches its sandbox recipient case-sensitively.
const FEEDBACK_TO = (process.env.FEEDBACK_TO ?? "").toLowerCase();

const MAX_MESSAGE = 4000;
const MAX_EMAIL = 254;
const MAX_PAGE = 512;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  const limit = rateLimit(`feedback:${clientIp(req)}`, MAX_PER_WINDOW, WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, email, page } = (body ?? {}) as {
    message?: unknown;
    email?: unknown;
    page?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const trimmed = message.trim().slice(0, MAX_MESSAGE);
  const replyEmail =
    typeof email === "string" && email.trim() ? email.trim().slice(0, MAX_EMAIL) : "";
  const fromPage =
    typeof page === "string" && page.trim() ? page.trim().slice(0, MAX_PAGE) : "";

  const contact = replyEmail || "(none provided)";
  const subject = "OSRS Boss Helper feedback";
  const textLines = [
    trimmed,
    "",
    "---",
    `Reply-to: ${contact}`,
    fromPage ? `Page: ${fromPage}` : "",
  ].filter(Boolean);
  const html = `<p style="white-space:pre-wrap">${escapeHtml(trimmed)}</p>
<hr />
<p><strong>Reply-to:</strong> ${escapeHtml(contact)}<br />
${fromPage ? `<strong>Page:</strong> ${escapeHtml(fromPage)}` : ""}</p>`;

  // No email service or no destination configured → log and succeed (dev, or a
  // deployment that hasn't set both RESEND_API_KEY and FEEDBACK_TO yet).
  if (!RESEND_KEY || !FEEDBACK_TO) {
    console.log(
      `\n=== OSRS Boss Helper feedback ===\n${textLines.join("\n")}\n=== (set RESEND_API_KEY + FEEDBACK_TO to email this) ===\n`,
    );
    return Response.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: FEEDBACK_TO,
      subject,
      html,
      // Let the maintainer hit "reply" and reach the user, when an email exists.
      ...(replyEmail ? { reply_to: replyEmail } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`Feedback email failed (${res.status}): ${detail}`);
    return Response.json({ error: "Failed to send feedback" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
