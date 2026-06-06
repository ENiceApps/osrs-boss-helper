const WOM_BASE = "https://api.wiseoldman.net/v2";
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;

function womUserAgent(): string {
  const contact = process.env.WIKI_USER_AGENT_CONTACT?.trim();
  return contact
    ? `OSRS-Boss-Helper/0.1 (contact: ${contact})`
    : "OSRS-Boss-Helper/0.1";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const encoded = encodeURIComponent(username.trim());

  try {
    const res = await fetch(`${WOM_BASE}/players/${encoded}`, {
      headers: { "User-Agent": womUserAgent(), Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) {
      return Response.json({ error: "Player not found on Wise Old Man" }, { status: 404 });
    }
    if (!res.ok) {
      return Response.json(
        { error: `Wise Old Man request failed: ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const snapshotAt = data?.latestSnapshot?.createdAt
      ? new Date(data.latestSnapshot.createdAt).getTime()
      : 0;
    const isStale = !snapshotAt || Date.now() - snapshotAt > REFRESH_AFTER_MS;

    if (isStale) {
      fetch(`${WOM_BASE}/players/${encoded}`, {
        method: "POST",
        headers: { "User-Agent": womUserAgent(), Accept: "application/json" },
      }).catch(() => {
        // Fire-and-forget. The next request will see the refreshed snapshot.
      });
    }

    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    return Response.json(
      {
        error: "Could not reach api.wiseoldman.net",
        cause: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
