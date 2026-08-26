// Enchanted-bolt proc modelling. Mirrors weirdgloop's osrs-dps-calc
// src/lib/dists/bolts.ts exactly (no special attacks, no Leagues effects):
//
//   proc chance = base × 1.1 with the Kandarin Hard diary (their default ON)
//   Zaryte crossbow strengthens effect VALUES (not the chance)
//   ruby/diamond procs bypass the accuracy roll entirely (fire on misses)
//   onyx/dragonstone procs only fire on accurate hits
//   opal/pearl add flat bonus damage on any attack
//
// The engine consumes a resolved BoltProcSpec and only needs (accuracy,
// maxHit) at the end of the pipeline — all target/level-dependent inputs are
// folded in here, where the loadout and monster are known.

import {
  BOLT_EFFECT_BY_ITEM_ID,
  INFINITE_HEALTH_MONSTER_SLUGS,
  ZARYTE_CROSSBOW_ID,
  type BoltEffect,
} from "@/data/items/bolt-procs";

export type BoltProcSpec =
  | {
      effect: "opal" | "pearl" | "dragonstone";
      kind: "flatBonus";
      chance: number;
      bonusDamage: number;
      /** Dragonstone only adds damage to accurate hits; opal/pearl roll on any attack. */
      accurateOnly: boolean;
    }
  | {
      effect: "diamond" | "onyx";
      kind: "scaledMax";
      chance: number;
      /** Proc hit rolls uniform 0..trunc(maxHit × percent / 100). */
      effectMaxPercent: number;
      /** Onyx procs only on accurate hits; diamond bypasses the accuracy roll. */
      accurateOnly: boolean;
    }
  | {
      effect: "ruby";
      kind: "replaceFixed";
      chance: number;
      /** Fixed proc damage: trunc(currentHp × 20|22 / 100), capped. */
      procDamage: number;
    };

export interface ResolveBoltProcInput {
  ammoItemId?: number;
  weaponItemId?: number;
  /** wgloop only procs bolts for category "Crossbow" — 2H crossbows excluded. */
  weaponCategory?: string;
  /** Boosted visible ranged level (drives opal/pearl/dragonstone bonus damage). */
  visibleRangedLevel: number;
  target: { hp: number; attributes: readonly string[]; slug?: string };
  /** Kandarin Hard diary ×1.1 proc chance. Defaults ON — the wiki calc's default. */
  kandarinDiary?: boolean;
  /**
   * User toggle: assume the ruby bolt special fires (default ON). OFF means
   * ruby bolts are valued on raw stats only — no proc spec is returned — so
   * the optimizer stops auto-picking them on proc expected value alone.
   */
  rubyProcEnabled?: boolean;
}

const BASE_CHANCE: Record<BoltEffect, number> = {
  opal: 0.05,
  pearl: 0.06,
  ruby: 0.06,
  diamond: 0.1,
  dragonstone: 0.06,
  onyx: 0.11,
};

/** Whether a bolt effect can fire against this target at all. */
export function boltEffectApplies(
  effect: BoltEffect,
  targetAttributes: readonly string[],
): boolean {
  if (effect === "dragonstone") {
    // Dragonfire — dragons and fiery monsters are immune.
    return !targetAttributes.includes("dragon") && !targetAttributes.includes("fiery");
  }
  if (effect === "onyx") {
    // Life leech — undead are immune.
    return !targetAttributes.includes("undead");
  }
  return true;
}

/**
 * Resolve the proc spec for a loadout's ammo against a target, or undefined
 * when nothing procs (no enchanted bolt, wrong weapon class, target immune).
 */
