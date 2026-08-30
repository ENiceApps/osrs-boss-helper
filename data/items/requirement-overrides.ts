// Authoritative manual corrections over the scraped requirement data
// (data/vendor/wiki/item-requirements.json). Keyed by item NAME — resolved to
// item ids when build-item-catalog.ts merges these into the catalog.
//
// Why this exists: the wiki tables/prose are ~96% right on meta gear, but a few
// items are mis-parsed (parenthetical exceptions, items stated only on a set
// page, or prose false-positives). Entries here WIN over the scrape.
//
// An EMPTY object ({}) means "this item has no level requirement" and removes a
// scraper false-positive. Add new entries as you find mistakes — every value
// here should be verified against the wiki, not guessed.

export type CombatRequirement = Partial<
  Record<
    "attack" | "strength" | "defence" | "ranged" | "magic" | "hitpoints" | "prayer",
    number
  >
>;

export const REQUIREMENT_OVERRIDES: Record<string, CombatRequirement> = {
  // Fortified Masori — the wiki lists the fortified Defence req (80) only in a
  // parenthetical, so the scraper read the base 30. Verified: "requires level
  // 80 Ranged and Defence to equip".
  "Masori mask (f)": { ranged: 80, defence: 80 },
  "Masori body (f)": { ranged: 80, defence: 80 },
  "Masori chaps (f)": { ranged: 80, defence: 80 },

  // Barrows gloves have NO level requirement (only the RFD quest chain). Verified:
  // "these gloves lack a Defence requirement". Removes a prose false-positive.
  "Barrows gloves": {},

  // Void — the 42-in-all-combat + 22 Prayer requirement is stated on the set
  // page, not the individual piece pages, so the scraper missed most pieces.
  "Void knight top": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Void knight robe": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Void knight gloves": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Void mage helm": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Void ranger helm": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Void melee helm": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Elite void top": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },
  "Elite void robe": { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 },

  // Wyrmscraig (2026-07-29) — released after the vendored scrape, so the item
  // is absent from item-requirements.json entirely. Verified: "requires level
  // 75 Attack to wield" on the Hallowfell wiki page.
  "Hallowfell": { attack: 75 },
};
