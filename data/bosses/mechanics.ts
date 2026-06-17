// Per-boss mechanic checklists, keyed by catalog slug. Each entry lists the
// non-DPS prerequisites and gameplay notes for the fight. Entries are hand-
// curated; bosses not listed simply don't have a mechanics section yet.
//
// Schema lives in types/osrs.ts → MechanicRequirement. satisfiedBy.anyOf is
// optional — informational mechanics (prayer flicks, positioning) omit it.

import type { MechanicRequirement } from "@/types/osrs";
import { asItemId } from "@/types/osrs";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import { universalMechanicsFor } from "@/data/bosses/universal-mechanics";

const id = (n: number) => asItemId(n);

// ---------------- Vorkath ----------------
const VORKATH: MechanicRequirement[] = [
  {
    id: "dragonfire-protection",
    label: "Dragonfire protection",
    description:
      "Vorkath's dragonfire hits 50+ unprotected. A Super antifire (or Extended super antifire) fully protects on its own and leaves your shield slot free for DPS. Otherwise equip a dragonfire shield/ward AND drink a regular antifire — a regular antifire alone is not enough.",
    // Inventory route: a super antifire fully covers it and frees the shield slot.
    satisfiedBy: {
      anyOf: [
        [id(21978), id(21981), id(21984), id(21987)], // Super antifire (1-4)
        [id(22209), id(22212), id(22215), id(22218)], // Extended super antifire (1-4)
      ],
    },
    // Worn route: a dragonfire shield/ward in the shield slot (paired with a
    // regular antifire). Competes with DPS for the shield slot.
    worn: {
      slot: "shield",
      items: [
        id(1540), // Anti-dragon shield
        id(11283), id(11284), // Dragonfire shield (charged / uncharged)
        id(22002), id(22003), // Dragonfire ward (charged / uncharged)
      ],
    },
    remediation:
      "Bring a Super antifire (4) to keep the shield slot free for DPS, OR equip a Dragonfire ward/shield together with a regular antifire potion.",
  },
  {
    id: "crumble-undead",
    label: "Crumble Undead source (Zombified Spawn)",
    description:
      "Vorkath summons a Zombified Spawn every ~6 attacks. Cast Crumble Undead to despawn it; otherwise it explodes for up to 60.",
    satisfiedBy: { anyOf: [[id(12791), id(27281)]] }, // Rune pouch, Divine rune pouch
    remediation:
      "Bring a Rune Pouch loaded with earth, air, and chaos runes for Crumble Undead.",
  },
  {
    id: "food",
    label: "Food",
    description: "Vorkath hits hard. Bring high-healing food.",
    satisfiedBy: {
      anyOf: [[id(385)], [id(391)], [id(3144)], [id(6685)]], // Shark, Manta ray, Cooked karambwan, Sara brew (4)
    },
    remediation: "Bring Sharks, Manta rays, or Saradomin brews. Karambwans for combo.",
  },
  {
    id: "prayer-restore",
    label: "Prayer restoration",
    description:
      "Protect from Magic + Rigour/Eagle Eye drains prayer fast.",
    satisfiedBy: { anyOf: [[id(2434)], [id(3024)], [id(30125)]] },
    remediation: "Bring Prayer potions or Super restores.",
  },
];

// ---------------- King Black Dragon ----------------
const KBD: MechanicRequirement[] = [
  {
    id: "dragonfire-protection",
    label: "Dragonfire protection",
    description:
      "KBD breathes dragonfire AND elemental breaths (ice, lightning, poison, shock). A Super antifire fully blocks the dragonfire and frees the shield slot; otherwise pair a dragonfire shield/ward with a regular antifire. The elemental breaths still need Protect from Magic on top.",
    satisfiedBy: {
      anyOf: [
        [id(21978), id(21981), id(21984), id(21987)], // Super antifire
        [id(22209), id(22212), id(22215), id(22218)], // Extended super antifire
      ],
    },
    worn: {
      slot: "shield",
      items: [
        id(1540), // Anti-dragon shield
        id(11283), id(11284), // Dragonfire shield (charged / uncharged)
        id(22002), id(22003), // Dragonfire ward (charged / uncharged)
      ],
    },
    remediation: "Bring a Super antifire (4) to free the shield slot, or equip a Dragonfire shield/ward with a regular antifire.",
  },
  {
    id: "protect-from-magic",
    label: "Use Protect from Magic",
    description:
      "Mitigates KBD's elemental breaths (ice/lightning/shock/poison) which deal ~50 unprayed. Stays on the entire fight; KBD's auto melee/dragonfire is already handled by antifire.",
    remediation: "Keep Protect from Magic active throughout the fight.",
  },
  {
    id: "food",
    label: "Food",
    description: "240 HP boss — not long, but breaths can chunk if antifire ticks down.",
    satisfiedBy: { anyOf: [[id(385)], [id(391)], [id(3144)]] },
    remediation: "Sharks/Manta rays are plenty. ~10 should cover a trip.",
  },
  {
    id: "wilderness-warning",
    label: "Wilderness fight",
    description:
      "KBD's lair is deep wilderness — vulnerable to PKers. Don't bring more than you're willing to lose.",
    remediation:
      "Use a low-risk loadout if you're worried about PKers. The lever in Edgeville teleports you in.",
  },
];

// ---------------- Cerberus ----------------
const CERBERUS: MechanicRequirement[] = [
  {
    id: "prayer-flick",
    label: "Prayer flick the auto attacks",
    description:
      "Cerberus auto-attacks rotate Magic → Ranged → Melee in a fixed pattern. Flick the correct protection prayer for each attack to take 0 damage. Misses cost ~25.",
    remediation:
      "Practice flicking. Online guides have animations of the attack tells (head tilt for magic, low growl for ranged).",
  },
  {
    id: "summoning-souls",
    label: "Handle the summoning souls (50% HP)",
    description:
      "At 50% HP Cerberus spawns 3 souls (one of each combat style). Each takes ~3 hits with whatever style matches its protection prayer. Tank them under the right prayer or kill them quickly.",
    remediation:
      "Pray the matching protection prayer to dodge each soul's hit, then kill them in melee range.",
  },
  {
    id: "lava-pools",
    label: "Avoid the lava pools",
    description:
      "Cerberus spawns 3 lava pools at 200 HP. Walk out of the active one — they deal ~15 per tick.",
    remediation:
      "Move to a clear tile when pools appear. They stay for ~6 seconds.",
  },
  {
    id: "food",
    label: "Food + prayer restore",
    description:
      "600 HP boss + summons + lava → bring enough sustain.",
    satisfiedBy: {
      anyOf: [[id(385)], [id(391)], [id(3144)], [id(6685)], [id(2434)], [id(3024)]],
    },
    remediation: "Sharks/Manta + Prayer pots or Sara brews + Super restores.",
  },
  {
    id: "smoke-devil-task-bonus",
    label: "Slayer task bonus (optional)",
    description:
      "Cerberus is on the Hellhound slayer task. On task, Slayer helmet (i) gives +15% ranged/magic accuracy & damage — significant DPS uplift.",
    remediation:
      "Get a Hellhound task from Konar/Duradel before going. Equip the imbued Slayer helmet.",
  },
];

