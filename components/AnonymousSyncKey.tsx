"use client";

import { useState } from "react";
import { setSyncKey, clearSyncKey, useSyncKey } from "@/lib/syncKey";

/**
 * "Use without email" flow. Generates an anonymous sync key (POST /api/sync-key),
 * stores it on this device (localStorage), and shows it once so the player can
 * paste it into the RuneLite plugin. The same key lets this browser read the
 * bank back — no email, no account. Banks stay isolated per key.
 */
export function AnonymousSyncKey() {
  // Whether this device already has a stored key (reactive to localStorage).
  const existingKey = useSyncKey();
  // The freshly generated key (shown in full once). Distinct from existingKey so
  // we only reveal the full value right after the user generates it.
  const [newKey, setNewKey] = useState<string | null>(null);
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
      const res = await fetch("/api/sync-key", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { key: string };
      setSyncKey(data.key); // updates `existingKey` via the store subscription
      setNewKey(data.key);
    } catch {
      setErr("Couldn't create a sync key — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function forget() {
    clearSyncKey(); // updates `existingKey` via the store subscription
    setNewKey(null);
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="bg-osrs-gold text-background font-semibold rounded px-3 py-2 hover:bg-osrs-gold-light disabled:opacity-50"
        >
          {loading
            ? "Generating…"
            : existingKey
              ? "Generate a new sync key"
              : "Use without email"}
        </button>
        {existingKey && (
          <button
            type="button"
            onClick={forget}
            className="border border-osrs-brown/40 rounded px-3 py-2 text-caption text-osrs-brown hover:border-osrs-gold/60"
          >
            Forget this device
          </button>
        )}
      </div>

      {existingKey && !newKey && (
        <p className="text-caption text-osrs-muted">
          This device is set up for anonymous sync. Generating a new key replaces it —
          you&apos;d need to update the plugin with the new value.
        </p>
      )}
      {err && <p className="text-caption text-status-missing">{err}</p>}

      {newKey && (
        <div className="osrs-well rounded p-3 space-y-2">
          <p className="text-caption text-osrs-brown">
            <strong>Copy this now</strong> — it&apos;s shown only once and saved on this
            device. Anyone with it can read or write this bank, so keep it private.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={newKey}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => copy(newKey)}
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
            Paste your sync key into the <span className="text-osrs-brown">Account token</span> field
          </li>
          <li>Open your bank in-game — it syncs within a couple of seconds</li>
        </ol>
        <p className="text-osrs-muted pt-1">
          The key stays on this device. Use the same key on another device to load the
          same bank there.
        </p>
      </div>
    </div>
  );
}
