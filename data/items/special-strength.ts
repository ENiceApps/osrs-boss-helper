// Weapons with non-standard strength-bonus scaling.
//
// The Eclipse atlatl (Varlamore: The Rising Darkness) is a thrown ranged
// weapon with a unique mechanic: it uses the RANGED attack style for accuracy
// (ranged level + ranged attack bonus), but the player's MELEE strength bonus
// (the `str` field) to determine max hit — NOT ranged strength. Ranged
// strength bonuses (e.g. on a cape) do not affect its damage. The weapon
// itself carries its damage as a melee `str` bonus (+40), and atlatl darts
// give no bonuses at all.
// See https://oldschool.runescape.wiki/w/Eclipse_atlatl
export const ECLIPSE_ATLATL_ID = 29000;

/**
 * True when a ranged loadout should compute its max hit from the summed MELEE
 * strength bonus instead of ranged strength. Currently only the Eclipse
 * atlatl. Pass the equipped weapon's item id.
 */
export function rangedDamageUsesMeleeStrength(weaponId: number | undefined): boolean {
  return weaponId === ECLIPSE_ATLATL_ID;
}

// Dinh's bulwark (and its blazing recolour) adds melee strength from the
// wearer's total defence: upstream calculateEquipmentBonusesFromGear adds
// max(0, trunc((stab + slash + crush + ranged defence - 800) / 12) - 38) to
// the strength bonus, summed over every worn item (the bulwark included).
// Magic defence does not count.
export const DINHS_BULWARK_IDS: ReadonlySet<number> = new Set([
  21015, // Dinh's bulwark
  28682, // Dinh's blazing bulwark
]);

/** True when the weapon's strength bonus grows with the wearer's defence. */
export function strengthScalesWithDefence(weaponId: number | undefined): boolean {
  return weaponId !== undefined && DINHS_BULWARK_IDS.has(weaponId);
}

/** An item's contribution to the bulwark's defence sum (all but magic defence). */
export function bulwarkDefence(item: {
  defStab: number;
  defSlash: number;
  defCrush: number;
  defRanged: number;
}): number {
  return item.defStab + item.defSlash + item.defCrush + item.defRanged;
}

/**
 * Extra melee strength a bulwark gets from `defenceSum` (the summed
 * `bulwarkDefence` of every worn item); 0 for any other weapon.
 */
export function bulwarkStrengthBonus(weaponId: number | undefined, defenceSum: number): number {
  if (!strengthScalesWithDefence(weaponId)) return 0;
  return Math.max(0, Math.trunc((defenceSum - 800) / 12) - 38);
}
