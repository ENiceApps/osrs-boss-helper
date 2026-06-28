"use client";

// Item browser (/items): the full equipment catalog in a table you can sort by
// any combat bonus and filter by slot, with live GE prices. A read-only
// reference view — the actual gear optimizer lives on the boss pages.

import Link from "next/link";
import { useMemo, useState } from "react";
import { ITEM_CATALOG, type ItemCatalogEntry, type ItemCatalogSlot } from "@/data/items/catalog";
import { useMapping, usePrices, priceForItem } from "@/lib/prices";
import { ItemIcon } from "@/components/ItemIcon";

// Columns the user can sort by. Each maps to a field on ItemCatalogEntry.
const SORT_FIELDS = [
  { key: "name" as const, label: "Name", numeric: false },
  { key: "attackStab" as const, label: "Stab atk", numeric: true },
  { key: "attackSlash" as const, label: "Slash atk", numeric: true },
  { key: "attackCrush" as const, label: "Crush atk", numeric: true },
  { key: "attackMagic" as const, label: "Magic atk", numeric: true },
  { key: "attackRanged" as const, label: "Ranged atk", numeric: true },
  { key: "str" as const, label: "Melee str", numeric: true },
  { key: "rangedStr" as const, label: "Ranged str", numeric: true },
  { key: "magicStr" as const, label: "Magic dmg ×10", numeric: true },
  { key: "prayer" as const, label: "Prayer", numeric: true },
  { key: "defStab" as const, label: "Stab def", numeric: true },
  { key: "defSlash" as const, label: "Slash def", numeric: true },
  { key: "defCrush" as const, label: "Crush def", numeric: true },
  { key: "defMagic" as const, label: "Magic def", numeric: true },
  { key: "defRanged" as const, label: "Ranged def", numeric: true },
  { key: "speed" as const, label: "Speed (ticks)", numeric: true },
] satisfies Array<{ key: keyof ItemCatalogEntry; label: string; numeric: boolean }>;

type SortKey = (typeof SORT_FIELDS)[number]["key"];

const SLOT_OPTIONS: Array<{ value: ItemCatalogSlot | "all"; label: string }> = [
  { value: "all", label: "Any slot" },
  { value: "head", label: "Head" },
  { value: "cape", label: "Cape" },
  { value: "neck", label: "Neck" },
  { value: "ammo", label: "Ammo" },
  { value: "weapon", label: "Weapon" },
  { value: "shield", label: "Shield" },
  { value: "body", label: "Body" },
  { value: "legs", label: "Legs" },
  { value: "hands", label: "Hands" },
  { value: "feet", label: "Feet" },
  { value: "ring", label: "Ring" },
  { value: "2h", label: "2H (legacy slot)" },
];

const MAX_ROWS = 100;