// ---------------- Zulrah ----------------
const ZULRAH: MechanicRequirement[] = [
  {
    id: "zulrah-anti-poison",
    label: "Anti-venom or Serpentine helm",
    description:
      "Zulrah's attacks inflict venom (6+ damage per tick, climbs). Anti-venom potion stops venom; Anti-venom+ also gives immunity. A charged Serpentine helm provides full venom immunity passively.",
    satisfiedBy: {
      anyOf: [
        [asItemId(12913), asItemId(12915)], // Anti-venom (4), Anti-venom+ (4)
        [asItemId(12931)], // Serpentine helm (charged)
      ],
    },
    remediation:
      "Bring Anti-venom+ (4) or wear a charged Serpentine helm. Without venom prevention, you'll bleed out fast.",
  },
  {
    id: "zulrah-dual-style",
    label: "Bring both Magic and Ranged gear",
    description:
      "Zulrah cycles through 4 forms in a fixed rotation per spawn. Green/blue (magic) → swap to Ranged. Red (ranged) → swap to Magic. Carry both gear sets in your inventory and switch.",
    remediation:
      "Common loadout: BoFA / Crystal armour for ranged phase + Trident / Sang for magic phase. Or Tbow + Harm staff for endgame.",
  },
  {
    id: "zulrah-prayer-flick",
    label: "Prayer flick the matching protection",
    description:
      "Pray Magic vs Green/Red forms (which attack with magic) and Ranged vs Blue form (which attacks with ranged). Tank zero damage if flicked correctly.",
    remediation:
      "Memorise Zulrah's 4 rotations — there are videos demonstrating each. Most efficient if you learn one rotation by heart.",
  },
  {
    id: "food",
    label: "Food + brews",
    description:
      "500 HP + venom + prayer drain means a long inventory. Karambwan + Sara brew is the standard combo eat.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3144)]] },
    remediation: "Bring 6-8 Sara brews + 6-8 Karambwans + Super restores.",
  },
  {
    id: "prayer-restore",
    label: "Prayer restoration",
    description: "Long fight, hard prayer drain. Super restores also restore stats brews lower.",
    satisfiedBy: { anyOf: [[asItemId(3024)], [asItemId(2434)]] },
    remediation: "Bring Super restores (4) — they double as Sara-brew stat restorers.",
  },
];

// ---------------- Alchemical Hydra ----------------
const ALCHEMICAL_HYDRA: MechanicRequirement[] = [
  {
    id: "hydra-anti-poison",
    label: "Anti-poison (early phases)",
    description:
      "Hydra inflicts venom in its first two phases. Anti-venom+ recommended; Serpentine helm works for the head slot but is sub-optimal for ranged DPS.",
    satisfiedBy: { anyOf: [[asItemId(12913), asItemId(12915)], [asItemId(12931)]] },
    remediation: "Anti-venom+ (4) is standard.",
  },
  {
    id: "hydra-phases",
    label: "Phase progression: Poison → Lightning → Flame → Acid",
    description:
      "Four colour-coded phases. Lure Hydra to the matching vent between phases to disable its special attacks. Skipping the lure means you eat all the specials.",
    remediation:
      "Standard route: kill to 75% on a vent → 50% on next vent → 25% on next vent. The vent triggers when Hydra crosses it.",
  },
  {
    id: "hydra-prayer-flick",
    label: "Prayer flick alternating attacks",
    description:
      "Hydra rotates Magic → Ranged → Ranged → Magic on auto-attacks. Flick correctly to take 0 damage on the cycle.",
    remediation:
      "Pattern: 3 of one style then 3 of the other. Watch the head animation for the tell.",
  },
  {
    id: "hydra-slayer-task",
    label: "Slayer task (strongly recommended)",
    description:
      "Hydras are on the Hydra-only slayer task from Konar. Imbued Slayer helmet gives +15% accuracy/damage on task — massive DPS uplift, often the difference between viable and not.",
    remediation: "Get a Hydra task before grinding. Block other tasks at Konar if needed.",
  },
  {
    id: "food",
    label: "Food",
    description: "1100 HP boss + special attacks → bring a full inventory.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(3144)], [asItemId(6685)]] },
    remediation: "Sharks/Manta + Sara brew for the lightning phase chip damage.",
  },
];

// ---------------- General Graardor (Bandos) ----------------
const GRAARDOR: MechanicRequirement[] = [
  {
    id: "graardor-entry-req",
    label: "Bandos chamber entry: 70 Strength + Bandos item",
    description:
      "Need 70 Strength (boostable) to enter Bandos chamber, plus a Bandos-aligned item (Bandos boots are the cheapest).",
    satisfiedBy: { anyOf: [[asItemId(11836)]] }, // Bandos boots
    remediation: "Bandos boots (~50k) are the standard. Hilt or Tassets/Chest also work.",
  },
  {
    id: "graardor-pray-range",
    label: "Pray Range for Graardor's auto attacks",
    description:
      "Graardor's ranged-style auto (the rock throw) is his only consistent damage. Praying Range tanks both his ranged AND the ranged minion (Sergeant Steelwill is magic — but Range covers the rest).",
    remediation: "Keep Protect from Missiles active throughout. Eat through magic spec hits.",
  },
  {
    id: "graardor-minion-management",
    label: "Tank or kill minions",
    description:
      "Bandos has 3 minions: Strongstack (melee), Steelwill (mage), Grimspike (ranged). At static teams they're killed first; solo, they're often left alive and tanked under Protect from Missiles.",
    remediation:
      "Solo: ignore minions, focus Graardor. Team: split minions among players who tank/kill.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Multi-hit room — Graardor hits hard and minions add up.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(3144)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots/Super restores.",
  },
];

// ---------------- Kree'arra (Armadyl) ----------------
const KREEARRA: MechanicRequirement[] = [
  {
    id: "kreearra-entry-req",
    label: "Armadyl chamber entry: 70 Ranged + Armadyl item",
    description:
      "Need 70 Ranged plus an Armadyl-aligned item (Armadyl pendant, Mitre, Cloak — or any piece of Armadyl armour).",
    satisfiedBy: { anyOf: [[asItemId(11826)], [asItemId(11828)], [asItemId(11830)]] },
    remediation: "Any single Armadyl armour piece works. Cheapest is the pendant.",
  },
  {
    id: "kreearra-must-be-ranged",
    label: "Ranged only (effectively)",
    description:
      "Kree'arra is flying — melee can only reach if you stand directly under him AND your weapon is non-projectile. In practice, EVERYONE uses Ranged. He's weak to Air spells, so Air Surge magic also works but ranged is faster.",
    remediation:
      "Bring Twisted bow / Bow of Faerdhinen / DHCB. Tbow shines here (high magic level, weak to ranged).",
  },
  {
    id: "kreearra-pray-range",
    label: "Pray Range",
    description:
      "Kree'arra's wind-blast auto hits ~21 unprayed and can knock you back. Protect from Missiles negates the damage.",
    remediation: "Keep Protect from Missiles active.",
  },
  {
    id: "kreearra-minions",
    label: "Minions: kill or tank under prayer",
    description:
      "3 minions (Wingman Skree mage, Flockleader Geerin ranged, Flight Kilisa melee). Solo: typically kill them first (they have only ~30 HP each) or tank under Protect from Missiles.",
    remediation: "Quick-kill minions with a switch weapon, then focus Kree'arra.",
  },
  {
    id: "food",
    label: "Food",
    description: "Sustained ranged damage from Kree + minions adds up.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots.",
  },
];

// ---------------- K'ril Tsutsaroth (Zamorak) ----------------
const KRIL: MechanicRequirement[] = [
  {
    id: "kril-entry-req",
    label: "Zamorak chamber entry: 70 Hitpoints + Zamorak item",
    description:
      "70 Hitpoints plus a Zamorak-aligned item (e.g. Zamorak hilt, mitre, cloak, Zamorakian spear, Unholy book).",
    remediation: "Cheapest entry: Unholy book or Zamorak cloak.",
  },
  {
    id: "kril-demonbane",
    label: "Demonbane weapon (Arclight or Emberlight)",
    description:
      "K'ril is a demon — Arclight gives +70% damage and accuracy on charged, Emberlight is the upgrade (~+25% damage on top). Without a demonbane weapon, DPS roughly halves.",
    satisfiedBy: {
      anyOf: [
        [asItemId(19675)], // Arclight (Charged)
        [asItemId(29589)], // Emberlight
      ],
    },
    remediation: "Charge an Arclight or upgrade to Emberlight — biggest DPS multiplier you'll find anywhere.",
  },
  {
    id: "kril-pray-magic",
    label: "Pray Magic",
    description:
      "K'ril hits +49 with his magic attack unprayed and can drain prayer with his spec. Protect from Magic tanks his auto.",
    remediation: "Keep Protect from Magic up always.",
  },
  {
    id: "kril-minions",
    label: "Minions (kill or tank)",
    description:
      "3 minions: Tstanon Karlak (melee), Balfrug Kreeyath (mage), Zakl'n Gritch (ranged). Balfrug's magic spec can drop your prayer fast — kill it first solo.",
    remediation: "Solo: kill Balfrug first to stop prayer-drain spec, then focus K'ril.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Prayer drains FAST from Magic protect + Balfrug spec.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Bring extra prayer pots — K'ril burns more prayer than other GWD bosses.",
  },
];

