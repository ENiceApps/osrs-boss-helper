// GENERATED FILE — do not edit by hand.
// Run `npm run build-loadouts` to regenerate from data/loadouts/sets.source.ts
// and the vendored weirdgloop dataset under data/vendor/wgloop/.
// Last generated: 2026-06-05T14:26:25.647Z

import type { LoadoutSet } from "@/types/loadout";

export const LOADOUT_SETS: LoadoutSet[] = [
  {
    "id": "ranged-end-dragonbane-undead",
    "name": "Endgame Ranged — DHCB + Salve (ei)",
    "style": "ranged",
    "tier": "end",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {
      "requiresAttributes": [
        "dragon",
        "undead"
      ]
    },
    "slots": {
      "head": {
        "itemId": 27235,
        "itemName": "Masori mask (f)"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 12018,
        "itemName": "Salve amulet(ei)"
      },
      "body": {
        "itemId": 27238,
        "itemName": "Masori body (f)"
      },
      "legs": {
        "itemId": 27241,
        "itemName": "Masori chaps (f)"
      },
      "hands": {
        "itemId": 26235,
        "itemName": "Zaryte vambraces"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 28310,
        "itemName": "Venator ring"
      },
      "weapon": {
        "itemId": 21012,
        "itemName": "Dragon hunter crossbow"
      },
      "ammo": {
        "itemId": 9243,
        "itemName": "Diamond bolts (e)"
      },
      "shield": {
        "itemId": 22002,
        "itemName": "Dragonfire ward",
        "version": "Charged"
      }
    },
    "totals": {
      "attackBonus": 240,
      "strengthBonus": 128
    },
    "attackSpeedTicks": 6,
    "ammoQuantity": 200,
    "notes": "Best vs dragon+undead targets (Vorkath). At non-undead dragons, swap Salve(ei) for Necklace of anguish.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": true,
      "dragonHunterLance": false,
      "salveAmuletEi": true,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Crossbow"
  },
  {
    "id": "ranged-mid-dragonbane",
    "name": "Mid Ranged — DHCB + Armadyl",
    "style": "ranged",
    "tier": "mid",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {
      "requiresAttributes": [
        "dragon"
      ]
    },
    "slots": {
      "head": {
        "itemId": 11826,
        "itemName": "Armadyl helmet"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19547,
        "itemName": "Necklace of anguish"
      },
      "body": {
        "itemId": 11828,
        "itemName": "Armadyl chestplate"
      },
      "legs": {
        "itemId": 11830,
        "itemName": "Armadyl chainskirt"
      },
      "hands": {
        "itemId": 7462,
        "itemName": "Barrows gloves"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 6733,
        "itemName": "Archers ring"
      },
      "weapon": {
        "itemId": 21012,
        "itemName": "Dragon hunter crossbow"
      },
      "ammo": {
        "itemId": 9243,
        "itemName": "Diamond bolts (e)"
      },
      "shield": {
        "itemId": 11283,
        "itemName": "Dragonfire shield",
        "version": "Charged"
      }
    },
    "totals": {
      "attackBonus": 204,
      "strengthBonus": 113
    },
    "attackSpeedTicks": 6,
    "ammoQuantity": 200,
    "itemBonusFlags": {
      "dragonHunterCrossbow": true,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Crossbow"
  },
  {
    "id": "ranged-entry-universal",
    "name": "Entry Ranged — Rune crossbow",
    "style": "ranged",
    "tier": "entry",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 11865,
        "itemName": "Slayer helmet (i)"
      },
      "cape": {
        "itemId": 10499,
        "itemName": "Ava's accumulator"
      },
      "neck": {
        "itemId": 6585,
        "itemName": "Amulet of fury"
      },
      "body": {
        "itemId": 2503,
        "itemName": "Black d'hide body"
      },
      "legs": {
        "itemId": 2497,
        "itemName": "Black d'hide chaps"
      },
      "hands": {
        "itemId": 2491,
        "itemName": "Black d'hide vambraces"
      },
      "feet": {
        "itemId": 6328,
        "itemName": "Snakeskin boots"
      },
      "ring": {
        "itemId": 6733,
        "itemName": "Archers ring"
      },
      "weapon": {
        "itemId": 9185,
        "itemName": "Rune crossbow"
      },
      "ammo": {
        "itemId": 9242,
        "itemName": "Ruby bolts (e)"
      },
      "shield": {
        "itemId": 1540,
        "itemName": "Anti-dragon shield"
      }
    },
    "totals": {
      "attackBonus": 172,
      "strengthBonus": 103
    },
    "attackSpeedTicks": 6,
    "ammoQuantity": 250,
    "notes": "Ruby bolts (e) procs cap at 100 damage — strong vs high-HP bosses while gearing up.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Crossbow"
  },
  {
    "id": "magic-end-fire",
    "name": "Endgame Magic — Harmonised + Tome of Fire",
    "style": "magic",
    "tier": "end",
    "attackType": "magic",
    "attackStyleChoice": "longrange",
    "appliesWhen": {
      "weaknessElement": "fire"
    },
    "slots": {
      "head": {
        "itemId": 21018,
        "itemName": "Ancestral hat"
      },
      "cape": {
        "itemId": 21791,
        "itemName": "Imbued saradomin cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 12002,
        "itemName": "Occult necklace"
      },
      "body": {
        "itemId": 21021,
        "itemName": "Ancestral robe top"
      },
      "legs": {
        "itemId": 21024,
        "itemName": "Ancestral robe bottom"
      },
      "hands": {
        "itemId": 19544,
        "itemName": "Tormented bracelet"
      },
      "feet": {
        "itemId": 13235,
        "itemName": "Eternal boots"
      },
      "ring": {
        "itemId": 28313,
        "itemName": "Magus ring"
      },
      "weapon": {
        "itemId": 24423,
        "itemName": "Harmonised nightmare staff"
      },
      "shield": {
        "itemId": 20714,
        "itemName": "Tome of fire",
        "version": "Charged"
      }
    },
    "totals": {
      "attackBonus": 153,
      "strengthBonus": 0,
      "magicDamagePct": 39
    },
    "attackSpeedTicks": 4,
    "baseSpellMaxHit": 24,
    "spellElement": "fire",
    "notes": "Cast Fire Surge. +50% magic damage on fire spells from tome; +40% from Vorkath fire weakness.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": true,
      "twistedBow": false
    },
    "weaponCategory": "Staff"
  },
  {
    "id": "ranged-end-universal-tbow",
    "name": "Endgame Ranged — Twisted bow",
    "style": "ranged",
    "tier": "end",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 27235,
        "itemName": "Masori mask (f)"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19547,
        "itemName": "Necklace of anguish"
      },
      "body": {
        "itemId": 27238,
        "itemName": "Masori body (f)"
      },
      "legs": {
        "itemId": 27241,
        "itemName": "Masori chaps (f)"
      },
      "hands": {
        "itemId": 26235,
        "itemName": "Zaryte vambraces"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 28310,
        "itemName": "Venator ring"
      },
      "weapon": {
        "itemId": 20997,
        "itemName": "Twisted bow"
      },
      "ammo": {
        "itemId": 11212,
        "itemName": "Dragon arrow",
        "version": "Unpoisoned"
      }
    },
    "totals": {
      "attackBonus": 215,
      "strengthBonus": 100
    },
    "attackSpeedTicks": 6,
    "notes": "Tbow's accuracy and damage scale with target magic level (capped at 140% acc / 250% dmg). Best vs high-magic targets — Cox bosses, Sire, Kraken, Wardens.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": true
    },
    "weaponCategory": "Bow"
  },
  {
    "id": "ranged-end-dragonbane-undead-tbow",
    "name": "Endgame Ranged — Twisted bow + Salve (ei)",
    "style": "ranged",
    "tier": "end",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {
      "requiresAttributes": [
        "dragon",
        "undead"
      ]
    },
    "slots": {
      "head": {
        "itemId": 27235,
        "itemName": "Masori mask (f)"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 12018,
        "itemName": "Salve amulet(ei)"
      },
      "body": {
        "itemId": 27238,
        "itemName": "Masori body (f)"
      },
      "legs": {
        "itemId": 27241,
        "itemName": "Masori chaps (f)"
      },
      "hands": {
        "itemId": 26235,
        "itemName": "Zaryte vambraces"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 28310,
        "itemName": "Venator ring"
      },
      "weapon": {
        "itemId": 20997,
        "itemName": "Twisted bow"
      },
      "ammo": {
        "itemId": 11212,
        "itemName": "Dragon arrow",
        "version": "Unpoisoned"
      }
    },
    "totals": {
      "attackBonus": 200,
      "strengthBonus": 95
    },
    "attackSpeedTicks": 6,
    "notes": "Tbow + Salve(ei) on Vorkath: wiki-verified 8.058 DPS — beats DHCB+Salve (7.77) because Tbow scaling stacks multiplicatively with Salve's ×6/5. Surfaced by the bank optimizer (Phase 2).",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": true,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": true
    },
    "weaponCategory": "Bow"
  },
  {
    "id": "ranged-end-universal-bofa",
    "name": "Endgame Ranged — Bow of Faerdhinen + Crystal armour",
    "style": "ranged",
    "tier": "end",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 23971,
        "itemName": "Crystal helm",
        "version": "Active"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19547,
        "itemName": "Necklace of anguish"
      },
      "body": {
        "itemId": 23975,
        "itemName": "Crystal body",
        "version": "Active"
      },
      "legs": {
        "itemId": 23979,
        "itemName": "Crystal legs",
        "version": "Active"
      },
      "hands": {
        "itemId": 26235,
        "itemName": "Zaryte vambraces"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 28310,
        "itemName": "Venator ring"
      },
      "weapon": {
        "itemId": 25867,
        "itemName": "Bow of faerdhinen (c)"
      }
    },
    "totals": {
      "attackBonus": 249,
      "strengthBonus": 118
    },
    "attackSpeedTicks": 5,
    "notes": "BoFA + Crystal armour set bonus = +100% accuracy and damage on the bow (already baked into vendor stats). 2H — no shield slot.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Bow"
  },
  {
    "id": "ranged-end-universal-blowpipe",
    "name": "Endgame Ranged — Toxic blowpipe",
    "style": "ranged",
    "tier": "end",
    "attackType": "ranged",
    "attackStyleChoice": "rapid",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 27235,
        "itemName": "Masori mask (f)"
      },
      "cape": {
        "itemId": 22109,
        "itemName": "Ava's assembler",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19547,
        "itemName": "Necklace of anguish"
      },
      "body": {
        "itemId": 27238,
        "itemName": "Masori body (f)"
      },
      "legs": {
        "itemId": 27241,
        "itemName": "Masori chaps (f)"
      },
      "hands": {
        "itemId": 26235,
        "itemName": "Zaryte vambraces"
      },
      "feet": {
        "itemId": 13237,
        "itemName": "Pegasian boots"
      },
      "ring": {
        "itemId": 28310,
        "itemName": "Venator ring"
      },
      "weapon": {
        "itemId": 12926,
        "itemName": "Toxic blowpipe",
        "version": "Charged"
      },
      "ammo": {
        "itemId": 11230,
        "itemName": "Dragon dart",
        "version": "Unpoisoned"
      }
    },
    "totals": {
      "attackBonus": 175,
      "strengthBonus": 75
    },
    "attackSpeedTicks": 3,
    "notes": "Blowpipe heals 25% of damage dealt (passive, not modelled in DPS). 2-tick attack speed under Rapid makes it BIS for very low-defence targets like Demonic gorillas, Hydra (post-electric phase), Vasa.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Thrown"
  },
  {
    "id": "magic-end-universal",
    "name": "Endgame Magic — Harmonised Nightmare staff",
    "style": "magic",
    "tier": "end",
    "attackType": "magic",
    "attackStyleChoice": "longrange",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 21018,
        "itemName": "Ancestral hat"
      },
      "cape": {
        "itemId": 21791,
        "itemName": "Imbued saradomin cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 12002,
        "itemName": "Occult necklace"
      },
      "body": {
        "itemId": 21021,
        "itemName": "Ancestral robe top"
      },
      "legs": {
        "itemId": 21024,
        "itemName": "Ancestral robe bottom"
      },
      "hands": {
        "itemId": 19544,
        "itemName": "Tormented bracelet"
      },
      "feet": {
        "itemId": 13235,
        "itemName": "Eternal boots"
      },
      "ring": {
        "itemId": 28313,
        "itemName": "Magus ring"
      },
      "weapon": {
        "itemId": 24423,
        "itemName": "Harmonised nightmare staff"
      }
    },
    "totals": {
      "attackBonus": 145,
      "strengthBonus": 0,
      "magicDamagePct": 39
    },
    "attackSpeedTicks": 4,
    "baseSpellMaxHit": 24,
    "notes": "No elemental tome — generic high-tier magic kit for non-fire-weak targets.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Staff"
  },
  {
    "id": "melee-end-universal-scythe",
    "name": "Endgame Melee — Scythe of Vitur",
    "style": "melee",
    "tier": "end",
    "attackType": "slash",
    "attackStyleChoice": "aggressive",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 26382,
        "itemName": "Torva full helm",
        "version": "Restored"
      },
      "cape": {
        "itemId": 21295,
        "itemName": "Infernal cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19553,
        "itemName": "Amulet of torture"
      },
      "body": {
        "itemId": 26384,
        "itemName": "Torva platebody",
        "version": "Restored"
      },
      "legs": {
        "itemId": 26386,
        "itemName": "Torva platelegs",
        "version": "Restored"
      },
      "hands": {
        "itemId": 22981,
        "itemName": "Ferocious gloves"
      },
      "feet": {
        "itemId": 13239,
        "itemName": "Primordial boots"
      },
      "ring": {
        "itemId": 28307,
        "itemName": "Ultor ring"
      },
      "weapon": {
        "itemId": 22325,
        "itemName": "Scythe of vitur",
        "version": "Charged"
      }
    },
    "totals": {
      "attackBonus": 162,
      "strengthBonus": 142
    },
    "attackSpeedTicks": 5,
    "notes": "Scythe hits 3 targets on size-3+ monsters in-game (multiplies effective DPS); our calc shows single-target only.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Scythe"
  },
  {
    "id": "melee-end-universal-fang",
    "name": "Endgame Melee — Osmumten's fang",
    "style": "melee",
    "tier": "end",
    "attackType": "stab",
    "attackStyleChoice": "aggressive",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 26382,
        "itemName": "Torva full helm",
        "version": "Restored"
      },
      "cape": {
        "itemId": 21295,
        "itemName": "Infernal cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19553,
        "itemName": "Amulet of torture"
      },
      "body": {
        "itemId": 26384,
        "itemName": "Torva platebody",
        "version": "Restored"
      },
      "legs": {
        "itemId": 26386,
        "itemName": "Torva platelegs",
        "version": "Restored"
      },
      "hands": {
        "itemId": 22981,
        "itemName": "Ferocious gloves"
      },
      "feet": {
        "itemId": 13239,
        "itemName": "Primordial boots"
      },
      "ring": {
        "itemId": 28307,
        "itemName": "Ultor ring"
      },
      "weapon": {
        "itemId": 26219,
        "itemName": "Osmumten's fang"
      },
      "shield": {
        "itemId": 22322,
        "itemName": "Avernic defender",
        "version": "Normal"
      }
    },
    "totals": {
      "attackBonus": 172,
      "strengthBonus": 178
    },
    "attackSpeedTicks": 5,
    "notes": "Fang's passive re-rolls low accuracy rolls — gives effective accuracy higher than the raw number suggests. Not modelled here; underestimates DPS slightly.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Stab Sword"
  },
  {
    "id": "melee-mid-universal-whip",
    "name": "Mid Melee — Abyssal whip + Bandos",
    "style": "melee",
    "tier": "mid",
    "attackType": "slash",
    "attackStyleChoice": "controlled",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 24271,
        "itemName": "Neitiznot faceguard"
      },
      "cape": {
        "itemId": 21295,
        "itemName": "Infernal cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19553,
        "itemName": "Amulet of torture"
      },
      "body": {
        "itemId": 11832,
        "itemName": "Bandos chestplate"
      },
      "legs": {
        "itemId": 11834,
        "itemName": "Bandos tassets"
      },
      "hands": {
        "itemId": 7462,
        "itemName": "Barrows gloves"
      },
      "feet": {
        "itemId": 13239,
        "itemName": "Primordial boots"
      },
      "ring": {
        "itemId": 11773,
        "itemName": "Berserker ring (i)"
      },
      "weapon": {
        "itemId": 4151,
        "itemName": "Abyssal whip"
      },
      "shield": {
        "itemId": 12954,
        "itemName": "Dragon defender",
        "version": "Normal"
      }
    },
    "totals": {
      "attackBonus": 139,
      "strengthBonus": 143
    },
    "attackSpeedTicks": 4,
    "notes": "Solid pre-Scythe melee setup. Lash style is +1 atk/+1 str — Whip has no Aggressive option.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Whip"
  },
  {
    "id": "melee-end-universal-soulreaper",
    "name": "Endgame Melee — Soulreaper axe",
    "style": "melee",
    "tier": "end",
    "attackType": "slash",
    "attackStyleChoice": "aggressive",
    "appliesWhen": {},
    "slots": {
      "head": {
        "itemId": 26382,
        "itemName": "Torva full helm",
        "version": "Restored"
      },
      "cape": {
        "itemId": 21295,
        "itemName": "Infernal cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19553,
        "itemName": "Amulet of torture"
      },
      "body": {
        "itemId": 26384,
        "itemName": "Torva platebody",
        "version": "Restored"
      },
      "legs": {
        "itemId": 26386,
        "itemName": "Torva platelegs",
        "version": "Restored"
      },
      "hands": {
        "itemId": 22981,
        "itemName": "Ferocious gloves"
      },
      "feet": {
        "itemId": 13239,
        "itemName": "Primordial boots"
      },
      "ring": {
        "itemId": 28307,
        "itemName": "Ultor ring"
      },
      "weapon": {
        "itemId": 28338,
        "itemName": "Soulreaper axe"
      }
    },
    "totals": {
      "attackBonus": 171,
      "strengthBonus": 192
    },
    "attackSpeedTicks": 5,
    "notes": "Soulreaper gains +6% damage per stack (max 5 stacks = +30%), spent by self-damage. Our calc shows the un-stacked base damage. Practical DPS is ~+15–20% higher in real combat.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": false,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Axe"
  },
  {
    "id": "melee-end-dragonbane",
    "name": "Endgame Melee — DHL + Bandos",
    "style": "melee",
    "tier": "end",
    "attackType": "stab",
    "attackStyleChoice": "controlled",
    "appliesWhen": {
      "requiresAttributes": [
        "dragon"
      ]
    },
    "slots": {
      "head": {
        "itemId": 24271,
        "itemName": "Neitiznot faceguard"
      },
      "cape": {
        "itemId": 21295,
        "itemName": "Infernal cape",
        "version": "Normal"
      },
      "neck": {
        "itemId": 19553,
        "itemName": "Amulet of torture"
      },
      "body": {
        "itemId": 11832,
        "itemName": "Bandos chestplate"
      },
      "legs": {
        "itemId": 11834,
        "itemName": "Bandos tassets"
      },
      "hands": {
        "itemId": 22981,
        "itemName": "Ferocious gloves"
      },
      "feet": {
        "itemId": 13239,
        "itemName": "Primordial boots"
      },
      "ring": {
        "itemId": 28307,
        "itemName": "Ultor ring"
      },
      "weapon": {
        "itemId": 22978,
        "itemName": "Dragon hunter lance"
      },
      "shield": {
        "itemId": 22002,
        "itemName": "Dragonfire ward",
        "version": "Charged"
      }
    },
    "totals": {
      "attackBonus": 112,
      "strengthBonus": 129
    },
    "attackSpeedTicks": 4,
    "notes": "Lunge style (Controlled stab) — Spears have no Aggressive option.",
    "itemBonusFlags": {
      "dragonHunterCrossbow": false,
      "dragonHunterLance": true,
      "salveAmuletEi": false,
      "salveAmulet": false,
      "demonbane": false,
      "tomeOfFire": false,
      "twistedBow": false
    },
    "weaponCategory": "Spear"
  }
];

export const LOADOUT_SET_BY_ID: Record<string, LoadoutSet> = Object.fromEntries(
  LOADOUT_SETS.map((s) => [s.id, s]),
);
