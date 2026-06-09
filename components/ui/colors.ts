/**
 * Semantic accent colours for monster attributes and spell-weakness elements.
 *
 * The attribute domain is open-ended: the catalog mixes well-known combat
 * categories ("dragon", "demon", "undead") with per-NPC identity tags
 * ("galvek", "akkha"). We curate colours only for the recognisable combat
 * categories and fall back to a neutral brown for everything else, so a pill
 * always renders without needing a bespoke entry per monster.
 *
 * Hues are deliberately dark/saturated so they read as TEXT on the pale
 * parchment tint that <Badge> paints behind them (see components/ui/Badge.tsx).
 */

/** osrs-muted (#6b5524) — the neutral fallback accent. */
export const ACCENT_FALLBACK = "#6b5524";

export const ATTRIBUTE_COLORS: Record<string, string> = {
  dragon: "#b45309",
  draconic: "#b45309",
  demon: "#b91c1c",
  undead: "#6d28d9",
  fiery: "#c2410c",
  golem: "#57534e",
  kalphite: "#a16207",
  leafy: "#4d7c0f",
  vampyre: "#9f1239",
  shade: "#4338ca",
  spectral: "#0e7490",
  xerician: "#a21caf",
  icy: "#0369a1",
  kraken: "#0f766e",
  penance: "#0f766e",
  flying: "#3b6fa0",
};

export function attributeColor(attribute: string): string {
  return ATTRIBUTE_COLORS[attribute.toLowerCase()] ?? ACCENT_FALLBACK;
}

/** Spell-weakness elements — the catalog only ever uses these four. */
export const ELEMENT_COLORS: Record<string, string> = {
  air: "#5a8fb5",
  water: "#1d4e89",
  earth: "#5a7d2a",
  fire: "#c2410c",
};

export function elementColor(element: string): string {
  return ELEMENT_COLORS[element.toLowerCase()] ?? ACCENT_FALLBACK;
}