// ---------------- Commander Zilyana (Saradomin) ----------------
const ZILYANA: MechanicRequirement[] = [
  {
    id: "zilyana-entry-req",
    label: "Saradomin chamber entry: 70 Agility + Saradomin item",
    description:
      "70 Agility (boostable with Summer pie) plus a Saradomin-aligned item.",
    remediation: "Cheapest entry: Holy book or Saradomin cloak.",
  },
  {
    id: "zilyana-kill-starlight",
    label: "Kill Starlight FIRST (the healer)",
    description:
      "Bree (ranged minion) is fine to tank, but Starlight (the centaur) heals the team. Zilyana herself can hit hard with ranged + magic.",
    remediation:
      "Solo: Starlight first, then Bree, then focus Zilyana under Range prayer.",
  },
  {
    id: "zilyana-pray-range",
    label: "Pray Range",
    description:
      "Zilyana's primary auto hits +27 ranged. Protect from Missiles tanks it; her melee is rare and weak.",
    remediation: "Keep Protect from Missiles active.",
  },
  {
    id: "zilyana-melee-or-tbow",
    label: "Melee or Twisted bow",
    description:
      "Zilyana's defence bonuses are uniform (100 to every style), so the best weapon is just whichever has the highest raw DPS. Her very high magic level (300) makes the Twisted bow scale exceptionally well; otherwise Scythe / Fang / Soulreaper lead in melee.",
    remediation: "Scythe of Vitur if you have it; otherwise Fang or Tbow.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Standard GWD sustain.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots.",
  },
];

// ---------------- Great Olm (CoX) ----------------
const GREAT_OLM: MechanicRequirement[] = [
  {
    id: "olm-multi-style",
    label: "Multiple gear styles required",
    description:
      "Olm has 3 limb phases (head + 2 hands) plus a leg phase. Best practice: Tbow + Masori for head (high magic), Scythe for hands and legs (slash). Sometimes magic for head with Sang/Shadow.",
    remediation:
      "Tbow + Scythe is the standard duo. Bring switches in inventory.",
  },
  {
    id: "olm-prayer-flick",
    label: "Prayer flick Olm's autos",
    description:
      "Olm rotates Magic → Ranged → Magic → Ranged auto attacks during head phase. Flick the matching protection prayer.",
    remediation: "Watch the head's eye colour: red = magic, green = ranged.",
  },
  {
    id: "olm-specials",
    label: "Dodge specials: crystals, lightning, acid pools, falling boulders",
    description:
      "Each cycle Olm uses 2-3 specials. Crystal Burst (target lock), Acid (pools of corrosion), Lightning (chase line), Burning rocks (top of room). Memorise the cycle.",
    remediation:
      "Solo: very hard, watch a guide. Team: each player handles a specific special.",
  },
  {
    id: "olm-phase-transitions",
    label: "Phase: head → both hands → head → legs (repeat)",
    description:
      "Olm has 4 visible phases per cycle. Head must be DPS'd while hands are alive, but only takes damage when both hands are inactive. Kill hands first to enable head DPS.",
    remediation: "Standard order: melee one hand, ranged the other, then DPS head, then melee legs.",
  },
  {
    id: "food-brews",
    label: "Brews + restores",
    description: "Long fight, ~800 HP across phases. Prayer drain is steep.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores. 4-6 brews + 4 restores typical for solo.",
  },
];

// ---------------- DK trio shared notes ----------------
// In the Waterbirth cave all 3 kings spawn simultaneously. Standard solo
// strategy: stand under Rex with Protect from Melee, kill Rex with magic;
// then Prime with melee under Protect from Magic; finally Supreme with
// magic or ranged under Protect from Missiles. Each king's individual
// page covers its specific style requirements.

// ---------------- Dagannoth Prime (magic attacker) ----------------
const DAGANNOTH_PRIME: MechanicRequirement[] = [
  {
    id: "prime-pray-magic",
    label: "Pray Magic",
    description: "Prime attacks with magic — Protect from Magic negates his +30 hits.",
    remediation: "Keep Protect from Magic up until Prime is dead.",
  },
  {
    id: "prime-weak-to-melee-or-ranged",
    label: "Kill with ranged",
    description:
      "Prime tanks melee and magic (255 defence bonus to each) but has only 10 ranged defence — ranged shreds him.",
    remediation: "Twisted bow ideal; Bow of Faerdhinen or a crossbow (DHCB/ZCB) otherwise.",
  },
  {
    id: "dks-position",
    label: "Stack with Rex if killing all 3",
    description:
      "Standard solo route kills Rex first (stand under him praying Melee), then Prime, then Supreme. Stacking forces single-target attacks.",
    remediation: "Walk to the southwest corner of the room to bunch the kings.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Each king hits 30-40 unprayed. Bring full inventory for the trio.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots / Super restores.",
  },
];

// ---------------- Dagannoth Rex (melee attacker) ----------------
const DAGANNOTH_REX: MechanicRequirement[] = [
  {
    id: "rex-pray-melee",
    label: "Pray Melee",
    description: "Rex hits with melee (stab) — Protect from Melee tanks him for the whole fight.",
    remediation: "Keep Protect from Melee up. Don't be hit by Prime/Supreme while you're flicking only Melee.",
  },
  {
    id: "rex-weak-to-magic-and-crush",
    label: "Kill with magic",
    description:
      "Rex tanks melee and ranged (255 defence bonus to each) but has just 10 magic defence and a magic level of 0 — magic obliterates him.",
    remediation: "Trident of the swamp / Sanguinesti / Shadow. (He attacks with melee — pray Melee.)",
  },
  {
    id: "rex-stand-under",
    label: "Stand under Rex for safety",
    description:
      "Standing on Rex's square forces him to attack melee only. Combined with Protect from Melee = 0 damage from Rex.",
    remediation: "Move directly onto Rex's tile at the start.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Standard DK loadout — Prime/Supreme will chip you if you're not under Rex.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots / Super restores.",
  },
];

// ---------------- Dagannoth Supreme (ranged attacker) ----------------
const DAGANNOTH_SUPREME: MechanicRequirement[] = [
  {
    id: "supreme-pray-range",
    label: "Pray Range",
    description: "Supreme attacks with ranged — Protect from Missiles negates his hits.",
    remediation: "Keep Protect from Missiles up.",
  },
  {
    id: "supreme-weak-to-melee",
    label: "Kill with melee",
    description:
      "Supreme has just 10 defence to every melee style (stab/slash/crush) but huge magic (255) and ranged (550) defence — melee shreds him. Scythe, Fang, or whip all work.",
    remediation: "Scythe of Vitur > Fang > Whip.",
  },
  {
    id: "dks-position",
    label: "Stack with Rex if killing all 3",
    description: "See DK trio shared notes — solo route stacks kings for single-target focus.",
    remediation: "Standard order: Rex → Prime → Supreme.",
  },
  {
    id: "food",
    label: "Food + prayer pots",
    description: "Trip loadout for all 3 kings.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sharks + Prayer pots / Super restores.",
  },
];

// ---------------- Wilderness boss shared warning ----------------
const WILDY_PK_WARNING: MechanicRequirement = {
  id: "wildy-pk-warning",
  label: "Wilderness — risk PK loss",
  description:
    "Wilderness bosses are in PvP zones. Anything you don't ::protect (top 3 most valuable items) drops on death. Don't bring more than you're willing to lose.",
  remediation:
    "Use a 'no-risk' loadout with cheap gear, or accept the risk. Anti-PK setup: anti-fire shield + Bracelet of ethereum + Looting bag. Always have an escape teleport.",
};

