// Charged combat items are worn untradeable, but you buy and sell them in an
// UNCHARGED (tradeable) form — Tumeken's shadow, the tridents, Toxic blowpipe,
// Scythe of Vitur, Bow of Faerdhinen, the wilderness weapons, etc. For Budget
// mode that means they shouldn't sit in the "owned untradeables" list: the
// optimizer should be free to EQUIP the charged item (its real combat stats)
// while pricing it at the uncharged GE value — you buy the uncharged item and
// charge it yourself.
//
// The slim equipment catalog only contains the charged (worn) forms, so the
// uncharged tradeable forms are referenced by their stable GE item id (verified
// against the live GE mapping). This is a CURATED list of genuinely charged
// combat gear — NOT auto-derived, because the "(u)" suffix is overloaded: on
// bows/crossbows/amulets it means *unstrung* (a fletching/crafting step), which
// would wrongly pull every shortbow/longbow in.
//
// Recolour / autocast / ornament variants ("Bow of Faerdhinen (c) (Crwys)",
// "Accursed sceptre (a)", "Trident of the Swamp (e) (o)") resolve to the same
// uncharged price by stripping a trailing parenthetical (see chargedKey).
//
// Not mapped (no tradeable uncharged form): Magma/Tanzanite helm (Serpentine
// helm + a consumed mutagen), Holy/Sanguine Scythe & Holy Sanguinesti, and
// untradeable-only weapons like Scorching bow.

import { ITEM_CATALOG } from "@/data/items/catalog";

// charged catalog (base) name → GE item id of the uncharged/tradeable form.
const CHARGED_UNCHARGED_ID: Record<string, number> = {
  "Tumeken's shadow": 27277,
  "Sanguinesti staff": 22481,
  "Scythe of Vitur": 22486,
  "Trident of the Seas": 11908,
  "Trident of the Seas (e)": 22290,
  "Trident of the Swamp": 12900,
  "Trident of the Swamp (e)": 22294,
  "Toxic blowpipe": 12924,
  "Bow of Faerdhinen": 25862,
  "Bow of Faerdhinen (c)": 25862,
  "Blade of Saeldor": 23997,
  "Blade of Saeldor (c)": 23997,
  "Craw's bow": 22547,
  "Webweaver bow": 27652,
  "Ursine chainmace": 27657,
  "Viggora's chainmace": 22542,
  "Accursed sceptre": 27662,
  "Thammaron's sceptre": 22552,
  "Warped sceptre": 28583,
  "Venator bow": 27612,
  "Tonalztics of Ralos": 28919,
  "Serpentine helm": 12929,
  "Eye of Ayak": 31115,
  "Bryophyta's staff": 22368,
  "Camphor blowpipe": 31577,
  "Ironwood blowpipe": 31581,
  "Rosewood blowpipe": 31585,
};

/** Match a catalog name to a charged key, stripping one trailing recolour/
 *  autocast/ornament suffix so variants share their base's uncharged price. */
function chargedKey(name: string): string | undefined {
  if (name in CHARGED_UNCHARGED_ID) return name;
  const stripped = name.replace(/\s*\([^()]*\)\s*$/, "");
  if (stripped !== name && stripped in CHARGED_UNCHARGED_ID) return stripped;
  return undefined;
}

/**
 * charged catalog item id → GE item id of its uncharged (tradeable) form.
 * Budget mode prices the worn charged item at this uncharged value, and the
 * "owned untradeables" list skips these (they're effectively buyable).
 */
export const UNCHARGED_PRICE_ID: ReadonlyMap<number, number> = new Map(
  ITEM_CATALOG.flatMap((it) => {
    const key = chargedKey(it.name);
    return key !== undefined ? ([[it.id, CHARGED_UNCHARGED_ID[key]]] as [number, number][]) : [];
  }),
);
