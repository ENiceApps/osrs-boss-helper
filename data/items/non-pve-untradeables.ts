// Non-tradeable items that aren't realistic boss gear: PvP / Bounty Hunter
// armour, seasonal/cosmetic re-skins, AND minigame-locked gear that can't leave
// its own content (the Gauntlet's crystalline/corrupted weapons + armour, Castle
// Wars supplies). These matter only for Budget mode, which treats owned
// non-tradeables as free (0 gp) so the optimizer can reach for genuine
// untradeable BIS (Dizana's quiver, Avernic treads, Barrows gloves, Salve
// amulet(ei), …). Without this filter the free-injection also surfaces defunct
// PvP gear (Morrigan's/Vesta's/…), cosmetic clones whose catalog stats are
// duplicated or inflated (e.g. "Barrows gloves (wrapped)" carries a higher
// ranged-attack than the real Barrows gloves; "Avernic treads (max)" doubles the
// magic-strength), and minigame-only items like "Crystal bow (perfected)" that
// exist only inside the Gauntlet — all of which would wrongly out-rank or stand
// in for the real item.
//
// We exclude by name pattern and keep the canonical base item, which stays in
// the catalog with correct stats. Imbued/enchanted forms that ARE real PvE BIS
// — Salve amulet(ei)/(i), Slayer helmet (i), tomes (charged) — are deliberately
// NOT matched here.

import { ITEM_CATALOG } from "@/data/items/catalog";

// Matched parenthetical suffixes are pure cosmetic recolours (identical stats to
// the base item) or defunct PvP / seasonal gear:
//   (b) blessed · (t) trimmed · (g) gold · (or) ornament · (h1–h5) heraldic ·
//   (wrapped) Halloween · (bh) Bounty Hunter · (cr) corrupted · deadman/dmm/beta.
// The real base item (with correct stats) stays in the catalog, so excluding the
// recolour just means the optimizer reaches for the base instead — and for
// cosmetic clones of a TRADEABLE item (e.g. "Dragon hunter crossbow (b)") it
// correctly buys the base rather than treating the recolour as free.
//
// Deliberately NOT listed — these are legit untradeable PvE gear with REAL stat
// differences, not recolours:
//   (i) imbued · (ei)/(e) enchanted · (a) accursed/autocast · (p)/(p+)/(p++) poison ·
//   (et)/(pe)/(pr) Avernic-treads infusions (eternal/pegasian/primordial boots).
// Plus the Ancient Warriors PvP armour sets, matched by name.
const NON_PVE_RE =
  /\((?:b|t|g|or|h[1-5]|wrapped|bh|cr|deadman|dmm|beta)\)|\b(?:morrigan|vesta|statius|zuriel)\b/i;

// Minigame-locked gear that can't be equipped at a boss. The Gauntlet's
// crystalline & corrupted weapons/armour are always tiered (basic/attuned/
// perfected); "(historical)" forms are unobtainable legacy items; plus Castle
// Wars supplies. The REAL usable items (Crystal bow/helm/body/legs, Bow of
// faerdhinen) have no such suffix and stay in the catalog.
const MINIGAME_RE = /\((?:basic|attuned|perfected|historical)\)|\bcastle wars\b/i;

/** Item ids that should never be offered as a free non-tradeable in Budget mode. */
export const NON_PVE_UNTRADEABLE_IDS: ReadonlySet<number> = new Set(
  ITEM_CATALOG.filter((it) => NON_PVE_RE.test(it.name) || MINIGAME_RE.test(it.name)).map(
    (it) => it.id,
  ),
);
