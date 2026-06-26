"use client";

import { useEffect, useMemo, useState } from "react";
import { itemsForSlot } from "@/lib/loadout-edit";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSlotKey } from "@/types/loadout";
import { ItemIcon } from "./ItemIcon";
import { useMapping } from "@/lib/prices";

interface Props {
  slot: LoadoutSlotKey;
  currentItemId?: number;
  /** DPS of the active loadout — baseline the per-item deltas are measured against. */
  currentDps?: number;
  /** DPS the loadout would have with `item` slotted into `slot`. When provided,
   *  items are ranked by this (best DPS first) instead of by raw stat. */
  dpsForItem?: (slot: LoadoutSlotKey, item: ItemCatalogEntry | null) => number | undefined;
  onSelect: (item: ItemCatalogEntry | null) => void;
  onClose: () => void;
}

const SLOT_LABELS: Record<LoadoutSlotKey, string> = {
  head: "Head",
  cape: "Cape",
  neck: "Neck",
  ammo: "Ammo",
  weapon: "Weapon",
  body: "Body",
  shield: "Shield",
  legs: "Legs",
  hands: "Hands",
  feet: "Feet",
  ring: "Ring",
};

/**
 * Modal for picking an equipment item to slot into the current loadout.
 * Search-filtered, ranks by a slot-relevant primary stat so the best items
 * float to the top, click an item to apply. Inspired by the wgloop calc's
 * "Search for equipment..." dropdown.
 */
export function ItemPickerModal({ slot, currentItemId, currentDps, dpsForItem, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const { data: mapping } = useMapping();
  const items = useMemo(() => itemsForSlot(slot), [slot]);

  // The DPS each candidate would yield in this slot, keyed by item id. Computed
  // once per open via the parent's engine callback; absent when no callback was
  // supplied (then we fall back to a stat-based sort below).
  const dpsById = useMemo(() => {
    if (!dpsForItem) return undefined;
    const map = new Map<number, number>();
    for (const it of items) {
      const dps = dpsForItem(slot, it);
      if (dps !== undefined) map.set(it.id, dps);
    }
    return map;
  }, [items, slot, dpsForItem]);

  // Primary ordering: by resulting DPS (best first) when we have it, else by the
  // stat most likely to matter for this slot — a coarse "any offensive bonus"
  // priority. Users can always search by name.
  const sorted = useMemo(() => {
    if (dpsById) {
      return [...items].sort(
        (a, b) => (dpsById.get(b.id) ?? -Infinity) - (dpsById.get(a.id) ?? -Infinity),
      );
    }
    const slotPrimary = (item: ItemCatalogEntry): number => {
      switch (slot) {
        case "weapon":
          return Math.max(item.attackRanged, item.attackMagic, item.attackStab, item.attackSlash, item.attackCrush);
        case "ammo":
          return item.rangedStr;
        case "ring":
          return item.str + item.rangedStr + item.magicStr;
        default:
          return item.str + item.rangedStr + item.magicStr;
      }
    };
    return [...items].sort((a, b) => slotPrimary(b) - slotPrimary(a));
  }, [items, slot, dpsById]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.version.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="osrs-panel rounded p-4 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-osrs-brown">
            Pick {SLOT_LABELS[slot]} item
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-osrs-brown hover:text-osrs-gold text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${SLOT_LABELS[slot].toLowerCase()} items…`}
          className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown mb-2"
        />

        <div className="flex items-baseline justify-between text-caption text-osrs-muted mb-2">
          <span>
            {filtered.length} items{dpsById ? " · sorted by DPS" : ""}
          </span>
          {currentItemId && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-status-missing hover:underline"
            >
              Clear slot
            </button>
          )}
        </div>

        <ul className="overflow-y-auto flex-1 space-y-0.5">
          {filtered.slice(0, 200).map((it) => {
            const isCurrent = it.id === currentItemId;
            const itemDps = dpsById?.get(it.id);
            // Delta vs the active loadout's DPS. Hidden for the equipped item.
            const delta =
              itemDps !== undefined && currentDps !== undefined && !isCurrent
                ? itemDps - currentDps
                : undefined;
            return (
              <li key={`${it.id}-${it.version}`}>
                <button
                  type="button"
                  onClick={() => onSelect(it)}
                  className={`w-full text-left p-1.5 rounded border text-caption flex items-center gap-2 ${
                    isCurrent
                      ? "border-osrs-gold bg-osrs-gold/15"
                      : "border-transparent hover:border-osrs-gold/40 hover:bg-osrs-gold/5"
                  }`}
                >
                  <ItemIcon
                    itemId={it.id}
                    size={28}
                    mapping={mapping}
                    title={it.name}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-osrs-brown truncate">
                      {it.name}
                      {it.version && (
                        <span className="label-eyebrow font-normal text-osrs-muted ml-1">
                          ({it.version})
                        </span>
                      )}
                    </div>
                    <div className="label-eyebrow text-osrs-brown-light flex flex-wrap gap-x-2">
                      {it.category && <span>{it.category}</span>}
                      {it.attackStab > 0 && <span>stab+{it.attackStab}</span>}
                      {it.attackSlash > 0 && <span>slash+{it.attackSlash}</span>}
                      {it.attackCrush > 0 && <span>crush+{it.attackCrush}</span>}
                      {it.attackMagic > 0 && <span>magic+{it.attackMagic}</span>}
                      {it.attackRanged > 0 && <span>ranged+{it.attackRanged}</span>}
                      {it.str > 0 && <span>str+{it.str}</span>}
                      {it.rangedStr > 0 && <span>rStr+{it.rangedStr}</span>}
                      {it.magicStr > 0 && <span>magDmg+{it.magicStr / 10}%</span>}
                      {it.speed > 0 && <span>{it.speed}t</span>}
                    </div>
                  </div>
                  {delta !== undefined && Math.abs(delta) >= 0.005 && (
                    <span
                      className={`shrink-0 tabular-nums font-semibold ${
                        delta > 0 ? "text-status-owned" : "text-status-missing"
                      }`}
                      title="DPS change vs the current loadout"
                    >
                      {delta > 0 ? "+" : "−"}
                      {Math.abs(delta).toFixed(2)}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="shrink-0 label-eyebrow text-osrs-muted">equipped</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {filtered.length > 200 && (
          <p className="label-eyebrow text-osrs-muted mt-1">
            Showing top 200 — refine search to narrow.
          </p>
        )}
      </div>
    </div>
  );
}
