// The attack's hit distribution, step by step, in the order the game applies
// them (as the wiki DPS calculator's getAttackerDist + applyNpcTransforms
// does). calculate.ts hands over the finished accuracy and damage-roll bounds;
// this turns them into the expected damage per attack and the max hit.
//
// See lib/dps/hit-dist.ts for the representation.

import type { BoltProcSpec } from "./bolts";
import { hitsplatMaxima, isSplitProfile, type HitProfile } from "./multihit";
import {
  accurateMass,
  attackExpected,
  attackLargestDist,
  attackMax,
  cappedReroll,
  emptySplat,
  flatAdd,
  flatLimit,
  hitDist,
  linearMax,
  linearMin,
  linearSplat,
  mapAttack,
  mapSplat,
  mixSplats,
  multiplyHit,
  scaleProbability,
  singleSplat,
  splatAccurateMax,
  splatMax,
  type Attack,
  type Splat,
  type SplatTransform,
} from "./hit-dist";

/** One of the target's damage transforms, applied to every hitsplat in list order. */
export type NpcTransform =
  /** A hit over `limit` is rerolled over offset..offset+rollMax (Zulrah). */
  | { kind: "cappedReroll"; limit: number; rollMax: number; offset: number }
  /** min(d, i + offset), i uniform over 0..maximum (Fragment of Seren, Verzik P1, the Hueycoatl's tail). */
  | { kind: "linearMin"; maximum: number; offset?: number }
  /** trunc(d × n/den), with upstream's minimum rule (Kraken ÷7 min 1, Tekton ÷5 min 1, the TD shield). */
  | { kind: "multiply"; factor: readonly [number, number]; minimum?: number }
  /** min(d, maximum) (a silver weapon vs a tier-2 vampyre). */
  | { kind: "flatLimit"; maximum: number }
  /** max(0, d + addend); `accurateOnly` for flat armour / magic resistance. */
  | { kind: "flatAdd"; addend: number; accurateOnly: boolean }
  /** Every hitsplat of 0, misses included, becomes an accurate 1 (crush vs the Hueycoatl's tail). */
  | { kind: "zeroToOne" }
  /** Ocellus's explosions: trunc(2/speed × d) + (0 or 1), accurate hitsplats only. */
  | { kind: "explosion"; attackSpeed: number };

function transformOf(t: NpcTransform): { fn: SplatTransform; inaccurateToo: boolean } {
  switch (t.kind) {
    case "cappedReroll":
      return { fn: cappedReroll(t.limit, t.rollMax, t.offset), inaccurateToo: true };
    case "linearMin":
      return { fn: linearMin(t.maximum, t.offset ?? 0), inaccurateToo: true };
    case "multiply":
      return { fn: multiplyHit(t.factor[0], t.factor[1], t.minimum ?? 0), inaccurateToo: true };
    case "flatLimit":
      return { fn: flatLimit(t.maximum), inaccurateToo: true };
    case "flatAdd":
      return { fn: flatAdd(t.addend), inaccurateToo: !t.accurateOnly };
    case "zeroToOne":
      return { fn: (d, accurate, emit) => (d > 0 ? emit(1, d, accurate) : emit(1, 1, true)), inaccurateToo: true };
    case "explosion": {
      const factor = 2 / t.attackSpeed;
      return {
        fn: (d, _accurate, emit) => {
          const scaled = Math.trunc(factor * d);
          emit(0.5, Math.max(0, scaled), true);
          emit(0.5, Math.max(0, scaled + 1), true);
        },
        inaccurateToo: false,
      };
    }
  }
}

export interface DistInput {
  style: "melee" | "ranged" | "magic";
  /** Chance the first hitsplat lands. */
  accuracy: number;
  /** Chance a later hitsplat of a multi-hit weapon lands (differs only in the Maggot King's crush punish). */
  laterAccuracy: number;
  /** The damage roll's bounds (upstream getMinAndMax). */
  minHit: number;
  maxHit: number;

