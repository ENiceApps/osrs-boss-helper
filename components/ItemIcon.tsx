"use client";

import { wikiIconUrl } from "@/lib/icons";
import type { MappingEntry } from "@/types/osrs";

interface ItemIconProps {
  itemId: number;
  /** Container size in px. The icon scales to fit (preserving aspect ratio). */
  size?: number;
  mapping?: MappingEntry[];
  faded?: boolean;
  title?: string;
}

/**
 * OSRS item icon, rendered like the wiki DPS calc: a fixed-size container
 * with the icon sized via `object-fit: contain` so non-square sprites keep
 * their aspect ratio and never overflow.
 *
 * Two URL sources, in order of preference:
 *  1. The wiki's GE mapping payload (has .icon = exact filename for every
 *     GE-tradeable item).
 *  2. Fallback to constructing the filename from the item's display name
 *     (`<name>.png`). Needed for items the GE mapping doesn't include —
 *     charged/imbued/version-suffixed variants (Toxic blowpipe (Charged),
 *     Slayer helmet (i), etc.) often miss the mapping but have predictable
 *     wiki image filenames. Also handles the brief window before the
 *     mapping API call resolves.
 *
 * Uses plain <img> (not next/image) so object-fit: contain works without
 * a position-relative parent. Pixelated rendering keeps the sharp OSRS
 * sprite look at larger zooms.
 */
export function ItemIcon({ itemId, size = 32, mapping, faded, title }: ItemIconProps) {
  const entry = mapping?.find((m) => m.id === itemId);
  let url: string | null = null;
  if (entry?.icon) {
    url = wikiIconUrl(entry.icon);
  } else if (title) {
    // Fallback — strip any trailing " (variant)" suffix only if the wiki
    // doesn't host a per-variant icon. For most variants the wiki keeps
    // the suffix in the filename, so we try the full name first.
    url = wikiIconUrl(`${title}.png`);
  }

  const label = title ?? entry?.name ?? `Item ${itemId}`;
  return (
    <div
      className={`flex items-center justify-center ${faded ? "opacity-30 grayscale" : ""}`}
      style={{ width: size, height: size }}
      title={label}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={label}
          loading="lazy"
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            // Wiki returned 404 for the constructed URL — hide the broken
            // image icon and let the title tooltip carry the meaning.
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <span className="text-[10px] text-osrs-gold">{itemId}</span>
      )}
    </div>
  );
}
