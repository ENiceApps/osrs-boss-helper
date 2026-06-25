// Builds a tools.runescape.wiki/osrs-dps shortlink from the current loadout.
// The wiki calc accepts a full JSON state blob POSTed to its shortlink API,
// returning an ID that prefills equipment, skills, and target monster.

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { CombatBoost } from "@/lib/dps/boost";
import type { LoadoutSet } from "@/types/loadout";
import type { AttackStyleChoice, CombatStyle, Skills } from "@/types/osrs";

const SHORTLINK_API = "https://tools.runescape.wiki/osrs-dps/shortlink";
const WIKI_CALC_BASE = "https://tools.runescape.wiki/osrs-dps/";
// Keep in sync with IMPORT_VERSION in weirdgloop/osrs-dps-calc/src/types/State.ts
const IMPORT_VERSION = 10;

// Wiki calc Prayer enum values (Prayer.ts in weirdgloop/osrs-dps-calc)
const WIKI_PRAYER_FOR_STYLE: Record<CombatStyle, number> = {
  melee: 13,  // Prayer.PIETY
  ranged: 14, // Prayer.RIGOUR
  magic: 15,  // Prayer.AUGURY
};

// Wiki calc Potion enum values (Potion.ts in weirdgloop/osrs-dps-calc).
// Divine variants map to their non-divine counterpart (same boost formula;
// wiki calc has no divine potion entries). null = no equivalent, omit.
const WIKI_POTION_FOR_BOOST: Record<string, number | null> = {
  "divine-super-combat": 14, // Potion.SUPER_COMBAT
  "super-combat":        14, // Potion.SUPER_COMBAT
  "super-strength":      12, // Potion.SUPER_STRENGTH
  "super-attack":        11, // Potion.SUPER_ATTACK
  "combat-potion":       null,
  "divine-ranging":       7, // Potion.RANGING (+4 +10%)
  "ranging-potion":       7, // Potion.RANGING
  "bastion-potion":       7, // Potion.RANGING (closest)
  "saturated-heart":      8, // Potion.SATURATED_HEART
  "imbued-heart":         3, // Potion.IMBUED_HEART
  "divine-magic":         4, // Potion.MAGIC (+4 flat)
  "magic-potion":         4, // Potion.MAGIC
  "battlemage-potion":    4, // Potion.MAGIC (closest)
};

type WikiStance =
  | "Accurate"
  | "Aggressive"
  | "Controlled"
  | "Defensive"
  | "Rapid"
  | "Longrange"
  | "Autocast"
  | "Defensive Autocast";

function toWikiStance(choice: AttackStyleChoice, style: string): WikiStance {
  if (style === "magic") {
    if (choice === "defensive") return "Defensive Autocast";
    return "Autocast";
  }
  switch (choice) {
    case "accurate":   return "Accurate";
    case "aggressive": return "Aggressive";
    case "controlled": return "Controlled";
    case "defensive":  return "Defensive";
    case "rapid":      return "Rapid";
    case "longrange":  return "Longrange";
    default:           return "Accurate";
  }
}

