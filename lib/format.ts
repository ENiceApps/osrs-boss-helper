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
