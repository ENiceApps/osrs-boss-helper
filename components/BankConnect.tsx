"use client";

// Left-rail control for connecting the local bank file the RuneLite plugin
// writes. On Chromium it uses the File System Access API for live auto-updates;
// everywhere else it falls back to a one-shot "Import bank.json". Players on the
// Bank Memory plugin instead can paste its clipboard export. It owns no
// player data of its own — everything flows through lib/localBank.ts, which keeps
// the data in the browser.

import { useRef, useState, useSyncExternalStore } from "react";
import {
  useLocalBank,
  localBankSupported,
  connectLocalBank,
  reconnectLocalBank,
  importLocalBankFile,
  importBankMemoryText,
  disconnectLocalBank,
} from "@/lib/localBank";
import { formatAgo, secondsSince } from "@/lib/liveBank";

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

  // Loaded: show who's loaded + freshness. Two flavours of "loaded" — a file
  // we're watching right now, and the bank remembered from a previous visit,
  // which is real data but isn't updating until the file is reconnected.
  if (s.connected && s.bank) {
    const ago = secondsSince(s.updatedAt);
    const live = !s.fromCache;
    // A paste is a snapshot: nothing to reconnect, just paste a newer one.
    const pasted = s.bank.source === "bankMemory";
    // The plugin refreshes the file's bank section only when a bank is actually
    // opened in-game, so a live file can still carry a days-old bank. Say so
    // rather than letting "updated 3s ago" imply the bank was just read.
    const bankAgo = s.bank.bankCached ? formatAgo(s.bank.bankUpdatedAt) : null;
    return (
      <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug space-y-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={`w-2 h-2 rounded-full ${live ? "bg-status-owned" : "bg-status-affordable"}`}
            style={{
              boxShadow: `0 0 5px var(--color-status-${live ? "owned" : "affordable"})`,
            }}
          />
          <span className="font-semibold text-foreground">{s.bank.rsn}</span>
          <span className="text-parchment-dark">
            {s.bank.items.length} items
            {pasted
              ? ` · pasted from Bank Memory ${formatAgo(s.updatedAt) ?? ""}`
              : live
                ? ago != null ? ` · updated ${ago}s ago` : ""
                : " · from your last visit"}
          </span>
        </div>
        {bankAgo && (
          <p className="text-osrs-muted">
            Bank last read {bankAgo} — open your bank in-game to refresh it.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {pasted && <BankMemoryPaste label="Paste a newer one" />}
          {!live && !pasted &&
            (supported ? (
              <button
                type="button"
                onClick={() => void connectLocalBank()}
                className="text-osrs-gold hover:underline font-semibold"
              >
                Reconnect for live updates →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="text-osrs-gold hover:underline font-semibold"
              >
                Re-upload bank.json →
              </button>
            ))}
          <button
            type="button"
            onClick={disconnectLocalBank}
            className={live ? "text-osrs-gold hover:underline font-semibold" : "text-osrs-brown hover:text-osrs-gold hover:underline"}
          >
            Disconnect
          </button>
        </div>
        {/* Lives here too because the cached branch can offer a re-upload, and
            the input is only rendered in the idle branch below otherwise. */}
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={onPickFile}
        />
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
      <BankMemoryPaste label="Use Bank Memory? Paste its export instead" />
      {s.error && <p className="text-status-missing">{s.error}</p>}
    </div>
  );
}

// Paste box for the Bank Memory plugin's export (right-click a saved bank →
// "Copy item data to clipboard"). Collapsed to a link until asked for, so the
// plugin flow stays the obvious one.
function BankMemoryPaste({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-osrs-brown hover:text-osrs-gold hover:underline text-left"
      >
        {label}
      </button>
    );
  }

  function load() {
    const err = importBankMemoryText(text);
    setError(err);
    if (!err) {
      setText("");
      setOpen(false);
    }
  }

  return (
    <div className="w-full space-y-1">
      <p className="text-osrs-muted">
        In RuneLite, open the Bank Memory panel, right-click your bank and pick
        &quot;Copy item data to clipboard&quot;. Then paste it here!
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={"Item id    Item name    Item quantity\n4151    Abyssal whip    1"}
        aria-label="Bank Memory export"
        className="w-full p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm font-mono"
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={load}
          className="text-osrs-gold font-semibold hover:underline"
        >
          Load bank →
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-osrs-brown hover:text-osrs-gold hover:underline"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-status-missing">{error}</p>}
    </div>
  );
}
