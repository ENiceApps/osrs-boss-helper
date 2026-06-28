// Server-side proxy for the OSRS Wiki Real-time Prices "latest" endpoint. Same
// rationale as the mapping proxy: attach the wiki-required User-Agent
// server-side and add a short cache. Read-only GET.

import { fetchWiki } from "@/lib/wikiApi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetchWiki("/latest");
    if (!res.ok) {
      return Response.json(
        { error: `Wiki prices request failed: ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    return Response.json(
      {
        error: "Could not reach prices.runescape.wiki",
        cause: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
