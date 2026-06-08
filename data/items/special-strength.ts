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
