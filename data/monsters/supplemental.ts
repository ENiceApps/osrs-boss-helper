// Hand-authored monsters that aren't in the vendored weirdgloop dump yet.
//
// The vendored data/vendor/wgloop/monsters.json trails live game releases by
// however long it takes weirdgloop/osrs-dps-calc to pick up a new update. When
// a brand-new boss/slayer creature ships, add it here (in the exact VendorMonster
// shape) so the boss browser + optimizer can target it immediately.
//
// build-monster-catalog.ts merges these in, but SKIPS any whose `id` already
// exists upstream — so once a `npm run refresh-vendor` pulls the real entry,
// this hand-authored copy drops out automatically and there's no duplicate.
// When that happens, delete the corresponding entry below to keep this file lean.
//
// Every field below is transcribed verbatim from the OSRS Wiki {{Infobox Monster}}
// template (raw wikitext) — cite the source page on each entry so a maintainer
// can re-verify. Infobox → VendorMonster field mapping:
//   att/str/def/mage/range -> skills.{atk,str,def,magic,ranged}
//   attbns->offensive.atk  strbns->offensive.str  amagic->offensive.magic
//   mbns->offensive.magic_str  arange->offensive.ranged  rngbns->offensive.ranged_str
//   dstab/dslash/dcrush/dmagic->defensive.{stab,slash,crush,magic}
//   dlight/dstandard/dheavy->defensive.{light,standard,heavy}  darmour->defensive.flat_armour
//   elementalweaknesstype/percent -> weakness  |  attribute -> attributes[]
// Note: the catalog only surfaces hp, defence/magic levels, defensive bonuses,
// attributes, weakness, size, combat level, maxHitText and isSlayerMonster — the
// offensive block and non-defensive skills are stored for fidelity but unused by
// the player→monster DPS engine.

import type { VendorMonster } from "../../types/vendor.js";

// Currently EMPTY: the Maggot King and Venator (The Blood Moon Rises, 30 June
// 2026) are now in the vendored dump, the build was already skipping our copies,
// and the vendored values are the ones the OSRS Wiki confirms (our hand-authored
// copies differed), so they were removed. Add new entries below the next time a
// brand-new boss/slayer creature trails the vendored dump.
export const SUPPLEMENTAL_MONSTERS: VendorMonster[] = [];