function formatGp(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function parseGpInput(s: string): number | null {
  if (!s.trim()) return null;
  const m = s.trim().toLowerCase().match(/^([\d.]+)\s*([kmb]?)$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  switch (m[2]) {
    case "k": return Math.round(n * 1_000);
    case "m": return Math.round(n * 1_000_000);
    case "b": return Math.round(n * 1_000_000_000);
    default: return Math.round(n);
  }
}

export default function ItemsPage() {
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<ItemCatalogSlot | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("rangedStr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [maxPriceText, setMaxPriceText] = useState("");

  const { data: prices } = usePrices();
  const { data: mapping } = useMapping();

  const maxPrice = useMemo(() => parseGpInput(maxPriceText), [maxPriceText]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = ITEM_CATALOG;
    if (q) {
      rows = rows.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q),
      );
    }
    if (slot !== "all") {
      rows = rows.filter((it) => it.slot === slot);
    }
    if (maxPrice !== null) {
      rows = rows.filter((it) => {
        const p = priceForItem(prices, it.id);
        return p !== null && p <= maxPrice;
      });
    }
    return rows;
  }, [query, slot, maxPrice, prices]);

  const sorted = useMemo(() => {
    const field = SORT_FIELDS.find((f) => f.key === sortKey);
    if (!field) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const visible = sorted.slice(0, MAX_ROWS);
  const truncated = sorted.length > MAX_ROWS;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      const field = SORT_FIELDS.find((f) => f.key === key);
      setSortDir(field?.numeric ? "desc" : "asc");
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <nav className="mb-4 text-sm">
        <Link href="/" className="text-osrs-gold hover:underline">
          ← All bosses
        </Link>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-bold text-osrs-gold">Item browser</h1>
        <p className="text-sm text-parchment-dark mt-1">
          All {ITEM_CATALOG.length} equippable items from the OSRS DPS dataset.
          Sort by any combat bonus to find the best item for a slot. Live GE
          prices from the wiki API. <strong>Tip:</strong> Magic dmg column is
          tenths of a percent (50 = +5%).
        </p>
      </header>

      <div className="osrs-panel p-4 rounded mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="block">
          <span className="text-xs text-osrs-brown block mb-1">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="dragon, masori, twisted, bow…"
            className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown"
          />
        </label>
        <label className="block">
          <span className="text-xs text-osrs-brown block mb-1">Slot</span>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value as typeof slot)}
            className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown"
          >
            {SLOT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-osrs-brown block mb-1">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => toggleSort(e.target.value as SortKey)}
            className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown"
          >
            {SORT_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-osrs-brown block mb-1">
            Max price (e.g. 50m, 1b)
          </span>
          <input
            type="text"
            value={maxPriceText}
            onChange={(e) => setMaxPriceText(e.target.value)}
            placeholder="any"
            className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown"
          />
        </label>
      </div>

      <p className="text-xs text-parchment-dark mb-2">
        {sorted.length} match{sorted.length === 1 ? "" : "es"}
        {truncated && ` — showing top ${MAX_ROWS}, refine filters to see more`}
        {" · "}
        sorted by {SORT_FIELDS.find((f) => f.key === sortKey)?.label} ({sortDir})
      </p>

      <div className="osrs-panel p-2 rounded overflow-x-auto">
        <table className="w-full text-xs text-osrs-brown">
          <thead>
            <tr className="border-b border-osrs-brown/40">
              <th className="text-left p-1 sticky left-0 bg-parchment">Item</th>
              <th className="text-left p-1">Slot</th>
              {SORT_FIELDS.filter((f) => f.numeric).map((f) => (
                <th
                  key={f.key}
                  className="text-right p-1 cursor-pointer hover:bg-osrs-gold/10 select-none"
                  onClick={() => toggleSort(f.key)}
                  title={`Sort by ${f.label}`}
                >
                  {f.label}
                  {sortKey === f.key && <span> {sortDir === "asc" ? "▲" : "▼"}</span>}
                </th>
              ))}
              <th className="text-right p-1">Price</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((it) => {
              const p = priceForItem(prices, it.id);
              const isSorted = (k: SortKey) => k === sortKey;
              return (
                <tr key={`${it.id}-${it.version}`} className="border-b border-osrs-brown/30 hover:bg-osrs-gold/5">
                  <td className="p-1 sticky left-0 bg-parchment">
                    <div className="flex items-center gap-2">
                      <ItemIcon
                        itemId={it.id}
                        size={24}
                        mapping={mapping}
                        title={it.name}
                      />
                      <div>
                        <div className="font-semibold">{it.name}</div>
                        {it.version && (
                          <div className="text-[10px] text-parchment-dark">{it.version}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-1">{it.slot}</td>
                  {SORT_FIELDS.filter((f) => f.numeric).map((f) => {
                    const v = it[f.key] as number;
                    const cls = isSorted(f.key)
                      ? "text-osrs-gold font-semibold"
                      : v > 0
                        ? "text-osrs-brown"
                        : v < 0
                          ? "text-status-missing"
                          : "text-parchment-dark";
                    return (
                      <td key={f.key} className={`text-right p-1 ${cls}`}>
                        {v}
                      </td>
                    );
                  })}
                  <td className="text-right p-1 text-osrs-brown-light">{formatGp(p)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-osrs-brown mt-4">
          No items match. Try clearing the slot filter or shortening the search.
        </p>
      )}
    </div>
  );
}
