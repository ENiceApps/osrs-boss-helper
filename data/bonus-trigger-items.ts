// Item IDs that activate conditional DPS bonuses at recommend/score time.
// Used by the bank optimizer (force-include branches) and loadout synthesis to
// set ItemBonusFlags. Standalone (not tied to any curated loadout data) so the
// optimizer doesn't depend on a premade-set module.
export const BONUS_TRIGGER_ITEM_IDS = {
  DRAGON_HUNTER_CROSSBOW: 21012,
  DRAGON_HUNTER_LANCE: 22978,
  DRAGON_HUNTER_WAND: 30070,
  SALVE_AMULET_EI: 12018, // enchanted imbued → ×6/5
  SALVE_AMULET_E: 10588, // enchanted (non-imbued) → ×6/5
  SALVE_AMULET: 4081, // base → ×7/6
  SALVE_AMULET_I: 12017, // imbued (non-enchanted) → ×7/6
  ARCLIGHT: 19675, // Charged → demonbane +70% acc/dmg
  EMBERLIGHT: 29589, // demonbane +70% acc/dmg
  SILVERLIGHT: 2402, // demonbane +60% acc/dmg (weakest tier, incl. Darklight)
  BURNING_CLAWS: 29577, // demonbane +5% acc/dmg
  SCORCHING_BOW: 29591, // RANGED demonbane +30% acc/dmg
  PURGING_STAFF: 29594, // doubles demonbane SPELL bonuses while casting them
  KERIS_PARTISAN: 25979, // any Keris partisan → +33% dmg + 1/51 triple vs Kalphites
  KERIS_PARTISAN_BREACHING: 25981, // breaching → additionally +33% accuracy
  TOME_OF_FIRE_CHARGED: 20714,
  TOME_OF_WATER_CHARGED: 25574,
  TOME_OF_EARTH_CHARGED: 30064,
  TWISTED_BOW: 20997,
  OSMUMTEN_FANG: 26219, // double accuracy roll on stab styles
  WILDERNESS_WEAPON: 22550, // Craw's bow — canonical; ×3/2 acc+dmg vs NPCs in the Wilderness
} as const;

export type BonusTriggerKey = keyof typeof BONUS_TRIGGER_ITEM_IDS;

/**
 * ALL item ids that carry each trigger's bonus. Cosmetic kits and minigame
 * re-imbues get distinct item ids in-game; a variant missing from this table
 * silently turns the bonus off — the bug that hid a player's Salve amulet(ei)
 * (Emir's Arena) from the optimizer. Ids verified against
 * data/vendor/wgloop/equipment.json.
 */
export const BONUS_TRIGGER_VARIANTS: Record<BonusTriggerKey, readonly number[]> = {
  DRAGON_HUNTER_CROSSBOW: [21012, 25916, 25918], // + (t), (b) cosmetic kits
  DRAGON_HUNTER_LANCE: [22978],
  DRAGON_HUNTER_WAND: [30070],
  SALVE_AMULET_EI: [12018, 25278, 26782], // + Soul Wars, Emir's Arena imbues
  SALVE_AMULET_E: [10588],
  SALVE_AMULET: [4081],
  SALVE_AMULET_I: [12017, 25250, 26763], // + Soul Wars, Emir's Arena imbues
  ARCLIGHT: [19675], // Charged only — Inactive (30305) has no demonbane
  EMBERLIGHT: [29589],
  // Silverlight Normal + Dyed and Darklight all share the +60% tier (wgloop
  // lists all three in the same wearing() check).
  SILVERLIGHT: [2402, 6745, 6746],
  BURNING_CLAWS: [29577], // Bone claws share the +5% in wgloop but aren't in the vendor data
  SCORCHING_BOW: [29591],
  PURGING_STAFF: [29594],
  // All Keris partisan variants share the +33% damage + 1/51 triple vs Kalphites.
  KERIS_PARTISAN: [25979, 30891, 25981, 27287, 27291], // base, amascut, breaching, corruption, sun
  KERIS_PARTISAN_BREACHING: [25981], // only breaching adds the +33% accuracy

  TOME_OF_FIRE_CHARGED: [20714],  // Empty (20716) gives no bonus
  TOME_OF_WATER_CHARGED: [25574], // Empty (25576) gives no bonus
  TOME_OF_EARTH_CHARGED: [30064], // Empty (30066) gives no bonus
  TWISTED_BOW: [20997],
  OSMUMTEN_FANG: [26219, 27246], // base + (or) ornament kit — same Stab Sword
  // Both charged + uncharged ids per weapon (player charges them with ether).
  WILDERNESS_WEAPON: [
    22550, 22547, // Craw's bow
    27655, 27652, // Webweaver bow
    22545, 22542, // Viggora's chainmace
    27660, 27657, // Ursine chainmace
    22555, 22552, // Thammaron's sceptre
    27665, 27662, // Accursed sceptre
    27788, 27785, // Thammaron's sceptre (a)
    27679, 27676, // Accursed sceptre (a)
  ],
};

/** True iff any variant of the trigger is present (worn-slot flag derivation). */
export function hasTrigger(
  itemIds: ReadonlySet<number>,
  key: BonusTriggerKey,
): boolean {
  return BONUS_TRIGGER_VARIANTS[key].some((id) => itemIds.has(id));
}

/** Every owned variant of a trigger — force-include branches equip the real
    owned id, not the canonical one the player may not have. */
export function ownedTriggerIds(
  bank: ReadonlySet<number>,
  key: BonusTriggerKey,
): number[] {
  return BONUS_TRIGGER_VARIANTS[key].filter((id) => bank.has(id));
}
