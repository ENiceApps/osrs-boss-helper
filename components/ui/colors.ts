/**
 * Semantic accent colours for monster attributes and spell-weakness elements.
 *
 * The attribute domain is open-ended: the catalog mixes well-known combat
 * categories ("dragon", "demon", "undead") with per-NPC identity tags
 * ("galvek", "akkha"). We curate colours only for the recognisable combat
 * categories and fall back to a neutral brown for everything else, so a pill
 * always renders without needing a bespoke entry per monster.
 *
 * Hues are deliberately LIGHT/luminous so they read as TEXT on the dark tint
 * that <Badge> paints behind them on the Midnight Gilded dark panels (see
 * components/ui/Badge.tsx — fill is the colour at 16%, text is the colour).
 */

/** Muted warm-grey fallback accent, readable on dark panels. */
export const ACCENT_FALLBACK = "#b8a98f";

export const ATTRIBUTE_COLORS: Record<string, string> = {
  dragon: "#f59e0b",
  draconic: "#f59e0b",
  demon: "#ef4444",
  undead: "#a78bfa",
  fiery: "#fb923c",
  golem: "#a8a29e",
  kalphite: "#eab308",
  leafy: "#84cc16",
  vampyre: "#fb7185",
  shade: "#818cf8",
  spectral: "#22d3ee",
  xerician: "#e879f9",
  icy: "#38bdf8",
  kraken: "#2dd4bf",
  penance: "#2dd4bf",
  flying: "#7dd3fc",
};

export function attributeColor(attribute: string): string {
  return ATTRIBUTE_COLORS[attribute.toLowerCase()] ?? ACCENT_FALLBACK;
}

/** Spell-weakness elements — the catalog only ever uses these four. */
export const ELEMENT_COLORS: Record<string, string> = {
  air: "#93c5fd",
  water: "#60a5fa",
  earth: "#a3e635",
  fire: "#fb923c",
};

export function elementColor(element: string): string {
  return ELEMENT_COLORS[element.toLowerCase()] ?? ACCENT_FALLBACK;
}
