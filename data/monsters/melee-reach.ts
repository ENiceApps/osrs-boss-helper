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

/** Vespula (Chambers of Xeric) — flagged flying, yet takes no melee damage at all. */
const VESPULA_WIKI_IDS: ReadonlySet<number> = new Set([7530, 7531, 7532]);

/** Weapon categories whose melee attacks still damage a flying monster. */
const FLYING_MELEE_CATEGORIES: ReadonlySet<string> = new Set(["Polearm", "Salamander"]);

/**
 * True iff a MELEE attack with this weapon category deals no damage to the
 * monster because it flies — wgloop's isImmune rule (PlayerVsNPCCalc @
 * 89c3e25): a "flying" target is immune to melee unless the weapon category is
 * Polearm (every halberd) or Salamander, and Vespula is immune to all melee.
 * The DPS engine scores such a loadout at 0 (see activeBonusesForTarget).
 *
 * Narrower than `requiresMeleeReach2`'s weapon list: the optimizer's reach gate
 * also admits the Scythe of Vitur (data/items/halberd-weapons.ts), which
 * upstream does not exempt — so a Scythe passes that gate but scores 0 here.
 */
export function isFlyingImmuneToMelee(
  monster: { wikiId: number; attributes: readonly string[] },
  weaponCategory: string | undefined,
): boolean {
  if (!monster.attributes.includes("flying")) return false;
  if (VESPULA_WIKI_IDS.has(monster.wikiId)) return true;
  return !FLYING_MELEE_CATEGORIES.has(weaponCategory ?? "");
}
