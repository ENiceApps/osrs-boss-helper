"use client";

import { useState } from "react";
import { ItemIcon } from "./ItemIcon";
import type { SlotExplanation } from "@/lib/loadout-explain";
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
}: Props) {
  // Only fade missing items when we actually know what the player owns —
  // otherwise every slot would render greyed-out by default.
  const hasBank = (ownedItemIds?.size ?? 0) > 0;
  const clickable = Boolean(onSlotClick);
  // State-driven (not CSS :hover) so focus shows tooltips too, and only one
  // card can ever be open.
  const [hoverSlot, setHoverSlot] = useState<LoadoutSlotKey | null>(null);
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
        return (
          <div
            key={slot}
            className="relative"
            style={{ gridArea: AREA_NAMES[slot], width: slotSize, height: slotSize }}
          >
            <Element
              type={clickable ? "button" : undefined}
              onClick={clickable ? () => onSlotClick?.(slot) : undefined}
              onMouseEnter={() => setHoverSlot(slot)}
              onMouseLeave={() => setHoverSlot((s) => (s === slot ? null : s))}
              onFocus={() => setHoverSlot(slot)}
              onBlur={() => setHoverSlot((s) => (s === slot ? null : s))}
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
                />
              )}
            </Element>

            {showTooltip && (
              <div
                id={`slot-tip-${slot}`}
                role="tooltip"
                className={`absolute top-0 z-20 w-56 pointer-events-none osrs-panel rounded p-2.5 text-left shadow-lg ${
                  RIGHT_COLUMN.has(slot) ? "right-full mr-2" : "left-full ml-2"
                }`}
              >
                <div className="text-xs font-semibold text-osrs-brown leading-snug">
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
                {detail?.bonusLine && (
                  <div className="text-caption text-osrs-muted mt-0.5">{detail.bonusLine}</div>
                )}
                {detail?.marginalDps !== undefined && (
                  <div className="text-caption text-osrs-brown mt-1">
                    <span className="font-semibold text-status-owned">
                      +{detail.marginalDps.toFixed(2)} DPS
                    </span>{" "}
                    vs leaving this slot empty
                  </div>
                )}
                {detail?.reasons.map((reason) => (
                  <div key={reason} className="text-caption text-osrs-gold mt-0.5 leading-snug">
                    ★ {reason}
                  </div>
                ))}
                {clickable && (
                  <div className="text-caption text-osrs-muted italic mt-1">click to change</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
