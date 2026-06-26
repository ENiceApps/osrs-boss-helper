// Anonymous sync key ("use without email"). Mints a fresh credential that ties
// a browser + the RuneLite plugin to a private bank WITHOUT collecting an email.
//
//   POST → { key } : create an anonymous user + plugin token, return the token
//                     once. The browser keeps it in localStorage; the player
//                     also pastes it into the plugin's Account token field.
//
// The key is a 256-bit random token (only its SHA-256 hash is stored), so banks
// stay isolated per-key just like account-bound tokens — knowing the key is the
// only way to read or write that bank. Intentionally unauthenticated: that's the
// whole point (no email, no prior account).

import { createAnonUser, generatePluginToken, hashPluginToken, setPluginTokenHash } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await createAnonUser();
  const key = generatePluginToken();
  await setPluginTokenHash(userId, hashPluginToken(key));
  // Returned once — the server keeps only the hash. The user saves it on their
  // device and pastes it into the plugin.
  return Response.json({ key });
}
