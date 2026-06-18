// Charged combat items are worn untradeable, but you buy and sell them in an
// UNCHARGED (tradeable) form — Tumeken's shadow, the tridents, Toxic blowpipe,
// Scythe of vitur, Bow of faerdhinen (c), the wilderness weapons, etc. For
// Budget mode that means they shouldn't sit in the "owned untradeables" list:
// the optimizer should be free to EQUIP the charged item (its real combat stats)
// while pricing it at the uncharged GE value — you just buy the uncharged item
// and charge it yourself.
//
// The slim equipment catalog only contains the charged (worn) forms, so the
// uncharged tradeable forms are referenced by their stable GE item id (verified
// against the live GE mapping). Keyed by the charged item's catalog NAME.
//
// Not mapped (no tradeable uncharged form): Magma/Tanzanite helm (made from a
// Serpentine helm + a consumed mutagen) and the Holy/Sanguine Scythe & Holy
// Sanguinesti variants — those stay as ordinary owned-only untradeables.

import { ITEM_CATALOG } from "@/data/items/catalog";

const CHARGED_UNCHARGED_ID: Record<string, number> = {
  "Tumeken's shadow": 27277, // Tumeken's shadow (uncharged)
  "Sanguinesti staff": 22481, // Sanguinesti staff (uncharged)
  "Scythe of vitur": 22486, // Scythe of vitur (uncharged)
  "Trident of the seas": 11908, // Uncharged trident
  "Trident of the seas (e)": 22290, // Uncharged trident (e)
  "Trident of the swamp": 12900, // Uncharged toxic trident
  "Trident of the swamp (e)": 22294, // Uncharged toxic trident (e)
  "Toxic blowpipe": 12924, // Toxic blowpipe (empty)
  "Bow of faerdhinen": 25862, // Bow of faerdhinen (inactive)
  "Bow of faerdhinen (c)": 25862, // Bow of faerdhinen (inactive)
  "Craw's bow": 22547, // Craw's bow (u)
  "Webweaver bow": 27652, // Webweaver bow (u)
  "Ursine chainmace": 27657, // Ursine chainmace (u)
  "Viggora's chainmace": 22542, // Viggora's chainmace (u)
  "Accursed sceptre": 27662, // Accursed sceptre (u)
  "Thammaron's sceptre": 22552, // Thammaron's sceptre (u)
  "Serpentine helm": 12929, // Serpentine helm (uncharged)
};

/**
 * charged catalog item id → GE item id of its uncharged (tradeable) form.
 * Budget mode prices the worn charged item at this uncharged value, and the
 * "owned untradeables" list skips these (they're effectively buyable).
 */
export const UNCHARGED_PRICE_ID: ReadonlyMap<number, number> = new Map(
  ITEM_CATALOG.flatMap((it) => {
    const unchargedId = CHARGED_UNCHARGED_ID[it.name];
    return unchargedId !== undefined ? ([[it.id, unchargedId]] as [number, number][]) : [];
  }),
);
