// Auth.js (NextAuth v5) — email magic-link login, backed by the same Neon
// Postgres via @auth/pg-adapter. Database sessions (no JWT) so sessions live in
// the `sessions` table created by the migration.
//
// Dev: leave AUTH_RESEND_KEY blank and the sign-in link prints to the server
// console (no email service needed). Prod: set AUTH_RESEND_KEY + AUTH_EMAIL_FROM
// and the link is emailed via Resend.

import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "@neondatabase/serverless";

// Neon's Pool is wire-compatible with node-postgres (returns { rows }), which is
// what @auth/pg-adapter expects — but it's typed as its own class, so cast.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
});

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required when not behind Vercel's trusted host (local dev / self-host).
  trustHost: true,
  adapter: PostgresAdapter(pool as never),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || "dev-no-key",
      from: EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        // No key configured → developer flow: print the link to the console.
        if (!process.env.AUTH_RESEND_KEY) {
          console.log(
            `\n=== OSRS Boss Helper sign-in link for ${identifier} ===\n${url}\n=== (paste into your browser to log in) ===\n`,
          );
          return;
        }
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: identifier,
            subject: "Sign in to OSRS Boss Helper",
            html: `<p>Click to sign in to OSRS Boss Helper:</p><p><a href="${url}">Sign in</a></p><p>If you didn't request this, ignore this email.</p>`,
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend send failed (${res.status}): ${await res.text()}`);
        }
      },
    }),
  ],
  callbacks: {
    // Expose the user id on the session (database-session strategy passes `user`).
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
