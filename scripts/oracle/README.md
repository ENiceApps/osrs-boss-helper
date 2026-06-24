# DPS oracle harness

Cross-checks our DPS engine against the **real weirdgloop calc engine**
(`weirdgloop/osrs-dps-calc`, the code behind dps.osrs.wiki) for the same loadout
vs the same boss. Finds modelling gaps and systematic bugs.

It runs the wgloop engine **locally in Node** — not the website. No scraping, no
browser. Both engines are pure functions, so a sweep of hundreds of combos takes
seconds.

## How it works

```
CanonicalCombo  ──►  our engine (scoreScenario)            ─┐
   (one record)                                             ├─►  diff table
                ──►  wgloop engine (jest worker in clone)  ─┘
```

One `CanonicalCombo` (see `contract.ts`) drives both sides, so a combo can never
describe two different setups. The wgloop side runs as a **jest spec injected
into a pinned clone** of the upstream repo — this reuses wgloop's own test
helpers and jest module-mapping (which stub asset imports and alias `@/`), so the
numbers are identical to wgloop's own test suite.

Parity assumptions (both engines): no potions, always-on offensive prayer
(Piety / Rigour / Augury — mirrors our `DEFAULT_PRAYERS`), `onSlayerTask` and
Kandarin diary off unless a combo opts in.

## Usage

```bash
npm run oracle:setup        # one-time: clone wgloop @ pinned SHA + yarn install (slow)
npm run oracle              # validation set — the 8 oracle-matrix fixtures
npm run oracle -- --all     # also print the rows that match
npm run oracle -- --sweep --style=magic --limit=60   # broad sweep, one shard
npm run oracle -- --sweep --style=ranged
npm run oracle -- --sweep --style=melee
```

Exit code is non-zero when any combo diverges beyond tolerance (maxHit must match
exactly; accuracy ±0.0015; dps ±0.5%) — usable as a CI gate once green.

## Sharding

`--style=` runs one combat style. Fan three background agents out in parallel
(melee / ranged / magic), each triaging its own divergences. See
`KICKOFF-PROMPTS.md`.

## Caveat — raid bosses

Chambers of Xeric / Tombs of Amascut / Nightmare monsters scale with party size,
challenge mode, and invocation level. The sweep feeds only neutral defaults
(party size 1), so raid rows are unreliable (e.g. Tekton shows a degenerate
wgloop max hit). Treat raid-boss divergences as harness noise unless you extend
the combo to set the monster `inputs` (isFromCoxCm, toaInvocationLevel, etc.).

## Files

| file | role |
|------|------|
| `contract.ts` | shared combo + result types; **pinned upstream SHA** |
| `setup-oracle.ts` | clone + yarn install + inject worker (idempotent, cold-start safe) |
| `worker.ts.template` | the jest worker; copied into the clone by setup |
| `combos.ts` | validation set (from oracle-matrix) + sweep generator |
| `run-oracle.ts` | runs both engines, diffs, three-way vs locked baselines |

The clone lives in `.oracle/` (gitignored). Bump `WGLOOP_PINNED_SHA` in
`contract.ts` and re-run `oracle:setup` to pick up upstream changes.

## Known divergences (validation set, as of first run)

These are candidate engine bugs the oracle found, **not** harness errors — base
math (e.g. demonbane melee accuracy) matches wgloop to 4 decimals, so divergences
localize to specific mechanics:

- ~~**Standard-spellbook cast speed** — magic DPS ×5/4 too high.~~ **FIXED**
  (`lib/dps/magic-cast-speed.ts`).
- ~~**Obsidian + Berserker necklace** — damage under-modelled (36 vs 43).~~
  **FIXED** (`berserkerObsidian` in `lib/dps/calculate.ts`). ~1.2% dps residual
  remains from wgloop's distribution flooring on the necklace ×6/5 — minor.
- ~~**Void set** — accuracy ~0.4% high.~~ **FIXED** — void now applies ×11/10 to
  the effective level, not the roll (`accuracyOnEffectiveLevel`).
- **Inquisitor's set** (47 vs 46) — **NOT an engine bug**: the wgloop clone has
  pre-buff Inquisitor item stats; our data (stat-overrides) matches live OSRS.
  An example of the data-skew caveat below.
- **Twisted bow with no arrows** — fixture omits ammo; the app always fills it.
  Not an engine bug.

## Caveat — data version skew

Our item catalog applies `data/items/stat-overrides.ts` on top of vendored data
to track live OSRS rebalances (e.g. the Inquisitor's buff). The wgloop clone
reads its own pinned `cdn/json/equipment.json`, which can predate those changes.
When a divergence is a clean ±1 on a single rebalanced item, suspect data skew
before an engine bug — verify the item's stats match live OSRS. A future
hardening is to feed the worker our final (overridden) item stats.
