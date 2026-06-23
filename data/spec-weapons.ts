// Catalog of combat-relevant special-attack weapons.
//
// Source: hand-curated from https://oldschool.runescape.wiki/w/Special_attack
// (last refreshed via WebFetch on 2026-06-02). Skipped: skilling-only specs
// (Lumber Up axes, Fishstabber harpoons, Rock Knocker pickaxes), purely-PvP
// items not in the wgloop catalog (Statius's warhammer, Vesta's variants,
// Morrigan's items), and quest-locked items not yet in catalog (Enhanced
// Excalibur).
//
// Item IDs use the most common in-game variant: poisoned daggers use (p++);
// charged variants of charge-required weapons (Arclight, Toxic blowpipe,
// Webweaver bow, Crystal halberd, etc.); standard Granite maul (no ornate
// handle). The catalog is keyed by item ID, but lookups in code go through
// the helper functions below.
//
// To refresh: re-run WebFetch on /w/Special_attack and reconcile against
// `data/items/catalog.ts`. If a weapon is missing an item ID, it's either
// quest-locked, PvP-only, or untradeable.

import { asItemId } from "@/types/osrs";
import type { SpecMaxHit, SpecWeapon } from "@/types/spec-weapons";

const id = (n: number) => asItemId(n);

export const SPEC_WEAPONS: SpecWeapon[] = [
  // ============ Defence reduction ============
  {
    itemId: id(11804),
    name: "Bandos godsword",
    specName: "Warstrike",
    energyCost: 50,
    effect: "Drains one of the target's combat stats by the amount of damage dealt.",
    role: "defence-reduction",
  },
  {
    itemId: id(13576),
    name: "Dragon warhammer",
    specName: "Smash",
    energyCost: 50,
    effect: "Reduces target's Defence by 30% on a successful hit.",
    role: "defence-reduction",
  },
  {
    itemId: id(21003),
    name: "Elder maul",
    specName: "Pulverize",
    energyCost: 50,
    effect: "Reduces target's Defence by 35% on a successful hit.",
    role: "defence-reduction",
  },
  {
    itemId: id(8878),
    name: "Bone dagger",
    specName: "Backstab",
    energyCost: 75,
    effect: "Reduces target's Defence equal to damage dealt; guaranteed hit on unaware targets.",
    role: "defence-reduction",
  },
  {
    itemId: id(8880),
    name: "Dorgeshuun crossbow",
    specName: "Snipe",
    energyCost: 75,
    effect: "Reduces target's Defence equal to damage dealt.",
    role: "defence-reduction",
  },
  {
    itemId: id(27665),
    name: "Accursed sceptre",
    specName: "Condemn",
    energyCost: 50,
    effect: "Reduces target's Defence and Magic levels by up to 15%.",
    role: "defence-reduction",
  },
  {
    itemId: id(19675),
    name: "Arclight",
    specName: "Weaken",
    energyCost: 50,
    effect: "Drains target's Attack, Strength, and Defence by 5% per cast (double effect on demons).",
    role: "defence-reduction",
  },
  {
    itemId: id(29589),
    name: "Emberlight",
    specName: "Weaken",
    energyCost: 50,
    effect: "Drains target's combat stats; triple effect on demons.",
    role: "defence-reduction",
  },
  {
    itemId: id(6746),
    name: "Darklight",
    specName: "Weaken",
    energyCost: 50,
    effect: "Drains target's Attack, Strength, and Defence by 5% per cast.",
    role: "defence-reduction",
  },
  {
    itemId: id(28922),
    name: "Tonalztics of ralos",
    specName: "Division",
    energyCost: 50,
    effect: "Reduces target's Defence by a percentage of their Magic level.",
    role: "defence-reduction",
  },
  {
    itemId: id(31113),
    name: "Eye of ayak",
    specName: "Soul Rend",
    energyCost: 50,
    effect: "Drains target's Magic defence equal to damage dealt.",
    role: "defence-reduction",
  },

  // ============ DPS spike ============
  {
    itemId: id(13652),
    name: "Dragon claws",
    specName: "Slice and Dice",
    energyCost: 50,
    effect: "Hits 4 times in rapid succession; second hit is 50% of first, third 25%, fourth 12.5%.",
    role: "dps-spike",
  },
  {
    itemId: id(29577),
    name: "Burning claws",
    specName: "Burning Barrage",
    // Summer Sweep-Up 2026 nerf: 30% → 35% spec cost. Two specs per bar
    // now instead of three.
    energyCost: 35,
    effect: "Attacks 3 times in quick succession with chance to inflict burn damage.",
    role: "dps-spike",
  },
  {
    itemId: id(27690),
    name: "Voidwaker",
    specName: "Disrupt",
    energyCost: 50,
    effect: "Guaranteed magic-damage hit that always rolls between 50% and 150% of max melee hit; bypasses prayer.",
    role: "dps-spike",
  },
  {
    itemId: id(5698),
    name: "Dragon dagger",
    specName: "Puncture",
    energyCost: 25,
    effect: "Performs two quick slashes with +15% accuracy and +15% damage each.",
    role: "dps-spike",
  },
  {
    itemId: id(13271),
    name: "Abyssal dagger",
    specName: "Abyssal Puncture",
    energyCost: 25,
    effect: "Hits twice with +25% accuracy and reduced damage per hit.",
    role: "dps-spike",
  },
  {
    itemId: id(4153),
    name: "Granite maul",
    specName: "Quick Smash",
    energyCost: 60,
    effect: "Instantly performs a second attack on the same tick.",
    role: "dps-spike",
  },
  {
    itemId: id(11235),
    name: "Dark bow",
    specName: "Descent of Darkness",
    energyCost: 55,
    effect: "Launches a double attack; with dragon arrows, minimum 8 damage per hit.",
    role: "dps-spike",
  },
  {
    itemId: id(27655),
    name: "Webweaver bow",
    specName: "Swarm",
    energyCost: 50,
    effect: "Hits four times in rapid succession at reduced damage per hit.",
    role: "dps-spike",
  },
  {
    itemId: id(861),
    name: "Magic shortbow",
    specName: "Snapshot",
    energyCost: 55,
    effect: "Fires two arrows in quick succession with reduced accuracy.",
    role: "dps-spike",
  },
  {
    itemId: id(12788),
    name: "Magic shortbow (i)",
    specName: "Snapshot",
    energyCost: 50,
    effect: "Imbued variant — two arrows at reduced energy cost.",
    role: "dps-spike",
  },
  {
    itemId: id(19478),
    name: "Light ballista",
    specName: "Concentrated Shot",
    energyCost: 65,
    effect: "Increases accuracy and damage by 25% each.",
    role: "dps-spike",
  },
  {
    itemId: id(19481),
    name: "Heavy ballista",
    specName: "Concentrated Shot",
    energyCost: 65,
    effect: "Increases accuracy and damage by 25% each.",
    role: "dps-spike",
  },
  {
    itemId: id(26374),
    name: "Zaryte crossbow",
    specName: "Evoke",
    energyCost: 75,
    effect: "Guarantees the enchanted bolt effect on a successful hit.",
    role: "dps-spike",
  },
  {
    itemId: id(11785),
    name: "Armadyl crossbow",
    specName: "Armadyl Eye",
    energyCost: 50,
    effect: "Doubles the activation chance of enchanted bolts for the next attack.",
    role: "dps-spike",
  },
  {
    itemId: id(11802),
    name: "Armadyl godsword",
    specName: "The Judgement",
    energyCost: 50,
    effect: "Deals an attack with +37.5% damage and double accuracy.",
    role: "dps-spike",
  },
  {
    itemId: id(26233),
    name: "Ancient godsword",
    specName: "Blood Sacrifice",
    energyCost: 50,
    effect: "Marks target — deals delayed damage and heals the attacker on the mark's trigger.",
    role: "dps-spike",
  },
  {
    itemId: id(24424),
    name: "Volatile nightmare staff",
    specName: "Immolate",
    energyCost: 55,
    effect: "Fires a powerful spell with +50% accuracy.",
    role: "dps-spike",
  },
  {
    itemId: id(11838),
    name: "Saradomin sword",
    specName: "Saradomin's Lightning",
    energyCost: 100,
    effect: "Deals melee damage plus a 1–16 magic damage hit.",
    role: "dps-spike",
  },
  {
    itemId: id(12808),
    name: "Saradomin's blessed sword",
    specName: "Saradomin's Blessed Lightning",
    energyCost: 65,
    effect: "Magic-based attack with +25% damage.",
    role: "dps-spike",
  },
  {
    itemId: id(13263),
    name: "Abyssal bludgeon",
    specName: "Penance",
    energyCost: 50,
    effect: "Deals +0.5% damage per missing prayer point.",
    role: "dps-spike",
  },
  {
    itemId: id(1305),
    name: "Dragon longsword",
    specName: "Cleave",
    energyCost: 25,
    effect: "Deals +25% damage on the next hit.",
    role: "dps-spike",
  },
  {
    itemId: id(1434),
    name: "Dragon mace",
    specName: "Shatter",
    energyCost: 25,
    effect: "Increases damage by 50% and accuracy by 25%.",
    role: "dps-spike",
  },
  {
    itemId: id(21742),
    name: "Granite hammer",
    specName: "Hammer Blow",
    energyCost: 60,
    effect: "Guarantees +5 damage on the next hit even if it would otherwise miss.",
    role: "dps-spike",
  },
  {
    itemId: id(28997),
    name: "Dual macuahuitl",
    specName: "Blood Infusion",
    energyCost: 25,
    effect: "Sacrifices 25% of current HP for an accuracy and damage boost.",
    role: "dps-spike",
  },
  {
    itemId: id(28988),
    name: "Blue moon spear",
    specName: "Break Shackles",
    energyCost: 50,
    effect: "Deals extra damage based on how long target has been bound.",
    role: "dps-spike",
  },

  // ============ Healing ============
  {
    itemId: id(11806),
    name: "Saradomin godsword",
    specName: "Healing Blade",
    energyCost: 50,
    effect: "Restores hitpoints (50% of damage) and prayer (25% of damage).",
    role: "healing",
  },
  {
    itemId: id(12926),
    name: "Toxic blowpipe",
    specName: "Toxic Siphon",
    energyCost: 50,
    effect: "Heals the user for half of the damage dealt.",
    role: "healing",
  },
  {
    itemId: id(27291),
    name: "Keris partisan of the sun",
    specName: "Tumeken's Light",
    energyCost: 75,
    effect: "Overheals hitpoints and restores all stats except prayer.",
    role: "healing",
  },

  // ============ Freeze / Stun / Bind ============
  {
    itemId: id(11808),
    name: "Zamorak godsword",
    specName: "Ice Cleave",
    energyCost: 50,
    effect: "Freezes the target for 20 seconds on a successful hit.",
    role: "freeze-stun",
  },
  {
    itemId: id(1249),
    name: "Dragon spear",
    specName: "Shove",
    energyCost: 25,
    effect: "Pushes the target back and stuns them for 3 seconds.",
    role: "freeze-stun",
  },
  {
    itemId: id(11824),
    name: "Zamorakian spear",
    specName: "Shove",
    energyCost: 25,
    effect: "Stun and pushback attack.",
    role: "freeze-stun",
  },
  {
    itemId: id(11889),
    name: "Zamorakian hasta",
    specName: "Shove",
    energyCost: 25,
    effect: "Stun and pushback attack.",
    role: "freeze-stun",
  },
  {
    itemId: id(12006),
    name: "Abyssal tentacle",
    specName: "Binding Tentacle",
    energyCost: 50,
    effect: "Binds the target for 5 seconds.",
    role: "freeze-stun",
  },

  // ============ Prayer management ============
  {
    itemId: id(11061),
    name: "Ancient mace",
    specName: "Favour of the War God",
    energyCost: 100,
    effect: "Drains target's prayer equal to damage dealt and restores the same amount to the user.",
    role: "prayer-management",
  },
  {
    itemId: id(24425),
    name: "Eldritch nightmare staff",
    specName: "Invocate",
    energyCost: 55,
    effect: "Restores prayer points equal to half the damage dealt.",
    role: "prayer-management",
  },

  // ============ Anti-prayer ============
  {
    itemId: id(4587),
    name: "Dragon scimitar",
    specName: "Sever",
    energyCost: 55,
    effect: "Disables the target's protection prayers for 5 seconds.",
    role: "anti-prayer",
  },

  // ============ Self-buff ============
  {
    itemId: id(35),
    name: "Excalibur",
    specName: "Sanctuary",
    energyCost: 100,
    effect: "Increases the user's Defence by 8 levels temporarily.",
    role: "self-buff",
  },
  {
    itemId: id(1377),
    name: "Dragon battleaxe",
    specName: "Rampage",
    energyCost: 100,
    effect: "Drains several combat stats but significantly boosts Strength.",
    role: "self-buff",
  },
  {
    itemId: id(11037),
    name: "Brine sabre",
    specName: "Liquify",
    energyCost: 75,
    effect: "Boosts Strength, Attack, and Defence by 25% of damage dealt.",
    role: "self-buff",
  },

  // ============ AoE ============
  {
    itemId: id(21015),
    name: "Dinh's bulwark",
    specName: "Shield Bash",
    energyCost: 50,
    effect: "Attacks all targets in an 11x11 area around the user.",
    role: "aoe",
  },
  {
    itemId: id(23987),
    name: "Crystal halberd",
    specName: "Sweep",
    energyCost: 30,
    effect: "Hits up to 10 NPCs in front of the user at once.",
    role: "aoe",
  },
  {
    itemId: id(3204),
    name: "Dragon halberd",
    specName: "Sweep",
    energyCost: 30,
    effect: "Hits up to 10 NPCs in front of the user at once.",
    role: "aoe",
  },
  {
    itemId: id(7158),
    name: "Dragon 2h sword",
    specName: "Powerstab",
    energyCost: 60,
    effect: "Hits up to 14 enemies within one square of the user.",
    role: "aoe",
  },
  {
    itemId: id(21902),
    name: "Dragon crossbow",
    specName: "Annihilate",
    energyCost: 60,
    effect: "Hits the primary target plus up to 9 adjacent enemies.",
    role: "aoe",
  },

  // ============ True max (damage-cap bypass) ============
  {
    itemId: id(26219),
    name: "Osmumten's fang",
    specName: "Eviscerate",
    energyCost: 25,
    effect: "Next attack rolls using true max hit without the standard damage cap.",
    role: "true-max",
  },
];

