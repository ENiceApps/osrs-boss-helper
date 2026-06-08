// Items excluded from the generated catalog because they are NOT obtainable in
// the main game — they exist only inside a time-limited Leagues game mode.
// `build-item-catalog.ts` drops every equipment entry whose name appears here
// (all version/durability variants of the name are removed).
//
// Why this matters: these league "echo" items carry wildly inflated combat
// stats (e.g. Shadowflame quadrant = +150% magic damage), so the bank
// optimiser would surface them as bogus best-in-slot recommendations for
// players who can never actually equip them.
//
// IMPORTANT — exclude by EXACT NAME, and only for genuinely league-exclusive
// items. Several league-LOOKING items are real main-game gear and must stay:
//   - Blazing blowpipe        → cosmetic Toxic blowpipe (ornament kit, 2023)
//   - Hunters' sunlight crossbow, Sunlight/Moonlight antler bolts → Varlamore
//   - Eclipse atlatl, Atlatl dart → Varlamore
// Keep this list to combat-relevant league items; zero-stat league cosmetics
// (Trailblazer/Shattered/Raging Echoes outfits & trophies) never get
// recommended, so they're intentionally NOT listed here yet.

// All items below are exclusive to the Demonic Pacts League (released
// 2026-04-15). https://oldschool.runescape.wiki/w/Demonic_Pacts_League
export const EXCLUDED_ITEM_NAMES: ReadonlySet<string> = new Set<string>([
  // Named echo uniques (boss drops within the league).
  "King's barrage",
  "Fang of the hound",
  "Drygore blowpipe",
  "V's helm",
  "Devil's element",
  "Shadowflame quadrant",
  "Nature's recurve",
  "Lithic sceptre",
  "Infernal tecpatl",
  "Crystal blessing",
  // Echo versions of main-game gear (upgraded league drops).
  "Echo venator bow",
  "Echo virtus mask",
  "Echo virtus robe top",
  "Echo virtus robe bottom",
  "Echo ahrim's hood",
  "Echo ahrim's robetop",
  "Echo ahrim's robeskirt",
  "Echo ahrim's staff",
]);
