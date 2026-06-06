// Hand-curated stat overrides on top of vendored wgloop equipment data.
//
// Use case: when Jagex patches item stats faster than the wgloop dataset
// catches up. Each override is keyed by item id; only the listed fields
// are overridden. `build-item-catalog.ts` applies these after reading
// vendor stats, so a re-run of `npm run refresh-vendor` (when wgloop
// updates) will pick up new vendor numbers, and we can delete entries
// here once they match upstream.
//
// Source of truth for the change → leave a comment with the patch name.
// Old vendor value → keep as a comment so a future maintainer can verify.

export interface StatOverride {
  str?: number;
  rangedStr?: number;
  magicStr?: number;
  prayer?: number;
  speed?: number;
  attackStab?: number;
  attackSlash?: number;
  attackCrush?: number;
  attackMagic?: number;
  attackRanged?: number;
  defStab?: number;
  defSlash?: number;
  defCrush?: number;
  defMagic?: number;
  defRanged?: number;
}

// =========================================================================
//   Summer Sweep-Up 2026 (https://secure.runescape.com/m=news/summer-sweep-up-2026)
// =========================================================================
//
// Numeric stat changes only. Spec-attack / spell / mechanic changes are
// tracked elsewhere (see Burning claws in data/spec-weapons.ts for the
// 30%→35% spec cost). Sanguinesti staff's base max hit + heal proc are
// per-spell behaviour, not equipment bonuses; not modelled here.
//
// magic_str field encoding: vendor stores +N% magic damage as magic_str=N×10
// (so +10% damage = magic_str: 100). See lib/items.ts and the project
// memory note on vendor data.

export const STAT_OVERRIDES: Record<number, StatOverride> = {
  // ---- Soulreaper axe — +4 strength bonus ----
  28338: { str: 125 }, // was 121

  // ---- Ghrazi rapier — +6 stab accuracy, +4 strength ----
  22324: { attackStab: 100, str: 93 }, // was attackStab=94, str=89

  // ---- Blade of saeldor — +6 slash accuracy, +4 strength
  // Both the Charged variant (drop) and the cosmetic (c) variant share stats.
  23995: { attackSlash: 100, str: 93 }, // Charged — was attackSlash=94, str=89
  24551: { attackSlash: 100, str: 93 }, // (c) — was attackSlash=94, str=89

  // ---- Pegasian boots — +1 ranged strength ----
  13237: { rangedStr: 1 }, // was 0

  // ---- Master wand — now +10% magic damage ----
  // Old vendor value was magic_str=0; new = +10% = magic_str 100.
  6914: { magicStr: 100 }, // was 0

  // ---- Ancient sceptres (all variants) — +5% → +10% magic damage ----
  // magic_str 50 → 100 across every base + element variant + state.
  27624: { magicStr: 100 }, // Ancient sceptre Normal
  27626: { magicStr: 100 }, // Ancient sceptre Locked
  28264: { magicStr: 100 }, // Smoke ancient sceptre Normal
  28240: { magicStr: 100 }, // Smoke ancient sceptre Broken
  28475: { magicStr: 100 }, // Smoke ancient sceptre Locked
  28266: { magicStr: 100 }, // Shadow ancient sceptre Normal
  28244: { magicStr: 100 }, // Shadow ancient sceptre Broken
  28476: { magicStr: 100 }, // Shadow ancient sceptre Locked
  28260: { magicStr: 100 }, // Blood ancient sceptre Normal
  28238: { magicStr: 100 }, // Blood ancient sceptre Broken
  28473: { magicStr: 100 }, // Blood ancient sceptre Locked
  28262: { magicStr: 100 }, // Ice ancient sceptre Normal
  28242: { magicStr: 100 }, // Ice ancient sceptre Broken
  28474: { magicStr: 100 }, // Ice ancient sceptre Locked

  // ---- Inquisitor's mace — +7 crush accuracy, +5 strength ----
  24417: { attackCrush: 102, str: 94 }, // was attackCrush=95, str=89

  // ---- Inquisitor's great helm — +2 crush accuracy, +2 strength
  // (set-bonus requirement removed — passive stats now apply standalone;
  // our catalog already treats item stats as per-piece, no change needed)
  24419: { attackCrush: 10, str: 6 }, // was attackCrush=8, str=4

  // ---- Inquisitor's hauberk — +4 crush accuracy ----
  24420: { attackCrush: 16 }, // was 12

  // ---- Shaman mask — magic bonus -6 → +2 ----
  21838: { attackMagic: 2 }, // was -6
};
