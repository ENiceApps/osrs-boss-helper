"use client";

// "Sell to fund" checklist. In sell-to-fund mode the player picks which unused,
// tradeable bank items to liquidate; their GE value bankrolls the upgrade path.
// Sorted by value, with the optimizer's recommended sales pre-checked (★) and
// all / none / recommended helpers.

import { ItemIcon } from "@/components/ItemIcon";
import { fmtGp } from "@/lib/format";
import type { MappingEntry } from "@/types/osrs";

export interface SellableItem {
  itemId: number;
  name: string;
  valueGp: number;
}

interface Props {
  /** Sellable (unused, tradeable) bank items, value-descending. */
  items: SellableItem[];
  /** Currently checked ids — these fund the upgrade path. */
  selected: Set<number>;
  /** Optimizer's recommended sales (the default-checked set), flagged with ★. */
  recommended: Set<number>;
  onToggle: (itemId: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectRecommended: () => void;
  mapping?: MappingEntry[];
}

const QUICK_BTN =
  "rounded border border-osrs-brown/40 px-2 py-0.5 text-osrs-brown hover:border-osrs-brown";

/**
 * Sell-to-fund checklist. The player explicitly picks which spare bank items to
 * liquidate; the summed GE value of checked items tops up the upgrade budget.
 * Recommended sales are pre-checked by the page (see recommendedSellToFund).
 */
export function SellSelectionPanel({
  items,
  selected,
  recommended,
  onToggle,
  onSelectAll,
  onSelectNone,
  onSelectRecommended,
  mapping,
}: Props) {
  const total = items.reduce((s, i) => (selected.has(i.itemId) ? s + i.valueGp : s), 0);
  const count = items.reduce((n, i) => (selected.has(i.itemId) ? n + 1 : n), 0);

  return (
    <div className="osrs-panel p-4 rounded space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="section-title font-semibold text-osrs-brown">Sell to fund</h3>
        <span className="text-caption text-osrs-gold font-semibold">
          +{fmtGp(total)} · {count} item{count === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-caption text-osrs-muted italic">
          No spare tradeable items in your bank to sell.
        </p>
      ) : (
        <>
          <div className="flex gap-2 text-caption">
            <button type="button" onClick={onSelectRecommended} className={QUICK_BTN}>
              Recommended
            </button>
            <button type="button" onClick={onSelectAll} className={QUICK_BTN}>
              All
            </button>
            <button type="button" onClick={onSelectNone} className={QUICK_BTN}>
              None
            </button>
          </div>

          <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => {
              const checked = selected.has(item.itemId);
              const rec = recommended.has(item.itemId);
              return (
                <li key={item.itemId}>
                  <label
                    className={`flex items-center gap-2 osrs-well rounded px-2 py-1 text-xs cursor-pointer ${
                      checked ? "ring-1 ring-osrs-gold" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(item.itemId)}
                      className="h-3.5 w-3.5 accent-osrs-gold"
                    />
                    <ItemIcon itemId={item.itemId} size={22} mapping={mapping} title={item.name} />
                    <span className="flex-1 truncate text-osrs-brown">
                      {item.name}
                      {rec && (
                        <span className="ml-1 text-osrs-gold" title="Recommended sale">
                          ★
                        </span>
                      )}
                    </span>
                    <span className="text-osrs-muted">{fmtGp(item.valueGp)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
