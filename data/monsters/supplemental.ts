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

export const SUPPLEMENTAL_MONSTERS: VendorMonster[] = [
  // Maggot King — solo boss from The Blood Moon Rises (30 June 2026), fought in
  // Vampyrium. Slayer-assignable under the "Bosses" category (Konar/Nieve/Duradel).
  // Source: https://oldschool.runescape.wiki/w/Maggot_King
  {
    id: 15742,
    name: "Maggot King",
    version: "",
    image: "Maggot King.png",
    level: 741,
    speed: 6,
    style: ["Ranged", "Magic", "Stab"],
    size: 5,
    max_hit: "46 (Magic / Ranged), ~52 (Melee lunge)",
    skills: { atk: 200, def: 200, hp: 1500, magic: 200, ranged: 300, str: 250 },
    offensive: { atk: 400, magic: 200, magic_str: 57, ranged: 200, ranged_str: 10, str: 50 },
    defensive: {
      flat_armour: 0,
      crush: 45,
      magic: 150,
      heavy: 43,
      standard: 158,
      light: 232,
      slash: 100,
      stab: 172,
    },
    attributes: [],
    immunities: { burn: null },
    is_slayer_monster: true,
    weakness: { element: "fire", severity: 80 },
  },

  // Venator — Vampyre-category slayer monster from The Blood Moon Rises
  // (30 June 2026), unlocked after the quest. Upstream tracks five cosmetic
  // variants (ids 15765-15769) sharing identical stats; we list the first.
  // Source: https://oldschool.runescape.wiki/w/Venator_(monster)
  {
    id: 15765,
    name: "Venator",
    version: "",
    image: "Venator (1).png",
    level: 246,
    speed: 5,
    style: ["Stab"],
    size: 2,
    max_hit: "21",
    skills: { atk: 200, def: 120, hp: 345, magic: 100, ranged: 75, str: 100 },
    offensive: { atk: 150, magic: 0, magic_str: 0, ranged: 150, ranged_str: 0, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 90,
      magic: 100,
      heavy: -5,
      standard: -5,
      light: -5,
      slash: 20,
      stab: -5,
    },
    attributes: ["vampyre3"],
    immunities: { burn: null },
    is_slayer_monster: true,
    weakness: null,
  },
];
