/**
 * Shared display formatters. Extracted from OptimizerPanel/DpsResultsPanel so
 * the setup rail, loadout column, and results column format numbers the same
 * way everywhere.
 */

/**
 * Format large GP numbers as "12.4M" / "1.50B" — the wiki tool / RuneLite
 * convention. Sub-million values keep their thousands separator.
 */
export function fmtGp(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Parse a GP amount the way an OSRS player types it, accepting k/m/b
 * abbreviations: "1k" → 1_000, "10m" → 10_000_000, "1.5b" → 1_500_000_000.
 * Plain numbers, commas, and spaces all work ("1,000,000", "2 500"). Anything
 * unparseable resolves to 0 so a stray keystroke never throws. Mirrors fmtGp.
 */
export function parseGp(text: string): number {
  const cleaned = text.trim().toLowerCase().replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  const match = cleaned.match(/^(\d*\.?\d+)([kmb]?)$/);
  if (!match) {
    // Fallback: keep digits only so one bad character can't zero the value.
    const digits = cleaned.replace(/[^0-9]/g, "");
    return digits ? Number(digits) : 0;
  }
  const value = parseFloat(match[1]);
  const mult =
    match[2] === "k"
      ? 1_000
      : match[2] === "m"
        ? 1_000_000
        : match[2] === "b"
          ? 1_000_000_000
          : 1;
  return Math.round(value * mult);
}

/** DPS gained per million GP — much more readable than raw 1e-9 ratios. */
export function fmtDpsPerM(dpsPerGp: number): string {
  const perM = dpsPerGp * 1_000_000;
  if (perM >= 100) return perM.toFixed(0);
  if (perM >= 10) return perM.toFixed(1);
  if (perM >= 1) return perM.toFixed(2);
  return perM.toFixed(3);
}

/** Kills per hour: whole numbers when ≥ 10, one decimal when slower. */
export function formatKph(kph: number): string {
  if (!Number.isFinite(kph) || kph <= 0) return "—";
  return kph >= 10 ? Math.round(kph).toLocaleString() : kph.toFixed(1);
}

/** "47.3s" under a minute, "2m 5s" above. */
export function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "—";
  if (s < 60) return `${s.toFixed(1)}s`;
  const minutes = Math.floor(s / 60);
  const seconds = Math.round(s % 60);
  return `${minutes}m ${seconds}s`;
}