/** Build the ImportableData payload the wiki calc shortlink API accepts. */
function buildPayload(
  set: LoadoutSet,
  skills: Skills,
  monster: MonsterCatalogEntry,
  onTask: boolean,
  boost: CombatBoost | undefined,
): object {
  const stance = toWikiStance(set.attackStyleChoice, set.style);
  const prayer = WIKI_PRAYER_FOR_STYLE[set.style];
  const potionVal = boost ? (WIKI_POTION_FOR_BOOST[boost.id] ?? null) : null;
  const potions = potionVal !== null ? [potionVal] : [];

  const equipment: Record<string, { id: number } | null> = {
    head:   set.slots.head   ? { id: set.slots.head.itemId }   : null,
    cape:   set.slots.cape   ? { id: set.slots.cape.itemId }   : null,
    neck:   set.slots.neck   ? { id: set.slots.neck.itemId }   : null,
    ammo:   set.slots.ammo   ? { id: set.slots.ammo.itemId }   : null,
    weapon: set.slots.weapon ? { id: set.slots.weapon.itemId } : null,
    body:   set.slots.body   ? { id: set.slots.body.itemId }   : null,
    shield: set.slots.shield ? { id: set.slots.shield.itemId } : null,
    legs:   set.slots.legs   ? { id: set.slots.legs.itemId }   : null,
    hands:  set.slots.hands  ? { id: set.slots.hands.itemId }  : null,
    feet:   set.slots.feet   ? { id: set.slots.feet.itemId }   : null,
    ring:   set.slots.ring   ? { id: set.slots.ring.itemId }   : null,
  };

  const wikiMonster = {
    id: monster.wikiId,
    name: monster.name,
    version: monster.version,
    image: monster.image,
    size: monster.size,
    // speed and style are cosmetic/NPC-only — defaults are fine for a DPS check
    speed: 4,
    style: "crush",
    skills: {
      atk: 0,
      def: monster.defenceLevel,
      hp: monster.hp,
      magic: monster.magicLevel,
      ranged: 0,
      str: 0,
    },
    offensive: { atk: 0, magic: 0, magic_str: 0, ranged: 0, ranged_str: 0, str: 0 },
    defensive: {
      flat_armour: 0,
      stab:     monster.defenceBonuses.stab,
      slash:    monster.defenceBonuses.slash,
      crush:    monster.defenceBonuses.crush,
      magic:    monster.defenceBonuses.magic,
      light:    monster.defenceBonuses.rangedLight,
      standard: monster.defenceBonuses.rangedStandard,
      heavy:    monster.defenceBonuses.rangedHeavy,
    },
    attributes: monster.attributes,
    weakness: monster.weakness,
    immunities: { burn: null },
    is_slayer_monster: false,
    inputs: {
      isFromCoxCm: false,
      toaInvocationLevel: 0,
      toaPathLevel: 0,
      partyMaxCombatLevel: 126,
      partySumMiningLevel: 99,
      partyMaxHpLevel: 99,
      partySize: 1,
      monsterCurrentHp: monster.hp,
      defenceReductions: {
        vulnerability: false,
        accursed: false,
        elderMaul: 0,
        dwh: 0,
        arclight: 0,
        emberlight: 0,
        bgs: 0,
        tonalztic: 0,
        seercull: 0,
        ayak: 0,
      },
      prayers: { melee: false, ranged: false, magic: false },
    },
  };

  return {
    serializationVersion: IMPORT_VERSION,
    selectedLoadout: 0,
    loadouts: [
      {
        name: "Boss Helper export",
        style: {
          name: stance,
          type: set.attackType,
          stance,
        },
        skills: {
          atk:      skills.attack,
          str:      skills.strength,
          def:      skills.defence,
          ranged:   skills.ranged,
          magic:    skills.magic,
          hp:       skills.hitpoints,
          prayer:   skills.prayer,
          mining:   1,
          herblore: 99,
        },
        equipment,
        buffs: {
          onSlayerTask: onTask,
          inWilderness: false,
          kandarinDiary: true,
          chargeSpell: false,
          markOfDarknessSpell: false,
          forinthrySurge: false,
          soulreaperStacks: 0,
          potions,
          baAttackerLevel: 0,
          chinchompaDistance: 4,
          usingSunfireRunes: false,
        },
        prayers: [prayer],
        spell: null,
      },
    ],
    monster: wikiMonster,
  };
}

/**
 * Creates a wiki DPS calculator shortlink for the current loadout and opens it
 * in a new tab. Returns the URL on success; throws on network error.
 */
export async function openInWikiCalc(
  set: LoadoutSet,
  skills: Skills,
  monster: MonsterCatalogEntry,
  onTask: boolean,
  boost: CombatBoost | undefined,
): Promise<string> {
  if (monster.wikiId === 0) {
    // Synthetic entries (Combat dummy) have no wiki equivalent — open the calc
    // with no pre-set monster.
    window.open(WIKI_CALC_BASE, "_blank", "noreferrer");
    return WIKI_CALC_BASE;
  }

  const payload = JSON.stringify(buildPayload(set, skills, monster, onTask, boost));
  const res = await fetch(SHORTLINK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  if (!res.ok) {
    throw new Error(`Shortlink API responded ${res.status}`);
  }

  const json = await res.json() as { data: string };
  const url = `${WIKI_CALC_BASE}?id=${json.data}`;
  window.open(url, "_blank", "noreferrer");
  return url;
}
