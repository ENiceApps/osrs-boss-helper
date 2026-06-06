// Special-attack weapon types. Phase 4 of the optimizer build — display-only
// data layer; the DPS math doesn't consider spec attacks (per user priority Z).
// See OPTIMIZER_PLAN.md Phase 4.

import type { ItemId } from "@/types/osrs";

/**
 * Functional category of the special attack. One weapon = one role.
 * Roles are deliberately broad — fine-grained tagging like "armor-pierce"
 * vs "stat-drain" would overfit per-boss curation and add UI clutter.
 */
export type SpecRole =
  /** Reduces target's combat stats (BGS, DWH, Elder Maul, bone dagger, etc.) */
  | "defence-reduction"
  /** Single-target damage burst (Dragon claws, Voidwaker, DDS, AGS, ballistas, etc.) */
  | "dps-spike"
  /** Heals the user (SGS, Toxic blowpipe, Keris partisan of the sun) */
  | "healing"
  /** Crowd control: freeze, stun, bind (ZGS, Dragon spear, Abyssal tentacle) */
  | "freeze-stun"
  /** Restore your prayer or drain target's (Ancient mace, Eldritch nightmare staff) */
  | "prayer-management"
  /** Disable target's protection prayers (Dragon scimitar's Sever) */
  | "anti-prayer"
  /** Buff yourself (Excalibur, Dragon battleaxe, Brine sabre) */
  | "self-buff"
  /** Multi-target sweep (Dinh's bulwark, Crystal halberd, Dragon 2h sword) */
  | "aoe"
  /** Roll without damage cap (Osmumten's fang's Eviscerate) */
  | "true-max";

export interface SpecWeapon {
  itemId: ItemId;
  /** In-game item name as it appears in the catalog. */
  name: string;
  /** The special attack's name on the wiki ("Smash", "The Judgement", etc.). */
  specName: string;
  /** Special-attack energy cost as a percentage. Null when variable (e.g. dragon hasta, rune thrownaxe). */
  energyCost: number | null;
  /** One-sentence summary of the effect. Sourced from /w/Special_attack. */
  effect: string;
  role: SpecRole;
}

/** A spec weapon recommended for a specific boss, with a short justification note. */
export interface BossSpecRecommendation {
  /** Item ID of the recommended spec weapon — must match a SpecWeapon in the catalog. */
  specWeaponId: ItemId;
  /** Why this weapon is recommended for THIS boss specifically. */
  note: string;
}
