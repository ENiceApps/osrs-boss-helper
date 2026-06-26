"use client";

import Link from "next/link";
import { fmtGp } from "@/lib/format";
import type { CharacterSummary } from "@/lib/liveBank";

interface Props {
  authed: boolean;
  characters: CharacterSummary[];
  /** Server-resolved selected character rsn. */
  selected: string | null;
  onSelect: (rsn: string) => void;
}

/**
 * Left-rail control for the hosted multi-account flow (Phase 6.4): pick which
 * synced character's bank drives the cockpit, or prompt to sign in / sync.
 */
export function CharacterBar({ authed, characters, selected, onSelect }: Props) {
  if (!authed) {
    return (
      <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug">
        <Link href="/signin" className="text-osrs-gold font-semibold hover:underline">
          Sign in
        </Link>{" "}
        (or sync without an email) to load your saved bank — or use{" "}
        <strong>Budget</strong> mode below to plan without one.
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug">
        No saved characters yet. Open your bank in-game with the osrs-boss-sync plugin to sync it.{" "}
        <Link href="/settings" className="text-osrs-gold font-semibold hover:underline">
          Set up the plugin →
        </Link>
      </div>
    );
  }

  return (
    <div className="osrs-panel p-3 rounded">
      <label className="block">
        <span className="label-eyebrow">Character</span>
        <select
          value={selected ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="mt-1 w-full p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm"
        >
          {characters.map((c) => (
            <option key={c.rsn} value={c.rsn}>
              {c.rsn} · {fmtGp(c.gp)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
