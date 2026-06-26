// GENERATED FILE — do not edit by hand.
// Run `npm run build-monster-catalog` to regenerate from data/vendor/wgloop/monsters.json.
// Filter: HP >= 200 OR is_slayer_monster, excluding entries tagged ["Echo","Nightmare Zone"].

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
    "slug": "a-corpse",
    "wikiId": 15165,
    "name": "A corpse",
    "version": "",
    "combatLevel": 103,
    "hp": 90,
    "defenceLevel": 90,
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
      "severity": 50
    },
    "image": "A corpse.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "aberrant-spectre",
    "wikiId": 2,
    "name": "Aberrant spectre",
    "version": "",
    "combatLevel": 96,
    "hp": 90,
    "defenceLevel": 90,
    "magicLevel": 105,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 15,
      "rangedStandard": -15,
      "rangedLight": 15
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Aberrant spectre.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
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
    "slug": "abyssal-demon",
    "wikiId": 7241,
    "name": "Abyssal demon",
    "version": "Catacombs of Kourend",
    "combatLevel": 124,
    "hp": 150,
    "defenceLevel": 135,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Abyssal demon (Catacombs of Kourend).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
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
    "slug": "acidic-araxyte",
    "wikiId": 13675,
    "name": "Acidic Araxyte",
    "version": "",
    "combatLevel": 114,
    "hp": 58,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": -10,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Acidic Araxyte.png",
    "size": 2,
    "maxHitText": "15",
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
    "slug": "ahrim-the-blighted",
    "wikiId": 1672,
    "name": "Ahrim the Blighted",
    "version": "",
    "combatLevel": 98,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 103,
      "slash": 85,
      "crush": 117,
      "magic": 73,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Ahrim the Blighted.png",
    "size": 1,
    "maxHitText": "20",
    "isSlayerMonster": true
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
    "slug": "albino-bat",
    "wikiId": 1039,
    "name": "Albino bat",
    "version": "",
    "combatLevel": 52,
    "hp": 33,
    "defenceLevel": 30,
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
      "severity": 40
    },
    "image": "Albino bat.png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
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
    "slug": "ammonite-crab",
    "wikiId": 7799,
    "name": "Ammonite Crab",
    "version": "",
    "combatLevel": 25,
    "hp": 100,
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
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Ammonite Crab.png",
    "size": 2,
    "maxHitText": "1",
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
    "slug": "ancient-zygomite",
    "wikiId": 7797,
    "name": "Ancient Zygomite",
    "version": "",
    "combatLevel": 109,
    "hp": 150,
    "defenceLevel": 80,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 30,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Ancient Zygomite.png",
    "size": 2,
    "maxHitText": "9 (melee)",
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
    "slug": "ankou",
    "wikiId": 7864,
    "name": "Ankou",
    "version": "Level 98",
    "combatLevel": 98,
    "hp": 100,
    "defenceLevel": 80,
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
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Ankou.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "aquanite",
    "wikiId": 15497,
    "name": "Aquanite",
    "version": "Lure",
    "combatLevel": 145,
    "hp": 180,
    "defenceLevel": 70,
    "magicLevel": 170,
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
    "image": "Aquanite.png",
    "size": 2,
    "maxHitText": "18",
    "isSlayerMonster": true
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
    "slug": "araxyte",
    "wikiId": 11176,
    "name": "Araxyte",
    "version": "Level 146",
    "combatLevel": 146,
    "hp": 100,
    "defenceLevel": 70,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 60,
      "slash": 30,
      "crush": 20,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Araxyte (lv 146).png",
    "size": 2,
    "maxHitText": "17",
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
    "slug": "armoured-zombie-defender-of-varrock",
    "wikiId": 12730,
    "name": "Armoured zombie (Defender of Varrock)",
    "version": "Melee (invasion)",
    "combatLevel": 82,
    "hp": 75,
    "defenceLevel": 68,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Armoured zombie (melee, 5).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "armoured-zombie-zemouregals-base",
    "wikiId": 12720,
    "name": "Armoured zombie (Zemouregal's Base)",
    "version": "Melee",
    "combatLevel": 82,
    "hp": 75,
    "defenceLevel": 68,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Armoured zombie (melee, 5).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "armoured-zombie-zemouregals-fort",
    "wikiId": 14113,
    "name": "Armoured zombie (Zemouregal's Fort)",
    "version": "Melee, 1",
    "combatLevel": 105,
    "hp": 95,
    "defenceLevel": 68,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Armoured zombie (Zemouregal's Fort, 1).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
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
    "slug": "arrg",
    "wikiId": 643,
    "name": "Arrg",
    "version": "",
    "combatLevel": 113,
    "hp": 140,
    "defenceLevel": 40,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 35,
      "slash": 60,
      "crush": 35,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Arrg.png",
    "size": 2,
    "maxHitText": "38 (melee)",
    "isSlayerMonster": true
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
    "slug": "asyn-shade",
    "wikiId": 1284,
    "name": "Asyn Shade",
    "version": "Shade",
    "combatLevel": 100,
    "hp": 90,
    "defenceLevel": 70,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Asyn Shade.png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "asyn-shadow-temple-trekking",
    "wikiId": 5632,
    "name": "Asyn shadow (Temple Trekking)",
    "version": "",
    "combatLevel": 110,
    "hp": 94,
    "defenceLevel": 80,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Asyn Shade.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
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
    "slug": "aviansie",
    "wikiId": 3176,
    "name": "Aviansie",
    "version": "Level 148",
    "combatLevel": 148,
    "hp": 139,
    "defenceLevel": 160,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": -20
    },
    "attributes": [
      "flying"
    ],
    "weakness": {
      "element": "air",
      "severity": 45
    },
    "image": "Aviansie (level 148).png",
    "size": 2,
    "maxHitText": "16",
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
    "slug": "baby-black-dragon",
    "wikiId": 1871,
    "name": "Baby black dragon",
    "version": "Normal",
    "combatLevel": 83,
    "hp": 80,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 50,
      "crush": 50,
      "magic": 40,
      "rangedHeavy": 5,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Baby black dragon.png",
    "size": 2,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "baby-blue-dragon",
    "wikiId": 241,
    "name": "Baby blue dragon",
    "version": "1",
    "combatLevel": 48,
    "hp": 50,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 50,
      "crush": 50,
      "magic": 40,
      "rangedHeavy": 5,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Baby blue dragon (1).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "baby-red-dragon",
    "wikiId": 244,
    "name": "Baby red dragon",
    "version": "1",
    "combatLevel": 48,
    "hp": 50,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 50,
      "crush": 50,
      "magic": 40,
      "rangedHeavy": 10,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Baby red dragon (1).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "baby-roc",
    "wikiId": 762,
    "name": "Baby Roc",
    "version": "",
    "combatLevel": 75,
    "hp": 50,
    "defenceLevel": 70,
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
      "severity": 30
    },
    "image": "Baby Roc.png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
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
    "slug": "balfrug-kreeyath",
    "wikiId": 3132,
    "name": "Balfrug Kreeyath",
    "version": "",
    "combatLevel": 151,
    "hp": 161,
    "defenceLevel": 153,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 10,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 25
    },
    "image": "Balfrug Kreeyath.png",
    "size": 3,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "bandit",
    "wikiId": 6605,
    "name": "Bandit",
    "version": "Level 130",
    "combatLevel": 130,
    "hp": 155,
    "defenceLevel": 57,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 23,
      "crush": 22,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Bandit.png",
    "size": 1,
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "banshee",
    "wikiId": 414,
    "name": "Banshee",
    "version": "",
    "combatLevel": 23,
    "hp": 22,
    "defenceLevel": 22,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 5,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Banshee.png",
    "size": 2,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "basilisk",
    "wikiId": 417,
    "name": "Basilisk",
    "version": "",
    "combatLevel": 61,
    "hp": 75,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "basilisk-the-fremennik-exiles",
    "wikiId": 9283,
    "name": "Basilisk (The Fremennik Exiles)",
    "version": "1",
    "combatLevel": 61,
    "hp": 75,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "basilisk-unused",
    "wikiId": 418,
    "name": "Basilisk (unused)",
    "version": "",
    "combatLevel": 61,
    "hp": 75,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk (unused).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
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
    "slug": "basilisk-youngling",
    "wikiId": 9282,
    "name": "Basilisk Youngling",
    "version": "",
    "combatLevel": 57,
    "hp": 60,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Basilisk Youngling.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "bat",
    "wikiId": 2827,
    "name": "Bat",
    "version": "",
    "combatLevel": 6,
    "hp": 8,
    "defenceLevel": 5,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 2,
      "slash": 2,
      "crush": 5,
      "magic": 2,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Bat.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "bear-cub",
    "wikiId": 3908,
    "name": "Bear Cub",
    "version": "",
    "combatLevel": 15,
    "hp": 20,
    "defenceLevel": 10,
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
      "severity": 25
    },
    "image": "Bear Cub (1).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "berry",
    "wikiId": 4132,
    "name": "Berry",
    "version": "Awake",
    "combatLevel": 71,
    "hp": 90,
    "defenceLevel": 25,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 10,
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
    "image": "Berry.png",
    "size": 2,
    "maxHitText": "13",
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
    "slug": "big-wolf",
    "wikiId": 115,
    "name": "Big Wolf",
    "version": "Feldip Hills",
    "combatLevel": 73,
    "hp": 74,
    "defenceLevel": 62,
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
      "severity": 20
    },
    "image": "Big Wolf (Feldip Hills).png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "bird",
    "wikiId": 5240,
    "name": "Bird",
    "version": "Level 11",
    "combatLevel": 11,
    "hp": 10,
    "defenceLevel": 10,
    "magicLevel": 10,
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
    "image": "Bird (level 11).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "black-bear",
    "wikiId": 2839,
    "name": "Black bear",
    "version": "",
    "combatLevel": 19,
    "hp": 25,
    "defenceLevel": 13,
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
      "severity": 30
    },
    "image": "Black bear.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
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
    "slug": "black-demon-the-grand-tree",
    "wikiId": 1432,
    "name": "Black demon (The Grand Tree)",
    "version": "",
    "combatLevel": 172,
    "hp": 157,
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
    "image": "Black demon (The Grand Tree).png",
    "size": 3,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "black-demon-the-scar",
    "wikiId": 12385,
    "name": "Black demon (The Scar)",
    "version": "",
    "combatLevel": 172,
    "hp": 157,
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
    "image": "Black demon (3).png",
    "size": 3,
    "maxHitText": "16",
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
    "slug": "black-guard",
    "wikiId": 6046,
    "name": "Black Guard",
    "version": "Level 48, 1",
    "combatLevel": 48,
    "hp": 40,
    "defenceLevel": 45,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 40,
      "slash": 40,
      "crush": 40,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [],
    "weakness": null,
    "image": "Black Guard (level 48, 1).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "black-guard-berserker",
    "wikiId": 6051,
    "name": "Black Guard Berserker",
    "version": "Blue",
    "combatLevel": 66,
    "hp": 50,
    "defenceLevel": 60,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 60,
      "slash": 60,
      "crush": 60,
      "magic": 0,
      "rangedHeavy": 60,
      "rangedStandard": 60,
      "rangedLight": 60
    },
    "attributes": [],
    "weakness": null,
    "image": "Black Guard Berserker (blue).png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "black-heather",
    "wikiId": 301,
    "name": "Black Heather",
    "version": "",
    "combatLevel": 34,
    "hp": 37,
    "defenceLevel": 27,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Black Heather.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "black-knight",
    "wikiId": 11953,
    "name": "Black Knight",
    "version": "Hostile, female",
    "combatLevel": 33,
    "hp": 42,
    "defenceLevel": 25,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 73,
      "slash": 76,
      "crush": 70,
      "magic": -11,
      "rangedHeavy": 72,
      "rangedStandard": 72,
      "rangedLight": 72
    },
    "attributes": [],
    "weakness": null,
    "image": "Black Knight (female).png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "blessed-giant-rat",
    "wikiId": 4534,
    "name": "Blessed giant rat",
    "version": "1",
    "combatLevel": 9,
    "hp": 30,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -24,
      "slash": -24,
      "crush": -24,
      "magic": -24,
      "rangedHeavy": -24,
      "rangedStandard": -24,
      "rangedLight": -24
    },
    "attributes": [
      "rat"
    ],
    "weakness": null,
    "image": "Blessed giant rat (1).png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "blessed-spider",
    "wikiId": 4533,
    "name": "Blessed spider",
    "version": "Normal",
    "combatLevel": 39,
    "hp": 32,
    "defenceLevel": 35,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 16,
      "crush": 7,
      "magic": 12,
      "rangedHeavy": 16,
      "rangedStandard": 16,
      "rangedLight": 16
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Blessed spider.png",
    "size": 1,
    "maxHitText": "4",
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
    "slug": "bloodveld",
    "wikiId": 484,
    "name": "Bloodveld",
    "version": "Normal",
    "combatLevel": 76,
    "hp": 120,
    "defenceLevel": 30,
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
    "image": "Bloodveld.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "blue-dagannoth",
    "wikiId": 15166,
    "name": "Blue dagannoth",
    "version": "",
    "combatLevel": 100,
    "hp": 120,
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
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Blue dagannoth.png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "blue-dragon",
    "wikiId": 265,
    "name": "Blue dragon",
    "version": "1",
    "combatLevel": 111,
    "hp": 105,
    "defenceLevel": 95,
    "magicLevel": 1,
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
    "image": "Blue dragon (2).png",
    "size": 4,
    "maxHitText": "10 (Slash)",
    "isSlayerMonster": true
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
    "slug": "bouncer",
    "wikiId": 1224,
    "name": "Bouncer",
    "version": "",
    "combatLevel": 137,
    "hp": 116,
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
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Bouncer.png",
    "size": 2,
    "maxHitText": "13",
    "isSlayerMonster": true
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
    "slug": "brine-rat",
    "wikiId": 4501,
    "name": "Brine rat",
    "version": "",
    "combatLevel": 70,
    "hp": 50,
    "defenceLevel": 40,
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
      "rat"
    ],
    "weakness": null,
    "image": "Brine rat.png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "bronze-dragon",
    "wikiId": 7253,
    "name": "Bronze dragon",
    "version": "Catacombs of Kourend",
    "combatLevel": 143,
    "hp": 122,
    "defenceLevel": 112,
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
    "image": "Bronze dragon.png",
    "size": 4,
    "maxHitText": "14 (Melee)",
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
    "slug": "brutus",
    "wikiId": 15626,
    "name": "Brutus",
    "version": "",
    "combatLevel": 30,
    "hp": 58,
    "defenceLevel": 10,
    "magicLevel": 8,
    "defenceBonuses": {
      "stab": -7,
      "slash": -7,
      "crush": -7,
      "magic": -3,
      "rangedHeavy": -7,
      "rangedStandard": -7,
      "rangedLight": -7
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Brutus.png",
    "size": 3,
    "maxHitText": "3 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "bryophyta",
    "wikiId": 8195,
    "name": "Bryophyta",
    "version": "",
    "combatLevel": 128,
    "hp": 115,
    "defenceLevel": 100,
    "magicLevel": 90,
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
      "severity": 50
    },
    "image": "Bryophyta.png",
    "size": 3,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "buffalo",
    "wikiId": 13004,
    "name": "Buffalo",
    "version": "",
    "combatLevel": 9,
    "hp": 20,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -21,
      "slash": -21,
      "crush": -21,
      "magic": -21,
      "rangedHeavy": -21,
      "rangedStandard": -21,
      "rangedLight": -21
    },
    "attributes": [],
    "weakness": null,
    "image": "Buffalo.png",
    "size": 2,
    "maxHitText": "2",
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
    "slug": "calvarion",
    "wikiId": 11993,
    "name": "Calvar'ion",
    "version": "Normal",
    "combatLevel": 264,
    "hp": 150,
    "defenceLevel": 225,
    "magicLevel": 178,
    "defenceBonuses": {
      "stab": 130,
      "slash": 128,
      "crush": -10,
      "magic": 198,
      "rangedHeavy": 211,
      "rangedStandard": 211,
      "rangedLight": 211
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Calvar'ion.png",
    "size": 3,
    "maxHitText": "26",
    "isSlayerMonster": true
  },
  {
    "slug": "catablepon",
    "wikiId": 2475,
    "name": "Catablepon",
    "version": "Level 64",
    "combatLevel": 64,
    "hp": 70,
    "defenceLevel": 50,
    "magicLevel": 45,
    "defenceBonuses": {
      "stab": 50,
      "slash": 40,
      "crush": 30,
      "magic": 30,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Catablepon.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-abomination",
    "wikiId": 7401,
    "name": "Cave abomination",
    "version": "",
    "combatLevel": 206,
    "hp": 130,
    "defenceLevel": 142,
    "magicLevel": 230,
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
    "image": "Cave abomination.png",
    "size": 2,
    "maxHitText": "24",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-bug",
    "wikiId": 483,
    "name": "Cave bug",
    "version": "Level 96",
    "combatLevel": 96,
    "hp": 93,
    "defenceLevel": 84,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 72,
      "slash": 59,
      "crush": 35,
      "magic": 25,
      "rangedHeavy": 95,
      "rangedStandard": 95,
      "rangedLight": 95
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Cave bug (level 96).png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-crawler",
    "wikiId": 13800,
    "name": "Cave crawler",
    "version": "Icy (1)",
    "combatLevel": 23,
    "hp": 22,
    "defenceLevel": 18,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 5,
      "magic": 5,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Cave crawler (icy) (1).png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-goblin-monster",
    "wikiId": 6437,
    "name": "Cave goblin (monster)",
    "version": "Backpack",
    "combatLevel": 3,
    "hp": 10,
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
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Cave goblin (monster, backpack).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-goblin-guard",
    "wikiId": 5335,
    "name": "Cave goblin guard",
    "version": "Level 24",
    "combatLevel": 24,
    "hp": 26,
    "defenceLevel": 22,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 15,
      "crush": 19,
      "magic": -3,
      "rangedHeavy": 12,
      "rangedStandard": 12,
      "rangedLight": 12
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Cave goblin guard (level 24).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-goblin-miner",
    "wikiId": 5330,
    "name": "Cave goblin miner",
    "version": "1",
    "combatLevel": 11,
    "hp": 10,
    "defenceLevel": 7,
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
      "severity": 40
    },
    "image": "Cave goblin miner.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-horror",
    "wikiId": 1051,
    "name": "Cave horror",
    "version": "Alpha",
    "combatLevel": 80,
    "hp": 55,
    "defenceLevel": 62,
    "magicLevel": 80,
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
      "severity": 30
    },
    "image": "Cave horror (5).png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-kraken",
    "wikiId": 492,
    "name": "Cave kraken",
    "version": "Cave kraken",
    "combatLevel": 127,
    "hp": 125,
    "defenceLevel": 150,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -63,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Cave kraken.png",
    "size": 2,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "cave-slime",
    "wikiId": 480,
    "name": "Cave slime",
    "version": "",
    "combatLevel": 23,
    "hp": 25,
    "defenceLevel": 35,
    "magicLevel": 13,
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
      "severity": 50
    },
    "image": "Cave slime.png",
    "size": 1,
    "maxHitText": "2",
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
    "slug": "chaos-druid",
    "wikiId": 520,
    "name": "Chaos druid",
    "version": "",
    "combatLevel": 13,
    "hp": 20,
    "defenceLevel": 12,
    "magicLevel": 10,
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
    "image": "Chaos druid.png",
    "size": 1,
    "maxHitText": "2 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "chaos-druid-warrior",
    "wikiId": 532,
    "name": "Chaos druid warrior",
    "version": "",
    "combatLevel": 37,
    "hp": 40,
    "defenceLevel": 25,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 13,
      "slash": 17,
      "crush": 14,
      "magic": -4,
      "rangedHeavy": 14,
      "rangedStandard": 14,
      "rangedLight": 14
    },
    "attributes": [],
    "weakness": null,
    "image": "Chaos druid warrior.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "chaos-dwarf",
    "wikiId": 291,
    "name": "Chaos dwarf",
    "version": "",
    "combatLevel": 48,
    "hp": 61,
    "defenceLevel": 28,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 40,
      "slash": 34,
      "crush": 25,
      "magic": 10,
      "rangedHeavy": 35,
      "rangedStandard": 35,
      "rangedLight": 35
    },
    "attributes": [],
    "weakness": null,
    "image": "Chaos dwarf.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "chasm-crawler",
    "wikiId": 14031,
    "name": "Chasm Crawler",
    "version": "Icy",
    "combatLevel": 68,
    "hp": 60,
    "defenceLevel": 55,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 41,
      "slash": 43,
      "crush": 23,
      "magic": 24,
      "rangedHeavy": 40,
      "rangedStandard": 20,
      "rangedLight": 40
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Chasm Crawler (icy).png",
    "size": 3,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "chicken",
    "wikiId": 1173,
    "name": "Chicken",
    "version": "Normal",
    "combatLevel": 1,
    "hp": 3,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": null,
    "image": "Chicken (1).png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "chilled-jelly",
    "wikiId": 13799,
    "name": "Chilled jelly",
    "version": "",
    "combatLevel": 112,
    "hp": 140,
    "defenceLevel": 70,
    "magicLevel": 95,
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
      "severity": 50
    },
    "image": "Chilled jelly.png",
    "size": 1,
    "maxHitText": "10",
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
    "slug": "chompy-bird",
    "wikiId": 1475,
    "name": "Chompy bird",
    "version": "",
    "combatLevel": 6,
    "hp": 10,
    "defenceLevel": 3,
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
    "image": "Chompy bird.png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "chuck-up",
    "wikiId": 15169,
    "name": "Chuck up",
    "version": "",
    "combatLevel": 98,
    "hp": 110,
    "defenceLevel": 90,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 120,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Chuck up.png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "city-guard",
    "wikiId": 4373,
    "name": "City guard",
    "version": "",
    "combatLevel": 83,
    "hp": 80,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 13,
      "slash": 24,
      "crush": 19,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "City guard.png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "cockathrice",
    "wikiId": 7393,
    "name": "Cockathrice",
    "version": "",
    "combatLevel": 89,
    "hp": 95,
    "defenceLevel": 78,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Cockathrice.png",
    "size": 3,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "cockatrice",
    "wikiId": 419,
    "name": "Cockatrice",
    "version": "",
    "combatLevel": 37,
    "hp": 37,
    "defenceLevel": 37,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 0,
      "magic": 10,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Cockatrice.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "cockatrice-unused",
    "wikiId": 420,
    "name": "Cockatrice (unused)",
    "version": "",
    "combatLevel": 37,
    "hp": 37,
    "defenceLevel": 37,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 0,
      "magic": 10,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Cockatrice (unused).png",
    "size": 2,
    "maxHitText": "5",
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
    "slug": "corrupt-lizardman",
    "wikiId": 8000,
    "name": "Corrupt Lizardman",
    "version": "",
    "combatLevel": 46,
    "hp": 50,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -10,
      "slash": 25,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Corrupt Lizardman.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "count-draynor",
    "wikiId": 3481,
    "name": "Count Draynor",
    "version": "",
    "combatLevel": 34,
    "hp": 35,
    "defenceLevel": 30,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 2,
      "slash": 1,
      "crush": 3,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "vampyre1"
    ],
    "weakness": null,
    "image": "Count Draynor.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "cow",
    "wikiId": 2790,
    "name": "Cow",
    "version": "1",
    "combatLevel": 2,
    "hp": 8,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -21,
      "slash": -21,
      "crush": -21,
      "magic": -21,
      "rangedHeavy": -21,
      "rangedStandard": -21,
      "rangedLight": -21
    },
    "attributes": [],
    "weakness": null,
    "image": "Cow (1).png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "cow-calf",
    "wikiId": 2792,
    "name": "Cow calf",
    "version": "1",
    "combatLevel": 2,
    "hp": 6,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -26,
      "slash": -26,
      "crush": -26,
      "magic": -26,
      "rangedHeavy": -26,
      "rangedStandard": -26,
      "rangedLight": -26
    },
    "attributes": [],
    "weakness": null,
    "image": "Cow calf.png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "crab",
    "wikiId": 4819,
    "name": "Crab",
    "version": "Level 23",
    "combatLevel": 23,
    "hp": 19,
    "defenceLevel": 26,
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
      "severity": 20
    },
    "image": "Crab.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "crawling-hand",
    "wikiId": 453,
    "name": "Crawling Hand",
    "version": "Level 12 (1)",
    "combatLevel": 12,
    "hp": 19,
    "defenceLevel": 7,
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
      "undead"
    ],
    "weakness": null,
    "image": "Crawling Hand (level 12, 1).png",
    "size": 2,
    "maxHitText": "2",
    "isSlayerMonster": true
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
    "slug": "crocodile",
    "wikiId": 11582,
    "name": "Crocodile",
    "version": "Land",
    "combatLevel": 63,
    "hp": 62,
    "defenceLevel": 54,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 12,
      "crush": 22,
      "magic": 10,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Crocodile.png",
    "size": 2,
    "maxHitText": "6",
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
    "slug": "crushing-hand",
    "wikiId": 7388,
    "name": "Crushing hand",
    "version": "",
    "combatLevel": 45,
    "hp": 55,
    "defenceLevel": 14,
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
      "undead"
    ],
    "weakness": null,
    "image": "Crushing hand.png",
    "size": 3,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "crypt-rat",
    "wikiId": 1679,
    "name": "Crypt rat",
    "version": "",
    "combatLevel": 43,
    "hp": 35,
    "defenceLevel": 20,
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
      "rat"
    ],
    "weakness": null,
    "image": "Crypt rat.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "crypt-spider",
    "wikiId": 1683,
    "name": "Crypt spider",
    "version": "",
    "combatLevel": 56,
    "hp": 60,
    "defenceLevel": 45,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 10,
      "magic": 17,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Crypt spider.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "cyclops",
    "wikiId": 2137,
    "name": "Cyclops",
    "version": "Level 106",
    "combatLevel": 106,
    "hp": 150,
    "defenceLevel": 55,
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
    "image": "Cyclops (level 56, 2).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "cyclops-ardougne-zoo",
    "wikiId": 2097,
    "name": "Cyclops (Ardougne Zoo)",
    "version": "",
    "combatLevel": 56,
    "hp": 55,
    "defenceLevel": 46,
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
    "image": "Cyclops.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "cyclops-catacombs-of-kourend",
    "wikiId": 7270,
    "name": "Cyclops (Catacombs of Kourend)",
    "version": "Level 76",
    "combatLevel": 76,
    "hp": 100,
    "defenceLevel": 35,
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
    "image": "Cyclops (level 76, 2).png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "cyclops-god-wars-dungeon",
    "wikiId": 2235,
    "name": "Cyclops (God Wars Dungeon)",
    "version": "Green",
    "combatLevel": 81,
    "hp": 110,
    "defenceLevel": 48,
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
    "image": "Cyclops (GWD).png",
    "size": 2,
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "dad",
    "wikiId": 4130,
    "name": "Dad",
    "version": "",
    "combatLevel": 101,
    "hp": 120,
    "defenceLevel": 50,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 40,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Dad.png",
    "size": 3,
    "maxHitText": "27",
    "isSlayerMonster": true
  },
  {
    "slug": "daddys-special-water",
    "wikiId": 15167,
    "name": "Daddy's special water",
    "version": "",
    "combatLevel": 125,
    "hp": 120,
    "defenceLevel": 99,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 40,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Daddy's special water.png",
    "size": 3,
    "maxHitText": "27",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth",
    "wikiId": 973,
    "name": "Dagannoth",
    "version": "Level 92 (1)",
    "combatLevel": 92,
    "hp": 120,
    "defenceLevel": 71,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth-waterbirth-island",
    "wikiId": 3185,
    "name": "Dagannoth (Waterbirth Island)",
    "version": "Level 90",
    "combatLevel": 90,
    "hp": 95,
    "defenceLevel": 65,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth (Waterbirth Island, level 90).png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth-fledgeling",
    "wikiId": 2264,
    "name": "Dagannoth fledgeling",
    "version": "",
    "combatLevel": 70,
    "hp": 100,
    "defenceLevel": 50,
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
      "severity": 35
    },
    "image": "Dagannoth fledgeling.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "dagannoth-mother",
    "wikiId": 980,
    "name": "Dagannoth mother",
    "version": "",
    "combatLevel": 100,
    "hp": 120,
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
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Dagannoth mother white.png",
    "size": 3,
    "maxHitText": "9 (Melee)",
    "isSlayerMonster": true
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
    "slug": "dagannoth-spawn",
    "wikiId": 3184,
    "name": "Dagannoth spawn",
    "version": "",
    "combatLevel": 42,
    "hp": 35,
    "defenceLevel": 25,
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
      "severity": 35
    },
    "image": "Dagannoth spawn.png",
    "size": 1,
    "maxHitText": "4",
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
    "slug": "dark-ankou",
    "wikiId": 7296,
    "name": "Dark Ankou",
    "version": "",
    "combatLevel": 95,
    "hp": 60,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Dark Ankou.png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
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
    "slug": "dark-energy-core",
    "wikiId": 320,
    "name": "Dark energy core",
    "version": "",
    "combatLevel": 75,
    "hp": 25,
    "defenceLevel": 20,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": -5,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": null,
    "image": "Dark energy core.png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "dark-warrior",
    "wikiId": 6606,
    "name": "Dark warrior",
    "version": "Level 145",
    "combatLevel": 145,
    "hp": 165,
    "defenceLevel": 55,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 106,
      "slash": 109,
      "crush": 139,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Dark warrior.png",
    "size": 1,
    "maxHitText": "18",
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
    "slug": "deadly-red-spider",
    "wikiId": 3021,
    "name": "Deadly red spider",
    "version": "",
    "combatLevel": 34,
    "hp": 35,
    "defenceLevel": 30,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 16,
      "crush": 7,
      "magic": 12,
      "rangedHeavy": 16,
      "rangedStandard": 16,
      "rangedLight": 16
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Deadly red spider.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "death-wing",
    "wikiId": 509,
    "name": "Death wing",
    "version": "",
    "combatLevel": 83,
    "hp": 80,
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
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Death wing.png",
    "size": 2,
    "maxHitText": "8 (approx)",
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
    "slug": "desert-lizard",
    "wikiId": 459,
    "name": "Desert Lizard",
    "version": "Green",
    "combatLevel": 24,
    "hp": 25,
    "defenceLevel": 20,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": null,
    "image": "Desert Lizard (green).png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "desert-wolf",
    "wikiId": 4649,
    "name": "Desert Wolf",
    "version": "1",
    "combatLevel": 27,
    "hp": 34,
    "defenceLevel": 22,
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
    "image": "Desert Wolf.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
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
    "slug": "deviant-spectre",
    "wikiId": 7279,
    "name": "Deviant spectre",
    "version": "",
    "combatLevel": 169,
    "hp": 190,
    "defenceLevel": 90,
    "magicLevel": 205,
    "defenceBonuses": {
      "stab": 80,
      "slash": 80,
      "crush": 80,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 85,
      "rangedLight": 85
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Deviant spectre.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "dharok-the-wretched",
    "wikiId": 1673,
    "name": "Dharok the Wretched",
    "version": "",
    "combatLevel": 115,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 252,
      "slash": 250,
      "crush": 244,
      "magic": -11,
      "rangedHeavy": 249,
      "rangedStandard": 249,
      "rangedLight": 249
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Dharok the Wretched.png",
    "size": 1,
    "maxHitText": "29 (normal)",
    "isSlayerMonster": true
  },
  {
    "slug": "dinky-the-drink-troll",
    "wikiId": 15171,
    "name": "Dinky the drink troll",
    "version": "",
    "combatLevel": 0,
    "hp": 140,
    "defenceLevel": 40,
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
    "weakness": {
      "element": "earth",
      "severity": 0
    },
    "image": "Dinky the drink troll.png",
    "size": 1,
    "maxHitText": "51+",
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
    "slug": "dire-wolf",
    "wikiId": 3426,
    "name": "Dire Wolf",
    "version": "Level 88",
    "combatLevel": 88,
    "hp": 85,
    "defenceLevel": 75,
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
    "image": "Dire Wolf.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "dire-wolf-alpha",
    "wikiId": 13812,
    "name": "Dire Wolf Alpha",
    "version": "",
    "combatLevel": 113,
    "hp": 100,
    "defenceLevel": 80,
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
      "element": "none",
      "severity": 0
    },
    "image": "Dire Wolf Alpha.png",
    "size": 3,
    "maxHitText": "12",
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
    "slug": "donny-the-lad",
    "wikiId": 302,
    "name": "Donny the lad",
    "version": "",
    "combatLevel": 34,
    "hp": 37,
    "defenceLevel": 27,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Donny the lad.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
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
    "slug": "drink-troll",
    "wikiId": 15164,
    "name": "Drink troll",
    "version": "",
    "combatLevel": 14,
    "hp": 25,
    "defenceLevel": 9,
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
    "image": "Drink troll.png",
    "size": 1,
    "maxHitText": "2",
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
    "slug": "duck",
    "wikiId": 1839,
    "name": "Duck",
    "version": "Female",
    "combatLevel": 1,
    "hp": 3,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": null,
    "image": "Duck (female).png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "duckling",
    "wikiId": 2001,
    "name": "Duckling",
    "version": "",
    "combatLevel": 1,
    "hp": 3,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": null,
    "image": "Duckling.png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "duke-monkey",
    "wikiId": 5258,
    "name": "Duke (monkey)",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Duke.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
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
    "slug": "dungeon-rat",
    "wikiId": 2865,
    "name": "Dungeon rat",
    "version": "Full tail",
    "combatLevel": 12,
    "hp": 12,
    "defenceLevel": 10,
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
      "rat"
    ],
    "weakness": null,
    "image": "Dungeon rat.png",
    "size": 2,
    "maxHitText": "2",
    "isSlayerMonster": true
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
    "slug": "dust-devil",
    "wikiId": 7249,
    "name": "Dust devil",
    "version": "Catacombs of Kourend",
    "combatLevel": 110,
    "hp": 130,
    "defenceLevel": 40,
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
      "severity": 35
    },
    "image": "Dust devil.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "dwarf",
    "wikiId": 292,
    "name": "Dwarf",
    "version": "Standard (Level 20)",
    "combatLevel": 20,
    "hp": 26,
    "defenceLevel": 16,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 5,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Dwarf (Level 20).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "dwarf-gang-member",
    "wikiId": 1354,
    "name": "Dwarf gang member",
    "version": "Level 44",
    "combatLevel": 44,
    "hp": 40,
    "defenceLevel": 35,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 7,
      "slash": 7,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 7,
      "rangedStandard": 7,
      "rangedLight": 7
    },
    "attributes": [],
    "weakness": null,
    "image": "Dwarf gang member (1).png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "earth-warrior",
    "wikiId": 2840,
    "name": "Earth warrior",
    "version": "",
    "combatLevel": 51,
    "hp": 54,
    "defenceLevel": 42,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 40,
      "crush": 20,
      "magic": 10,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": null,
    "image": "Earth warrior.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "earthen-nagua",
    "wikiId": 14420,
    "name": "Earthen Nagua",
    "version": "Normal",
    "combatLevel": 128,
    "hp": 160,
    "defenceLevel": 40,
    "magicLevel": 40,
    "defenceBonuses": {
      "stab": 30,
      "slash": 50,
      "crush": 50,
      "magic": 60,
      "rangedHeavy": 150,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "Earthen Nagua.png",
    "size": 2,
    "maxHitText": "13 total",
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
    "slug": "elder-chaos-druid",
    "wikiId": 6607,
    "name": "Elder Chaos druid",
    "version": "",
    "combatLevel": 129,
    "hp": 150,
    "defenceLevel": 65,
    "magicLevel": 110,
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
    "image": "Elder Chaos druid.png",
    "size": 1,
    "maxHitText": "17",
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
    "slug": "elf-archer",
    "wikiId": 5295,
    "name": "Elf Archer",
    "version": "1",
    "combatLevel": 90,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 60,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": null,
    "image": "Elf Archer (1).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "elf-warrior",
    "wikiId": 5293,
    "name": "Elf Warrior",
    "version": "1",
    "combatLevel": 108,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Elf Warrior (1).png",
    "size": 1,
    "maxHitText": "10",
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
    "slug": "elvarg",
    "wikiId": 817,
    "name": "Elvarg",
    "version": "",
    "combatLevel": 83,
    "hp": 80,
    "defenceLevel": 70,
    "magicLevel": 70,
    "defenceBonuses": {
      "stab": 20,
      "slash": 40,
      "crush": 40,
      "magic": 30,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 30
    },
    "image": "Elvarg.png",
    "size": 4,
    "maxHitText": "8 (Slash)",
    "isSlayerMonster": true
  },
  {
    "slug": "enclave-guard",
    "wikiId": 4381,
    "name": "Enclave guard",
    "version": "",
    "combatLevel": 83,
    "hp": 80,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 13,
      "slash": 24,
      "crush": 19,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Enclave guard.png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
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
    "slug": "ent",
    "wikiId": 6594,
    "name": "Ent",
    "version": "Wilderness",
    "combatLevel": 101,
    "hp": 105,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 40,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Ent (lv 101).png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "entrana-firebird",
    "wikiId": 4927,
    "name": "Entrana firebird",
    "version": "",
    "combatLevel": 2,
    "hp": 5,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -26,
      "slash": -26,
      "crush": -26,
      "magic": -26,
      "rangedHeavy": -26,
      "rangedStandard": -26,
      "rangedLight": -26
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 100
    },
    "image": "Entrana firebird.png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "evil-chicken",
    "wikiId": 6739,
    "name": "Evil Chicken",
    "version": "",
    "combatLevel": 159,
    "hp": 120,
    "defenceLevel": 126,
    "magicLevel": 200,
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
    "image": "Evil Chicken.png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "evil-chicken-recipe-for-disaster",
    "wikiId": 1870,
    "name": "Evil Chicken (Recipe for Disaster)",
    "version": "",
    "combatLevel": 159,
    "hp": 120,
    "defenceLevel": 126,
    "magicLevel": 200,
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
    "image": "Evil Chicken.png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "feral-vampyre",
    "wikiId": 5642,
    "name": "Feral Vampyre",
    "version": "Level 130 (Temple Trekking)",
    "combatLevel": 130,
    "hp": 185,
    "defenceLevel": 30,
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
    "attributes": [
      "vampyre1"
    ],
    "weakness": null,
    "image": "Feral Vampyre (Temple Trekking).png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "fever-spider",
    "wikiId": 626,
    "name": "Fever spider",
    "version": "",
    "combatLevel": 49,
    "hp": 40,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 15,
      "crush": 10,
      "magic": 15,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Fever spider.png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "fire-giant",
    "wikiId": 7251,
    "name": "Fire giant",
    "version": "Level 109",
    "combatLevel": 109,
    "hp": 150,
    "defenceLevel": 65,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "fiery"
    ],
    "weakness": {
      "element": "water",
      "severity": 100
    },
    "image": "Fire giant (5).png",
    "size": 2,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "fiyr-shade",
    "wikiId": 1286,
    "name": "Fiyr Shade",
    "version": "Shade",
    "combatLevel": 120,
    "hp": 110,
    "defenceLevel": 85,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Fiyr Shade.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
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
    "slug": "flaming-pyrelord",
    "wikiId": 7394,
    "name": "Flaming pyrelord",
    "version": "",
    "combatLevel": 97,
    "hp": 125,
    "defenceLevel": 52,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 18,
      "slash": 18,
      "crush": 18,
      "magic": 0,
      "rangedHeavy": 18,
      "rangedStandard": 18,
      "rangedLight": 18
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 100
    },
    "image": "Flaming pyrelord.png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "flesh-crawler",
    "wikiId": 2498,
    "name": "Flesh Crawler",
    "version": "Level 28",
    "combatLevel": 28,
    "hp": 25,
    "defenceLevel": 10,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 15,
      "crush": 15,
      "magic": 15,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 20
    },
    "image": "Flesh Crawler.png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "flight-kilisa",
    "wikiId": 3165,
    "name": "Flight Kilisa",
    "version": "",
    "combatLevel": 159,
    "hp": 133,
    "defenceLevel": 175,
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
    "attributes": [
      "flying"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Flight Kilisa.png",
    "size": 2,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "flockleader-geerin",
    "wikiId": 3164,
    "name": "Flockleader Geerin",
    "version": "",
    "combatLevel": 149,
    "hp": 132,
    "defenceLevel": 175,
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
    "attributes": [
      "flying"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Flockleader Geerin.png",
    "size": 2,
    "maxHitText": "25",
    "isSlayerMonster": true
  },
  {
    "slug": "forgotten-soul",
    "wikiId": 10544,
    "name": "Forgotten Soul",
    "version": "1",
    "combatLevel": 20,
    "hp": 50,
    "defenceLevel": 12,
    "magicLevel": 10,
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
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Forgotten Soul.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
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
    "slug": "frenzied-ice-troll-female",
    "wikiId": 5825,
    "name": "Frenzied ice troll female",
    "version": "",
    "combatLevel": 82,
    "hp": 80,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Frenzied ice troll female.png",
    "size": 1,
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "frenzied-ice-troll-grunt",
    "wikiId": 5826,
    "name": "Frenzied ice troll grunt",
    "version": "",
    "combatLevel": 102,
    "hp": 80,
    "defenceLevel": 60,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Frenzied ice troll grunt.png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "frenzied-ice-troll-male",
    "wikiId": 5824,
    "name": "Frenzied ice troll male",
    "version": "",
    "combatLevel": 82,
    "hp": 80,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Frenzied ice troll male.png",
    "size": 1,
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "frenzied-ice-troll-runt",
    "wikiId": 5823,
    "name": "Frenzied ice troll runt",
    "version": "",
    "combatLevel": 74,
    "hp": 60,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Frenzied ice troll runt.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "frost-crab",
    "wikiId": 13789,
    "name": "Frost Crab",
    "version": "Active",
    "combatLevel": 15,
    "hp": 60,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -50,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Frost Crab.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "frost-nagua",
    "wikiId": 13728,
    "name": "Frost Nagua",
    "version": "",
    "combatLevel": 104,
    "hp": 120,
    "defenceLevel": 40,
    "magicLevel": 90,
    "defenceBonuses": {
      "stab": 0,
      "slash": 50,
      "crush": 10,
      "magic": 60,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Frost Nagua.png",
    "size": 1,
    "maxHitText": "12 total",
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
    "slug": "gargoyle",
    "wikiId": 1543,
    "name": "Gargoyle",
    "version": "Basement",
    "combatLevel": 111,
    "hp": 105,
    "defenceLevel": 107,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 60,
      "crush": -20,
      "magic": 20,
      "rangedHeavy": -20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "golem"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Gargoyle.png",
    "size": 3,
    "maxHitText": "11",
    "isSlayerMonster": true
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
    "slug": "ghost",
    "wikiId": 2527,
    "name": "Ghost",
    "version": "Level 77",
    "combatLevel": 77,
    "hp": 80,
    "defenceLevel": 68,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 55,
      "slash": 55,
      "crush": 5,
      "magic": 55,
      "rangedHeavy": 55,
      "rangedStandard": 55,
      "rangedLight": 55
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Ghost.png",
    "size": 1,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "ghost-grave-of-scorpius",
    "wikiId": 5370,
    "name": "Ghost (Grave of Scorpius)",
    "version": "",
    "combatLevel": 24,
    "hp": 20,
    "defenceLevel": 23,
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
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Ghost (Grave of Scorpius).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "ghost-melzars-maze",
    "wikiId": 3975,
    "name": "Ghost (Melzar's Maze)",
    "version": "1",
    "combatLevel": 19,
    "hp": 25,
    "defenceLevel": 18,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 5,
      "magic": -5,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Ghost (Melzar's Maze).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "ghoul",
    "wikiId": 289,
    "name": "Ghoul",
    "version": "",
    "combatLevel": 42,
    "hp": 50,
    "defenceLevel": 30,
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
    "image": "Ghoul.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-bat",
    "wikiId": 2834,
    "name": "Giant bat",
    "version": "Normal",
    "combatLevel": 27,
    "hp": 32,
    "defenceLevel": 22,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 8,
      "rangedStandard": 8,
      "rangedLight": 8
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 10
    },
    "image": "Giant bat.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-bat-brine-rat-cavern",
    "wikiId": 4504,
    "name": "Giant bat (Brine Rat Cavern)",
    "version": "",
    "combatLevel": 27,
    "hp": 32,
    "defenceLevel": 22,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 8,
      "rangedStandard": 8,
      "rangedLight": 8
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 10
    },
    "image": "Giant bat (Brine Rat Cavern).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-crypt-rat",
    "wikiId": 1680,
    "name": "Giant crypt rat",
    "version": "",
    "combatLevel": 76,
    "hp": 70,
    "defenceLevel": 65,
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
      "rat"
    ],
    "weakness": null,
    "image": "Giant crypt rat.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-crypt-spider",
    "wikiId": 1684,
    "name": "Giant crypt spider",
    "version": "",
    "combatLevel": 79,
    "hp": 80,
    "defenceLevel": 65,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 10,
      "magic": 17,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Giant crypt spider.png",
    "size": 1,
    "maxHitText": "8",
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
    "slug": "giant-lobster",
    "wikiId": 4799,
    "name": "Giant lobster",
    "version": "",
    "combatLevel": 45,
    "hp": 50,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 15,
      "magic": 99,
      "rangedHeavy": 70,
      "rangedStandard": 50,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Giant lobster.png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-lobster-ghosts-ahoy",
    "wikiId": 2994,
    "name": "Giant lobster (Ghosts Ahoy)",
    "version": "",
    "combatLevel": 32,
    "hp": 32,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 5,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": null,
    "image": "Giant lobster (Ghosts Ahoy).png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
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
    "slug": "giant-rat",
    "wikiId": 2510,
    "name": "Giant rat",
    "version": "Level 26",
    "combatLevel": 26,
    "hp": 25,
    "defenceLevel": 22,
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
      "rat"
    ],
    "weakness": null,
    "image": "Giant rat.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-rat-scurrius",
    "wikiId": 7223,
    "name": "Giant rat (Scurrius)",
    "version": "",
    "combatLevel": 46,
    "hp": 15,
    "defenceLevel": 10,
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
      "rat"
    ],
    "weakness": null,
    "image": "Giant rat (Scurrius).png",
    "size": 2,
    "maxHitText": "4",
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
    "slug": "giant-rock-crab",
    "wikiId": 2261,
    "name": "Giant Rock Crab",
    "version": "1",
    "combatLevel": 137,
    "hp": 180,
    "defenceLevel": 200,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 225,
      "slash": 200,
      "crush": 175,
      "magic": -10,
      "rangedHeavy": 80,
      "rangedStandard": 250,
      "rangedLight": 250
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Giant Rock Crab.png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-rockslug",
    "wikiId": 7392,
    "name": "Giant rockslug",
    "version": "",
    "combatLevel": 86,
    "hp": 77,
    "defenceLevel": 77,
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
      "severity": 20
    },
    "image": "Giant rockslug.png",
    "size": 3,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-scarab",
    "wikiId": 797,
    "name": "Giant Scarab",
    "version": "",
    "combatLevel": 191,
    "hp": 130,
    "defenceLevel": 169,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 70,
      "slash": 99,
      "crush": 99,
      "magic": 159,
      "rangedHeavy": 149,
      "rangedStandard": 103,
      "rangedLight": 149
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Giant Scarab.png",
    "size": 3,
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-skeleton-shadow-dungeon",
    "wikiId": 680,
    "name": "Giant skeleton (Shadow Dungeon)",
    "version": "1",
    "combatLevel": 80,
    "hp": 70,
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
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Giant skeleton (Shadow Dungeon).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-skeleton-tarns-lair",
    "wikiId": 6440,
    "name": "Giant skeleton (Tarn's Lair)",
    "version": "",
    "combatLevel": 100,
    "hp": 110,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 40,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Giant skeleton (Tarn's Lair).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "giant-spider",
    "wikiId": 2477,
    "name": "Giant spider",
    "version": "Level 50",
    "combatLevel": 50,
    "hp": 50,
    "defenceLevel": 31,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 10,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Giant spider (Level 50).png",
    "size": 1,
    "maxHitText": "7",
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
    "slug": "goblin",
    "wikiId": 3046,
    "name": "Goblin",
    "version": "Level 13",
    "combatLevel": 13,
    "hp": 16,
    "defenceLevel": 7,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 4,
      "slash": 6,
      "crush": 8,
      "magic": 4,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [],
    "weakness": null,
    "image": "Goblin (level 13).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "goblin-goblin-village",
    "wikiId": 662,
    "name": "Goblin (Goblin Village)",
    "version": "Green",
    "combatLevel": 5,
    "hp": 12,
    "defenceLevel": 4,
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
    "image": "Goblin (green).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "goblin-god-wars-dungeon",
    "wikiId": 2245,
    "name": "Goblin (God Wars Dungeon)",
    "version": "Level 17",
    "combatLevel": 17,
    "hp": 18,
    "defenceLevel": 14,
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
    "image": "Goblin (level 17).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "goblin-vault-of-war",
    "wikiId": 2488,
    "name": "Goblin (Vault of War)",
    "version": "Level 25",
    "combatLevel": 25,
    "hp": 26,
    "defenceLevel": 17,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 14,
      "slash": 16,
      "crush": 18,
      "magic": 14,
      "rangedHeavy": 14,
      "rangedStandard": 14,
      "rangedLight": 14
    },
    "attributes": [],
    "weakness": null,
    "image": "Goblin (level 25).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "goblin-guard",
    "wikiId": 5369,
    "name": "Goblin guard",
    "version": "",
    "combatLevel": 42,
    "hp": 43,
    "defenceLevel": 37,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 4,
      "slash": 6,
      "crush": 6,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Goblin guard.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "gorad",
    "wikiId": 4367,
    "name": "Gorad",
    "version": "",
    "combatLevel": 68,
    "hp": 80,
    "defenceLevel": 54,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 27,
      "crush": 21,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Gorad.png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "grave-scorpion",
    "wikiId": 5372,
    "name": "Grave scorpion",
    "version": "",
    "combatLevel": 12,
    "hp": 7,
    "defenceLevel": 14,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 3,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Grave scorpion.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
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
    "slug": "greater-demon",
    "wikiId": 7246,
    "name": "Greater demon",
    "version": "Level 113",
    "combatLevel": 113,
    "hp": 130,
    "defenceLevel": 50,
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
    "image": "Greater demon (5).png",
    "size": 3,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "greater-demon-the-scar",
    "wikiId": 12387,
    "name": "Greater demon (The Scar)",
    "version": "",
    "combatLevel": 92,
    "hp": 87,
    "defenceLevel": 81,
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
    "image": "Greater demon.png",
    "size": 3,
    "maxHitText": "9",
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
    "slug": "greater-skeleton-hellhound-calvarion",
    "wikiId": 12108,
    "name": "Greater Skeleton Hellhound (Calvar'ion)",
    "version": "",
    "combatLevel": 139,
    "hp": 30,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 95,
      "slash": 101,
      "crush": 15,
      "magic": 156,
      "rangedHeavy": 184,
      "rangedStandard": 184,
      "rangedLight": 184
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Greater Skeleton Hellhound (Calvar'ion).png",
    "size": 0,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "greater-skeleton-hellhound-vetion",
    "wikiId": 6614,
    "name": "Greater Skeleton Hellhound (Vet'ion)",
    "version": "",
    "combatLevel": 231,
    "hp": 30,
    "defenceLevel": 180,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 150,
      "slash": 163,
      "crush": 20,
      "magic": 210,
      "rangedHeavy": 275,
      "rangedStandard": 275,
      "rangedLight": 275
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Greater Skeleton Hellhound (Vet'ion).png",
    "size": 2,
    "maxHitText": "32",
    "isSlayerMonster": true
  },
  {
    "slug": "green-dragon",
    "wikiId": 7868,
    "name": "Green dragon",
    "version": "Level 88",
    "combatLevel": 88,
    "hp": 100,
    "defenceLevel": 68,
    "magicLevel": 75,
    "defenceBonuses": {
      "stab": 0,
      "slash": 40,
      "crush": 40,
      "magic": 30,
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
    "image": "Green dragon (3).png",
    "size": 4,
    "maxHitText": "8 (Slash)",
    "isSlayerMonster": true
  },
  {
    "slug": "grimy-lizard",
    "wikiId": 13029,
    "name": "Grimy Lizard",
    "version": "",
    "combatLevel": 50,
    "hp": 75,
    "defenceLevel": 10,
    "magicLevel": 25,
    "defenceBonuses": {
      "stab": 35,
      "slash": 15,
      "crush": 50,
      "magic": 50,
      "rangedHeavy": 35,
      "rangedStandard": 35,
      "rangedLight": 35
    },
    "attributes": [],
    "weakness": null,
    "image": "Grimy Lizard.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "grizzly-bear",
    "wikiId": 3423,
    "name": "Grizzly bear",
    "version": "Level 42",
    "combatLevel": 42,
    "hp": 35,
    "defenceLevel": 35,
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
      "severity": 20
    },
    "image": "Grizzly bear (level 42).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "grizzly-bear-escape-caves",
    "wikiId": 11989,
    "name": "Grizzly bear (Escape Caves)",
    "version": "",
    "combatLevel": 83,
    "hp": 75,
    "defenceLevel": 72,
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
      "severity": 20
    },
    "image": "Grizzly bear (Escape Caves).png",
    "size": 0,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "grizzly-bear-cub",
    "wikiId": 3424,
    "name": "Grizzly bear cub",
    "version": "Level 33",
    "combatLevel": 33,
    "hp": 35,
    "defenceLevel": 25,
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
      "severity": 20
    },
    "image": "Grizzly bear cub (level 33).png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "gryphon",
    "wikiId": 14857,
    "name": "Gryphon",
    "version": "",
    "combatLevel": 95,
    "hp": 110,
    "defenceLevel": 50,
    "magicLevel": 50,
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
    "image": "Gryphon.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "gryphon-troubled-tortugans",
    "wikiId": 15009,
    "name": "Gryphon (Troubled Tortugans)",
    "version": "",
    "combatLevel": 95,
    "hp": 110,
    "defenceLevel": 50,
    "magicLevel": 50,
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
    "image": "Gryphon (Troubled Tortugans).png",
    "size": 2,
    "maxHitText": "8 (standard attacks)",
    "isSlayerMonster": true
  },
  {
    "slug": "guard-cave-goblin",
    "wikiId": 2316,
    "name": "Guard (Cave goblin)",
    "version": "Bone club",
    "combatLevel": 26,
    "hp": 26,
    "defenceLevel": 25,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 1,
      "slash": 16,
      "crush": 19,
      "magic": -3,
      "rangedHeavy": 12,
      "rangedStandard": 12,
      "rangedLight": 12
    },
    "attributes": [],
    "weakness": null,
    "image": "Guard (Cave goblin with bone club).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "guard-dwarf",
    "wikiId": 5185,
    "name": "Guard (dwarf)",
    "version": "",
    "combatLevel": 10,
    "hp": 16,
    "defenceLevel": 9,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 3,
      "slash": 4,
      "crush": 4,
      "magic": 2,
      "rangedHeavy": 3,
      "rangedStandard": 3,
      "rangedLight": 3
    },
    "attributes": [],
    "weakness": null,
    "image": "Guard (dwarf).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "guard-prifddinas",
    "wikiId": 9182,
    "name": "Guard (Prifddinas)",
    "version": "1",
    "combatLevel": 108,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Guard (Prifddinas, 1).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "guard-bandit",
    "wikiId": 1027,
    "name": "Guard Bandit",
    "version": "",
    "combatLevel": 22,
    "hp": 27,
    "defenceLevel": 17,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 4,
      "slash": 8,
      "crush": 5,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [],
    "weakness": null,
    "image": "Guard Bandit.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "guard-dog",
    "wikiId": 114,
    "name": "Guard dog",
    "version": "Normal",
    "combatLevel": 44,
    "hp": 49,
    "defenceLevel": 37,
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
    "image": "Guard dog.png",
    "size": 1,
    "maxHitText": "5",
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
    "slug": "gunthor-the-brave",
    "wikiId": 299,
    "name": "Gunthor the brave",
    "version": "",
    "combatLevel": 29,
    "hp": 35,
    "defenceLevel": 25,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 12,
      "slash": 14,
      "crush": 10,
      "magic": -1,
      "rangedHeavy": 11,
      "rangedStandard": 11,
      "rangedLight": 11
    },
    "attributes": [],
    "weakness": null,
    "image": "Gunthor the brave.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "guthan-the-infested",
    "wikiId": 1674,
    "name": "Guthan the Infested",
    "version": "",
    "combatLevel": 115,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 259,
      "slash": 257,
      "crush": 241,
      "magic": -11,
      "rangedHeavy": 250,
      "rangedStandard": 250,
      "rangedLight": 250
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Guthan the Infested.png",
    "size": 1,
    "maxHitText": "24",
    "isSlayerMonster": true
  },
  {
    "slug": "harpie-bug-swarm",
    "wikiId": 464,
    "name": "Harpie Bug Swarm",
    "version": "",
    "combatLevel": 46,
    "hp": 25,
    "defenceLevel": 32,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 5,
      "crush": 10,
      "magic": 5,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Harpie Bug Swarm.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "haze",
    "wikiId": 3625,
    "name": "Haze",
    "version": "Ghost",
    "combatLevel": 29,
    "hp": 30,
    "defenceLevel": 28,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 5,
      "magic": -5,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Ghost.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "hellhound",
    "wikiId": 7877,
    "name": "Hellhound",
    "version": "Level 136",
    "combatLevel": 136,
    "hp": 150,
    "defenceLevel": 102,
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
    "weakness": {
      "element": "water",
      "severity": 50
    },
    "image": "Hellhound.png",
    "size": 2,
    "maxHitText": "13",
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
    "slug": "hill-giant",
    "wikiId": 7261,
    "name": "Hill Giant",
    "version": "",
    "combatLevel": 28,
    "hp": 35,
    "defenceLevel": 26,
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
      "severity": 25
    },
    "image": "Hill Giant (Kourend).png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "hobgoblin",
    "wikiId": 2241,
    "name": "Hobgoblin",
    "version": "Hobgoblin (GWD)",
    "combatLevel": 47,
    "hp": 52,
    "defenceLevel": 35,
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
    "image": "Hobgoblin (God Wars Dungeon).png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "hobgoblin-the-slug-menace",
    "wikiId": 4805,
    "name": "Hobgoblin (The Slug Menace)",
    "version": "",
    "combatLevel": 28,
    "hp": 29,
    "defenceLevel": 24,
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
    "image": "Hobgoblin (The Slug Menace).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
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
    "slug": "ice-giant",
    "wikiId": 7878,
    "name": "Ice giant",
    "version": "Wilderness Slayer Cave 1",
    "combatLevel": 67,
    "hp": 100,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice giant.png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-spider",
    "wikiId": 3022,
    "name": "Ice spider",
    "version": "Normal",
    "combatLevel": 61,
    "hp": 65,
    "defenceLevel": 43,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 17,
      "crush": 12,
      "magic": 13,
      "rangedHeavy": 13,
      "rangedStandard": 13,
      "rangedLight": 13
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice spider.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll",
    "wikiId": 650,
    "name": "Ice troll",
    "version": "Level 120",
    "combatLevel": 120,
    "hp": 100,
    "defenceLevel": 120,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice troll (level 120, 1).png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll-female",
    "wikiId": 5830,
    "name": "Ice troll female",
    "version": "Variant 1",
    "combatLevel": 82,
    "hp": 80,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice troll female.png",
    "size": 1,
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll-grunt",
    "wikiId": 1877,
    "name": "Ice troll grunt",
    "version": "",
    "combatLevel": 100,
    "hp": 80,
    "defenceLevel": 60,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Ice troll grunt.png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll-king",
    "wikiId": 5822,
    "name": "Ice Troll King",
    "version": "",
    "combatLevel": 122,
    "hp": 150,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 45,
      "slash": 45,
      "crush": 45,
      "magic": 2000,
      "rangedHeavy": 2000,
      "rangedStandard": 2000,
      "rangedLight": 2000
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Ice Troll King.png",
    "size": 2,
    "maxHitText": "21 (melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll-male",
    "wikiId": 5829,
    "name": "Ice troll male",
    "version": "Variant 1",
    "combatLevel": 82,
    "hp": 80,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice troll male.png",
    "size": 1,
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-troll-runt",
    "wikiId": 5828,
    "name": "Ice troll runt",
    "version": "Variant 1",
    "combatLevel": 74,
    "hp": 60,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice troll runt.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-warrior",
    "wikiId": 2841,
    "name": "Ice warrior",
    "version": "Normal",
    "combatLevel": 57,
    "hp": 59,
    "defenceLevel": 47,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 40,
      "crush": 20,
      "magic": 10,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Ice warrior.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "ice-wolf",
    "wikiId": 647,
    "name": "Ice wolf",
    "version": "Level 132",
    "combatLevel": 132,
    "hp": 70,
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
    "weakness": {
      "element": "fire",
      "severity": 20
    },
    "image": "Ice wolf.png",
    "size": 2,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "icefiend",
    "wikiId": 3140,
    "name": "Icefiend",
    "version": "Level 18",
    "combatLevel": 18,
    "hp": 20,
    "defenceLevel": 19,
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
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "Icefiend.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "icelord",
    "wikiId": 855,
    "name": "Icelord",
    "version": "Melee, 1",
    "combatLevel": 51,
    "hp": 60,
    "defenceLevel": 40,
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
      "severity": 30
    },
    "image": "Icelord (melee).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "infernal-mage",
    "wikiId": 443,
    "name": "Infernal Mage",
    "version": "",
    "combatLevel": 66,
    "hp": 60,
    "defenceLevel": 60,
    "magicLevel": 75,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 40,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Infernal Mage.png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "infernal-pyrelord",
    "wikiId": 9465,
    "name": "Infernal pyrelord",
    "version": "",
    "combatLevel": 134,
    "hp": 184,
    "defenceLevel": 68,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 18,
      "slash": 18,
      "crush": 18,
      "magic": 0,
      "rangedHeavy": 18,
      "rangedStandard": 18,
      "rangedLight": 18
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Infernal pyrelord.png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
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
    "slug": "iorwerth-archer",
    "wikiId": 8760,
    "name": "Iorwerth Archer",
    "version": "Female",
    "combatLevel": 90,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 50,
      "magic": 60,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": null,
    "image": "Iorwerth Archer (2).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "iorwerth-warrior",
    "wikiId": 3429,
    "name": "Iorwerth Warrior",
    "version": "Iorwerth Camp",
    "combatLevel": 108,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Iorwerth Warrior (2).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "iron-dragon",
    "wikiId": 7254,
    "name": "Iron dragon",
    "version": "Catacombs of Kourend",
    "combatLevel": 215,
    "hp": 195,
    "defenceLevel": 185,
    "magicLevel": 120,
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
    "image": "Iron dragon.png",
    "size": 4,
    "maxHitText": "19 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "jackal",
    "wikiId": 4185,
    "name": "Jackal",
    "version": "",
    "combatLevel": 21,
    "hp": 27,
    "defenceLevel": 15,
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
      "severity": 10
    },
    "image": "Jackal.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-ak",
    "wikiId": 7693,
    "name": "Jal-Ak",
    "version": "",
    "combatLevel": 165,
    "hp": 40,
    "defenceLevel": 95,
    "magicLevel": 160,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": 25,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-Ak.png",
    "size": 3,
    "maxHitText": "29",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-akrek-ket",
    "wikiId": 7696,
    "name": "Jal-AkRek-Ket",
    "version": "",
    "combatLevel": 70,
    "hp": 15,
    "defenceLevel": 95,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
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
    "image": "Jal-AkRek-Ket.png",
    "size": 1,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-akrek-mej",
    "wikiId": 7694,
    "name": "Jal-AkRek-Mej",
    "version": "",
    "combatLevel": 70,
    "hp": 15,
    "defenceLevel": 95,
    "magicLevel": 120,
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
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-AkRek-Mej.png",
    "size": 1,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-akrek-xil",
    "wikiId": 7695,
    "name": "Jal-AkRek-Xil",
    "version": "",
    "combatLevel": 70,
    "hp": 15,
    "defenceLevel": 95,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-AkRek-Xil.png",
    "size": 1,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-imkot",
    "wikiId": 7697,
    "name": "Jal-ImKot",
    "version": "",
    "combatLevel": 240,
    "hp": 75,
    "defenceLevel": 120,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 65,
      "slash": 65,
      "crush": 65,
      "magic": 30,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-ImKot.png",
    "size": 4,
    "maxHitText": "49",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-mejjak",
    "wikiId": 7708,
    "name": "Jal-MejJak",
    "version": "",
    "combatLevel": 250,
    "hp": 75,
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
      "element": "water",
      "severity": 40
    },
    "image": "Jal-MejJak.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-mejrah",
    "wikiId": 7692,
    "name": "Jal-MejRah",
    "version": "",
    "combatLevel": 85,
    "hp": 25,
    "defenceLevel": 55,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": -20,
      "rangedHeavy": 45,
      "rangedStandard": 45,
      "rangedLight": 45
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-MejRah.png",
    "size": 2,
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-nib",
    "wikiId": 7691,
    "name": "Jal-Nib",
    "version": "",
    "combatLevel": 32,
    "hp": 10,
    "defenceLevel": 15,
    "magicLevel": 15,
    "defenceBonuses": {
      "stab": -20,
      "slash": -20,
      "crush": -20,
      "magic": -20,
      "rangedHeavy": -20,
      "rangedStandard": -20,
      "rangedLight": -20
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Jal-Nib.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "jal-xil",
    "wikiId": 7698,
    "name": "Jal-Xil",
    "version": "",
    "combatLevel": 370,
    "hp": 125,
    "defenceLevel": 60,
    "magicLevel": 90,
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
    "image": "Jal-Xil.png",
    "size": 3,
    "maxHitText": "46 (Ranged)",
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
    "slug": "jelly",
    "wikiId": 441,
    "name": "Jelly",
    "version": "Dark",
    "combatLevel": 78,
    "hp": 75,
    "defenceLevel": 120,
    "magicLevel": 45,
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
      "severity": 35
    },
    "image": "Jelly (dark).png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
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
    "slug": "jubbly-bird",
    "wikiId": 4863,
    "name": "Jubbly bird",
    "version": "",
    "combatLevel": 9,
    "hp": 20,
    "defenceLevel": 6,
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
    "image": "Jubbly bird.png",
    "size": 3,
    "maxHitText": "0 (Does not attack)",
    "isSlayerMonster": true
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
    "slug": "jungle-horror",
    "wikiId": 1046,
    "name": "Jungle horror",
    "version": "Guard",
    "combatLevel": 70,
    "hp": 45,
    "defenceLevel": 55,
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
      "severity": 25
    },
    "image": "Jungle horror (pink eyes).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "jungle-spider",
    "wikiId": 3020,
    "name": "Jungle spider",
    "version": "",
    "combatLevel": 44,
    "hp": 50,
    "defenceLevel": 35,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 10,
      "magic": 17,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Jungle spider.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "jungle-spider-ape-atoll",
    "wikiId": 5243,
    "name": "Jungle spider (Ape Atoll)",
    "version": "",
    "combatLevel": 37,
    "hp": 35,
    "defenceLevel": 10,
    "magicLevel": 10,
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
      "severity": 40
    },
    "image": "Jungle spider (Ape Atoll).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "jungle-wolf",
    "wikiId": 232,
    "name": "Jungle Wolf",
    "version": "",
    "combatLevel": 64,
    "hp": 69,
    "defenceLevel": 52,
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
      "severity": 15
    },
    "image": "Jungle Wolf.png",
    "size": 2,
    "maxHitText": "6",
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
    "slug": "juvenile-custodian-stalker",
    "wikiId": 14702,
    "name": "Juvenile custodian stalker",
    "version": "",
    "combatLevel": 93,
    "hp": 135,
    "defenceLevel": 45,
    "magicLevel": 25,
    "defenceBonuses": {
      "stab": 30,
      "slash": -10,
      "crush": 50,
      "magic": 35,
      "rangedHeavy": 30,
      "rangedStandard": 5,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Juvenile custodian stalker.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "kalphite-guardian",
    "wikiId": 960,
    "name": "Kalphite Guardian",
    "version": "",
    "combatLevel": 141,
    "hp": 170,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 5,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 30,
      "rangedLight": 50
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Kalphite Guardian.png",
    "size": 4,
    "maxHitText": "12",
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
    "slug": "kalphite-soldier",
    "wikiId": 958,
    "name": "Kalphite Soldier",
    "version": "Kalphite Cave (task only)",
    "combatLevel": 85,
    "hp": 90,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 5,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 30,
      "rangedLight": 50
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Kalphite Soldier.png",
    "size": 3,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "kalphite-worker",
    "wikiId": 955,
    "name": "Kalphite Worker",
    "version": "",
    "combatLevel": 28,
    "hp": 40,
    "defenceLevel": 20,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 1,
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
    "image": "Kalphite Worker.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "kamil",
    "wikiId": 3458,
    "name": "Kamil",
    "version": "",
    "combatLevel": 154,
    "hp": 130,
    "defenceLevel": 135,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 35,
      "slash": 60,
      "crush": 35,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 10
    },
    "image": "Kamil.png",
    "size": 1,
    "maxHitText": "23 (Melee)",
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
    "slug": "karil-the-tainted",
    "wikiId": 1675,
    "name": "Karil the Tainted",
    "version": "",
    "combatLevel": 98,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 79,
      "slash": 71,
      "crush": 90,
      "magic": 106,
      "rangedHeavy": 100,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Karil the Tainted.png",
    "size": 1,
    "maxHitText": "20",
    "isSlayerMonster": true
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
    "slug": "ket-zek",
    "wikiId": 3125,
    "name": "Ket-Zek",
    "version": "Standard",
    "combatLevel": 360,
    "hp": 160,
    "defenceLevel": 240,
    "magicLevel": 240,
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
    "image": "Ket-Zek (1).png",
    "size": 5,
    "maxHitText": "52 (Magic)",
    "isSlayerMonster": true
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
    "slug": "killerwatt",
    "wikiId": 469,
    "name": "Killerwatt",
    "version": "Attacking",
    "combatLevel": 55,
    "hp": 51,
    "defenceLevel": 40,
    "magicLevel": 67,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 20,
      "rangedHeavy": -10,
      "rangedStandard": -10,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 60
    },
    "image": "Killerwatt.png",
    "size": 1,
    "maxHitText": "8 (Ranged)",
    "isSlayerMonster": true
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
    "slug": "king-scorpion",
    "wikiId": 3027,
    "name": "King Scorpion",
    "version": "",
    "combatLevel": 32,
    "hp": 30,
    "defenceLevel": 23,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 20
    },
    "image": "King Scorpion.png",
    "size": 2,
    "maxHitText": "4",
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
    "slug": "kolodion",
    "wikiId": 1609,
    "name": "Kolodion",
    "version": "Demon",
    "combatLevel": 112,
    "hp": 107,
    "defenceLevel": 105,
    "magicLevel": 400,
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
    "image": "Kolodion demon form.png",
    "size": 3,
    "maxHitText": "20",
    "isSlayerMonster": true
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
    "slug": "kraka",
    "wikiId": 928,
    "name": "Kraka",
    "version": "",
    "combatLevel": 91,
    "hp": 120,
    "defenceLevel": 50,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 40,
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
    "image": "Kraka.png",
    "size": 2,
    "maxHitText": "23",
    "isSlayerMonster": true
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
    "slug": "kurask",
    "wikiId": 410,
    "name": "Kurask",
    "version": "Normal",
    "combatLevel": 106,
    "hp": 97,
    "defenceLevel": 105,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "leafy"
    ],
    "weakness": null,
    "image": "Kurask.png",
    "size": 3,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "large-chicken",
    "wikiId": 14510,
    "name": "Large chicken",
    "version": "",
    "combatLevel": 16,
    "hp": 30,
    "defenceLevel": 10,
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
    "image": "Large chicken.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
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
    "slug": "lava-strykewyrm",
    "wikiId": 15500,
    "name": "Lava Strykewyrm",
    "version": "",
    "combatLevel": 116,
    "hp": 150,
    "defenceLevel": 50,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 30,
      "slash": 60,
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
    "image": "Lava Strykewyrm.png",
    "size": 2,
    "maxHitText": "10 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "lesser-demon",
    "wikiId": 7865,
    "name": "Lesser demon",
    "version": "Level 94 (Wilderness Slayer Cave)",
    "combatLevel": 94,
    "hp": 110,
    "defenceLevel": 71,
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
    "image": "Lesser demon.png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "lesser-demon-melzars-maze",
    "wikiId": 3982,
    "name": "Lesser demon (Melzar's Maze)",
    "version": "",
    "combatLevel": 82,
    "hp": 79,
    "defenceLevel": 71,
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
    "image": "Lesser demon (Melzar's Maze).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "lesser-demon-the-scar",
    "wikiId": 12376,
    "name": "Lesser demon (The Scar)",
    "version": "Level 39",
    "combatLevel": 39,
    "hp": 40,
    "defenceLevel": 30,
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
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Lesser demon (level 39).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "lizard",
    "wikiId": 458,
    "name": "Lizard",
    "version": "",
    "combatLevel": 42,
    "hp": 40,
    "defenceLevel": 35,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": null,
    "image": "Lizard.png",
    "size": 3,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "lizardman",
    "wikiId": 6914,
    "name": "Lizardman",
    "version": "Level 53",
    "combatLevel": 53,
    "hp": 60,
    "defenceLevel": 43,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -20,
      "slash": 25,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": null,
    "image": "Lizardman (level 53).png",
    "size": 1,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "lizardman-brute",
    "wikiId": 8564,
    "name": "Lizardman brute",
    "version": "Battlefront",
    "combatLevel": 75,
    "hp": 60,
    "defenceLevel": 65,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -20,
      "slash": 30,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": null,
    "image": "Lizardman brute (Battlefront).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "lizardman-shaman",
    "wikiId": 8565,
    "name": "Lizardman shaman",
    "version": "Lizardman Temple",
    "combatLevel": 150,
    "hp": 150,
    "defenceLevel": 140,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": -20,
      "slash": 40,
      "crush": 30,
      "magic": 50,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": null,
    "image": "Lizardman shaman (Lizardman Temple).png",
    "size": 2,
    "maxHitText": "31 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "lizardman-shaman-chambers-of-xeric",
    "wikiId": 7573,
    "name": "Lizardman shaman (Chambers of Xeric)",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 190,
    "defenceLevel": 210,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 102,
      "slash": 160,
      "crush": 150,
      "magic": 160,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "xerician"
    ],
    "weakness": null,
    "image": "Lizardman shaman (1).png",
    "size": 3,
    "maxHitText": "65 (unconfirmed)",
    "isSlayerMonster": true
  },
  {
    "slug": "loar-shade",
    "wikiId": 1277,
    "name": "Loar Shade",
    "version": "Shade",
    "combatLevel": 40,
    "hp": 38,
    "defenceLevel": 26,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Loar Shade.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "lobstrosity",
    "wikiId": 7796,
    "name": "Lobstrosity",
    "version": "",
    "combatLevel": 68,
    "hp": 50,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 50,
      "crush": 15,
      "magic": 99,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 25
    },
    "image": "Lobstrosity.png",
    "size": 3,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "locust-rider",
    "wikiId": 795,
    "name": "Locust rider",
    "version": "Lancer",
    "combatLevel": 106,
    "hp": 90,
    "defenceLevel": 90,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 90,
      "slash": 90,
      "crush": 40,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Locust rider (melee).png",
    "size": 2,
    "maxHitText": "15",
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
    "slug": "magic-axe",
    "wikiId": 2844,
    "name": "Magic axe",
    "version": "Normal",
    "combatLevel": 42,
    "hp": 44,
    "defenceLevel": 29,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 5,
      "crush": 15,
      "magic": 5,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": null,
    "image": "Magic axe.png",
    "size": 1,
    "maxHitText": "5",
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
    "slug": "malevolent-mage",
    "wikiId": 7396,
    "name": "Malevolent Mage",
    "version": "",
    "combatLevel": 162,
    "hp": 175,
    "defenceLevel": 135,
    "magicLevel": 175,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 75,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Malevolent Mage.png",
    "size": 2,
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "mammoth",
    "wikiId": 6604,
    "name": "Mammoth",
    "version": "Normal",
    "combatLevel": 80,
    "hp": 130,
    "defenceLevel": 50,
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
    "image": "Mammoth.png",
    "size": 3,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "maniacal-monkey",
    "wikiId": 7118,
    "name": "Maniacal monkey",
    "version": "",
    "combatLevel": 140,
    "hp": 65,
    "defenceLevel": 10,
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
    "image": "Maniacal monkey.png",
    "size": 1,
    "maxHitText": "18",
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
    "slug": "mature-custodian-stalker",
    "wikiId": 14703,
    "name": "Mature custodian stalker",
    "version": "",
    "combatLevel": 117,
    "hp": 190,
    "defenceLevel": 45,
    "magicLevel": 40,
    "defenceBonuses": {
      "stab": 30,
      "slash": -10,
      "crush": 50,
      "magic": 35,
      "rangedHeavy": 30,
      "rangedStandard": 5,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Mature custodian stalker.png",
    "size": 1,
    "maxHitText": "8",
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
    "slug": "minotaur",
    "wikiId": 2483,
    "name": "Minotaur",
    "version": "Level 27",
    "combatLevel": 27,
    "hp": 22,
    "defenceLevel": 25,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -10,
      "slash": -10,
      "crush": -10,
      "magic": -21,
      "rangedHeavy": -10,
      "rangedStandard": -10,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": null,
    "image": "Minotaur.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
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
    "slug": "mirrorback-araxyte",
    "wikiId": 13671,
    "name": "Mirrorback Araxyte",
    "version": "",
    "combatLevel": 114,
    "hp": 58,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": -10,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Mirrorback Araxyte.png",
    "size": 2,
    "maxHitText": "15",
    "isSlayerMonster": true
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
    "slug": "mogre",
    "wikiId": 2592,
    "name": "Mogre",
    "version": "",
    "combatLevel": 60,
    "hp": 48,
    "defenceLevel": 48,
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
      "severity": 20
    },
    "image": "Mogre.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "mogre-sailing",
    "wikiId": 15230,
    "name": "Mogre (Sailing)",
    "version": "",
    "combatLevel": 54,
    "hp": 59,
    "defenceLevel": 40,
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
      "severity": 20
    },
    "image": "Mogre (Sailing).png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "molanisk",
    "wikiId": 1,
    "name": "Molanisk",
    "version": "",
    "combatLevel": 51,
    "hp": 52,
    "defenceLevel": 50,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 45,
      "slash": 45,
      "crush": 35,
      "magic": 30,
      "rangedHeavy": 55,
      "rangedStandard": 55,
      "rangedLight": 55
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 60
    },
    "image": "Molanisk.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "monkey-monster",
    "wikiId": 2848,
    "name": "Monkey (monster)",
    "version": "Common",
    "combatLevel": 3,
    "hp": 6,
    "defenceLevel": 2,
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
    "image": "Monkey.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "monkey-archer",
    "wikiId": 5273,
    "name": "Monkey Archer",
    "version": "Ape Atoll gate",
    "combatLevel": 86,
    "hp": 50,
    "defenceLevel": 80,
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
    "image": "Monkey Archer.png",
    "size": 1,
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "monkey-guard",
    "wikiId": 5276,
    "name": "Monkey Guard",
    "version": "Bearded",
    "combatLevel": 167,
    "hp": 130,
    "defenceLevel": 200,
    "magicLevel": 130,
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
    "image": "Monkey Guard (bearded).png",
    "size": 2,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "monkey-guard-ninja",
    "wikiId": 5271,
    "name": "Monkey Guard (ninja)",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Monkey Guard (ninja).png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "monkey-zombie",
    "wikiId": 5282,
    "name": "Monkey Zombie",
    "version": "Level 129",
    "combatLevel": 129,
    "hp": 90,
    "defenceLevel": 90,
    "magicLevel": 90,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Monkey Zombie.png",
    "size": 1,
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "monstrous-basilisk",
    "wikiId": 7395,
    "name": "Monstrous basilisk",
    "version": "",
    "combatLevel": 135,
    "hp": 170,
    "defenceLevel": 130,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 35,
      "slash": 35,
      "crush": 0,
      "magic": 35,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Monstrous basilisk.png",
    "size": 3,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "monstrous-basilisk-the-fremennik-exiles",
    "wikiId": 9287,
    "name": "Monstrous Basilisk (The Fremennik Exiles)",
    "version": "",
    "combatLevel": 135,
    "hp": 170,
    "defenceLevel": 130,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 35,
      "slash": 35,
      "crush": 0,
      "magic": 35,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 40
    },
    "image": "Monstrous Basilisk (The Fremennik Exiles).png",
    "size": 3,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "moonlight-cockatrice",
    "wikiId": 13030,
    "name": "Moonlight Cockatrice",
    "version": "",
    "combatLevel": 49,
    "hp": 52,
    "defenceLevel": 39,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 14,
      "slash": 14,
      "crush": 0,
      "magic": 14,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Moonlight Cockatrice.png",
    "size": 3,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "moss-giant",
    "wikiId": 3851,
    "name": "Moss giant",
    "version": "Level 48",
    "combatLevel": 48,
    "hp": 85,
    "defenceLevel": 30,
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
      "severity": 50
    },
    "image": "Moss giant (level 48, 1).png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "moss-giant-iorwerth-dungeon",
    "wikiId": 8736,
    "name": "Moss Giant (Iorwerth Dungeon)",
    "version": "",
    "combatLevel": 84,
    "hp": 120,
    "defenceLevel": 60,
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
      "severity": 50
    },
    "image": "Moss Giant (Iorwerth Dungeon).png",
    "size": 2,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "moss-guardian",
    "wikiId": 891,
    "name": "Moss Guardian",
    "version": "",
    "combatLevel": 84,
    "hp": 120,
    "defenceLevel": 60,
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
    "image": "Moss Guardian.png",
    "size": 2,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "mosschin",
    "wikiId": 11271,
    "name": "Mosschin",
    "version": "",
    "combatLevel": 88,
    "hp": 120,
    "defenceLevel": 50,
    "magicLevel": 50,
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
    "image": "Mosschin.png",
    "size": 1,
    "maxHitText": "10",
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
    "slug": "mountain-troll",
    "wikiId": 936,
    "name": "Mountain troll",
    "version": "Level 69",
    "combatLevel": 69,
    "hp": 90,
    "defenceLevel": 40,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 10,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 40,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Mountain troll.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "mounted-terrorbird-gnome",
    "wikiId": 2068,
    "name": "Mounted terrorbird gnome",
    "version": "Level 49",
    "combatLevel": 49,
    "hp": 55,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 16,
      "slash": 16,
      "crush": 18,
      "magic": 15,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [],
    "weakness": null,
    "image": "Mounted terrorbird gnome.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "mourner",
    "wikiId": 9017,
    "name": "Mourner",
    "version": "level 108",
    "combatLevel": 108,
    "hp": 105,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 60,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Mourner (level 108).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "mutated-bloodveld",
    "wikiId": 7276,
    "name": "Mutated Bloodveld",
    "version": "",
    "combatLevel": 123,
    "hp": 170,
    "defenceLevel": 30,
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
    "image": "Mutated Bloodveld.png",
    "size": 2,
    "maxHitText": "12",
    "isSlayerMonster": true
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
    "slug": "nazastarool",
    "wikiId": 5355,
    "name": "Nazastarool",
    "version": "Ghost",
    "combatLevel": 93,
    "hp": 80,
    "defenceLevel": 80,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Nazastarool (Ghost).png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "nechryael",
    "wikiId": 8,
    "name": "Nechryael",
    "version": "Normal",
    "combatLevel": 115,
    "hp": 105,
    "defenceLevel": 105,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Nechryael.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
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
    "slug": "obor",
    "wikiId": 7416,
    "name": "Obor",
    "version": "",
    "combatLevel": 106,
    "hp": 120,
    "defenceLevel": 60,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 35,
      "slash": 40,
      "crush": 45,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Obor.png",
    "size": 2,
    "maxHitText": "22 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "ogre",
    "wikiId": 2233,
    "name": "Ogre",
    "version": "GWD",
    "combatLevel": 58,
    "hp": 70,
    "defenceLevel": 43,
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
      "severity": 20
    },
    "image": "Ogre (GWD).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "ogre-chieftain",
    "wikiId": 4362,
    "name": "Ogre chieftain",
    "version": "",
    "combatLevel": 81,
    "hp": 60,
    "defenceLevel": 75,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 21,
      "crush": 16,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Ogre chieftain.png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "ogress-shaman",
    "wikiId": 7991,
    "name": "Ogress Shaman",
    "version": "",
    "combatLevel": 82,
    "hp": 82,
    "defenceLevel": 82,
    "magicLevel": 68,
    "defenceBonuses": {
      "stab": 12,
      "slash": 14,
      "crush": 14,
      "magic": 16,
      "rangedHeavy": 8,
      "rangedStandard": 8,
      "rangedLight": 8
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Ogress Shaman.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "ogress-warrior",
    "wikiId": 7989,
    "name": "Ogress Warrior",
    "version": "1",
    "combatLevel": 82,
    "hp": 82,
    "defenceLevel": 82,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 10,
      "slash": 12,
      "crush": 12,
      "magic": 14,
      "rangedHeavy": 16,
      "rangedStandard": 16,
      "rangedLight": 16
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Ogress Warrior (1).png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "oipuis",
    "wikiId": 5259,
    "name": "Oipuis",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Oipuis.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "oomlie-bird",
    "wikiId": 2062,
    "name": "Oomlie bird",
    "version": "",
    "combatLevel": 46,
    "hp": 40,
    "defenceLevel": 40,
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
    "image": "Oomlie bird.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
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
    "slug": "otherworldly-being",
    "wikiId": 2843,
    "name": "Otherworldly being",
    "version": "",
    "combatLevel": 64,
    "hp": 66,
    "defenceLevel": 46,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 10,
      "crush": 20,
      "magic": -5,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Otherworldly being.png",
    "size": 1,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "ouhai",
    "wikiId": 5261,
    "name": "Ouhai",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Ouhai.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "pee-hat",
    "wikiId": 927,
    "name": "Pee Hat",
    "version": "",
    "combatLevel": 91,
    "hp": 120,
    "defenceLevel": 50,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 40,
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
    "image": "Pee Hat.png",
    "size": 2,
    "maxHitText": "23",
    "isSlayerMonster": true
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
    "slug": "penguin-monster",
    "wikiId": 2063,
    "name": "Penguin (monster)",
    "version": "",
    "combatLevel": 2,
    "hp": 4,
    "defenceLevel": 2,
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
      "severity": 25
    },
    "image": "Penguin (monster).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "phrin-shade",
    "wikiId": 1280,
    "name": "Phrin Shade",
    "version": "Shade",
    "combatLevel": 60,
    "hp": 56,
    "defenceLevel": 42,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Phrin Shade.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "pirate",
    "wikiId": 4043,
    "name": "Pirate",
    "version": "Cabin Fever",
    "combatLevel": 57,
    "hp": 52,
    "defenceLevel": 50,
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
    "image": "Pirate (Cabin Fever).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "pit-scorpion",
    "wikiId": 3026,
    "name": "Pit Scorpion",
    "version": "",
    "combatLevel": 28,
    "hp": 32,
    "defenceLevel": 23,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 5,
      "crush": 5,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Pit Scorpion.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "poison-scorpion",
    "wikiId": 3025,
    "name": "Poison Scorpion",
    "version": "",
    "combatLevel": 20,
    "hp": 23,
    "defenceLevel": 15,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Poison Scorpion.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "poison-spider",
    "wikiId": 3023,
    "name": "Poison spider",
    "version": "Level 64",
    "combatLevel": 64,
    "hp": 64,
    "defenceLevel": 52,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 17,
      "crush": 10,
      "magic": 14,
      "rangedHeavy": 14,
      "rangedStandard": 14,
      "rangedLight": 14
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Poison spider (Level 64).png",
    "size": 1,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "poison-spider-escape-caves",
    "wikiId": 11990,
    "name": "Poison spider (Escape Caves)",
    "version": "",
    "combatLevel": 48,
    "hp": 73,
    "defenceLevel": 35,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 17,
      "crush": 10,
      "magic": 14,
      "rangedHeavy": 14,
      "rangedStandard": 14,
      "rangedLight": 14
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Poison spider (Escape Caves).png",
    "size": 0,
    "maxHitText": "8",
    "isSlayerMonster": true
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
    "slug": "pyrefiend",
    "wikiId": 3139,
    "name": "Pyrefiend",
    "version": "Level 48",
    "combatLevel": 48,
    "hp": 48,
    "defenceLevel": 22,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "fiery",
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 100
    },
    "image": "Pyrefiend.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "pyrelord",
    "wikiId": 6762,
    "name": "Pyrelord",
    "version": "1",
    "combatLevel": 60,
    "hp": 80,
    "defenceLevel": 30,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "water",
      "severity": 100
    },
    "image": "Pyrelord.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
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
    "slug": "rat",
    "wikiId": 2854,
    "name": "Rat",
    "version": "Regular",
    "combatLevel": 1,
    "hp": 2,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [
      "rat"
    ],
    "weakness": null,
    "image": "Rat.png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-abyssal",
    "wikiId": 7038,
    "name": "Reanimated abyssal",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 135,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Reanimated abyssal.png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-aviansie",
    "wikiId": 7037,
    "name": "Reanimated aviansie",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
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
    "attributes": [
      "flying"
    ],
    "weakness": null,
    "image": "Reanimated aviansie.png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-bear",
    "wikiId": 7023,
    "name": "Reanimated bear",
    "version": "",
    "combatLevel": 0,
    "hp": 15,
    "defenceLevel": 15,
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
    "image": "Reanimated bear.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-bloodveld",
    "wikiId": 7034,
    "name": "Reanimated bloodveld",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 30,
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
    "image": "Reanimated bloodveld.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-chaos-druid",
    "wikiId": 7026,
    "name": "Reanimated chaos druid",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 12,
    "magicLevel": 10,
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
    "image": "Reanimated chaos druid.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-dagannoth",
    "wikiId": 7033,
    "name": "Reanimated dagannoth",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 81,
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
    "image": "Reanimated dagannoth.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-demon",
    "wikiId": 7036,
    "name": "Reanimated demon",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 71,
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
    "weakness": null,
    "image": "Reanimated demon.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-dog",
    "wikiId": 7025,
    "name": "Reanimated dog",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 54,
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
    "image": "Reanimated dog.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-elf",
    "wikiId": 7029,
    "name": "Reanimated elf",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 80,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 20,
      "crush": 40,
      "magic": 60,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": null,
    "image": "Reanimated elf.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-giant",
    "wikiId": 7027,
    "name": "Reanimated giant",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 26,
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
    "image": "Reanimated giant.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-goblin",
    "wikiId": 7018,
    "name": "Reanimated goblin",
    "version": "",
    "combatLevel": 0,
    "hp": 5,
    "defenceLevel": 1,
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
    "image": "Reanimated goblin.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-hellhound",
    "wikiId": 11463,
    "name": "Reanimated hellhound",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 102,
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
    "image": "Reanimated hellhound.png",
    "size": 2,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-horror",
    "wikiId": 7031,
    "name": "Reanimated horror",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 55,
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
    "image": "Reanimated horror.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-kalphite",
    "wikiId": 7032,
    "name": "Reanimated kalphite",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 5,
      "magic": 50,
      "rangedHeavy": 50,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": null,
    "image": "Reanimated kalphite.png",
    "size": 4,
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-minotaur",
    "wikiId": 7021,
    "name": "Reanimated minotaur",
    "version": "",
    "combatLevel": 0,
    "hp": 10,
    "defenceLevel": 10,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -21,
      "slash": -21,
      "crush": -21,
      "magic": -21,
      "rangedHeavy": -21,
      "rangedStandard": -21,
      "rangedLight": -21
    },
    "attributes": [],
    "weakness": null,
    "image": "Reanimated minotaur.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-monkey",
    "wikiId": 7019,
    "name": "Reanimated monkey",
    "version": "",
    "combatLevel": 0,
    "hp": 5,
    "defenceLevel": 3,
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
    "image": "Reanimated monkey.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-ogre",
    "wikiId": 7028,
    "name": "Reanimated ogre",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 43,
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
    "image": "Reanimated ogre.png",
    "size": 2,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-scorpion",
    "wikiId": 7022,
    "name": "Reanimated scorpion",
    "version": "",
    "combatLevel": 0,
    "hp": 15,
    "defenceLevel": 11,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 5,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Reanimated scorpion.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-troll",
    "wikiId": 7030,
    "name": "Reanimated troll",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 10,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Reanimated troll.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "reanimated-tzhaar",
    "wikiId": 7035,
    "name": "Reanimated TzHaar",
    "version": "",
    "combatLevel": 0,
    "hp": 35,
    "defenceLevel": 120,
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
    "weakness": null,
    "image": "Reanimated TzHaar.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "red-dragon",
    "wikiId": 247,
    "name": "Red dragon",
    "version": "1",
    "combatLevel": 152,
    "hp": 140,
    "defenceLevel": 130,
    "magicLevel": 1,
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
    "image": "Red dragon.png",
    "size": 4,
    "maxHitText": "14 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "redeyes",
    "wikiId": 11272,
    "name": "Redeyes",
    "version": "",
    "combatLevel": 121,
    "hp": 160,
    "defenceLevel": 70,
    "magicLevel": 70,
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
    "image": "Redeyes.png",
    "size": 1,
    "maxHitText": "14",
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
    "slug": "respiratory-system",
    "wikiId": 5914,
    "name": "Respiratory system",
    "version": "",
    "combatLevel": 0,
    "hp": 50,
    "defenceLevel": 80,
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
    "attributes": [
      "demon"
    ],
    "weakness": null,
    "image": "Respiratory system.png",
    "size": 2,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-cyclops",
    "wikiId": 7934,
    "name": "Revenant cyclops",
    "version": "",
    "combatLevel": 82,
    "hp": 110,
    "defenceLevel": 49,
    "magicLevel": 65,
    "defenceBonuses": {
      "stab": 110,
      "slash": 130,
      "crush": 135,
      "magic": 10,
      "rangedHeavy": 95,
      "rangedStandard": 135,
      "rangedLight": 135
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant cyclops.png",
    "size": 3,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-dark-beast",
    "wikiId": 7938,
    "name": "Revenant dark beast",
    "version": "",
    "combatLevel": 120,
    "hp": 140,
    "defenceLevel": 80,
    "magicLevel": 130,
    "defenceBonuses": {
      "stab": 113,
      "slash": 152,
      "crush": 155,
      "magic": 70,
      "rangedHeavy": 118,
      "rangedStandard": 158,
      "rangedLight": 158
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant dark beast.png",
    "size": 3,
    "maxHitText": "23",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-demon",
    "wikiId": 7936,
    "name": "Revenant demon",
    "version": "",
    "combatLevel": 98,
    "hp": 80,
    "defenceLevel": 80,
    "magicLevel": 120,
    "defenceBonuses": {
      "stab": 124,
      "slash": 118,
      "crush": 130,
      "magic": 85,
      "rangedHeavy": 90,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant demon.png",
    "size": 3,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-dragon",
    "wikiId": 7940,
    "name": "Revenant dragon",
    "version": "",
    "combatLevel": 135,
    "hp": 155,
    "defenceLevel": 87,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 143,
      "slash": 206,
      "crush": 188,
      "magic": 101,
      "rangedHeavy": 157,
      "rangedStandard": 197,
      "rangedLight": 197
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant dragon.png",
    "size": 5,
    "maxHitText": "30",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-goblin",
    "wikiId": 7931,
    "name": "Revenant goblin",
    "version": "",
    "combatLevel": 15,
    "hp": 14,
    "defenceLevel": 14,
    "magicLevel": 12,
    "defenceBonuses": {
      "stab": 25,
      "slash": 28,
      "crush": 31,
      "magic": 1,
      "rangedHeavy": 31,
      "rangedStandard": 31,
      "rangedLight": 31
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant goblin.png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-hellhound",
    "wikiId": 7935,
    "name": "Revenant hellhound",
    "version": "",
    "combatLevel": 90,
    "hp": 80,
    "defenceLevel": 80,
    "magicLevel": 104,
    "defenceBonuses": {
      "stab": 98,
      "slash": 140,
      "crush": 142,
      "magic": 62,
      "rangedHeavy": 140,
      "rangedStandard": 140,
      "rangedLight": 110
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant hellhound.png",
    "size": 3,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-hobgoblin",
    "wikiId": 7933,
    "name": "Revenant hobgoblin",
    "version": "",
    "combatLevel": 60,
    "hp": 72,
    "defenceLevel": 41,
    "magicLevel": 55,
    "defenceBonuses": {
      "stab": 65,
      "slash": 60,
      "crush": 68,
      "magic": 30,
      "rangedHeavy": 20,
      "rangedStandard": 50,
      "rangedLight": 50
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant hobgoblin.png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-imp",
    "wikiId": 7881,
    "name": "Revenant imp",
    "version": "",
    "combatLevel": 7,
    "hp": 10,
    "defenceLevel": 4,
    "magicLevel": 9,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 5,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant imp.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-knight",
    "wikiId": 7939,
    "name": "Revenant knight",
    "version": "",
    "combatLevel": 126,
    "hp": 143,
    "defenceLevel": 80,
    "magicLevel": 146,
    "defenceBonuses": {
      "stab": 145,
      "slash": 200,
      "crush": 180,
      "magic": 95,
      "rangedHeavy": 150,
      "rangedStandard": 190,
      "rangedLight": 190
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant knight.png",
    "size": 1,
    "maxHitText": "27",
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
    "slug": "revenant-ork",
    "wikiId": 7937,
    "name": "Revenant ork",
    "version": "",
    "combatLevel": 105,
    "hp": 105,
    "defenceLevel": 60,
    "magicLevel": 110,
    "defenceBonuses": {
      "stab": 118,
      "slash": 150,
      "crush": 146,
      "magic": 50,
      "rangedHeavy": 118,
      "rangedStandard": 148,
      "rangedLight": 148
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant ork.png",
    "size": 3,
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "revenant-pyrefiend",
    "wikiId": 7932,
    "name": "Revenant pyrefiend",
    "version": "",
    "combatLevel": 52,
    "hp": 48,
    "defenceLevel": 33,
    "magicLevel": 67,
    "defenceBonuses": {
      "stab": 45,
      "slash": 40,
      "crush": 50,
      "magic": 15,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Revenant pyrefiend.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "river-troll",
    "wikiId": 6737,
    "name": "River troll",
    "version": "Level 159",
    "combatLevel": 159,
    "hp": 170,
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
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "River troll.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "riyl-shade",
    "wikiId": 1282,
    "name": "Riyl Shade",
    "version": "Shade",
    "combatLevel": 80,
    "hp": 76,
    "defenceLevel": 60,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Riyl Shade.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "riyl-shadow-temple-trekking",
    "wikiId": 5631,
    "name": "Riyl shadow (Temple Trekking)",
    "version": "",
    "combatLevel": 80,
    "hp": 76,
    "defenceLevel": 60,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Riyl Shade.png",
    "size": 1,
    "maxHitText": "7",
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
    "slug": "rock-troll",
    "wikiId": 925,
    "name": "Rock (Troll)",
    "version": "",
    "combatLevel": 111,
    "hp": 140,
    "defenceLevel": 70,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 35,
      "slash": 60,
      "crush": 35,
      "magic": 200,
      "rangedHeavy": 180,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Rock.png",
    "size": 2,
    "maxHitText": "30",
    "isSlayerMonster": true
  },
  {
    "slug": "rock-crab",
    "wikiId": 100,
    "name": "Rock Crab",
    "version": "Active",
    "combatLevel": 13,
    "hp": 50,
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
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Rock crab (exposed).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "rockslug",
    "wikiId": 421,
    "name": "Rockslug",
    "version": "Cave",
    "combatLevel": 29,
    "hp": 27,
    "defenceLevel": 27,
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
      "severity": 25
    },
    "image": "Rockslug.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "rogue",
    "wikiId": 6603,
    "name": "Rogue",
    "version": "Level 135",
    "combatLevel": 135,
    "hp": 125,
    "defenceLevel": 150,
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
    "image": "Rogue (lv 135).png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "rooster",
    "wikiId": 1175,
    "name": "Rooster",
    "version": "Level 3",
    "combatLevel": 3,
    "hp": 7,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": null,
    "image": "Rooster.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "ruptura-araxyte",
    "wikiId": 13673,
    "name": "Ruptura Araxyte",
    "version": "",
    "combatLevel": 114,
    "hp": 58,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 25,
      "crush": 25,
      "magic": -10,
      "rangedHeavy": 25,
      "rangedStandard": 25,
      "rangedLight": 25
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Ruptura Araxyte.png",
    "size": 2,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "salarin-the-twisted",
    "wikiId": 304,
    "name": "Salarin the twisted",
    "version": "",
    "combatLevel": 70,
    "hp": 70,
    "defenceLevel": 62,
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
    "image": "Salarin the twisted.png",
    "size": 1,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "sand-crab",
    "wikiId": 5935,
    "name": "Sand Crab",
    "version": "Active",
    "combatLevel": 15,
    "hp": 60,
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
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Sand Crab.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "scarab-mage",
    "wikiId": 11508,
    "name": "Scarab Mage",
    "version": "Level 119 (Beneath Cursed Sands)",
    "combatLevel": 119,
    "hp": 120,
    "defenceLevel": 60,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 20,
      "crush": 20,
      "magic": 30,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Scarab Mage.png",
    "size": 1,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "scarab-swarm",
    "wikiId": 4192,
    "name": "Scarab Swarm",
    "version": "Normal",
    "combatLevel": 98,
    "hp": 25,
    "defenceLevel": 30,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 90,
      "slash": 90,
      "crush": 5,
      "magic": 90,
      "rangedHeavy": 90,
      "rangedStandard": 90,
      "rangedLight": 90
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Scarab Swarm.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "scarabs",
    "wikiId": 729,
    "name": "Scarabs",
    "version": "",
    "combatLevel": 92,
    "hp": 25,
    "defenceLevel": 10,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 15,
      "crush": 15,
      "magic": 15,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Scarabs.png",
    "size": 1,
    "maxHitText": "1",
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
    "slug": "scorpias-guardian",
    "wikiId": 6617,
    "name": "Scorpia's guardian",
    "version": "",
    "combatLevel": 47,
    "hp": 70,
    "defenceLevel": 60,
    "magicLevel": 30,
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
    "image": "Scorpia's guardian.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "scorpias-offspring-monster",
    "wikiId": 6616,
    "name": "Scorpia's offspring (monster)",
    "version": "",
    "combatLevel": 15,
    "hp": 2,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -40,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Scorpia's offspring (monster).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "scorpion",
    "wikiId": 2479,
    "name": "Scorpion",
    "version": "Level 59",
    "combatLevel": 59,
    "hp": 55,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 55,
      "rangedStandard": 55,
      "rangedLight": 55
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 25
    },
    "image": "Scorpion.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "screaming-banshee",
    "wikiId": 7390,
    "name": "Screaming banshee",
    "version": "",
    "combatLevel": 70,
    "hp": 61,
    "defenceLevel": 56,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 13,
      "slash": 13,
      "crush": 13,
      "magic": 0,
      "rangedHeavy": 13,
      "rangedStandard": 13,
      "rangedLight": 13
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Screaming banshee.png",
    "size": 3,
    "maxHitText": "7",
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
    "slug": "sea-snake-hatchling",
    "wikiId": 1098,
    "name": "Sea Snake Hatchling",
    "version": "",
    "combatLevel": 62,
    "hp": 50,
    "defenceLevel": 50,
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
      "severity": 20
    },
    "image": "Sea Snake Hatchling.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "sea-snake-young",
    "wikiId": 1097,
    "name": "Sea Snake Young",
    "version": "",
    "combatLevel": 90,
    "hp": 85,
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
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Sea Snake Young.png",
    "size": 2,
    "maxHitText": "8",
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
    "slug": "seagull",
    "wikiId": 1339,
    "name": "Seagull",
    "version": "Level 3",
    "combatLevel": 3,
    "hp": 10,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Seagull (level 3).png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "seagull-icyene-graveyard",
    "wikiId": 9609,
    "name": "Seagull (Icyene Graveyard)",
    "version": "",
    "combatLevel": 3,
    "hp": 10,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 20
    },
    "image": "Seagull (Icyene Graveyard).png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "sergeant-grimspike",
    "wikiId": 2218,
    "name": "Sergeant Grimspike",
    "version": "",
    "combatLevel": 142,
    "hp": 146,
    "defenceLevel": 132,
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
    "weakness": null,
    "image": "Sergeant Grimspike.png",
    "size": 1,
    "maxHitText": "21",
    "isSlayerMonster": true
  },
  {
    "slug": "sergeant-steelwill",
    "wikiId": 2217,
    "name": "Sergeant Steelwill",
    "version": "",
    "combatLevel": 142,
    "hp": 127,
    "defenceLevel": 150,
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
    "image": "Sergeant Steelwill.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "sergeant-strongstack",
    "wikiId": 2216,
    "name": "Sergeant Strongstack",
    "version": "",
    "combatLevel": 141,
    "hp": 128,
    "defenceLevel": 125,
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
    "weakness": null,
    "image": "Sergeant Strongstack.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "shade",
    "wikiId": 6740,
    "name": "Shade",
    "version": "Stronghold of Security",
    "combatLevel": 159,
    "hp": 170,
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
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Shade.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "shade-temple-trekking",
    "wikiId": 5633,
    "name": "Shade (Temple Trekking)",
    "version": "",
    "combatLevel": 140,
    "hp": 115,
    "defenceLevel": 100,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Fiyr Shade.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "shadow-hound",
    "wikiId": 3449,
    "name": "Shadow Hound",
    "version": "",
    "combatLevel": 63,
    "hp": 62,
    "defenceLevel": 54,
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
    "image": "Shadow Hound.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "shadow-spider",
    "wikiId": 3016,
    "name": "Shadow spider",
    "version": "",
    "combatLevel": 52,
    "hp": 55,
    "defenceLevel": 44,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 15,
      "crush": 10,
      "magic": 15,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Shadow spider.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "shadow-warrior",
    "wikiId": 2853,
    "name": "Shadow warrior",
    "version": "",
    "combatLevel": 48,
    "hp": 67,
    "defenceLevel": 36,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 43,
      "slash": 31,
      "crush": 19,
      "magic": 15,
      "rangedHeavy": 38,
      "rangedStandard": 38,
      "rangedLight": 38
    },
    "attributes": [],
    "weakness": null,
    "image": "Shadow warrior.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "skeletal-miner",
    "wikiId": 3615,
    "name": "Skeletal miner",
    "version": "",
    "combatLevel": 42,
    "hp": 39,
    "defenceLevel": 38,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -2,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [],
    "weakness": null,
    "image": "Skeletal miner.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "skeletal-mystic",
    "wikiId": 7604,
    "name": "Skeletal Mystic",
    "version": "Normal",
    "combatLevel": 0,
    "hp": 160,
    "defenceLevel": 187,
    "magicLevel": 140,
    "defenceBonuses": {
      "stab": 155,
      "slash": 155,
      "crush": 75,
      "magic": 140,
      "rangedHeavy": 75,
      "rangedStandard": 115,
      "rangedLight": 115
    },
    "attributes": [
      "undead",
      "xerician"
    ],
    "weakness": null,
    "image": "Skeletal mystic (1).png",
    "size": 2,
    "maxHitText": "Varies",
    "isSlayerMonster": true
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
    "slug": "skeleton",
    "wikiId": 82,
    "name": "Skeleton",
    "version": "Level 45, 1",
    "combatLevel": 45,
    "hp": 59,
    "defenceLevel": 36,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -2,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (level 45, 1).png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-ape-atoll",
    "wikiId": 5237,
    "name": "Skeleton (Ape Atoll)",
    "version": "",
    "combatLevel": 142,
    "hp": 77,
    "defenceLevel": 110,
    "magicLevel": 110,
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
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Ape Atoll).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-barrows",
    "wikiId": 1688,
    "name": "Skeleton (Barrows)",
    "version": "Armed round shield",
    "combatLevel": 77,
    "hp": 51,
    "defenceLevel": 72,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": -5,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Barrows, 4).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-catacombs-of-kourend",
    "wikiId": 7265,
    "name": "Skeleton (Catacombs of Kourend)",
    "version": "",
    "combatLevel": 22,
    "hp": 29,
    "defenceLevel": 17,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": -5,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Catacombs of Kourend).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-draynor-manor",
    "wikiId": 3565,
    "name": "Skeleton (Draynor Manor)",
    "version": "",
    "combatLevel": 22,
    "hp": 29,
    "defenceLevel": 17,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -2,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Draynor Manor).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-forthos-ruin",
    "wikiId": 10717,
    "name": "Skeleton (Forthos Ruin)",
    "version": "1",
    "combatLevel": 25,
    "hp": 17,
    "defenceLevel": 24,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -1,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Forthos Ruin, 1).png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-luciens-camp",
    "wikiId": 13476,
    "name": "Skeleton (Lucien's camp)",
    "version": "1",
    "combatLevel": 132,
    "hp": 54,
    "defenceLevel": 62,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 25,
      "slash": 20,
      "crush": 25,
      "magic": 10,
      "rangedHeavy": 30,
      "rangedStandard": 30,
      "rangedLight": 30
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "air",
      "severity": 35
    },
    "image": "Skeleton (Lucien's camp, 1).png",
    "size": 1,
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-mage",
    "wikiId": 6441,
    "name": "Skeleton (mage)",
    "version": "",
    "combatLevel": 94,
    "hp": 85,
    "defenceLevel": 80,
    "magicLevel": 110,
    "defenceBonuses": {
      "stab": 50,
      "slash": 40,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton Mage (lv 16).png",
    "size": 1,
    "maxHitText": "12 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-melzars-maze",
    "wikiId": 3972,
    "name": "Skeleton (Melzar's Maze)",
    "version": "1",
    "combatLevel": 22,
    "hp": 29,
    "defenceLevel": 17,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -2,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Melzar's Maze).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-shayzien-crypts",
    "wikiId": 8072,
    "name": "Skeleton (Shayzien Crypts)",
    "version": "Magic",
    "combatLevel": 132,
    "hp": 54,
    "defenceLevel": 62,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 35,
      "slash": 30,
      "crush": 35,
      "magic": 20,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Shayzien Crypts, magic).png",
    "size": 1,
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-stronghold-of-security",
    "wikiId": 2524,
    "name": "Skeleton (Stronghold of Security)",
    "version": "5",
    "combatLevel": 85,
    "hp": 77,
    "defenceLevel": 74,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 79,
      "slash": 31,
      "crush": 20,
      "magic": 5,
      "rangedHeavy": 70,
      "rangedStandard": 70,
      "rangedLight": 70
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Stronghold of Security, 5).png",
    "size": 1,
    "maxHitText": "10?",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-tarns-lair",
    "wikiId": 6468,
    "name": "Skeleton (Tarn's Lair)",
    "version": "Level 87",
    "combatLevel": 87,
    "hp": 92,
    "defenceLevel": 55,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 40,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (Tarn's Lair, 9).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-the-restless-ghost",
    "wikiId": 924,
    "name": "Skeleton (The Restless Ghost)",
    "version": "",
    "combatLevel": 13,
    "hp": 18,
    "defenceLevel": 7,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": -5,
      "magic": 0,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton (The Restless Ghost).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-wilderness-agility-course",
    "wikiId": 13495,
    "name": "Skeleton (Wilderness Agility Course)",
    "version": "1",
    "combatLevel": 18,
    "hp": 17,
    "defenceLevel": 24,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 11,
      "crush": -2,
      "magic": 1,
      "rangedHeavy": 4,
      "rangedStandard": 4,
      "rangedLight": 4
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Skeleton Lvl18.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-brute",
    "wikiId": 1538,
    "name": "Skeleton brute",
    "version": "",
    "combatLevel": 132,
    "hp": 124,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": -3,
      "rangedHeavy": 2,
      "rangedStandard": 2,
      "rangedLight": 2
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton brute.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-fremennik",
    "wikiId": 4497,
    "name": "Skeleton fremennik",
    "version": "Level 60",
    "combatLevel": 60,
    "hp": 40,
    "defenceLevel": 40,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 14,
      "slash": 18,
      "crush": 15,
      "magic": -4,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton fremennik (Level 60).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-heavy",
    "wikiId": 1540,
    "name": "Skeleton heavy",
    "version": "",
    "combatLevel": 130,
    "hp": 114,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": -3,
      "rangedHeavy": 2,
      "rangedStandard": 2,
      "rangedLight": 2
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton heavy.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-hellhound",
    "wikiId": 5054,
    "name": "Skeleton Hellhound",
    "version": "",
    "combatLevel": 97,
    "hp": 55,
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
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton Hellhound.png",
    "size": 2,
    "maxHitText": "12",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-hellhound-calvarion",
    "wikiId": 12107,
    "name": "Skeleton Hellhound (Calvar'ion)",
    "version": "",
    "combatLevel": 115,
    "hp": 30,
    "defenceLevel": 95,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 76,
      "slash": 73,
      "crush": 10,
      "magic": 126,
      "rangedHeavy": 155,
      "rangedStandard": 155,
      "rangedLight": 155
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Skeleton Hellhound (Calvar'ion).png",
    "size": 0,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-hellhound-vetion",
    "wikiId": 6613,
    "name": "Skeleton Hellhound (Vet'ion)",
    "version": "",
    "combatLevel": 194,
    "hp": 30,
    "defenceLevel": 150,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 101,
      "slash": 103,
      "crush": 10,
      "magic": 180,
      "rangedHeavy": 266,
      "rangedStandard": 266,
      "rangedLight": 266
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Skeleton Hellhound (Vet'ion).png",
    "size": 2,
    "maxHitText": "26",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-hero",
    "wikiId": 1537,
    "name": "Skeleton hero",
    "version": "",
    "combatLevel": 146,
    "hp": 114,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": -3,
      "rangedHeavy": 2,
      "rangedStandard": 2,
      "rangedLight": 2
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton hero.png",
    "size": 1,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-mage-2",
    "wikiId": 4319,
    "name": "Skeleton Mage",
    "version": "Level 83",
    "combatLevel": 83,
    "hp": 80,
    "defenceLevel": 60,
    "magicLevel": 100,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 15,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Skeleton Mage (lv 83).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-thug",
    "wikiId": 1541,
    "name": "Skeleton thug",
    "version": "",
    "combatLevel": 130,
    "hp": 114,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": -3,
      "rangedHeavy": 2,
      "rangedStandard": 2,
      "rangedLight": 2
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton thug.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "skeleton-warlord",
    "wikiId": 1539,
    "name": "Skeleton warlord",
    "version": "",
    "combatLevel": 132,
    "hp": 124,
    "defenceLevel": 110,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 3,
      "crush": 2,
      "magic": -3,
      "rangedHeavy": 2,
      "rangedStandard": 2,
      "rangedLight": 2
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Skeleton warlord.png",
    "size": 1,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "skoblin",
    "wikiId": 11268,
    "name": "Skoblin",
    "version": "",
    "combatLevel": 29,
    "hp": 30,
    "defenceLevel": 10,
    "magicLevel": 10,
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
    "image": "Skoblin.png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "skogre",
    "wikiId": 872,
    "name": "Skogre",
    "version": "1",
    "combatLevel": 44,
    "hp": 71,
    "defenceLevel": 35,
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
      "undead"
    ],
    "weakness": null,
    "image": "Skogre (1).png",
    "size": 2,
    "maxHitText": "5",
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
    "slug": "slash-bash",
    "wikiId": 882,
    "name": "Slash Bash",
    "version": "",
    "combatLevel": 111,
    "hp": 100,
    "defenceLevel": 60,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 30,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Slash Bash.png",
    "size": 3,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "small-lizard",
    "wikiId": 462,
    "name": "Small Lizard",
    "version": "Green",
    "combatLevel": 12,
    "hp": 15,
    "defenceLevel": 10,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 5,
      "crush": 5,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Small Lizard (green).png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "small-scarab",
    "wikiId": 14126,
    "name": "Small scarab",
    "version": "",
    "combatLevel": 41,
    "hp": 40,
    "defenceLevel": 55,
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
      "kalphite"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Small scarab.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "smoke-devil",
    "wikiId": 498,
    "name": "Smoke devil",
    "version": "",
    "combatLevel": 160,
    "hp": 185,
    "defenceLevel": 275,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 600,
      "rangedHeavy": 44,
      "rangedStandard": 44,
      "rangedLight": 44
    },
    "attributes": [],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Smoke devil.png",
    "size": 1,
    "maxHitText": "20",
    "isSlayerMonster": true
  },
  {
    "slug": "snailfeet",
    "wikiId": 11270,
    "name": "Snailfeet",
    "version": "",
    "combatLevel": 56,
    "hp": 80,
    "defenceLevel": 30,
    "magicLevel": 30,
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
    "image": "Snailfeet.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "snothead",
    "wikiId": 11269,
    "name": "Snothead",
    "version": "",
    "combatLevel": 32,
    "hp": 50,
    "defenceLevel": 15,
    "magicLevel": 15,
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
    "image": "Snothead.png",
    "size": 1,
    "maxHitText": "4",
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
    "slug": "sorebones",
    "wikiId": 562,
    "name": "Sorebones",
    "version": "Apron",
    "combatLevel": 57,
    "hp": 52,
    "defenceLevel": 50,
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
    "image": "Sorebones (apron).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "sourhog",
    "wikiId": 10435,
    "name": "Sourhog",
    "version": "",
    "combatLevel": 37,
    "hp": 40,
    "defenceLevel": 25,
    "magicLevel": 25,
    "defenceBonuses": {
      "stab": 0,
      "slash": 30,
      "crush": 10,
      "magic": 30,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Sourhog.png",
    "size": 3,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "spawn-of-sarachnis",
    "wikiId": 8714,
    "name": "Spawn of Sarachnis",
    "version": "Level 107",
    "combatLevel": 107,
    "hp": 30,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 20,
      "magic": -10,
      "rangedHeavy": 20,
      "rangedStandard": 150,
      "rangedLight": 150
    },
    "attributes": [],
    "weakness": null,
    "image": "Spawn of Sarachnis (melee).png",
    "size": 2,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "speedy-keith",
    "wikiId": 303,
    "name": "Speedy Keith",
    "version": "",
    "combatLevel": 34,
    "hp": 37,
    "defenceLevel": 27,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 10,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Speedy Keith.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "spider",
    "wikiId": 2478,
    "name": "Spider",
    "version": "Stronghold of Security",
    "combatLevel": 24,
    "hp": 22,
    "defenceLevel": 21,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 53,
      "slash": 53,
      "crush": 53,
      "magic": 53,
      "rangedHeavy": 53,
      "rangedStandard": 53,
      "rangedLight": 53
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Spider.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "spider-ape-atoll",
    "wikiId": 5238,
    "name": "Spider (Ape Atoll)",
    "version": "",
    "combatLevel": 1,
    "hp": 2,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 1,
      "crush": 0,
      "magic": 1,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Spider (Ape Atoll).png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "spider-ungael",
    "wikiId": 8137,
    "name": "Spider (Ungael)",
    "version": "",
    "combatLevel": 35,
    "hp": 4,
    "defenceLevel": 20,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 10,
      "magic": 17,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Spider (Ungael).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "spiked-turoth",
    "wikiId": 10397,
    "name": "Spiked Turoth",
    "version": "",
    "combatLevel": 244,
    "hp": 195,
    "defenceLevel": 154,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 40,
      "crush": 40,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "leafy"
    ],
    "weakness": null,
    "image": "Spiked Turoth.png",
    "size": 3,
    "maxHitText": "29",
    "isSlayerMonster": true
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
    "slug": "spiritual-mage",
    "wikiId": 11292,
    "name": "Spiritual mage",
    "version": "Zaros",
    "combatLevel": 182,
    "hp": 125,
    "defenceLevel": 100,
    "magicLevel": 200,
    "defenceBonuses": {
      "stab": 420,
      "slash": 400,
      "crush": 420,
      "magic": 200,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "fire",
      "severity": 200
    },
    "image": "Spiritual Mage (Zaros).png",
    "size": 1,
    "maxHitText": "38",
    "isSlayerMonster": true
  },
  {
    "slug": "spiritual-ranger",
    "wikiId": 2242,
    "name": "Spiritual ranger",
    "version": "Bandos",
    "combatLevel": 115,
    "hp": 131,
    "defenceLevel": 96,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 12,
      "slash": 14,
      "crush": 13,
      "magic": 5,
      "rangedHeavy": 13,
      "rangedStandard": 13,
      "rangedLight": 13
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Spiritual ranger (Bandos).png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "spiritual-warrior",
    "wikiId": 2243,
    "name": "Spiritual warrior",
    "version": "Bandos",
    "combatLevel": 134,
    "hp": 131,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 12,
      "slash": 14,
      "crush": 13,
      "magic": 5,
      "rangedHeavy": 13,
      "rangedStandard": 13,
      "rangedLight": 13
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Spiritual warrior (Bandos).png",
    "size": 1,
    "maxHitText": "16",
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
    "slug": "stick",
    "wikiId": 926,
    "name": "Stick",
    "version": "",
    "combatLevel": 104,
    "hp": 135,
    "defenceLevel": 60,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 30,
      "slash": 30,
      "crush": 50,
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
    "image": "Stick.png",
    "size": 2,
    "maxHitText": "27",
    "isSlayerMonster": true
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
    "slug": "strange-creature-shadows-of-custodia",
    "wikiId": 14706,
    "name": "Strange creature (Shadows of Custodia)",
    "version": "",
    "combatLevel": 93,
    "hp": 100,
    "defenceLevel": 45,
    "magicLevel": 25,
    "defenceBonuses": {
      "stab": 30,
      "slash": -10,
      "crush": 50,
      "magic": 35,
      "rangedHeavy": 30,
      "rangedStandard": 5,
      "rangedLight": -10
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 30
    },
    "image": "Strange creature (Shadows of Custodia).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "sulphur-lizard",
    "wikiId": 8614,
    "name": "Sulphur Lizard",
    "version": "",
    "combatLevel": 50,
    "hp": 50,
    "defenceLevel": 30,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 25,
      "crush": 25,
      "magic": 0,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [],
    "weakness": null,
    "image": "Sulphur Lizard.png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "sulphur-nagua",
    "wikiId": 13033,
    "name": "Sulphur Nagua",
    "version": "",
    "combatLevel": 98,
    "hp": 100,
    "defenceLevel": 40,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 10,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 15
    },
    "image": "Sulphur Nagua.png",
    "size": 2,
    "maxHitText": "11 total 6+5",
    "isSlayerMonster": true
  },
  {
    "slug": "sulphur-nagua-perilous-moons",
    "wikiId": 12879,
    "name": "Sulphur Nagua (Perilous Moons)",
    "version": "",
    "combatLevel": 98,
    "hp": 100,
    "defenceLevel": 40,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 50,
      "slash": 50,
      "crush": 10,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 200,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": null,
    "image": "Sulphur Nagua.png",
    "size": 2,
    "maxHitText": "6-5",
    "isSlayerMonster": true
  },
  {
    "slug": "summoned-zombie",
    "wikiId": 69,
    "name": "Summoned Zombie",
    "version": "",
    "combatLevel": 13,
    "hp": 22,
    "defenceLevel": 10,
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
      "undead"
    ],
    "weakness": null,
    "image": "Summoned Zombie.png",
    "size": 1,
    "maxHitText": "2",
    "isSlayerMonster": true
  },
  {
    "slug": "suqah",
    "wikiId": 787,
    "name": "Suqah",
    "version": "1",
    "combatLevel": 111,
    "hp": 105,
    "defenceLevel": 95,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 50,
      "slash": 70,
      "crush": 70,
      "magic": 90,
      "rangedHeavy": 50,
      "rangedStandard": 30,
      "rangedLight": 50
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Suqah (1).png",
    "size": 2,
    "maxHitText": "10",
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
    "slug": "swamp-crab",
    "wikiId": 8297,
    "name": "Swamp Crab",
    "version": "Normal",
    "combatLevel": 55,
    "hp": 75,
    "defenceLevel": 50,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 100,
      "magic": 100,
      "rangedHeavy": -55,
      "rangedStandard": -55,
      "rangedLight": -55
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 35
    },
    "image": "Swamp Crab.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
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
    "slug": "temple-guardian",
    "wikiId": 7620,
    "name": "Temple Guardian",
    "version": "",
    "combatLevel": 30,
    "hp": 45,
    "defenceLevel": 20,
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
    "image": "Temple guardian.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "temple-spider",
    "wikiId": 8703,
    "name": "Temple Spider",
    "version": "",
    "combatLevel": 75,
    "hp": 70,
    "defenceLevel": 10,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 30,
      "crush": 10,
      "magic": 25,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Temple Spider.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
    "slug": "terror-dog",
    "wikiId": 6473,
    "name": "Terror dog",
    "version": "Level 110",
    "combatLevel": 110,
    "hp": 87,
    "defenceLevel": 78,
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
    "image": "Terror dog (level 110).png",
    "size": 2,
    "maxHitText": "15",
    "isSlayerMonster": true
  },
  {
    "slug": "terrorbird",
    "wikiId": 2064,
    "name": "Terrorbird",
    "version": "1",
    "combatLevel": 28,
    "hp": 34,
    "defenceLevel": 19,
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
    "image": "Terrorbird.png",
    "size": 2,
    "maxHitText": "3",
    "isSlayerMonster": true
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
    "slug": "the-rocks",
    "wikiId": 15168,
    "name": "The rocks",
    "version": "",
    "combatLevel": 154,
    "hp": 130,
    "defenceLevel": 135,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 35,
      "slash": 60,
      "crush": 35,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 100
    },
    "image": "The rocks.png",
    "size": 1,
    "maxHitText": "? (Magic)\n23 (Melee)",
    "isSlayerMonster": true
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
    "slug": "thrower-troll",
    "wikiId": 931,
    "name": "Thrower Troll",
    "version": "",
    "combatLevel": 67,
    "hp": 95,
    "defenceLevel": 30,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 120,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Thrower Troll.png",
    "size": 1,
    "maxHitText": "10 Ranged",
    "isSlayerMonster": true
  },
  {
    "slug": "thrower-troll-trollheim",
    "wikiId": 4135,
    "name": "Thrower troll (Trollheim)",
    "version": "",
    "combatLevel": 68,
    "hp": 95,
    "defenceLevel": 15,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 120,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Thrower Troll.png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "tok-xil",
    "wikiId": 2193,
    "name": "Tok-Xil",
    "version": "Standard",
    "combatLevel": 90,
    "hp": 40,
    "defenceLevel": 60,
    "magicLevel": 60,
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
    "image": "Tok-Xil (1).png",
    "size": 3,
    "maxHitText": "13 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "torag-the-corrupted",
    "wikiId": 1676,
    "name": "Torag the Corrupted",
    "version": "",
    "combatLevel": 115,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 221,
      "slash": 235,
      "crush": 222,
      "magic": 0,
      "rangedHeavy": 221,
      "rangedStandard": 221,
      "rangedLight": 221
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Torag the Corrupted.png",
    "size": 1,
    "maxHitText": "23",
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
    "slug": "tortured-soul",
    "wikiId": 2999,
    "name": "Tortured soul",
    "version": "",
    "combatLevel": 59,
    "hp": 51,
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
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": null,
    "image": "Tortured soul.png",
    "size": 1,
    "maxHitText": "7",
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
    "slug": "tree-spirit-lost-city",
    "wikiId": 1163,
    "name": "Tree spirit (Lost City)",
    "version": "",
    "combatLevel": 101,
    "hp": 85,
    "defenceLevel": 80,
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
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "fire",
      "severity": 35
    },
    "image": "Tree spirit (Lost City).png",
    "size": 1,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "treus-dayth",
    "wikiId": 3616,
    "name": "Treus Dayth",
    "version": "In combat",
    "combatLevel": 95,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 5,
      "slash": 5,
      "crush": 5,
      "magic": -5,
      "rangedHeavy": 5,
      "rangedStandard": 5,
      "rangedLight": 5
    },
    "attributes": [
      "spectral",
      "undead"
    ],
    "weakness": {
      "element": "air",
      "severity": 25
    },
    "image": "Treus Dayth.png",
    "size": 1,
    "maxHitText": "15 (Ranged)",
    "isSlayerMonster": true
  },
  {
    "slug": "troll-general",
    "wikiId": 4122,
    "name": "Troll general",
    "version": "Hammer (brown)",
    "combatLevel": 113,
    "hp": 140,
    "defenceLevel": 40,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 35,
      "slash": 60,
      "crush": 35,
      "magic": 200,
      "rangedHeavy": 200,
      "rangedStandard": 120,
      "rangedLight": 200
    },
    "attributes": [],
    "weakness": {
      "element": "earth",
      "severity": 20
    },
    "image": "Troll general (hammer, brown).png",
    "size": 2,
    "maxHitText": "38",
    "isSlayerMonster": true
  },
  {
    "slug": "troll-spectator",
    "wikiId": 4123,
    "name": "Troll spectator",
    "version": "",
    "combatLevel": 71,
    "hp": 90,
    "defenceLevel": 25,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 10,
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
    "image": "Mountain troll.png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "tstanon-karlak",
    "wikiId": 3130,
    "name": "Tstanon Karlak",
    "version": "",
    "combatLevel": 145,
    "hp": 142,
    "defenceLevel": 125,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -5,
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
    "image": "Tstanon Karlak.png",
    "size": 3,
    "maxHitText": "15",
    "isSlayerMonster": true
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
    "slug": "turoth",
    "wikiId": 427,
    "name": "Turoth",
    "version": "Dad",
    "combatLevel": 89,
    "hp": 81,
    "defenceLevel": 88,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 20,
      "crush": 20,
      "magic": 0,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [
      "leafy"
    ],
    "weakness": null,
    "image": "Turoth (lv 89).png",
    "size": 2,
    "maxHitText": "10",
    "isSlayerMonster": true
  },
  {
    "slug": "twig",
    "wikiId": 4131,
    "name": "Twig",
    "version": "Awake",
    "combatLevel": 71,
    "hp": 90,
    "defenceLevel": 25,
    "magicLevel": 0,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 10,
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
    "image": "Twig.png",
    "size": 2,
    "maxHitText": "13 (approx)",
    "isSlayerMonster": true
  },
  {
    "slug": "twisted-banshee",
    "wikiId": 7272,
    "name": "Twisted Banshee",
    "version": "",
    "combatLevel": 89,
    "hp": 100,
    "defenceLevel": 50,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 15,
      "slash": 15,
      "crush": 15,
      "magic": 0,
      "rangedHeavy": 15,
      "rangedStandard": 15,
      "rangedLight": 15
    },
    "attributes": [
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 25
    },
    "image": "Twisted Banshee.png",
    "size": 2,
    "maxHitText": "9",
    "isSlayerMonster": true
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
    "slug": "tz-kek",
    "wikiId": 2191,
    "name": "Tz-Kek",
    "version": "Level 45",
    "combatLevel": 45,
    "hp": 20,
    "defenceLevel": 30,
    "magicLevel": 30,
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
    "image": "Tz-Kek (level 45).png",
    "size": 2,
    "maxHitText": "7",
    "isSlayerMonster": true
  },
  {
    "slug": "tz-kih",
    "wikiId": 2189,
    "name": "Tz-Kih",
    "version": "",
    "combatLevel": 22,
    "hp": 10,
    "defenceLevel": 15,
    "magicLevel": 15,
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
    "image": "Tz-Kih.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "tzhaar-hur",
    "wikiId": 2161,
    "name": "TzHaar-Hur",
    "version": "",
    "combatLevel": 74,
    "hp": 80,
    "defenceLevel": 60,
    "magicLevel": 80,
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
    "image": "TzHaar-Hur.png",
    "size": 1,
    "maxHitText": "7",
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
    "slug": "tzhaar-mej",
    "wikiId": 2154,
    "name": "TzHaar-Mej",
    "version": "",
    "combatLevel": 103,
    "hp": 100,
    "defenceLevel": 80,
    "magicLevel": 120,
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
    "image": "TzHaar-Mej.png",
    "size": 1,
    "maxHitText": "13 Magic",
    "isSlayerMonster": true
  },
  {
    "slug": "tzhaar-xil",
    "wikiId": 2167,
    "name": "TzHaar-Xil",
    "version": "Knife",
    "combatLevel": 133,
    "hp": 120,
    "defenceLevel": 100,
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
    "image": "TzHaar-Xil (knife).png",
    "size": 1,
    "maxHitText": "11",
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
    "slug": "ulfric",
    "wikiId": 4500,
    "name": "Ulfric",
    "version": "",
    "combatLevel": 100,
    "hp": 60,
    "defenceLevel": 82,
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
      "undead"
    ],
    "weakness": null,
    "image": "Ulfric.png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
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
    "slug": "undead-chicken",
    "wikiId": 2993,
    "name": "Undead chicken",
    "version": "",
    "combatLevel": 1,
    "hp": 3,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -42,
      "slash": -42,
      "crush": -42,
      "magic": -42,
      "rangedHeavy": -42,
      "rangedStandard": -42,
      "rangedLight": -42
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Undead chicken.png",
    "size": 1,
    "maxHitText": "0",
    "isSlayerMonster": true
  },
  {
    "slug": "undead-cow",
    "wikiId": 2992,
    "name": "Undead cow",
    "version": "",
    "combatLevel": 2,
    "hp": 8,
    "defenceLevel": 1,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": -21,
      "slash": -21,
      "crush": -21,
      "magic": -21,
      "rangedHeavy": -21,
      "rangedStandard": -21,
      "rangedLight": -21
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Undead cow.png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "undead-druid",
    "wikiId": 2145,
    "name": "Undead Druid",
    "version": "",
    "combatLevel": 105,
    "hp": 140,
    "defenceLevel": 60,
    "magicLevel": 115,
    "defenceBonuses": {
      "stab": 40,
      "slash": 30,
      "crush": 80,
      "magic": 140,
      "rangedHeavy": 40,
      "rangedStandard": 40,
      "rangedLight": 40
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Undead Druid.png",
    "size": 1,
    "maxHitText": "22 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "undead-lumberjack",
    "wikiId": 5713,
    "name": "Undead Lumberjack",
    "version": "Level 70",
    "combatLevel": 70,
    "hp": 18,
    "defenceLevel": 18,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Undead Lumberjack.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "undead-one",
    "wikiId": 5349,
    "name": "Undead one",
    "version": "Level 73",
    "combatLevel": 73,
    "hp": 59,
    "defenceLevel": 65,
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
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Undead one (Zombie, 4).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "uodai",
    "wikiId": 5262,
    "name": "Uodai",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Uodai.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "urium-shade",
    "wikiId": 10589,
    "name": "Urium Shade",
    "version": "Shade",
    "combatLevel": 140,
    "hp": 130,
    "defenceLevel": 100,
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
    "attributes": [
      "shade",
      "undead",
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 40
    },
    "image": "Urium Shade.png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "uyoro",
    "wikiId": 5260,
    "name": "Uyoro",
    "version": "",
    "combatLevel": 149,
    "hp": 130,
    "defenceLevel": 130,
    "magicLevel": 130,
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
    "image": "Uyoro.png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "vampyre-juvenile",
    "wikiId": 4436,
    "name": "Vampyre Juvenile",
    "version": "Burgh de Rott and Crombwick Manor",
    "combatLevel": 45,
    "hp": 60,
    "defenceLevel": 30,
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
      "vampyre1"
    ],
    "weakness": null,
    "image": "Vampyre Juvenile.png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "vampyre-juvinate",
    "wikiId": 9614,
    "name": "Vampyre Juvinate",
    "version": "Level 119 (Sins of the Father)",
    "combatLevel": 119,
    "hp": 150,
    "defenceLevel": 65,
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
    "attributes": [
      "vampyre2"
    ],
    "weakness": null,
    "image": "Vampyre Juvinate (Sins of the Father).png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
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
    "slug": "verac-the-defiled",
    "wikiId": 1677,
    "name": "Verac the Defiled",
    "version": "",
    "combatLevel": 115,
    "hp": 100,
    "defenceLevel": 100,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 227,
      "slash": 230,
      "crush": 221,
      "magic": 0,
      "rangedHeavy": 225,
      "rangedStandard": 225,
      "rangedLight": 225
    },
    "attributes": [
      "spectral"
    ],
    "weakness": {
      "element": "air",
      "severity": 50
    },
    "image": "Verac the Defiled.png",
    "size": 1,
    "maxHitText": "23 (Stab)",
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
    "slug": "vitreous-jelly",
    "wikiId": 7399,
    "name": "Vitreous Jelly",
    "version": "",
    "combatLevel": 206,
    "hp": 190,
    "defenceLevel": 220,
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
    "weakness": {
      "element": "earth",
      "severity": 30
    },
    "image": "Vitreous Jelly.png",
    "size": 2,
    "maxHitText": "17",
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
    "slug": "vulture",
    "wikiId": 1268,
    "name": "Vulture",
    "version": "Flying",
    "combatLevel": 31,
    "hp": 10,
    "defenceLevel": 10,
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
      "severity": 20
    },
    "image": "Vulture (flying).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "vyrewatch",
    "wikiId": 3712,
    "name": "Vyrewatch",
    "version": "Level 125",
    "combatLevel": 125,
    "hp": 110,
    "defenceLevel": 85,
    "magicLevel": 120,
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
      "vampyre3"
    ],
    "weakness": null,
    "image": "Vyrewatch.png",
    "size": 1,
    "maxHitText": "13",
    "isSlayerMonster": true
  },
  {
    "slug": "vyrewatch-sentinel",
    "wikiId": 9756,
    "name": "Vyrewatch Sentinel",
    "version": "1",
    "combatLevel": 151,
    "hp": 150,
    "defenceLevel": 180,
    "magicLevel": 120,
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
      "vampyre3"
    ],
    "weakness": null,
    "image": "Vyrewatch Sentinel (1).png",
    "size": 1,
    "maxHitText": "17",
    "isSlayerMonster": true
  },
  {
    "slug": "wall-beast",
    "wikiId": 476,
    "name": "Wall beast",
    "version": "Beast",
    "combatLevel": 49,
    "hp": 105,
    "defenceLevel": 16,
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
    "image": "Wall beast.png",
    "size": 1,
    "maxHitText": "4 (Melee)",
    "isSlayerMonster": true
  },
  {
    "slug": "warped-jelly",
    "wikiId": 7277,
    "name": "Warped Jelly",
    "version": "",
    "combatLevel": 112,
    "hp": 140,
    "defenceLevel": 70,
    "magicLevel": 95,
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
    "image": "Warped Jelly.png",
    "size": 1,
    "maxHitText": "10",
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
    "slug": "waterfiend",
    "wikiId": 2916,
    "name": "Waterfiend",
    "version": "Normal",
    "combatLevel": 115,
    "hp": 128,
    "defenceLevel": 128,
    "magicLevel": 105,
    "defenceBonuses": {
      "stab": 100,
      "slash": 100,
      "crush": 10,
      "magic": 100,
      "rangedHeavy": 20,
      "rangedStandard": 100,
      "rangedLight": 100
    },
    "attributes": [
      "demon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 100
    },
    "image": "Waterfiend.png",
    "size": 1,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "werewolf",
    "wikiId": 2603,
    "name": "Werewolf",
    "version": "Alexis",
    "combatLevel": 88,
    "hp": 100,
    "defenceLevel": 70,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 60,
      "rangedHeavy": 0,
      "rangedStandard": 0,
      "rangedLight": 0
    },
    "attributes": [],
    "weakness": null,
    "image": "Werewolf (Alexis).png",
    "size": 1,
    "maxHitText": "8",
    "isSlayerMonster": true
  },
  {
    "slug": "white-wolf",
    "wikiId": 108,
    "name": "White wolf",
    "version": "Level 38",
    "combatLevel": 38,
    "hp": 44,
    "defenceLevel": 32,
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
      "severity": 25
    },
    "image": "White wolf.png",
    "size": 2,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "wild-dog",
    "wikiId": 112,
    "name": "Wild dog",
    "version": "Normal",
    "combatLevel": 63,
    "hp": 62,
    "defenceLevel": 54,
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
    "image": "Wild dog.png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "wingman-skree",
    "wikiId": 3163,
    "name": "Wingman Skree",
    "version": "",
    "combatLevel": 143,
    "hp": 121,
    "defenceLevel": 160,
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
    "attributes": [
      "flying"
    ],
    "weakness": {
      "element": "air",
      "severity": 30
    },
    "image": "Wingman Skree.png",
    "size": 2,
    "maxHitText": "16",
    "isSlayerMonster": true
  },
  {
    "slug": "wolf",
    "wikiId": 106,
    "name": "Wolf",
    "version": "Level 64",
    "combatLevel": 64,
    "hp": 69,
    "defenceLevel": 52,
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
      "severity": 25
    },
    "image": "Wolf.png",
    "size": 2,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "wormbrain",
    "wikiId": 820,
    "name": "Wormbrain",
    "version": "",
    "combatLevel": 2,
    "hp": 5,
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
    "image": "Wormbrain.png",
    "size": 1,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "wyrm",
    "wikiId": 8611,
    "name": "Wyrm",
    "version": "Attacking",
    "combatLevel": 97,
    "hp": 120,
    "defenceLevel": 80,
    "magicLevel": 80,
    "defenceBonuses": {
      "stab": 10,
      "slash": 50,
      "crush": 50,
      "magic": 50,
      "rangedHeavy": 10,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Wyrm (attacking).png",
    "size": 3,
    "maxHitText": "13 (Magic)",
    "isSlayerMonster": true
  },
  {
    "slug": "wyrmling",
    "wikiId": 13032,
    "name": "Wyrmling",
    "version": "Attacking",
    "combatLevel": 55,
    "hp": 65,
    "defenceLevel": 40,
    "magicLevel": 60,
    "defenceBonuses": {
      "stab": 20,
      "slash": 50,
      "crush": 50,
      "magic": 50,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [
      "dragon"
    ],
    "weakness": {
      "element": "earth",
      "severity": 50
    },
    "image": "Wyrmling (attacking).png",
    "size": 2,
    "maxHitText": "5",
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
    "slug": "yt-hurkot",
    "wikiId": 7701,
    "name": "Yt-HurKot",
    "version": "Level 141",
    "combatLevel": 141,
    "hp": 90,
    "defenceLevel": 100,
    "magicLevel": 150,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": 130,
      "rangedHeavy": 130,
      "rangedStandard": 130,
      "rangedLight": 130
    },
    "attributes": [],
    "weakness": {
      "element": "water",
      "severity": 40
    },
    "image": "Yt-HurKot.png",
    "size": 1,
    "maxHitText": "18",
    "isSlayerMonster": true
  },
  {
    "slug": "yt-mejkot",
    "wikiId": 3123,
    "name": "Yt-MejKot",
    "version": "Standard",
    "combatLevel": 180,
    "hp": 80,
    "defenceLevel": 120,
    "magicLevel": 120,
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
    "image": "Yt-MejKot (1).png",
    "size": 4,
    "maxHitText": "25",
    "isSlayerMonster": true
  },
  {
    "slug": "zakln-gritch",
    "wikiId": 3131,
    "name": "Zakl'n Gritch",
    "version": "",
    "combatLevel": 142,
    "hp": 150,
    "defenceLevel": 127,
    "magicLevel": 50,
    "defenceBonuses": {
      "stab": 0,
      "slash": 0,
      "crush": 0,
      "magic": -5,
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
    "image": "Zakl'n Gritch.png",
    "size": 2,
    "maxHitText": "21",
    "isSlayerMonster": true
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
    "slug": "zogre",
    "wikiId": 866,
    "name": "Zogre",
    "version": "",
    "combatLevel": 44,
    "hp": 71,
    "defenceLevel": 35,
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
      "undead"
    ],
    "weakness": null,
    "image": "Zogre (1).png",
    "size": 2,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie",
    "wikiId": 49,
    "name": "Zombie",
    "version": "Level 24, 1",
    "combatLevel": 24,
    "hp": 30,
    "defenceLevel": 16,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 11,
      "rangedStandard": 11,
      "rangedLight": 11
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie (Level 24).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-entrana-dungeon",
    "wikiId": 64,
    "name": "Zombie (Entrana Dungeon)",
    "version": "1",
    "combatLevel": 25,
    "hp": 30,
    "defenceLevel": 21,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 10,
      "slash": 8,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie (Level 25).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-kourend",
    "wikiId": 7487,
    "name": "Zombie (Kourend)",
    "version": "Level 76",
    "combatLevel": 76,
    "hp": 71,
    "defenceLevel": 62,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Level 76).png",
    "size": 1,
    "maxHitText": "9",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-melzars-maze",
    "wikiId": 3980,
    "name": "Zombie (Melzar's Maze)",
    "version": "",
    "combatLevel": 24,
    "hp": 30,
    "defenceLevel": 16,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 11,
      "rangedStandard": 11,
      "rangedLight": 11
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie (Level 24, 6).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-sepulchre-of-death",
    "wikiId": 6741,
    "name": "Zombie (Sepulchre of Death)",
    "version": "",
    "combatLevel": 159,
    "hp": 170,
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
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Sepulchre of Death).png",
    "size": 1,
    "maxHitText": "14",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-shayzien-crypts",
    "wikiId": 8069,
    "name": "Zombie (Shayzien Crypts)",
    "version": "Magic",
    "combatLevel": 132,
    "hp": 54,
    "defenceLevel": 62,
    "magicLevel": 180,
    "defenceBonuses": {
      "stab": 35,
      "slash": 30,
      "crush": 35,
      "magic": 20,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Shayzien Crypts, Magic).png",
    "size": 1,
    "maxHitText": "19",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-stronghold-of-security",
    "wikiId": 2507,
    "name": "Zombie (Stronghold of Security)",
    "version": "Level 53, 1",
    "combatLevel": 53,
    "hp": 50,
    "defenceLevel": 48,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 19,
      "slash": 18,
      "crush": 0,
      "magic": 20,
      "rangedHeavy": 21,
      "rangedStandard": 21,
      "rangedLight": 21
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Stronghold of Security, level 53, 1).png",
    "size": 1,
    "maxHitText": "5",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-tarns-lair",
    "wikiId": 6465,
    "name": "Zombie (Tarn's Lair)",
    "version": "Level 100",
    "combatLevel": 100,
    "hp": 102,
    "defenceLevel": 81,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 20,
      "slash": 20,
      "crush": 0,
      "magic": 0,
      "rangedHeavy": 10,
      "rangedStandard": 10,
      "rangedLight": 10
    },
    "attributes": [
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie (Tarn's Lair, Level 100).png",
    "size": 1,
    "maxHitText": "11",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-temple-trekking",
    "wikiId": 5647,
    "name": "Zombie (Temple Trekking)",
    "version": "",
    "combatLevel": 23,
    "hp": 20,
    "defenceLevel": 20,
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
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Temple Trekking).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-wilderness",
    "wikiId": 59,
    "name": "Zombie (Wilderness)",
    "version": "Level 24, 1",
    "combatLevel": 24,
    "hp": 30,
    "defenceLevel": 16,
    "magicLevel": 1,
    "defenceBonuses": {
      "stab": 9,
      "slash": 8,
      "crush": 12,
      "magic": 10,
      "rangedHeavy": 11,
      "rangedStandard": 11,
      "rangedLight": 11
    },
    "attributes": [
      "undead"
    ],
    "weakness": null,
    "image": "Zombie (Wilderness, level 24, 1).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-zogre-flesh-eaters",
    "wikiId": 880,
    "name": "Zombie (Zogre Flesh Eaters)",
    "version": "",
    "combatLevel": 39,
    "hp": 50,
    "defenceLevel": 30,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie (Zogre Flesh Eaters).png",
    "size": 1,
    "maxHitText": "4",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-pirate",
    "wikiId": 13492,
    "name": "Zombie pirate",
    "version": "Level 34",
    "combatLevel": 34,
    "hp": 40,
    "defenceLevel": 20,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie pirate (4).png",
    "size": 1,
    "maxHitText": "3",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-pirate-braindeath-island",
    "wikiId": 613,
    "name": "Zombie pirate (Braindeath Island)",
    "version": "1",
    "combatLevel": 57,
    "hp": 52,
    "defenceLevel": 50,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie pirate (Braindeath Island) (1).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-pirate-harmony-island",
    "wikiId": 563,
    "name": "Zombie pirate (Harmony Island)",
    "version": "1",
    "combatLevel": 57,
    "hp": 52,
    "defenceLevel": 50,
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
      "undead"
    ],
    "weakness": null,
    "image": "Zombie pirate (Harmony Island) (1).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-rat",
    "wikiId": 3969,
    "name": "Zombie rat",
    "version": "1",
    "combatLevel": 3,
    "hp": 5,
    "defenceLevel": 2,
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
      "rat",
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie rat (1).png",
    "size": 2,
    "maxHitText": "1",
    "isSlayerMonster": true
  },
  {
    "slug": "zombie-swab",
    "wikiId": 619,
    "name": "Zombie swab",
    "version": "1",
    "combatLevel": 55,
    "hp": 50,
    "defenceLevel": 50,
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
      "undead"
    ],
    "weakness": {
      "element": "fire",
      "severity": 50
    },
    "image": "Zombie swab (1).png",
    "size": 1,
    "maxHitText": "6",
    "isSlayerMonster": true
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
  },
  {
    "slug": "zygomite",
    "wikiId": 1024,
    "name": "Zygomite",
    "version": "Level 86",
    "combatLevel": 86,
    "hp": 75,
    "defenceLevel": 75,
    "magicLevel": 75,
    "defenceBonuses": {
      "stab": 10,
      "slash": 10,
      "crush": 10,
      "magic": 20,
      "rangedHeavy": 20,
      "rangedStandard": 20,
      "rangedLight": 20
    },
    "attributes": [],
    "weakness": {
      "element": "fire",
      "severity": 40
    },
    "image": "Zygomite (level 86).png",
    "size": 2,
    "maxHitText": "8 (Melee)",
    "isSlayerMonster": true
  }
];

export const MONSTER_BY_SLUG: Record<string, MonsterCatalogEntry> = Object.fromEntries(
  MONSTER_CATALOG.map((m) => [m.slug, m]),
);
