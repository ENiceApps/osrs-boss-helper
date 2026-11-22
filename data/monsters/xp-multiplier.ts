// Monsters whose combat XP per damage differs from the normal rate, keyed by
// catalog slug. 1 = normal (the default for every monster not listed).
//
// Hand-maintained from each monster's wiki infobox ("XP bonus"). Only entries
// we have checked are listed; the bonus XP that some high-level monsters give
// is not modelled yet, so the XP panel says so for unlisted monsters.

const XP_MULTIPLIER_BY_SLUG: Record<string, number> = {
  // XP bonus -12.5%: 3.5 XP per damage instead of 4.
  // https://oldschool.runescape.wiki/w/Gemstone_Crab
  "gemstone-crab": 0.875,
};

/** The monster's XP multiplier, or undefined when we have not checked it. */
export function xpMultiplierFor(slug: string): number | undefined {
  return XP_MULTIPLIER_BY_SLUG[slug];
}
