// Ammo ↔ weapon compatibility check. Used by the preset codegen to catch
// authoring errors like "Ruby dragon bolts (e) on a Rune crossbow" (dragon
// bolts require a Dragon-tier crossbow or higher, but the bug we hit was
// the bolt was accepted silently because vendor data doesn't encode the
// ammo-class / tier rules).
//
// Schema:
//   WEAPON_AMMO: keyed by weapon item name → { class, maxTier }
//   AMMO_TYPES:  keyed by ammo item name   → { class, tier }
//   class:       which ammo family this weapon takes (bolt / arrow / dart / etc).
//   tier:        1..7 ladder mirroring metal tiers (Bronze=1 … Runite=6, Dragon=7).
//
// Coverage is intentionally narrow — just enough to validate our current and
// near-future presets. Extend as new weapons / ammo show up in source presets.

export type AmmoClass =
  | "bolt"
  | "arrow"
  | "dart"
  | "javelin"
  | "knife"
  | "chinchompa"
  | "throwing-axe"
  | "bolt-rack"; // Karil's crossbow only

// Blowpipes consume darts loaded inside the weapon (no in-game ammo slot),
// but we model the dart in the ammo slot so its strength bonus participates
// in the totals. The class system here treats blowpipe ↔ dart as a sibling
// pairing to crossbow ↔ bolt and bow ↔ arrow.

export interface WeaponAmmoSpec {
  class: AmmoClass;
  maxTier: number;
}

export interface AmmoSpec {
  class: AmmoClass;
  tier: number;
}

/**
 * Weapons that consume ammo. A weapon NOT in this map is treated as
 * "doesn't use the ammo slot" (e.g. swords, staves, blowpipes that contain
 * their own darts) — the compat check is skipped for those.
 */
export const WEAPON_AMMO: Record<string, WeaponAmmoSpec> = {
  // Crossbows — fire bolts. Tier matches the corresponding metal:
  // bronze=1 / iron=2 / steel=3 / mithril=4 / adamant=5 / runite=6 / dragon=7.
  // Crossbows above the Dragon tier (Armadyl, DHCB, Zaryte) still cap at
  // dragon bolts — there is no above-dragon bolt category.
  "Bronze crossbow": { class: "bolt", maxTier: 1 },
  "Iron crossbow": { class: "bolt", maxTier: 2 },
  "Steel crossbow": { class: "bolt", maxTier: 3 },
  "Mithril crossbow": { class: "bolt", maxTier: 4 },
  "Adamant crossbow": { class: "bolt", maxTier: 5 },
  "Rune crossbow": { class: "bolt", maxTier: 6 },
  "Dragon crossbow": { class: "bolt", maxTier: 7 },
  "Armadyl crossbow": { class: "bolt", maxTier: 7 },
  "Dragon hunter crossbow": { class: "bolt", maxTier: 7 },
  "Zaryte crossbow": { class: "bolt", maxTier: 7 },

  // Bows — fire arrows. Same metal ladder.
  Shortbow: { class: "arrow", maxTier: 1 },
  Longbow: { class: "arrow", maxTier: 1 },
  "Oak shortbow": { class: "arrow", maxTier: 2 },
  "Oak longbow": { class: "arrow", maxTier: 2 },
  "Willow shortbow": { class: "arrow", maxTier: 3 },
  "Maple shortbow": { class: "arrow", maxTier: 4 },
  "Yew shortbow": { class: "arrow", maxTier: 5 },
  "Magic shortbow": { class: "arrow", maxTier: 6 },
  "Magic shortbow (i)": { class: "arrow", maxTier: 6 },
  "Twisted bow": { class: "arrow", maxTier: 7 },

  // Self-contained bows — fire their own projectiles, no ammo slot used.
  // maxTier: 0 ensures every real ammo tier (1+) fails the tier check.
  "Bow of faerdhinen": { class: "arrow", maxTier: 0 },      // uncharged form
  "Bow of faerdhinen (c)": { class: "arrow", maxTier: 0 },  // charged (all clan colour variants below)
  "Bow of faerdhinen (c) (Amlodd)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Cadarn)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Crwys)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Iorwerth)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Ithell)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Meilyr)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (Trahaearn)": { class: "arrow", maxTier: 0 },
  "Bow of faerdhinen (c) (deadman)": { class: "arrow", maxTier: 0 },
  // Crystal bows (regular + Gauntlet variants) — fire from charges, no arrows.
  "Crystal bow": { class: "arrow", maxTier: 0 },
  "Crystal bow (i)": { class: "arrow", maxTier: 0 },
  "Crystal bow (historical)": { class: "arrow", maxTier: 0 },
  "Crystal bow (basic)": { class: "arrow", maxTier: 0 },
  "Crystal bow (attuned)": { class: "arrow", maxTier: 0 },
  "Crystal bow (perfected)": { class: "arrow", maxTier: 0 },
  // Corrupted bows (Corrupted Gauntlet) — same mechanic as Crystal bow.
  "Corrupted bow (basic)": { class: "arrow", maxTier: 0 },
  "Corrupted bow (attuned)": { class: "arrow", maxTier: 0 },
  "Corrupted bow (perfected)": { class: "arrow", maxTier: 0 },

  // Karil's crossbow — fires bolt racks only (unique Barrows ammo).
  // All durability versions share the same item name, so one entry covers them.
  "Karil's crossbow": { class: "bolt-rack", maxTier: 1 },

  // Ballistas — fire javelins. Cosmetic variants share the same ammo rules;
  // they must be listed explicitly because their category is "Crossbow" in the
  // catalog (same as bolt-firing crossbows), so the category fallback below
  // would incorrectly infer "bolt" for any unlisted ballista variant.
  "Light ballista": { class: "javelin", maxTier: 7 },
  "Heavy ballista": { class: "javelin", maxTier: 7 },
  "Heavy ballista (or)": { class: "javelin", maxTier: 7 },

  // Blowpipes — fire darts (loaded into the weapon, not the ammo slot in-game,
  // but we model them as ammo for totals).
  "Toxic blowpipe": { class: "dart", maxTier: 7 },
};

