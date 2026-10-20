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
//
// Icons: public/icons/items/<id>.png for every entry below was fetched from the
// wiki by hand (the usual `refresh-vendor-icons` copies from weirdgloop, which
// doesn't have them yet). Level requirements live in requirement-overrides.ts.

import type { VendorEquipmentItem } from "../../types/vendor.js";

const NO_BONUSES = { str: 0, ranged_str: 0, magic_str: 0, prayer: 0 };
const NO_OFFENSIVE = { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 };
const NO_DEFENSIVE = { stab: 0, slash: 0, crush: 0, magic: 0, ranged: 0 };

// ---------------------------------------------------------------------------
// The Fractured Archive (Raids 4) rewards, released 20 October 2026.
// Transcribed on release day — re-verify against the wiki in the first weeks.
//
// Not worn, so not listed: Horn of Bran (unlocks the Zeal prayer, see
// data/prayers.ts), the four Elemental fragments (+2 base max hit to one
// element's spells — a player upgrade, not yet modelled), Ascension shards,
// the Archivist's folio (teleport book with no combat bonuses) and Orion.
// ---------------------------------------------------------------------------
export const SUPPLEMENTAL_ITEMS: VendorEquipmentItem[] = [
  // Obligator — the crush megarare, a two-handed mace on a vine (85 Attack).
  // Charged with Ascension shards + nature/death runes; only the uncharged
  // form is tradeable (like Tumeken's shadow), see charged-items.ts.
  // Two styles: THRUST (this 5-tick speed) rolls damage twice, plus once
  // more for each of the target's stab / slash defence bonuses above its
  // crush (up to four), keeps the best, and deals +20% / +40% vs 2x2 / 3x3+
  // targets; SMASH is a plain 3-tick single-target hit with none of that.
  // Both are modelled (data/items/obligator.ts, engine `damageRolls` /
  // `sizeDamageFactor`): the optimizer scores both styles per target and
  // takes the better one (DpsResult.obligatorStyle says which) — smash vs
  // most 1x1 targets, thrust vs 2x2+ with three or more rolls and vs every
  // 3x3+. The line hit (several targets) is not modelled. Category "Blunt"
  // (Pound / Pummel / Block, all crush) stands in for the wiki's "Unarmed"
  // placeholder.
  // Source: https://oldschool.runescape.wiki/w/Obligator
  {
    id: 34715,
    name: "Obligator",
    version: "Charged",
    slot: "weapon",
    weight: 4.989,
    image: "Obligator.png",
    speed: 5,
    category: "Blunt",
    bonuses: { str: 40, ranged_str: 0, magic_str: 0, prayer: 3 },
    offensive: { stab: 22, slash: -8, crush: 120, magic: 0, ranged: 0 },
    defensive: { stab: 0, slash: 16, crush: 0, magic: 3, ranged: 8 },
    isTwoHanded: true,
  },
  {
    id: 34717,
    name: "Obligator",
    version: "Uncharged",
    slot: "weapon",
    weight: 4.989,
    image: "Obligator (uncharged).png",
    speed: 5,
    category: "Blunt",
    bonuses: { str: 40, ranged_str: 0, magic_str: 0, prayer: 3 },
    offensive: { stab: 22, slash: -8, crush: 120, magic: 0, ranged: 0 },
    defensive: { stab: 0, slash: 16, crush: 0, magic: 3, ranged: 8 },
    isTwoHanded: true,
  },

  // Ascension crossbows — dual-wield (two-handed) 3-tick crossbows (80 Ranged)
  // that fire ONLY Ascension bolts (data/ammo-compatibility.ts). Their 6-tile
  // attack range is not modelled.
  // Source: https://oldschool.runescape.wiki/w/Ascension_crossbows
  {
    id: 34681,
    name: "Ascension crossbows",
    version: "",
    slot: "weapon",
    weight: 6,
    image: "Ascension crossbows.png",
    speed: 3,
    category: "Crossbow",
    bonuses: NO_BONUSES,
    offensive: { stab: 0, slash: 0, crush: 0, magic: 3, ranged: 34 },
    defensive: { stab: -7, slash: -5, crush: 0, magic: 10, ranged: 0 },
    isTwoHanded: true,
  },

  // Zorya's tome — two-handed 3-tick powered staff (85 Magic) with +15% magic
  // damage; its built-in spell is in powered-staff-spells.ts. The special
  // attack (one spell at +150% accuracy / +60% damage, then three 2-tick
  // attacks with the same boost) is listed in data/spec-weapons.ts (display
  // only, like every spec). Tradeable uncharged only.
  // Source: https://oldschool.runescape.wiki/w/Zorya's_tome
  {
    id: 34725,
    name: "Zorya's tome",
    version: "Charged",
    slot: "weapon",
    weight: 5,
    image: "Zorya's tome.png",
    speed: 3,
    category: "Powered Staff",
    bonuses: { str: 0, ranged_str: 0, magic_str: 150, prayer: 2 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 45, ranged: 0 },
    defensive: { stab: 1, slash: 5, crush: 5, magic: 10, ranged: 0 },
    isTwoHanded: true,
  },
  {
    id: 34727,
    name: "Zorya's tome",
    version: "Uncharged",
    slot: "weapon",
    weight: 4,
    image: "Zorya's tome (uncharged).png",
    speed: 3,
    category: "Powered Staff",
    bonuses: { str: 0, ranged_str: 0, magic_str: 150, prayer: 2 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: 45, ranged: 0 },
    defensive: { stab: 1, slash: 5, crush: 5, magic: 10, ranged: 0 },
    isTwoHanded: true,
  },

  // Rondache — icyene shield (80 Defence) with +8 strength. Its +2 flat
  // armour / magic resistance and the charge-fuelled Shield Bash special are
  // not modelled.
  // Source: https://oldschool.runescape.wiki/w/Rondache
  {
    id: 34719,
    name: "Rondache",
    version: "",
    slot: "shield",
    weight: 4.122,
    image: "Rondache.png",
    speed: 0,
    category: "",
    bonuses: { str: 8, ranged_str: 0, magic_str: 0, prayer: 0 },
    offensive: { stab: 0, slash: 0, crush: 0, magic: -5, ranged: -8 },
    defensive: { stab: 35, slash: 41, crush: 38, magic: -6, ranged: 55 },
    isTwoHanded: false,
  },

  // Ascension bolts — the Ascension crossbows' only ammo, fletched from
  // Ascension shards (86 Fletching). Gem-tipped and enchanted variants: the
  // diamond / onyx (e) procs are registered in bolt-procs.ts.
  // Sources: https://oldschool.runescape.wiki/w/Ascension_bolts (and the
  // Diamond / Onyx ascension bolts and (e) pages).
  {
    id: 34684,
    name: "Ascension bolts",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Ascension bolts 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 53, magic_str: 0, prayer: 0 },
    offensive: NO_OFFENSIVE,
    defensive: NO_DEFENSIVE,
    isTwoHanded: false,
  },
  {
    id: 34690,
    name: "Diamond ascension bolts",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Diamond ascension bolts 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 58, magic_str: 0, prayer: 0 },
    offensive: NO_OFFENSIVE,
    defensive: NO_DEFENSIVE,
    isTwoHanded: false,
  },
  {
    id: 34696,
    name: "Diamond ascension bolts (e)",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Diamond ascension bolts (e) 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 58, magic_str: 0, prayer: 0 },
    offensive: NO_OFFENSIVE,
    defensive: NO_DEFENSIVE,
    isTwoHanded: false,
  },
  {
    id: 34702,
    name: "Onyx ascension bolts",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Onyx ascension bolts 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 58, magic_str: 0, prayer: 0 },
    offensive: NO_OFFENSIVE,
    defensive: NO_DEFENSIVE,
    isTwoHanded: false,
  },
  {
    id: 34708,
    name: "Onyx ascension bolts (e)",
    version: "",
    slot: "ammo",
    weight: 0,
    image: "Onyx ascension bolts (e) 5.png",
    speed: 0,
    category: "",
    bonuses: { str: 0, ranged_str: 58, magic_str: 0, prayer: 0 },
    offensive: NO_OFFENSIVE,
    defensive: NO_DEFENSIVE,
    isTwoHanded: false,
  },

  // Living record (tiers 1-5) — untradeable completion-count capes with no
  // bonuses, listed so the item browser and bank import know them.
  // Source: https://oldschool.runescape.wiki/w/Living_record_(tier_1) etc.
  ...([
    [34659, 1],
    [34661, 2],
    [34663, 3],
    [34665, 4],
    [34667, 5],
  ] as const).map(
    ([id, tier]): VendorEquipmentItem => ({
      id,
      name: `Living record (tier ${tier})`,
      version: "",
      slot: "cape",
      weight: 0.453,
      image: `Living record (tier ${tier}).png`,
      speed: 0,
      category: "",
      bonuses: NO_BONUSES,
      offensive: NO_OFFENSIVE,
      defensive: NO_DEFENSIVE,
      isTwoHanded: false,
    }),
  ),
];