  /** Every attack kills outright: one guaranteed hitsplat of this much (Scurrius's giant rats). */
  oneHitDamage?: number;
  /** An accurate hit kills outright (demonbane vs the Respiratory system). */
  accurateKillDamage?: number;
  hitProfile?: HitProfile;
  /** Best of n damage rolls (the Obligator's thrust). */
  damageRolls?: number;
  /** Gadderhammer vs a shade: 95% ×5/4, 5% ×2. */
  gadderhammer?: boolean;
  /** Verac's set: 25% of attacks always land, rolling 1..max+1. */
  veracs?: boolean;
  /** Karil's set + Amulet of the damned: 25% of accurate hits add a hitsplat of half the damage. */
  karils?: boolean;
  /** An Araxyte that the weapon one-shots through its shell: a guaranteed max hit, nothing else applies. */
  guaranteedMaxEarly?: boolean;
  /** Keris vs a Kalphite: 1 hit in 51 deals triple. */
  kerisTriple?: boolean;
  /** A pickaxe vs a CoX Guardian. */
  guardianFactor?: readonly [number, number];
  /** Sanguinesti staff: 1 accurate hit in 5 deals 8 more. */
  sanguinesti?: boolean;
  /** Mark of Darkness on a demonbane spell: h + trunc(trunc(h × pct/100) × vulnerability/100). */
  markOfDarkness?: { pct: number; vulnerability: number };
  /** Ahrim's set + Amulet of the damned: 1 hit in 4 deals ×13/10. */
  ahrims?: boolean;
  /** Flat bonus on every accurate hitsplat (the unshielded Tormented Demon). */
  accurateFlatBonus?: number;
  dharokFactor?: readonly [number, number];
  berserker?: boolean;
  /** The Maggot King's melee punish on the first hitsplat. */
  firstHitFactor?: readonly [number, number];
  /** Vampyrebane scales, in order (Efaritay's ×11/10 first when it applies). */
  damageScales?: readonly (readonly [number, number])[];
  boltProc?: BoltProcSpec;
  seekingArrows?: boolean;
  twinflame?: boolean;
  corpHalved?: boolean;
  /** The monster always takes the largest hit this attack can deal (the Judge of Yama, ejected Warden cores). */
  alwaysMax?: boolean;
  /** A Mad Angel reaction buff: the first hit always lands, then is floored (cleave) or maxed (lightning). */
  madAngel?: "cleave" | "lightning";
  /** Accurate hits of 0 stay 0. */
  noAccurateZeroRaise?: boolean;
  /** The target's transforms, in upstream's order. */
  npcTransforms: readonly NpcTransform[];
}

export interface DistSummary {
  /** Expected damage per attack. */
  expected: number;
  /** The most one attack can deal, all hitsplats together (the wiki calc's max hit). */
  attackMax: number;
  /** The largest single swing / arrow of a multi-hit weapon. */
  largestHit: number;
}

function allMiss(): Attack {
  return [hitDist(singleSplat(0, 0))];
}

function scale(attack: Attack, n: number, den: number): Attack {
  return mapAttack(attack, (d, accurate, emit) => emit(1, Math.trunc((d * n) / den), accurate));
}