/**
 * Ammo items keyed by exact vendor name. "(e)" / "(p)" variants share the
 * same tier as the base — the enchant doesn't change which weapon can fire
 * them. Dragon-tier bolts are gated separately (require Dragon crossbow+).
 */
export const AMMO_TYPES: Record<string, AmmoSpec> = {
  // Standard bolts (runite-and-below base)
  "Bronze bolts": { class: "bolt", tier: 1 },
  "Iron bolts": { class: "bolt", tier: 2 },
  "Steel bolts": { class: "bolt", tier: 3 },
  "Mithril bolts": { class: "bolt", tier: 4 },
  "Adamant bolts": { class: "bolt", tier: 5 },
  "Runite bolts": { class: "bolt", tier: 6 },

  // Gem-tipped bolts on a runite base — fire from Rune crossbow and above.
  "Opal bolts (e)": { class: "bolt", tier: 1 },
  "Jade bolts (e)": { class: "bolt", tier: 2 },
  "Pearl bolts (e)": { class: "bolt", tier: 3 },
  "Topaz bolts (e)": { class: "bolt", tier: 4 },
  "Sapphire bolts": { class: "bolt", tier: 5 },
  "Sapphire bolts (e)": { class: "bolt", tier: 5 },
  "Emerald bolts": { class: "bolt", tier: 5 },
  "Emerald bolts (e)": { class: "bolt", tier: 5 },
  "Ruby bolts": { class: "bolt", tier: 6 },
  "Ruby bolts (e)": { class: "bolt", tier: 6 },
  "Diamond bolts": { class: "bolt", tier: 6 },
  "Diamond bolts (e)": { class: "bolt", tier: 6 },
  "Dragonstone bolts": { class: "bolt", tier: 6 },
  "Dragonstone bolts (e)": { class: "bolt", tier: 6 },
  "Onyx bolts": { class: "bolt", tier: 6 },
  "Onyx bolts (e)": { class: "bolt", tier: 6 },

  // Dragon bolts — require Dragon-tier crossbow or above.
  "Dragon bolts": { class: "bolt", tier: 7 },
  "Dragon bolts (e)": { class: "bolt", tier: 7 },
  "Opal dragon bolts (e)": { class: "bolt", tier: 7 },
  "Jade dragon bolts (e)": { class: "bolt", tier: 7 },
  "Pearl dragon bolts (e)": { class: "bolt", tier: 7 },
  "Topaz dragon bolts (e)": { class: "bolt", tier: 7 },
  "Sapphire dragon bolts (e)": { class: "bolt", tier: 7 },
  "Emerald dragon bolts (e)": { class: "bolt", tier: 7 },
  "Ruby dragon bolts": { class: "bolt", tier: 7 },
  "Ruby dragon bolts (e)": { class: "bolt", tier: 7 },
  "Diamond dragon bolts": { class: "bolt", tier: 7 },
  "Diamond dragon bolts (e)": { class: "bolt", tier: 7 },
  "Dragonstone dragon bolts": { class: "bolt", tier: 7 },
  "Dragonstone dragon bolts (e)": { class: "bolt", tier: 7 },
  "Onyx dragon bolts": { class: "bolt", tier: 7 },
  "Onyx dragon bolts (e)": { class: "bolt", tier: 7 },

  // Arrows — same metal ladder.
  "Bronze arrow": { class: "arrow", tier: 1 },
  "Iron arrow": { class: "arrow", tier: 2 },
  "Steel arrow": { class: "arrow", tier: 3 },
  "Mithril arrow": { class: "arrow", tier: 4 },
  "Adamant arrow": { class: "arrow", tier: 5 },
  "Rune arrow": { class: "arrow", tier: 6 },
  "Amethyst arrow": { class: "arrow", tier: 6 },
  "Dragon arrow": { class: "arrow", tier: 7 },

  // Darts — for Blowpipe. Strength bonuses are large for Dragon dart.
  // Note: in the item catalog, darts have slot:"weapon" (they are thrown
  // weapons). They appear here so the preset codegen can validate blowpipe
  // presets that explicitly model the dart in the ammo slot for DPS totals.
  "Bronze dart": { class: "dart", tier: 1 },
  "Iron dart": { class: "dart", tier: 2 },
  "Steel dart": { class: "dart", tier: 3 },
  "Mithril dart": { class: "dart", tier: 4 },
  "Adamant dart": { class: "dart", tier: 5 },
  "Rune dart": { class: "dart", tier: 6 },
  "Amethyst dart": { class: "dart", tier: 6 },
  "Dragon dart": { class: "dart", tier: 7 },

  // Bolt racks — for Karil's crossbow only.
  "Bolt rack": { class: "bolt-rack", tier: 1 },

  // Javelins — for Ballistas (Light / Heavy).
  "Bronze javelin": { class: "javelin", tier: 1 },
  "Iron javelin": { class: "javelin", tier: 2 },
  "Steel javelin": { class: "javelin", tier: 3 },
  "Mithril javelin": { class: "javelin", tier: 4 },
  "Adamant javelin": { class: "javelin", tier: 5 },
  "Rune javelin": { class: "javelin", tier: 6 },
  "Amethyst javelin": { class: "javelin", tier: 6 },
  "Dragon javelin": { class: "javelin", tier: 7 },
};

