// Build OSRS Wiki icon URLs. The mapping payload from prices.runescape.wiki
// provides each item's icon filename in the form "Item_name.png".
// These map to https://oldschool.runescape.wiki/images/<encoded-filename>

export function wikiIconUrl(iconFilename: string): string {
  const encoded = encodeURIComponent(iconFilename.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/images/${encoded}`;
}
