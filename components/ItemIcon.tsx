"use client";

import { useState } from "react";
import { runeliteIconUrl, wikiIconUrl } from "@/lib/icons";
import { findCatalogItem } from "@/lib/loadout-edit";
import type { MappingEntry } from "@/types/osrs";

interface ItemIconProps {
  itemId: number;
  /** Container size in px. The icon scales to fit (preserving aspect ratio). */
  size?: number;
  mapping?: MappingEntry[];
  faded?: boolean;
  title?: string;
  /**
   * Set false to suppress the native browser tooltip — `title` still feeds
   * the fallback icon URL and alt text. Use when a parent renders its own
   * rich tooltip so the two don't stack.
   */
  nativeTooltip?: boolean;
}

/**
 * OSRS item icon, rendered like the wiki DPS calc: a fixed-size container
 * with the icon sized via `object-fit: contain` so non-square sprites keep
 * their aspect ratio and never overflow.
 *
 * URL sources, tried in order — each one that fails to load falls through
 * to the next:
 *  1. The equipment catalog's `image` — the wiki filename recorded for that
 *     item id, including versioned variants whose file isn't `<name>.png`
 *     (Ahrim's robetop 0, Crystal body (inactive), Calamity chest (l)…).
 *  2. The wiki's GE mapping payload (has .icon = exact filename for every
 *     GE-tradeable item) — covers non-equipment items.
 *  3. The filename constructed from the item's display name (`<name>.png`).
 *     Also handles the brief window before the mapping API call resolves.
 *  4. RuneLite's cache icon, keyed by item id. Always matches the id, so it
 *     catches items whose wiki file was renamed since the catalog was built
 *     (Blue moon chestplate, Karil's leathertop 100…). Last because its
 *     sprites carry inventory padding and look smaller than the wiki's.
 *
 * Uses plain <img> (not next/image) so object-fit: contain works without
 * a position-relative parent. Pixelated rendering keeps the sharp OSRS
 * sprite look at larger zooms.
 */
export function ItemIcon({
  itemId,
  size = 32,
  mapping,
  faded,
  title,
  nativeTooltip = true,
}: ItemIconProps) {
  const entry = mapping?.find((m) => m.id === itemId);
  const catalogImage = findCatalogItem(itemId)?.image;
  const candidates = [
    catalogImage && wikiIconUrl(catalogImage),
    entry?.icon && wikiIconUrl(entry.icon),
    title && wikiIconUrl(`${title}.png`),
    runeliteIconUrl(itemId),
  ].filter((u): u is string => !!u);
  // URLs that already errored. A new itemId brings new URLs, so this never
  // needs resetting.
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const url = candidates.find((u) => !failed.has(u)) ?? null;

  const label = title ?? entry?.name ?? `Item ${itemId}`;
  return (
    <div
      className={`flex items-center justify-center ${faded ? "opacity-30 grayscale" : ""}`}
      style={{ width: size, height: size }}
      title={nativeTooltip ? label : undefined}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={label}
          loading="lazy"
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          onError={() => setFailed((prev) => new Set(prev).add(url))}
        />
      ) : (
        <span className="text-[10px] text-osrs-gold">{itemId}</span>
      )}
    </div>
  );
}
