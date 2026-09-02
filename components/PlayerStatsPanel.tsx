"use client";

import type { Skills } from "@/types/osrs";

interface Props {
  /** The skills the DPS is currently computed at. */
  skills: Skills;
  /** True when these came from the live RuneLite plugin (vs the 99s default). */
  isLive: boolean;
  /** Levels came from the cached bank of a previous visit, not a live file. */
  fromCache?: boolean;
}

const SKILL_KEYS: Array<keyof Skills> = [
  "attack",
  "strength",
  "defence",
  "ranged",
  "magic",
  "hitpoints",
  "prayer",
];

/**
 * Renders the skill levels the recommendations are computed at. These come
 * from the RuneLite plugin when it's connected, otherwise they default to 99s.
 * Designed to embed inside the "Your character" card (no own panel wrapper).
 */
export function PlayerStatsPanel({ skills, isLive, fromCache = false }: Props) {
  return (
    <div>
      <h4 className="label-eyebrow font-semibold text-osrs-muted mb-2">
        Skills
      </h4>
      <p className="text-xs text-osrs-muted mb-2">
        {isLive
          ? fromCache
            ? // Real levels, but from the last visit — calling that "live" would
              // be a lie the moment the player trains a skill.
              "Your levels from your last visit — reconnect the file for live updates."
            : "Live from the RuneLite plugin."
          : "Assuming 99s — connect the RuneLite plugin to use your real levels."}
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-osrs-brown">
        {SKILL_KEYS.map((skill) => (
          <li key={skill} className="flex justify-between">
            <span className="capitalize">{skill}</span>
            <span className="font-mono">{skills[skill]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
