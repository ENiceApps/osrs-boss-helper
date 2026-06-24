# Sharded oracle sweep — background-agent kickoff prompts

Copy one block per agent. Each runs **one combat style** so three can triage in
parallel without overlapping. They start cold (only this repo), so each prompt is
self-contained.

> Run these only **after** the validation set (`npm run oracle`) is green, so the
> oracle is known-trustworthy before fanning out.

---

## Shared setup (all shards)

```
This repo has a DPS oracle that cross-checks our DPS engine against the real
weirdgloop calc engine (the code behind dps.osrs.wiki). Read
scripts/oracle/README.md first.

One-time bootstrap (clones + installs the wgloop engine into .oracle/, ~2 min):
  npm run oracle:setup        # use npm.cmd on Windows

Each row prints our engine's maxHit/acc/dps next to wgloop's. A divergence means
our engine disagrees with the wiki calc. Tolerances: maxHit exact, accuracy
±0.0015, dps ±0.5%.
```

---

## Shard 1 — MELEE

```
<shared setup above>

Run:  npm run oracle -- --sweep --style=melee --limit=80

For each diverged row, determine whether it's (a) a real bug in our DPS engine
(lib/dps/*, lib/recommend.ts, lib/optimize/scenario.ts, data/armor-sets.ts), or
(b) a known parity gap (e.g. a set bonus we intentionally model differently).

Group findings by ROOT CAUSE, not by boss — most divergences repeat across many
bosses from one shared cause. For each root cause report: the mechanic, the
formula gap (ours vs wgloop), affected combos, and a one-line fix sketch. Do NOT
edit engine code — produce a findings report only.

Known starting point: Obsidian set + Berserker necklace damage looks
under-modelled; Inquisitor's crush bonus looks over-credited. Confirm and find
more.
```

---

## Shard 2 — RANGED

```
<shared setup above>

Run:  npm run oracle -- --sweep --style=ranged --limit=80

Same triage as melee. Pay attention to: ammo handling (a bow with no arrows
yields 0 on wgloop), bolt-proc expected damage (lib/dps/bolts.ts), Twisted bow
scaling (lib/dps/calculate.ts), and Void ranged set rounding (the validation set
shows a ~0.4% accuracy gap).

Group by root cause. Findings report only — no engine edits.
```

---

## Shard 3 — MAGIC

```
<shared setup above>

Run:  npm run oracle -- --sweep --style=magic --limit=80

Known systematic bug to CONFIRM and bound: standard-spellbook magic DPS is ×5/4
too high on every boss — our engine uses the staff's 4-tick weapon speed instead
of the 5-tick spell autocast speed. Find where attackSpeedTicks is set for a
regular staff casting a standard spell (lib/optimize/scenario.ts builds the
LoadoutSet; the engine reads set.attackSpeedTicks). Verify maxHit + accuracy
still match (they should — only the per-cast time is wrong).

Then look beyond it: powered staves (Trident/Shadow), Tome of Water/Earth,
Twinflame, demonbane spells. Group by root cause. Findings report only.
```

---

## After the shards report back

Collect the per-style findings, dedupe by root cause, and decide fix order
(systematic bugs affecting many bosses first — the magic cast-speed one tops the
list). Then fix on a branch with the oracle as the regression gate:
`npm run oracle` must stay green for the validation set after each fix.
