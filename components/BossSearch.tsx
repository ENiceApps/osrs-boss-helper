"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { WeaknessBadge } from "@/components/ui";

const MAX_RESULTS = 8;

/**
 * Type-ahead boss picker for the landing page. The dropdown narrows as you
 * type (name / slug / attribute), with full keyboard support, and navigates
 * to /boss/[slug] on Enter or click. For people who already know what they
 * want to fight — the browsable grid lives at /bosses.
 */
export function BossSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MONSTER_CATALOG.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.includes(q) ||
        m.attributes.some((a) => a.toLowerCase().includes(q)),
    ).slice(0, MAX_RESULTS);
  }, [query]);

  const showList = open && matches.length > 0;

  function go(slug: string) {
    router.push(`/boss/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = matches[highlight] ?? matches[0];
      if (m) go(m.slug);
    }
  }

  return (
    <div className="relative w-full">
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls="boss-search-listbox"
        aria-autocomplete="list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Delay close so a click on an option registers first.
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Which boss are you tackling? (e.g. Zulrah, Araxxor…)"
        className="w-full osrs-panel rounded px-4 py-3 text-lg text-osrs-brown placeholder:text-osrs-muted"
        autoFocus
      />

      {showList && (
        <ul
          id="boss-search-listbox"
          role="listbox"
          className="absolute z-20 mt-1 w-full osrs-panel rounded overflow-hidden shadow-lg"
        >
          {matches.map((m, i) => (
            <li key={m.slug} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                // onMouseDown fires before the input's onBlur, so navigation
                // isn't cancelled by the blur-close timeout.
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(m.slug);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-4 py-2 flex items-center justify-between gap-3 ${
                  i === highlight ? "bg-osrs-gold/20" : ""
                }`}
              >
                <span className="font-semibold text-osrs-brown truncate">
                  {m.name}
                  {m.version && (
                    <span className="text-xs font-normal text-osrs-muted ml-1">
                      ({m.version})
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-caption text-osrs-muted">
                    cb {m.combatLevel}
                  </span>
                  {m.weakness && (
                    <WeaknessBadge
                      element={m.weakness.element}
                      severity={m.weakness.severity}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
