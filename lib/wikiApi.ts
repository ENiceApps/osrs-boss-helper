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
  const url = path.startsWith("http") ? path : `${WIKI_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      "User-Agent": buildUserAgent(),
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
