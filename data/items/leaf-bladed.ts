// Leaf-bladed weapons — the only damage sources that can hurt LEAFY monsters
// (Turoth and Kurask, incl. King kurask and Spiked Turoth). Everything else
// deals no damage at all. Mirrors wgloop's BaseCalc.isWearingLeafBladedWeapon
// (osrs-dps-calc 89c3e25, which added Seeking broad arrows in #967) and the
// wiki: https://oldschool.runescape.wiki/w/Leafy_(attribute)
//
//   melee  — Leaf-bladed battleaxe / spear / sword, swung on a melee style
//   ranged — broad ammo fired from the ammo slot: Broad arrows, Seeking broad
//            arrows, Broad bolts, Amethyst broad bolts
//   magic  — the Magic Dart spell
//
// The Leaf-bladed battleaxe also deals +17.5% damage (×47/40) to them.
// Ids verified against data/vendor/wgloop/equipment.json — ids, not names,
// because upstream renames items (see the 2026-08 capitalisation sweep).

export const LEAF_BLADED_BATTLEAXE_ID = 20727;

export const LEAF_BLADED_MELEE_WEAPON_IDS: ReadonlySet<number> = new Set([
  LEAF_BLADED_BATTLEAXE_ID,
  4158, // Leaf-bladed spear
  11902, // Leaf-bladed sword
]);

export const BROAD_AMMO_IDS: ReadonlySet<number> = new Set([
  4160, // Broad arrows
  33601, // Seeking broad arrows
  11875, // Broad bolts
  21316, // Amethyst broad bolts
]);

/** The one spell that can damage a leafy monster. */
export const LEAFY_SPELL_NAME = "Magic Dart";
