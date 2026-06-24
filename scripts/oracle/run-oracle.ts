// Oracle diff harness.
//
// Runs a set of canonical combos through BOTH our DPS engine (scoreScenario)
// and the vendored weirdgloop calc (jest worker in .oracle/wgloop), then prints
// a divergence table. Where a combo carries a locked oracle-matrix baseline, the
// row is a three-way check (ours / wgloop / baseline).
//
//   npx tsx scripts/oracle/run-oracle.ts                       # validation set (8 fixtures)
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";
import { STAT_OVERRIDES } from "@/data/items/stat-overrides";
import { hitProfileForWeapon } from "@/data/items/multi-hit-weapons";
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
   * DPS + accuracy instead.
   */
  multiHit?: boolean;
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
    onTask: combo.onTask ?? false,
  });
  if (!scored.valid) return { id: combo.id, ok: false, error: scored.reasons.join("; ") };
  const weaponId = scored.loadout.slots.weapon?.itemId;
  const multiHit = hitProfileForWeapon(weaponId, { targetSize: boss.size }) !== undefined;
  return {
    id: combo.id,
    ok: true,
    maxHit: scored.dps.maxHit,
    accuracy: scored.dps.accuracy,
    dps: scored.dps.dps,
    multiHit,
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

function runWorker(combos: CanonicalCombo[]): OracleResult[] {
  mkdirSync(IO_DIR, { recursive: true });
  refreshWorker();
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

type Verdict = "OK" | "MAXHIT" | "ACC" | "DPS" | "ERROR";

function compare(our: OurResult, wg: OracleResult | undefined): { verdict: Verdict; detail: string } {
  if (!our.ok) return { verdict: "ERROR", detail: `ours: ${our.error}` };
  if (!wg) return { verdict: "ERROR", detail: "wgloop: no result" };
  if (!wg.ok) return { verdict: "ERROR", detail: `wgloop: ${wg.error}` };

  // Multi-hit weapons report maxHit differently on each side (single largest
  // hit vs summed max across hits), so it isn't comparable — rely on DPS + acc.
  if (!our.multiHit && our.maxHit !== wg.maxHit) {
    return { verdict: "MAXHIT", detail: `maxHit ours=${our.maxHit} wg=${wg.maxHit}` };
  }
  if (Math.abs((our.accuracy ?? 0) - wg.accuracy) > ACC_TOL) {
    return { verdict: "ACC", detail: `acc ours=${our.accuracy?.toFixed(4)} wg=${wg.accuracy.toFixed(4)}` };
  }
  const dOurs = our.dps ?? 0;
  const rel = Math.abs(dOurs - wg.dps) / Math.max(wg.dps, 1e-9);
  if (rel > DPS_REL_TOL && Math.abs(dOurs - wg.dps) > DPS_ABS_TOL) {
    return { verdict: "DPS", detail: `dps ours=${dOurs.toFixed(3)} wg=${wg.dps.toFixed(3)} (${(rel * 100).toFixed(1)}%)` };
  }
  return { verdict: "OK", detail: "" };
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
    const { verdict, detail } = compare(o, w);
    if (verdict !== "OK") diverged++;
    if (verdict === "OK" && !showAll) continue;

    const mark = verdict === "OK" ? "✓" : "✗";
    console.log(`\n${mark} [${verdict}] ${c.id}  (${c.bossSlug}, ${c.attackType}/${c.choice})`);
    if (o.ok && w && w.ok) {
      console.log(
        `    ours : maxHit ${o.maxHit}  acc ${o.accuracy?.toFixed(4)}  dps ${o.dps?.toFixed(3)}`,
      );
      console.log(
        `    wglp : maxHit ${w.maxHit}  acc ${w.accuracy.toFixed(4)}  dps ${w.dps.toFixed(3)}`,
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
