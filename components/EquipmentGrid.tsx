"use client";

import { ItemIcon } from "./ItemIcon";
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

/**
 * The bare OSRS paper-doll equipment grid, shared by every surface that shows
 * a loadout. Consolidates the duplicate grids that lived in EquipmentPanel
 * and OptimizerPanel's EquipmentPanelInline. No panel chrome — callers own
 * the card, heading, and surrounding context.
 */
export function EquipmentGrid({
  set,
  ownedItemIds,
  mapping,
  onSlotClick,
  slotSize = 48,
  editedSlots,
}: Props) {
  // Only fade missing items when we actually know what the player owns —
  // otherwise every slot would render greyed-out by default.
  const hasBank = (ownedItemIds?.size ?? 0) > 0;
  const clickable = Boolean(onSlotClick);
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
        const tooltipBase = piece
          ? hasBank
            ? `${piece.itemName} (${owned ? "owned" : "missing"})`
            : piece.itemName
          : slot;
        const tooltip = clickable ? `${tooltipBase} — click to change` : tooltipBase;
        const className = [
          "osrs-slot flex items-center justify-center",
          piece ? "" : "osrs-slot-empty",
          clickable ? "cursor-pointer hover:ring-2 hover:ring-osrs-gold/60" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const Element = clickable ? "button" : "div";
        return (
          <Element
            key={slot}
            type={clickable ? "button" : undefined}
            onClick={clickable ? () => onSlotClick?.(slot) : undefined}
            className={className}
            style={{
              gridArea: AREA_NAMES[slot],
              width: slotSize,
              height: slotSize,
              // Inline outline rather than box-shadow: .osrs-slot's bevel is
              // built from inset box-shadows, which a ring would overwrite.
              outline: edited ? "2px solid var(--color-osrs-gold)" : undefined,
              outlineOffset: edited ? "-1px" : undefined,
            }}
            title={tooltip}
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
        );
      })}
    </div>
  );
}
