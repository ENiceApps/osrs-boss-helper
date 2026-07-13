"use client";

// The equipment "paper-doll" grid — one cell per worn slot (head, cape, weapon,
// body, …) showing each item's icon. Items the player doesn't own are faded;
// manually-edited slots get a gold outline; when clickable, a slot opens the
// item picker and shows a "why this item" tooltip. Used by LoadoutPanel and
// HybridPanel.

import { useMemo, useState } from "react";
import { ItemIcon } from "./ItemIcon";
import { fmtGp } from "@/lib/format";
import { usePrices, priceForItem } from "@/lib/prices";
import type { SlotExplanation } from "@/lib/loadout-explain";
import type { SlotAlternative } from "@/lib/slot-alternatives";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { MappingEntry } from "@/types/osrs";

interface Props {
  /** Undefined renders an all-empty doll (the not-connected placeholder). */
  set?: LoadoutSet;
  /** Ownership fading only applies when this is non-empty (bank known). */
  ownedItemIds?: Set<number>;
  mapping?: MappingEntry[];
  /** When set, slots become clickable and call this on click. */
  onSlotClick?: (slot: LoadoutSlotKey) => void;
  /** Slot cell size in px. Icons render 12px smaller. */
  slotSize?: number;
  /** Slots the user has manually overridden — marked with a gold outline. */
  editedSlots?: ReadonlySet<LoadoutSlotKey>;
  /**
   * Per-slot "why this item" details. When provided, hovering/focusing a slot
   * shows a rich tooltip card instead of the native title attribute.
   */
  slotDetails?: Partial<Record<LoadoutSlotKey, SlotExplanation>>;
  /**
   * Ranked "next best options" for a slot. Called lazily for the hovered slot
   * only (candidate scoring re-runs the DPS engine). When provided together
   * with `onAlternativePick`, the tooltip grows a clickable alternatives list.
   */
  slotAlternatives?: (slot: LoadoutSlotKey) => SlotAlternative[];
  /** Apply an alternative to the loadout (same effect as picking it in the modal). */
  onAlternativePick?: (slot: LoadoutSlotKey, item: ItemCatalogEntry) => void;
}

const ALL_SLOTS: LoadoutSlotKey[] = [
  "head",
  "cape",
  "neck",
  "ammo",
  "weapon",
  "body",
  "shield",
  "legs",
  "hands",
  "feet",
  "ring",
];

const AREA_NAMES: Record<LoadoutSlotKey, string> = {
  head: "head",
  cape: "cape",
  neck: "neck",
  ammo: "ammo",
  weapon: "weap",
  body: "body",
  shield: "shld",
  legs: "legs",
  hands: "hand",
  feet: "feet",
  ring: "ring",
};

// Tooltips open toward the page's whitespace: right-column slots flip left so
// the card stays over the panel instead of colliding with the results rail.
const RIGHT_COLUMN: ReadonlySet<LoadoutSlotKey> = new Set(["ammo", "shield", "ring"]);

/**
 * The bare OSRS paper-doll equipment grid, shared by every surface that shows
 * a loadout. No panel chrome — callers own the card, heading, and surrounding
 * context. With `slotDetails`, each slot grows a hover/focus tooltip
 * explaining what the item contributes and why it was picked.
 */