export function resolveBoltProc(input: ResolveBoltProcInput): BoltProcSpec | undefined {
  if (input.weaponCategory !== "Crossbow") return undefined;
  if (input.ammoItemId === undefined) return undefined;
  const effect = BOLT_EFFECT_BY_ITEM_ID.get(input.ammoItemId);
  if (!effect) return undefined;
  if (effect === "ruby" && input.rubyProcEnabled === false) return undefined;
  if (!boltEffectApplies(effect, input.target.attributes)) return undefined;

  const zcb = input.weaponItemId === ZARYTE_CROSSBOW_ID;
  const kandarin = input.kandarinDiary ?? true;
  const chance = BASE_CHANCE[effect] * (kandarin ? 1.1 : 1.0);
  const lvl = input.visibleRangedLevel;

  switch (effect) {
    case "opal":
      return {
        effect,
        kind: "flatBonus",
        chance,
        bonusDamage: Math.trunc(lvl / (zcb ? 9 : 10)),
        accurateOnly: false,
      };
    case "pearl": {
      const divisor = input.target.attributes.includes("fiery") ? 15 : 20;
      return {
        effect,
        kind: "flatBonus",
        chance,
        bonusDamage: Math.trunc(lvl / (zcb ? divisor - 2 : divisor)),
        accurateOnly: false,
      };
    }
    case "dragonstone":
      return {
        effect,
        kind: "flatBonus",
        chance,
        bonusDamage: Math.trunc((lvl * 2) / (zcb ? 9 : 10)),
        accurateOnly: true,
      };
    case "diamond":
      return { effect, kind: "scaledMax", chance, effectMaxPercent: zcb ? 126 : 115, accurateOnly: false };
    case "onyx":
      return { effect, kind: "scaledMax", chance, effectMaxPercent: zcb ? 132 : 120, accurateOnly: true };
    case "ruby": {
      const infinite = input.target.slug !== undefined
        && INFINITE_HEALTH_MONSTER_SLUGS.has(input.target.slug);
      const cap = infinite ? (zcb ? 66 : 60) : (zcb ? 110 : 100);
      const procDamage = Math.min(cap, Math.trunc((input.target.hp * (zcb ? 22 : 20)) / 100));
      return { effect, kind: "replaceFixed", chance, procDamage };
    }
  }
}

/**
 * Expected damage per attack with the proc folded in. Base expectation is
 * accuracy × maxHit/2 (uniform 0..maxHit on a successful roll) — identical to
 * dpsFromHitChance's numerator, so non-proc results stay byte-for-byte equal.
 */
export function expectedBoltDamagePerAttack(
  accuracy: number,
  maxHit: number,
  spec: BoltProcSpec,
): number {
  const base = accuracy * (maxHit / 2);
  switch (spec.kind) {
    case "flatBonus":
      // Bonus rides on top of the normal hit. Dragonstone's only fires on
      // accurate attacks; opal/pearl roll independently of accuracy.
      return base + (spec.accurateOnly ? accuracy : 1) * spec.chance * spec.bonusDamage;
    case "scaledMax": {
      const effectMax = Math.trunc((maxHit * spec.effectMaxPercent) / 100);
      const procAvg = effectMax / 2;
      if (spec.accurateOnly) {
        // Onyx: accuracy gates everything; the proc upgrades a hit's roll.
        return accuracy * (spec.chance * procAvg + (1 - spec.chance) * (maxHit / 2));
      }
      // Diamond: the proc replaces the whole attack (even a miss) with a
      // guaranteed defence-ignoring hit.
      return spec.chance * procAvg + (1 - spec.chance) * base;
    }
    case "replaceFixed":
      // Ruby: fixed damage, bypasses accuracy.
      return spec.chance * spec.procDamage + (1 - spec.chance) * base;
  }
}

/** Short human description for tooltips / results flags. */
export function describeBoltProc(spec: BoltProcSpec): string {
  const pct = `${(spec.chance * 100).toFixed(1)}%`;
  switch (spec.effect) {
    case "ruby":
      return `Ruby proc: ${pct} chance to deal ${spec.procDamage} (20% of current HP), ignores accuracy`;
    case "diamond":
      return `Diamond proc: ${pct} chance to ignore defence at +${spec.effectMaxPercent - 100}% max hit`;
    case "onyx":
      return `Onyx proc: ${pct} chance for +${spec.effectMaxPercent - 100}% max hit on a hit (and heals you)`;
    case "dragonstone":
      return `Dragonstone proc: ${pct} chance for +${spec.bonusDamage} dragonfire damage on a hit`;
    case "pearl":
      return `Pearl proc: ${pct} chance for +${spec.bonusDamage} bonus damage`;
    case "opal":
      return `Opal proc: ${pct} chance for +${spec.bonusDamage} bonus damage`;
  }
}
