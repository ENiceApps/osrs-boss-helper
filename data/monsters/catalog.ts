// GENERATED FILE — do not edit by hand.
// Run `npm run build-monster-catalog` to regenerate from data/vendor/wgloop/monsters.json.
// Filter: HP >= 200, excluding entries tagged ["Echo","Nightmare Zone"].

export interface MonsterCatalogEntry {
  slug: string;
  /** Numeric monster ID from the weirdgloop/osrs-dps-calc dataset. 0 for synthetic entries. */
  wikiId: number;
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
  /** True iff this monster can be assigned as a Slayer task (gates the on-task UI + bonus). */
  isSlayerMonster: boolean;
}

export const MONSTER_CATALOG: MonsterCatalogEntry[] = [
  {
    "slug": "abhorrent-spectre",
    "wikiId": 7402,
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
    "maxHitText": "31",
    "isSlayerMonster": true
  },
  {
    "slug": "abomination",
    "wikiId": 8260,
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
    "maxHitText": "23",
    "isSlayerMonster": false
  },
  {
    "slug": "abyssal-portal",
    "wikiId": 7533,
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
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "abyssal-sire",
    "wikiId": 5886,
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
    "maxHitText": "66 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "adamant-dragon",
    "wikiId": 8030,
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
    "maxHitText": "29 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "agrith-na-na",
    "wikiId": 4880,
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
    "maxHitText": "16",
    "isSlayerMonster": false
  },
  {
    "slug": "akkha",
    "wikiId": 11789,
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
    "maxHitText": "55",
    "isSlayerMonster": false
  },
  {
    "slug": "alchemical-hydra",
    "wikiId": 8619,
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
    "maxHitText": "35 (default)",
    "isSlayerMonster": true
  },
  {
    "slug": "amoxliatl",
    "wikiId": 13685,
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
    "maxHitText": "22 (standard)<br>34 (Icicle Crash)",
    "isSlayerMonster": true
  },
  {
    "slug": "ancient-custodian",
    "wikiId": 14520,
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
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "ancient-wyvern",
    "wikiId": 7795,
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
    "maxHitText": "10 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "angry-bear",
    "wikiId": 1060,
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
    "maxHitText": "5",
    "isSlayerMonster": false
  },
  {
    "slug": "angry-giant-rat",
    "wikiId": 1062,
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
    "maxHitText": "5",
    "isSlayerMonster": false
  },
  {
    "slug": "angry-goblin",
    "wikiId": 1065,
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
    "maxHitText": "5",
    "isSlayerMonster": false
  },
  {
    "slug": "angry-unicorn",
    "wikiId": 1061,
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
    "maxHitText": "5",
    "isSlayerMonster": false
  },
  {
    "slug": "araxxor",
    "wikiId": 13668,
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
    "maxHitText": "38 (melee) <br/> 21 (magic) <br/> 34 (ranged)",
    "isSlayerMonster": true
  },
  {
    "slug": "arianwyn",
    "wikiId": 8865,
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
    "maxHitText": "38",
    "isSlayerMonster": false
  },
  {
    "slug": "armoured-kraken",
    "wikiId": 15210,
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
    "maxHitText": "18",
    "isSlayerMonster": false
  },
  {
    "slug": "arrav",
    "wikiId": 14132,
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
    "maxHitText": "30",
    "isSlayerMonster": false
  },
  {
    "slug": "artio",
    "wikiId": 11992,
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
    "maxHitText": "35 (Crush)",
    "isSlayerMonster": true
  },
  {
    "slug": "arzinian-avatar-of-magic",
    "wikiId": 1233,
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
    "maxHitText": "15",
    "isSlayerMonster": false
  },
  {
    "slug": "arzinian-avatar-of-ranging",
    "wikiId": 1230,
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
    "maxHitText": "17",
    "isSlayerMonster": false
  },
  {
    "slug": "arzinian-avatar-of-strength",
    "wikiId": 1227,
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
    "maxHitText": "14",
    "isSlayerMonster": false
  },
  {
    "slug": "assassin",
    "wikiId": 12062,
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
    "maxHitText": "39",
    "isSlayerMonster": false
  },
  {
    "slug": "assassin-while-guthix-sleeps",
    "wikiId": 13514,
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
    "maxHitText": "20 (normal)",
    "isSlayerMonster": false
  },
  {
    "slug": "avatar-of-creation",
    "wikiId": 10531,
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
    "maxHitText": "54",
    "isSlayerMonster": true
  },
  {
    "slug": "avatar-of-destruction",
    "wikiId": 10532,
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
    "maxHitText": "54",
    "isSlayerMonster": true
  },
  {
    "slug": "ba-ba",
    "wikiId": 11778,
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
    "maxHitText": "24",
    "isSlayerMonster": false
  },
  {
    "slug": "balance-elemental",
    "wikiId": 13530,
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
    "maxHitText": "40 (standard)<br>89 (stat-draining)",
    "isSlayerMonster": false
  },
  {
    "slug": "basilisk-knight",
    "wikiId": 9293,
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
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "basilisk-sentinel",
    "wikiId": 9258,
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
    "maxHitText": "28 (normal)",
    "isSlayerMonster": true
  },
  {
    "slug": "big-evil-chicken",
    "wikiId": 15547,
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
    "maxHitText": "26",
    "isSlayerMonster": false
  },
  {
    "slug": "black-demon",
    "wikiId": 7874,
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
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "black-dragon",
    "wikiId": 7861,
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
    "maxHitText": "22 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "blood-moon",
    "wikiId": 13011,
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
    "maxHitText": "32 total 4+8+20",
    "isSlayerMonster": false
  },
  {
    "slug": "blue-moon",
    "wikiId": 13013,
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
    "maxHitText": "32 total 4+8+20",
    "isSlayerMonster": false
  },
  {
    "slug": "branda-the-fire-queen",
    "wikiId": 12596,
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
    "maxHitText": "26 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "brutal-black-dragon",
    "wikiId": 7275,
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
    "maxHitText": "29 (Melee; Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "brutal-blue-dragon",
    "wikiId": 7273,
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
    "maxHitText": "21 (Melee; Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "brutal-red-dragon",
    "wikiId": 7274,
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
    "maxHitText": "22 (Melee; Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "callisto",
    "wikiId": 6609,
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
    "maxHitText": "55 (Crush)",
    "isSlayerMonster": true
  },
  {
    "slug": "cerberus",
    "wikiId": 5862,
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
    "maxHitText": "23",
    "isSlayerMonster": true
  },
  {
    "slug": "champion-of-scabaras",
    "wikiId": 11482,
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
    "maxHitText": "24",
    "isSlayerMonster": false
  },
  {
    "slug": "chaos-elemental",
    "wikiId": 2054,
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
    "maxHitText": "28",
    "isSlayerMonster": true
  },
  {
    "slug": "chaos-fanatic",
    "wikiId": 6619,
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
    "maxHitText": "31",
    "isSlayerMonster": true
  },
  {
    "slug": "choke-devil",
    "wikiId": 7404,
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
    "maxHitText": "24",
    "isSlayerMonster": true
  },
  {
    "slug": "colossal-hydra",
    "wikiId": 10402,
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
    "maxHitText": "34",
    "isSlayerMonster": true
  },
  {
    "slug": "combat-dummy",
    "wikiId": 0,
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
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "commander-zilyana",
    "wikiId": 2205,
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
    "maxHitText": "27 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "corporeal-beast",
    "wikiId": 319,
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
    "maxHitText": "33 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "corrupted-hunllef",
    "wikiId": 9035,
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
    "maxHitText": "68",
    "isSlayerMonster": false
  },
  {
    "slug": "crazy-archaeologist",
    "wikiId": 6618,
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
    "maxHitText": "14 (standard)",
    "isSlayerMonster": true
  },
  {
    "slug": "cruor",
    "wikiId": 11285,
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
    "maxHitText": "29",
    "isSlayerMonster": false
  },
  {
    "slug": "crystalline-hunllef",
    "wikiId": 9021,
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
    "maxHitText": "50+",
    "isSlayerMonster": false
  },
  {
    "slug": "dagannoth-prime",
    "wikiId": 2266,
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
    "maxHitText": "50",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth-rex",
    "wikiId": 2267,
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
    "maxHitText": "26",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth-supreme",
    "wikiId": 2265,
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
    "maxHitText": "30",
    "isSlayerMonster": true
  },
  {
    "slug": "damien-leucurte",
    "wikiId": 9561,
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
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "damis",
    "wikiId": 683,
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
    "maxHitText": "28",
    "isSlayerMonster": false
  },
  {
    "slug": "dark-beast",
    "wikiId": 4005,
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
    "maxHitText": "17 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "dawn",
    "wikiId": 7852,
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
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "demonic-brutus",
    "wikiId": 15628,
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
    "maxHitText": "43 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "demonic-gorilla",
    "wikiId": 7144,
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
    "maxHitText": "31 (normal)",
    "isSlayerMonster": true
  },
  {
    "slug": "deranged-archaeologist",
    "wikiId": 7806,
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
    "maxHitText": "25 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "derwen",
    "wikiId": 7513,
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
    "maxHitText": "43 (Magic)",
    "isSlayerMonster": false
  },
  {
    "slug": "dessous",
    "wikiId": 3459,
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
    "maxHitText": "19 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "dire-gryphon",
    "wikiId": 14859,
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
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "ditto",
    "wikiId": 0,
    "name": "Ditto (custom boss)",
    "version": "",
    "combatLevel": 1,
    "hp": 1000,
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
    "weakness": null,
    "image": "Combat_dummy.png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "dont-know-what",
    "wikiId": 8439,
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
    "maxHitText": "10",
    "isSlayerMonster": false
  },
  {
    "slug": "doom-of-mokhaiotl",
    "wikiId": 14707,
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
    "maxHitText": "65 <br/>99 (charge)",
    "isSlayerMonster": false
  },
  {
    "slug": "drake",
    "wikiId": 8612,
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
    "maxHitText": "15 (Ranged)",
    "isSlayerMonster": true
  },
  {
    "slug": "dreadborn-araxyte",
    "wikiId": 13680,
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
    "maxHitText": "31 (normal)",
    "isSlayerMonster": true
  },
  {
    "slug": "drink-troll-queen",
    "wikiId": 15175,
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
    "maxHitText": "21",
    "isSlayerMonster": false
  },
  {
    "slug": "duke-sucellus",
    "wikiId": 12191,
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
    "maxHitText": "81 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "dusk",
    "wikiId": 7851,
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
    "maxHitText": "15 (melee) 33 (special attack)",
    "isSlayerMonster": true
  },
  {
    "slug": "eclipse-moon",
    "wikiId": 13012,
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
    "maxHitText": "32 total 4+8+20",
    "isSlayerMonster": false
  },
  {
    "slug": "elder-aquanite",
    "wikiId": 15502,
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
    "maxHitText": "34 (normal)",
    "isSlayerMonster": true
  },
  {
    "slug": "elder-custodian-stalker",
    "wikiId": 14704,
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
    "maxHitText": "10 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "eldric-the-ice-king",
    "wikiId": 14147,
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
    "maxHitText": "26 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "elidinis-warden",
    "wikiId": 11755,
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
    "maxHitText": "20",
    "isSlayerMonster": false
  },
  {
    "slug": "ennius-tullus",
    "wikiId": 14331,
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
    "maxHitText": "22",
    "isSlayerMonster": false
  },
  {
    "slug": "essyllt",
    "wikiId": 8847,
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
    "maxHitText": "40 (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "flambeed",
    "wikiId": 4881,
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
    "maxHitText": "25",
    "isSlayerMonster": false
  },
  {
    "slug": "fragment-of-seren",
    "wikiId": 8917,
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
    "maxHitText": "12+12 (standard)",
    "isSlayerMonster": false
  },
  {
    "slug": "frost-dragon",
    "wikiId": 14922,
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
    "maxHitText": "16 (Stab)<br/>50 (Dragonfire)",
    "isSlayerMonster": true
  },
  {
    "slug": "fumus",
    "wikiId": 11283,
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
    "maxHitText": "29",
    "isSlayerMonster": false
  },
  {
    "slug": "galvek",
    "wikiId": 8097,
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
    "maxHitText": "28 (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "gelatinnoth-mother",
    "wikiId": 4884,
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
    "maxHitText": "9 (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "gemstone-crab",
    "wikiId": 14779,
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
    "maxHitText": "1",
    "isSlayerMonster": false
  },
  {
    "slug": "general-graardor",
    "wikiId": 2215,
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
    "maxHitText": "60 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-goblin",
    "wikiId": 12452,
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
    "maxHitText": "27",
    "isSlayerMonster": false
  },
  {
    "slug": "giant-mole",
    "wikiId": 5779,
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
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-roc",
    "wikiId": 763,
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
    "maxHitText": "14 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "glacies",
    "wikiId": 11286,
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
    "maxHitText": "29",
    "isSlayerMonster": false
  },
  {
    "slug": "glough",
    "wikiId": 7101,
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
    "maxHitText": "61",
    "isSlayerMonster": false
  },
  {
    "slug": "great-olm",
    "wikiId": 7551,
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
    "maxHitText": "27 <br/> 28 <br/> 29 (phase 4)",
    "isSlayerMonster": false
  },
  {
    "slug": "great-white-shark",
    "wikiId": 15200,
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
    "maxHitText": "15",
    "isSlayerMonster": false
  },
  {
    "slug": "greater-abyssal-demon",
    "wikiId": 7410,
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
    "maxHitText": "27",
    "isSlayerMonster": true
  },
  {
    "slug": "greater-nechryael",
    "wikiId": 7278,
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
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "guardian-chambers-of-xeric",
    "wikiId": 7569,
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
    "maxHitText": "20",
    "isSlayerMonster": false
  },
  {
    "slug": "guardian-drake",
    "wikiId": 10400,
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
    "maxHitText": "35 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "hespori",
    "wikiId": 8583,
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
    "maxHitText": "8x2 (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "hespori-a-night-at-the-theatre",
    "wikiId": 11192,
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
    "maxHitText": "8 (x2) (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "hydra",
    "wikiId": 8609,
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
    "maxHitText": "22",
    "isSlayerMonster": true
  },
  {
    "slug": "i-dscim-you",
    "wikiId": 15553,
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
    "maxHitText": "21",
    "isSlayerMonster": false
  },
  {
    "slug": "insatiable-bloodveld",
    "wikiId": 7397,
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
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "insatiable-mutated-bloodveld",
    "wikiId": 7398,
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
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-zek",
    "wikiId": 7699,
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
    "maxHitText": "70 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "jaltok-jad",
    "wikiId": 7700,
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
    "maxHitText": "113",
    "isSlayerMonster": true
  },
  {
    "slug": "javelin-colossus",
    "wikiId": 12817,
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
    "maxHitText": "48",
    "isSlayerMonster": false
  },
  {
    "slug": "jhallan",
    "wikiId": 12353,
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
    "maxHitText": "26",
    "isSlayerMonster": false
  },
  {
    "slug": "judge-of-yama",
    "wikiId": 14180,
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
    "maxHitText": "18 (aoe)",
    "isSlayerMonster": false
  },
  {
    "slug": "judge-of-yama-a-kingdom-divided",
    "wikiId": 10936,
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
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "justiciar-zachariah",
    "wikiId": 5977,
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
    "maxHitText": "43 (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "kril-tsutsaroth",
    "wikiId": 3129,
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
    "maxHitText": "30 (magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "kalphite-queen",
    "wikiId": 965,
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
    "maxHitText": "31",
    "isSlayerMonster": true
  },
  {
    "slug": "karamel",
    "wikiId": 4882,
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
    "maxHitText": "7x2 (Magic)",
    "isSlayerMonster": false
  },
  {
    "slug": "kasonde",
    "wikiId": 12262,
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
    "maxHitText": "20",
    "isSlayerMonster": false
  },
  {
    "slug": "kasonde-the-craven",
    "wikiId": 12331,
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
    "maxHitText": "22",
    "isSlayerMonster": false
  },
  {
    "slug": "ketla-the-unworthy",
    "wikiId": 12329,
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
    "maxHitText": "18",
    "isSlayerMonster": false
  },
  {
    "slug": "king-black-dragon",
    "wikiId": 239,
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
    "maxHitText": "25 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "king-kurask",
    "wikiId": 7405,
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
    "maxHitText": "33",
    "isSlayerMonster": true
  },
  {
    "slug": "king-sand-crab",
    "wikiId": 7266,
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
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "kob",
    "wikiId": 7106,
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
    "maxHitText": "57 (normal)",
    "isSlayerMonster": false
  },
  {
    "slug": "koschei-the-deathless",
    "wikiId": 3900,
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
    "maxHitText": "1",
    "isSlayerMonster": false
  },
  {
    "slug": "kraken",
    "wikiId": 494,
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
    "maxHitText": "28",
    "isSlayerMonster": true
  },
  {
    "slug": "kreearra",
    "wikiId": 3162,
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
    "maxHitText": "69 (Ranged)",
    "isSlayerMonster": true
  },
  {
    "slug": "kroy",
    "wikiId": 9560,
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
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "kruk",
    "wikiId": 6805,
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
    "maxHitText": "33 (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "lava-dragon",
    "wikiId": 6593,
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
    "maxHitText": "23 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "long-tailed-wyvern",
    "wikiId": 7792,
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
    "maxHitText": "13 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "magic-mark",
    "wikiId": 13663,
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
    "maxHitText": "18",
    "isSlayerMonster": false
  },
  {
    "slug": "magma-strykewyrm",
    "wikiId": 15504,
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
    "maxHitText": "26",
    "isSlayerMonster": true
  },
  {
    "slug": "manticore",
    "wikiId": 12818,
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
    "maxHitText": "31 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "marble-gargoyle",
    "wikiId": 7407,
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
    "maxHitText": "26 (melee)\n30 (ranged)\n38 (special)",
    "isSlayerMonster": true
  },
  {
    "slug": "menaphite-akh",
    "wikiId": 11492,
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
    "maxHitText": "? (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "metzli-teokan-of-ranul",
    "wikiId": 14318,
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
    "maxHitText": "28",
    "isSlayerMonster": false
  },
  {
    "slug": "minotaur-fortis-colosseum",
    "wikiId": 12812,
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
    "maxHitText": "74",
    "isSlayerMonster": false
  },
  {
    "slug": "minotaur-meat-and-greet",
    "wikiId": 13814,
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
    "maxHitText": "14",
    "isSlayerMonster": false
  },
  {
    "slug": "mithril-dragon",
    "wikiId": 2919,
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
    "maxHitText": "28 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "mother",
    "wikiId": 8428,
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
    "maxHitText": "16",
    "isSlayerMonster": false
  },
  {
    "slug": "mutated-terrorbird",
    "wikiId": 12464,
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
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "mutated-tortoise",
    "wikiId": 12465,
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
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "muttadile",
    "wikiId": 7561,
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
    "maxHitText": "72 (Stomp)",
    "isSlayerMonster": false
  },
  {
    "slug": "mysterious-figure",
    "wikiId": 12300,
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
    "maxHitText": "18",
    "isSlayerMonster": false
  },
  {
    "slug": "nechryarch",
    "wikiId": 7411,
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
    "maxHitText": "27",
    "isSlayerMonster": true
  },
  {
    "slug": "nex",
    "wikiId": 11278,
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
    "maxHitText": "33 (Magic)",
    "isSlayerMonster": false
  },
  {
    "slug": "night-beast",
    "wikiId": 7409,
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
    "maxHitText": "31",
    "isSlayerMonster": true
  },
  {
    "slug": "nuclear-smoke-devil",
    "wikiId": 7406,
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
    "maxHitText": "29",
    "isSlayerMonster": true
  },
  {
    "slug": "nylocas-matomenos",
    "wikiId": 10862,
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
    "maxHitText": "11",
    "isSlayerMonster": false
  },
  {
    "slug": "nylocas-prinkipas",
    "wikiId": 10805,
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
    "maxHitText": "38",
    "isSlayerMonster": false
  },
  {
    "slug": "nylocas-vasilias",
    "wikiId": 8354,
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
    "maxHitText": "70",
    "isSlayerMonster": false
  },
  {
    "slug": "obelisk-tombs-of-amascut",
    "wikiId": 11751,
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
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "orca",
    "wikiId": 15204,
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
    "maxHitText": "13",
    "isSlayerMonster": false
  },
  {
    "slug": "penance-queen",
    "wikiId": 5775,
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
    "maxHitText": "13 (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "persten-the-deceitful",
    "wikiId": 12333,
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
    "maxHitText": "32",
    "isSlayerMonster": false
  },
  {
    "slug": "pestilent-bloat",
    "wikiId": 8359,
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
    "maxHitText": "20 (Flies)",
    "isSlayerMonster": false
  },
  {
    "slug": "phantom-muspah",
    "wikiId": 12078,
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
    "maxHitText": "34",
    "isSlayerMonster": true
  },
  {
    "slug": "phosanis-nightmare",
    "wikiId": 9416,
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
    "maxHitText": "73 (melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "porazdir",
    "wikiId": 7515,
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
    "maxHitText": "43 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "portal-pest-control",
    "wikiId": 1740,
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
    "maxHitText": "0 (Does not attack)",
    "isSlayerMonster": false
  },
  {
    "slug": "prince-itzla-arkan",
    "wikiId": 13784,
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
    "maxHitText": "12 (normal)",
    "isSlayerMonster": false
  },
  {
    "slug": "rabbit-prifddinas",
    "wikiId": 9118,
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
    "maxHitText": "40",
    "isSlayerMonster": false
  },
  {
    "slug": "ranging-ro",
    "wikiId": 13664,
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
    "maxHitText": "16",
    "isSlayerMonster": false
  },
  {
    "slug": "ranis-drakan",
    "wikiId": 8242,
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
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "repugnant-spectre",
    "wikiId": 7403,
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
    "maxHitText": "39",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-maledictus",
    "wikiId": 11246,
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
    "maxHitText": "30",
    "isSlayerMonster": true
  },
  {
    "slug": "robert-the-strong",
    "wikiId": 8057,
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
    "maxHitText": "34 (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "rune-dragon",
    "wikiId": 8031,
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
    "maxHitText": "29 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "rune-dragon-construction",
    "wikiId": 8027,
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
    "maxHitText": "29 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "sarachnis",
    "wikiId": 8713,
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
    "maxHitText": "31",
    "isSlayerMonster": true
  },
  {
    "slug": "scorpia",
    "wikiId": 6615,
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
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "screaming-twisted-banshee",
    "wikiId": 7391,
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
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "scurrius",
    "wikiId": 7221,
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
    "maxHitText": "13 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "sea-troll-queen",
    "wikiId": 4315,
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
    "maxHitText": "16 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "shadow-wyrm",
    "wikiId": 10399,
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
    "maxHitText": "28",
    "isSlayerMonster": true
  },
  {
    "slug": "shaeded-beast",
    "wikiId": 8709,
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
    "maxHitText": "30",
    "isSlayerMonster": false
  },
  {
    "slug": "shellbane-gryphon",
    "wikiId": 14860,
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
    "maxHitText": "22 <br/> 64 (whirlwinds) <br/> 30 (knockback)",
    "isSlayerMonster": true
  },
  {
    "slug": "shellbane-gryphon-troubled-tortugans",
    "wikiId": 15010,
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
    "maxHitText": "22",
    "isSlayerMonster": false
  },
  {
    "slug": "skeletal-wyvern",
    "wikiId": 468,
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
    "maxHitText": "13 (Ranged)",
    "isSlayerMonster": true
  },
  {
    "slug": "skotizo",
    "wikiId": 7286,
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
    "maxHitText": "38",
    "isSlayerMonster": true
  },
  {
    "slug": "sol-heredit",
    "wikiId": 12821,
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
    "maxHitText": "44 (Typeless AOE)",
    "isSlayerMonster": false
  },
  {
    "slug": "sotetseg",
    "wikiId": 8387,
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
    "maxHitText": "45 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "spindel",
    "wikiId": 11998,
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
    "maxHitText": "14 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "spitting-wyvern",
    "wikiId": 7794,
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
    "maxHitText": "9 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "steel-dragon",
    "wikiId": 7255,
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
    "maxHitText": "24 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "steel-dragon-construction",
    "wikiId": 139,
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
    "maxHitText": "22 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "strange-creature",
    "wikiId": 12063,
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
    "maxHitText": "24",
    "isSlayerMonster": false
  },
  {
    "slug": "strongbones",
    "wikiId": 11273,
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
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "surok-magis",
    "wikiId": 13482,
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
    "maxHitText": "45+ (Special)",
    "isSlayerMonster": false
  },
  {
    "slug": "taloned-wyvern",
    "wikiId": 7793,
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
    "maxHitText": "10 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "tar-monster",
    "wikiId": 7804,
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
    "maxHitText": "9",
    "isSlayerMonster": false
  },
  {
    "slug": "tekton",
    "wikiId": 7540,
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
    "maxHitText": "52",
    "isSlayerMonster": false
  },
  {
    "slug": "tentacle-abyssal-sire",
    "wikiId": 5912,
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
    "maxHitText": "31",
    "isSlayerMonster": false
  },
  {
    "slug": "the-everlasting",
    "wikiId": 3474,
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
    "maxHitText": "24",
    "isSlayerMonster": false
  },
  {
    "slug": "the-forsaken-assassin",
    "wikiId": 12328,
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
    "maxHitText": "20",
    "isSlayerMonster": false
  },
  {
    "slug": "the-hueycoatl",
    "wikiId": 14009,
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
    "maxHitText": "14",
    "isSlayerMonster": false
  },
  {
    "slug": "the-jormungand",
    "wikiId": 9290,
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
    "maxHitText": "22",
    "isSlayerMonster": true
  },
  {
    "slug": "the-leviathan",
    "wikiId": 12214,
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
    "maxHitText": "50 (Melee orb & Bite)",
    "isSlayerMonster": true
  },
  {
    "slug": "the-maiden-of-sugadinti",
    "wikiId": 8360,
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
    "maxHitText": "36",
    "isSlayerMonster": false
  },
  {
    "slug": "the-mimic",
    "wikiId": 8633,
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
    "maxHitText": "23",
    "isSlayerMonster": false
  },
  {
    "slug": "the-nightmare",
    "wikiId": 9425,
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
    "maxHitText": "50/60 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "the-whisperer",
    "wikiId": 12204,
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
    "maxHitText": "42 (x2) (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "thermonuclear-smoke-devil",
    "wikiId": 499,
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
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "tormented-demon",
    "wikiId": 13599,
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
    "maxHitText": "<div class=\"plainlist \" >\n*31 (auto)\n*45 (special)\n</div>",
    "isSlayerMonster": true
  },
  {
    "slug": "tortured-gorilla",
    "wikiId": 7150,
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
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "totem-phosanis-nightmare",
    "wikiId": 9435,
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
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "totem-the-nightmare",
    "wikiId": 9435,
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
    "maxHitText": "0",
    "isSlayerMonster": false
  },
  {
    "slug": "tumekens-warden",
    "wikiId": 11758,
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
    "maxHitText": "22",
    "isSlayerMonster": false
  },
  {
    "slug": "typhor",
    "wikiId": 9295,
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
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "tzhaar-ket",
    "wikiId": 7679,
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
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "tzkal-zuk",
    "wikiId": 7706,
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
    "maxHitText": "148&thinsp;",
    "isSlayerMonster": true
  },
  {
    "slug": "tztok-jad",
    "wikiId": 3127,
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
    "maxHitText": "97 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "tztok-jad-rek",
    "wikiId": 15557,
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
    "maxHitText": "25 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "umbra",
    "wikiId": 11284,
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
    "maxHitText": "29",
    "isSlayerMonster": false
  },
  {
    "slug": "vampyre-kraken",
    "wikiId": 15212,
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
    "maxHitText": "22",
    "isSlayerMonster": false
  },
  {
    "slug": "vanstrom-klause",
    "wikiId": 9567,
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
    "maxHitText": "24 (Standard)",
    "isSlayerMonster": true
  },
  {
    "slug": "vardorvis",
    "wikiId": 12223,
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
    "maxHitText": "32-43 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "vasa-nistirio",
    "wikiId": 7566,
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
    "maxHitText": "Varies",
    "isSlayerMonster": false
  },
  {
    "slug": "veiled-kraken",
    "wikiId": 15576,
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
    "maxHitText": "19",
    "isSlayerMonster": false
  },
  {
    "slug": "venenatis",
    "wikiId": 6610,
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
    "maxHitText": "21 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "verzik-vitur",
    "wikiId": 10850,
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
    "maxHitText": "44",
    "isSlayerMonster": false
  },
  {
    "slug": "vespula",
    "wikiId": 7530,
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
    "maxHitText": "14 (Ranged)",
    "isSlayerMonster": false
  },
  {
    "slug": "vetion",
    "wikiId": 6611,
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
    "maxHitText": "44",
    "isSlayerMonster": true
  },
  {
    "slug": "vitreous-chilled-jelly",
    "wikiId": 15501,
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
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "vitreous-warped-jelly",
    "wikiId": 7400,
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
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "void-knight-pest-control",
    "wikiId": 2950,
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
    "maxHitText": "0 (Does not attack)",
    "isSlayerMonster": false
  },
  {
    "slug": "vorkath",
    "wikiId": 8059,
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
    "maxHitText": "30 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "warped-terrorbird",
    "wikiId": 12499,
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
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "warped-tortoise",
    "wikiId": 12490,
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
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "xamphur",
    "wikiId": 10954,
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
    "maxHitText": "18",
    "isSlayerMonster": false
  },
  {
    "slug": "xarpus",
    "wikiId": 10772,
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
    "maxHitText": "11 (50+ recoil)",
    "isSlayerMonster": false
  },
  {
    "slug": "yama",
    "wikiId": 14176,
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
    "maxHitText": "46 (auto-attacks)",
    "isSlayerMonster": false
  },
  {
    "slug": "zalcano",
    "wikiId": 9050,
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
    "maxHitText": "N/A",
    "isSlayerMonster": false
  },
  {
    "slug": "zebak",
    "wikiId": 11730,
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
    "maxHitText": "38 (Melee)",
    "isSlayerMonster": false
  },
  {
    "slug": "zulrah",
    "wikiId": 2042,
    "name": "Zulrah",
    "version": "Serpentine",
    "combatLevel": 725,
    "hp": 500,
    "defenceLevel": 300,
    "magicLevel": 300,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -45,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zulrah (serpentine).png",
    "size": 5,
    "maxHitText": "41",
    "isSlayerMonster": true
  }
];

export const MONSTER_BY_SLUG: Record<string, MonsterCatalogEntry> = Object.fromEntries(
  MONSTER_CATALOG.map((m) => [m.slug, m]),
);
