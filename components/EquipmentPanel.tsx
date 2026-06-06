"use client";

import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { MappingEntry } from "@/types/osrs";
import { ItemIcon } from "./ItemIcon";

interface Props {
  set?: LoadoutSet;
  ownedItemIds: Set<number>;
  mapping?: MappingEntry[];
  /** When set, slots become clickable and call this on click. Enables gear editing. */
  onSlotClick?: (slot: LoadoutSlotKey) => void;
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

export function EquipmentPanel({ set, ownedItemIds, mapping, onSlotClick }: Props) {
  // Only fade missing items when the user has actually told us what they
  // own. Before a bank tag is pasted, ownedItemIds is empty and EVERY
  // slot would render as "missing" — which made all icons look greyed-out
  // by default. Treat "no bank pasted" as "ownership unknown" instead.
  const hasBank = ownedItemIds.size > 0;
  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-3 text-center">Equipment</h3>
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
          gridTemplateColumns: "48px 48px 48px",
          gap: "6px",
          justifyContent: "center",
        }}
      >
        {ALL_SLOTS.map((slot) => {
          const piece = set?.slots[slot];
          const owned = piece ? ownedItemIds.has(piece.itemId) : false;
          const tooltipBase = piece
            ? hasBank
              ? `${piece.itemName} (${owned ? "owned" : "missing"})`
              : piece.itemName
            : slot;
          const tooltip = onSlotClick
            ? `${tooltipBase} — click to change`
            : tooltipBase;
          const clickable = Boolean(onSlotClick);
          const className = [
            "osrs-slot flex items-center justify-center",
            piece ? "" : "osrs-slot-empty",
            clickable
              ? "cursor-pointer hover:ring-2 hover:ring-osrs-gold/60"
              : "",
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
              style={{ gridArea: AREA_NAMES[slot], width: 48, height: 48 }}
              title={tooltip}
            >
              {piece && (
                <ItemIcon
                  itemId={piece.itemId}
                  size={36}
                  mapping={mapping}
                  faded={hasBank && !owned}
                  title={piece.itemName}
                />
              )}
            </Element>
          );
        })}
      </div>
    </div>
  );
}
