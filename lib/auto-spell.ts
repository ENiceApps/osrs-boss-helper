// Auto-selecting the combat spell a magic loadout is scored with. Lives on
// its own (not in lib/optimize/bank.ts) so the manual gear editor can re-pick
// a spell when a weapon swap moves a set into magic without importing the
// whole optimizer — which itself imports the editor.

import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import {
  autocastableSpellbooks,
  weaponSatisfiesStaffRequirement,
} from "@/data/items/magic-weapon-autocast";
import { LEAFY_SPELL_NAME } from "@/data/items/leaf-bladed";
import {
  BONUS_TRIGGER_VARIANTS,
  elementalAmuletKind,
} from "@/data/bonus-trigger-items";
import {
  SPELLS_BY_NAME,
  bestSpell,
  spellCastableVs,
  spellMaxHit,
  type SpellEntry,
} from "@/data/spells/catalog";
import type { CombatStyle, SpellElement } from "@/types/osrs";

/**
 * Magic Dart, when the target is LEAFY (Turoth/Kurask — it's the only spell
 * that hurts them), the weapon is a Slayer's staff (the spell's staff
 * requirement) and the player can cast it. The general auto-pick skips
 * staff-specific spells, so without this every magic build vs a leafy target
 * would cast a spell that deals nothing.
 */
function leafyMagicDart(
  weaponId: number,
  magicLevel: number,
  target: MonsterCatalogEntry,
): SpellEntry | undefined {
  if (!target.attributes.includes("leafy")) return undefined;
  const dart = SPELLS_BY_NAME.get(LEAFY_SPELL_NAME);
  if (!dart?.requiresStaff) return undefined;
  if (!weaponSatisfiesStaffRequirement(weaponId, dart.requiresStaff)) return undefined;
  return spellCastableVs(dart, magicLevel, target.attributes) ? dart : undefined;
}

export interface AutoSpellResult {
  baseSpellMaxHit?: number;
  spellElement?: SpellElement;
  autoSpellName?: string;
}

/**
 * Resolve the spell info a magic loadout should be scored with. Powered staves
 * (Trident / Sanguinesti / Shadow) embed their own damage formula keyed by
 * weapon ID; regular staves and wands auto-select the best castable spell
 * across all spellbooks the weapon can autocast, gated by the target's
 * attributes and ranked with any equipped tome / elemental amulet and the
 * target's elemental weakness. Non-magic styles return the fallbacks
 * unchanged. Shared by the bank optimizer, the from-scratch budget builder
 * and the manual gear editor.
 */
export function autoPickSpell(
  weapon: ItemCatalogEntry,
  itemIds: number[],
  combatStyle: CombatStyle,
  magicLevel: number,
  target: MonsterCatalogEntry,
  fallbackBaseSpellMaxHit?: number,
  fallbackSpellElement?: SpellElement,
): AutoSpellResult {
  const poweredFormula = POWERED_STAFF_FORMULA.get(weapon.id);
  let baseSpellMaxHit = poweredFormula
    ? poweredFormula(magicLevel)
    : fallbackBaseSpellMaxHit;
  let spellElement = fallbackSpellElement;
  let autoSpellName: string | undefined;

  if (combatStyle === "magic" && !poweredFormula && baseSpellMaxHit === undefined) {
    const spell = leafyMagicDart(weapon.id, magicLevel, target) ?? bestSpell({
      magicLevel,
      targetAttributes: target.attributes,
      tomeOfFire: BONUS_TRIGGER_VARIANTS.TOME_OF_FIRE_CHARGED.some((id) => itemIds.includes(id)),
      tomeOfWater: BONUS_TRIGGER_VARIANTS.TOME_OF_WATER_CHARGED.some((id) => itemIds.includes(id)),
      tomeOfEarth: BONUS_TRIGGER_VARIANTS.TOME_OF_EARTH_CHARGED.some((id) => itemIds.includes(id)),
      // With the elemental ladders every Surge ties at 95+ Magic, so the worn
      // elemental amulet (+2 on its element) and the target's elemental weakness
      // are what pick the element — see spellEffectiveMaxHit.
      elementalAmulet: elementalAmuletKind(new Set(itemIds)),
      targetWeakness: target.weakness,
      twinflame: weapon.id === 30634, // Twinflame staff
      // Never recommend a spell the equipped weapon can't autocast.
      allowedSpellbooks: autocastableSpellbooks(weapon.id),
    });
    if (spell) {
      baseSpellMaxHit = spellMaxHit(spell, magicLevel);
      spellElement = spell.element;
      autoSpellName = spell.name;
    }
  }

  return { baseSpellMaxHit, spellElement, autoSpellName };
}
