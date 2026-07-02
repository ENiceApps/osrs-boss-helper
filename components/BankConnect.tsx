"use client";

// Left-rail control for connecting the local bank file the RuneLite plugin
// writes. On Chromium it uses the File System Access API for live auto-updates;
// everywhere else it falls back to a one-shot "Import bank.json". It owns no
// player data of its own — everything flows through lib/localBank.ts, which keeps
// the data in the browser.

import { useRef, useSyncExternalStore } from "react";
import {
  useLocalBank,
  localBankSupported,
  connectLocalBank,
  reconnectLocalBank,
  importLocalBankFile,
  disconnectLocalBank,
} from "@/lib/localBank";
import { secondsSince } from "@/lib/liveBank";

// Where the plugin writes the file (shown so users can find it in the picker).
const FILE_PATH = "…/.runelite/osrs-boss-helper/bank.json";

export function BankConnect() {
  const s = useLocalBank();
  const fileInput = useRef<HTMLInputElement>(null);
  // File System Access support is a window check, so it can't be read during
  // the server prerender (no window → fallback branch) without the Chromium
  // client hydrating a DIFFERENT branch — a hydration mismatch that made React
  // throw the whole server-rendered tree away. useSyncExternalStore hydrates
  // with the server snapshot (false) and re-renders with the real value after
  // mount; the value never changes, so subscribe is a no-op.
  const supported = useSyncExternalStore(
    () => () => {},
    () => localBankSupported(),
    () => false,
  );

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void importLocalBankFile(f);
    e.target.value = ""; // allow re-importing the same filename
  }

  // Connected: show who's loaded + freshness.
  if (s.connected && s.bank) {
    const ago = secondsSince(s.updatedAt);
    return (
      <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug space-y-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="w-2 h-2 rounded-full bg-status-owned"
            style={{ boxShadow: "0 0 5px var(--color-status-owned)" }}
          />
          <span className="font-semibold text-foreground">{s.bank.rsn}</span>
          <span className="text-parchment-dark">
            {s.bank.items.length} items{ago != null ? ` · updated ${ago}s ago` : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={disconnectLocalBank}
          className="text-osrs-gold hover:underline font-semibold"
        >
          Disconnect
        </button>
        {s.error && <p className="text-status-missing">{s.error}</p>}
      </div>
    );
  }

  // A saved handle exists but lost permission across the reload — one click back.
  if (s.needsPermission) {
    return (
      <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug space-y-2">
        <p>Reconnect your bank file to resume live updates{s.fileName ? ` (${s.fileName})` : ""}.</p>
        <button
          type="button"
          onClick={() => void reconnectLocalBank()}
          className="text-osrs-gold font-semibold hover:underline"
        >
          Reconnect bank file →
        </button>
        {s.error && <p className="text-status-missing">{s.error}</p>}
      </div>
    );
  }

  // Idle: prompt to connect (or import).
  return (
    <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug space-y-2">
      <p>
        Connect the bank file the <strong>Boss Helper Bank Sync</strong> RuneLite
        plugin writes to load your real gear — or use <strong>Budget</strong> mode
        below to plan without it.
      </p>
      {supported ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={() => void connectLocalBank()}
            className="text-osrs-gold font-semibold hover:underline"
          >
            Connect bank file →
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="text-osrs-brown hover:text-osrs-gold hover:underline"
          >
            or upload bank.json
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="text-osrs-gold font-semibold hover:underline"
          >
            Upload bank.json →
          </button>
          <p className="text-osrs-muted">
            Your browser can&apos;t auto-refresh — re-import after you bank in-game.
          </p>
        </>
      )}
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={onPickFile}
      />
      <p className="text-osrs-muted">
        File: <code>{FILE_PATH}</code>
      </p>
      {s.error && <p className="text-status-missing">{s.error}</p>}
    </div>
  );
}
