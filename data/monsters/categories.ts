// Game-progression categories for the boss browser. The vendor monster data has
// no reliable "difficulty" or "is a boss" field (its is_slayer_monster flag is
// over-inclusive), so these are hand-classified with OSRS knowledge.
//
// "Primary" category is mutually exclusive — every monster has exactly one:
//   early / mid / late  = non-raid bosses by rough account progression
//   cox / tob / toa      = the three raids, grouped by raid (all encounters)
//   npc                  = catch-all: Slayer creatures, quest NPCs, Colosseum
//                          waves, skilling bosses, event/joke entries, etc.
//
// "Slayer" is a SEPARATE cross-cutting tag (see SLAYER_BOSSES), not a primary
// category — a Slayer boss still has a primary tier (e.g. Vorkath is Mid game
// AND a Slayer boss). It includes bosses that count toward a Slayer task even
// when not directly assigned (Vorkath → blue dragon, Tormented Demon → greater
// demon, Demonic gorilla → black demon, …).
//
// This is pure data — edit the maps freely.

export type MonsterCategory = "early" | "mid" | "late" | "cox" | "tob" | "toa" | "npc";

export const CATEGORY_LABELS: Record<MonsterCategory, string> = {
  early: "Early game",
  mid: "Mid game",
  late: "Late game",
  cox: "CoX",
  tob: "ToB",
  toa: "ToA",
  npc: "Non-boss NPC",
};

// slug → primary category for known standalone / raid bosses.
const BOSS_CATEGORY: Record<string, Exclude<MonsterCategory, "npc">> = {
  // --- Early game (first bosses, low gear) ---
  "giant-mole": "early",
  "scurrius": "early",
  "king-black-dragon": "early",
  "deranged-archaeologist": "early",
  "the-mimic": "early",
  "amoxliatl": "early",

  // --- Mid game ---
  "vorkath": "mid",
  "zulrah": "mid",
  "kalphite-queen": "mid",
  "sarachnis": "mid",
  "dagannoth-rex": "mid",
  "dagannoth-prime": "mid",
  "dagannoth-supreme": "mid",
  "general-graardor": "mid",
  "kril-tsutsaroth": "mid",
  "commander-zilyana": "mid",
  "kreearra": "mid",
  "callisto": "mid",
  "artio": "mid",
  "venenatis": "mid",
  "spindel": "mid",
  "vetion": "mid",
  "scorpia": "mid",
  "chaos-fanatic": "mid",
  "crazy-archaeologist": "mid",
  "chaos-elemental": "mid",
  "phantom-muspah": "mid",
  "the-hueycoatl": "mid",
  "tztok-jad": "mid",
  "blood-moon": "mid",
  "blue-moon": "mid",
  "eclipse-moon": "mid",
  "branda-the-fire-queen": "mid",
  "eldric-the-ice-king": "mid",
  "crystalline-hunllef": "mid",
  "cerberus": "mid",
  "abyssal-sire": "mid",
  "kraken": "mid",
  "thermonuclear-smoke-devil": "mid",
  "skotizo": "mid",
  "dawn": "mid", // Grotesque Guardians
  "dusk": "mid", // Grotesque Guardians

  // --- Late / end game ---
  "nex": "late",
  "corporeal-beast": "late",
  "the-nightmare": "late",
  "phosanis-nightmare": "late",
  "vardorvis": "late",
  "duke-sucellus": "late",
  "the-leviathan": "late",
  "the-whisperer": "late",
  "tzkal-zuk": "late",
  "yama": "late",
  "corrupted-hunllef": "late",
  "sol-heredit": "late",
  "doom-of-mokhaiotl": "late",
  "alchemical-hydra": "late",
  "araxxor": "late",

  // --- Chambers of Xeric (CoX) ---
  "great-olm": "cox",
  "tekton": "cox",
  "vasa-nistirio": "cox",
  "vespula": "cox",
  "muttadile": "cox",
  "guardian-chambers-of-xeric": "cox",
  "abyssal-portal": "cox",

  // --- Theatre of Blood (ToB) ---
  "verzik-vitur": "tob",
  "the-maiden-of-sugadinti": "tob",
  "pestilent-bloat": "tob",
  "nylocas-vasilias": "tob",
  "nylocas-matomenos": "tob",
  "nylocas-prinkipas": "tob",
  "sotetseg": "tob",
  "xarpus": "tob",

  // --- Tombs of Amascut (ToA) ---
  "tumekens-warden": "toa",
  "elidinis-warden": "toa",
  "akkha": "toa",
  "ba-ba": "toa",
  "zebak": "toa",
  "obelisk-tombs-of-amascut": "toa",
};

// Cross-cutting tag: bosses you can kill on a Slayer task — directly assigned
// (Cerberus, Hydra, …) OR counting toward another creature's task (Vorkath as a
// blue dragon, Tormented Demon as a greater demon, Demonic gorilla as a black
// demon, Basilisk Knight as a basilisk, Kalphite Queen as a kalphite).
const SLAYER_BOSSES = new Set<string>([
  // Directly-assigned Slayer bosses
  "cerberus",
  "alchemical-hydra",
  "abyssal-sire",
  "kraken",
  "thermonuclear-smoke-devil",
  "dawn",
  "dusk",
  "skotizo",
  "araxxor",
  // Count toward another creature's Slayer task
  "vorkath", // blue dragon
  "tormented-demon", // greater demon
  "demonic-gorilla", // black demon
  "kalphite-queen", // kalphite
  "basilisk-knight", // basilisk
]);

/** Primary (mutually-exclusive) category for a slug; unmapped = non-boss NPC. */
export function categoryForMonster(slug: string): MonsterCategory {
  return BOSS_CATEGORY[slug] ?? "npc";
}

/** True iff this boss is killable on a Slayer task (a cross-cutting tag). */
export function isSlayerBoss(slug: string): boolean {
  return SLAYER_BOSSES.has(slug);
}