function attackerDist(input: DistInput): Attack {
  const { accuracy: acc, laterAccuracy, minHit: min, maxHit: max, style } = input;
  if (max === 0) return allMiss();
  const melee = style === "melee";
  const standard = (): Splat => linearSplat(acc, min, max);
  let attack: Attack = [hitDist(standard())];

  if (input.oneHitDamage !== undefined) return [hitDist(singleSplat(1, input.oneHitDamage))];
  if (input.accurateKillDamage !== undefined) return [hitDist(singleSplat(acc, input.accurateKillDamage))];

  const profile = input.hitProfile?.length ? input.hitProfile : undefined;
  const sequential = profile?.some((h) => h.requiresPrevious) === true;

  // Two independent full rolls (Dark bow, charged Tonalztics of Ralos) and a
  // single reduced one (uncharged) are plain standard rolls off their own max.
  if (profile && !melee) {
    const maxima = hitsplatMaxima(profile, max);
    attack = maxima.map((m) => hitDist(linearSplat(acc, min, Math.max(min, m))));
  }

  if (input.damageRolls && input.damageRolls > 1) {
    for (let i = 1; i < input.damageRolls; i++) attack = mapAttack(attack, linearMax(max), false);
  }

  if (melee && input.gadderhammer) {
    const big = mapSplat(standard(), (d, a, emit) => emit(1, Math.trunc((d * 5) / 4), a));
    const huge = mapSplat(standard(), (d, a, emit) => emit(1, d * 2, a));
    attack = [hitDist(mixSplats(big, 0.95, huge, 0.05))];
  }

  if (melee && input.veracs) {
    attack = [hitDist(mixSplats(standard(), 0.75, linearSplat(1, 1, max + 1), 0.25))];
  }

  if (style === "ranged" && input.karils) {
    attack = attack.map((d) => {
      const extra = emptySplat();
      d.splats[0].acc.forEach((p, dmg) => {
        if (p === 0) return;
        const half = Math.trunc(dmg / 2);
        while (extra.acc.length <= half) extra.acc.push(0);
        extra.acc[half] += 0.25 * p;
      });
      return { splats: [...d.splats, extra], gates: [...d.gates, { gated: true, fill: 0 }] };
    });
  }

  if (input.guaranteedMaxEarly) return [hitDist(singleSplat(1, max))];

  // Melee multi-hit weapons: the Scythe's independent swings, a two-hit
  // weapon's halves, and the Dual macuahuitl, whose second half is only rolled
  // when the first lands.
  if (profile && melee) {
    const maxima = hitsplatMaxima(profile, max);
    const rolls = maxima.map((m, i) => {
      let s = linearSplat(i === 0 ? acc : laterAccuracy, min, Math.max(min, m));
      if (i === 0 && input.firstHitFactor) {
        const [n, den] = input.firstHitFactor;
        s = mapSplat(s, (d, a, emit) => emit(1, Math.trunc((d * n) / den), a));
      }
      return s;
    });
    if (sequential) {
      let first = rolls[0];
      if (input.madAngel === "cleave") {
        const floor = Math.trunc(maxima[0] / 2);
        first = mapSplat(first, (d, a, emit) => emit(1, Math.max(d, floor), a), false);
      }
      const lands = accurateMass(first);
      const second = scaleProbability(rolls[1], lands);
      while (second.miss.length < 1) second.miss.push(0);
      second.miss[0] += 1 - lands;
      attack = [{ splats: [first, second], gates: [undefined, { gated: true, fill: 1 - lands }] }];
    } else {
      attack = rolls.map((s) => hitDist(s));
    }
  }

  if (melee && input.kerisTriple) {
    const triple = mapSplat(standard(), (d, a, emit) => emit(1, d * 3, a));
    attack = [hitDist(mixSplats(standard(), 50 / 51, triple, 1 / 51))];
  }

  if (melee && input.guardianFactor) {
    attack = scale(attack, input.guardianFactor[0], input.guardianFactor[1]);
  }

  if (input.sanguinesti) {
    attack = mapAttack(attack, (d, a, emit) => {
      emit(0.8, d, a);
      emit(0.2, d + 8, a);
    }, false);
  }

  if (input.markOfDarkness) {
    const { pct, vulnerability } = input.markOfDarkness;
    attack = mapAttack(attack, (d, a, emit) =>
      emit(1, d + Math.trunc((Math.trunc((d * pct) / 100) * vulnerability) / 100), a));
  }

  if (style === "magic" && input.ahrims) {
    attack = mapAttack(attack, (d, a, emit) => {
      emit(0.75, d, a);
      emit(0.25, Math.trunc((d * 13) / 10), a);
    });
  }

  if (input.accurateFlatBonus) attack = mapAttack(attack, flatAdd(input.accurateFlatBonus), false);
  if (melee && input.dharokFactor) attack = scale(attack, input.dharokFactor[0], input.dharokFactor[1]);
  if (melee && input.berserker) attack = scale(attack, 6, 5);
  if (input.firstHitFactor && !(profile && melee)) {
    attack = scale(attack, input.firstHitFactor[0], input.firstHitFactor[1]);
  }
  for (const [n, den] of input.damageScales ?? []) attack = scale(attack, n, den);

  // Enchanted bolts (ruby comes later, after the Corp halving).
  const bolt = style === "ranged" ? input.boltProc : undefined;
  if (bolt?.kind === "flatBonus") {
    attack = mapAttack(attack, (d, a, emit) => {
      if (!a && bolt.accurateOnly) {
        emit(1, d, a);
        return;
      }
      emit(bolt.chance, d + bolt.bonusDamage, a);
      emit(1 - bolt.chance, d, a);
    });
  } else if (bolt?.kind === "scaledMax") {
    const effectMax = Math.trunc((max * bolt.effectMaxPercent) / 100);
    attack = mapAttack(attack, (d, a, emit) => {
      if (!a && bolt.accurateOnly) {
        emit(1, d, a);
        return;
      }
      const p = bolt.chance / (effectMax + 1);
      for (let r = 0; r <= effectMax; r++) emit(p, r, true);
      emit(1 - bolt.chance, d, a);
    });
  }

  if (style === "ranged" && input.seekingArrows) {
    attack = mapAttack(attack, (d, a, emit) => emit(1, Math.max(d, 3), a), false);
  }

  // Every accurate 0 lands as a 1.
  if (!input.noAccurateZeroRaise) {
    attack = mapAttack(attack, (d, _a, emit) => emit(1, Math.max(d, 1), true), false);
  }

  if (style === "magic" && input.twinflame) {
    attack = attack.map((d) => {
      const first = emptySplat();
      const second = emptySplat();
      const put = (arr: number[], dmg: number, p: number) => {
        while (arr.length <= dmg) arr.push(0);
        arr[dmg] += p;
      };
      for (const src of [d.splats[0].acc, d.splats[0].miss]) {
        src.forEach((p, dmg) => {
          if (p === 0) return;
          put(first.acc, dmg, p);
          put(second.acc, Math.trunc((dmg * 4) / 10), p);
        });
      }
      return { splats: [first, second], gates: [undefined, { gated: false, fill: 0 }] };
    });
  }

  if (input.corpHalved) attack = scale(attack, 1, 2);

  if (bolt?.kind === "replaceFixed") {
    attack = mapAttack(attack, (d, a, emit) => {
      emit(bolt.chance, bolt.procDamage, true);
      emit(1 - bolt.chance, d, a);
    });
  }

  if (input.alwaysMax) {
    const top = attackMax(attack);
    if (input.sanguinesti) {
      return [hitDist(mixSplats(singleSplat(1, top - 8), 0.8, singleSplat(1, top), 0.2))];
    }
    return [hitDist(singleSplat(1, top))];
  }

  return attack;
}

