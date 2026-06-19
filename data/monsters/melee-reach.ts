// Bosses that cannot be meleed with an adjacent (1-tile) weapon — you must use
// a 2-tile "long reach" weapon (a halberd or the Scythe of Vitur, see
// data/items/halberd-weapons.ts). For these, the optimizer must not recommend a
// normal melee weapon (e.g. Osmumten's fang) for a melee setup.
//
// Two cases qualify:
//   1. The "flying" attribute. Per the OSRS Wiki, halberds are "the only melee
//      weapons capable of hitting enemies with the flying attribute" (Dawn,
//      Kree'arra, Vespula, …). This is data-driven off the catalog's attribute.
//   2. Curated special hitboxes where you're separated by terrain. Zulrah sits
//      across water on its platform — only a halberd reaches it in melee, even
//      though it isn't flagged "flying". The Royal Titans (Branda / Eldric) are
//      fought across a gap that likewise requires a 2-tile weapon to melee.

/** Monsters separated by terrain so only a 2-tile weapon reaches them in melee. */
const MELEE_REACH_2_SLUGS: ReadonlySet<string> = new Set([
  "zulrah",
  "branda-the-fire-queen",
  "eldric-the-ice-king",
]);

/** True iff this boss can only be meleed with a 2-tile reach weapon (halberd / Scythe). */
export function requiresMeleeReach2(monster: {
  slug: string;
  attributes: readonly string[];
}): boolean {
  // Flying monsters can only be hit in melee by a halberd.
  if (monster.attributes.includes("flying")) return true;
  return MELEE_REACH_2_SLUGS.has(monster.slug);
}
