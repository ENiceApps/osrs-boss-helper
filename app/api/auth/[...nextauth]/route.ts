// Auth.js route handler — all /api/auth/* endpoints (sign-in, callback, session,
// providers, csrf, sign-out). Node runtime: the Neon Pool + adapter need it.
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;
