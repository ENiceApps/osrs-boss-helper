// Bootstraps the wgloop oracle: clones weirdgloop/osrs-dps-calc at a pinned SHA
// into .oracle/wgloop (gitignored), installs its deps, and injects the jest
// worker. Idempotent — skips the slow steps when the clone is already at the
// pinned SHA with node_modules present.
//
// Designed to run cold (a background/CI agent with only this repo checked out):
//   npx tsx scripts/oracle/setup-oracle.ts
//
// Re-run after bumping WGLOOP_PINNED_SHA or editing worker.ts.template.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WGLOOP_PINNED_SHA, WGLOOP_REPO } from "./contract";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ORACLE_DIR = join(ROOT, ".oracle");
const CLONE_DIR = join(ORACLE_DIR, "wgloop");

function run(cmd: string, args: string[], cwd: string): void {
  console.log(`  $ ${cmd} ${args.join(" ")}`);
  // node/git are real .exe — no shell needed (important: CLONE_DIR may contain
  // spaces, and shell:true on Windows mangles such paths). Only .cmd shims would
  // need a shell, and we deliberately avoid those.
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

/**
 * Install wgloop deps with the repo's OWN pinned yarn (it ships the binary at
 * the yarnPath in .yarnrc.yml). npm can't be used: the repo declares a yarn
 * `patch:` dependency (recharts) that npm rejects with EUNSUPPORTEDPROTOCOL.
 */
function yarnInstall(): void {
  const yarnrc = readFileSync(join(CLONE_DIR, ".yarnrc.yml"), "utf8");
  const m = yarnrc.match(/^yarnPath:\s*(.+)$/m);
  if (!m) throw new Error("Could not find yarnPath in .yarnrc.yml");
  const yarnBin = m[1].trim().replace(/['"]/g, "");
  // Relative to CLONE_DIR (our cwd), so no space-bearing absolute path is passed.
  run("node", [yarnBin, "install"], CLONE_DIR);
}

function currentSha(): string | null {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: CLONE_DIR,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function cloneAtPinnedSha(): void {
  console.log(`Cloning ${WGLOOP_REPO} @ ${WGLOOP_PINNED_SHA.slice(0, 10)} …`);
  rmSync(CLONE_DIR, { recursive: true, force: true });
  mkdirSync(CLONE_DIR, { recursive: true });
  run("git", ["init", "-q"], CLONE_DIR);
  run("git", ["remote", "add", "origin", WGLOOP_REPO], CLONE_DIR);
  try {
    // Fetch only the pinned commit (depth 1). GitHub allows fetching a reachable
    // SHA directly, so we avoid pulling the whole history.
    run("git", ["fetch", "--depth", "1", "origin", WGLOOP_PINNED_SHA], CLONE_DIR);
    run("git", ["checkout", "-q", "FETCH_HEAD"], CLONE_DIR);
  } catch {
    console.warn(
      "  ! Could not fetch the pinned SHA directly; falling back to main HEAD.\n" +
        "    Numbers may drift from the pin. Re-pin WGLOOP_PINNED_SHA if upstream changed.",
    );
    run("git", ["fetch", "--depth", "1", "origin", "main"], CLONE_DIR);
    run("git", ["checkout", "-q", "FETCH_HEAD"], CLONE_DIR);
  }
}

function injectWorker(): void {
  const template = readFileSync(join(ROOT, "scripts", "oracle", "worker.ts.template"), "utf8");
  const destDir = join(CLONE_DIR, "src", "tests", "oracle");
  mkdirSync(destDir, { recursive: true });
  writeFileSync(join(destDir, "oracle-worker.test.ts"), template, "utf8");
  console.log("  injected src/tests/oracle/oracle-worker.test.ts");
}

function main(): void {
  mkdirSync(ORACLE_DIR, { recursive: true });

  const haveClone = existsSync(join(CLONE_DIR, "package.json"));
  const sha = haveClone ? currentSha() : null;
  const haveDeps = existsSync(join(CLONE_DIR, "node_modules"));
  const pinnedOk = sha === WGLOOP_PINNED_SHA;

  if (haveClone && pinnedOk && haveDeps) {
    console.log(`Clone already at pinned SHA with deps installed — refreshing worker only.`);
    injectWorker();
    console.log("Oracle ready.");
    return;
  }

  if (!haveClone || !pinnedOk) {
    cloneAtPinnedSha();
  }

  injectWorker();

  console.log("Installing wgloop deps with pinned yarn (one-time, slow) …");
  yarnInstall();

  console.log("Oracle ready.");
}

main();
