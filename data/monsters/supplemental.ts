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
// The Dagon'hai Elder and Monks (the fourth-boss alternative to Xarth) had
// empty infoboxes at launch; the wiki filled them in on 2026-10-21 20:32 UTC
// and they are listed at the end of this file.
// Transcribed 2026-10-20 (release day), re-checked against the wiki on
// 2026-10-21 and 2026-10-26 (docs/tfa-wiki-watch.md): the early infoboxes get
// corrected in the first weeks, keep re-verifying.
// ---------------------------------------------------------------------------
const TFA_IMMUNITIES = { burn: null };

export const SUPPLEMENTAL_MONSTERS: VendorMonster[] = [
  // Archive Guardian — the fixed first boss. Two wiki versions since
  // 2026-10-21 19:24 UTC: Flying (melee can't reach it without a halberd,
  // 80% weak to Fire) and Grounded (after its shield bar is emptied it crashes
  // down: slash 90, light 50, standard 115, Fire weakness 40%). Since
  // 2026-10-26 the infobox versions the attribute too (`attributes1 =
  // flying`, `attributes2 = No`), so the Grounded block has no flying tag.
  // Flying is listed first so the stable HP tie-break keeps it as the default.
  // Source: https://oldschool.runescape.wiki/w/Archive_Guardian
  {
    id: 16659,
    name: "Archive Guardian",
    version: "Flying",
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
  {
    id: 16659,
    name: "Archive Guardian",
    version: "Grounded",
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
      standard: 115,
      light: 50,
      slash: 90,
      stab: 120,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: { element: "fire", severity: 40 },
  },

  // Ezekiel — second-boss choice (vs Bork and the Smorks). A Saradominist
  // justiciar: huge ranged defence, 25% weak to Earth. Attack style "Magic,
  // Melee" on the wiki since 2026-10-26 (was "melee"). Attack style "Magic,
  // Melee" on the wiki since 2026-10-26 (was "melee").
  // Source: https://oldschool.runescape.wiki/w/Ezekiel
  {
    id: 16652,
    name: "Ezekiel",
    version: "",
    image: "Ezekiel.png",
    level: 984,
    speed: 5,
    style: ["Magic", "Melee"],
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

  // Bork — second-boss choice, fought alongside the Smorks. Since 2026-10-26
  // the wiki lists flat armour "8-14 (Base), 0 (Stunned)" and magic
  // resistance "0-6": both start at 8 / 0 with the Smorks at full health and
  // gain 2 for every 25% of the Smorks' health lost. The Base phase carries
  // the starting 8 (the engine has no magic-resistance slot); Stunned is 0.
  // Was 12 at launch, 10 from 2026-10-20 23:47 UTC. Crush defence went
  // 10 → 20 on 2026-10-21 and back to 10 on 2026-10-26 18:48 UTC.
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
      flat_armour: 8,
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
  // 23:58 UTC; the launch infobox had no weakness). Attack style "Ranged,
  // Magic" filled in 2026-10-26. Attack style "Ranged,
  // Magic" filled in 2026-10-26.
  // Source: https://oldschool.runescape.wiki/w/Moia
  {
    id: 16667,
    name: "Moia",
    version: "",
    image: "Moia.png",
    level: 1064,
    speed: 5,
    style: ["Ranged", "Magic"],
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
  // (the launch infobox had no attribute). Since 2026-10-26 the page states
  // "75% demonbane resistance" (Emberlight's +70% becomes +17.5%), carried
  // as a 25% vulnerability in demonbane-vulnerability.ts. 85% weak to Fire.
  // Max hit 45 and attack style "Melee, Ranged" filled in the same day.
  // Source: https://oldschool.runescape.wiki/w/Dreadnoth_the_Jellied
  {
    id: 16665,
    name: "Dreadnoth the Jellied",
    version: "",
    image: "Dreadnoth the Jellied.png",
    level: 888,
    speed: 4,
    style: ["Melee", "Ranged"],
    size: 5,
    max_hit: "45",
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
  // (demonbane applies at the default 100%), 85% weak to Water. Attack
  // styles and the offensive bonuses (attbns 150, strbns 225, mbns 350) were
  // added 2026-10-21 22:59 UTC; attack speed 4 and the Melee style followed
  // on 2026-10-26 18:49 UTC. Transcribed as given.
  // Source: https://oldschool.runescape.wiki/w/Xarth
  {
    id: 16684,
    name: "Xarth",
    version: "",
    image: "Xarth.png",
    level: 912,
    speed: 4,
    style: ["Magic", "Ranged", "Melee"],
    size: 3,
    max_hit: "",
    skills: { atk: 250, def: 170, hp: 2600, magic: 350, ranged: 220, str: 225 },
    offensive: { atk: 150, magic: 250, magic_str: 350, ranged: 250, ranged_str: 0, str: 225 },
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
  // phases on the wiki. Phase 2 ("Gone crazed with power") had no stats
  // until 2026-10-26 18:50 UTC, when the infobox gave it 1000 HP, 250
  // Defence, combat level 0, attack speed 0, no Demon tag and its own
  // defensive bonuses; the strategy page says players "attack Ocellus via
  // disrupting the Blade" there with Ranged. Transcribed as given. The
  // unversioned "max hit = 24" applies to all three. Phase 1 is the catalog
  // default (PREFERRED_VERSION in the build script).
  // Source: https://oldschool.runescape.wiki/w/Ocellus
  {
    id: 16673,
    name: "Ocellus",
    version: "Phase 1",
    image: "Ocellus.png",
    level: 1121,
    speed: 5,
    style: ["Magic", "Ranged"],
    size: 3,
    max_hit: "24",
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
    id: 16675,
    name: "Ocellus",
    version: "Phase 2",
    image: "Ocellus (phase 2).png",
    level: 0,
    speed: 0,
    style: ["Magic"],
    size: 3,
    max_hit: "24",
    skills: { atk: 1, def: 250, hp: 1000, magic: 220, ranged: 1, str: 1 },
    offensive: { atk: 0, magic: 0, magic_str: 0, ranged: 0, ranged_str: 0, str: 0 },
    defensive: {
      flat_armour: 0,
      crush: 10,
      magic: 100,
      heavy: 80,
      standard: 110,
      light: 100,
      slash: 120,
      stab: 150,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },
  {
    id: 16677,
    name: "Ocellus",
    version: "Phase 3",
    image: "Ocellus (phase 3).png",
    level: 1601,
    speed: 6,
    style: ["Magic", "Melee", "Ranged"],
    size: 3,
    max_hit: "24",
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

  // Dagon'hai Elder — fourth-boss choice (vs Xarth), fought with two Monks;
  // the three share one health pool. Stats added to the wiki 2026-10-21
  // 20:32 UTC; attack speed 6 and attack style "Magic, Ranged" sorted out
  // on 2026-10-26 (the speed had been misfiled in the style field). Immune
  // to poison, venom and the cannon; no elemental weakness listed.
  // Source: https://oldschool.runescape.wiki/w/Dagon'hai_Elder
  {
    id: 16643,
    name: "Dagon'hai Elder",
    version: "",
    image: "Dagon'hai Elder.png",
    level: 427,
    speed: 6,
    style: ["Magic", "Ranged"],
    size: 2,
    max_hit: "",
    skills: { atk: 1, def: 100, hp: 640, magic: 290, ranged: 260, str: 1 },
    offensive: { atk: 0, magic: 1, magic_str: 0, ranged: 0, ranged_str: 180, str: 1 },
    defensive: {
      flat_armour: 0,
      crush: 50,
      magic: 100,
      heavy: 80,
      standard: 80,
      light: 80,
      slash: 50,
      stab: 50,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },

  // Dagon'hai Monk — the Elder's two companions. The wiki's Staff (ids
  // 16645-16646) and Book (16647-16648) versions carry identical stats, so
  // the catalog collapses them to one entry. Stats added 2026-10-21 20:32 UTC.
  // Source: https://oldschool.runescape.wiki/w/Dagon'hai_Monk
  {
    id: 16645,
    name: "Dagon'hai Monk",
    version: "Staff",
    image: "Dagon'hai Monk (staff).png",
    level: 427,
    speed: 6,
    style: [],
    size: 2,
    max_hit: "",
    skills: { atk: 1, def: 100, hp: 640, magic: 290, ranged: 260, str: 1 },
    offensive: { atk: 0, magic: 1, magic_str: 0, ranged: 0, ranged_str: 180, str: 1 },
    defensive: {
      flat_armour: 0,
      crush: 50,
      magic: 100,
      heavy: 80,
      standard: 80,
      light: 80,
      slash: 50,
      stab: 50,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },
  {
    id: 16647,
    name: "Dagon'hai Monk",
    version: "Book",
    image: "Dagon'hai Monk (book).png",
    level: 427,
    speed: 6,
    style: [],
    size: 2,
    max_hit: "",
    skills: { atk: 1, def: 100, hp: 640, magic: 290, ranged: 260, str: 1 },
    offensive: { atk: 0, magic: 1, magic_str: 0, ranged: 0, ranged_str: 180, str: 1 },
    defensive: {
      flat_armour: 0,
      crush: 50,
      magic: 100,
      heavy: 80,
      standard: 80,
      light: 80,
      slash: 50,
      stab: 50,
    },
    attributes: [],
    immunities: TFA_IMMUNITIES,
    is_slayer_monster: false,
    weakness: null,
  },
];
