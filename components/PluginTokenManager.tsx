"use client";

import { useState } from "react";

/**
 * Mints/rotates the RuneLite plugin token (Phase 6.3). The plaintext token is
 * shown ONCE after generating — the server only stores its hash. The user
 * pastes it (and the endpoint URL) into the osrs-boss-sync plugin config.
 */
export function PluginTokenManager({ initiallyExists }: { initiallyExists: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [exists, setExists] = useState(initiallyExists);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const endpoint =
    typeof window !== "undefined" ? `${window.location.origin}/api/bank` : "/api/bank";

  async function generate() {
    setLoading(true);
    setErr(null);
    setCopied(false);
    try {
      const res = await fetch("/api/plugin-token", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { token: string };
      setToken(data.token);
      setExists(true);
    } catch {
      setErr("Couldn't generate a token — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the user can select the field manually */
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="bg-osrs-gold text-background font-semibold rounded px-3 py-2 hover:bg-osrs-gold-light disabled:opacity-50"
      >
        {loading ? "Generating…" : exists ? "Generate a new token" : "Generate plugin token"}
      </button>
      {exists && !token && (
        <p className="text-caption text-osrs-muted">
          You already have a token. Generating a new one replaces it — the plugin must be updated with the new value.
        </p>
      )}
      {err && <p className="text-caption text-status-missing">{err}</p>}

      {token && (
        <div className="osrs-well rounded p-3 space-y-2">
          <p className="text-caption text-osrs-brown">
            <strong>Copy this now</strong> — it&apos;s shown only once. We store only a hash.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={token}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => copy(token)}
              className="shrink-0 border border-osrs-brown/40 rounded px-2 text-caption text-osrs-brown hover:border-osrs-gold/60"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-osrs-brown/20 pt-3 text-caption text-osrs-brown leading-snug space-y-1">
        <p className="font-semibold">Plugin setup</p>
        <p>In the osrs-boss-sync plugin config in RuneLite:</p>
        <ol className="list-decimal list-inside space-y-0.5 text-osrs-muted">
          <li>
            Set <span className="text-osrs-brown">Endpoint URL</span> to{" "}
            <code className="text-osrs-brown">{endpoint}</code>
          </li>
          <li>
            Paste your token into the <span className="text-osrs-brown">Account token</span> field
          </li>
          <li>Open your bank in-game — it syncs within a couple of seconds</li>
        </ol>
      </div>
    </div>
  );
}
