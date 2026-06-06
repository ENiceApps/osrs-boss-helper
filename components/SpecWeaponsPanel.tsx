"use client";

import { ItemIcon } from "@/components/ItemIcon";
import { specRecommendationsForBoss } from "@/data/bosses/spec-weapons";
import { findSpecWeapon } from "@/data/spec-weapons";
import type { MappingEntry } from "@/types/osrs";
import type { SpecRole } from "@/types/spec-weapons";

interface Props {
  slug: string;
  mapping?: MappingEntry[];
  /** Item IDs the player owns. Used to show an "owned ✓" indicator per spec weapon. */
  ownedItemIds?: Set<number>;
}

/**
 * Display-only panel showing the curated spec weapon recommendations for
 * this boss. Phase 4 data; not in the DPS math. Renders nothing if the boss
 * has no curated recommendations (most monsters).
 */
export function SpecWeaponsPanel({ slug, mapping, ownedItemIds }: Props) {
  const recs = specRecommendationsForBoss(slug);
  if (recs.length === 0) return null;

  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-2">
        Recommended spec weapons
      </h3>
      <p className="text-[11px] text-parchment-dark mb-3">
        Special-attack weapons that pay off on this fight. Click to learn the
        spec mechanics.
      </p>
      <ul className="space-y-2">
        {recs.map((rec) => {
          const weapon = findSpecWeapon(rec.specWeaponId);
          if (!weapon) return null;
          const owned = ownedItemIds?.has(weapon.itemId) ?? false;
          return (
            <li
              key={weapon.itemId}
              className="flex gap-3 bg-parchment border border-osrs-brown/40 rounded p-2"
            >
              <div className="shrink-0">
                <ItemIcon
                  itemId={weapon.itemId}
                  size={36}
                  mapping={mapping}
                  title={weapon.name}
                  faded={ownedItemIds !== undefined && !owned}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-osrs-brown text-sm truncate">
                    {weapon.name}
                    {owned && (
                      <span className="ml-1 text-[10px] text-status-owned">
                        ✓ owned
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-parchment-dark shrink-0">
                    {weapon.energyCost !== null ? `${weapon.energyCost}% spec` : "variable"}
                  </span>
                </div>
                <div className="text-[11px] text-osrs-brown-light italic">
                  {weapon.specName} · {roleLabel(weapon.role)}
                </div>
                <p className="text-[11px] text-osrs-brown mt-1">{rec.note}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function roleLabel(role: SpecRole): string {
  switch (role) {
    case "defence-reduction": return "Defence drop";
    case "dps-spike": return "DPS spike";
    case "healing": return "Heal";
    case "freeze-stun": return "CC";
    case "prayer-management": return "Prayer mgmt";
    case "anti-prayer": return "Anti-prayer";
    case "self-buff": return "Self-buff";
    case "aoe": return "AoE";
    case "true-max": return "True max";
  }
}
