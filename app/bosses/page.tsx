"use client";

// Browse-all-bosses grid (/bosses): the full monster catalog with category and
// Slayer filters, search, and per-boss attribute / weakness badges. Each card
// links to the shared /boss/[slug] page.

import Link from "next/link";
import { useMemo, useState } from "react";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import {
  categoryForMonster,
  isSlayerBoss,
  CATEGORY_LABELS,
  type MonsterCategory,
} from "@/data/monsters/categories";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { MetaChip, WeaknessBadge, AttributePill } from "@/components/ui";

// "slayer" is a cross-cutting filter (a Slayer boss also has a primary tier),
// the rest are mutually-exclusive primary categories.
type CategoryFilter = MonsterCategory | "all" | "slayer";
const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "early", label: CATEGORY_LABELS.early },
  { key: "mid", label: CATEGORY_LABELS.mid },
  { key: "late", label: CATEGORY_LABELS.late },
  { key: "cox", label: CATEGORY_LABELS.cox },
  { key: "tob", label: CATEGORY_LABELS.tob },
  { key: "toa", label: CATEGORY_LABELS.toa },
  { key: "slayer", label: "Slayer" },
  { key: "npc", label: CATEGORY_LABELS.npc },
];

// Headline / commonly-farmed bosses. Shown as the default "calm" view so the
// page doesn't open onto a wall of 235 slayer monsters. Filtered against the
// catalog, so a renamed/missing slug simply drops out rather than 404-ing.
const NOTABLE_SLUGS = [
  // Baseline tools, pinned first so they're easy to find: a no-defence dummy for
  // raw-DPS checks, and Ditto — a fully editable "theoretical boss" sandbox.
  "combat-dummy",
  "ditto",
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
  const [activeWeak, setActiveWeak] = useState<Set<string>>(new Set());
  const [wildOnly, setWildOnly] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");

  // Any active facet/search means the user is exploring — show the full roster.
  // Otherwise we show the curated notable list.
  const isExploring =
    query.trim() !== "" ||
    activeAttrs.size > 0 ||
    activeWeak.size > 0 ||
    wildOnly ||
    category !== "all" ||
    sort !== "name";

  const attrCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const facet of ATTR_FACETS) {
      counts[facet.key] = MONSTER_CATALOG.filter((m) =>
        m.attributes.some(facet.match),
      ).length;
    }
    return counts;
  }, []);

  // Distinct weakness elements present in the catalog, most-common first, with
  // counts — derived so a new element in the data shows up without code changes.
  const weaknessFacets = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of MONSTER_CATALOG) {
      const el = m.weakness?.element;
      if (el) counts[el] = (counts[el] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));
  }, []);

  const wildernessCount = useMemo(
    () => MONSTER_CATALOG.filter((m) => isWildernessBoss(m.slug)).length,
    [],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of MONSTER_CATALOG) {
      const c = categoryForMonster(m.slug);
      counts[c] = (counts[c] ?? 0) + 1;
    }
    // Slayer is a cross-cutting tag — counted separately (overlaps the tiers).
    // Union of the catalog's per-monster Slayer flag (every assignable creature)
    // with the curated slayer-boss set (catches bosses like Vorkath that count
    // toward another creature's task but aren't flagged in the vendor data).
    counts.slayer = MONSTER_CATALOG.filter(
      (m) => m.isSlayerMonster || isSlayerBoss(m.slug),
    ).length;
    return counts;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const facets = ATTR_FACETS.filter((f) => activeAttrs.has(f.key));

    let list = MONSTER_CATALOG.filter((m) => {
      if (category === "slayer") {
        if (!(m.isSlayerMonster || isSlayerBoss(m.slug))) return false;
      } else if (category !== "all" && categoryForMonster(m.slug) !== category) {
        return false;
      }
      // OR across selected attribute chips: dragons *or* demons, etc.
      if (facets.length > 0 && !facets.some((f) => m.attributes.some(f.match)))
        return false;
      // OR across selected weakness elements.
      if (activeWeak.size > 0 && !(m.weakness && activeWeak.has(m.weakness.element)))
        return false;
      if (wildOnly && !isWildernessBoss(m.slug)) return false;
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
  }, [query, activeAttrs, activeWeak, wildOnly, category, sort]);

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

  function toggleWeak(key: string) {
    setActiveWeak((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function reset() {
    setQuery("");
    setActiveAttrs(new Set());
    setActiveWeak(new Set());
    setWildOnly(false);
    setCategory("all");
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
          <span className="label-eyebrow text-parchment-dark mr-1">Category</span>
          {CATEGORY_FILTERS.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded px-2 py-0.5 text-caption font-medium border transition-colors ${
                  active
                    ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                    : "text-osrs-brown border-osrs-brown/20 hover:bg-osrs-gold/10"
                }`}
              >
                {c.label}
                {c.key !== "all" && (
                  <span className="ml-1 text-osrs-muted">{categoryCounts[c.key]}</span>
                )}
              </button>
            );
          })}
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

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-eyebrow text-parchment-dark mr-1">Weak to</span>
          {weaknessFacets.map((w) => {
            const active = activeWeak.has(w.key);
            return (
              <button
                key={w.key}
                type="button"
                onClick={() => toggleWeak(w.key)}
                className={`rounded px-2 py-0.5 text-caption font-medium border transition-colors capitalize ${
                  active
                    ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                    : "text-osrs-brown border-osrs-brown/20 hover:bg-osrs-gold/10"
                }`}
              >
                {w.key}
                <span className="ml-1 text-osrs-muted">{w.count}</span>
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-osrs-brown/20" aria-hidden />
          <button
            type="button"
            onClick={() => setWildOnly((v) => !v)}
            className={`rounded px-2 py-0.5 text-caption font-medium border transition-colors ${
              wildOnly
                ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                : "text-osrs-brown border-osrs-brown/20 hover:bg-osrs-gold/10"
            }`}
          >
            Wilderness
            <span className="ml-1 text-osrs-muted">{wildernessCount}</span>
          </button>
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