// ---------------- Vet'ion ----------------
const VETION: MechanicRequirement[] = [
  WILDY_PK_WARNING,
  {
    id: "vetion-prayer-flick",
    label: "Pray Magic vs his magic spec",
    description:
      "Vet'ion's magic spec can hit 40+. Auto attacks are melee — most of the fight Protect from Magic OR Melee depending on which he's queuing.",
    remediation: "Watch the animation tell — Pray Magic for the cyan-coloured wave attack.",
  },
  {
    id: "vetion-skeletons",
    label: "Skeletons spawn at 75/50/25% HP",
    description:
      "Each phase transition Vet'ion summons 2 hellhound skeletons. They die in 1 hit but interrupt your flow.",
    remediation: "Use Crumble Undead via Rune Pouch to one-shot them.",
  },
  {
    id: "vetion-food",
    label: "Food + brews",
    description: "Long fight (~10 mins on entry gear). Bring sustain.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores + Karambwans for combo eats.",
  },
];

// ---------------- Venenatis ----------------
const VENENATIS: MechanicRequirement[] = [
  WILDY_PK_WARNING,
  {
    id: "venenatis-pray-magic",
    label: "Pray Magic",
    description:
      "Venenatis's primary attack is magic (web string animation) — hits ~24 unprayed. Protect from Magic tanks it.",
    remediation: "Keep Protect from Magic up.",
  },
  {
    id: "venenatis-prayer-drain",
    label: "Watch for prayer-drain spec",
    description:
      "Venenatis can drain ~10 prayer with her web spec. Stack prayer pots and don't let prayer hit 0.",
    remediation: "Bring extra Super restores.",
  },
  {
    id: "venenatis-melee-distance",
    label: "Crush melee is BIS",
    description:
      "Venenatis has only 10 crush def (vs 100 stab/slash, 150 ranged, 300 magic) — crush weapons shred her. Melee also avoids her magic-only retaliation pattern from range.",
    remediation: "Inquisitor's mace ideal; Zamorakian hasta (crush style) or Saradomin sword works.",
  },
  {
    id: "food",
    label: "Food + brews + prayer",
    description: "Long fight, hefty prayer drain.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores. ~2-3 trips per drop average.",
  },
];

// ---------------- Callisto ----------------
const CALLISTO: MechanicRequirement[] = [
  WILDY_PK_WARNING,
  {
    id: "callisto-pray-melee",
    label: "Pray Melee",
    description:
      "Callisto is a giant bear with melee attacks. Protect from Melee negates his +35 hits.",
    remediation: "Keep Protect from Melee up.",
  },
  {
    id: "callisto-knockback",
    label: "Knockback resets your spot",
    description:
      "Callisto's spec knocks you back several tiles, breaking auto-attack queue. Re-walk to him after each knockback.",
    remediation: "Stand directly under him to minimise knockback distance.",
  },
  {
    id: "callisto-magic-or-ranged",
    label: "Kill with magic or ranged",
    description:
      "Callisto tanks melee (125-150 defence to stab/slash/crush) but is weak to ranged (50) and especially magic (0 bonus). Ranged (Tbow/DHCB) is the popular pick; magic is also strong.",
    remediation: "Tbow > BoFA > DHCB for ranged setups. Magic setups work but slower.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "1000 HP boss. Bring full inventory.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores or sharks + prayer pots.",
  },
];

// ---------------- Abyssal Sire ----------------
const ABYSSAL_SIRE: MechanicRequirement[] = [
  {
    id: "sire-respiratory",
    label: "Phase 1: Pray Magic, kill respiratory systems",
    description:
      "Stage 1 is two 'tentacles' that breathe poison clouds. Pray Magic, hit them with Tbow / crush, watch your minimap for poison clouds (they move 1 tile per second).",
    remediation:
      "Mage-spot at corners. Crystal halberd or Scythe also useful for AoE on tentacles.",
  },
  {
    id: "sire-stun",
    label: "Phase 2: Stun him",
    description:
      "When Sire wakes, throw your stun item (a Bandos godsword spec / Dragon claw spec / DWH spec) to stun and double damage during phase. Without stun, phase 2 is much slower.",
    remediation: "Bring a spec weapon. BGS or DWH preferred; Dragon claws if you have them.",
  },
  {
    id: "sire-spawns",
    label: "Phase 3: Kill spawns or get stuck",
    description:
      "Sire spawns 'baby' Sires that aggro you. They die in 1-2 hits. If not killed they pile up and corner you.",
    remediation: "Use AoE weapon (Scythe / Crystal halberd) to clear spawns each phase.",
  },
  {
    id: "sire-poison-clouds",
    label: "Watch the poison cloud minimap",
    description:
      "Clouds spawn periodically through all 4 phases. They deal +24 per tick — fatal if you're standing in one without prayer.",
    remediation: "Always have an open tile to step to. The clouds move slowly; pre-plan a safe square.",
  },
  {
    id: "food",
    label: "Food + prayer pots + anti-poison",
    description:
      "Long fight, prayer drain, poison ticks. Anti-venom helpful.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)], [asItemId(12915)]] },
    remediation: "Sara brews + Super restores + Anti-venom+.",
  },
];

// ---------------- Phantom Muspah ----------------
const PHANTOM_MUSPAH: MechanicRequirement[] = [
  {
    id: "muspah-phase-rotation",
    label: "4-phase rotation: Ranged → Magic → Shielded → Melee",
    description:
      "Muspah cycles through styles. P1 ranged (pray Range), P2 magic (pray Magic), P3 he shields and you must DPS until he transitions, P4 melee (pray Melee).",
    remediation:
      "Memorise the rotation. P3 shielded phase is when you swap to your highest-DPS style ignoring his defences.",
  },
  {
    id: "muspah-prayer-bombs",
    label: "Dodge the prayer-drain bombs (P1 and P2)",
    description:
      "Muspah spawns a glowing tile that explodes after a few ticks for ~30 damage AND drains 100% prayer. Walk off it before it goes off.",
    remediation:
      "Always have at least 2 free tiles adjacent. Step diagonally when you see the warning.",
  },
  {
    id: "muspah-dual-style",
    label: "Bring 2 attack styles",
    description:
      "P3 shielded phase rewards magic OR ranged depending on shield colour. Solo BIS is Tbow + Sang/Shadow + Scythe for melee phase.",
    remediation:
      "Common loadout: Tbow + Scythe. Sang or Shadow optional for P3 magic.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "850 HP, long fight with knockback prayer-drain.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores.",
  },
];

// ---------------- The Hueycoatl ----------------
const HUEYCOATL: MechanicRequirement[] = [
  {
    id: "huey-multi-phase",
    label: "Multi-phase fight: tail → body → head",
    description:
      "Hueycoatl is a 4-segment dragon. You attack the tail first to disable specials, then body segments, then the head. Each segment moves around the arena.",
    remediation:
      "Standard route: ranged the tail/body segments, then melee the head when grounded.",
  },
  {
    id: "huey-antifire",
    label: "Dragonfire protection",
    description:
      "Hueycoatl is a dragon — its breath hits 40+ without antifire. Super antifire recommended.",
    satisfiedBy: {
      anyOf: [
        [asItemId(21978), asItemId(21981), asItemId(21984), asItemId(21987)], // Super antifire
        [asItemId(22209), asItemId(22212), asItemId(22215), asItemId(22218)], // Extended
      ],
    },
    remediation: "Bring Super antifire (4). Extended super antifire variant is even better.",
  },
  {
    id: "huey-pylons",
    label: "Pylons electrify the arena",
    description:
      "Hueycoatl charges pylons periodically; standing on an electrified tile deals heavy damage. Watch the floor for warning glow.",
    remediation:
      "Pre-move when you see the pylon charge animation. The safe tiles form a clear pattern.",
  },
  {
    id: "huey-style-flexibility",
    label: "Ranged + melee switch",
    description:
      "Tail/body phases favour ranged (distance from segments). Head phase rewards melee (Scythe excels on the 5x1 head).",
    remediation: "Tbow + Scythe is the standard duo.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "2500 HP boss — bring brews for a long fight.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(6685)], [asItemId(2434)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores. Extra food for solo.",
  },
];

// ---------------- DT2 quartet (Awakened forms not covered) ----------------
// Each of the 4 DT2 bosses drops a unique ingot used to craft the Virtus
// magic armour and quartet-bane weapons. All 4 require completing the
// Desert Treasure II questline to access.

