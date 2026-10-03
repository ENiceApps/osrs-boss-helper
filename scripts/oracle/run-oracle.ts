// Oracle diff harness.
//
// Runs a set of canonical combos through BOTH our DPS engine (scoreScenario)
// and the vendored weirdgloop calc (jest worker in .oracle/wgloop), then prints
// a divergence table. Where a combo carries a locked oracle-matrix baseline, the
// row is a three-way check (ours / wgloop / baseline).
//
//   npx tsx scripts/oracle/run-oracle.ts                       # validation set (fixtures + ordering combos)
//   npx tsx scripts/oracle/run-oracle.ts --only=tbow           # filter combos by id substring
//   npx tsx scripts/oracle/run-oracle.ts --all                 # print matching rows too
//   npx tsx scripts/oracle/run-oracle.ts --sweep --style=magic # broad sweep, sharded by style
//   npx tsx scripts/oracle/run-oracle.ts --sweep --limit=60    # N bosses per style
//   npx tsx scripts/oracle/run-oracle.ts --optimize --limit=20 # oracle-check the app's
//                                                              # recommended loadout per boss
//
// Exit code is non-zero if any combo diverges beyond tolerance — usable as a CI
// gate once the validation set is green.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { STAT_OVERRIDES } from "@/data/items/stat-overrides";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
import { isSplitProfile } from "@/lib/dps/multihit";
import type { CombatStyle } from "@/types/osrs";
import type { CanonicalCombo, OracleResult } from "./contract";
import { optimizedSweepCombos, sweepCombos, validationCombos } from "./combos";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLONE_DIR = join(ROOT, ".oracle", "wgloop");
const IO_DIR = join(ROOT, ".oracle", "io");

// Tolerances. maxHit must match exactly — any difference is a real modelling
// gap. accuracy/dps allow small slop for integer-rounding order differences.
const ACC_TOL = 0.0015;
const DPS_REL_TOL = 0.005;
const DPS_ABS_TOL = 0.02;
// Combos with `strictDps` (see contract.ts): relative only, and tighter.
const STRICT_DPS_REL_TOL = 0.0005;

interface OurResult {
  id: string;
  ok: boolean;
  maxHit?: number;
  accuracy?: number;
  dps?: number;
  /**
   * Multi-hit weapon (Scythe, Dark bow, …). For these, our `maxHit` is the
   * single largest hit while wgloop's `getMax()` is the summed max across all
   * hits — not comparable. The comparator skips the maxHit check and relies on
   * DPS + accuracy instead. Split weapons (Dual macuahuitl, Torag's) don't set
   * it: both sides report the whole attack's max.
   */
  multiHit?: boolean;
  /**
   * Keris vs a Kalphite: wgloop's `getMax()` is the 1/51 triple hitsplat, so
   * its max hit is 3× ours. The comparator triples ours to match.
   */
  tripleProc?: boolean;
  /** Our engine's flat-armour shift (armour + pre-armour max), when any. */
  flatArmour?: { armour: number; rawMaxHit: number };
  error?: string;
}

function ourEngine(combo: CanonicalCombo): OurResult {
  const boss = MONSTER_BY_SLUG[combo.bossSlug];
  if (!boss) return { id: combo.id, ok: false, error: `boss not in catalog: ${combo.bossSlug}` };
  const scored = scoreScenario({
    itemIds: combo.itemIds,
    internalAmmoId: combo.internalAmmoId,
    target: boss,
    skills: SKILLS_AT_99,
    attackStyle: { attackType: combo.attackType, choice: combo.choice },
    baseSpellMaxHit: combo.baseSpellMaxHit,
    spellElement: combo.spellElement,
    // The spell name gates Twinflame's double cast and demonbane spells.
    autoSpellName: combo.spellName,
    onTask: combo.onTask ?? false,
  });
  if (!scored.valid) return { id: combo.id, ok: false, error: scored.reasons.join("; ") };
  const weaponId = scored.loadout.slots.weapon?.itemId;
  const profile = hitProfileForWeapon(weaponId, { targetSize: boss.size });
  // A split weapon (Dual macuahuitl, Torag's) reports the whole attack's max
  // on both sides, so only the other multi-hitters skip the max-hit check.
  const multiHit = profile !== undefined && !isSplitProfile(profile);
  const tripleProc =
    scored.loadout.style === "melee" && scored.activeBonuses.conditionalBonuses.kerisVsKalphite === true;
  return {
    id: combo.id,
    ok: true,
    maxHit: scored.dps.maxHit,
    accuracy: scored.dps.accuracy,
    dps: scored.dps.dps,
    multiHit,
    tripleProc,
    flatArmour: scored.dps.flatArmour,
  };
}

