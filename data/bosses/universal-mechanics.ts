// Universal worn-slot mechanics — applied to every monster whose catalog
// attributes imply them, mirroring the universal-loadout `appliesWhen` model.
// This is what gives breadth: instead of curating "dragonfire protection" into
// each dragon by hand, any monster tagged `dragon` + `fiery` gets it.
//
// Curated per-boss mechanics (data/bosses/mechanics.ts) still take priority —
// see `mechanicsForBoss`, which merges these in and de-dupes by id so a boss
// with its own richer dragonfire note keeps it.

import type { MechanicRequirement } from "@/types/osrs";
import { asItemId } from "@/types/osrs";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";

const id = (n: number) => asItemId(n);

// Shared shield-slot items that block dragonfire (paired with a regular
// antifire). Charged + uncharged variants of each.
const DRAGONFIRE_SHIELDS = [
  id(1540), // Anti-dragon shield
  id(11283), id(11284), // Dragonfire shield (charged / uncharged)
  id(22002), id(22003), // Dragonfire ward (charged / uncharged)
];

// Standalone inventory route — a super antifire fully blocks dragonfire and
// leaves the shield slot free for DPS.
const SUPER_ANTIFIRES = [
  [id(21978), id(21981), id(21984), id(21987)], // Super antifire (1-4)
  [id(22209), id(22212), id(22215), id(22218)], // Extended super antifire (1-4)
];

/**
 * Dragonfire protection — reusable across every fire-breathing dragon. Worn
 * route (dragonfire shield/ward in the shield slot) competes with DPS for the
 * slot; inventory route (super antifire) frees it. See lib/setup-mechanics.ts.
 */
export const DRAGONFIRE_PROTECTION: MechanicRequirement = {
  id: "dragonfire-protection",
  label: "Dragonfire protection",
  description:
    "This dragon breathes dragonfire, which hits 50+ unprotected. A Super antifire (or Extended super antifire) fully protects on its own and frees your shield slot for DPS; otherwise equip a dragonfire shield/ward AND drink a regular antifire — a regular antifire alone is not enough.",
  satisfiedBy: { anyOf: SUPER_ANTIFIRES },
  worn: { slot: "shield", items: DRAGONFIRE_SHIELDS },
  remediation:
    "Bring a Super antifire (4) to keep the shield slot free for DPS, or equip a Dragonfire ward/shield together with a regular antifire potion.",
};

// ---- Venom protection ---------------------------------------------------
// Anti-venom and Anti-venom+ potions (all doses) cure and prevent venom.
const ANTI_VENOMS = [
  id(12905), id(12907), id(12909), id(12911), // Anti-venom (4-1)
  id(12913), id(12915), id(12917), id(12919), // Anti-venom+ (4-1)
];
// Charged serpentine-family helms grant full venom immunity while worn.
// (Uncharged variants do NOT — only the charged ids are protection.)
const VENOM_IMMUNITY_HELMS = [
  id(12931), // Serpentine helm (charged)
  id(13197), // Tanzanite helm (charged)
  id(13199), // Magma helm (charged)
];

/**
 * Venom protection. Venom ramps (6→6→8→10→12…) and ignores food, so it can
 * kill outright. An Anti-venom(+) potion is the inventory route; a charged
 * Serpentine/Tanzanite/Magma helm is the worn route (helm slot). Because the
 * worn route competes with DPS for the helm slot, the setup checker warns when
 * a loadout has neither.
 */
export const VENOM_PROTECTION: MechanicRequirement = {
  id: "venom-protection",
  label: "Venom protection",
  description:
    "This boss inflicts venom, which ramps up and ignores your HP — it can kill through food. An Anti-venom (or Anti-venom+) potion cures and prevents it; a charged Serpentine/Tanzanite/Magma helm grants full venom immunity while worn.",
  satisfiedBy: { anyOf: [ANTI_VENOMS] },
  worn: { slot: "head", items: VENOM_IMMUNITY_HELMS },
  remediation:
    "Bring an Anti-venom+ (4), or wear a charged Serpentine/Tanzanite/Magma helm to free your inventory slot.",
};

// ---- Poison protection --------------------------------------------------
// Any antipoison-family potion (or an anti-venom, which also cures poison).
// Poison is a minor, non-lethal nuisance and doesn't constrain gear, so this
// is a pure inventory/potion mechanic (no worn route → never a setup warning).
const POISON_CURES = [
  id(2446), id(175), id(177), id(179), // Antipoison (4-1)
  id(2448), id(181), id(183), id(185), // Superantipoison (4-1)
  id(5943), id(5945), id(5947), id(5949), // Antidote+ (4-1)
  id(5952), id(5954), id(5956), id(5958), // Antidote++ (4-1)
  ...ANTI_VENOMS, // anti-venom cures poison too
];

export const POISON_PROTECTION: MechanicRequirement = {
  id: "poison-protection",
  label: "Poison protection",
  description:
    "This boss can poison you. An Antipoison / Superantipoison / Antidote+ / Antidote++ potion cures and delays it (an Anti-venom works too). Venom-immunity gear also blocks poison.",
  satisfiedBy: { anyOf: [POISON_CURES] },
  remediation: "Bring an Antidote++ (or any antipoison); an Anti-venom also works.",
};

// Bosses that inflict venom / poison. Neither is a catalog attribute, so these
// are curated by slug. Venom implies poison immunity (anti-venom cures both),
// so a venom boss is NOT also listed for poison.
const VENOM_BOSSES: ReadonlySet<string> = new Set([
  "zulrah",
  "alchemical-hydra",
  "araxxor",
]);
const POISON_BOSSES: ReadonlySet<string> = new Set([
  "kalphite-queen",
  "sarachnis",
  "venenatis",
  "spindel",
]);

/**
 * Worn-slot and consumable mechanics implied by a monster's attributes (for
 * dragonfire) or curated slug membership (for venom/poison). Merged on top of
 * any hand-curated mechanics by `mechanicsForBoss`.
 *
 * `dragon` + `fiery` is the precise dragonfire signal: it catches Vorkath, KBD,
 * black/metal/brutal/frost/lava dragons and Galvek, while correctly EXCLUDING
 * dragon-typed monsters that don't breathe standard dragonfire — wyverns (ice
 * breath, where super antifire does nothing), hydras, drakes, and Olm.
 */
export function universalMechanicsFor(monster: MonsterCatalogEntry): MechanicRequirement[] {
  const out: MechanicRequirement[] = [];
  const attrs = monster.attributes;
  if (attrs.includes("dragon") && attrs.includes("fiery")) {
    out.push(DRAGONFIRE_PROTECTION);
  }
  if (VENOM_BOSSES.has(monster.slug)) {
    out.push(VENOM_PROTECTION);
  } else if (POISON_BOSSES.has(monster.slug)) {
    out.push(POISON_PROTECTION);
  }
  return out;
}
