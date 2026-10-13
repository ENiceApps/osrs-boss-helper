"use client";

import { useState } from "react";
import { localItemIconUrl, runeliteIconUrl, wikiIconUrl } from "@/lib/icons";
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
   * the alt text. Use when a parent renders its own
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
 *  1. Our own copy (public/icons/items/<id>.png), for every equipment-catalog
 *     item. Vendored from osrs-dps-calc so equipment never touches the wiki.
 *  2. The wiki's GE mapping payload (.icon = exact filename for every
 *     GE-tradeable item) — covers non-equipment items like drops. An exact
 *     /images/ URL is served from the wiki's CDN cache.
 *  3. RuneLite's cache icon, keyed by item id. Catches anything else.
 *     Last because its sprites carry inventory padding and look smaller.
 *
 * No guessing `<name>.png` on the wiki: a wrong guess is a miss that reaches
 * the wiki's servers, multiplied by every visitor.
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
    catalogImage && localItemIconUrl(itemId),
    entry?.icon && wikiIconUrl(entry.icon),
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
