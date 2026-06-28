# Contributing

Thanks for taking the time to look at OSRS Boss Helper! Bug reports, fixes, and
new boss/mechanic data are all welcome.

## Getting set up

```bash
npm install
npm run dev                  # http://127.0.0.1:3000
```

The app runs with **no configuration** — there's no database and no login. The
optional `.env.local` (copy from `.env.example`) only enables live GE prices and
the feedback email relay.

## Before you open a PR

Please make sure these pass:

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (unit + DPS regression suite)
npm run build       # production build (also runs build-data)
```

The DPS engine is held to the real community calculator. If you touch combat
math, run the oracle cross-check:

```bash
npm run oracle      # compares our engine against tools.runescape.wiki/osrs-dps
```

## Things to know about the codebase

- **Generated data is not hand-edited.** `data/items/catalog.ts` and
  `data/monsters/catalog.ts` are produced by `scripts/build-*-catalog.ts` (run
  via `npm run build-data`, which also runs before `build` and `test`). Change
  the generators or the source data, not the output.
- **DPS regression tests are intentional guardrails.** Several setups are locked
  to exact DPS values verified against the wiki calculator; if your change moves
  a number, make sure that's deliberate and update the assertion with a note.
- **The RuneLite plugin** lives in [`plugin/`](plugin/) and has its own
  guidelines in [`plugin/AGENTS.md`](plugin/AGENTS.md) (RuneLite Hub rules,
  threading, etc.). It can only be verified by running it in RuneLite —
  see that folder's README.
- This repo can use a "graphify" knowledge graph in `graphify-out/` (gitignored)
  to navigate the code. It's an optional developer aid, not required to build.

## Style

Match the surrounding code — naming, comment density, and idioms. The core logic
is heavily commented on purpose; new non-obvious logic should be too.

## Reporting security issues

Please follow [SECURITY.md](SECURITY.md) — report privately, not via a public
issue.
