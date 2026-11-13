// Which spellbooks each magic weapon can AUTOCAST, per the OSRS Wiki:
// https://oldschool.runescape.wiki/w/Magic_weapons
//
// Nearly every magic weapon can autocast the Standard spellbook. Only specific
// weapons extend that to Ancient Magicks and/or Arceuus. Powered staves
// (Trident / Sanguinesti / Tumeken's shadow, etc.) cast their own built-in
// attack and cannot autocast a chosen spell at all.
//
// Matching is by catalog NAME (not item id) so it's robust to recolours and new
// item ids — the same approach as data/items/slayer-helm.ts.

import { ITEM_CATALOG } from "@/data/items/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { weaponCanCastSpell, type Spellbook } from "@/data/spells/catalog";
import { canonicalItemId } from "@/data/items/aliases";

const NAME_BY_ID = new Map<number, string>(ITEM_CATALOG.map((i) => [i.id, i.name]));

// Weapons that add Ancient Magicks autocast (wiki Autocast page, read
// 2026-11-13). NOTE the Harmonised Nightmare staff matches "nightmare staff"
// but is Standard-only (it speeds up standard spells), so it is explicitly
// excluded below. Ahrim's staff autocasts Ancient only with the full Ahrim's
// set and an Amulet of the damned; this table sees the weapon alone, so it is
// left out. Neither Staff of the dead autocasts Ancient.
const ANCIENT_CAPABLE =
  /ancient staff|ancient sceptre|kodai wand|master wand|nightmare staff|accursed sceptre \(a\)|thammaron's sceptre \(a\)|blue moon spear|dragon hunter wand/i;

// Weapons that add Arceuus autocast ("staff of the dead" covers the toxic one).
const ARCEUUS_CAPABLE =
  /kodai wand|master wand|purging staff|slayer's staff|skull sceptre \(i\)|staff of the dead|ahrim's staff|blue moon spear/i;

/** Spellbooks the given weapon can autocast. Empty for powered staves (no autocast). */
export function autocastableSpellbooks(weaponId: number | undefined): Spellbook[] {
  // No weapon (unarmed) — assume the player can autocast Standard from any book they're on.
  if (weaponId === undefined) return ["standard"];
  // Powered staves fire their own attack; they can't autocast a chosen spell.
  if (POWERED_STAFF_FORMULA.has(weaponId)) return [];
  const name = NAME_BY_ID.get(weaponId);
  if (!name) return ["standard"];
  const books: Spellbook[] = ["standard"];
  if (ANCIENT_CAPABLE.test(name) && !/harmonised/i.test(name)) books.push("ancient");
  if (ARCEUUS_CAPABLE.test(name)) books.push("arceuus");
  return books;
}

/** True iff the weapon can autocast spells from the given spellbook. */
export function weaponCanAutocastSpellbook(
  weaponId: number | undefined,
  spellbook: Spellbook,
): boolean {
  return autocastableSpellbooks(weaponId).includes(spellbook);
}

/**
 * True iff the equipped weapon can cast a staff-locked spell (Iban Blast, the
 * god spells, Magic Dart), by the same list the engine scores with
 * (SPELL_REQUIRED_WEAPONS): Magic Dart also casts from a Staff of the dead /
 * light / balance, Flames of Zamorak from a Staff of the dead, and so on. A
 * variant counts as its base item. Spells with no staff lock are always true.
 */
export function weaponCanCastStaffSpell(weaponId: number | undefined, spellName: string): boolean {
  if (weaponId === undefined) return false;
  const name = NAME_BY_ID.get(canonicalItemId(weaponId)) ?? NAME_BY_ID.get(weaponId);
  if (!name) return false;
  return weaponCanCastSpell(spellName, name);
}
