// Magic attack speed (in ticks) for a loadout that autocasts a spellbook spell.
//
// When a REGULAR staff/wand autocasts a spell, the cast speed is fixed by the
// spell, not the staff's melee speed: standard / ancient / arceuus spells all
// autocast at 5 ticks. So a fast wand (Kodai wand = 4-tick melee) still casts at
// 5. Two weapons override this:
//   • Harmonised nightmare staff — standard-spellbook spells cast at 4 ticks
//   • Twinflame staff — casts at 6 ticks
// Powered staves (Trident / Sanguinesti / Tumeken's shadow, etc.) fire their own
// built-in attack at the weapon's listed speed and are returned unchanged.
//
// Mirrors weirdgloop calculateAttackSpeed's CAST_STANCES branch — cross-checked
// by scripts/oracle (the magic ×5/4 divergence this resolves).

import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";

const HARMONISED_NIGHTMARE_STAFF = 24423;
const TWINFLAME_STAFF = 30634;

/**
 * @param weaponId      equipped weapon's catalog id
 * @param weaponSpeed   the weapon's recorded melee/own speed (used for powered staves)
 * @param isStandardSpell whether the cast spell is on the standard spellbook
 *                        (only affects the Harmonised case)
 */
export function magicCastSpeedTicks(
  weaponId: number,
  weaponSpeed: number,
  isStandardSpell: boolean,
): number {
  // Powered staves don't autocast a chosen spell — keep their own attack speed.
  if (POWERED_STAFF_FORMULA.has(weaponId)) return weaponSpeed;
  if (weaponId === HARMONISED_NIGHTMARE_STAFF && isStandardSpell) return 4;
  if (weaponId === TWINFLAME_STAFF) return 6;
  return 5;
}
