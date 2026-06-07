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

/**
 * Renders the loaded player's skills. Designed to embed inside the
 * "Your character" card (no own panel wrapper). Shows a skeleton skill grid
 * while loading or before a username is entered, so the area never looks empty.
 */
export function PlayerStatsPanel({ player, isLoading, error }: Props) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-osrs-muted mb-2">
        Skills
      </h4>
      {isLoading && <SkillSkeleton />}
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
        <>
          <p className="text-xs text-osrs-muted mb-2">
            Enter your username above to load real levels. Until then,
            recommendations assume 99s.
          </p>
          <SkillSkeleton />
        </>
      )}
    </div>
  );
}

/** Greyed placeholder rows in the skill-grid shape — keeps the card from
 *  looking empty while loading or before a username is entered. */
function SkillSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm" aria-hidden>
      {SKILL_KEYS.map((skill) => (
        <li key={skill} className="flex justify-between items-center">
          <span className="capitalize text-osrs-brown/40">{skill}</span>
          <span className="inline-block w-6 h-3 rounded bg-osrs-brown/15" />
        </li>
      ))}
    </ul>
  );
}
