// User feedback inbox. POST a short message (plus optional reply-to email and
// the page it was sent from) and it's emailed to the maintainer via the same
// Resend setup that powers auth magic-links (see lib/auth.ts).
//
// No sign-in required — anonymous visitors can leave feedback. If the sender
// *is* signed in we attach their account email automatically so replies are
// possible even when they don't type one.
//
// Dev (no AUTH_RESEND_KEY): the message prints to the server console instead of
// emailing, so the flow is testable without an email service.

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Lowercased: Resend's sandbox sender (onboarding@resend.dev) matches the
// allowed test recipient case-sensitively, and email addresses are effectively
// case-insensitive anyway, so normalize to avoid a 403 on a capitalized address.
const FEEDBACK_TO = (process.env.FEEDBACK_TO ?? "eliezer.d.nunez@gmail.com").toLowerCase();
const EMAIL_FROM = process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev";

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

  // Attach the signed-in account email if available (best-effort — feedback is
  // allowed anonymously, so a failure here must not block submission).
  let accountEmail = "";
  try {
    const session = await auth();
    accountEmail = session?.user?.email ?? "";
  } catch {
    // ignore — anonymous feedback is fine
  }

  const contact = replyEmail || accountEmail || "(none provided)";
  const subject = "OSRS Boss Helper feedback";
  const textLines = [
    trimmed,
    "",
    "---",
    `Reply-to: ${contact}`,
    fromPage ? `Page: ${fromPage}` : "",
    accountEmail ? `Signed-in account: ${accountEmail}` : "",
  ].filter(Boolean);
  const html = `<p style="white-space:pre-wrap">${escapeHtml(trimmed)}</p>
<hr />
<p><strong>Reply-to:</strong> ${escapeHtml(contact)}<br />
${fromPage ? `<strong>Page:</strong> ${escapeHtml(fromPage)}<br />` : ""}
${accountEmail ? `<strong>Signed-in account:</strong> ${escapeHtml(accountEmail)}` : ""}</p>`;

  // Dev fallback: no email service configured → log and succeed.
  if (!process.env.AUTH_RESEND_KEY) {
    console.log(
      `\n=== OSRS Boss Helper feedback ===\n${textLines.join("\n")}\n=== (set AUTH_RESEND_KEY to email this to ${FEEDBACK_TO}) ===\n`,
    );
    return Response.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: FEEDBACK_TO,
      subject,
      html,
      // Let the maintainer hit "reply" and reach the user, when an email exists.
      ...(replyEmail || accountEmail ? { reply_to: replyEmail || accountEmail } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`Feedback email failed (${res.status}): ${detail}`);
    return Response.json({ error: "Failed to send feedback" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
