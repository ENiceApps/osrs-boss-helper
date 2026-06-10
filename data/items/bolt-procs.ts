// Enchanted-bolt special effects ("procs"). Item ids verified against
// data/vendor/wgloop/equipment.json. Only the (e) enchanted variants proc —
// plain gem-tipped bolts are stat sticks.

export type BoltEffect =
  | "opal"
  | "pearl"
  | "ruby"
  | "diamond"
  | "dragonstone"
  | "onyx";

/** Both the adamant-tier gem bolts (e) and the dragon bolt (e) variants. */
export const BOLT_EFFECT_BY_ITEM_ID: ReadonlyMap<number, BoltEffect> = new Map([
  [9236, "opal"], // Opal bolts (e)
  [21932, "opal"], // Opal dragon bolts (e)
  [9238, "pearl"], // Pearl bolts (e)
  [21936, "pearl"], // Pearl dragon bolts (e)
  [9242, "ruby"], // Ruby bolts (e)
  [21944, "ruby"], // Ruby dragon bolts (e)
  [9243, "diamond"], // Diamond bolts (e)
  [21946, "diamond"], // Diamond dragon bolts (e)
  [9244, "dragonstone"], // Dragonstone bolts (e)
  [21948, "dragonstone"], // Dragonstone dragon bolts (e)
  [9245, "onyx"], // Onyx bolts (e)
  [21950, "onyx"], // Onyx dragon bolts (e)
]);

/** Zaryte crossbow — its passive strengthens enchanted-bolt effects. */
export const ZARYTE_CROSSBOW_ID = 26374;

/**
 * Monsters with effectively infinite HP get a reduced ruby-bolt cap (60/66
 * instead of 100/110) — mirrors wgloop's INFINITE_HEALTH_MONSTERS list,
 * keyed by our catalog slug since the catalog doesn't carry vendor ids.
 */
export const INFINITE_HEALTH_MONSTER_SLUGS: ReadonlySet<string> = new Set([
  "gemstone-crab",
]);
