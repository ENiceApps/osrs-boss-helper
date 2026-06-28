// Helper for talking to the OSRS Wiki Real-time Prices API.
// The wiki blocks generic User-Agents — every request must identify the app
// and include contact info. See:
//   https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices

const WIKI_BASE = "https://prices.runescape.wiki/api/v1/osrs";

function buildUserAgent(): string {
  const contact = process.env.WIKI_USER_AGENT_CONTACT?.trim();
  if (!contact) {
    return "OSRS-Boss-Helper/0.1 (dev; set WIKI_USER_AGENT_CONTACT before deploying)";
  }
  return `OSRS-Boss-Helper/0.1 (contact: ${contact})`;
}

export async function fetchWiki(path: string, init?: RequestInit): Promise<Response> {
  // Only relative paths off the fixed wiki base are allowed — never an absolute
  // URL. This keeps the helper from being coaxed into fetching an arbitrary host
  // (defense-in-depth against SSRF); every caller passes a constant like
  // "/latest" or "/mapping".
  if (!path.startsWith("/")) {
    throw new Error(`fetchWiki expects a relative path beginning with "/", got: ${path}`);
  }
  const url = `${WIKI_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      "User-Agent": buildUserAgent(),
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