function ensureOracle(): void {
  if (existsSync(join(CLONE_DIR, "node_modules")) && existsSync(join(CLONE_DIR, "src", "tests", "oracle", "oracle-worker.test.ts"))) {
    return;
  }
  console.log("Oracle clone not ready — running setup-oracle …\n");
  const tsx = process.platform === "win32" ? "tsx.cmd" : "tsx";
  execFileSync(tsx, ["scripts/oracle/setup-oracle.ts"], { cwd: ROOT, stdio: "inherit" });
}

/** Refresh the injected worker from the template so edits take effect each run. */
function refreshWorker(): void {
  const template = readFileSync(join(ROOT, "scripts", "oracle", "worker.ts.template"), "utf8");
  const dest = join(CLONE_DIR, "src", "tests", "oracle", "oracle-worker.test.ts");
  if (existsSync(dest)) writeFileSync(dest, template, "utf8");
}

/**
 * Copy OUR vendored equipment/monsters data into the clone's CDN so both engines
 * read identical base item/monster stats by construction. Currently a no-op
 * (our vendored snapshot == the clone's pinned snapshot — verified via git diff),
 * but it future-proofs the oracle: when WGLOOP_PINNED_SHA is bumped or the
 * vendored data is refreshed independently, this keeps both sides on OUR data so
 * any divergence is engine logic, never a data-version mismatch. (Our catalog =
 * this vendored data + stat-overrides; the worker replays the overrides on top.)
 */
function syncVendorData(): void {
  const srcDir = join(ROOT, "data", "vendor", "wgloop");
  const dstDir = join(CLONE_DIR, "cdn", "json");
  for (const f of ["equipment.json", "monsters.json"]) {
    const src = join(srcDir, f);
    if (existsSync(src) && existsSync(dstDir)) copyFileSync(src, join(dstDir, f));
  }
}

function runWorker(combos: CanonicalCombo[]): OracleResult[] {
  mkdirSync(IO_DIR, { recursive: true });
  refreshWorker();
  syncVendorData();
  const combosPath = join(IO_DIR, "combos.json");
  const outPath = join(IO_DIR, "results.json");
  const overridesPath = join(IO_DIR, "overrides.json");
  writeFileSync(combosPath, JSON.stringify(combos, null, 2), "utf8");
  // Replay our catalog's stat overrides so both engines use identical item data.
  writeFileSync(overridesPath, JSON.stringify(STAT_OVERRIDES), "utf8");

  console.log(`Running wgloop worker on ${combos.length} combo(s) …`);
  execFileSync(
    "node",
    ["node_modules/jest/bin/jest.js", "src/tests/oracle/oracle-worker.test.ts", "--coverage=false", "--runInBand"],
    {
      cwd: CLONE_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        ORACLE_COMBOS: combosPath,
        ORACLE_OUT: outPath,
        ORACLE_OVERRIDES: overridesPath,
      },
    },
  );
  return JSON.parse(readFileSync(outPath, "utf8")) as OracleResult[];
}

/**
 * Our attack roll, recovered from our hit chance and wgloop's NPC defence roll
 * by inverting the standard formula (see lib/dps/common.ts hitChance). Exposes
 * a few-point roll difference that the accuracy tolerance would hide. Only
 * meaningful for the plain single-roll formula — not fang / always-hit rows.
 */
function impliedAttackRoll(accuracy: number, defRoll: number): number | undefined {
  if (!(accuracy > 0 && accuracy < 1)) return undefined;
  // A > D branch: acc = 1 - (D+2) / (2(A+1)); A < D branch: acc = A / (2(D+1)).
  const high = (defRoll + 2) / (2 * (1 - accuracy)) - 1;
  if (high > defRoll) return Math.round(high);
  return Math.round(accuracy * 2 * (defRoll + 1));
}

/**
 * Our max hit as wgloop reports it. Keris vs a Kalphite: wgloop's max is the
 * 1/51 triple hitsplat — tripled BEFORE flat armour shifts it (3M − A, e.g.
 * 3 × 41 + 2 = 125 vs a Locust rider), so the pre-armour max is tripled.
 */
function comparableMaxHit(our: OurResult): number | undefined {
  if (!our.tripleProc) return our.maxHit;
  const fa = our.flatArmour;
  return fa ? Math.max(0, fa.rawMaxHit * 3 - fa.armour) : (our.maxHit ?? 0) * 3;
}

type Verdict = "OK" | "MAXHIT" | "ACC" | "ROLL" | "DPS" | "ERROR";