export function EquipmentGrid({
  set,
  ownedItemIds,
  mapping,
  onSlotClick,
  slotSize = 48,
  editedSlots,
  slotDetails,
  slotAlternatives,
  onAlternativePick,
}: Props) {
  const { data: prices } = usePrices();
  // Only fade missing items when we actually know what the player owns —
  // otherwise every slot would render greyed-out by default.
  const hasBank = (ownedItemIds?.size ?? 0) > 0;
  const clickable = Boolean(onSlotClick);
  // State-driven (not CSS :hover) so focus shows tooltips too, and only one
  // card can ever be open.
  const [hoverSlot, setHoverSlot] = useState<LoadoutSlotKey | null>(null);
  // Next-best options for the hovered slot only — each candidate is a DPS
  // engine run, so this is deliberately lazy rather than precomputed per slot.
  const alternatives = useMemo<SlotAlternative[]>(() => {
    if (!hoverSlot || !slotAlternatives || !set?.slots[hoverSlot]) return [];
    return slotAlternatives(hoverSlot);
  }, [hoverSlot, slotAlternatives, set]);
  return (
    <div
      className="grid mx-auto"
      style={{
        gridTemplateAreas: `
          ".    head .   "
          "cape neck ammo"
          "weap body shld"
          ".    legs .   "
          "hand feet ring"
        `,
        gridTemplateColumns: `${slotSize}px ${slotSize}px ${slotSize}px`,
        gap: "6px",
        justifyContent: "center",
      }}
    >
      {ALL_SLOTS.map((slot) => {
        const piece = set?.slots[slot];
        const owned = piece ? (ownedItemIds?.has(piece.itemId) ?? false) : false;
        const edited = editedSlots?.has(slot) ?? false;
        const detail = piece ? slotDetails?.[slot] : undefined;
        const labelBase = piece
          ? hasBank
            ? `${piece.itemName} (${owned ? "owned" : "missing"})`
            : piece.itemName
          : `${slot} — empty`;
        const label = clickable ? `${labelBase} — click to change` : labelBase;
        const className = [
          "osrs-slot flex items-center justify-center",
          piece ? "" : "osrs-slot-empty",
          clickable ? "cursor-pointer hover:ring-2 hover:ring-osrs-gold/60" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const Element = clickable ? "button" : "div";
        const showTooltip = hoverSlot === slot && Boolean(slotDetails) && Boolean(piece);
        // The tooltip only takes pointer events when it has clickable
        // alternatives — a passive card must not block hovers on neighbours.
        const interactive =
          showTooltip && alternatives.length > 0 && Boolean(onAlternativePick);
        return (
          <div
            key={slot}
            className="relative"
            style={{ gridArea: AREA_NAMES[slot], width: slotSize, height: slotSize }}
            // Hover/focus lives on the wrapper (not the slot button) so the
            // pointer — or the tab focus — can travel into the tooltip's
            // alternative rows without the card closing under it.
            onMouseEnter={() => setHoverSlot(slot)}
            onMouseLeave={() => setHoverSlot((s) => (s === slot ? null : s))}
            onFocus={() => setHoverSlot(slot)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setHoverSlot((s) => (s === slot ? null : s));
              }
            }}
          >
            <Element
              type={clickable ? "button" : undefined}
              onClick={clickable ? () => onSlotClick?.(slot) : undefined}
              className={className}
              style={{
                width: slotSize,
                height: slotSize,
                // Inline outline rather than box-shadow: .osrs-slot's bevel is
                // built from inset box-shadows, which a ring would overwrite.
                outline: edited ? "2px solid var(--color-osrs-gold)" : undefined,
                outlineOffset: edited ? "-1px" : undefined,
              }}
              // Native title only when there's no rich tooltip — both at once
              // would double up.
              title={slotDetails ? undefined : label}
              aria-label={label}
              aria-describedby={showTooltip && detail ? `slot-tip-${slot}` : undefined}
            >
              {piece && (
                <ItemIcon
                  itemId={piece.itemId}
                  size={slotSize - 12}
                  mapping={mapping}
                  faded={hasBank && !owned}
                  title={piece.itemName}
                  // The rich hover card already names the item — a native
                  // tooltip on top of it would double up.
                  nativeTooltip={!slotDetails}
                />
              )}
            </Element>

            {showTooltip && (
              <div
                id={`slot-tip-${slot}`}
                role="tooltip"
                // The gap to the slot is padding (not margin) so an interactive
                // card stays hovered while the pointer crosses it.
                className={`absolute top-0 z-20 w-56 osrs-panel rounded p-2.5 text-left shadow-lg ${
                  interactive ? "" : "pointer-events-none"
                } ${
                  RIGHT_COLUMN.has(slot)
                    ? "right-full mr-2 before:absolute before:top-0 before:bottom-0 before:left-full before:w-2 before:content-['']"
                    : "left-full ml-2 before:absolute before:top-0 before:bottom-0 before:right-full before:w-2 before:content-['']"
                }`}
              >
                <div className="text-caption font-semibold text-osrs-brown leading-snug">
                  {piece!.itemName}
                  {hasBank && (
                    <span
                      className={`ml-1.5 font-normal ${
                        owned ? "text-status-owned" : "text-status-missing"
                      }`}
                    >
                      {owned ? "owned" : "missing"}
                    </span>
                  )}
                </div>
                {(() => {
                  const gp = priceForItem(prices, piece!.itemId);
                  return gp !== null ? (
                    <div className="text-caption text-osrs-muted mt-0.5">
                      {fmtGp(gp)}{" "}
                      <span className="text-osrs-gold/70">gp</span>
                    </div>
                  ) : null;
                })()}
                {detail?.bonusLine && (
                  <div className="text-caption text-osrs-muted mt-0.5">{detail.bonusLine}</div>
                )}
                {detail?.vsBank ? (
                  <div className="text-caption text-osrs-brown mt-1">
                    <span
                      className={`font-semibold ${
                        detail.vsBank.dpsDelta >= 0 ? "text-status-owned" : "text-status-missing"
                      }`}
                    >
                      {detail.vsBank.dpsDelta >= 0 ? "+" : ""}
                      {detail.vsBank.dpsDelta.toFixed(2)} DPS
                    </span>{" "}
                    vs {detail.vsBank.vsItemName ?? "leaving this slot empty"}
                  </div>
                ) : (
                  detail?.marginalDps !== undefined && (
                    <div className="text-caption text-osrs-brown mt-1">
                      <span className="font-semibold text-status-owned">
                        +{detail.marginalDps.toFixed(2)} DPS
                      </span>{" "}
                      vs leaving this slot empty
                    </div>
                  )
                )}
                {detail?.reasons.map((reason) => (
                  <div key={reason} className="text-caption text-osrs-gold mt-0.5 leading-snug">
                    ★ {reason}
                  </div>
                ))}
                {interactive && (
                  <div className="mt-1.5 border-t border-osrs-brown/20 pt-1.5">
                    <div className="label-eyebrow text-osrs-muted mb-0.5">
                      next best options
                    </div>
                    {alternatives.map((alt) => (
                      <button
                        key={alt.item.id}
                        type="button"
                        onClick={() => onAlternativePick?.(slot, alt.item)}
                        title={`Swap to ${alt.item.name}`}
                        className="w-full flex items-center gap-1.5 rounded px-1 py-0.5 text-left cursor-pointer hover:bg-osrs-gold/10"
                      >
                        <ItemIcon
                          itemId={alt.item.id}
                          size={18}
                          mapping={mapping}
                          // Title feeds the wiki-filename icon fallback for
                          // items the GE mapping doesn't cover; the row's own
                          // hover title carries the meaning, so no native tip.
                          title={alt.item.name}
                          nativeTooltip={false}
                        />
                        <span className="flex-1 min-w-0 truncate text-caption text-osrs-brown">
                          {alt.item.name}
                        </span>
                        <span
                          className={`shrink-0 tabular-nums text-caption font-semibold ${
                            alt.delta >= -0.005 ? "text-status-owned" : "text-status-missing"
                          }`}
                          title="DPS change vs the current loadout"
                        >
                          {alt.delta >= 0 ? "+" : "−"}
                          {Math.abs(alt.delta).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {clickable && (
                  <div className="text-caption text-osrs-muted italic mt-1">
                    click slot for all options
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