const BY_ID = new Map<number, SpecWeapon>(SPEC_WEAPONS.map((w) => [w.itemId, w]));

export function findSpecWeapon(itemId: number): SpecWeapon | undefined {
  return BY_ID.get(itemId);
}

/**
 * Special-attack max-hit modifiers, keyed by item ID. Only weapons whose spec
 * raises or lowers the max hit appear here — everything else (stat drains,
 * heals, freezes, accuracy-only specs like Magic shortbow) is omitted. Factors
 * are calibrated against weirdgloop's PlayerVsNPCCalc.ts spec block; see
 * `SpecMaxHit` for the conventions.
 *
 * Note: godswords stack a base ×11/10 (every godsword) with a per-weapon factor,
 * so the values below are the COMBINED multiplier (AGS = 11/10 × 5/4 = 11/8).
 */
export const SPEC_MAX_HIT: Record<number, SpecMaxHit> = {
  // ---- Godswords (combined multiplier) ----
  11802: { factor: [11, 8] }, //  Armadyl godsword — The Judgement (+37.5%)
  11804: { factor: [121, 100] }, // Bandos godsword — Warstrike (+21%)
  11806: { factor: [11, 10] }, // Saradomin godsword — Healing Blade (+10%)
  11808: { factor: [11, 10] }, // Zamorak godsword — Ice Cleave (+10%)
  26233: { factor: [11, 10] }, // Ancient godsword — Blood Sacrifice (+10%)

  // ---- Swords ----
  11838: { factor: [11, 10] }, // Saradomin sword — Saradomin's Lightning
  12808: { factor: [5, 4] }, //   Saradomin's blessed sword (+25%)
  1305: { factor: [5, 4] }, //    Dragon longsword — Cleave (+25%)

  // ---- Maces / hammers ----
  1434: { factor: [3, 2] }, //    Dragon mace — Shatter (+50%)
  13576: { factor: [3, 2] }, //   Dragon warhammer — Smash (also +50% dmg)

  // ---- Daggers (two hits) ----
  5698: { factor: [23, 20], hits: 2 }, //  Dragon dagger — Puncture (+15% ×2)
  13271: { factor: [17, 20], hits: 2 }, // Abyssal dagger — reduced dmg ×2 (−15%)

  // ---- Halberds ----
  3204: { factor: [11, 10] }, //  Dragon halberd — Sweep (+10%)
  23987: { factor: [11, 10] }, // Crystal halberd — Sweep (+10%)

  // ---- Voidwaker (guaranteed, rolls 50%–150% of max) ----
  27690: { factor: [3, 2], minFactor: [1, 2] },

  // ---- Dual macuahuitl (Blood moon set; rolls 25%–125%) ----
  28997: { factor: [5, 4], minFactor: [1, 4] },

  // ---- Ranged ----
  19478: { factor: [5, 4] }, //   Light ballista — Concentrated Shot (+25%)
  19481: { factor: [5, 4] }, //   Heavy ballista — Concentrated Shot (+25%)
  // Dark bow — Descent of Darkness: two arrows at +50% each, min 8 with dragon
  // arrows (the standard end-game case). Without dragon arrows it's +30%, min 5.
  11235: { factor: [15, 10], hits: 2, minHit: 8 },
  // Webweaver bow — Swarm: four hits at 40% of max each (−60%).
  27655: { factor: [2, 5], hits: 4 },

  // ---- Magic ----
  27665: { factor: [3, 2] }, //   Accursed sceptre — Condemn (+50%)
  31113: { factor: [13, 10] }, //  Eye of ayak — Soul Rend (+30%)
  24424: { varies: "scales with Magic level (max 58)" }, // Volatile nightmare staff

  // ---- True-max / variable ----
  26219: { uncapped: true }, //   Osmumten's fang — Eviscerate (rolls true max)
  13263: { varies: "scales with missing Prayer" }, // Abyssal bludgeon — Penance
};

export function specMaxHitMod(itemId: number): SpecMaxHit | undefined {
  return SPEC_MAX_HIT[itemId];
}

export function specWeaponsByRole(role: SpecWeapon["role"]): SpecWeapon[] {
  return SPEC_WEAPONS.filter((w) => w.role === role);
}
