// Augment the Auth.js session so `session.user.id` is typed (we set it in the
// session callback in lib/auth.ts, and the bank APIs key off it).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