const DUKE_SUCELLUS: MechanicRequirement[] = [
  {
    id: "duke-pray-magic",
    label: "Pray Magic + Bone weapon",
    description:
      "Duke uses a magic auto-attack. The fight is melee-range so Bone weapons (Frozen tear / Soulreaper axe / Scythe) work best. Pray Magic the whole fight.",
    remediation: "Keep Protect from Magic up. Soulreaper axe + Torva is the standard kit.",
  },
  {
    id: "duke-emerald-spheres",
    label: "Step off the green spheres",
    description:
      "Duke periodically drops emerald acid pools on your tile. Step one square away when they appear or take ~25 unprayed.",
    remediation: "Always have a safe square pre-planned. They linger for ~6 seconds.",
  },
  {
    id: "duke-shadow-spec",
    label: "Run the gauntlet during ice spec",
    description:
      "At ~50% HP Duke immobilises you in ice. Tank the next few hits — you can't move but Protect from Magic keeps you alive.",
    remediation: "Don't panic. Stay prayed up; he resumes normal pattern after.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "1697 HP boss + spec damage. Bring sustain.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(385)], [asItemId(3024)], [asItemId(2434)]] },
    remediation: "Sara brews + Super restores or Sharks + Prayer pots.",
  },
];

const LEVIATHAN: MechanicRequirement[] = [
  {
    id: "leviathan-style-rotation",
    label: "Pray rotating styles",
    description:
      "Leviathan cycles Magic → Ranged → Melee in patterns. Flick the matching protection prayer each tick. Mistakes cost ~30 unprayed.",
    remediation: "Watch the projectile colour: blue=magic, white=ranged, red=melee.",
  },
  {
    id: "leviathan-stones",
    label: "Skip across the lake stones",
    description:
      "During the underwater dive phase, navigate the stepping stones. Falling in deals heavy damage and resets you to the start.",
    remediation: "Walk one stone per tick. The path is fixed per fight; memorise it.",
  },
  {
    id: "leviathan-melee-range",
    label: "Ranged is BIS; melee from the east",
    description:
      "Leviathan's lowest defence by far is ranged (50 vs 190+ for every melee style), so Twisted bow / a strong crossbow lead. If you melee instead, Scythe is best in slash — stand on his east side to avoid the tail sweep.",
    remediation: "Twisted bow / DHCB for ranged; Scythe > Fang in melee range.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "900 HP + heavy unprayed hits.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3024)], [asItemId(385)]] },
    remediation: "Sara brews + Super restores.",
  },
];

const WHISPERER: MechanicRequirement[] = [
  {
    id: "whisperer-sirenic-scale",
    label: "Sirenic scales required to fight (item pickup)",
    description:
      "Once per fight Whisperer goes invisible. Pick up a Sirenic Scale from the floor (auto-drops) and use it on her to re-engage. Otherwise you can't damage her.",
    remediation: "Always grab the scale when she vanishes — drag it onto her sprite.",
  },
  {
    id: "whisperer-clap-attack",
    label: "Skip the next protection prayer after her clap",
    description:
      "Whisperer's clap attack puts you to sleep for one tick — your next prayer flick will be off-tempo. Take a deliberate hit and recover.",
    remediation: "Tank one mage hit then resume the flick rotation.",
  },
  {
    id: "whisperer-echoes",
    label: "Echoes hit through prayer",
    description:
      "Two clones spawn periodically and attack you. They damage through prayer — kill them quickly with Scythe / Tbow.",
    remediation: "AoE with Scythe is fastest. Otherwise burn Tbow on each in turn.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "Long fight with chip damage from echoes.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3024)]] },
    remediation: "Sara brews + Super restores.",
  },
];

const VARDORVIS: MechanicRequirement[] = [
  {
    id: "vardorvis-pray-melee",
    label: "Pray Melee",
    description:
      "Vardorvis auto-attacks with melee. Protect from Melee tanks his ~40 unprayed hits.",
    remediation: "Keep Protect from Melee up the whole fight.",
  },
  {
    id: "vardorvis-axes",
    label: "Dodge the spinning axes",
    description:
      "Red axes spawn from the edges and spin towards you. Each hits ~25 if you stand in the line. Anticipate the path and side-step.",
    remediation: "Watch the spawn animation 1 tick early. Always have a safe tile to step to.",
  },
  {
    id: "vardorvis-tiles",
    label: "Step out of the tile spikes",
    description:
      "Glowing tiles erupt for heavy damage. Move OFF the glowing tile within 2 ticks of the warning.",
    remediation: "Common pattern: tiles appear in a diagonal line; sidestep perpendicular.",
  },
  {
    id: "vardorvis-bleed",
    label: "Bleed stacks — kill before they overwhelm",
    description:
      "Vardorvis applies a bleed that ticks for increasing damage. The longer the fight, the harder eating gets. Maximise DPS.",
    remediation:
      "Scythe of Vitur + Torva for fastest kill. Bring Sara brews to outheal the bleed.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "700 HP but constant chip damage from axes + bleed.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3024)], [asItemId(385)]] },
    remediation: "Sara brews + Super restores; the bleed eats food fast.",
  },
];

// ---------------- Popular slayer / misc bosses ----------------
const KRAKEN: MechanicRequirement[] = [
  {
    id: "kraken-burst-tentacles",
    label: "Use a Burst / Barrage spell on the tentacles",
    description:
      "Kraken stays asleep until you wake all 4 enormous tentacles. The fastest way is a single Burst / Barrage AoE spell — wakes all 4 in one cast.",
    remediation:
      "Trident of seas works for individual whacks but Burst spell is the quickest start.",
  },
  {
    id: "kraken-pray-magic",
    label: "Pray Magic",
    description:
      "Once awake, Kraken attacks with magic. Protect from Magic tanks the +25 hits.",
    remediation: "Magic protection only — no melee phase.",
  },
  {
    id: "kraken-magic-only",
    label: "Use magic (Trident) — the AFK standard",
    description:
      "You fight Kraken from a fixed tile out of melee range, so magic (or ranged) is the practical choice — and its defence level is only 1, so anything hits. A powered staff is the go-to: Trident of the swamp / Sang / Harmonised Surge.",
    remediation: "Trident of swamp + Occult + Tormented bracelet is the AFK setup.",
  },
  {
    id: "kraken-afk-tip",
    label: "AFK-friendly",
    description:
      "Trident has long enough charge per dose to AFK; just bring food in case prayer drops. Kraken is one of the most chill PvM bosses.",
    remediation: "Bring a few Sharks; you'll rarely need them.",
  },
];

const DEMONIC_GORILLA: MechanicRequirement[] = [
  {
    id: "gorilla-three-style",
    label: "Triple-style flick (Magic / Ranged / Melee)",
    description:
      "Demonic gorillas rotate all three combat styles. Match Protect from Magic / Missiles / Melee based on the tell:\n  • Hands on chest = melee\n  • Holds a rock = ranged\n  • Glowing eyes = magic",
    remediation: "Practice the flicks. Mis-flicks are the #1 cause of failed trips.",
  },
  {
    id: "gorilla-boulder",
    label: "Run when they slam (boulder attack)",
    description:
      "Every 5 attacks they slam the ground, dropping a 5x5 rock area for 35+ damage. Run 5 tiles away when you see the slam animation.",
    remediation: "Listen for the audio cue. Position-aware: don't get trapped in a corner.",
  },
  {
    id: "gorilla-switch-gear",
    label: "Bring switch gear (3 styles)",
    description:
      "Each style change ideally swaps weapon + protection prayer. Min setup: 1 ranged weapon, 1 mage weapon, 1 melee weapon, plus the matching helmets if you want max DPS.",
    remediation: "Minimum: Toxic blowpipe (ranged), Sang staff (magic), Whip (melee).",
  },
  {
    id: "gorilla-prayer-restore",
    label: "Prayer restore",
    description:
      "Constant flicking + protection drains prayer fast. Bring Super restores.",
    satisfiedBy: { anyOf: [[asItemId(3024)], [asItemId(2434)]] },
    remediation: "Super restores; ~8 per trip if your flicks are clean.",
  },
];

