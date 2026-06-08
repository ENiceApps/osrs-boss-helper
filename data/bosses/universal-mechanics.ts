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

/**
 * Worn-slot mechanics implied purely by a monster's catalog attributes. Merged
 * on top of any curated mechanics by `mechanicsForBoss`.
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
  return out;
}
