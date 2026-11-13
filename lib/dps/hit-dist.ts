// Exact hit distributions, one hitsplat at a time.
//
// The closed-form means in calculate.ts cover the common attacks. The rarer
// mechanics — Barrows set effects, the raid bosses' damage limiters, monsters
// that always take a max hit, vampyrebane, the Gadderhammer — interact with
// every other step (bolt procs, multi-hit weapons, flat armour…), so instead of
// one more closed form per pairing they run through this small distribution
// model, in the same order the game (and the wiki DPS calculator) applies them.
//
// An attack is a list of independent hit distributions (the Scythe's three
// swings, a Dark bow's two arrows). Each holds one or more hitsplats; a later
// hitsplat in the same distribution depends on the first (the Dual
// macuahuitl's second half, Karil's bonus hitsplat, the Twinflame's second
// cast). Only two numbers are read off the result — the expected damage and
// the largest total — and both are sums over hitsplats (expectation is linear;
// the dependent hitsplats here all peak together), so each hitsplat is kept as
// its own MARGINAL distribution: `acc[d]` / `miss[d]` is the probability that
// this hitsplat is an accurate / inaccurate hit of exactly d. The mass may sum
// to less than 1: the remainder is "no hitsplat at all" (no Karil's proc).

export interface Splat {
  /** acc[d] = P(an accurate hitsplat of d). */
  acc: number[];
  /** miss[d] = P(an inaccurate hitsplat of d) — a miss is miss[0]. */
  miss: number[];
}

export interface HitDist {
  splats: Splat[];
  /**
   * For splats[1..]: the probability mass sitting at miss[0] only because the
   * FIRST hitsplat missed (the Dual macuahuitl's second half), and whether the
   * hitsplat exists only when the first is accurate. Used to condition on an
   * accurate first hit (the Mad Angel's reaction buffs).
   */
  gates: ({ gated: boolean; fill: number } | undefined)[];
}

export type Attack = HitDist[];

/** emit(probability, damage, accurate) */
export type Emit = (p: number, damage: number, accurate: boolean) => void;
export type SplatTransform = (damage: number, accurate: boolean, emit: Emit) => void;

function add(arr: number[], d: number, p: number): void {
  if (p === 0) return;
  while (arr.length <= d) arr.push(0);
  arr[d] += p;
}

export function emptySplat(): Splat {
  return { acc: [], miss: [] };
}

/** An accuracy roll then a uniform damage roll over lo..hi. */
export function linearSplat(accuracy: number, lo: number, hi: number): Splat {
  const s = emptySplat();
  const p = accuracy / (hi - lo + 1);
  for (let d = lo; d <= hi; d++) add(s.acc, d, p);
  add(s.miss, 0, 1 - accuracy);
  return s;
}

/** An accuracy roll then a fixed hit. */
export function singleSplat(accuracy: number, damage: number): Splat {
  const s = emptySplat();
  add(s.acc, damage, accuracy);
  add(s.miss, 0, 1 - accuracy);
  return s;
}

/** Every outcome through `fn`; inaccurate hitsplats pass untouched unless `inaccurateToo`. */
export function mapSplat(s: Splat, fn: SplatTransform, inaccurateToo = true): Splat {
  const out = emptySplat();
  let weight = 0;
  const emit: Emit = (p, d, accurate) => add(accurate ? out.acc : out.miss, d, weight * p);
  for (let d = 0; d < s.acc.length; d++) {
    if (s.acc[d] === 0) continue;
    weight = s.acc[d];
    fn(d, true, emit);
  }
  for (let d = 0; d < s.miss.length; d++) {
    if (s.miss[d] === 0) continue;
    weight = s.miss[d];
    if (inaccurateToo) fn(d, false, emit);
    else add(out.miss, d, weight);
  }
  return out;
}

export function scaleProbability(s: Splat, factor: number): Splat {
  return { acc: s.acc.map((p) => p * factor), miss: s.miss.map((p) => p * factor) };
}

/** wa·a + wb·b, outcome by outcome. */
export function mixSplats(a: Splat, wa: number, b: Splat, wb: number): Splat {
  const out = emptySplat();
  a.acc.forEach((p, d) => add(out.acc, d, p * wa));
  a.miss.forEach((p, d) => add(out.miss, d, p * wa));
  b.acc.forEach((p, d) => add(out.acc, d, p * wb));
  b.miss.forEach((p, d) => add(out.miss, d, p * wb));
  return out;
}

