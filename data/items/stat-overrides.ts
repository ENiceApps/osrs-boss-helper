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

// magic_str field encoding: vendor stores +N% magic damage as magic_str=N×10
// (so +10% damage = magic_str: 100). See lib/items.ts and the project
// memory note on vendor data.
//
// 2026-07-22: the Summer Sweep-Up Gear & PvM Changes batch was deleted here
// after `refresh-vendor` confirmed wgloop now carries the final released
// values (including two things the pre-release batch missed: Inquisitor's
// mace strength is +96, not the announced-then-applied 94, and the negative
// stab/slash accuracy on the Inquisitor armour pieces was removed).

export const STAT_OVERRIDES: Record<number, StatOverride> = {};
