// Build OSRS Wiki icon URLs. The mapping payload from prices.runescape.wiki
// provides each item's icon filename in the form "Item_name.png".
// These map to https://oldschool.runescape.wiki/images/<encoded-filename>

export function wikiIconUrl(iconFilename: string): string {
  const encoded = encodeURIComponent(iconFilename.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/images/${encoded}`;
}

// RuneLite's static cache icon for an item id. Keyed by id rather than a
// filename, so it never goes stale when the wiki renames an image.
export function runeliteIconUrl(itemId: number): string {
  return `https://static.runelite.net/cache/item/icon/${itemId}.png`;
}

// Build the OSRS Wiki article URL for a monster. Wiki page titles are the
// monster's name with spaces as underscores (e.g. "Alchemical Hydra" →
// /w/Alchemical_Hydra); versions are tabs on the same page, so the name alone
// resolves to the right article.
export function wikiPageUrl(name: string): string {
  const encoded = encodeURIComponent(name.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/w/${encoded}`;
}
