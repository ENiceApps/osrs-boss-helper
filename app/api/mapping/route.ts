import { fetchWiki } from "@/lib/wikiApi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetchWiki("/mapping");
    if (!res.ok) {
      return Response.json(
        { error: `Wiki mapping request failed: ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
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
