// Accent (highlight) color theming.
//
// The whole UI's "gold" highlight is the single Tailwind token `osrs-gold`,
// which app/globals.css resolves to the CSS custom properties --accent /
// --accent-light. Swapping those two variables at runtime re-tints every
// accent surface (borders, active controls, headings, links) at once.
//
// This module is the single source of truth for the swatch palette. It is
// imported both by the client-side picker (components/AccentPicker.tsx) and by
// the pre-paint bootstrap script in app/layout.tsx.

export type AccentId = "yellow" | "red" | "blue" | "green" | "pink" | "magenta";

export type Accent = {
  id: AccentId;
  label: string;
  /** Primary accent — borders, active controls, headings (→ --accent). */
  base: string;
  /** Lighter accent — hover/emphasis (→ --accent-light). */
  light: string;
};

// Tuned to read clearly on the near-black (#0d0f12) panels. "yellow" keeps the
// original gold so nothing changes for users who never touch the picker.
export const ACCENTS: Accent[] = [
  { id: "yellow", label: "Gold", base: "#d4af37", light: "#e8c869" },
  { id: "red", label: "Red", base: "#e0564e", light: "#f07d76" },
  { id: "blue", label: "Blue", base: "#4a9fe0", light: "#74bcf0" },
  { id: "green", label: "Green", base: "#5fb95f", light: "#82d182" },
  { id: "pink", label: "Pink", base: "#ec6aa8", light: "#f48cbe" },
  { id: "magenta", label: "Magenta", base: "#cf52c8", light: "#df74da" },
];

export const DEFAULT_ACCENT_ID: AccentId = "yellow";
export const ACCENT_STORAGE_KEY = "osrs-helper-accent";

/** Re-tint the whole app by writing the accent CSS variables on <html>. */
export function applyAccent(accent: Accent): void {
  const root = document.documentElement;
  root.style.setProperty("--accent", accent.base);
  root.style.setProperty("--accent-light", accent.light);
}
