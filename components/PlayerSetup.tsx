"use client";

import { useState } from "react";
import type { CombatStyle } from "@/types/osrs";

interface Props {
  onSubmit: (data: { username: string; gp: number; style: CombatStyle }) => void;
  initialUsername?: string;
  initialGp?: number;
  initialStyle?: CombatStyle;
}

export function PlayerSetup({
  onSubmit,
  initialUsername = "",
  initialGp = 0,
  initialStyle = "ranged",
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [gp, setGp] = useState<string>(String(initialGp));
  const [style, setStyle] = useState<CombatStyle>(initialStyle);

  function handleApply() {
    const gpNum = Number(gp.replace(/[^0-9]/g, ""));
    onSubmit({ username: username.trim(), gp: Number.isFinite(gpNum) ? gpNum : 0, style });
  }

  return (
    <div className="osrs-panel p-4 rounded space-y-3">
      <h3 className="font-semibold text-osrs-brown">Your details</h3>
      <label className="block">
        <span className="text-xs text-osrs-brown">RuneScape username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 bg-parchment-dark border border-osrs-brown rounded text-osrs-brown"
          placeholder="Zezima"
        />
      </label>
      <label className="block">
        <span className="text-xs text-osrs-brown">GP balance</span>
        <input
          type="text"
          inputMode="numeric"
          value={gp}
          onChange={(e) => setGp(e.target.value)}
          className="w-full p-2 bg-parchment-dark border border-osrs-brown rounded text-osrs-brown"
          placeholder="50000000"
        />
      </label>
      <fieldset>
        <legend className="text-xs text-osrs-brown mb-1">Combat style</legend>
        <div className="flex gap-2">
          {(["melee", "ranged", "magic"] as CombatStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`flex-1 px-2 py-1 text-sm rounded border ${
                style === s
                  ? "bg-osrs-brown text-parchment border-osrs-gold"
                  : "bg-parchment-dark text-osrs-brown border-osrs-brown"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        onClick={handleApply}
        className="w-full px-3 py-2 bg-osrs-brown text-parchment rounded border border-osrs-gold hover:bg-osrs-brown-light"
      >
        Update recommendations
      </button>
    </div>
  );
}
