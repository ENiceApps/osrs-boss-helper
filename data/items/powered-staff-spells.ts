// Base spell max-hit formulas for powered staves — weapons that auto-cast
// their own built-in spell whose damage scales with the player's magic level.
// Unlike regular staves that cast from the spellbook, these don't require a
// separate baseSpellMaxHit to be passed in; the optimizer derives it here.
//
// Source: https://oldschool.runescape.wiki/w/Magic#Powered_staves

export type PoweredStaffFormula = (magicLevel: number) => number;

// Item ID → base-max-hit formula. Keys MUST be ids that exist in
// data/items/catalog.ts (generated from vendor equipment.json), since the bank
// optimizer and autocast classifier look these weapons up by their catalog id.
// Cosmetic recolours ((e)/(o)) keep the same max-hit formula, so every charged
// AND uncharged variant the catalog exposes is listed — a powered staff that is
// missing here would get ~0 magic DPS and be misread as a regular autocast staff.
// The tests/powered-staff-formula.test.ts guard fails if a key drifts from the catalog.
export const POWERED_STAFF_FORMULA = new Map<number, PoweredStaffFormula>([
  // Trident of the seas: floor(magic / 3) - 5  (28 at 99)
  [11905, (lvl) => Math.floor(lvl / 3) - 5], // Charged
  [11907, (lvl) => Math.floor(lvl / 3) - 5], // Partially charged
  [11908, (lvl) => Math.floor(lvl / 3) - 5], // Uncharged
  [22288, (lvl) => Math.floor(lvl / 3) - 5], // (e) Charged
  [22290, (lvl) => Math.floor(lvl / 3) - 5], // (e) Uncharged
  [33323, (lvl) => Math.floor(lvl / 3) - 5], // (o) Fully charged
  [33322, (lvl) => Math.floor(lvl / 3) - 5], // (o) Partially charged
  [33326, (lvl) => Math.floor(lvl / 3) - 5], // (e) (o) Charged
  [33328, (lvl) => Math.floor(lvl / 3) - 5], // (e) (o) Uncharged

  // Trident of the swamp: floor(magic / 3) - 4  (29 at 99)
  [12899, (lvl) => Math.floor(lvl / 3) - 4], // Charged
  [12900, (lvl) => Math.floor(lvl / 3) - 4], // Uncharged
  [22292, (lvl) => Math.floor(lvl / 3) - 4], // (e) Charged
  [22294, (lvl) => Math.floor(lvl / 3) - 4], // (e) Uncharged
  [33314, (lvl) => Math.floor(lvl / 3) - 4], // (o) Charged
  [33316, (lvl) => Math.floor(lvl / 3) - 4], // (o) Uncharged
  [33318, (lvl) => Math.floor(lvl / 3) - 4], // (e) (o) Charged
  [33320, (lvl) => Math.floor(lvl / 3) - 4], // (e) (o) Uncharged

  // Sanguinesti staff: floor(magic / 3) - 1  (32 at 99)
  [22323, (lvl) => Math.floor(lvl / 3) - 1], // Charged
  [22481, (lvl) => Math.floor(lvl / 3) - 1], // Uncharged
  [25731, (lvl) => Math.floor(lvl / 3) - 1], // Holy sanguinesti staff (charged)
  [25733, (lvl) => Math.floor(lvl / 3) - 1], // Holy sanguinesti staff (uncharged)

  // Tumeken's shadow: floor(magic / 3) + 1  (34 at 99)
  [27275, (lvl) => Math.floor(lvl / 3) + 1], // Charged
  [27277, (lvl) => Math.floor(lvl / 3) + 1], // Uncharged

  // Dawnbringer: floor(magic / 6) - 1  (15 at 99)
  [22516, (lvl) => Math.floor(lvl / 6) - 1],

  // Eye of ayak: max(1, trunc(magic / 3) - 6)  (27 at 99)
  [31113, (lvl) => Math.max(1, Math.trunc(lvl / 3) - 6)], // Charged
  [31115, (lvl) => Math.max(1, Math.trunc(lvl / 3) - 6)], // Uncharged
]);