export function accurateMass(s: Splat): number {
  let m = 0;
  for (const p of s.acc) m += p;
  return m;
}

export function splatMean(s: Splat): number {
  let m = 0;
  for (let d = 1; d < s.acc.length; d++) m += d * s.acc[d];
  for (let d = 1; d < s.miss.length; d++) m += d * s.miss[d];
  return m;
}

/** The largest damage this hitsplat can deal (0 when it never appears). */
export function splatMax(s: Splat): number {
  let m = 0;
  for (let d = s.acc.length - 1; d > m; d--) if (s.acc[d] > 0) { m = d; break; }
  for (let d = s.miss.length - 1; d > m; d--) if (s.miss[d] > 0) { m = d; break; }
  return m;
}

/** The largest ACCURATE damage (0 when none). */
export function splatAccurateMax(s: Splat): number {
  for (let d = s.acc.length - 1; d > 0; d--) if (s.acc[d] > 0) return d;
  return 0;
}

export function hitDist(...splats: Splat[]): HitDist {
  return { splats, gates: splats.map(() => undefined) };
}

/** Every hitsplat of every distribution through `fn`. */
export function mapAttack(attack: Attack, fn: SplatTransform, inaccurateToo = true): Attack {
  return attack.map((d) => ({ splats: d.splats.map((s) => mapSplat(s, fn, inaccurateToo)), gates: d.gates }));
}

export function attackExpected(attack: Attack): number {
  let e = 0;
  for (const d of attack) for (const s of d.splats) e += splatMean(s);
  return e;
}

/** The most one attack can deal: every hitsplat at its max. */
export function attackMax(attack: Attack): number {
  let m = 0;
  for (const d of attack) for (const s of d.splats) m += splatMax(s);
  return m;
}

/** The largest single distribution (one swing / arrow), for the per-hit max display. */
export function attackLargestDist(attack: Attack): number {
  let m = 0;
  for (const d of attack) {
    let sum = 0;
    for (const s of d.splats) sum += splatMax(s);
    if (sum > m) m = sum;
  }
  return m;
}

// ── Transforms (upstream HitDist.ts transformers, by what they do) ──

/** trunc(d × n/den). With a minimum: a hit of at least that never drops below it, a smaller one is never reduced. */
export function multiplyHit(n: number, den: number, minimum = 0): SplatTransform {
  return (d, accurate, emit) => {
    let out = Math.trunc((n * d) / den);
    if (minimum !== 0) out = d >= minimum ? Math.max(minimum, out) : Math.max(d, out);
    emit(1, out, accurate);
  };
}

/** max(minimum, d + addend). */
export function flatAdd(addend: number, minimum = 0): SplatTransform {
  return (d, accurate, emit) => emit(1, Math.max(minimum, d + addend), accurate);
}

/** min(d, maximum), at least `minimum`. */
export function flatLimit(maximum: number, minimum = 0): SplatTransform {
  return (d, accurate, emit) => emit(1, Math.max(minimum, Math.min(d, maximum)), accurate);
}

/** min(d, i + offset) for a uniform i in 0..maximum. */
export function linearMin(maximum: number, offset = 0): SplatTransform {
  return (d, accurate, emit) => {
    const p = 1 / (maximum + 1);
    for (let i = 0; i <= maximum; i++) emit(p, Math.min(d, i + offset), accurate);
  };
}

/** max(d, i + offset) for a uniform i in 0..maximum. */
export function linearMax(maximum: number, offset = 0): SplatTransform {
  return (d, accurate, emit) => {
    const p = 1 / (maximum + 1);
    for (let i = 0; i <= maximum; i++) emit(p, Math.max(d, i + offset), accurate);
  };
}

/** A hit over `limit` is rerolled uniformly over offset..offset + rollMax. */
export function cappedReroll(limit: number, rollMax: number, offset = 0): SplatTransform {
  return (d, accurate, emit) => {
    if (d <= limit) {
      emit(1, d, accurate);
      return;
    }
    const p = 1 / (rollMax + 1);
    for (let i = 0; i <= rollMax; i++) emit(p, i + offset, accurate);
  };
}
