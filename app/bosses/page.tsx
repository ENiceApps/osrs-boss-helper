"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";

// Headline / commonly-farmed bosses. Shown as the default "calm" view so the
// page doesn't open onto a wall of 235 slayer monsters. Filtered against the
// catalog, so a renamed/missing slug simply drops out rather than 404-ing.
const NOTABLE_SLUGS = [
  // Solo staples
  "vorkath",
  "zulrah",
  "scurrius",
  "giant-mole",
  "araxxor",
  "phantom-muspah",
  "amoxliatl",
  "the-hueycoatl",
  "yama",
  // Slayer bosses
  "alchemical-hydra",
  "abyssal-sire",
  "cerberus",
  "kraken",
  "thermonuclear-smoke-devil",
  "kalphite-queen",
  "sarachnis",
  // Dagannoth Kings
  "dagannoth-rex",
  "dagannoth-prime",
  "dagannoth-supreme",
  // God Wars
  "general-graardor",
  "kril-tsutsaroth",
  "commander-zilyana",
  "kreearra",
  "nex",
  // Desert Treasure II
  "vardorvis",
  "duke-sucellus",
  "the-leviathan",
  "the-whisperer",
  // Wilderness
  "callisto",
  "venenatis",
  "vetion",
  // Other high-end / raids
  "corporeal-beast",
  "the-nightmare",
  "great-olm",
  "verzik-vitur",
  "tztok-jad",
  "tzkal-zuk",
];

// Attribute facets. `match` lets one chip cover several raw tags (the catalog
// splits vampyres into vampyre1/vampyre3). Counts are computed once below.
const ATTR_FACETS: { key: string; label: string; match: (a: string) => boolean }[] = [
  { key: "dragon", label: "Dragon", match: (a) => a === "dragon" },
  { key: "demon", label: "Demon", match: (a) => a === "demon" },
  { key: "undead", label: "Undead", match: (a) => a === "undead" },
  { key: "spectral", label: "Spectral", match: (a) => a === "spectral" },
  { key: "fiery", label: "Fiery", match: (a) => a === "fiery" },
  { key: "kalphite", label: "Kalphite", match: (a) => a === "kalphite" },
  { key: "golem", label: "Golem", match: (a) => a === "golem" },
  { key: "flying", label: "Flying", match: (a) => a === "flying" },
  { key: "vampyre", label: "Vampyre", match: (a) => a.startsWith("vampyre") },
  { key: "xerician", label: "Xerician", match: (a) => a === "xerician" },
];

type SortKey = "name" | "combat" | "hp";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "combat", label: "Combat" },
  { key: "hp", label: "HP" },
];

export default function BossesPage() {
  const [query, setQuery] = useState("");
  const [activeAttrs, setActiveAttrs] = useState<Set<string>>(new Set());
  const [slayerOnly, setSlayerOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");

  // Any active facet/search means the user is exploring — show the full roster.
  // Otherwise we show the curated notable list.
  const isExploring =
    query.trim() !== "" || activeAttrs.size > 0 || slayerOnly || sort !== "name";

  const attrCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const facet of ATTR_FACETS) {
      counts[facet.key] = MONSTER_CATALOG.filter((m) =>
        m.attributes.some(facet.match),
      ).length;
    }
    return counts;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const facets = ATTR_FACETS.filter((f) => activeAttrs.has(f.key));

    let list = MONSTER_CATALOG.filter((m) => {
      if (slayerOnly && !m.isSlayerMonster) return false;
      // OR across selected attribute chips: dragons *or* demons, etc.
      if (facets.length > 0 && !facets.some((f) => m.attributes.some(f.match)))
        return false;
      if (q) {
        const hit =
          m.name.toLowerCase().includes(q) ||
          m.slug.includes(q) ||
          m.attributes.some((a) => a.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });

    if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "combat") {
      list = [...list].sort((a, b) => b.combatLevel - a.combatLevel);
    } else {
      list = [...list].sort((a, b) => b.hp - a.hp);
    }
    return list;
  }, [query, activeAttrs, slayerOnly, sort]);

  const notable = useMemo(() => {
    const bySlug = new Map(MONSTER_CATALOG.map((m) => [m.slug, m]));
    return NOTABLE_SLUGS.map((s) => bySlug.get(s)).filter(
      (m): m is NonNullable<typeof m> => Boolean(m),
    );
  }, []);

  const shown = isExploring ? results : notable;

  function toggleAttr(key: string) {
    setActiveAttrs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function reset() {
    setQuery("");
    setActiveAttrs(new Set());
    setSlayerOnly(false);
    setSort("name");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-osrs-gold">All bosses</h1>
        <p className="text-sm text-parchment-dark mt-1">
          {MONSTER_CATALOG.length} monsters. Pick one for a DPS-optimised loadout
          built from your bank, plus mechanics and spec-weapon advice.
        </p>
      </header>

      {/* Search + facet controls */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, slug, or attribute (e.g. dragon, undead)…"
            className="flex-1 min-w-[16rem] max-w-md osrs-panel p-2 rounded text-osrs-brown placeholder:text-osrs-muted"
          />

          <label className="flex items-center gap-1.5 text-sm text-osrs-brown cursor-pointer select-none">
            <input
              type="checkbox"
              checked={slayerOnly}
              onChange={(e) => setSlayerOnly(e.target.checked)}
              className="accent-osrs-gold"
            />
            Slayer only
          </label>

          <div className="flex items-center gap-1">
            <span className="label-eyebrow text-parchment-dark">Sort</span>
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  sort === s.key
                    ? "bg-osrs-gold/20 text-osrs-gold"
                    : "text-osrs-brown hover:bg-osrs-gold/10"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-eyebrow text-parchment-dark mr-1">Type</span>
          {ATTR_FACETS.map((f) => {
            const active = activeAttrs.has(f.key);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleAttr(f.key)}
                className={`rounded px-2 py-0.5 text-caption font-medium border transition-colors ${
                  active
                    ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                    : "text-osrs-brown border-osrs-brown/20 hover:bg-osrs-gold/10"
                }`}
              >
                {f.label}
                <span className="ml-1 text-osrs-muted">{attrCounts[f.key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result heading */}
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-sm text-parchment-dark">
          {isExploring ? (
            <>
              {shown.length} match{shown.length === 1 ? "" : "es"}
            </>
          ) : (
            <>
              <span className="text-osrs-brown font-semibold">Notable bosses</span>{" "}
              — search or pick a type above to browse all{" "}
              {MONSTER_CATALOG.length}.
            </>
          )}
        </p>
        {isExploring && (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-osrs-gold hover:underline shrink-0"
          >
            Clear filters
          </button>
        )}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shown.map((m) => (
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

      {shown.length === 0 && (
        <div className="osrs-panel p-6 rounded text-center text-osrs-brown">
          No bosses match your filters.{" "}
          <button
            type="button"
            onClick={reset}
            className="text-osrs-gold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
