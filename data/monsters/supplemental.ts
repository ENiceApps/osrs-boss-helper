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

// ---------------------------------------------------------------------------
// The Fractured Archive (Raids 4), released 20 October 2026. Eight bosses, five
// fought per raid: the Archive Guardian first, then one of each pair (Ezekiel /
// Bork + the Smorks, Moia / Dreadnoth the Jellied, Xarth / the Dagon'hai), and
// Ocellus last. Listed here as standalone bosses, like the CoX / ToB / ToA
// encounters — a raid-aware "build a raid setup" view is on the roadmap
// (docs/ROADMAP.md).
//
// Boss HP scales with team size (minimum two-player scaling even when solo);
// the infobox values below are the wiki's listed base stats.
//
// NOT listed (the wiki infobox has no stats for them yet, 2026-10-20): the
// Dagon'hai Elder (ids 16643-16644) and Dagon'hai Monks (staff 16645-16646,
// book 16647-16648). Add them once the wiki fills the infobox in.
// Transcribed 2026-10-20 (release day): re-verify against the wiki, the early
// infoboxes get corrected in the first weeks.
// ---------------------------------------------------------------------------
const TFA_IMMUNITIES = { burn: null };

export const SUPPLEMENTAL_MONSTERS: VendorMonster[] = [
  // Archive Guardian — the fixed first boss. Flying (melee can't reach it
  // without a halberd), 80% weak to Fire.
  // Source: https://oldschool.runescape.wiki/w/Archive_Guardian
  {
    id: 16659,
    name: "Archive Guardian",
    version: "",
    image: "Archive Guardian.png",
    level: 984,
    speed: 5,
    style: ["Crush"],
    size: 5,
    max_hit: "25, 99+ (laser beam)",
    skills: { atk: 250, def: 260, hp: 550, magic: 250, ranged: 280, str: 240 },
    offensive: { atk: 0, magic: 350, magic_str: 55, ranged: 350, ranged_str: 55, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 20,
      magic: 130,
      heavy: 50,
      standard: 120,
      light: 75,
      slash: 110,
      stab: 120,
    },
    attributes: ["flying"],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "fire", severity: 80 },
  },

  // Ezekiel — second-boss choice (vs Bork and the Smorks). A Saradominist
  // justiciar: huge ranged defence, 25% weak to Earth.
  // Source: https://oldschool.runescape.wiki/w/Ezekiel
  {
    id: 16652,
    name: "Ezekiel",
    version: "",
    image: "Ezekiel.png",
    level: 984,
    speed: 5,
    style: ["Melee"],
    size: 3,
    max_hit: "",
    skills: { atk: 250, def: 130, hp: 3000, magic: 200, ranged: 80, str: 150 },
    offensive: { atk: 0, magic: 250, magic_str: 0, ranged: 0, ranged_str: 0, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 35,
      magic: 200,
      heavy: 320,
      standard: 370,
      light: 445,
      slash: 90,
      stab: 150,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "earth", severity: 25 },
  },

  // Bork — second-boss choice, fought alongside the Smorks. The wiki lists
  // flat armour 10 (Base) / 0 (Stunned), so both are offered as stat phases
  // (was 12 at launch; corrected 2026-10-20 23:47 UTC, which also added a
  // "2 (Magic resistance)" value the engine has no slot for).
  // Source: https://oldschool.runescape.wiki/w/Bork
  {
    id: 16640,
    name: "Bork",
    version: "Base",
    image: "Bork.png",
    level: 871,
    speed: 7,
    style: ["Crush"],
    size: 4,
    max_hit: "",
    skills: { atk: 200, def: 300, hp: 1500, magic: 90, ranged: 200, str: 200 },
    offensive: { atk: 100, magic: 0, magic_str: 0, ranged: 0, ranged_str: 0, str: 40 },
    defensive: {
      flat_armour: 10,
      crush: 10,
      magic: 300,
      heavy: 5,
      standard: 50,
      light: 80,
      slash: 130,
      stab: 140,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "earth", severity: 40 },
  },
  {
    id: 16640,
    name: "Bork",
    version: "Stunned",
    image: "Bork.png",
    level: 871,
    speed: 7,
    style: ["Crush"],
    size: 4,
    max_hit: "",
    skills: { atk: 200, def: 300, hp: 1500, magic: 90, ranged: 200, str: 200 },
    offensive: { atk: 100, magic: 0, magic_str: 0, ranged: 0, ranged_str: 0, str: 40 },
    defensive: {
      flat_armour: 0,
      crush: 10,
      magic: 300,
      heavy: 5,
      standard: 50,
      light: 80,
      slash: 130,
      stab: 140,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "earth", severity: 40 },
  },

  // The Smorks — Bork's groupies, fought in the same room. 85% weak to Earth,
  // 2 flat armour (added to the wiki 2026-10-20 23:48 UTC).
  // Source: https://oldschool.runescape.wiki/w/Smork
  {
    id: 16641,
    name: "The Smorks",
    version: "",
    image: "The Smorks.png",
    level: 640,
    speed: 7,
    style: ["Ranged", "Magic"],
    size: 3,
    max_hit: "",
    skills: { atk: 1, def: 220, hp: 600, magic: 185, ranged: 185, str: 1 },
    offensive: { atk: 0, magic: 185, magic_str: 35, ranged: 250, ranged_str: 30, str: 0 },
    defensive: {
      flat_armour: 2,
      crush: 160,
      magic: 400,
      heavy: 80,
      standard: 150,
      light: 80,
      slash: 170,
      stab: 220,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "earth", severity: 85 },
  },

  // Moia — third-boss choice (vs Dreadnoth). A necromancer with low melee and
  // magic defence bonuses, 80% weak to Air (added to the wiki 2026-10-20
  // 23:58 UTC; the launch infobox had no weakness).
  // Source: https://oldschool.runescape.wiki/w/Moia
  {
    id: 16667,
    name: "Moia",
    version: "",
    image: "Moia.png",
    level: 1064,
    speed: 5,
    style: [],
    size: 3,
    max_hit: "",
    skills: { atk: 1, def: 195, hp: 785, magic: 350, ranged: 200, str: 1 },
    offensive: { atk: 0, magic: 300, magic_str: 0, ranged: 350, ranged_str: 35, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 15,
      magic: 30,
      heavy: 140,
      standard: 120,
      light: 60,
      slash: 110,
      stab: 20,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "air", severity: 80 },
  },

  // Dreadnoth the Jellied — third-boss choice (vs Moia). A partially summoned
  // demon sealed in jelly, tagged Demon on the wiki since 2026-10-20 23:48 UTC
  // (the launch infobox had no attribute), so demonbane applies at the default
  // 100%. 85% weak to Fire.
  // Source: https://oldschool.runescape.wiki/w/Dreadnoth_the_Jellied
  {
    id: 16665,
    name: "Dreadnoth the Jellied",
    version: "",
    image: "Dreadnoth the Jellied.png",
    level: 888,
    speed: 4,
    style: [],
    size: 5,
    max_hit: "",
    skills: { atk: 280, def: 125, hp: 2100, magic: 220, ranged: 250, str: 285 },
    offensive: { atk: 185, magic: 0, magic_str: 0, ranged: 180, ranged_str: 20, str: 35 },
    defensive: {
      flat_armour: 0,
      crush: 5,
      magic: 20,
      heavy: 80,
      standard: 80,
      light: 100,
      slash: 20,
      stab: 15,
    },
    attributes: ["demon"],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "fire", severity: 85 },
  },

  // Xarth — fourth-boss choice (vs the Dagon'hai). A tormented demon
  // (demonbane applies at the default 100%), 85% weak to Water. The wiki
  // leaves its attack speed blank.
  // Source: https://oldschool.runescape.wiki/w/Xarth
  {
    id: 16684,
    name: "Xarth",
    version: "",
    image: "Xarth.png",
    level: 912,
    speed: 0,
    style: [],
    size: 3,
    max_hit: "",
    skills: { atk: 250, def: 170, hp: 2600, magic: 350, ranged: 220, str: 225 },
    offensive: { atk: 0, magic: 250, magic_str: 0, ranged: 250, ranged_str: 0, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 20,
      magic: 205,
      heavy: 155,
      standard: 230,
      light: 125,
      slash: 105,
      stab: 115,
    },
    attributes: ["demon"],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "water", severity: 85 },
  },

  // Ocellus — the final boss, a fallen Guardian of Guthix (demon). Three
  // phases on the wiki; Phase 2 ("Gone crazed with power", attack speed 0)
  // has no hitpoints or combat level listed and reads as the untargetable
  // portal transition, so only the two fightable stat blocks are listed.
  // Phase 1 is the catalog default (PREFERRED_VERSION in the build script).
  // Source: https://oldschool.runescape.wiki/w/Ocellus
  {
    id: 16673,
    name: "Ocellus",
    version: "Phase 1",
    image: "Ocellus.png",
    level: 1121,
    speed: 5,
    style: [],
    size: 3,
    max_hit: "",
    skills: { atk: 1, def: 215, hp: 2500, magic: 350, ranged: 250, str: 1 },
    offensive: { atk: 1, magic: 150, magic_str: 0, ranged: 150, ranged_str: 0, str: 1 },
    defensive: {
      flat_armour: 0,
      crush: 60,
      magic: 100,
      heavy: 50,
      standard: 135,
      light: 50,
      slash: 95,
      stab: 150,
    },
    attributes: ["demon"],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },
  {
    id: 16677,
    name: "Ocellus",
    version: "Phase 3",
    image: "Ocellus (phase 3).png",
    level: 1197,
    speed: 6,
    style: [],
    size: 3,
    max_hit: "",
    skills: { atk: 325, def: 250, hp: 5250, magic: 300, ranged: 300, str: 250 },
    offensive: { atk: 150, magic: 350, magic_str: 10, ranged: 0, ranged_str: 0, str: 10 },
    defensive: {
      flat_armour: 0,
      crush: 30,
      magic: 200,
      heavy: 250,
      standard: 250,
      light: 250,
      slash: 100,
      stab: 150,
    },
    attributes: ["demon"],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },
];
