"use client";

import { ItemIcon } from "@/components/ItemIcon";
import { specRecommendationsForBoss } from "@/data/bosses/spec-weapons";
import { findSpecWeapon } from "@/data/spec-weapons";
import { isHalberdWeapon } from "@/data/items/halberd-weapons";
import { asItemId, type MappingEntry } from "@/types/osrs";
import type { BossSpecRecommendation, SpecRole } from "@/types/spec-weapons";

/** Crystal halberd — the canonical spec weapon for any halberd-based setup. */
const CRYSTAL_HALBERD_ID = 23987;

interface Props {
  slug: string;
  mapping?: MappingEntry[];
  /** Item IDs the player owns. Used to show an "owned ✓" indicator per spec weapon. */
  ownedItemIds?: Set<number>;
  /** The active loadout's weapon id — when it's a halberd, we add the Crystal halberd spec. */
  weaponItemId?: number;
}

/**
 * Display-only panel showing the curated spec weapon recommendations for
 * this boss. Phase 4 data; not in the DPS math. Renders nothing if the boss
 * has no curated recommendations (most monsters).
 */
export function SpecWeaponsPanel({ slug, mapping, ownedItemIds, weaponItemId }: Props) {
  const recs: BossSpecRecommendation[] = [...specRecommendationsForBoss(slug)];

  // Halberd-aware: a halberd setup pairs naturally with the Crystal halberd's
  // special (extended-reach AoE / double-hit burst). Add it whenever the active
  // weapon is a halberd and it isn't already listed for this boss.
  if (
    weaponItemId !== undefined &&
    isHalberdWeapon(weaponItemId) &&
    !recs.some((r) => r.specWeaponId === CRYSTAL_HALBERD_ID)
  ) {
    recs.unshift({
      specWeaponId: asItemId(CRYSTAL_HALBERD_ID),
      note: "With a halberd equipped, the Crystal halberd spec is your burst option — its reach hits multiple targets in a line and double-hits large monsters.",
    });
  }

  if (recs.length === 0) return null;

  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="section-title font-semibold text-osrs-brown mb-2">
        Recommended spec weapons
      </h3>
      <p className="text-caption text-osrs-muted mb-3">
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
                      <span className="ml-1 label-eyebrow text-status-owned">
                        ✓ owned
                      </span>
                    )}
                  </div>
                  <span className="label-eyebrow text-osrs-muted shrink-0">
                    {weapon.energyCost !== null ? `${weapon.energyCost}% spec` : "variable"}
                  </span>
                </div>
                <div className="text-caption text-osrs-brown-light italic">
                  {weapon.specName} · {roleLabel(weapon.role)}
                </div>
                <p className="text-caption text-osrs-brown mt-1">{rec.note}</p>
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
