// Bosses that live inside the Wilderness, where charged wilderness weapons
// (Craw's/Webweaver bow, Viggora's/Ursine chainmace, Thammaron's/Accursed
// sceptre) get their ×3/2 accuracy & damage boost. See data/items/... triggers
// (WILDERNESS_WEAPON) and lib/dps/conditional.ts.
//
// Curated by slug (data/monsters/categories.ts pattern). Notable exclusions
// (verified against the OSRS Wiki): the King Black Dragon's lair "is not the
// Wilderness", and Skotizo is in the Catacombs of Kourend — so wilderness
// weapons get NO bonus there.
const WILDERNESS_BOSS_SLUGS: ReadonlySet<string> = new Set([
  "callisto",
  "artio",
  "venenatis",
  "spindel",
  "vetion",
  "chaos-elemental",
  "chaos-fanatic",
  "crazy-archaeologist",
  "scorpia",
  "revenant-maledictus",
]);

/** True iff this boss is fought in the Wilderness (gates wilderness-weapon bonuses). */
export function isWildernessBoss(slug: string): boolean {
  return WILDERNESS_BOSS_SLUGS.has(slug);
}
