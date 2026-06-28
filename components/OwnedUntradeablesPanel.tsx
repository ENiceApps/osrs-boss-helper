"use client";

// "Untradeables you own" checklist. The optimizer can't buy non-tradeable BiS
// gear (Void, quest/diary rewards, …), so this lets the player tick which ones
// they actually have, per slot; ticked items then become eligible for the build.
// Best-first within each slot, with select-all / none helpers.

import { ItemIcon } from "@/components/ItemIcon";
import { CollapsibleSection } from "@/components/ui";
import type { MappingEntry } from "@/types/osrs";

export interface UntradeableOption {
  itemId: number;
  name: string;
}

export interface UntradeableSlotGroup {
  slot: string;
  items: UntradeableOption[];
}

interface Props {
  /** Non-tradeable options per slot, best-first, for the current build's style. */
  groups: UntradeableSlotGroup[];
  /** Ids the player has checked as owned. */
  owned: Set<number>;
  onToggle: (itemId: number) => void;
  /** Check every listed option (own everything). */
  onSelectAll: () => void;
  /** Uncheck everything. */
  onSelectNone: () => void;
  mapping?: MappingEntry[];
}

const QUICK_BTN =
  "rounded border border-osrs-brown/40 px-2 py-0.5 text-osrs-brown hover:border-osrs-brown";

/**
 * Budget-mode panel: per-slot lists of the non-tradeable items that could
 * improve this build. You can't buy these on the GE, so check the ones you
 * actually own — the builder then uses your best owned item in each slot and
 * falls back to a buyable item wherever you own none.
 */
export function OwnedUntradeablesPanel({
  groups,
  owned,
  onToggle,
  onSelectAll,
  onSelectNone,
  mapping,
}: Props) {
  if (groups.length === 0) return null;
  const ownedCount = groups.reduce(
    (n, g) => n + g.items.reduce((m, i) => (owned.has(i.itemId) ? m + 1 : m), 0),
    0,
  );

  return (
    <CollapsibleSection
      title="Untradeables you own"
      right={
        ownedCount > 0 ? (
          <span className="text-caption text-osrs-gold tabular-nums">{ownedCount} checked</span>
        ) : undefined
      }
    >
      <p className="text-caption text-osrs-muted mb-2">
        Check the non-tradeable items you own. The builder uses your best owned
        item per slot, and a buyable item wherever you own none.
      </p>

      <div className="flex gap-2 text-caption mb-2">
        <button type="button" onClick={onSelectAll} className={QUICK_BTN}>
          I have all
        </button>
        <button type="button" onClick={onSelectNone} className={QUICK_BTN}>
          None
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.slot}>
            <h4 className="label-eyebrow text-osrs-brown/70 mb-0.5 capitalize">
              {group.slot}
            </h4>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isOwned = owned.has(item.itemId);
                return (
                  <li key={item.itemId}>
                    <label
                      className={`flex items-center gap-2 osrs-well rounded px-2 py-1 text-xs cursor-pointer ${
                        isOwned ? "ring-1 ring-osrs-gold" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isOwned}
                        onChange={() => onToggle(item.itemId)}
                        className="h-3.5 w-3.5 accent-osrs-gold"
                      />
                      <ItemIcon itemId={item.itemId} size={22} mapping={mapping} title={item.name} />
                      <span className="flex-1 truncate text-osrs-brown">{item.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
