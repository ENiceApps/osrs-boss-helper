"use client";

import type { Player } from "@/types/osrs";

interface Props {
  player: Player | null;
  isLoading: boolean;
  error?: unknown;
}

const SKILL_KEYS: Array<keyof Player["skills"]> = [
  "attack",
  "strength",
  "defence",
  "ranged",
  "magic",
  "hitpoints",
  "prayer",
];

export function PlayerStatsPanel({ player, isLoading, error }: Props) {
  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-2">Player stats</h3>
      {isLoading && <p className="text-xs text-osrs-brown-light">Loading from Wise Old Man…</p>}
      {error != null && (
        <p className="text-xs text-status-missing">
          {error instanceof Error ? error.message : "Failed to load player"}
        </p>
      )}
      {player && (
        <div>
          <p className="text-xs text-osrs-brown-light mb-2">
            {player.username} · Combat {player.combatLevel}
          </p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-osrs-brown">
            {SKILL_KEYS.map((skill) => (
              <li key={skill} className="flex justify-between">
                <span className="capitalize">{skill}</span>
                <span className="font-mono">{player.skills[skill]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!player && !isLoading && !error && (
        <p className="text-xs text-osrs-brown-light">
          Enter your RuneScape username to load skills.
        </p>
      )}
    </div>
  );
}