function compare(
  our: OurResult,
  wg: OracleResult | undefined,
  combo: CanonicalCombo,
): { verdict: Verdict; detail: string } {
  if (!our.ok) return { verdict: "ERROR", detail: `ours: ${our.error}` };
  if (!wg) return { verdict: "ERROR", detail: "wgloop: no result" };
  if (!wg.ok) return { verdict: "ERROR", detail: `wgloop: ${wg.error}` };

  // Multi-hit weapons report maxHit differently on each side (single largest
  // hit vs summed max across hits), so it isn't comparable — rely on DPS + acc.
  const ourMax = comparableMaxHit(our);
  let maxHitNote = "";
  if (!our.multiHit && ourMax !== wg.maxHit) {
    const detail = `maxHit ours=${ourMax} wg=${wg.maxHit}`;
    if (!combo.knownMaxHitResidual) return { verdict: "MAXHIT", detail };
    maxHitNote = `${detail} — known: ${combo.knownMaxHitResidual}`;
  }
  if (Math.abs((our.accuracy ?? 0) - wg.accuracy) > ACC_TOL) {
    return { verdict: "ACC", detail: `acc ours=${our.accuracy?.toFixed(4)} wg=${wg.accuracy.toFixed(4)}` };
  }
  if (combo.exactRoll) {
    const ourRoll = impliedAttackRoll(our.accuracy ?? 0, wg.npcDefRoll);
    if (ourRoll !== undefined && ourRoll !== wg.maxAttackRoll) {
      return { verdict: "ROLL", detail: `attack roll ours≈${ourRoll} wg=${wg.maxAttackRoll}` };
    }
  }
  const dOurs = our.dps ?? 0;
  const rel = Math.abs(dOurs - wg.dps) / Math.max(wg.dps, 1e-9);
  const dpsOff = combo.strictDps
    ? rel > STRICT_DPS_REL_TOL
    : rel > DPS_REL_TOL && Math.abs(dOurs - wg.dps) > DPS_ABS_TOL;
  if (dpsOff) {
    const dp = combo.strictDps ? 5 : 3;
    const detail = `dps ours=${dOurs.toFixed(dp)} wg=${wg.dps.toFixed(dp)} (${(rel * 100).toFixed(dp - 2)}%)`;
    if (combo.knownDpsResidual) {
      const note = `${detail} — known: ${combo.knownDpsResidual}`;
      return { verdict: "OK", detail: maxHitNote ? `${maxHitNote}; ${note}` : note };
    }
    return { verdict: "DPS", detail };
  }
  return { verdict: "OK", detail: maxHitNote };
}

function main(): void {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const styleArg = args.find((a) => a.startsWith("--style="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const showAll = args.includes("--all");
  const sweep = args.includes("--sweep");
  const optimize = args.includes("--optimize");
  const only = onlyArg ? onlyArg.slice("--only=".length) : undefined;
  const style = styleArg ? (styleArg.slice("--style=".length) as CombatStyle) : undefined;
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : undefined;

  let combos = optimize
    ? optimizedSweepCombos({ limit })
    : sweep
      ? sweepCombos({ style, limit })
      : validationCombos();
  if (only) combos = combos.filter((c) => c.id.includes(only));
  if (combos.length === 0) {
    console.error(`No combos matched --only=${only}`);
    process.exit(2);
  }

  ensureOracle();

  const ours = new Map(combos.map((c) => [c.id, ourEngine(c)]));
  const wg = new Map(runWorker(combos).map((r) => [r.id, r]));

  console.log("\n" + "═".repeat(96));
  console.log(`Oracle diff — ${combos.length} combo(s)`);
  console.log("═".repeat(96));

  let diverged = 0;
  for (const c of combos) {
    const o = ours.get(c.id)!;
    const w = wg.get(c.id);
    const { verdict, detail } = compare(o, w, c);
    if (verdict !== "OK") diverged++;
    if (verdict === "OK" && !showAll) continue;

    const mark = verdict === "OK" ? "✓" : "✗";
    console.log(`\n${mark} [${verdict}] ${c.id}  (${c.bossSlug}, ${c.attackType}/${c.choice})`);
    if (o.ok && w && w.ok) {
      const ourRoll = impliedAttackRoll(o.accuracy ?? 0, w.npcDefRoll);
      console.log(
        `    ours : maxHit ${o.maxHit}${o.tripleProc ? ` (triple = ${comparableMaxHit(o)})` : ""}  acc ${o.accuracy?.toFixed(4)}  dps ${o.dps?.toFixed(3)}  roll≈${ourRoll ?? "—"}`,
      );
      console.log(
        `    wglp : maxHit ${w.maxHit}  acc ${w.accuracy.toFixed(4)}  dps ${w.dps.toFixed(3)}  roll ${w.maxAttackRoll}`,
      );
      if (c.baseline) {
        const b = c.baseline;
        console.log(
          `    base : maxHit ${b.maxHit}  acc ${b.accuracy.toFixed(4)}  dps ${b.dps?.toFixed(3) ?? "—"}   (${b.verifiedOn})`,
        );
      }
    }
    if (detail) console.log(`    → ${detail}`);
  }

  console.log("\n" + "─".repeat(96));
  const okCount = combos.length - diverged;
  console.log(`Result: ${okCount}/${combos.length} match, ${diverged} diverged.`);
  console.log("─".repeat(96));
  process.exit(diverged > 0 ? 1 : 0);
}

main();
