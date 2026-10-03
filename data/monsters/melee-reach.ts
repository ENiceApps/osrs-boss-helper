// Bosses that cannot be meleed with an adjacent (1-tile) weapon — you must use
// a 2-tile "long reach" weapon (a halberd or the Scythe of Vitur, see
// data/items/halberd-weapons.ts). For these, the optimizer must not recommend a
// normal melee weapon (e.g. Osmumten's fang) for a melee setup.
//
// Two cases qualify:
//   1. The "flying" attribute. Per the OSRS Wiki, halberds are "the only melee
//      weapons capable of hitting enemies with the flying attribute" (Dawn,
//      Kree'arra, Vespula, …). This is data-driven off the catalog's attribute.
//   2. Special hitboxes where you're separated by terrain. Zulrah sits across
//      water on its platform — only a halberd reaches it in melee, even though
//      it isn't flagged "flying" (upstream's melee immunity below exempts only
//      a Polearm there, so it is keyed off the same ids). The Royal Titans
//      (Branda / Eldric) are fought across a gap that likewise requires a
//      2-tile weapon to melee (curated by slug).
//
// Some monsters can't be meleed at all, by any weapon — see
// `npcMeleeImmunity`. They are not reach-gated: no weapon passes, so every
// melee loadout simply scores 0 there.

/** Zulrah's three forms: Serpentine, Magma, Tanzanite (upstream ZULRAH_IDS). */
export const ZULRAH_IDS: ReadonlySet<number> = new Set([2042, 2043, 2044]);

/** Monsters separated by terrain so only a 2-tile weapon reaches them in melee. */
const MELEE_REACH_2_SLUGS: ReadonlySet<string> = new Set([
  "branda-the-fire-queen",
  "eldric-the-ice-king",
]);

/** True iff this boss can only be meleed with a 2-tile reach weapon (halberd / Scythe). */
export function requiresMeleeReach2(monster: {
  slug: string;
  wikiId: number;
  attributes: readonly string[];
}): boolean {
  // Flying monsters can only be hit in melee by a halberd.
  if (monster.attributes.includes("flying")) return true;
  // Zulrah: only a halberd reaches it (upstream: a Polearm is its one exemption).
  if (ZULRAH_IDS.has(monster.wikiId)) return true;
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

// ---- Per-NPC melee immunity --------------------------------------------------
//
// Mirrors weirdgloop/osrs-dps-calc @ 89c3e25: constants.ts
// IMMUNE_TO_MELEE_DAMAGE_NPC_IDS (L347-354, with ZULRAH_IDS L340-342 and
// ABYSSAL_PORTAL_IDS L240-242), read by PlayerVsNPCCalc.isImmune (L2057-2060)
// BEFORE its flying check:
//
//   if (IMMUNE_TO_MELEE_DAMAGE_NPC_IDS.includes(monsterId) && this.isUsingMeleeStyle()) {
//     if (ZULRAH_IDS.includes(monsterId) && weapon?.category === EquipmentCategory.POLEARM) return false;
//     return true;
//   }
//
// An immune hit distribution is a single 0, so the engine scores the loadout
// at 0 (`targetImmune`). The OSRS Wiki agrees: the Kraken "cannot be reached
// with Melee weapons, and is additionally entirely immune to melee attacks";
// TzKal-Zuk "cannot be attacked with melee"; meleeing the Leviathan gives
// "Your melee attacks can't reach the lure!"; Zulrah "cannot be reached with
// melee (with the exception of halberds)". Jal-MejJak (on Zuk's lava stream)
// and the Abyssal portal (seven tiles away) are out of reach by position.
// The ids are wgloop's (== MonsterCatalogEntry.wikiId, phase-aware), so a
// phase with another id — the Kraken's Whirlpool (496) — is not listed,
// as upstream.

/** Monsters no melee attack damages (Zulrah, `ZULRAH_IDS` above: bar a halberd). */
export const IMMUNE_TO_MELEE_IDS: ReadonlySet<number> = new Set([
  494, // Kraken
  7533, // Abyssal portal (Chambers of Xeric)
  7706, // TzKal-Zuk
  7708, // Jal-MejJak
  12214, 12215, 12219, // The Leviathan (post-quest / awakened, quest, …)
  ...ZULRAH_IDS,
]);

/**
 * Why a MELEE attack with this weapon category does no damage to the monster,
 * per upstream's id list: "all" — nothing melee damages it (the Kraken,
 * TzKal-Zuk, Jal-MejJak, the Leviathan, the Abyssal portal); "halberd" —
 * Zulrah, which only a halberd (category Polearm) damages, and this weapon
 * isn't one. null when the list doesn't apply. Flying immunity is separate
 * (`isFlyingImmuneToMelee`); upstream checks this list first.
 */
export function npcMeleeImmunity(
  monster: { wikiId: number },
  weaponCategory: string | undefined,
): "all" | "halberd" | null {
  if (!IMMUNE_TO_MELEE_IDS.has(monster.wikiId)) return null;
  if (!ZULRAH_IDS.has(monster.wikiId)) return "all";
  return weaponCategory === "Polearm" ? null : "halberd";
}

/**
 * One line on why melee does little or nothing here, for the melee tab when no
 * melee setup scores: the per-NPC immunity, or the flying rule. Undefined for
 * a monster melee can hit with any weapon.
 */
export function meleeImmunityNote(monster: {
  name: string;
  wikiId: number;
  attributes: readonly string[];
}): string | undefined {
  const immunity = npcMeleeImmunity(monster, undefined);
  if (immunity === "all") return `${monster.name} is immune to melee — use ranged or magic.`;
  if (immunity === "halberd") return `${monster.name} only takes melee damage from a halberd.`;
  if (monster.attributes.includes("flying")) {
    return VESPULA_WIKI_IDS.has(monster.wikiId)
      ? `${monster.name} is immune to melee — use ranged or magic.`
      : `${monster.name} flies: only a halberd or salamander can melee it.`;
  }
  return undefined;
}