const ARAXXOR: MechanicRequirement[] = [
  {
    id: "araxxor-anti-venom",
    label: "Anti-venom required",
    description:
      "Araxxor inflicts venom. Without Anti-venom+ or Serpentine helm, you'll bleed out fast even with Protect from Missiles up.",
    satisfiedBy: { anyOf: [[asItemId(12915)], [asItemId(12931)]] },
    remediation: "Anti-venom+ (4) or Serpentine helm (charged).",
  },
  {
    id: "araxxor-mechanic-rotation",
    label: "Phase mechanics rotate (cleave / minions / web shoot)",
    description:
      "Araxxor cycles through three specials: cleave swipe (move out of the line), minion spawns (kill or tank), web shoot (run to the side).",
    remediation: "Watch the animations — each spec has a distinct windup.",
  },
  {
    id: "araxxor-pray-range",
    label: "Pray Range for autos",
    description:
      "Auto-attacks are ranged. Protect from Missiles tanks the ~35 unprayed hits.",
    remediation: "Keep Protect from Missiles up.",
  },
  {
    id: "araxxor-mage-defence",
    label: "Crush/slash melee is BIS",
    description:
      "Araxxor's lowest defence is crush (15), then slash (75) — melee shreds him, with magic his STRONGEST defence (237). Scythe / Fang in melee range lead; ranged is the backup.",
    remediation: "Scythe of Vitur or Fang in melee; crossbow/Tbow if you can't melee.",
  },
  {
    id: "food",
    label: "Food + brews",
    description: "1020 HP + venom chip + spec damage.",
    satisfiedBy: { anyOf: [[asItemId(6685)], [asItemId(3024)], [asItemId(391)]] },
    remediation: "Sara brews + Manta rays + Super restores.",
  },
];

const TORMENTED_DEMON: MechanicRequirement[] = [
  {
    id: "tormented-demon-demonbane",
    label: "Demonbane weapon massively boosts DPS",
    description:
      "Tormented demons are demon-class targets — Arclight or Emberlight (or Demonbane spells with Purging Staff) roughly double your DPS vs them.",
    satisfiedBy: { anyOf: [[asItemId(19675)], [asItemId(29589)]] },
    remediation: "Charge an Arclight or upgrade to Emberlight.",
  },
  {
    id: "tormented-demon-shield-rotation",
    label: "Pray opposite to its active shield",
    description:
      "The demon rotates a coloured shield (magic / ranged / melee) every few attacks. While a shield is up, only the OPPOSITE style damages it. Watch the shield colour and switch.",
    remediation:
      "Red shield = use ranged. Blue = use magic. Green = use melee. Flick protection prayer matching the shield style.",
  },
  {
    id: "tormented-demon-fireball",
    label: "Dodge the fireball spec",
    description:
      "Periodically the demon spits a fireball you must side-step. Hits ~40 if not dodged.",
    remediation: "Move 1 tile sideways when you see the windup.",
  },
  {
    id: "food",
    label: "Food",
    description: "600 HP + spec damage.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)]] },
    remediation: "Sharks/Manta + Prayer pots.",
  },
];

const SCURRIUS: MechanicRequirement[] = [
  {
    id: "scurrius-beginner-friendly",
    label: "F2P-friendly boss",
    description:
      "Scurrius works in F2P with iron / steel / mithril gear. Solo-friendly entry-level boss — drops the Scurrius's spine (whip-tier crush weapon usable in F2P).",
    remediation: "Fine to fight with whatever gear you have. No anti-poison/antifire needed.",
  },
  {
    id: "scurrius-pray-melee",
    label: "Pray Melee",
    description:
      "Scurrius's auto-attacks are melee. Protect from Melee tanks them.",
    remediation: "Keep Protect from Melee up.",
  },
  {
    id: "scurrius-rock-spec",
    label: "Move away from glowing tiles",
    description:
      "Scurrius drops rocks that fall on glowing tiles. Step off when they glow.",
    remediation: "Constant minor positioning — easy to learn.",
  },
  {
    id: "food",
    label: "Food",
    description: "1500 HP but easy to outlast.",
    satisfiedBy: { anyOf: [[asItemId(385)], [asItemId(391)], [asItemId(2434)]] },
    remediation: "Sharks + a Prayer pot. Trip lasts maybe 5 min.",
  },
];

// ---------------- Corporeal Beast ----------------
const CORPOREAL_BEAST: MechanicRequirement[] = [
  {
    id: "corp-stab-weapon",
    label: "Stab weapon required — all others deal half damage",
    description:
      "The Corporeal Beast halves all damage from non-spear, non-halberd weapons. Ranged and magic are equally penalised. The Zamorakian spear is the standard; Abyssal bludgeon is the budget alternative.",
    satisfiedBy: {
      anyOf: [
        [id(11824)], // Zamorakian spear
        [id(13263)], // Abyssal bludgeon
      ],
    },
    remediation:
      "Buy a Zamorakian spear before the trip — it deals full damage and is the most cost-efficient option.",
  },
  {
    id: "corp-no-specs",
    label: "Special attacks deal 0 damage",
    description:
      "All special attacks against the Corporeal Beast hit for exactly 0. Never use your spec bar here.",
    remediation: "Don't waste your spec bar — auto-attacks only.",
  },
  {
    id: "corp-dark-core",
    label: "Dark core spawns — stay still or it doubles hits",
    description:
      "Corp periodically spawns a Dark core that follows you. If it reaches you while you're moving it hits for massive damage. Staying in the same spot causes it to attack you for a small, tankable hit instead.",
    remediation: "Stop moving when you see the Dark core spawn — let it siphon you for ~1, not ~50.",
  },
  {
    id: "food",
    label: "Brews + super restores",
    description: "2,000 HP boss that hits 40+ with melee.",
    satisfiedBy: { anyOf: [[id(6685)], [id(3024)], [id(391)]] },
    remediation: "Sara brews + Super restores. Bring 10+ brews for a solo.",
  },
];

// ---------------- Skotizo ----------------
const SKOTIZO: MechanicRequirement[] = [
  {
    id: "skotizo-arclight",
    label: "Arclight / Emberlight required — ~4× DPS vs demons",
    description:
      "Skotizo is a demon. Arclight's Demonbane modifier deals ~4× damage. Without it the fight takes many minutes; with it it's under 30 seconds.",
    satisfiedBy: { anyOf: [[id(19675)], [id(29589)]] }, // Arclight, Emberlight
    remediation: "Charge an Arclight before entering — it's essentially the whole fight.",
  },
  {
    id: "skotizo-dark-totem",
    label: "Dark totem consumed on entry",
    description:
      "Each Skotizo kill requires one Dark totem assembled from three dark totem pieces (base, middle, top), which drop from Catacombs of Kourend monsters.",
    remediation: "Farm dark totem pieces inside the Catacombs between kills — they drop from many monsters.",
  },
  {
    id: "skotizo-altars",
    label: "Kill all 4 Altars — they heal and spawn dark ankou",
    description:
      "Four Altars around the room heal Skotizo for ~10 HP/tick and continuously spawn Dark ankou. Destroy all four Altars immediately on entry, then focus Skotizo.",
    remediation: "Run the perimeter and Arclight the Altars (1–2 hits each), then finish the boss.",
  },
  {
    id: "food",
    label: "Food",
    description: "Quick fight with Arclight but he hits 30+ through prayer.",
    satisfiedBy: { anyOf: [[id(385)], [id(391)], [id(2434)]] },
    remediation: "A dozen Sharks is plenty for a clean run.",
  },
];