/** Condition the first distribution on its first hitsplat being accurate. */
function firstHitAccurate(attack: Attack): Attack {
  if (attack.length === 0) return attack;
  const [first, ...rest] = attack;
  const lands = accurateMass(first.splats[0]);
  if (lands <= 0) return attack;
  const splats = first.splats.map((s, i) => {
    const gate = first.gates[i];
    if (i === 0) return { acc: s.acc.map((p) => p / lands), miss: [] };
    if (!gate?.gated) return s;
    const miss = [...s.miss];
    if (gate.fill > 0 && miss.length > 0) miss[0] = Math.max(0, miss[0] - gate.fill);
    return { acc: s.acc.map((p) => p / lands), miss: miss.map((p) => p / lands) };
  });
  return [{ splats, gates: first.gates.map((g) => (g ? { ...g, fill: 0 } : g)) }, ...rest];
}

export function attackDistribution(input: DistInput): Attack {
  let attack = attackerDist(input);

  if (input.madAngel) {
    attack = firstHitAccurate(attack);
    const [first, ...rest] = attack;
    if (input.madAngel === "lightning") {
      const top = splatAccurateMax(first.splats[0]);
      const maxed = mapSplat(first.splats[0], (_d, a, emit) => emit(1, top, a), false);
      attack = [{ splats: [maxed, ...first.splats.slice(1)], gates: first.gates }, ...rest];
    } else if (!(input.style === "melee" && input.hitProfile?.some((h) => h.requiresPrevious))) {
      const floor = Math.trunc(attackMax(attack) / 2);
      const floored = first.splats.map((s) => mapSplat(s, (d, a, emit) => emit(1, Math.max(d, floor), a), false));
      attack = [{ splats: floored, gates: first.gates }, ...rest];
    }
  }

  for (const t of input.npcTransforms) {
    const { fn, inaccurateToo } = transformOf(t);
    attack = mapAttack(attack, fn, inaccurateToo);
  }
  return attack;
}

export function summariseAttack(input: DistInput): DistSummary {
  const attack = attackDistribution(input);
  const split = input.hitProfile !== undefined && isSplitProfile(input.hitProfile);
  return {
    expected: attackExpected(attack),
    attackMax: attackMax(attack),
    largestHit: split ? attackMax(attack) : attackLargestDist(attack),
  };
}

/** The largest hitsplat any single distribution's first hitsplat can show (debug / tests). */
export function firstSplatMax(input: DistInput): number {
  const attack = attackDistribution(input);
  return attack.length ? splatMax(attack[0].splats[0]) : 0;
}

export { flatLimit };
