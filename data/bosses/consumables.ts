// Per-boss recommended inventory, keyed by catalog slug. Same shape as the
// loadout-set library and mechanics registry — add an entry when a boss
// has bespoke inventory advice. Bosses without an entry simply don't show
// a consumables panel (the equipment recommendation is enough).

import type { ConsumableSuggestion } from "@/types/osrs";
import { asItemId } from "@/types/osrs";

const id = (n: number) => asItemId(n);

// ---------- Vorkath ----------
const VORKATH: ConsumableSuggestion[] = [
  { itemId: id(21987), name: "Super antifire (4)", quantity: 1, role: "antifire" },
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 3, role: "prayer" },
  { itemId: id(385), name: "Shark", quantity: 16, role: "food" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 4, role: "food" },
  { itemId: id(12791), name: "Rune pouch", quantity: 1, role: "runes" },
  { itemId: id(2444), name: "Ranging potion (4)", quantity: 1, role: "boost" },
];

// ---------- King Black Dragon ----------
const KBD: ConsumableSuggestion[] = [
  { itemId: id(21987), name: "Super antifire (4)", quantity: 1, role: "antifire" },
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 1, role: "prayer" },
  { itemId: id(385), name: "Shark", quantity: 8, role: "food" },
];

// ---------- Cerberus ----------
const CERBERUS: ConsumableSuggestion[] = [
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 3, role: "prayer" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 1, role: "prayer" },
  { itemId: id(391), name: "Manta ray", quantity: 18, role: "food" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 4, role: "food" },
];

// ---------- Zulrah ----------
const ZULRAH: ConsumableSuggestion[] = [
  { itemId: id(12913), name: "Anti-venom+ (4)", quantity: 1, role: "antivenom" },
  { itemId: id(6685), name: "Saradomin brew (4)", quantity: 8, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 4, role: "prayer" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 6, role: "food" },
  { itemId: id(12791), name: "Rune pouch", quantity: 1, role: "runes" },
];

// ---------- Alchemical Hydra ----------
const HYDRA: ConsumableSuggestion[] = [
  { itemId: id(12913), name: "Anti-venom+ (4)", quantity: 1, role: "antivenom" },
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 4, role: "prayer" },
  { itemId: id(391), name: "Manta ray", quantity: 20, role: "food" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 4, role: "food" },
];

// ---------- GWD shared (4 bosses use the same trip kit) ----------
const GWD_TRIP: ConsumableSuggestion[] = [
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 4, role: "prayer" },
  { itemId: id(385), name: "Shark", quantity: 16, role: "food" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 4, role: "food" },
];

// ---------- Phantom Muspah ----------
const MUSPAH: ConsumableSuggestion[] = [
  { itemId: id(6685), name: "Saradomin brew (4)", quantity: 6, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 4, role: "prayer" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 6, role: "food" },
];

// ---------- Hueycoatl ----------
const HUEYCOATL: ConsumableSuggestion[] = [
  { itemId: id(21987), name: "Super antifire (4)", quantity: 1, role: "antifire" },
  { itemId: id(6685), name: "Saradomin brew (4)", quantity: 4, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 2, role: "prayer" },
];

// ---------- DT2 shared trip ----------
const DT2_TRIP: ConsumableSuggestion[] = [
  { itemId: id(6685), name: "Saradomin brew (4)", quantity: 6, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 4, role: "prayer" },
  { itemId: id(3144), name: "Cooked karambwan", quantity: 6, role: "food" },
];

// ---------- Demonbane bosses ----------
const TORMENTED_DEMON_KIT: ConsumableSuggestion[] = [
  { itemId: id(385), name: "Shark", quantity: 12, role: "food" },
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 2, role: "prayer" },
];

// ---------- Slayer favourites ----------
const KRAKEN_KIT: ConsumableSuggestion[] = [
  { itemId: id(385), name: "Shark", quantity: 4, role: "food" },
];

const GORILLA_KIT: ConsumableSuggestion[] = [
  { itemId: id(391), name: "Manta ray", quantity: 14, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 4, role: "prayer" },
];

const ARAXXOR_KIT: ConsumableSuggestion[] = [
  { itemId: id(12913), name: "Anti-venom+ (4)", quantity: 1, role: "antivenom" },
  { itemId: id(6685), name: "Saradomin brew (4)", quantity: 6, role: "food" },
  { itemId: id(3024), name: "Super restore (4)", quantity: 3, role: "prayer" },
];

const SCURRIUS_KIT: ConsumableSuggestion[] = [
  { itemId: id(385), name: "Shark", quantity: 8, role: "food" },
  { itemId: id(2434), name: "Prayer potion (4)", quantity: 1, role: "prayer" },
];

export const CONSUMABLES_BY_SLUG: Record<string, ConsumableSuggestion[]> = {
  vorkath: VORKATH,
  "king-black-dragon": KBD,
  cerberus: CERBERUS,
  zulrah: ZULRAH,
  "alchemical-hydra": HYDRA,
  "general-graardor": GWD_TRIP,
  kreearra: GWD_TRIP,
  "kril-tsutsaroth": GWD_TRIP,
  "commander-zilyana": GWD_TRIP,
  "phantom-muspah": MUSPAH,
  "the-hueycoatl": HUEYCOATL,
  // DT2
  "duke-sucellus": DT2_TRIP,
  "the-leviathan": DT2_TRIP,
  "the-whisperer": DT2_TRIP,
  vardorvis: DT2_TRIP,
  // Slayer / misc
  kraken: KRAKEN_KIT,
  "demonic-gorilla": GORILLA_KIT,
  araxxor: ARAXXOR_KIT,
  "tormented-demon": TORMENTED_DEMON_KIT,
  scurrius: SCURRIUS_KIT,
};
