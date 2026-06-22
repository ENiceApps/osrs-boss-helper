// Plugin-token management (Phase 6.3). Session-authenticated (the logged-in
// web user), NOT the Bearer token — this is where a human mints/rotates the
// machine credential they'll paste into the RuneLite plugin.
//
//   GET  → { exists } : whether the user already has a token (for the UI)
//   POST → { token }  : generate (or rotate) — plaintext returned ONCE, then
//                       only its hash is stored. Re-POSTing invalidates the old one.

import { auth } from "@/lib/auth";
import {
  generatePluginToken,
  hashPluginToken,
  setPluginTokenHash,
  hasPluginToken,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  return Response.json({ exists: await hasPluginToken(userId) });
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });

  const token = generatePluginToken();
  await setPluginTokenHash(userId, hashPluginToken(token));
  // Returned once — the server only keeps the hash. The user copies it into the plugin.
  return Response.json({ token });
}