// ---------------- TzTok-Jad ----------------
const TZTOK_JAD: MechanicRequirement[] = [
  {
    id: "jad-prayer-flick",
    label: "Pray-flick Magic ↔ Ranged on every attack",
    description:
      "Jad kills you in one hit if you pray wrong. He alternates: a slow stomp (orange ground glow) = Protect from Magic; a quick ranged spit = Protect from Missiles. Switch prayer to match EACH attack — not once at the start.",
    remediation:
      "Watch the animation closely. If you hesitate, eat fast and correct the prayer. Practice the flick before the 62-wave attempt.",
  },
  {
    id: "jad-healers",
    label: "Attack each Yt-HurKot healer once at 50% HP",
    description:
      "At 50% HP, four healers spawn and repair Jad back toward full. Click each healer once to draw aggro away from Jad, then return to Jad. Do NOT kill the healers — re-aggro is the goal.",
    remediation:
      "Run to each of the 4 healers and tag it, then re-focus Jad. Healers left alone will undo your entire damage phase.",
  },
  {
    id: "jad-supplies",
    label: "Prayer pots for 62 waves + food",
    description:
      "The Fight Cave has 62 waves with no banking. You need Prayer potions throughout.",
    satisfiedBy: { anyOf: [[id(2434)], [id(3024)]] }, // Prayer potion (4), Super restore (4)
    remediation:
      "Bring 20+ Prayer potions (or Super restores) and 10–15 Saradomin brews. No banking.",
  },
];

// ---------------- TzKal-Zuk (Inferno) ----------------
const TZKAL_ZUK: MechanicRequirement[] = [
  {
    id: "zuk-prayer-switch",
    label: "Constant prayer-switching across 69 waves",
    description:
      "The Inferno is 69 waves requiring constant switches between Protect from Magic and Protect from Missiles (and melee for certain spawns). Prayer flicking is near-mandatory — you will drain prayer if you hold a single prayer all fight.",
    remediation:
      "Learn the wave order from the wiki before entering. Twisted bow is BiS for most waves; Blood barrage AoEs groups.",
  },
  {
    id: "zuk-shield-phase",
    label: "Stand in Zuk's moving shield shadow — always",
    description:
      "During the Zuk encounter, a giant shield slides back and forth. You must stand in its shadow at all times — any tile outside takes 70+ damage per tick. JalMej-Rak healers emerge from pillars when the shield passes.",
    remediation:
      "Walk with the shield's edge. Kill healers only when the shield is between you and the pillar.",
  },
  {
    id: "zuk-nibblers",
    label: "Kill Nibblers — they destroy your pillars",
    description:
      "Nibbler spawns run toward and eat your three pillars. Once all pillars are destroyed you lose safe spots for future waves. Kill Nibblers immediately on spawn from behind a pillar.",
    remediation: "Ignore the pillar's wave mobs briefly to kill Nibblers — they path predictably to the nearest pillar.",
  },
  {
    id: "zuk-supplies",
    label: "Full inventory of brews + restores — no banking",
    description:
      "Even at high gear levels expect to brew heavily. 20 Saradomin brews + 8 Super restores is baseline; add Stamina potions for movement-heavy waves.",
    satisfiedBy: { anyOf: [[id(6685)], [id(3024)]] },
    remediation: "Refill every attempt. Supplies used in waves carry into the Zuk encounter.",
  },
];

// ---------------- Nex ----------------
const NEX: MechanicRequirement[] = [
  {
    id: "nex-entry",
    label: "Wear a Zarosian item to pass Blood Reavers",
    description:
      "Blood Reavers guard the entrance and will attack on sight unless you're wearing a Zarosian-aligned item (Torva, Pernix, Virtus, Ancient ceremonial, Zaryte crossbow, etc.).",
    satisfiedBy: {
      anyOf: [
        [id(26221)], // Ancient ceremonial top
        [id(26223)], // Ancient ceremonial legs
        [id(26225)], // Ancient ceremonial mask
        [id(26374)], // Zaryte crossbow
      ],
    },
    remediation:
      "Buy the full Ancient ceremonial set (cheap on GE) and wear it to enter — you can swap gear inside before the fight starts.",
  },
  {
    id: "nex-smoke",
    label: "Smoke phase: don't walk through smoke clouds",
    description:
      "Smoke phase fills the arena with drifting clouds. Walking through one inflicts 50+ poison ticks. Stay still and let them pass.",
    remediation: "Remain stationary and let smoke clouds pass around you. Keep Protect from Ranged up.",
  },
  {
    id: "nex-shadow",
    label: "Shadow phase: stand in lit areas only",
    description:
      "Dark shadows appear under your character. Standing in shadow drains 20% of your max HP per game tick. Hug the lit corridor walls.",
    remediation: "Move to a lit tile immediately when the shadow phase starts.",
  },
  {
    id: "nex-blood",
    label: "Blood phase: don't attack Nex — she heals from hits",
    description:
      "During Blood phase Nex heals from damage you deal to her. She spawns Blood Reavers — attack them instead until the phase ends.",
    remediation: "Stop attacking Nex as soon as she enters Blood phase; switch to the Blood Reavers.",
  },
  {
    id: "nex-ice",
    label: "Ice phase: pray Magic, move away from Ice Fiends",
    description:
      "Ice phase attacks are magic-based and can freeze you. Keep Protect from Magic up and ignore Ice Fiends where possible.",
    remediation: "Pray Magic and eat through Ice Fiend ticks.",
  },
  {
    id: "food",
    label: "Brews + super restores",
    description: "5,000 HP across phases. Very high damage output.",
    satisfiedBy: { anyOf: [[id(6685)], [id(3024)]] },
    remediation: "12–16 Saradomin brews + 6–8 Super restores. Scale up if your gear is weaker.",
  },
];

// ---------------- The Nightmare ----------------
const THE_NIGHTMARE: MechanicRequirement[] = [
  {
    id: "nightmare-husks",
    label: "Kill all 4 Husks immediately when they spawn",
    description:
      "The Nightmare charges 4 Husks (one per cardinal direction). If you don't kill them all before she reclaims them, she heals ~50 HP per Husk. They have low HP — kill them fast.",
    remediation: "Drop everything and kill all 4 Husks the moment they appear. Then return to the boss.",
  },
  {
    id: "nightmare-pray-switch",
    label: "Switch pray Magic ↔ Ranged on her attack animations",
    description:
      "The Nightmare alternates between magic and ranged attacks. A wrong prayer lets through 60+ damage per hit.",
    remediation:
      "Default Protect from Magic; switch to Protect from Missiles when you see her ranged animation windup.",
  },
  {
    id: "nightmare-flowers",
    label: "Spores: click the correct flower colour",
    description:
      "She periodically spawns glowing flowers (spores). Clicking the wrong colour damages you; the correct colour boosts you. Match the colour shown in the visual effect.",
    remediation: "Watch the screen indicator for which colour to click — misclicks hurt.",
  },
  {
    id: "food",
    label: "Brews + super restores",
    description: "3,400 HP with hits up to 65.",
    satisfiedBy: { anyOf: [[id(6685)], [id(3024)], [id(391)]] },
    remediation: "16–20 Saradomin brews + 6 Super restores for a typical kill.",
  },
];

// Phosani's Nightmare is the solo version — mechanically identical but harder stats (5,000 HP, higher max hit).
const PHOSANIS_NIGHTMARE: MechanicRequirement[] = THE_NIGHTMARE.map((m) => ({
  ...m,
  id: `phosani-${m.id}`,
  description: m.description.replace(
    "The Nightmare",
    "Phosani's Nightmare (solo — harder stats, 5,000 HP)",
  ),
}));

// ---------------- Giant Mole ----------------
const GIANT_MOLE: MechanicRequirement[] = [
  {
    id: "mole-tracking",
    label: "Falador shield 2+ to track tunnel location",
    description:
      "The Mole tunnels away after taking damage. Without the Falador shield (medium diary reward), you have to manually search the large tunnel network for her spawn point. With it her location shows on the minimap.",
    satisfiedBy: { anyOf: [[id(13118), id(13119), id(13120)]] }, // Falador shield 2/3/4
    remediation:
      "Complete the Falador medium diary to unlock the Falador shield 2 — it halves the time spent hunting tunnels.",
  },
  {
    id: "mole-spade",
    label: "Bring a spade to enter the lair",
    description: "The Mole's lair entrance requires digging with a spade in Falador Park.",
    satisfiedBy: { anyOf: [[id(952)]] }, // Spade
    remediation: "Grab a spade from the GE (< 100 gp) or from Farmer Fred's shed.",
  },
  {
    id: "food",
    label: "Food",
    description: "Easy low-level boss. A handful of sharks finishes any trip comfortably.",
    satisfiedBy: { anyOf: [[id(385)], [id(391)], [id(2434)]] },
    remediation: "A dozen sharks.",
  },
];

