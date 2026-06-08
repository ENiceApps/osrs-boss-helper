// Item IDs that activate conditional DPS bonuses at recommend/score time.
// Used by the bank optimizer (force-include branches) and loadout synthesis to
// set ItemBonusFlags. Standalone (not tied to any curated loadout data) so the
// optimizer doesn't depend on a premade-set module.
export const BONUS_TRIGGER_ITEM_IDS = {
  DRAGON_HUNTER_CROSSBOW: 21012,
  DRAGON_HUNTER_LANCE: 22978,
  SALVE_AMULET_EI: 12018, // enchanted imbued → ×6/5
  SALVE_AMULET_E: 10588, // enchanted (non-imbued) → ×6/5
  SALVE_AMULET: 4081, // base → ×7/6
  SALVE_AMULET_I: 12017, // imbued (non-enchanted) → ×7/6
  ARCLIGHT: 19675, // Charged → demonbane
  EMBERLIGHT: 29589, // demonbane
  TOME_OF_FIRE_CHARGED: 20714,
  TWISTED_BOW: 20997,
} as const;
