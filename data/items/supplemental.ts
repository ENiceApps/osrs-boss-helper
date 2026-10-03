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

// Currently EMPTY: weirdgloop caught up with every hand-authored entry (Crimson
// kisten, Sunspear, Necklace of rupture, Seeking rune/amethyst/dragon arrows are
// all in the vendored dump), the build was already skipping them, and the
// vendored values are the ones the OSRS Wiki confirms, so the copies were
// removed. Add new entries below the next time brand-new gear trails the
// vendored dump.
export const SUPPLEMENTAL_ITEMS: VendorEquipmentItem[] = [];
