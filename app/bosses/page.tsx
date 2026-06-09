"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";

export default function BossesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MONSTER_CATALOG;
    return MONSTER_CATALOG.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.includes(q) ||
        m.attributes.some((a) => a.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-osrs-gold">All bosses</h1>
        <p className="text-sm text-parchment-dark mt-1">
          {MONSTER_CATALOG.length} monsters. Pick one for a DPS-optimised loadout
          built from your bank, plus mechanics and spec-weapon advice.
        </p>
      </header>

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, slug, or attribute (e.g. dragon, undead)…"
          className="w-full max-w-md osrs-panel p-2 rounded text-osrs-brown placeholder:text-osrs-muted"
        />
        {query && (
          <p className="text-xs text-parchment-dark mt-1">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/boss/${m.slug}`}
              className="block osrs-panel p-3 rounded hover:bg-osrs-gold/10 transition-colors h-full"
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="font-semibold text-osrs-brown truncate">
                  {m.name}
                  {m.version && (
                    <span className="text-xs font-normal text-osrs-muted ml-1">
                      ({m.version})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <MetaChip label="CB">{m.combatLevel}</MetaChip>
                <MetaChip label="HP">{m.hp}</MetaChip>
                {m.weakness && (
                  <WeaknessBadge
                    element={m.weakness.element}
                    severity={m.weakness.severity}
                  />
                )}
                {m.attributes.map((a) => (
                  <AttributePill key={a} attribute={a} />
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="osrs-panel p-6 rounded text-center text-osrs-brown">
          No bosses match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
