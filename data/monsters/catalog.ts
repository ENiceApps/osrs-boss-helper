// GENERATED FILE — do not edit by hand.
// Run `npm run build-monster-catalog` to regenerate from data/vendor/wgloop/monsters.json.
// Filter: HP >= 200, excluding entries tagged ["Echo","Nightmare Zone"].

export interface MonsterCatalogEntry {
  slug: string;
  name: string;
  version: string;
  combatLevel: number;
  hp: number;
  defenceLevel: number;
  magicLevel: number;
  defenceBonuses: {
    stab: number;
    slash: number;
    crush: number;
    magic: number;
    rangedHeavy: number;
    rangedStandard: number;
    rangedLight: number;
  };
  attributes: string[];
  weakness: { element: string; severity: number } | null;
  image: string;
  size: number;
  maxHitText: string;
}

export const MONSTER_CATALOG: MonsterCatalogEntry[] = [
  {
    "slug": "abhorrent-spectre",
    "name": "Abhorrent spectre",
    "version": "",
    "combatLevel": 253,
    "hp": 250,
    "defenceLevel": 180,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 40,
      "slash": 40,
      "crush": 40,
      "magic": 0,
      "rangedHeavy": 30,
      "rangedStandard": -30,
      "rangedLight": 30
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Abhorrent spectre.png",
    "size": 3,
    "maxHitText": "31"
  },
  {
    "slug": "abomination",
    "name": "Abomination",
    "version": "",
    "combatLevel": 149,
    "hp": 200,
    "defenceLevel": 110,
    "magicLevel": 110,
    "defenceBonuses": {
      "stab": 80,
      "slash": 80,
      "crush": 80,
      "magic": 20,
      "rangedHeavy": 180,
      "rangedStandard": 180,
      "rangedLight": 180
    },
    "attributes": [],
    "weakness": null,
    "image": "Abomination.png",
    "size": 2,
    "maxHitText": "23"
  },
  {
    "slug": "abyssal-portal",
    "name": "Abyssal portal",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 250,
    "defenceLevel": 176,
    "magicLevel": 176,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 60,
      "rangedHeavy": 110,
      "rangedStandard": 140,
      "rangedLight": 140
    },
    "attributes": [
      "xerician"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Abyssal portal.png",
    "size": 4,
    "maxHitText": "0"
  },
  {
    "slug": "abyssal-sire",
    "name": "Abyssal Sire",
    "version": "Phase 1",
    "combatLevel": 350,
    "hp": 425,
    "defenceLevel": 250,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 40,
      "slash": 60,
      "crush": 50,
      "magic": 20,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Abyssal Sire (phase 1).png",
    "size": 6,
    "maxHitText": "66 (Melee)"
  },
  {
    "slug": "adamant-dragon",
    "name": "Adamant dragon",
    "version": "",
    "combatLevel": 338,
    "hp": 295,
    "defenceLevel": 272,
    "magicLevel": 186,
    "defenceBonuses": {
      "stab": 20,
      "slash": 110,
      "crush": 85,
      "magic": 30,
      "rangedHeavy": 65,
      "rangedStandard": 95,
      "rangedLight": 95
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Adamant dragon.png",
    "size": 5,
    "maxHitText": "29 (Melee)"
  },
  {
    "slug": "agrith-na-na",
    "name": "Agrith-Na-Na",
    "version": "",
    "combatLevel": 146,
    "hp": 200,
    "defenceLevel": 82,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 60,
      "magic": 100,
      "rangedHeavy": 60,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Agrith-Na-Na.png",
    "size": 3,
    "maxHitText": "16"
  },
  {
    "slug": "akkha",
    "name": "Akkha",
    "version": "",
    "combatLevel": 337,
    "hp": 400,
    "defenceLevel": 80,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 60,
      "slash": 120,
      "crush": 120,
      "magic": 10,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": null,
    "image": "Akkha.png",
    "size": 3,
    "maxHitText": "55"
  },
  {
    "slug": "alchemical-hydra",
    "name": "Alchemical Hydra",
    "version": "Electric",
    "combatLevel": 426,
    "hp": 1100,
    "defenceLevel": 100,
    "magicLevel": 260,
    "defenceBonuses": {
      "stab": 75,
      "slash": 150,
      "crush": 150,
      "magic": 150,
      "rangedHeavy": 45,
      "rangedStandard": 45,
      "rangedLight": 45
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Alchemical Hydra (electric).png",
    "size": 6,
    "maxHitText": "35 (default)"
  },
  {
    "slug": "amoxliatl",
    "name": "Amoxliatl",
    "version": "",
    "combatLevel": 263,
    "hp": 520,
    "defenceLevel": 80,
    "magicLevel": 170,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 40,
      "magic": 100,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Amoxliatl.png",
    "size": 3,
    "maxHitText": "22 (standard)<br>34 (Icicle Crash)"
  },
  {
    "slug": "ancient-custodian",
    "name": "Ancient Custodian",
    "version": "",
    "combatLevel": 239,
    "hp": 330,
    "defenceLevel": 80,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 50,
      "slash": -30,
      "crush": 80,
      "magic": 0,
      "rangedHeavy": 60,
      "rangedStandard": 5,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Ancient Custodian.png",
    "size": 2,
    "maxHitText": "19"
  },
  {
    "slug": "ancient-wyvern",
    "name": "Ancient Wyvern",
    "version": "",
    "combatLevel": 210,
    "hp": 300,
    "defenceLevel": 150,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 170,
      "rangedHeavy": 90,
      "rangedStandard": 120,
      "rangedLight": 120
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Ancient Wyvern.png",
    "size": 5,
    "maxHitText": "10 (Magic)"
  },
  {
    "slug": "angry-bear",
    "name": "Angry bear",
    "version": "Level 40",
    "combatLevel": 40,
    "hp": 200,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Angry bear (level 40).png",
    "size": 2,
    "maxHitText": "5"
  },
  {
    "slug": "angry-giant-rat",
    "name": "Angry giant rat",
    "version": "Level 45",
    "combatLevel": 45,
    "hp": 200,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Angry giant rat (level 45, 1).png",
    "size": 1,
    "maxHitText": "5"
  },
  {
    "slug": "angry-goblin",
    "name": "Angry goblin",
    "version": "Level 45",
    "combatLevel": 45,
    "hp": 200,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Angry goblin.png",
    "size": 1,
    "maxHitText": "5"
  },
  {
    "slug": "angry-unicorn",
    "name": "Angry unicorn",
    "version": "Level 45",
    "combatLevel": 45,
    "hp": 200,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Angry unicorn.png",
    "size": 2,
    "maxHitText": "5"
  },
  {
    "slug": "araxxor",
    "name": "Araxxor",
    "version": "",
    "combatLevel": 890,
    "hp": 1020,
    "defenceLevel": 135,
    "magicLevel": 190,
    "defenceBonuses": {
      "stab": 160,
      "slash": 75,
      "crush": 15,
      "magic": 237,
      "rangedHeavy": 218,
      "rangedStandard": 218,
      "rangedLight": 218
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Araxxor.png",
    "size": 7,
    "maxHitText": "38 (melee) <br/> 21 (magic) <br/> 34 (ranged)"
  },
  {
    "slug": "arianwyn",
    "name": "Arianwyn",
    "version": "In combat",
    "combatLevel": 212,
    "hp": 300,
    "defenceLevel": 102,
    "magicLevel": 102,
    "defenceBonuses": {
      "stab": 80,
      "slash": 80,
      "crush": 80,
      "magic": 260,
      "rangedHeavy": 180,
      "rangedStandard": 180,
      "rangedLight": 180
    },
    "attributes": [],
    "weakness": null,
    "image": "Arianwyn (Song of the Elves).png",
    "size": 0,
    "maxHitText": "38"
  },
  {
    "slug": "armoured-kraken",
    "name": "Armoured kraken",
    "version": "",
    "combatLevel": 180,
    "hp": 231,
    "defenceLevel": 150,
    "magicLevel": 175,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -63,
      "rangedHeavy": 125,
      "rangedStandard": 125,
      "rangedLight": 175
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Armoured kraken.png",
    "size": 4,
    "maxHitText": "18"
  },
  {
    "slug": "arrav",
    "name": "Arrav",
    "version": "",
    "combatLevel": 339,
    "hp": 600,
    "defenceLevel": 150,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 80,
      "slash": 80,
      "crush": 40,
      "magic": 160,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Arrav.png",
    "size": 1,
    "maxHitText": "30"
  },
  {
    "slug": "artio",
    "name": "Artio",
    "version": "",
    "combatLevel": 320,
    "hp": 450,
    "defenceLevel": 150,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 125,
      "slash": 110,
      "crush": 110,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [],
    "weakness": null,
    "image": "Artio.png",
    "size": 3,
    "maxHitText": "35 (Crush)"
  },
  {
    "slug": "arzinian-avatar-of-magic",
    "name": "Arzinian Avatar of Magic",
    "version": "Invincible",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 130,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Arzinian Avatar of Magic.png",
    "size": 1,
    "maxHitText": "15"
  },
  {
    "slug": "arzinian-avatar-of-ranging",
    "name": "Arzinian Avatar of Ranging",
    "version": "Invincible",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 130,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Arzinian Avatar of Ranging.png",
    "size": 1,
    "maxHitText": "17"
  },
  {
    "slug": "arzinian-avatar-of-strength",
    "name": "Arzinian Avatar of Strength",
    "version": "Invincible",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 120,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Arzinian Avatar of Strength.png",
    "size": 1,
    "maxHitText": "14"
  },
  {
    "slug": "assassin",
    "name": "Assassin",
    "version": "",
    "combatLevel": 262,
    "hp": 400,
    "defenceLevel": 140,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 80,
      "magic": 200,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Assassin.png",
    "size": 1,
    "maxHitText": "39"
  },
  {
    "slug": "assassin-while-guthix-sleeps",
    "name": "Assassin (While Guthix Sleeps)",
    "version": "1",
    "combatLevel": 167,
    "hp": 275,
    "defenceLevel": 70,
    "magicLevel": 30,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 15,
      "magic": 30,
      "rangedHeavy": 30,
      "rangedStandard": 20,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": null,
    "image": "Assassin (While Guthix Sleeps, 1).png",
    "size": 1,
    "maxHitText": "20 (normal)"
  },
  {
    "slug": "avatar-of-creation",
    "name": "Avatar of Creation",
    "version": "",
    "combatLevel": 525,
    "hp": 1500,
    "defenceLevel": 10,
    "magicLevel": 10,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Avatar of Creation.png",
    "size": 5,
    "maxHitText": "54"
  },
  {
    "slug": "avatar-of-destruction",
    "name": "Avatar of Destruction",
    "version": "",
    "combatLevel": 525,
    "hp": 1500,
    "defenceLevel": 10,
    "magicLevel": 10,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Avatar of Destruction.png",
    "size": 5,
    "maxHitText": "54"
  },
  {
    "slug": "ba-ba",
    "name": "Ba-Ba",
    "version": "",
    "combatLevel": 359,
    "hp": 380,
    "defenceLevel": 80,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 80,
      "slash": 160,
      "crush": 240,
      "magic": 280,
      "rangedHeavy": 120,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Ba-Ba.png",
    "size": 5,
    "maxHitText": "24"
  },
  {
    "slug": "balance-elemental",
    "name": "Balance Elemental",
    "version": "Magic",
    "combatLevel": 524,
    "hp": 750,
    "defenceLevel": 275,
    "magicLevel": 275,
    "defenceBonuses": {
      "stab": 5,
      "slash": 0,
      "crush": -40,
      "magic": -40,
      "rangedHeavy": -40,
      "rangedStandard": 0,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": null,
    "image": "Balance Elemental (magic).png",
    "size": 3,
    "maxHitText": "40 (standard)<br>89 (stat-draining)"
  },
  {
    "slug": "basilisk-knight",
    "name": "Basilisk Knight",
    "version": "",
    "combatLevel": 204,
    "hp": 300,
    "defenceLevel": 186,
    "magicLevel": 186,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": -15,
      "magic": 30,
      "rangedHeavy": -15,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk Knight.png",
    "size": 3,
    "maxHitText": "20"
  },
  {
    "slug": "basilisk-sentinel",
    "name": "Basilisk Sentinel",
    "version": "",
    "combatLevel": 358,
    "hp": 520,
    "defenceLevel": 274,
    "magicLevel": 274,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 10,
      "magic": 50,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk Sentinel.png",
    "size": 3,
    "maxHitText": "28 (normal)"
  },
  {
    "slug": "big-evil-chicken",
    "name": "Big Evil Chicken",
    "version": "Annihilation",
    "combatLevel": 1047,
    "hp": 3500,
    "defenceLevel": 25,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": 255,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Big Evil Chicken.png",
    "size": 3,
    "maxHitText": "26"
  },
  {
    "slug": "black-demon",
    "name": "Black demon",
    "version": "Level 188",
    "combatLevel": 188,
    "hp": 200,
    "defenceLevel": 152,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -10,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Black demon.png",
    "size": 3,
    "maxHitText": "17"
  },
  {
    "slug": "black-dragon",
    "name": "Black dragon",
    "version": "Level 247",
    "combatLevel": 247,
    "hp": 250,
    "defenceLevel": 200,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 0,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 10,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Black dragon (3).png",
    "size": 4,
    "maxHitText": "22 (Melee)"
  },
  {
    "slug": "blood-moon",
    "name": "Blood Moon",
    "version": "",
    "combatLevel": 329,
    "hp": 500,
    "defenceLevel": 60,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 100,
      "slash": 0,
      "crush": 100,
      "magic": 500,
      "rangedHeavy": 500,
      "rangedStandard": 500,
      "rangedLight": 500
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "Blood Moon.png",
    "size": 5,
    "maxHitText": "32 total 4+8+20"
  },
  {
    "slug": "blue-moon",
    "name": "Blue Moon",
    "version": "",
    "combatLevel": 329,
    "hp": 500,
    "defenceLevel": 60,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 0,
      "magic": 500,
      "rangedHeavy": 500,
      "rangedStandard": 500,
      "rangedLight": 500
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "Blue Moon.png",
    "size": 5,
    "maxHitText": "32 total 4+8+20"
  },
  {
    "slug": "branda-the-fire-queen",
    "name": "Branda the Fire Queen",
    "version": "",
    "combatLevel": 350,
    "hp": 600,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 12,
      "slash": 12,
      "crush": 0,
      "magic": 700,
      "rangedHeavy": 700,
      "rangedStandard": 700,
      "rangedLight": 700
    },
    "attributes": [
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Branda the Fire Queen.png",
    "size": 3,
    "maxHitText": "26 (Melee)"
  },
  {
    "slug": "brutal-black-dragon",
    "name": "Brutal black dragon",
    "version": "",
    "combatLevel": 318,
    "hp": 315,
    "defenceLevel": 258,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 10,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Brutal black dragon.png",
    "size": 4,
    "maxHitText": "29 (Melee; Magic)"
  },
  {
    "slug": "brutal-blue-dragon",
    "name": "Brutal blue dragon",
    "version": "Catacombs of Kourend",
    "combatLevel": 271,
    "hp": 245,
    "defenceLevel": 198,
    "magicLevel": 198,
    "defenceBonuses": {
      "stab": 0,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 10,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Brutal blue dragon.png",
    "size": 4,
    "maxHitText": "21 (Melee; Magic)"
  },
  {
    "slug": "brutal-red-dragon",
    "name": "Brutal red dragon",
    "version": "",
    "combatLevel": 289,
    "hp": 285,
    "defenceLevel": 198,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 10,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Brutal red dragon.png",
    "size": 4,
    "maxHitText": "22 (Melee; Magic)"
  },
  {
    "slug": "callisto",
    "name": "Callisto",
    "version": "",
    "combatLevel": 470,
    "hp": 1000,
    "defenceLevel": 225,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 150,
      "slash": 130,
      "crush": 125,
      "magic": 0,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Callisto.png",
    "size": 5,
    "maxHitText": "55 (Crush)"
  },
  {
    "slug": "cerberus",
    "name": "Cerberus",
    "version": "",
    "combatLevel": 318,
    "hp": 600,
    "defenceLevel": 100,
    "magicLevel": 220,
    "defenceBonuses": {
      "stab": 50,
      "slash": 100,
      "crush": 25,
      "magic": 65,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Cerberus.png",
    "size": 5,
    "maxHitText": "23"
  },
  {
    "slug": "champion-of-scabaras",
    "name": "Champion of Scabaras",
    "version": "",
    "combatLevel": 379,
    "hp": 600,
    "defenceLevel": 160,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 120,
      "slash": 160,
      "crush": 160,
      "magic": 340,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Champion of Scabaras.png",
    "size": 1,
    "maxHitText": "24"
  },
  {
    "slug": "chaos-elemental",
    "name": "Chaos Elemental",
    "version": "",
    "combatLevel": 305,
    "hp": 250,
    "defenceLevel": 270,
    "magicLevel": 270,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": 70,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Chaos Elemental.png",
    "size": 3,
    "maxHitText": "28"
  },
  {
    "slug": "chaos-fanatic",
    "name": "Chaos Fanatic",
    "version": "",
    "combatLevel": 202,
    "hp": 225,
    "defenceLevel": 220,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 260,
      "slash": 260,
      "crush": 250,
      "magic": 280,
      "rangedHeavy": 80,
      "rangedStandard": 50,
      "rangedLight": 80
    },
    "attributes": [],
    "weakness": null,
    "image": "Chaos Fanatic.png",
    "size": 1,
    "maxHitText": "31"
  },
  {
    "slug": "choke-devil",
    "name": "Choke devil",
    "version": "",
    "combatLevel": 264,
    "hp": 300,
    "defenceLevel": 120,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 25
    },
    "image": "Choke devil.png",
    "size": 2,
    "maxHitText": "24"
  },
  {
    "slug": "colossal-hydra",
    "name": "Colossal Hydra",
    "version": "",
    "combatLevel": 309,
    "hp": 750,
    "defenceLevel": 100,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 100,
      "slash": 200,
      "crush": 200,
      "magic": 200,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "dragon"
    ],
    "weakness": null,
    "image": "Colossal Hydra.png",
    "size": 5,
    "maxHitText": "34"
  },
  {
    "slug": "combat-dummy",
    "name": "Combat dummy",
    "version": "",
    "combatLevel": 1,
    "hp": 10000,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Combat_dummy.png",
    "size": 1,
    "maxHitText": "0"
  },
  {
    "slug": "commander-zilyana",
    "name": "Commander Zilyana",
    "version": "",
    "combatLevel": 596,
    "hp": 255,
    "defenceLevel": 300,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 100,
      "rangedHeavy": 75,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Commander Zilyana.png",
    "size": 2,
    "maxHitText": "27 (melee)"
  },
  {
    "slug": "corporeal-beast",
    "name": "Corporeal Beast",
    "version": "",
    "combatLevel": 785,
    "hp": 2000,
    "defenceLevel": 310,
    "magicLevel": 350,
    "defenceBonuses": {
      "stab": 25,
      "slash": 200,
      "crush": 100,
      "magic": 150,
      "rangedHeavy": 100,
      "rangedStandard": 230,
      "rangedLight": 230
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 10
    },
    "image": "Corporeal Beast.png",
    "size": 5,
    "maxHitText": "33 (Melee)"
  },
  {
    "slug": "corrupted-hunllef",
    "name": "Corrupted Hunllef",
    "version": "",
    "combatLevel": 894,
    "hp": 1000,
    "defenceLevel": 240,
    "magicLevel": 240,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Corrupted Hunllef.png",
    "size": 5,
    "maxHitText": "68"
  },
  {
    "slug": "crazy-archaeologist",
    "name": "Crazy archaeologist",
    "version": "",
    "combatLevel": 204,
    "hp": 225,
    "defenceLevel": 240,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 30,
      "magic": 250,
      "rangedHeavy": 250,
      "rangedStandard": 250,
      "rangedLight": 250
    },
    "attributes": [],
    "weakness": null,
    "image": "Crazy archaeologist.png",
    "size": 1,
    "maxHitText": "14 (standard)"
  },
  {
    "slug": "cruor",
    "name": "Cruor",
    "version": "",
    "combatLevel": 285,
    "hp": 500,
    "defenceLevel": 200,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 100,
      "slash": 25,
      "crush": 100,
      "magic": 150,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Cruor.png",
    "size": 1,
    "maxHitText": "29"
  },
  {
    "slug": "crystalline-hunllef",
    "name": "Crystalline Hunllef",
    "version": "",
    "combatLevel": 674,
    "hp": 600,
    "defenceLevel": 240,
    "magicLevel": 240,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Crystalline Hunllef.png",
    "size": 5,
    "maxHitText": "50+"
  },
  {
    "slug": "dagannoth-prime",
    "name": "Dagannoth Prime",
    "version": "",
    "combatLevel": 303,
    "hp": 255,
    "defenceLevel": 255,
    "magicLevel": 255,
    "defenceBonuses": {
      "stab": 255,
      "slash": 255,
      "crush": 255,
      "magic": 255,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth Prime.png",
    "size": 3,
    "maxHitText": "50"
  },
  {
    "slug": "dagannoth-rex",
    "name": "Dagannoth Rex",
    "version": "",
    "combatLevel": 303,
    "hp": 255,
    "defenceLevel": 255,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 255,
      "slash": 255,
      "crush": 255,
      "magic": 10,
      "rangedHeavy": 255,
      "rangedStandard": 255,
      "rangedLight": 255
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth Rex.png",
    "size": 3,
    "maxHitText": "26"
  },
  {
    "slug": "dagannoth-supreme",
    "name": "Dagannoth Supreme",
    "version": "",
    "combatLevel": 303,
    "hp": 255,
    "defenceLevel": 128,
    "magicLevel": 255,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 255,
      "rangedHeavy": 550,
      "rangedStandard": 550,
      "rangedLight": 550
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth Supreme.png",
    "size": 3,
    "maxHitText": "30"
  },
  {
    "slug": "damien-leucurte",
    "name": "Damien Leucurte",
    "version": "",
    "combatLevel": 204,
    "hp": 217,
    "defenceLevel": 160,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": 30,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "vampyre3"
    ],
    "weakness": null,
    "image": "Damien Leucurte.png",
    "size": 1,
    "maxHitText": "20"
  },
  {
    "slug": "damis",
    "name": "Damis",
    "version": "Second form",
    "combatLevel": 174,
    "hp": 200,
    "defenceLevel": 160,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 80,
      "rangedHeavy": 120,
      "rangedStandard": 120,
      "rangedLight": 120
    },
    "attributes": [],
    "weakness": null,
    "image": "Damis.png",
    "size": 1,
    "maxHitText": "28"
  },
  {
    "slug": "dark-beast",
    "name": "Dark beast",
    "version": "",
    "combatLevel": 182,
    "hp": 220,
    "defenceLevel": 120,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 30,
      "slash": 40,
      "crush": 100,
      "magic": 90,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 60
    },
    "image": "Dark beast.png",
    "size": 3,
    "maxHitText": "17 (melee)"
  },
  {
    "slug": "dawn",
    "name": "Dawn",
    "version": "",
    "combatLevel": 228,
    "hp": 450,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 80,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "flying",
      "golem"
    ],
    "weakness": {
      "element": "earth",
      "severity": 70
    },
    "image": "Dawn.png",
    "size": 4,
    "maxHitText": "15"
  },
  {
    "slug": "demonic-brutus",
    "name": "Demonic Brutus",
    "version": "Brutus",
    "combatLevel": 1224,
    "hp": 750,
    "defenceLevel": 200,
    "magicLevel": 272,
    "defenceBonuses": {
      "stab": 182,
      "slash": 65,
      "crush": 216,
      "magic": 520,
      "rangedHeavy": 110,
      "rangedStandard": 418,
      "rangedLight": 460
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Demonic Brutus.png",
    "size": 3,
    "maxHitText": "43 (Melee)"
  },
  {
    "slug": "demonic-gorilla",
    "name": "Demonic gorilla",
    "version": "1",
    "combatLevel": 275,
    "hp": 380,
    "defenceLevel": 200,
    "magicLevel": 195,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 35
    },
    "image": "Demonic gorilla.png",
    "size": 2,
    "maxHitText": "31 (normal)"
  },
  {
    "slug": "deranged-archaeologist",
    "name": "Deranged archaeologist",
    "version": "",
    "combatLevel": 276,
    "hp": 200,
    "defenceLevel": 280,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 50,
      "magic": 300,
      "rangedHeavy": 300,
      "rangedStandard": 300,
      "rangedLight": 300
    },
    "attributes": [],
    "weakness": null,
    "image": "Deranged archaeologist.png",
    "size": 1,
    "maxHitText": "25 (melee)"
  },
  {
    "slug": "derwen",
    "name": "Derwen",
    "version": "",
    "combatLevel": 235,
    "hp": 320,
    "defenceLevel": 100,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 200,
      "slash": 200,
      "crush": 200,
      "magic": -60,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Derwen.png",
    "size": 3,
    "maxHitText": "43 (Magic)"
  },
  {
    "slug": "dessous",
    "name": "Dessous",
    "version": "",
    "combatLevel": 139,
    "hp": 200,
    "defenceLevel": 99,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 150,
      "crush": 150,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "vampyre1"
    ],
    "weakness": null,
    "image": "Dessous.png",
    "size": 1,
    "maxHitText": "19 (Melee)"
  },
  {
    "slug": "dire-gryphon",
    "name": "Dire gryphon",
    "version": "",
    "combatLevel": 209,
    "hp": 280,
    "defenceLevel": 100,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 10,
      "slash": 20,
      "crush": 40,
      "magic": 150,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Dire gryphon.png",
    "size": 3,
    "maxHitText": "0"
  },
  {
    "slug": "dont-know-what",
    "name": "Don't Know What",
    "version": "",
    "combatLevel": 163,
    "hp": 220,
    "defenceLevel": 160,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Don't Know What.png",
    "size": 3,
    "maxHitText": "10"
  },
  {
    "slug": "doom-of-mokhaiotl",
    "name": "Doom of Mokhaiotl",
    "version": "Delve 8",
    "combatLevel": 908,
    "hp": 675,
    "defenceLevel": 90,
    "magicLevel": 275,
    "defenceBonuses": {
      "stab": 300,
      "slash": 300,
      "crush": 60,
      "magic": 160,
      "rangedHeavy": 160,
      "rangedStandard": 160,
      "rangedLight": 160
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Doom of Mokhaiotl.png",
    "size": 5,
    "maxHitText": "65 <br/>99 (charge)"
  },
  {
    "slug": "drake",
    "name": "Drake",
    "version": "",
    "combatLevel": 192,
    "hp": 225,
    "defenceLevel": 120,
    "magicLevel": 112,
    "defenceBonuses": {
      "stab": 5,
      "slash": 60,
      "crush": 60,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Drake.png",
    "size": 5,
    "maxHitText": "15 (Ranged)"
  },
  {
    "slug": "dreadborn-araxyte",
    "name": "Dreadborn Araxyte",
    "version": "",
    "combatLevel": 281,
    "hp": 350,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 0,
      "magic": 10,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Dreadborn Araxyte.png",
    "size": 3,
    "maxHitText": "31 (normal)"
  },
  {
    "slug": "drink-troll-queen",
    "name": "Drink troll queen",
    "version": "",
    "combatLevel": 217,
    "hp": 315,
    "defenceLevel": 155,
    "magicLevel": 205,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -63,
      "rangedHeavy": 100,
      "rangedStandard": 50,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Drink troll queen.png",
    "size": 5,
    "maxHitText": "21"
  },
  {
    "slug": "duke-sucellus",
    "name": "Duke Sucellus",
    "version": "Awakened, Awake",
    "combatLevel": 1099,
    "hp": 1697,
    "defenceLevel": 316,
    "magicLevel": 465,
    "defenceBonuses": {
      "stab": 255,
      "slash": 65,
      "crush": 190,
      "magic": 440,
      "rangedHeavy": 320,
      "rangedStandard": 320,
      "rangedLight": 320
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Duke Sucellus.png",
    "size": 7,
    "maxHitText": "81 (Melee)"
  },
  {
    "slug": "dusk",
    "name": "Dusk",
    "version": "First form",
    "combatLevel": 248,
    "hp": 450,
    "defenceLevel": 100,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "golem"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Dusk.png",
    "size": 4,
    "maxHitText": "15 (melee) 33 (special attack)"
  },
  {
    "slug": "eclipse-moon",
    "name": "Eclipse Moon",
    "version": "Clone",
    "combatLevel": 329,
    "hp": 500,
    "defenceLevel": 60,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 100,
      "crush": 100,
      "magic": 500,
      "rangedHeavy": 500,
      "rangedStandard": 500,
      "rangedLight": 500
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "Eclipse Moon.png",
    "size": 5,
    "maxHitText": "32 total 4+8+20"
  },
  {
    "slug": "elder-aquanite",
    "name": "Elder aquanite",
    "version": "Lure",
    "combatLevel": 305,
    "hp": 400,
    "defenceLevel": 180,
    "magicLevel": 330,
    "defenceBonuses": {
      "stab": 60,
      "slash": 80,
      "crush": 80,
      "magic": 140,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Elder aquanite (lure).png",
    "size": 3,
    "maxHitText": "34 (normal)"
  },
  {
    "slug": "elder-custodian-stalker",
    "name": "Elder custodian stalker",
    "version": "",
    "combatLevel": 142,
    "hp": 250,
    "defenceLevel": 45,
    "magicLevel": 75,
    "defenceBonuses": {
      "stab": 30,
      "slash": -10,
      "crush": 50,
      "magic": 35,
      "rangedHeavy": -10,
      "rangedStandard": 5,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Elder custodian stalker.png",
    "size": 1,
    "maxHitText": "10 (melee)"
  },
  {
    "slug": "eldric-the-ice-king",
    "name": "Eldric the Ice King",
    "version": "",
    "combatLevel": 350,
    "hp": 600,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 12,
      "slash": 12,
      "crush": 0,
      "magic": 700,
      "rangedHeavy": 700,
      "rangedStandard": 700,
      "rangedLight": 700
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Eldric the Ice King.png",
    "size": 3,
    "maxHitText": "26 (Melee)"
  },
  {
    "slug": "elidinis-warden",
    "name": "Elidinis' Warden",
    "version": "Core-ejected",
    "combatLevel": 489,
    "hp": 4500,
    "defenceLevel": 100,
    "magicLevel": 190,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": -30,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Elidinis' Warden (level-489, core-ejected).png",
    "size": 5,
    "maxHitText": "20"
  },
  {
    "slug": "ennius-tullus",
    "name": "Ennius Tullus",
    "version": "",
    "combatLevel": 306,
    "hp": 380,
    "defenceLevel": 75,
    "magicLevel": 75,
    "defenceBonuses": {
      "stab": 70,
      "slash": 60,
      "crush": 50,
      "magic": 100,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [],
    "weakness": null,
    "image": "Ennius Tullus (combat).png",
    "size": 1,
    "maxHitText": "22"
  },
  {
    "slug": "essyllt",
    "name": "Essyllt",
    "version": "Normal",
    "combatLevel": 236,
    "hp": 320,
    "defenceLevel": 104,
    "magicLevel": 104,
    "defenceBonuses": {
      "stab": 40,
      "slash": 40,
      "crush": 20,
      "magic": 30,
      "rangedHeavy": 120,
      "rangedStandard": 120,
      "rangedLight": 120
    },
    "attributes": [],
    "weakness": null,
    "image": "Essyllt (Song of the Elves).png",
    "size": 1,
    "maxHitText": "40 (melee)"
  },
  {
    "slug": "flambeed",
    "name": "Flambeed",
    "version": "",
    "combatLevel": 149,
    "hp": 210,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 5,
      "magic": 5,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Flambeed.png",
    "size": 5,
    "maxHitText": "25"
  },
  {
    "slug": "fragment-of-seren",
    "name": "Fragment of Seren",
    "version": "",
    "combatLevel": 494,
    "hp": 1000,
    "defenceLevel": 102,
    "magicLevel": 102,
    "defenceBonuses": {
      "stab": 320,
      "slash": 220,
      "crush": 320,
      "magic": 10,
      "rangedHeavy": 480,
      "rangedStandard": 480,
      "rangedLight": 480
    },
    "attributes": [],
    "weakness": null,
    "image": "Fragment of Seren.png",
    "size": 3,
    "maxHitText": "12+12 (standard)"
  },
  {
    "slug": "frost-dragon",
    "name": "Frost dragon",
    "version": "",
    "combatLevel": 202,
    "hp": 230,
    "defenceLevel": 150,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 25,
      "slash": 90,
      "crush": 15,
      "magic": 50,
      "rangedHeavy": 30,
      "rangedStandard": 50,
      "rangedLight": 70
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Frost dragon.png",
    "size": 4,
    "maxHitText": "16 (Stab)<br/>50 (Dragonfire)"
  },
  {
    "slug": "fumus",
    "name": "Fumus",
    "version": "",
    "combatLevel": 285,
    "hp": 500,
    "defenceLevel": 200,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 25,
      "slash": 100,
      "crush": 100,
      "magic": 150,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Fumus.png",
    "size": 1,
    "maxHitText": "29"
  },
  {
    "slug": "galvek",
    "name": "Galvek",
    "version": "Air",
    "combatLevel": 608,
    "hp": 1200,
    "defenceLevel": 188,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 80,
      "slash": 140,
      "crush": 140,
      "magic": 280,
      "rangedHeavy": 86,
      "rangedStandard": 86,
      "rangedLight": 86
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Galvek (air).png",
    "size": 7,
    "maxHitText": "28 (Ranged)"
  },
  {
    "slug": "gelatinnoth-mother",
    "name": "Gelatinnoth Mother",
    "version": "",
    "combatLevel": 130,
    "hp": 240,
    "defenceLevel": 81,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 150,
      "slash": 150,
      "crush": 150,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Gelatinnoth Mother (air).png",
    "size": 3,
    "maxHitText": "9 (melee)"
  },
  {
    "slug": "gemstone-crab",
    "name": "Gemstone Crab",
    "version": "",
    "combatLevel": 160,
    "hp": 50000,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Gemstone Crab.png",
    "size": 5,
    "maxHitText": "1"
  },
  {
    "slug": "general-graardor",
    "name": "General Graardor",
    "version": "",
    "combatLevel": 624,
    "hp": 255,
    "defenceLevel": 250,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 90,
      "slash": 90,
      "crush": 90,
      "magic": 298,
      "rangedHeavy": 90,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "General Graardor.png",
    "size": 4,
    "maxHitText": "60 (melee)"
  },
  {
    "slug": "giant-goblin",
    "name": "Giant goblin",
    "version": "Annihilation",
    "combatLevel": 1022,
    "hp": 3500,
    "defenceLevel": 200,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -15,
      "slash": -15,
      "crush": -15,
      "magic": -15,
      "rangedHeavy": -15,
      "rangedStandard": -15,
      "rangedLight": -15
    },
    "attributes": [],
    "weakness": null,
    "image": "Giant goblin.png",
    "size": 2,
    "maxHitText": "27"
  },
  {
    "slug": "giant-mole",
    "name": "Giant Mole",
    "version": "",
    "combatLevel": 230,
    "hp": 200,
    "defenceLevel": 200,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 60,
      "slash": 80,
      "crush": 100,
      "magic": 80,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Giant Mole.png",
    "size": 3,
    "maxHitText": "21"
  },
  {
    "slug": "giant-roc",
    "name": "Giant Roc",
    "version": "",
    "combatLevel": 172,
    "hp": 250,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 150,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Giant Roc.png",
    "size": 5,
    "maxHitText": "14 (Melee)"
  },
  {
    "slug": "glacies",
    "name": "Glacies",
    "version": "",
    "combatLevel": 285,
    "hp": 500,
    "defenceLevel": 200,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 25,
      "magic": 150,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Glacies.png",
    "size": 1,
    "maxHitText": "29"
  },
  {
    "slug": "glough",
    "name": "Glough",
    "version": "",
    "combatLevel": 431,
    "hp": 575,
    "defenceLevel": 248,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Glough (monster).png",
    "size": 2,
    "maxHitText": "61"
  },
  {
    "slug": "great-olm",
    "name": "Great Olm",
    "version": "Head (Normal)",
    "combatLevel": 1043,
    "hp": 800,
    "defenceLevel": 150,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 200,
      "slash": 200,
      "crush": 200,
      "magic": 200,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "dragon",
      "xerician"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Great Olm.png",
    "size": 5,
    "maxHitText": "27 <br/> 28 <br/> 29 (phase 4)"
  },
  {
    "slug": "great-white-shark",
    "name": "Great white shark",
    "version": "",
    "combatLevel": 175,
    "hp": 243,
    "defenceLevel": 70,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 15,
      "rangedHeavy": 40,
      "rangedStandard": 20,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Great white shark.png",
    "size": 4,
    "maxHitText": "15"
  },
  {
    "slug": "greater-abyssal-demon",
    "name": "Greater abyssal demon",
    "version": "",
    "combatLevel": 342,
    "hp": 400,
    "defenceLevel": 240,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 0,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Greater abyssal demon.png",
    "size": 1,
    "maxHitText": "27"
  },
  {
    "slug": "greater-nechryael",
    "name": "Greater Nechryael",
    "version": "Regular",
    "combatLevel": 200,
    "hp": 205,
    "defenceLevel": 85,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 0,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Greater Nechryael.png",
    "size": 1,
    "maxHitText": "21"
  },
  {
    "slug": "guardian-chambers-of-xeric",
    "name": "Guardian (Chambers of Xeric)",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 250,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 80,
      "slash": 180,
      "crush": -10,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "xerician"
    ],
    "weakness": null,
    "image": "Guardian (Chambers of Xeric, female).png",
    "size": 0,
    "maxHitText": "20"
  },
  {
    "slug": "guardian-drake",
    "name": "Guardian Drake",
    "version": "",
    "combatLevel": 376,
    "hp": 590,
    "defenceLevel": 200,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 20,
      "slash": 100,
      "crush": 100,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Guardian Drake.png",
    "size": 5,
    "maxHitText": "35 (melee)"
  },
  {
    "slug": "hespori",
    "name": "Hespori",
    "version": "",
    "combatLevel": 284,
    "hp": 300,
    "defenceLevel": 120,
    "magicLevel": 126,
    "defenceBonuses": {
      "stab": 60,
      "slash": 20,
      "crush": 60,
      "magic": 80,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Hespori.png",
    "size": 3,
    "maxHitText": "8x2 (Ranged)"
  },
  {
    "slug": "hespori-a-night-at-the-theatre",
    "name": "Hespori (A Night at the Theatre)",
    "version": "",
    "combatLevel": 302,
    "hp": 360,
    "defenceLevel": 120,
    "magicLevel": 126,
    "defenceBonuses": {
      "stab": 60,
      "slash": 20,
      "crush": 60,
      "magic": 80,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [],
    "weakness": null,
    "image": "Hespori (A Night at the Theatre).png",
    "size": 3,
    "maxHitText": "8 (x2) (Ranged)"
  },
  {
    "slug": "hydra",
    "name": "Hydra",
    "version": "",
    "combatLevel": 194,
    "hp": 300,
    "defenceLevel": 100,
    "magicLevel": 210,
    "defenceBonuses": {
      "stab": 160,
      "slash": 160,
      "crush": 160,
      "magic": 160,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Hydra.png",
    "size": 3,
    "maxHitText": "22"
  },
  {
    "slug": "i-dscim-you",
    "name": "I DSCIM YOU",
    "version": "",
    "combatLevel": 495,
    "hp": 1500,
    "defenceLevel": 25,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": 50,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "I DSCIM YOU.png",
    "size": 1,
    "maxHitText": "21"
  },
  {
    "slug": "insatiable-bloodveld",
    "name": "Insatiable Bloodveld",
    "version": "",
    "combatLevel": 202,
    "hp": 290,
    "defenceLevel": 85,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Insatiable Bloodveld.png",
    "size": 3,
    "maxHitText": "15"
  },
  {
    "slug": "insatiable-mutated-bloodveld",
    "name": "Insatiable mutated Bloodveld",
    "version": "",
    "combatLevel": 278,
    "hp": 410,
    "defenceLevel": 130,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Insatiable mutated Bloodveld.png",
    "size": 3,
    "maxHitText": "20"
  },
  {
    "slug": "jal-zek",
    "name": "Jal-Zek",
    "version": "",
    "combatLevel": 490,
    "hp": 220,
    "defenceLevel": 260,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-Zek.png",
    "size": 4,
    "maxHitText": "70 (Magic)"
  },
  {
    "slug": "jaltok-jad",
    "name": "JalTok-Jad",
    "version": "",
    "combatLevel": 900,
    "hp": 350,
    "defenceLevel": 480,
    "magicLevel": 510,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "JalTok-Jad.png",
    "size": 5,
    "maxHitText": "113"
  },
  {
    "slug": "javelin-colossus",
    "name": "Javelin Colossus",
    "version": "",
    "combatLevel": 278,
    "hp": 220,
    "defenceLevel": 190,
    "magicLevel": 225,
    "defenceBonuses": {
      "stab": 15,
      "slash": 15,
      "crush": 15,
      "magic": 20,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": null,
    "image": "Javelin Colossus.png",
    "size": 3,
    "maxHitText": "48"
  },
  {
    "slug": "jhallan",
    "name": "Jhallan",
    "version": "",
    "combatLevel": 491,
    "hp": 1500,
    "defenceLevel": 250,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 200,
      "slash": 200,
      "crush": 200,
      "magic": 300,
      "rangedHeavy": 150,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": null,
    "image": "Jhallan.png",
    "size": 2,
    "maxHitText": "26"
  },
  {
    "slug": "judge-of-yama",
    "name": "Judge of Yama",
    "version": "",
    "combatLevel": 168,
    "hp": 400,
    "defenceLevel": 150,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 15
    },
    "image": "Judge of Yama.png",
    "size": 3,
    "maxHitText": "18 (aoe)"
  },
  {
    "slug": "judge-of-yama-a-kingdom-divided",
    "name": "Judge of Yama (A Kingdom Divided)",
    "version": "",
    "combatLevel": 168,
    "hp": 260,
    "defenceLevel": 84,
    "magicLevel": 84,
    "defenceBonuses": {
      "stab": 40,
      "slash": 40,
      "crush": 40,
      "magic": 600,
      "rangedHeavy": 600,
      "rangedStandard": 600,
      "rangedLight": 600
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Judge of Yama.png",
    "size": 3,
    "maxHitText": "12"
  },
  {
    "slug": "justiciar-zachariah",
    "name": "Justiciar Zachariah",
    "version": "",
    "combatLevel": 348,
    "hp": 320,
    "defenceLevel": 100,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 200,
      "slash": 200,
      "crush": 200,
      "magic": -60,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Justiciar Zachariah.png",
    "size": 3,
    "maxHitText": "43 (melee)"
  },
  {
    "slug": "kril-tsutsaroth",
    "name": "K'ril Tsutsaroth",
    "version": "",
    "combatLevel": 650,
    "hp": 255,
    "defenceLevel": 270,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 70,
      "slash": 80,
      "crush": 80,
      "magic": 80,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 30
    },
    "image": "K'ril Tsutsaroth.png",
    "size": 5,
    "maxHitText": "30 (magic)"
  },
  {
    "slug": "kalphite-queen",
    "name": "Kalphite Queen",
    "version": "Airborne",
    "combatLevel": 333,
    "hp": 255,
    "defenceLevel": 300,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 10,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Kalphite Queen 2nd form.png",
    "size": 5,
    "maxHitText": "31"
  },
  {
    "slug": "karamel",
    "name": "Karamel",
    "version": "",
    "combatLevel": 136,
    "hp": 250,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 150,
      "slash": 150,
      "crush": 150,
      "magic": 150,
      "rangedHeavy": 150,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Karamel.png",
    "size": 1,
    "maxHitText": "7x2 (Magic)"
  },
  {
    "slug": "kasonde",
    "name": "Kasonde",
    "version": "",
    "combatLevel": 231,
    "hp": 240,
    "defenceLevel": 90,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": 250,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Kasonde.png",
    "size": 1,
    "maxHitText": "20"
  },
  {
    "slug": "kasonde-the-craven",
    "name": "Kasonde the Craven",
    "version": "",
    "combatLevel": 221,
    "hp": 200,
    "defenceLevel": 120,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": 250,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "spectral"
    ],
    "weakness": null,
    "image": "Kasonde the Craven.png",
    "size": 1,
    "maxHitText": "22"
  },
  {
    "slug": "ketla-the-unworthy",
    "name": "Ketla the Unworthy",
    "version": "Regular",
    "combatLevel": 236,
    "hp": 200,
    "defenceLevel": 130,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 80,
      "magic": 200,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [
      "spectral"
    ],
    "weakness": null,
    "image": "Ketla the Unworthy.png",
    "size": 1,
    "maxHitText": "18"
  },
  {
    "slug": "king-black-dragon",
    "name": "King Black Dragon",
    "version": "",
    "combatLevel": 276,
    "hp": 240,
    "defenceLevel": 240,
    "magicLevel": 240,
    "defenceBonuses": {
      "stab": 40,
      "slash": 90,
      "crush": 90,
      "magic": 80,
      "rangedHeavy": 40,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "King Black Dragon.png",
    "size": 5,
    "maxHitText": "25 (Melee)"
  },
  {
    "slug": "king-kurask",
    "name": "King kurask",
    "version": "",
    "combatLevel": 295,
    "hp": 270,
    "defenceLevel": 250,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 50,
      "crush": 50,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "leafy"
    ],
    "weakness": null,
    "image": "King kurask.png",
    "size": 5,
    "maxHitText": "33"
  },
  {
    "slug": "king-sand-crab",
    "name": "King Sand Crab",
    "version": "Active",
    "combatLevel": 107,
    "hp": 200,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 15
    },
    "image": "King Sand Crab.png",
    "size": 2,
    "maxHitText": "6"
  },
  {
    "slug": "kob",
    "name": "Kob",
    "version": "",
    "combatLevel": 185,
    "hp": 200,
    "defenceLevel": 80,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 60,
      "slash": 85,
      "crush": 90,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Kob.png",
    "size": 2,
    "maxHitText": "57 (normal)"
  },
  {
    "slug": "koschei-the-deathless",
    "name": "Koschei the deathless",
    "version": "The Fremennik Trials (Form 4)",
    "combatLevel": 0,
    "hp": 255,
    "defenceLevel": 255,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Koschei the deathless.png",
    "size": 1,
    "maxHitText": "1"
  },
  {
    "slug": "kraken",
    "name": "Kraken",
    "version": "Kraken",
    "combatLevel": 291,
    "hp": 255,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 130,
      "rangedHeavy": 300,
      "rangedStandard": 300,
      "rangedLight": 300
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Kraken.png",
    "size": 4,
    "maxHitText": "28"
  },
  {
    "slug": "kreearra",
    "name": "Kree'arra",
    "version": "",
    "combatLevel": 580,
    "hp": 255,
    "defenceLevel": 260,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 180,
      "slash": 180,
      "crush": 180,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [
      "flying"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Kree'arra.png",
    "size": 5,
    "maxHitText": "69 (Ranged)"
  },
  {
    "slug": "kroy",
    "name": "Kroy",
    "version": "",
    "combatLevel": 133,
    "hp": 209,
    "defenceLevel": 80,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "vampyre1"
    ],
    "weakness": null,
    "image": "Kroy.png",
    "size": 1,
    "maxHitText": "15"
  },
  {
    "slug": "kruk",
    "name": "Kruk",
    "version": "",
    "combatLevel": 207,
    "hp": 210,
    "defenceLevel": 150,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 250,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Kruk.png",
    "size": 1,
    "maxHitText": "33 (melee)"
  },
  {
    "slug": "lava-dragon",
    "name": "Lava dragon",
    "version": "",
    "combatLevel": 252,
    "hp": 230,
    "defenceLevel": 220,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 90,
      "crush": 90,
      "magic": 80,
      "rangedHeavy": 20,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Lava dragon.png",
    "size": 4,
    "maxHitText": "23 (Melee)"
  },
  {
    "slug": "long-tailed-wyvern",
    "name": "Long-tailed Wyvern",
    "version": "",
    "combatLevel": 152,
    "hp": 200,
    "defenceLevel": 90,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": 140,
      "rangedHeavy": 70,
      "rangedStandard": 120,
      "rangedLight": 120
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "air",
      "severity": 25
    },
    "image": "Long-tailed Wyvern.png",
    "size": 3,
    "maxHitText": "13 (Melee)"
  },
  {
    "slug": "magic-mark",
    "name": "Magic Mark",
    "version": "Annihilation",
    "combatLevel": 967,
    "hp": 3500,
    "defenceLevel": 30,
    "magicLevel": 175,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": 150,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": null,
    "image": "Magic Mark.png",
    "size": 1,
    "maxHitText": "18"
  },
  {
    "slug": "magma-strykewyrm",
    "name": "Magma strykewyrm",
    "version": "",
    "combatLevel": 249,
    "hp": 340,
    "defenceLevel": 110,
    "magicLevel": 110,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 70,
      "magic": 40,
      "rangedHeavy": 120,
      "rangedStandard": 120,
      "rangedLight": 120
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Magma strykewyrm.png",
    "size": 3,
    "maxHitText": "26"
  },
  {
    "slug": "manticore",
    "name": "Manticore",
    "version": "",
    "combatLevel": 320,
    "hp": 250,
    "defenceLevel": 250,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 10,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": null,
    "image": "Manticore.png",
    "size": 3,
    "maxHitText": "31 (Melee)"
  },
  {
    "slug": "marble-gargoyle",
    "name": "Marble gargoyle",
    "version": "",
    "combatLevel": 349,
    "hp": 270,
    "defenceLevel": 190,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 0,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "golem"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Marble gargoyle.png",
    "size": 3,
    "maxHitText": "26 (melee)\n30 (ranged)\n38 (special)"
  },
  {
    "slug": "menaphite-akh",
    "name": "Menaphite Akh",
    "version": "",
    "combatLevel": 351,
    "hp": 480,
    "defenceLevel": 140,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 5,
      "slash": 30,
      "crush": 30,
      "magic": 280,
      "rangedHeavy": 180,
      "rangedStandard": 180,
      "rangedLight": 180
    },
    "attributes": [],
    "weakness": null,
    "image": "Menaphite Akh.png",
    "size": 1,
    "maxHitText": "? (melee)"
  },
  {
    "slug": "metzli-teokan-of-ranul",
    "name": "Metzli, Teokan of Ranul",
    "version": "",
    "combatLevel": 396,
    "hp": 600,
    "defenceLevel": 160,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 60,
      "slash": 80,
      "crush": 70,
      "magic": 100,
      "rangedHeavy": 10,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Augur Metzli.png",
    "size": 1,
    "maxHitText": "28"
  },
  {
    "slug": "minotaur-fortis-colosseum",
    "name": "Minotaur (Fortis Colosseum)",
    "version": "Normal",
    "combatLevel": 318,
    "hp": 225,
    "defenceLevel": 190,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 12,
      "rangedStandard": 12,
      "rangedLight": 12
    },
    "attributes": [],
    "weakness": null,
    "image": "Minotaur (Fortis Colosseum).png",
    "size": 3,
    "maxHitText": "74"
  },
  {
    "slug": "minotaur-meat-and-greet",
    "name": "Minotaur (Meat and Greet)",
    "version": "",
    "combatLevel": 193,
    "hp": 240,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 30,
      "slash": 20,
      "crush": 50,
      "magic": 80,
      "rangedHeavy": 140,
      "rangedStandard": 140,
      "rangedLight": 140
    },
    "attributes": [],
    "weakness": null,
    "image": "Minotaur (Meat and Greet).png",
    "size": 2,
    "maxHitText": "14"
  },
  {
    "slug": "mithril-dragon",
    "name": "Mithril dragon",
    "version": "",
    "combatLevel": 304,
    "hp": 254,
    "defenceLevel": 268,
    "magicLevel": 168,
    "defenceBonuses": {
      "stab": 0,
      "slash": 100,
      "crush": 70,
      "magic": 30,
      "rangedHeavy": 20,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Mithril dragon.png",
    "size": 4,
    "maxHitText": "28 (Melee)"
  },
  {
    "slug": "mother",
    "name": "Mother",
    "version": "",
    "combatLevel": 198,
    "hp": 235,
    "defenceLevel": 170,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Mother.png",
    "size": 3,
    "maxHitText": "16"
  },
  {
    "slug": "mutated-terrorbird",
    "name": "Mutated Terrorbird",
    "version": "",
    "combatLevel": 178,
    "hp": 320,
    "defenceLevel": 40,
    "magicLevel": 110,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 62,
      "rangedStandard": 62,
      "rangedLight": 62
    },
    "attributes": [],
    "weakness": null,
    "image": "Mutated Terrorbird.png",
    "size": 3,
    "maxHitText": "16"
  },
  {
    "slug": "mutated-tortoise",
    "name": "Mutated Tortoise",
    "version": "",
    "combatLevel": 247,
    "hp": 440,
    "defenceLevel": 120,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Mutated Tortoise.png",
    "size": 4,
    "maxHitText": "18"
  },
  {
    "slug": "muttadile",
    "name": "Muttadile",
    "version": "Large",
    "combatLevel": 0,
    "hp": 250,
    "defenceLevel": 220,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": -5,
      "slash": 82,
      "crush": 60,
      "magic": 75,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "xerician"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Muttadile.png",
    "size": 5,
    "maxHitText": "72 (Stomp)"
  },
  {
    "slug": "mysterious-figure",
    "name": "Mysterious Figure",
    "version": "",
    "combatLevel": 271,
    "hp": 450,
    "defenceLevel": 120,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 20,
      "slash": 40,
      "crush": 60,
      "magic": 30,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Mysterious Figure.png",
    "size": 1,
    "maxHitText": "18"
  },
  {
    "slug": "nechryarch",
    "name": "Nechryarch",
    "version": "",
    "combatLevel": 300,
    "hp": 320,
    "defenceLevel": 140,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Nechryarch.png",
    "size": 2,
    "maxHitText": "27"
  },
  {
    "slug": "nex",
    "name": "Nex",
    "version": "",
    "combatLevel": 1001,
    "hp": 3400,
    "defenceLevel": 260,
    "magicLevel": 230,
    "defenceBonuses": {
      "stab": 40,
      "slash": 140,
      "crush": 60,
      "magic": 300,
      "rangedHeavy": 150,
      "rangedStandard": 190,
      "rangedLight": 190
    },
    "attributes": [],
    "weakness": null,
    "image": "Nex.png",
    "size": 3,
    "maxHitText": "33 (Magic)"
  },
  {
    "slug": "night-beast",
    "name": "Night beast",
    "version": "",
    "combatLevel": 374,
    "hp": 550,
    "defenceLevel": 220,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 75,
      "slash": 80,
      "crush": 200,
      "magic": 190,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Night beast.png",
    "size": 4,
    "maxHitText": "31"
  },
  {
    "slug": "nuclear-smoke-devil",
    "name": "Nuclear smoke devil",
    "version": "",
    "combatLevel": 280,
    "hp": 240,
    "defenceLevel": 390,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 850,
      "rangedHeavy": 80,
      "rangedStandard": 80,
      "rangedLight": 80
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Nuclear smoke devil.png",
    "size": 2,
    "maxHitText": "29"
  },
  {
    "slug": "nylocas-matomenos",
    "name": "Nylocas Matomenos",
    "version": "Hard Mode Verzik",
    "combatLevel": 138,
    "hp": 200,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 15
    },
    "image": "Nylocas Matomenos.png",
    "size": 2,
    "maxHitText": "11"
  },
  {
    "slug": "nylocas-prinkipas",
    "name": "Nylocas Prinkipas",
    "version": "Magic",
    "combatLevel": 400,
    "hp": 400,
    "defenceLevel": 25,
    "magicLevel": 25,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 15
    },
    "image": "Nylocas Prinkipas (magic).png",
    "size": 3,
    "maxHitText": "38"
  },
  {
    "slug": "nylocas-vasilias",
    "name": "Nylocas Vasilias",
    "version": "Normal",
    "combatLevel": 800,
    "hp": 2500,
    "defenceLevel": 50,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 15
    },
    "image": "Nylocas Vasilias (melee).png",
    "size": 4,
    "maxHitText": "70"
  },
  {
    "slug": "obelisk-tombs-of-amascut",
    "name": "Obelisk (Tombs of Amascut)",
    "version": "",
    "combatLevel": 0,
    "hp": 260,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": 50,
      "rangedHeavy": 60,
      "rangedStandard": 20,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": null,
    "image": "Obelisk (Tombs of Amascut, phase 1).png",
    "size": 3,
    "maxHitText": "0"
  },
  {
    "slug": "orca",
    "name": "Orca",
    "version": "",
    "combatLevel": 205,
    "hp": 370,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 60,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": null,
    "image": "Orca.png",
    "size": 4,
    "maxHitText": "13"
  },
  {
    "slug": "penance-queen",
    "name": "Penance Queen",
    "version": "",
    "combatLevel": 209,
    "hp": 250,
    "defenceLevel": 132,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Penance Queen.png",
    "size": 5,
    "maxHitText": "13 (Ranged)"
  },
  {
    "slug": "persten-the-deceitful",
    "name": "Persten the Deceitful",
    "version": "",
    "combatLevel": 264,
    "hp": 200,
    "defenceLevel": 130,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": 200,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "spectral"
    ],
    "weakness": null,
    "image": "Persten the Deceitful.png",
    "size": 1,
    "maxHitText": "32"
  },
  {
    "slug": "pestilent-bloat",
    "name": "Pestilent Bloat",
    "version": "Normal",
    "combatLevel": 870,
    "hp": 2000,
    "defenceLevel": 100,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 40,
      "slash": 20,
      "crush": 40,
      "magic": 600,
      "rangedHeavy": 800,
      "rangedStandard": 800,
      "rangedLight": 800
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Pestilent Bloat.png",
    "size": 5,
    "maxHitText": "20 (Flies)"
  },
  {
    "slug": "phantom-muspah",
    "name": "Phantom Muspah",
    "version": "Melee",
    "combatLevel": 741,
    "hp": 850,
    "defenceLevel": 200,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 185,
      "slash": 134,
      "crush": 120,
      "magic": 34,
      "rangedHeavy": 261,
      "rangedStandard": 261,
      "rangedLight": 261
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 65
    },
    "image": "Phantom Muspah (melee).png",
    "size": 5,
    "maxHitText": "34"
  },
  {
    "slug": "phosanis-nightmare",
    "name": "Phosani's Nightmare",
    "version": "",
    "combatLevel": 1024,
    "hp": 3200,
    "defenceLevel": 150,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 120,
      "slash": 180,
      "crush": 40,
      "magic": 600,
      "rangedHeavy": 600,
      "rangedStandard": 600,
      "rangedLight": 600
    },
    "attributes": [],
    "weakness": null,
    "image": "The Nightmare.png",
    "size": 5,
    "maxHitText": "73 (melee)"
  },
  {
    "slug": "porazdir",
    "name": "Porazdir",
    "version": "",
    "combatLevel": 235,
    "hp": 320,
    "defenceLevel": 100,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 200,
      "slash": 200,
      "crush": 200,
      "magic": -60,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Porazdir.png",
    "size": 3,
    "maxHitText": "43 (Magic)"
  },
  {
    "slug": "portal-pest-control",
    "name": "Portal (Pest Control)",
    "version": "Blue, Intermediate/veteran",
    "combatLevel": 0,
    "hp": 250,
    "defenceLevel": 120,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 0,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Blue Portal.png",
    "size": 3,
    "maxHitText": "0 (Does not attack)"
  },
  {
    "slug": "prince-itzla-arkan",
    "name": "Prince Itzla Arkan",
    "version": "",
    "combatLevel": 167,
    "hp": 250,
    "defenceLevel": 75,
    "magicLevel": 55,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 20,
      "magic": 10,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": null,
    "image": "Prince Itzla Arkan (disguised, sword).png",
    "size": 1,
    "maxHitText": "12 (normal)"
  },
  {
    "slug": "rabbit-prifddinas",
    "name": "Rabbit (Prifddinas)",
    "version": "",
    "combatLevel": 2,
    "hp": 2000,
    "defenceLevel": 450,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 150,
      "slash": 150,
      "crush": 150,
      "magic": 150,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Rabbit (Prifddinas).png",
    "size": 1,
    "maxHitText": "40"
  },
  {
    "slug": "ranging-ro",
    "name": "Ranging Ro",
    "version": "Annihilation",
    "combatLevel": 973,
    "hp": 3500,
    "defenceLevel": 100,
    "magicLevel": 15,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 200,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Ranging Ro (Annihilation).png",
    "size": 1,
    "maxHitText": "16"
  },
  {
    "slug": "ranis-drakan",
    "name": "Ranis Drakan",
    "version": "A Taste of Hope",
    "combatLevel": 233,
    "hp": 400,
    "defenceLevel": 120,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 60,
      "slash": 60,
      "crush": 60,
      "magic": 60,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [
      "vampyre3"
    ],
    "weakness": null,
    "image": "Ranis Drakan (A Taste of Hope).png",
    "size": 1,
    "maxHitText": "20"
  },
  {
    "slug": "repugnant-spectre",
    "name": "Repugnant spectre",
    "version": "",
    "combatLevel": 335,
    "hp": 380,
    "defenceLevel": 220,
    "magicLevel": 380,
    "defenceBonuses": {
      "stab": 120,
      "slash": 120,
      "crush": 120,
      "magic": 0,
      "rangedHeavy": 115,
      "rangedStandard": 115,
      "rangedLight": 115
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Repugnant spectre.png",
    "size": 3,
    "maxHitText": "39"
  },
  {
    "slug": "revenant-maledictus",
    "name": "Revenant maledictus",
    "version": "",
    "combatLevel": 397,
    "hp": 1250,
    "defenceLevel": 90,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 201,
      "slash": 206,
      "crush": 188,
      "magic": 101,
      "rangedHeavy": 231,
      "rangedStandard": 231,
      "rangedLight": 231
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Revenant maledictus.png",
    "size": 5,
    "maxHitText": "30"
  },
  {
    "slug": "robert-the-strong",
    "name": "Robert the Strong",
    "version": "",
    "combatLevel": 224,
    "hp": 280,
    "defenceLevel": 140,
    "magicLevel": 128,
    "defenceBonuses": {
      "stab": 140,
      "slash": 180,
      "crush": 60,
      "magic": 940,
      "rangedHeavy": 860,
      "rangedStandard": 860,
      "rangedLight": 860
    },
    "attributes": [],
    "weakness": null,
    "image": "Robert the Strong.png",
    "size": 1,
    "maxHitText": "34 (Ranged)"
  },
  {
    "slug": "rune-dragon",
    "name": "Rune dragon",
    "version": "",
    "combatLevel": 380,
    "hp": 330,
    "defenceLevel": 276,
    "magicLevel": 196,
    "defenceBonuses": {
      "stab": 20,
      "slash": 115,
      "crush": 90,
      "magic": 30,
      "rangedHeavy": 50,
      "rangedStandard": 95,
      "rangedLight": 95
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Rune dragon.png",
    "size": 5,
    "maxHitText": "29 (Melee)"
  },
  {
    "slug": "rune-dragon-construction",
    "name": "Rune dragon (Construction)",
    "version": "",
    "combatLevel": 380,
    "hp": 330,
    "defenceLevel": 276,
    "magicLevel": 196,
    "defenceBonuses": {
      "stab": 20,
      "slash": 115,
      "crush": 90,
      "magic": 30,
      "rangedHeavy": 50,
      "rangedStandard": 95,
      "rangedLight": 95
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Rune dragon (Construction) built.png",
    "size": 4,
    "maxHitText": "29 (Melee)"
  },
  {
    "slug": "sarachnis",
    "name": "Sarachnis",
    "version": "",
    "combatLevel": 318,
    "hp": 400,
    "defenceLevel": 150,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 60,
      "slash": 40,
      "crush": 10,
      "magic": 150,
      "rangedHeavy": 300,
      "rangedStandard": 300,
      "rangedLight": 300
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Sarachnis.png",
    "size": 5,
    "maxHitText": "31"
  },
  {
    "slug": "scorpia",
    "name": "Scorpia",
    "version": "",
    "combatLevel": 225,
    "hp": 200,
    "defenceLevel": 180,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 246,
      "slash": 284,
      "crush": 284,
      "magic": 44,
      "rangedHeavy": 284,
      "rangedStandard": 284,
      "rangedLight": 284
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Scorpia.png",
    "size": 5,
    "maxHitText": "16"
  },
  {
    "slug": "screaming-twisted-banshee",
    "name": "Screaming twisted banshee",
    "version": "",
    "combatLevel": 144,
    "hp": 220,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": 0,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Screaming twisted banshee.png",
    "size": 3,
    "maxHitText": "12"
  },
  {
    "slug": "scurrius",
    "name": "Scurrius",
    "version": "Group",
    "combatLevel": 250,
    "hp": 1500,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 10,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "rat"
    ],
    "weakness": null,
    "image": "Scurrius.png",
    "size": 3,
    "maxHitText": "13 (Melee)"
  },
  {
    "slug": "sea-troll-queen",
    "name": "Sea Troll Queen",
    "version": "",
    "combatLevel": 170,
    "hp": 200,
    "defenceLevel": 100,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 20,
      "slash": 40,
      "crush": 40,
      "magic": 40,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 15
    },
    "image": "Sea Troll Queen.png",
    "size": 5,
    "maxHitText": "16 (Melee)"
  },
  {
    "slug": "shadow-wyrm",
    "name": "Shadow Wyrm",
    "version": "Attacking",
    "combatLevel": 259,
    "hp": 290,
    "defenceLevel": 125,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 20,
      "slash": 100,
      "crush": 100,
      "magic": 50,
      "rangedHeavy": 20,
      "rangedStandard": 0,
      "rangedLight": 20
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Shadow Wyrm (attacking).png",
    "size": 5,
    "maxHitText": "28"
  },
  {
    "slug": "shaeded-beast",
    "name": "Shaeded Beast",
    "version": "",
    "combatLevel": 186,
    "hp": 210,
    "defenceLevel": 50,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 50,
      "slash": 30,
      "crush": 100,
      "magic": 150,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Shaeded Beast.png",
    "size": 3,
    "maxHitText": "30"
  },
  {
    "slug": "shellbane-gryphon",
    "name": "Shellbane gryphon",
    "version": "",
    "combatLevel": 235,
    "hp": 400,
    "defenceLevel": 120,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 10,
      "slash": 20,
      "crush": 40,
      "magic": 100,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Shellbane gryphon.png",
    "size": 4,
    "maxHitText": "22 <br/> 64 (whirlwinds) <br/> 30 (knockback)"
  },
  {
    "slug": "shellbane-gryphon-troubled-tortugans",
    "name": "Shellbane gryphon (Troubled Tortugans)",
    "version": "",
    "combatLevel": 235,
    "hp": 400,
    "defenceLevel": 120,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 10,
      "slash": 20,
      "crush": 40,
      "magic": 100,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Shellbane gryphon (Troubled Tortugans).png",
    "size": 4,
    "maxHitText": "22"
  },
  {
    "slug": "skeletal-wyvern",
    "name": "Skeletal Wyvern",
    "version": "1",
    "combatLevel": 140,
    "hp": 200,
    "defenceLevel": 120,
    "magicLevel": 125,
    "defenceBonuses": {
      "stab": 140,
      "slash": 90,
      "crush": 90,
      "magic": 80,
      "rangedHeavy": 140,
      "rangedStandard": 140,
      "rangedLight": 140
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Skeletal Wyvern.png",
    "size": 3,
    "maxHitText": "13 (Ranged)"
  },
  {
    "slug": "skotizo",
    "name": "Skotizo",
    "version": "",
    "combatLevel": 321,
    "hp": 450,
    "defenceLevel": 200,
    "magicLevel": 280,
    "defenceBonuses": {
      "stab": 80,
      "slash": 80,
      "crush": 80,
      "magic": 80,
      "rangedHeavy": 130,
      "rangedStandard": 130,
      "rangedLight": 130
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Skotizo.png",
    "size": 5,
    "maxHitText": "38"
  },
  {
    "slug": "sol-heredit",
    "name": "Sol Heredit",
    "version": "",
    "combatLevel": 1563,
    "hp": 1500,
    "defenceLevel": 200,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 65,
      "slash": 5,
      "crush": 30,
      "magic": 750,
      "rangedHeavy": 825,
      "rangedStandard": 825,
      "rangedLight": 825
    },
    "attributes": [],
    "weakness": null,
    "image": "Sol Heredit.png",
    "size": 5,
    "maxHitText": "44 (Typeless AOE)"
  },
  {
    "slug": "sotetseg",
    "name": "Sotetseg",
    "version": "Normal",
    "combatLevel": 995,
    "hp": 4000,
    "defenceLevel": 200,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": 30,
      "rangedHeavy": 150,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": null,
    "image": "Sotetseg.png",
    "size": 5,
    "maxHitText": "45 (Melee)"
  },
  {
    "slug": "spindel",
    "name": "Spindel",
    "version": "",
    "combatLevel": 302,
    "hp": 515,
    "defenceLevel": 225,
    "magicLevel": 235,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 10,
      "magic": 205,
      "rangedHeavy": 103,
      "rangedStandard": 103,
      "rangedLight": 103
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Spindel.png",
    "size": 4,
    "maxHitText": "14 (Melee)"
  },
  {
    "slug": "spitting-wyvern",
    "name": "Spitting Wyvern",
    "version": "",
    "combatLevel": 139,
    "hp": 200,
    "defenceLevel": 90,
    "magicLevel": 125,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 140,
      "rangedHeavy": 120,
      "rangedStandard": 70,
      "rangedLight": 120
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "air",
      "severity": 25
    },
    "image": "Spitting Wyvern.png",
    "size": 3,
    "maxHitText": "9 (Melee)"
  },
  {
    "slug": "steel-dragon",
    "name": "Steel dragon",
    "version": "Level 274",
    "combatLevel": 274,
    "hp": 250,
    "defenceLevel": 235,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 0,
      "slash": 70,
      "crush": 70,
      "magic": 30,
      "rangedHeavy": 10,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [
      "dragon",
      "fiery"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Steel dragon.png",
    "size": 4,
    "maxHitText": "24 (Melee)"
  },
  {
    "slug": "steel-dragon-construction",
    "name": "Steel dragon (Construction)",
    "version": "",
    "combatLevel": 246,
    "hp": 210,
    "defenceLevel": 215,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 20,
      "slash": 70,
      "crush": 70,
      "magic": 30,
      "rangedHeavy": 65,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Steel dragon (Construction) built.png",
    "size": 3,
    "maxHitText": "22 (Melee)"
  },
  {
    "slug": "strange-creature",
    "name": "Strange Creature",
    "version": "Melee",
    "combatLevel": 368,
    "hp": 550,
    "defenceLevel": 200,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 110,
      "slash": 90,
      "crush": 80,
      "magic": -10,
      "rangedHeavy": 160,
      "rangedStandard": 160,
      "rangedLight": 160
    },
    "attributes": [],
    "weakness": null,
    "image": "Strange Creature (melee).png",
    "size": 5,
    "maxHitText": "24"
  },
  {
    "slug": "strongbones",
    "name": "Strongbones",
    "version": "",
    "combatLevel": 184,
    "hp": 200,
    "defenceLevel": 90,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 5,
      "magic": 5,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Strongbones.png",
    "size": 1,
    "maxHitText": "18"
  },
  {
    "slug": "surok-magis",
    "name": "Surok Magis",
    "version": "",
    "combatLevel": 265,
    "hp": 450,
    "defenceLevel": 160,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 30,
      "slash": 20,
      "crush": 40,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Surok Magis (Dagon'hai).png",
    "size": 0,
    "maxHitText": "45+ (Special)"
  },
  {
    "slug": "taloned-wyvern",
    "name": "Taloned Wyvern",
    "version": "",
    "combatLevel": 147,
    "hp": 200,
    "defenceLevel": 90,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 140,
      "rangedHeavy": 120,
      "rangedStandard": 70,
      "rangedLight": 120
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Taloned Wyvern.png",
    "size": 3,
    "maxHitText": "10 (Magic)"
  },
  {
    "slug": "tar-monster",
    "name": "Tar Monster",
    "version": "",
    "combatLevel": 132,
    "hp": 200,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Tar Monster.png",
    "size": 2,
    "maxHitText": "9"
  },
  {
    "slug": "tekton",
    "name": "Tekton",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 300,
    "defenceLevel": 205,
    "magicLevel": 205,
    "defenceBonuses": {
      "stab": 155,
      "slash": 165,
      "crush": 105,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "xerician"
    ],
    "weakness": null,
    "image": "Tekton.png",
    "size": 4,
    "maxHitText": "52"
  },
  {
    "slug": "tentacle-abyssal-sire",
    "name": "Tentacle (Abyssal Sire)",
    "version": "",
    "combatLevel": 0,
    "hp": 255,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Tentacle (Abyssal Sire, awake).png",
    "size": 9,
    "maxHitText": "31"
  },
  {
    "slug": "the-everlasting",
    "name": "The Everlasting",
    "version": "",
    "combatLevel": 223,
    "hp": 230,
    "defenceLevel": 120,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "The Everlasting.png",
    "size": 3,
    "maxHitText": "24"
  },
  {
    "slug": "the-forsaken-assassin",
    "name": "The Forsaken Assassin",
    "version": "",
    "combatLevel": 252,
    "hp": 200,
    "defenceLevel": 140,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 80,
      "magic": 200,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "The Forsaken Assassin.png",
    "size": 1,
    "maxHitText": "20"
  },
  {
    "slug": "the-hueycoatl",
    "name": "The Hueycoatl",
    "version": "Normal",
    "combatLevel": 642,
    "hp": 2500,
    "defenceLevel": 125,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 350,
      "rangedStandard": 350,
      "rangedLight": 350
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 60
    },
    "image": "The Hueycoatl.png",
    "size": 7,
    "maxHitText": "14"
  },
  {
    "slug": "the-jormungand",
    "name": "The Jormungand",
    "version": "",
    "combatLevel": 363,
    "hp": 600,
    "defenceLevel": 214,
    "magicLevel": 214,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 10,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "The Jormungand.png",
    "size": 5,
    "maxHitText": "22"
  },
  {
    "slug": "the-leviathan",
    "name": "The Leviathan",
    "version": "Post-quest",
    "combatLevel": 798,
    "hp": 900,
    "defenceLevel": 250,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 260,
      "slash": 190,
      "crush": 230,
      "magic": 280,
      "rangedHeavy": 25,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "The Leviathan.png",
    "size": 7,
    "maxHitText": "50 (Melee orb & Bite)"
  },
  {
    "slug": "the-maiden-of-sugadinti",
    "name": "The Maiden of Sugadinti",
    "version": "Normal",
    "combatLevel": 940,
    "hp": 3500,
    "defenceLevel": 200,
    "magicLevel": 350,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "The Maiden of Sugadinti.png",
    "size": 6,
    "maxHitText": "36"
  },
  {
    "slug": "the-mimic",
    "name": "The Mimic",
    "version": "",
    "combatLevel": 186,
    "hp": 230,
    "defenceLevel": 120,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 160,
      "slash": 165,
      "crush": 150,
      "magic": 30,
      "rangedHeavy": 145,
      "rangedStandard": 145,
      "rangedLight": 145
    },
    "attributes": [],
    "weakness": null,
    "image": "The Mimic.png",
    "size": 5,
    "maxHitText": "23"
  },
  {
    "slug": "the-nightmare",
    "name": "The Nightmare",
    "version": "",
    "combatLevel": 814,
    "hp": 2400,
    "defenceLevel": 150,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 120,
      "slash": 180,
      "crush": 40,
      "magic": 600,
      "rangedHeavy": 600,
      "rangedStandard": 600,
      "rangedLight": 600
    },
    "attributes": [],
    "weakness": null,
    "image": "The Nightmare.png",
    "size": 5,
    "maxHitText": "50/60 (Melee)"
  },
  {
    "slug": "the-whisperer",
    "name": "The Whisperer",
    "version": "Post-quest",
    "combatLevel": 791,
    "hp": 900,
    "defenceLevel": 250,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 180,
      "slash": 300,
      "crush": 220,
      "magic": 10,
      "rangedHeavy": 300,
      "rangedStandard": 300,
      "rangedLight": 300
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 60
    },
    "image": "The Whisperer.png",
    "size": 3,
    "maxHitText": "42 (x2) (Melee)"
  },
  {
    "slug": "thermonuclear-smoke-devil",
    "name": "Thermonuclear smoke devil",
    "version": "",
    "combatLevel": 301,
    "hp": 240,
    "defenceLevel": 360,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 11,
      "slash": 4,
      "crush": 9,
      "magic": 800,
      "rangedHeavy": 900,
      "rangedStandard": 900,
      "rangedLight": 900
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Thermonuclear smoke devil.png",
    "size": 4,
    "maxHitText": "8"
  },
  {
    "slug": "tormented-demon",
    "name": "Tormented Demon",
    "version": "1",
    "combatLevel": 450,
    "hp": 600,
    "defenceLevel": 150,
    "magicLevel": 255,
    "defenceBonuses": {
      "stab": 75,
      "slash": 175,
      "crush": 68,
      "magic": 5,
      "rangedHeavy": 90,
      "rangedStandard": 150,
      "rangedLight": 140
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 30
    },
    "image": "Tormented Demon (1).png",
    "size": 3,
    "maxHitText": "<div class=\"plainlist \" >\n*31 (auto)\n*45 (special)\n</div>"
  },
  {
    "slug": "tortured-gorilla",
    "name": "Tortured gorilla",
    "version": "Level 141",
    "combatLevel": 141,
    "hp": 210,
    "defenceLevel": 95,
    "magicLevel": 95,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 25,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Tortured gorilla.png",
    "size": 2,
    "maxHitText": "13"
  },
  {
    "slug": "totem-phosanis-nightmare",
    "name": "Totem (Phosani's Nightmare)",
    "version": "",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 0,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 70
    },
    "image": "Totem (Phosani's Nightmare, uncharged).png",
    "size": 3,
    "maxHitText": "0"
  },
  {
    "slug": "totem-the-nightmare",
    "name": "Totem (The Nightmare)",
    "version": "",
    "combatLevel": 0,
    "hp": 300,
    "defenceLevel": 0,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 70
    },
    "image": "Totem (The Nightmare, uncharged).png",
    "size": 3,
    "maxHitText": "0"
  },
  {
    "slug": "tumekens-warden",
    "name": "Tumeken's Warden",
    "version": "Core-ejected",
    "combatLevel": 489,
    "hp": 4500,
    "defenceLevel": 100,
    "magicLevel": 190,
    "defenceBonuses": {
      "stab": 70,
      "slash": 70,
      "crush": 70,
      "magic": -30,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Tumeken's Warden (level-489, core-ejected).png",
    "size": 5,
    "maxHitText": "22"
  },
  {
    "slug": "typhor",
    "name": "Typhor",
    "version": "",
    "combatLevel": 218,
    "hp": 360,
    "defenceLevel": 186,
    "magicLevel": 186,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 0,
      "magic": 30,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Typhor.png",
    "size": 3,
    "maxHitText": "20"
  },
  {
    "slug": "tzhaar-ket",
    "name": "TzHaar-Ket",
    "version": "Level 221",
    "combatLevel": 221,
    "hp": 200,
    "defenceLevel": 190,
    "magicLevel": 40,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "TzHaar-Ket (level 221).png",
    "size": 1,
    "maxHitText": "19"
  },
  {
    "slug": "tzkal-zuk",
    "name": "TzKal-Zuk",
    "version": "Normal",
    "combatLevel": 1400,
    "hp": 1200,
    "defenceLevel": 260,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 350,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "TzKal-Zuk.png",
    "size": 7,
    "maxHitText": "148&thinsp;"
  },
  {
    "slug": "tztok-jad",
    "name": "TzTok-Jad",
    "version": "",
    "combatLevel": 702,
    "hp": 250,
    "defenceLevel": 480,
    "magicLevel": 480,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "TzTok-Jad.png",
    "size": 5,
    "maxHitText": "97 (Melee)"
  },
  {
    "slug": "tztok-jad-rek",
    "name": "TzTok-Jad-Rek",
    "version": "",
    "combatLevel": 186,
    "hp": 200,
    "defenceLevel": 25,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "TzTok-Jad-Rek.png",
    "size": 3,
    "maxHitText": "25 (Melee)"
  },
  {
    "slug": "umbra",
    "name": "Umbra",
    "version": "",
    "combatLevel": 285,
    "hp": 500,
    "defenceLevel": 200,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 150,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": null,
    "image": "Umbra.png",
    "size": 1,
    "maxHitText": "29"
  },
  {
    "slug": "vampyre-kraken",
    "name": "Vampyre kraken",
    "version": "",
    "combatLevel": 211,
    "hp": 311,
    "defenceLevel": 115,
    "magicLevel": 215,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -63,
      "rangedHeavy": 60,
      "rangedStandard": 75,
      "rangedLight": 120
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Vampyre kraken.png",
    "size": 5,
    "maxHitText": "22"
  },
  {
    "slug": "vanstrom-klause",
    "name": "Vanstrom Klause",
    "version": "Sins of the Father",
    "combatLevel": 459,
    "hp": 750,
    "defenceLevel": 180,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 34,
      "slash": 34,
      "crush": 34,
      "magic": 34,
      "rangedHeavy": 34,
      "rangedStandard": 34,
      "rangedLight": 34
    },
    "attributes": [
      "vampyre3"
    ],
    "weakness": null,
    "image": "Vanstrom Klause (vampyre).png",
    "size": 1,
    "maxHitText": "24 (Standard)"
  },
  {
    "slug": "vardorvis",
    "name": "Vardorvis",
    "version": "Post-quest",
    "combatLevel": 784,
    "hp": 700,
    "defenceLevel": 200,
    "magicLevel": 215,
    "defenceBonuses": {
      "stab": 215,
      "slash": 65,
      "crush": 85,
      "magic": 580,
      "rangedHeavy": 580,
      "rangedStandard": 580,
      "rangedLight": 580
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Vardorvis.png",
    "size": 2,
    "maxHitText": "32-43 (Melee)"
  },
  {
    "slug": "vasa-nistirio",
    "name": "Vasa Nistirio",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 300,
    "defenceLevel": 175,
    "magicLevel": 230,
    "defenceBonuses": {
      "stab": 170,
      "slash": 190,
      "crush": 40,
      "magic": 400,
      "rangedHeavy": 30,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [
      "xerician"
    ],
    "weakness": null,
    "image": "Vasa Nistirio.png",
    "size": 5,
    "maxHitText": "Varies"
  },
  {
    "slug": "veiled-kraken",
    "name": "Veiled kraken",
    "version": "",
    "combatLevel": 210,
    "hp": 225,
    "defenceLevel": 115,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 325,
      "rangedHeavy": 0,
      "rangedStandard": 325,
      "rangedLight": 325
    },
    "attributes": [],
    "weakness": null,
    "image": "Veiled kraken.png",
    "size": 5,
    "maxHitText": "19"
  },
  {
    "slug": "venenatis",
    "name": "Venenatis",
    "version": "",
    "combatLevel": 464,
    "hp": 850,
    "defenceLevel": 321,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 10,
      "magic": 300,
      "rangedHeavy": 150,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Venenatis.png",
    "size": 4,
    "maxHitText": "21 (Melee)"
  },
  {
    "slug": "verzik-vitur",
    "name": "Verzik Vitur",
    "version": "Hard mode, Phase 2",
    "combatLevel": 1265,
    "hp": 3500,
    "defenceLevel": 200,
    "magicLevel": 400,
    "defenceBonuses": {
      "stab": 100,
      "slash": 60,
      "crush": 100,
      "magic": 70,
      "rangedHeavy": 250,
      "rangedStandard": 250,
      "rangedLight": 250
    },
    "attributes": [],
    "weakness": null,
    "image": "Verzik Vitur (flying).png",
    "size": 3,
    "maxHitText": "44"
  },
  {
    "slug": "vespula",
    "name": "Vespula",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 88,
    "magicLevel": 88,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 70,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 20
    },
    "attributes": [
      "xerician",
      "flying"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Vespula.png",
    "size": 5,
    "maxHitText": "14 (Ranged)"
  },
  {
    "slug": "vetion",
    "name": "Vet'ion",
    "version": "Normal",
    "combatLevel": 454,
    "hp": 255,
    "defenceLevel": 395,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 201,
      "slash": 200,
      "crush": -10,
      "magic": 250,
      "rangedHeavy": 270,
      "rangedStandard": 270,
      "rangedLight": 270
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Vet'ion.png",
    "size": 3,
    "maxHitText": "44"
  },
  {
    "slug": "vitreous-chilled-jelly",
    "name": "Vitreous Chilled Jelly",
    "version": "",
    "combatLevel": 241,
    "hp": 220,
    "defenceLevel": 250,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Vitreous Chilled Jelly.png",
    "size": 2,
    "maxHitText": "19"
  },
  {
    "slug": "vitreous-warped-jelly",
    "name": "Vitreous Warped Jelly",
    "version": "",
    "combatLevel": 241,
    "hp": 220,
    "defenceLevel": 250,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Vitreous Warped Jelly.png",
    "size": 3,
    "maxHitText": "19"
  },
  {
    "slug": "void-knight-pest-control",
    "name": "Void Knight (Pest Control)",
    "version": "1",
    "combatLevel": 0,
    "hp": 200,
    "defenceLevel": 50,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 100,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": null,
    "image": "Void Knight (Pest Control, 1).png",
    "size": 0,
    "maxHitText": "0 (Does not attack)"
  },
  {
    "slug": "vorkath",
    "name": "Vorkath",
    "version": "Post-quest",
    "combatLevel": 732,
    "hp": 750,
    "defenceLevel": 214,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 26,
      "slash": 108,
      "crush": 108,
      "magic": 240,
      "rangedHeavy": 26,
      "rangedStandard": 26,
      "rangedLight": 26
    },
    "attributes": [
      "dragon",
      "undead",
      "fiery"
    ],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Vorkath.png",
    "size": 7,
    "maxHitText": "30 (Magic)"
  },
  {
    "slug": "warped-terrorbird",
    "name": "Warped Terrorbird",
    "version": "Level 138",
    "combatLevel": 138,
    "hp": 200,
    "defenceLevel": 60,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 62,
      "rangedStandard": 62,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": null,
    "image": "Warped Terrorbird (lv 138).png",
    "size": 2,
    "maxHitText": "16"
  },
  {
    "slug": "warped-tortoise",
    "name": "Warped Tortoise",
    "version": "",
    "combatLevel": 121,
    "hp": 200,
    "defenceLevel": 78,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Warped Tortoise.png",
    "size": 3,
    "maxHitText": "12"
  },
  {
    "slug": "xamphur",
    "name": "Xamphur",
    "version": "",
    "combatLevel": 239,
    "hp": 450,
    "defenceLevel": 100,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 180,
      "slash": 180,
      "crush": 180,
      "magic": 260,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": null,
    "image": "Xamphur (monster, phantom hands).png",
    "size": 3,
    "maxHitText": "18"
  },
  {
    "slug": "xarpus",
    "name": "Xarpus",
    "version": "Hard mode",
    "combatLevel": 1160,
    "hp": 6000,
    "defenceLevel": 200,
    "magicLevel": 220,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 160,
      "rangedStandard": 160,
      "rangedLight": 160
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Xarpus.png",
    "size": 5,
    "maxHitText": "11 (50+ recoil)"
  },
  {
    "slug": "yama",
    "name": "Yama",
    "version": "Normal",
    "combatLevel": 1238,
    "hp": 2500,
    "defenceLevel": 225,
    "magicLevel": 250,
    "defenceBonuses": {
      "stab": 100,
      "slash": 80,
      "crush": 333,
      "magic": 0,
      "rangedHeavy": 333,
      "rangedStandard": 220,
      "rangedLight": 333
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Yama.png",
    "size": 5,
    "maxHitText": "46 (auto-attacks)"
  },
  {
    "slug": "zalcano",
    "name": "Zalcano",
    "version": "Weakened",
    "combatLevel": 336,
    "hp": 1000,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Zalcano (weakened).png",
    "size": 5,
    "maxHitText": "N/A"
  },
  {
    "slug": "zebak",
    "name": "Zebak",
    "version": "Normal",
    "combatLevel": 371,
    "hp": 580,
    "defenceLevel": 70,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 160,
      "slash": 160,
      "crush": 260,
      "magic": 200,
      "rangedHeavy": 110,
      "rangedStandard": 110,
      "rangedLight": 110
    },
    "attributes": [],
    "weakness": null,
    "image": "Zebak.png",
    "size": 9,
    "maxHitText": "38 (Melee)"
  },
  {
    "slug": "zulrah",
    "name": "Zulrah",
    "version": "Magma",
    "combatLevel": 725,
    "hp": 500,
    "defenceLevel": 300,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 300,
      "rangedStandard": 300,
      "rangedLight": 300
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zulrah (magma).png",
    "size": 5,
    "maxHitText": "30"
  }
];

export const MONSTER_BY_SLUG: Record<string, MonsterCatalogEntry> = Object.fromEntries(
  MONSTER_CATALOG.map((m) => [m.slug, m]),
);
