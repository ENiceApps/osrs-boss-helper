"use client";

import type { ConsumableSuggestion, MappingEntry } from "@/types/osrs";
import { ItemIcon } from "./ItemIcon";

interface Props {
  consumables: ConsumableSuggestion[];
  mapping?: MappingEntry[];
}

const INVENTORY_SIZE = 28;

export function InventoryPanel({ consumables, mapping }: Props) {
  const cells: Array<ConsumableSuggestion | null> = [];
  for (const c of consumables) {
    for (let i = 0; i < c.quantity && cells.length < INVENTORY_SIZE; i++) {
      cells.push(c);
    }
  }
  while (cells.length < INVENTORY_SIZE) cells.push(null);

  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-3 text-center">Recommended inventory</h3>
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: "repeat(4, 48px)",
          gridAutoRows: "48px",
          gap: "4px",
          justifyContent: "center",
        }}
      >
        {cells.map((c, idx) => (
          <div
            key={idx}
            className={`osrs-slot flex items-center justify-center ${c ? "" : "osrs-slot-empty"}`}
            title={c ? `${c.name} (${c.role})` : "Empty"}
          >
            {c && (
              <ItemIcon itemId={Number(c.itemId)} size={36} mapping={mapping} title={c.name} />
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-osrs-brown-light mt-2 text-center">
        Quantities are recommendations; bank tag exports don&rsquo;t include stack sizes.
      </p>
    </div>
  );
}
