// Hand-authored equipment that isn't in the vendored weirdgloop dump yet.
//
// Same idea as data/monsters/supplemental.ts: brand-new released gear trails
// weirdgloop/osrs-dps-calc's equipment.json (refreshed via `npm run refresh-vendor`).
// Add new WORN equipment here (exact VendorEquipmentItem shape) so the item
// browser + optimizer can use it immediately.
//
// build-item-catalog.ts merges these in but SKIPS any whose `id` already exists
// upstream — so once `refresh-vendor` pulls the real entry, the hand-authored
// copy drops out automatically (no duplicate). Delete the entry here when that
// happens. Non-worn items (crafting materials like the elder venator fang,
// consumables, pets) are intentionally excluded — the catalog is worn gear only.
//
// Every field is transcribed from the OSRS Wiki item {{Infobox Bonuses}} raw
// wikitext. Mapping: astab/aslash/acrush/amagic/arange -> offensive.*,
// dstab/.../drange -> defensive.*, str -> bonuses.str, rstr -> bonuses.ranged_str,
// mdmg% -> bonuses.magic_str (×10), prayer -> bonuses.prayer, combatstyle -> category.
// weirdgloop encodes two-handers as slot:"weapon" + isTwoHanded:true (not slot:"2h").
//
// NB: a new ammo type ALSO needs an entry in data/ammo-compatibility.ts
// (AMMO_TYPES) or the optimizer rejects it as "unknown ammo".

import type { VendorEquipmentItem } from "../../types/vendor.js";

export const SUPPLEMENTAL_ITEMS: VendorEquipmentItem[] = [
  // Crimson kisten — two-handed crush weapon dropped by the Maggot King.
  // Its "Brutal Swing" special attack (4 accuracy rolls) is not modelled here.
  // Source: https://oldschool.runescape.wiki/w/Crimson_kisten
  {
    id: 33631,
    name: "Crimson kisten",
    version: "",
    slot: "weapon",
    weight: 0,
    image: "Crimson kisten.png",
    speed: 4,
    category: "Axe",
    bonuses: { str: 56, ranged_str: 0, magic_str: 0, prayer: 0 },
    offensive: { stab: 0, slash: 0, crush: 80, magic: 0, ranged: 0 },
    defensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    isTwoHanded: true,
  },

  // Sunspear — untradeable 2h melee Spear, reward from The Blood Moon Rises
  // quest ("A holy spear"). Untradeable, so it has no GE price: the optimizer
  // offers it as a free untradeable PvE option (Budget mode) / from the bank
  // (Own-only), like Avernic treads. Left OFF NON_PVE_UNTRADEABLE_IDS on
  // purpose (it's legit PvE gear). Its anti-vampyre bonus is not modelled.
  // Source: https://oldschool.runescape.wiki/w/Sunspear
  {
    id: 33722,
    name: "Sunspear",
    version: "",
    slot: "weapon",
    weight: 3,
    image: "Sunspear.png",
    speed: 5,
    category: "Spear",
    bonuses: { str: 70, ranged_str: 0, magic_str: 0, prayer: 7 },
    offensive: { stab: 100, slash: 21, crush: 60, magic: 0, ranged: 0 },
    defensive: { stab: 0, slash: 42, crush: 28, magic: 0, ranged: 0 },
    isTwoHanded: true,
  },

  // Necklace of rupture — BiS Ranged amulet, a straight upgrade over the
  // Necklace of anguish (arange 15→20, rstr 5→8, prayer 2→3). Crafted from an
  // etched elder venator fang + Necklace of anguish.
  // Source: https://oldschool.runescape.wiki/w/Necklace_of_rupture
  {
    id: 33639,
    name: "Necklace of rupture",
    version: "",
    slot: "neck",
    weight: 0.01,
    image: "Necklace of rupture.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 8, magic_str: 0, prayer: 3 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 20 },
    defensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    isTwoHanded: false,
  },

  // Seeking arrows — post-quest arrow variants: same ranged strength as their
  // base tier, +20 ranged attack, and a minimum hit of 3 (the min-hit floor is
  // not modelled). Only the PvM-relevant tiers are listed; lower tiers are never
  // optimal against this app's bosses. Each also needs an AMMO_TYPES entry.
  // Sources: https://oldschool.runescape.wiki/w/Seeking_dragon_arrow (etc.)
  {
    id: 33595,
    name: "Seeking dragon arrow",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Seeking dragon arrow 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 60, magic_str: 0, prayer: 0 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 20 },
    defensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    isTwoHanded: false,
  },
  {
    id: 33589,
    name: "Seeking amethyst arrow",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Seeking amethyst arrow 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 55, magic_str: 0, prayer: 0 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 20 },
    defensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    isTwoHanded: false,
  },
  {
    id: 33583,
    name: "Seeking rune arrow",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Seeking rune arrow 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 49, magic_str: 0, prayer: 0 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 20 },
    defensive: { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 },
    isTwoHanded: false,
  },
];
