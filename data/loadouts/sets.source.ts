// Universal gear sets, hand-curated. Each set declares an `appliesWhen`
// predicate over target attributes — the recommender filters by it. A set
// curated once here serves every boss that matches the predicate, instead
// of being copy-pasted per-boss as we did originally for Vorkath.
//
// To add a new set: append below, run `npm run build-loadouts` (or just
// `npm run build-data` which chains everything), then verify against the
// wiki DPS tool for at least one target the set applies to.
//
// To curate a NEW boss: usually you don't need anything here — if its
// attributes (e.g. "dragon" + "undead") already match an existing set, it
// gets that set for free. Only add bespoke entries for bosses whose
// optimal loadout has gear / mechanics that no universal set captures.

import type { LoadoutSetSource } from "@/types/loadout";

export const LOADOUT_SETS_SOURCE: LoadoutSetSource[] = [
  // -------- Ranged --------
  {
    id: "ranged-end-dragonbane-undead",
    name: "Endgame Ranged — DHCB + Salve (ei)",
    style: "ranged",
    tier: "end",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    appliesWhen: { requiresAttributes: ["dragon", "undead"] },
    slots: {
      head: { itemId: 27235 }, // Masori mask (f)
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 12018 }, // Salve amulet(ei)
      body: { itemId: 27238 }, // Masori body (f)
      legs: { itemId: 27241 }, // Masori chaps (f)
      hands: { itemId: 26235 }, // Zaryte vambraces
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 28310 }, // Venator ring
      weapon: { itemId: 21012 }, // Dragon hunter crossbow
      ammo: { itemId: 9243 }, // Diamond bolts (e)
      shield: { itemId: 22002, version: "Charged" }, // Dragonfire ward
    },
    slotLabels: {
      head: "Masori mask (f)",
      cape: "Ava's assembler",
      neck: "Salve amulet(ei)",
      body: "Masori body (f)",
      legs: "Masori chaps (f)",
      hands: "Zaryte vambraces",
      feet: "Pegasian boots",
      ring: "Venator ring",
      weapon: "Dragon hunter crossbow",
      ammo: "Diamond bolts (e)",
      shield: "Dragonfire ward",
    },
    ammoQuantity: 200,
    notes:
      "Best vs dragon+undead targets (Vorkath). At non-undead dragons, swap Salve(ei) for Necklace of anguish.",
  },
  {
    id: "ranged-mid-dragonbane",
    name: "Mid Ranged — DHCB + Armadyl",
    style: "ranged",
    tier: "mid",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    appliesWhen: { requiresAttributes: ["dragon"] },
    slots: {
      head: { itemId: 11826 }, // Armadyl helmet
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 19547 }, // Necklace of anguish
      body: { itemId: 11828 }, // Armadyl chestplate
      legs: { itemId: 11830 }, // Armadyl chainskirt
      hands: { itemId: 7462 }, // Barrows gloves
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 6733 }, // Archers ring
      weapon: { itemId: 21012 }, // Dragon hunter crossbow
      ammo: { itemId: 9243 }, // Diamond bolts (e)
      shield: { itemId: 11283, version: "Charged" }, // Dragonfire shield
    },
    slotLabels: {
      head: "Armadyl helmet",
      cape: "Ava's assembler",
      neck: "Necklace of anguish",
      body: "Armadyl chestplate",
      legs: "Armadyl chainskirt",
      hands: "Barrows gloves",
      feet: "Pegasian boots",
      ring: "Archers ring",
      weapon: "Dragon hunter crossbow",
      ammo: "Diamond bolts (e)",
      shield: "Dragonfire shield",
    },
    ammoQuantity: 200,
  },
  {
    id: "ranged-entry-universal",
    name: "Entry Ranged — Rune crossbow",
    style: "ranged",
    tier: "entry",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    // Applies to any target — useful starter ranged kit.
    appliesWhen: {},
    slots: {
      head: { itemId: 11865 }, // Slayer helmet (i)
      cape: { itemId: 10499 }, // Ava's accumulator
      neck: { itemId: 6585 }, // Amulet of fury
      body: { itemId: 2503 }, // Black d'hide body
      legs: { itemId: 2497 }, // Black d'hide chaps
      hands: { itemId: 2491 }, // Black d'hide vambraces
      feet: { itemId: 6328 }, // Snakeskin boots
      ring: { itemId: 6733 }, // Archers ring
      weapon: { itemId: 9185 }, // Rune crossbow
      ammo: { itemId: 9242 }, // Ruby bolts (e)
      shield: { itemId: 1540 }, // Anti-dragon shield
    },
    slotLabels: {
      head: "Slayer helmet (i)",
      cape: "Ava's accumulator",
      neck: "Amulet of fury",
      body: "Black d'hide body",
      legs: "Black d'hide chaps",
      hands: "Black d'hide vambraces",
      feet: "Snakeskin boots",
      ring: "Archers ring",
      weapon: "Rune crossbow",
      ammo: "Ruby bolts (e)",
      shield: "Anti-dragon shield",
    },
    ammoQuantity: 250,
    notes: "Ruby bolts (e) procs cap at 100 damage — strong vs high-HP bosses while gearing up.",
  },

  // -------- Magic --------
  {
    id: "magic-end-fire",
    name: "Endgame Magic — Harmonised + Tome of Fire",
    style: "magic",
    tier: "end",
    attackType: "magic",
    attackStyleChoice: "longrange",
    appliesWhen: { weaknessElement: "fire" },
    slots: {
      head: { itemId: 21018 }, // Ancestral hat
      cape: { itemId: 21791, version: "Normal" }, // Imbued saradomin cape
      neck: { itemId: 12002 }, // Occult necklace
      body: { itemId: 21021 }, // Ancestral robe top
      legs: { itemId: 21024 }, // Ancestral robe bottom
      hands: { itemId: 19544 }, // Tormented bracelet
      feet: { itemId: 13235 }, // Eternal boots
      ring: { itemId: 28313 }, // Magus ring
      weapon: { itemId: 24423 }, // Harmonised nightmare staff
      shield: { itemId: 20714, version: "Charged" }, // Tome of fire
    },
    slotLabels: {
      head: "Ancestral hat",
      cape: "Imbued saradomin cape",
      neck: "Occult necklace",
      body: "Ancestral robe top",
      legs: "Ancestral robe bottom",
      hands: "Tormented bracelet",
      feet: "Eternal boots",
      ring: "Magus ring",
      weapon: "Harmonised nightmare staff",
      shield: "Tome of fire",
    },
    baseSpellMaxHit: 24, // Fire Surge
    spellElement: "fire",
    attackSpeedTicksOverride: 4, // Harmonised reduces standard cast 5→4 ticks.
    notes: "Cast Fire Surge. +50% magic damage on fire spells from tome; +40% from Vorkath fire weakness.",
  },

  // -------- Ranged (universal endgame, no dragonbane requirement) --------
  {
    id: "ranged-end-universal-tbow",
    name: "Endgame Ranged — Twisted bow",
    style: "ranged",
    tier: "end",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    appliesWhen: {}, // Universal; scales with target magic level — strong vs high-magic targets.
    slots: {
      head: { itemId: 27235 }, // Masori mask (f)
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 19547 }, // Necklace of anguish
      body: { itemId: 27238 }, // Masori body (f)
      legs: { itemId: 27241 }, // Masori chaps (f)
      hands: { itemId: 26235 }, // Zaryte vambraces
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 28310 }, // Venator ring
      weapon: { itemId: 20997 }, // Twisted bow
      ammo: { itemId: 11212, version: "Unpoisoned" }, // Dragon arrow
      // 2H — no shield.
    },
    slotLabels: {
      head: "Masori mask (f)",
      cape: "Ava's assembler",
      neck: "Necklace of anguish",
      body: "Masori body (f)",
      legs: "Masori chaps (f)",
      hands: "Zaryte vambraces",
      feet: "Pegasian boots",
      ring: "Venator ring",
      weapon: "Twisted bow",
      ammo: "Dragon arrow",
    },
    notes:
      "Tbow's accuracy and damage scale with target magic level (capped at 140% acc / 250% dmg). Best vs high-magic targets — Cox bosses, Sire, Kraken, Wardens.",
  },
  {
    // Tbow + Salve(ei) — discovered via the bank optimizer (Phase 2), wiki-verified
    // at 8.058 DPS on Vorkath. The Tbow's per-shot damage × Salve(ei) ×6/5 multiplier
    // outperforms DHCB + Salve(ei) at 7.77 — the engine applies Tbow scaling AFTER
    // Salve per wgloop's order of operations. Specialized predicate: dragon + undead,
    // i.e. Vorkath specifically (no other monster fits both today).
    id: "ranged-end-dragonbane-undead-tbow",
    name: "Endgame Ranged — Twisted bow + Salve (ei)",
    style: "ranged",
    tier: "end",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    appliesWhen: { requiresAttributes: ["dragon", "undead"] },
    slots: {
      head: { itemId: 27235 }, // Masori mask (f)
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 12018 }, // Salve amulet(ei)
      body: { itemId: 27238 }, // Masori body (f)
      legs: { itemId: 27241 }, // Masori chaps (f)
      hands: { itemId: 26235 }, // Zaryte vambraces
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 28310 }, // Venator ring
      weapon: { itemId: 20997 }, // Twisted bow
      ammo: { itemId: 11212, version: "Unpoisoned" }, // Dragon arrow
      // 2H — no shield.
    },
    slotLabels: {
      head: "Masori mask (f)",
      cape: "Ava's assembler",
      neck: "Salve amulet(ei)",
      body: "Masori body (f)",
      legs: "Masori chaps (f)",
      hands: "Zaryte vambraces",
      feet: "Pegasian boots",
      ring: "Venator ring",
      weapon: "Twisted bow",
      ammo: "Dragon arrow",
    },
    notes:
      "Tbow + Salve(ei) on Vorkath: wiki-verified 8.058 DPS — beats DHCB+Salve (7.77) because Tbow scaling stacks multiplicatively with Salve's ×6/5. Surfaced by the bank optimizer (Phase 2).",
  },
  {
    id: "ranged-end-universal-bofa",
    name: "Endgame Ranged — Bow of Faerdhinen + Crystal armour",
    style: "ranged",
    tier: "end",
    attackType: "ranged",
    attackStyleChoice: "rapid",
    appliesWhen: {}, // Universal — works on every boss; outranked vs dragons by DHCB sets.
    slots: {
      head: { itemId: 23971, version: "Active" }, // Crystal helm
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 19547 }, // Necklace of anguish
      body: { itemId: 23975, version: "Active" }, // Crystal body
      legs: { itemId: 23979, version: "Active" }, // Crystal legs
      hands: { itemId: 26235 }, // Zaryte vambraces
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 28310 }, // Venator ring
      weapon: { itemId: 25867 }, // Bow of faerdhinen (c)
      // No ammo: BoFA fires its own crystal arrows.
    },
    slotLabels: {
      head: "Crystal helm",
      cape: "Ava's assembler",
      neck: "Necklace of anguish",
      body: "Crystal body",
      legs: "Crystal legs",
      hands: "Zaryte vambraces",
      feet: "Pegasian boots",
      ring: "Venator ring",
      weapon: "Bow of faerdhinen (c)",
    },
    notes:
      "BoFA + Crystal armour set bonus = +100% accuracy and damage on the bow (already baked into vendor stats). 2H — no shield slot.",
  },

  // -------- Ranged (low-def specialist: Blowpipe) --------
  {
    id: "ranged-end-universal-blowpipe",
    name: "Endgame Ranged — Toxic blowpipe",
    style: "ranged",
    tier: "end",
    attackType: "ranged",
    attackStyleChoice: "rapid", // Speeds 3→2 ticks. Devastating on low-def targets.
    appliesWhen: {}, // Universal; outranks Tbow/DHCB only on very low-def targets.
    slots: {
      head: { itemId: 27235 }, // Masori mask (f)
      cape: { itemId: 22109, version: "Normal" }, // Ava's assembler
      neck: { itemId: 19547 }, // Necklace of anguish
      body: { itemId: 27238 }, // Masori body (f)
      legs: { itemId: 27241 }, // Masori chaps (f)
      hands: { itemId: 26235 }, // Zaryte vambraces
      feet: { itemId: 13237 }, // Pegasian boots
      ring: { itemId: 28310 }, // Venator ring
      weapon: { itemId: 12926, version: "Charged" }, // Toxic blowpipe
      // We model the dart in the ammo slot to sum its strength. In game the
      // dart is loaded INTO the blowpipe (no ammo slot occupied). The codegen
      // & DPS math come out right; the EquipmentPanel UI shows the dart in
      // the ammo cell which is fine for our purposes.
      ammo: { itemId: 11230, version: "Unpoisoned" }, // Dragon dart
    },
    slotLabels: {
      head: "Masori mask (f)",
      cape: "Ava's assembler",
      neck: "Necklace of anguish",
      body: "Masori body (f)",
      legs: "Masori chaps (f)",
      hands: "Zaryte vambraces",
      feet: "Pegasian boots",
      ring: "Venator ring",
      weapon: "Toxic blowpipe",
      ammo: "Dragon dart",
    },
    notes:
      "Blowpipe heals 25% of damage dealt (passive, not modelled in DPS). 2-tick attack speed under Rapid makes it BIS for very low-defence targets like Demonic gorillas, Hydra (post-electric phase), Vasa.",
  },

  // -------- Magic (universal endgame, no fire-spell requirement) --------
  {
    id: "magic-end-universal",
    name: "Endgame Magic — Harmonised Nightmare staff",
    style: "magic",
    tier: "end",
    attackType: "magic",
    attackStyleChoice: "longrange",
    appliesWhen: {}, // Universal; outranked vs fire-weak by Tome-of-Fire variant.
    slots: {
      head: { itemId: 21018 }, // Ancestral hat
      cape: { itemId: 21791, version: "Normal" }, // Imbued saradomin cape
      neck: { itemId: 12002 }, // Occult necklace
      body: { itemId: 21021 }, // Ancestral robe top
      legs: { itemId: 21024 }, // Ancestral robe bottom
      hands: { itemId: 19544 }, // Tormented bracelet
      feet: { itemId: 13235 }, // Eternal boots
      ring: { itemId: 28313 }, // Magus ring
      weapon: { itemId: 24423 }, // Harmonised nightmare staff
      // No shield: drop the tome since the +10% bonus only matters vs fire-weak targets.
    },
    slotLabels: {
      head: "Ancestral hat",
      cape: "Imbued saradomin cape",
      neck: "Occult necklace",
      body: "Ancestral robe top",
      legs: "Ancestral robe bottom",
      hands: "Tormented bracelet",
      feet: "Eternal boots",
      ring: "Magus ring",
      weapon: "Harmonised nightmare staff",
    },
    baseSpellMaxHit: 24, // Assume Fire/Wave Surge tier — caller can swap.
    attackSpeedTicksOverride: 4, // Harmonised reduces standard cast 5→4 ticks.
    notes: "No elemental tome — generic high-tier magic kit for non-fire-weak targets.",
  },

  // -------- Melee --------
  {
    id: "melee-end-universal-scythe",
    name: "Endgame Melee — Scythe of Vitur",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive",
    appliesWhen: {}, // Universal slash — BIS generalist melee for most bosses.
    slots: {
      head: { itemId: 26382, version: "Restored" }, // Torva full helm
      cape: { itemId: 21295, version: "Normal" }, // Infernal cape
      neck: { itemId: 19553 }, // Amulet of torture
      body: { itemId: 26384, version: "Restored" }, // Torva platebody
      legs: { itemId: 26386, version: "Restored" }, // Torva platelegs
      hands: { itemId: 22981 }, // Ferocious gloves
      feet: { itemId: 13239 }, // Primordial boots
      ring: { itemId: 28307 }, // Ultor ring
      weapon: { itemId: 22325, version: "Charged" }, // Scythe of Vitur
      // No shield: Scythe is 2H.
    },
    slotLabels: {
      head: "Torva full helm",
      cape: "Infernal cape",
      neck: "Amulet of torture",
      body: "Torva platebody",
      legs: "Torva platelegs",
      hands: "Ferocious gloves",
      feet: "Primordial boots",
      ring: "Ultor ring",
      weapon: "Scythe of vitur",
    },
    notes:
      "Scythe hits 3 targets on size-3+ monsters in-game (multiplies effective DPS); our calc shows single-target only.",
  },
  {
    id: "melee-end-universal-fang",
    name: "Endgame Melee — Osmumten's fang",
    style: "melee",
    tier: "end",
    attackType: "stab",
    attackStyleChoice: "aggressive", // Lunge — Fang has true Aggressive stab.
    appliesWhen: {}, // Universal stab — best on stab-weak bosses.
    slots: {
      head: { itemId: 26382, version: "Restored" }, // Torva full helm
      cape: { itemId: 21295, version: "Normal" }, // Infernal cape
      neck: { itemId: 19553 }, // Amulet of torture
      body: { itemId: 26384, version: "Restored" }, // Torva platebody
      legs: { itemId: 26386, version: "Restored" }, // Torva platelegs
      hands: { itemId: 22981 }, // Ferocious gloves
      feet: { itemId: 13239 }, // Primordial boots
      ring: { itemId: 28307 }, // Ultor ring
      weapon: { itemId: 26219 }, // Osmumten's fang
      shield: { itemId: 22322, version: "Normal" }, // Avernic defender
    },
    slotLabels: {
      head: "Torva full helm",
      cape: "Infernal cape",
      neck: "Amulet of torture",
      body: "Torva platebody",
      legs: "Torva platelegs",
      hands: "Ferocious gloves",
      feet: "Primordial boots",
      ring: "Ultor ring",
      weapon: "Osmumten's fang",
      shield: "Avernic defender",
    },
    notes:
      "Fang's passive re-rolls low accuracy rolls — gives effective accuracy higher than the raw number suggests. Not modelled here; underestimates DPS slightly.",
  },
  {
    id: "melee-mid-universal-whip",
    name: "Mid Melee — Abyssal whip + Bandos",
    style: "melee",
    tier: "mid",
    attackType: "slash",
    attackStyleChoice: "controlled", // Lash — whip has no Aggressive.
    appliesWhen: {}, // Universal — solid mid-tier melee kit.
    slots: {
      head: { itemId: 24271 }, // Neitiznot faceguard
      cape: { itemId: 21295, version: "Normal" }, // Infernal cape
      neck: { itemId: 19553 }, // Amulet of torture
      body: { itemId: 11832 }, // Bandos chestplate
      legs: { itemId: 11834 }, // Bandos tassets
      hands: { itemId: 7462 }, // Barrows gloves
      feet: { itemId: 13239 }, // Primordial boots
      ring: { itemId: 11773 }, // Berserker ring (i)
      weapon: { itemId: 4151 }, // Abyssal whip
      shield: { itemId: 12954, version: "Normal" }, // Dragon defender
    },
    slotLabels: {
      head: "Neitiznot faceguard",
      cape: "Infernal cape",
      neck: "Amulet of torture",
      body: "Bandos chestplate",
      legs: "Bandos tassets",
      hands: "Barrows gloves",
      feet: "Primordial boots",
      ring: "Berserker ring (i)",
      weapon: "Abyssal whip",
      shield: "Dragon defender",
    },
    notes: "Solid pre-Scythe melee setup. Lash style is +1 atk/+1 str — Whip has no Aggressive option.",
  },

  // -------- Melee (universal endgame — slash with Soulreaper) --------
  {
    id: "melee-end-universal-soulreaper",
    name: "Endgame Melee — Soulreaper axe",
    style: "melee",
    tier: "end",
    attackType: "slash",
    attackStyleChoice: "aggressive", // Hack — Axe has true Aggressive slash.
    appliesWhen: {}, // Universal slash; gains +6% damage per stack (max 5, not modelled).
    slots: {
      head: { itemId: 26382, version: "Restored" }, // Torva full helm
      cape: { itemId: 21295, version: "Normal" }, // Infernal cape
      neck: { itemId: 19553 }, // Amulet of torture
      body: { itemId: 26384, version: "Restored" }, // Torva platebody
      legs: { itemId: 26386, version: "Restored" }, // Torva platelegs
      hands: { itemId: 22981 }, // Ferocious gloves
      feet: { itemId: 13239 }, // Primordial boots
      ring: { itemId: 28307 }, // Ultor ring
      weapon: { itemId: 28338 }, // Soulreaper axe
      // 2H — no shield.
    },
    slotLabels: {
      head: "Torva full helm",
      cape: "Infernal cape",
      neck: "Amulet of torture",
      body: "Torva platebody",
      legs: "Torva platelegs",
      hands: "Ferocious gloves",
      feet: "Primordial boots",
      ring: "Ultor ring",
      weapon: "Soulreaper axe",
    },
    notes:
      "Soulreaper gains +6% damage per stack (max 5 stacks = +30%), spent by self-damage. Our calc shows the un-stacked base damage. Practical DPS is ~+15–20% higher in real combat.",
  },

  // -------- Melee (dragonbane endgame, kept here so the file groups by tier) --------
  {
    id: "melee-end-dragonbane",
    name: "Endgame Melee — DHL + Bandos",
    style: "melee",
    tier: "end",
    attackType: "stab",
    attackStyleChoice: "controlled",
    appliesWhen: { requiresAttributes: ["dragon"] },
    slots: {
      head: { itemId: 24271 }, // Neitiznot faceguard
      cape: { itemId: 21295, version: "Normal" }, // Infernal cape
      neck: { itemId: 19553 }, // Amulet of torture
      body: { itemId: 11832 }, // Bandos chestplate
      legs: { itemId: 11834 }, // Bandos tassets
      hands: { itemId: 22981 }, // Ferocious gloves
      feet: { itemId: 13239 }, // Primordial boots
      ring: { itemId: 28307 }, // Ultor ring
      weapon: { itemId: 22978 }, // Dragon hunter lance
      shield: { itemId: 22002, version: "Charged" }, // Dragonfire ward
    },
    slotLabels: {
      head: "Neitiznot faceguard",
      cape: "Infernal cape",
      neck: "Amulet of torture",
      body: "Bandos chestplate",
      legs: "Bandos tassets",
      hands: "Ferocious gloves",
      feet: "Primordial boots",
      ring: "Ultor ring",
      weapon: "Dragon hunter lance",
      shield: "Dragonfire ward",
    },
    notes: "Lunge style (Controlled stab) — Spears have no Aggressive option.",
  },
];

/** Item IDs we check for at recommend time to set ItemBonusFlags. Centralised so it's easy to extend. */
export const BONUS_TRIGGER_ITEM_IDS = {
  DRAGON_HUNTER_CROSSBOW: 21012,
  DRAGON_HUNTER_LANCE: 22978,
  SALVE_AMULET_EI: 12018, // enchanted imbued → ×6/5
  SALVE_AMULET_E: 10588, // enchanted (non-imbued) → ×6/5
  SALVE_AMULET: 4081, // base → ×7/6
  SALVE_AMULET_I: 12017, // imbued (non-enchanted) → ×7/6
  ARCLIGHT: 19675, // Charged → demonbane
  EMBERLIGHT: 29589, // demonbane
  TOME_OF_FIRE_CHARGED: 20714,
  TWISTED_BOW: 20997,
} as const;
