@AGENTS.md

## Shared workspace memory

Cross-project rules and lessons live in **`..\MEMORY.md`** (the Projects root —
sessions started anywhere under `Projects\` load it automatically via the root
`CLAUDE.md`'s `@MEMORY.md` import). It holds the hard rules that apply here too:
verify prior art before building or affirming a "new" feature (the rule this
project taught — see GearScape/Bank Memory in that file), **push = Vercel
deploy: push on your own once work is done, verified and committed — don't wait
for ENice to say "push it"** (the RuneLite plugin release is separate and still
needs his go-ahead — see `plugin/HUB_PENDING.md`), nothing ships until verified on
ENice's phone, and money decisions are ENice's alone. It also carries machine-wide
dev gotchas (the Turbopack `.next\dev` panic fix lives there now) and each
project's current status. **When a lesson learned in this project applies
beyond it, add it to `..\MEMORY.md`, not just this file.**

## Project status (2026-11-09)

- **Live:** osrsbosshelper.com, **v0.2.0** (released 2026-11-01). The site
  covers The Fractured Archive (Raids 4, released 2026-10-20): every TFA boss
  and side NPC, the Obligator, Zorya's tome, weirdgloop's formulas. Patch
  releases signed "From AI" come from the manual wiki check in
  `docs/tfa-wiki-watch.md` (the cloud routine is retired; run it by hand on
  request). Release history is on the Updates page (`data/updates.ts`).
- **Plugin:** "Boss Helper Bank Sync" 1.2 is on the RuneLite Plugin Hub
  (merged 2026-10-13). `plugin/HUB_PENDING.md` lists what is merged here but
  not yet shipped there — nothing at the moment. A Hub release needs ENice's
  go-ahead.
- **Next work:** `docs/ROADMAP.md` — the raid rework (one setup per raid
  route, team-size scaling), the open TFA follow-ups, phone support. Player
  requests from the launch thread are in `docs/feedback/2026-10-reddit-launch.md`.
- **Positioning:** the teaching app (phases, phase-aware DPS, "why this
  gear"). GearScape owns pure bank→best-setup optimisation: acknowledge it
  openly, never claim novelty for the bank→DPS loop.
- **Public posts:** the 2026-10-12 r/2007scape launch post was removed by the
  mods (rule 9: no AI-generated content). Read the feedback doc before
  planning any public post. Its action items are all closed (2026-10-14).
