// Monsters that defend against MAGIC using their Defence level instead of their
// Magic level (the usual NPC magic-defence stat).
//
// Almost every NPC rolls magic defence off its Magic level. A small curated set
// of bosses is the exception and uses Defence level — which can differ a lot
// (e.g. Rabbit (Prifddinas): Magic 300 vs Defence 450), materially changing
// magic hit chance. Mirrors weirdgloop's USES_DEFENCE_LEVEL_FOR_MAGIC_DEFENCE_NPC_IDS.
//
// IDs are weirdgloop/osrs-dps-calc monster ids (== our MonsterCatalogEntry.wikiId).

export const MAGIC_DEFENCE_USES_DEFENCE_LEVEL_IDS: ReadonlySet<number> = new Set([
  // Verzik Vitur (Theatre of Blood) — P1 + later phases, all modes (entry/normal/hard)
  10830, 10831, 10832, 8369, 8370, 8371, 10847, 10848, 10849,
  10833, 10834, 10835, 8372, 8373, 8374, 10850, 10851, 10852,
  // Ice demon (Chambers of Xeric) — regular + challenge mode
  7584, 7585,
  // Fragment of Seren
  8917, 8918, 8919, 8920,
  // Baboon brawler
  11709, 11712,
  // Rabbit (Prifddinas)
  9118,
]);

/** True iff this monster (by wiki/dps-calc id) rolls magic defence off Defence level. */
export function usesDefenceLevelForMagicDefence(wikiId: number): boolean {
  return MAGIC_DEFENCE_USES_DEFENCE_LEVEL_IDS.has(wikiId);
}