// ---------------- Moon bosses (Varlamore) ----------------
// Each Moon has a set of armour pieces that dramatically reduce her
// corresponding special attack damage. All three share the same fight
// structure — just with melee / magic / ranged combat styles respectively.

const BLOOD_MOON: MechanicRequirement[] = [
  {
    id: "blood-moon-armour",
    label: "Blood Moon armour reduces her special attack damage",
    description:
      "Equipping Blood Moon helm, chestplate, or tassets reduces the damage dealt by Blood Moon's special attacks by ~75% per piece. Without any Blood Moon gear those specials can one-shot you.",
    satisfiedBy: {
      anyOf: [
        [id(29028), id(29047), id(29073)], // Blood moon helm (all variants)
        [id(29022), id(29043), id(29067)], // Blood moon chestplate (all variants)
        [id(29025), id(29045), id(29070)], // Blood moon tassets (all variants)
      ],
    },
    remediation:
      "Farm Blood Moon set pieces from the boss itself — the helm is the biggest upgrade per kill.",
  },
  {
    id: "blood-moon-pray",
    label: "Pray Melee — primary auto-attack is melee",
    description: "Blood Moon's auto-attacks are melee. Protect from Melee tanks the bulk of incoming damage.",
    remediation: "Keep Protect from Melee up throughout.",
  },
];

const BLUE_MOON: MechanicRequirement[] = [
  {
    id: "blue-moon-armour",
    label: "Blue Moon armour reduces her special attack damage",
    description:
      "Equipping Blue Moon set pieces reduces Blue Moon's special attack damage by ~75% per piece worn.",
    satisfiedBy: {
      anyOf: [
        [id(29019), id(29041), id(29064)], // Blue moon helm (all variants)
        [id(29013), id(29037), id(29058)], // Blue moon chestplate (all variants)
        [id(29016), id(29039), id(29061)], // Blue moon tassets (all variants)
      ],
    },
    remediation: "Farm Blue Moon set pieces from the boss — any piece worn reduces special damage.",
  },
  {
    id: "blue-moon-pray",
    label: "Pray Magic — primary auto-attack is magic",
    description: "Blue Moon's auto-attacks are magic. Protect from Magic tanks the bulk of incoming damage.",
    remediation: "Keep Protect from Magic up throughout.",
  },
];

const ECLIPSE_MOON: MechanicRequirement[] = [
  {
    id: "eclipse-moon-armour",
    label: "Eclipse Moon armour reduces her special attack damage",
    description:
      "Equipping Eclipse Moon set pieces reduces Eclipse Moon's special attack damage by ~75% per piece worn.",
    satisfiedBy: {
      anyOf: [
        [id(29010), id(29035), id(29055)], // Eclipse moon helm (all variants)
        [id(29004), id(29031), id(29049)], // Eclipse moon chestplate (all variants)
        [id(29007), id(29033), id(29052)], // Eclipse moon tassets (all variants)
      ],
    },
    remediation: "Farm Eclipse Moon set pieces from the boss — any piece worn reduces special damage.",
  },
  {
    id: "eclipse-moon-pray",
    label: "Pray Ranged — primary auto-attack is ranged",
    description: "Eclipse Moon's auto-attacks are ranged. Protect from Missiles tanks the bulk of incoming damage.",
    remediation: "Keep Protect from Missiles up throughout.",
  },
];

// ---------------- Sol Heredit (Fortis Colosseum) ----------------
const SOL_HEREDIT: MechanicRequirement[] = [
  {
    id: "sol-heredit-waves",
    label: "Complete all 11 Colosseum waves first — no banking",
    description:
      "Sol Heredit is the Fortis Colosseum's final boss, reached only after completing waves 1–11 with no banking. Whatever supplies you have left going in is all you get.",
    remediation:
      "Practice the 11 waves with 0–2 Invocations before adding difficulty. Learn which waves drain the most supplies.",
  },
  {
    id: "sol-heredit-mechanics",
    label: "Dodge telegraphed spear throws and ground slams",
    description:
      "Sol Heredit has multiple telegraphed mechanics: a spear throw (step sideways off the target tile), a ground slam (run off his target tile), and prayer-switching phases. He also spawns a clone that mimics his attacks.",
    remediation:
      "Watch for ground-glow indicators — they telegraph where to NOT stand. Spear throw requires a 1-tile sidestep.",
  },
  {
    id: "sol-heredit-invocations",
    label: "Invocations increase difficulty for higher rewards",
    description:
      "The Colosseum has Invocations (modifiers) that boost monster stats for better loot. Start with 0 Invocations to learn the mechanics, then add them once you can clear consistently.",
    remediation: "Don't attempt high Invocations until you can consistently reach Sol with full supplies.",
  },
  {
    id: "food",
    label: "Full supplies going in — no banking",
    description: "Enter Sol with whatever survived the 11 waves. Brew heavily for both waves and the boss.",
    satisfiedBy: { anyOf: [[id(6685)], [id(3024)]] },
    remediation: "Start a Colosseum run with 20 Sara brews + 8 Super restores + Stamina potions.",
  },
];

export const MECHANICS_BY_SLUG: Record<string, MechanicRequirement[]> = {
  vorkath: VORKATH,
  "king-black-dragon": KBD,
  cerberus: CERBERUS,
  zulrah: ZULRAH,
  "alchemical-hydra": ALCHEMICAL_HYDRA,
  "general-graardor": GRAARDOR,
  kreearra: KREEARRA,
  "kril-tsutsaroth": KRIL,
  "commander-zilyana": ZILYANA,
  "great-olm": GREAT_OLM,
  "dagannoth-prime": DAGANNOTH_PRIME,
  "dagannoth-rex": DAGANNOTH_REX,
  "dagannoth-supreme": DAGANNOTH_SUPREME,
  vetion: VETION,
  venenatis: VENENATIS,
  callisto: CALLISTO,
  "abyssal-sire": ABYSSAL_SIRE,
  "phantom-muspah": PHANTOM_MUSPAH,
  "the-hueycoatl": HUEYCOATL,
  // DT2 quartet
  "duke-sucellus": DUKE_SUCELLUS,
  "the-leviathan": LEVIATHAN,
  "the-whisperer": WHISPERER,
  vardorvis: VARDORVIS,
  // Slayer / misc favourites
  kraken: KRAKEN,
  "demonic-gorilla": DEMONIC_GORILLA,
  araxxor: ARAXXOR,
  "tormented-demon": TORMENTED_DEMON,
  scurrius: SCURRIUS,
  // Standalone endgame bosses
  "corporeal-beast": CORPOREAL_BEAST,
  skotizo: SKOTIZO,
  "giant-mole": GIANT_MOLE,
  nex: NEX,
  "the-nightmare": THE_NIGHTMARE,
  "phosanis-nightmare": PHOSANIS_NIGHTMARE,
  // TzHaar instances
  "tztok-jad": TZTOK_JAD,
  "tzkal-zuk": TZKAL_ZUK,
  // Varlamore moon bosses
  "blood-moon": BLOOD_MOON,
  "blue-moon": BLUE_MOON,
  "eclipse-moon": ECLIPSE_MOON,
  // Fortis Colosseum
  "sol-heredit": SOL_HEREDIT,
};

/**
 * Resolve the full mechanic list for a boss: hand-curated entries
 * (MECHANICS_BY_SLUG) merged with universal worn-slot mechanics implied by the
 * monster's attributes (e.g. dragonfire for `dragon` + `fiery` monsters).
 *
 * Curated entries win: if a boss already curates a mechanic with the same id
 * (e.g. Vorkath's boss-specific dragonfire note), the universal one is dropped.
 * This is what the boss page should call instead of indexing MECHANICS_BY_SLUG
 * directly, so every fire-breathing dragon gets setup-aware dragonfire checks.
 */
export function mechanicsForBoss(monster: MonsterCatalogEntry): MechanicRequirement[] {
  const curated = MECHANICS_BY_SLUG[monster.slug] ?? [];
  const curatedIds = new Set(curated.map((m) => m.id));
  const universal = universalMechanicsFor(monster).filter((m) => !curatedIds.has(m.id));
  return [...curated, ...universal];
}