/**
 * Weapon categories whose projectile is the weapon itself — they never occupy
 * the ammo slot. The bank optimizer skips the ammo slot for these.
 *
 * - "Thrown": darts, knives, throwing axes, and all blowpipe variants (the
 *   blowpipe loads darts internally; no separate ammo slot in-game).
 * - "Chinchompas": the chinchompa IS the ammunition.
 */
export const SELF_AMMO_WEAPON_CATEGORIES: ReadonlySet<string> = new Set([
  "Thrown",
  "Chinchompas",
]);

export type AmmoCompatResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Check whether `ammoName` can be fired by `weaponName`. Resolution rules:
 *  - If the weapon is not in WEAPON_AMMO, it doesn't use the ammo slot —
 *    the compat check is skipped (returns ok).
 *  - If the ammo is not in AMMO_TYPES, treat as an authoring error — the
 *    table needs to be extended before this preset can be trusted.
 *  - Class mismatch (e.g. arrow on a crossbow) is always a failure.
 *  - Tier > maxTier is a failure (the canonical "Ruby dragon bolts on Rune
 *    crossbow" case).
 */
export function checkAmmoCompat(weaponName: string, ammoName: string): AmmoCompatResult {
  const weapon = WEAPON_AMMO[weaponName];
  if (!weapon) return { ok: true };

  const ammo = AMMO_TYPES[ammoName];
  if (!ammo) {
    return {
      ok: false,
      reason: `Unknown ammo "${ammoName}" — add it to AMMO_TYPES in data/ammo-compatibility.ts.`,
    };
  }
  if (ammo.class !== weapon.class) {
    return {
      ok: false,
      reason: `"${weaponName}" fires ${weapon.class}s but "${ammoName}" is a ${ammo.class}.`,
    };
  }
  if (ammo.tier > weapon.maxTier) {
    return {
      ok: false,
      reason: `"${ammoName}" (tier ${ammo.tier}) exceeds "${weaponName}" max ammo tier ${weapon.maxTier}.`,
    };
  }
  return { ok: true };
}

/**
 * Like `checkAmmoCompat` but uses `weaponCategory` as a fallback when the
 * weapon name isn't registered in WEAPON_AMMO. Handles the large number of
 * unlisted bows and crossbow variants automatically:
 *   "Bow"      → fires arrows (no tier cap for unlisted weapons)
 *   "Crossbow" → fires bolts  (no tier cap for unlisted weapons)
 * Anything else falls back to the same "skip check → ok" behaviour.
 *
 * Use this in the optimizer paths (bank / budget) where the weapon's catalog
 * category is already available. The plain `checkAmmoCompat` stays for the
 * preset codegen validator where only names are available.
 */
export function checkAmmoCompatWithCategory(
  weaponName: string,
  weaponCategory: string,
  ammoName: string,
): AmmoCompatResult {
  // If the weapon is explicitly registered, use the full name-based check.
  if (weaponName in WEAPON_AMMO) {
    return checkAmmoCompat(weaponName, ammoName);
  }
  // Infer ammo class from weapon category.
  let impliedClass: AmmoClass | null = null;
  if (weaponCategory === "Bow") impliedClass = "arrow";
  else if (weaponCategory === "Crossbow") impliedClass = "bolt";
  if (!impliedClass) return { ok: true }; // unknown weapon type — don't filter
  const ammo = AMMO_TYPES[ammoName];
  if (!ammo) {
    // Unknown ammo for an inferred weapon type — reject to avoid pairing
    // (e.g. atlatl darts on a Crystal bow if somehow they enter the pool).
    return { ok: false, reason: `Unknown ammo "${ammoName}" for ${weaponCategory} weapon "${weaponName}".` };
  }
  if (ammo.class !== impliedClass) {
    return {
      ok: false,
      reason: `"${weaponName}" (${weaponCategory}) fires ${impliedClass}s but "${ammoName}" is a ${ammo.class}.`,
    };
  }
  return { ok: true };
}
