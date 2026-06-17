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
export function ItemPickerModal({ slot, currentItemId, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const { data: mapping } = useMapping();
  const items = useMemo(() => itemsForSlot(slot), [slot]);

  // Default sort: by the stat most likely to matter for this slot's purpose.
  // For weapon-likely slots we sort by ranged_atk DESC (covers crossbows /
  // bows / blowpipes); for other slots, by str+rangedStr+magicStr summed —
  // a coarse "any offensive bonus" priority. Users can search by name.
  const sorted = useMemo(() => {
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
  }, [items, slot]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-osrs-brown/70 p-4"
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
          className="w-full bg-parchment border border-osrs-brown rounded p-1.5 text-sm text-osrs-brown mb-2"
        />

        <div className="flex items-baseline justify-between text-caption text-osrs-muted mb-2">
          <span>{filtered.length} items</span>
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
            return (
              <li key={`${it.id}-${it.version}`}>
                <button
                  type="button"
                  onClick={() => onSelect(it)}
                  className={`w-full text-left p-1.5 rounded border text-caption flex items-center gap-2 ${
                    isCurrent
                      ? "border-osrs-gold bg-parchment-dark"
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
