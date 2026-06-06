"use client";

import useSWR from "swr";
import type { Player, Skills } from "@/types/osrs";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request to ${url} failed: ${res.status}`);
  }
  return res.json();
};

interface WomSnapshotSkill {
  level: number;
  experience: number;
}

interface WomPlayerResponse {
  username: string;
  displayName: string;
  combatLevel: number;
  latestSnapshot?: {
    createdAt: string;
    data: {
      skills: Record<string, WomSnapshotSkill>;
    };
  };
}

function toPlayer(raw: WomPlayerResponse): Player | null {
  const snapshot = raw.latestSnapshot;
  if (!snapshot) return null;
  const s = snapshot.data.skills;
  const skills: Skills = {
    attack: s.attack?.level ?? 1,
    strength: s.strength?.level ?? 1,
    defence: s.defence?.level ?? 1,
    ranged: s.ranged?.level ?? 1,
    magic: s.magic?.level ?? 1,
    hitpoints: s.hitpoints?.level ?? 10,
    prayer: s.prayer?.level ?? 1,
  };
  return {
    username: raw.displayName ?? raw.username,
    skills,
    combatLevel: raw.combatLevel,
  };
}

export function usePlayer(username: string | null) {
  const key = username && username.trim().length > 0
    ? `/api/player/${encodeURIComponent(username.trim())}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<WomPlayerResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });
  return {
    player: data ? toPlayer(data) : null,
    raw: data,
    error,
    isLoading,
    refresh: mutate,
  };
}
