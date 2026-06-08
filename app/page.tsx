"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";

export default function HomePage() {
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
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-osrs-gold">OSRS Boss Helper</h1>
          <Link
            href="/items"
            className="text-sm text-osrs-gold hover:underline"
          >
            Item browser →
          </Link>
        </div>
        <p className="text-sm text-parchment-dark mt-1">
          Browse {MONSTER_CATALOG.length} bosses. Pick one to get a DPS-optimised
          loadout built from your bank, plus mechanics and spec-weapon advice.
        </p>
      </header>

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, slug, or attribute (e.g. dragon, undead)…"
          className="w-full max-w-md osrs-panel p-2 rounded text-osrs-brown placeholder:text-parchment-dark"
        />
        {query && (
          <p className="text-xs text-parchment-dark mt-1">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((m) => {
          return (
            <li key={m.slug}>
              <Link
                href={`/boss/${m.slug}`}
                className="block osrs-panel p-3 rounded hover:bg-osrs-gold/10 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-osrs-brown truncate">
                    {m.name}
                    {m.version && (
                      <span className="text-xs font-normal text-parchment-dark ml-1">
                        ({m.version})
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-xs text-parchment-dark mt-1 flex gap-3">
                  <span>cb {m.combatLevel}</span>
                  <span>hp {m.hp}</span>
                  {m.weakness && (
                    <span>weak: {m.weakness.element} +{m.weakness.severity}%</span>
                  )}
                </div>
                {m.attributes.length > 0 && (
                  <div className="text-[10px] text-parchment-dark mt-1">
                    {m.attributes.join(" · ")}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="osrs-panel p-6 rounded text-center text-osrs-brown">
          No bosses match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
