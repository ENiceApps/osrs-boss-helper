// The Obligator (The Fractured Archive, 2026-10-20) — the crush megarare's
// two attack styles and its passive, as the loadout layer resolves them for
// the DPS engine (lib/recommend.ts → lib/dps/calculate.ts `damageRolls` /
// `sizeDamageFactor`).
//
// Rules, from the Rewards Poll Blog (the launch newspost only says "up to
// four times, depending on how weak your target is to Crush relative to other
// Melee styles"):
//   • THRUST (5 ticks): one accuracy roll, then the damage is rolled TWICE by
//     default, plus one more roll for each of the target's stab and slash
//     defence bonuses that is HIGHER than its crush bonus (strictly — the
//     blog's "every Melee defence that's higher than Crush"), so up to four
//     rolls; the best is kept. It also deals +20% damage vs 2x2 targets and
//     +40% vs 3x3 or bigger, and can hit several targets in a line (not
//     modelled; the talk page notes it is one hitsplat per target).
//   • SMASH (3 ticks): a plain single-target hit — no re-rolls, no size bonus
//     (the wiki ties both to the thrust style), no line.
//
// The optimizer tries BOTH styles and keeps the higher DPS (computeSetDps):
// under this model smash is a hair ahead vs 1x1 targets even at four rolls
// (best-of-4 ≈ 0.8·M per 5 ticks vs M/2 per 3 ticks), while thrust wins
// vs anything 2x2+ with three or more rolls and vs 3x3+ always. Unverified
// details, pending the wiki / weirdgloop (which had neither weapon as of
// 2026-09-02): whether the size bonus multiplies the max hit (modelled, like
// every other "% damage" bonus) or each rolled hit, and its place among the
// other damage multipliers (modelled right after the weapon target bonuses).
//
// Sources: https://oldschool.runescape.wiki/w/Obligator
//   https://oldschool.runescape.wiki/w/Update:The_Fractured_Archive_-_Rewards_Poll_Blog
//   https://oldschool.runescape.wiki/w/Update:The_Fractured_Archive_-_Out_Today

/** Charged 34715 / uncharged 34717 — the same passive either way. */
export const OBLIGATOR_IDS: ReadonlySet<number> = new Set([34715, 34717]);

/** Thrust: the catalog speed (re-rolls + size bonus). */
export const OBLIGATOR_THRUST_TICKS = 5;
/** Smash: the fast single-target style that gives the passive up. */
export const OBLIGATOR_SMASH_TICKS = 3;

export type ObligatorStyle = "thrust" | "smash";

export interface ObligatorThrust {
  /** Damage rolls per attack, best kept: 2, 3 or 4. */
  damageRolls: number;
  /** +20% (2x2) or +40% (3x3+) damage; undefined vs a 1x1 target. */
  sizeDamageFactor?: [number, number];
}

export function isObligator(weaponId: number | undefined): boolean {
  return weaponId !== undefined && OBLIGATOR_IDS.has(weaponId);
}

/**
 * Damage rolls on the thrust style: two, plus one for each of the target's
 * stab and slash defence bonuses that exceeds its crush bonus.
 */
export function obligatorDamageRolls(defence: { stab: number; slash: number; crush: number }): number {
  return 2 + (defence.stab > defence.crush ? 1 : 0) + (defence.slash > defence.crush ? 1 : 0);
}

/** The thrust style's size bonus: ×6/5 vs 2x2, ×7/5 vs 3x3 or bigger. */
export function obligatorSizeDamageFactor(targetSize: number | undefined): [number, number] | undefined {
  const size = targetSize ?? 1;
  if (size >= 3) return [7, 5];
  if (size === 2) return [6, 5];
  return undefined;
}

/**
 * The thrust style's passive vs a target, or undefined when the weapon isn't
 * the Obligator.
 */
export function obligatorThrust(
  weaponId: number | undefined,
  target: { size?: number; defenceBonuses: { stab: number; slash: number; crush: number } },
): ObligatorThrust | undefined {
  if (!isObligator(weaponId)) return undefined;
  const sizeDamageFactor = obligatorSizeDamageFactor(target.size);
  return {
    damageRolls: obligatorDamageRolls(target.defenceBonuses),
    ...(sizeDamageFactor ? { sizeDamageFactor } : {}),
  };
}
