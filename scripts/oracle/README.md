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
(Piety / Rigour / Augury — mirrors our `DEFAULT_PRAYERS`), `onSlayerTask` off
unless a combo opts in (the `ontask-` ordering combos do), and the Kandarin
Hard diary ON — our engine always applies its ×1.1 enchanted-bolt proc chance
(the worker forced it off until 2026-10-03, unnoticed until the first
enchanted-bolt combos).

## Usage

```bash
npm run oracle:setup        # one-time: clone wgloop @ pinned SHA + yarn install (slow)
npm run oracle              # validation set — oracle-matrix fixtures + multiplier-order combos
npm run oracle -- --all     # also print the rows that match
npm run oracle -- --only=ontask   # filter combos by id substring
npm run oracle -- --sweep --style=magic --limit=60   # broad sweep, one shard
npm run oracle -- --sweep --style=ranged
npm run oracle -- --sweep --style=melee
npm run oracle -- --optimize --limit=20              # oracle-check the APP's own
                                                     # recommended loadout per boss
```

`--optimize` is the highest-value sweep: it runs `optimizeForBoss` (owns-everything
bank) per boss and oracle-checks the loadout the app actually recommends — so it
validates real user-facing gear, not a fixed reference set. (First catch: the
optimizer recommending `speed: 0` holiday items like "Christmas dinner" as BIS.)

Both engines are fed identical item stats: the harness replays our
`data/items/stat-overrides.ts` into the clone, so divergences are engine logic,
not data version.

Exit code is non-zero when any combo diverges beyond tolerance (maxHit must match
exactly; accuracy ±0.0015; dps ±0.5% or ±0.02, whichever is looser) — usable as
a CI gate once green. Combos with `strictDps` hold DPS to ±0.05% with no
absolute slack: at Corp's ~0.5 dps the ±0.02 would hide gaps of several percent.

Every row prints both attack rolls (ours is recovered from our hit chance and
wgloop's defence roll). Combos with `exactRoll` (the multiplier-order set) fail
with `ROLL` when the rolls differ at all — a truncation-order bug moves the roll
by a point or two, well inside the accuracy tolerance. A combo can carry a
`knownDpsResidual` reason; its DPS gap is then printed as a note, not a failure.

`ORACLE_DETAILS=1 npm run oracle -- --only=<id>` keeps wgloop's step-by-step
trace (`details`: label → value) in `.oracle/io/results.json` — the quickest way
to see where a divergent row splits.

**Side effect:** running the clone's jest lets its Next 14 config "patch" the
nearest `package-lock.json` (adds `@next/swc-win32-ia32-msvc`) — ours, when the
clone sits under this checkout. Revert it (`git checkout -- package-lock.json`)
before committing.

## Multiplier-order combos

`orderingCombos()` in `combos.ts` pins the ORDER multipliers apply in — every
factor truncates, so order moves results by ~1 max hit or a few roll points.
One combo per pairing, with gear varied so the base lands where the two orders
disagree: on-task slayer helm (i) vs DHL / Granite hammer / Barronite mace /
Leaf-bladed battleaxe / Arclight / Ursine chainmace / DHCB / Webweaver / DHW /
Dark Demonbane / Twinflame; Salve variants per style (melee DHL, ranged DHCB,
magic Kodai); Inquisitor's and Obsidian with Salve; smoke staves; Elite Void
magic. The same set pins two weapon families' factors. The Keris rows check
×133/100 (not ×4/3), the amascut partisan's ×115/100 and its weaker stats
outside ToA. The Accursed / Thammaron's sceptre rows check the built-in spell
and the ×3/2 after the mask. The `powered-staff-` combos pin the magic stance
bonus (Accurate +2 on magic's +9, Longrange +0; the engine had +3 on Accurate
until 2026-10-03). Their wgloop numbers are locked in
`tests/multiplier-order.test.ts`. Targets avoid non-zero flat armour, so the
max hit shows the multiplier order alone (flat armour has its own combos,
below).

For a Keris vs a Kalphite, wgloop's `getMax()` is the 1/51 triple hitsplat, so
the comparator (and the locked test) triples our max hit before comparing.

## NPC-mechanic combos

`npcMechanicCombos()` in `combos.ts` covers what wgloop does to a hit after it
is rolled. `armour-` combos check flat armour (every accurate melee/ranged
hitsplat becomes max(0, d − armour)) on each mean branch: single hit, each
Scythe hitsplat, Torag's two halves, the Dual macuahuitl's sequential halves,
Dark bow, the Keris triple, the fang's trimmed roll, and ruby / diamond / opal bolt procs, on
both signs. `flying-` combos check melee immunity against flying targets
(Polearm / Salamander exempt, Vespula never). Their wgloop numbers are locked
in `tests/npc-mechanics.test.ts`. A combo can carry `knownMaxHitResidual`
when the max-hit difference is by design (bolt procs, the fang); its max-hit
gap is then printed as a note.

## Corp combos

`corpCombos()` in `combos.ts` checks the Corporeal Beast's halving, which
wgloop applies to EACH hitsplat (`divisionTransformer(2)` in getAttackerDist:
after the multi-hit split, the bolt effects and the accurate-zero raise, before
ruby bolts and the NPC transforms). One `corp-` combo per mean branch: single
hits on an odd and an even pre-halving max (whip 41 / 40), Torag's halves, the
Scythe's three hitsplats, the Dual macuahuitl's sequential halves, Dark bow,
seeking arrows' floor of 3 (Scorching bow, Dark bow), all six enchanted bolts on
the Armadyl crossbow, and corpbane controls (stab spear / fang, magic) at full
damage. They run with `strictDps`; their wgloop numbers are locked in
`tests/corp-halving.test.ts`. The fang's halved trimmed roll (slash) has no
combo: upstream's Stab Sword "Slash" is Aggressive, ours Controlled, so the
worker can't match the stance — the unit tests cover it.

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
`contract.ts` and re-run `oracle:setup` to pick up upstream changes. Keep it at
the same upstream commit our vendored data was synced from: upstream renamed
items (e.g. "Tome of fire" → "Tome of Fire") in Aug 2026, so an older engine
silently misses bonuses on the newer item names (it zeroed the Zulrah tome row
until the pin moved from 2dfed70 to 89c3e25).

## Known divergences (validation set, as of first run)

These are candidate engine bugs the oracle found, **not** harness errors — base
math (e.g. demonbane melee accuracy) matches wgloop to 4 decimals, so divergences
localize to specific mechanics:

- ~~**Standard-spellbook cast speed** — magic DPS ×5/4 too high.~~ **FIXED**
  (`lib/dps/magic-cast-speed.ts`).
- ~~**Obsidian + Berserker necklace** — damage under-modelled (36 vs 43).~~
  **FIXED** (`berserkerObsidian` in `lib/dps/calculate.ts`). ~1.3% dps residual
  remains from wgloop's distribution flooring on the necklace ×6/5 — minor.
- ~~**Void set** — accuracy ~0.4% high.~~ **FIXED** — void now applies ×11/10 to
  the effective level, not the roll (`accuracyOnEffectiveLevel`).
- ~~**Inquisitor's set** (47 vs 46)~~ — was data skew (clone had pre-buff item
  stats); **resolved** by replaying our stat-overrides into the worker. Matches
  exactly now. Our engine was correct all along.
- **Twisted bow with no arrows** — fixture omits ammo; the app always fills it.
  Not an engine bug.
- ~~**Multiplier order** — Salve / slayer helm vs weapon banes, magic Salve and
  smoke-staff percents, Inquisitor's / Obsidian / Elite Void magic placement.~~
  **FIXED** 2026-10-03 (`lib/dps/calculate.ts`); see the ordering combos.
- ~~**Twinflame second cast** — DPS 1.3–2.0% high (mean taken as ×7/5 of the
  max hit).~~ **FIXED** 2026-10-03 — exact per-roll mean of
  [h, trunc(h × 4/10)] (`lib/dps/twinflame.ts`). The ~0.2% that was left
  (wgloop raising accurate 0s to 1) is fixed too — see "Accurate zeros" under
  Known gaps, below.

## Known gaps (sweeps, as of 2026-10-03 @ 89c3e25)

Pre-existing modelling gaps the sweeps surface — not harness errors:

- ~~**Flat armour**~~ **FIXED** 2026-10-03 — `defensive.flat_armour` is in the
  catalog (`defenceBonuses.flatArmour`) and shifts every accurate melee/ranged
  hitsplat (`lib/dps/flat-armour.ts`).
- ~~**Flying monsters**~~ **FIXED** 2026-10-03 — melee scores 0 unless the
  weapon is a Polearm / Salamander; Vespula never (`isFlyingImmuneToMelee`).
- ~~**Ranged Accurate damage** — +3 added to accuracy only, so max hits ran 1
  low at some bases (Rune crossbow vs Vorkath: 35 vs 36).~~ **FIXED**
  2026-10-03 — the +3 joins the ranged strength effective level too.
- **Sanguinesti staff** always shows `MAXHIT` (e.g. 39 vs 47): wgloop reports
  the distribution max, which includes the 1/5 +8 proc; ours is the base max.
  Base max hit, accuracy and DPS match — keep it out of exact combos.
- ~~**Accurate zeros** — wgloop raises every accurate 0-damage hit to 1, adding
  `acc / (max + 1)` to the mean hit; DPS ran low by `2 / (max × (max + 1))`.~~
  **FIXED** 2026-10-03 (`landedFloorLift` in `lib/dps/common.ts`): raised per
  hitsplat in upstream's order (after bolts / Berserker / Keris / Sanguinesti,
  before the Twinflame split, Corp, ruby bolts, Mad Angel, phase factors and
  flat armour), with seeking arrows' floor of 3, the fang's trimmed roll and
  integer multi-hit splat maxes. Obsidian + Berserker still runs ~1.3% high:
  wgloop truncates the ×6/5 per hit.
- **Bolt-proc and fang max hits** — wgloop's max hit includes the proc hit
  (ruby / diamond / opal) and is the fang's trimmed normal max; ours is the
  normal hit / the fang's true max (the UI derives the fang's normal max).
  DPS matches; combos carry `knownMaxHitResidual`.
- ~~**Corporeal Beast halving** — upstream halves each rolled hitsplat
  (`divisionTransformer(2)`); we halve the max hit and take half of that.
  For an even pre-halving max M the mean of trunc(X/2) over 0..M is
  k²/(2k+1) (M = 2k), so ours runs ×(M+1)/M high; odd M is exact. Split
  weapons compound it: we split the halved max (Torag's 39 → 19 → 9 + 10),
  upstream halves each 0..19 / 0..20 half (+5.6% vs Corp).~~ **FIXED**
  2026-10-03 — vs Corp every mean branch rolls from the pre-halving max and
  halves each landed hitsplat in upstream's order (`corpHalving` in
  `lib/dps/calculate.ts`), and a split weapon's max hit halves per half (Dual
  macuahuitl 42 → 10 + 10 = 20, not 21). Was: whip (max 40) +2.5%, Torag's
  (max 40) +5.0%, Scythe +4.2%, Dual macuahuitl +2.1%, seeking arrows
  +2.9% / +3.8%; the `corp-` combos now match to float precision.
- ~~**Corp × enchanted bolts** — upstream applies opal / pearl / dragonstone /
  diamond / onyx BEFORE the Corp halving, so their bonus damage is halved
  too; we add the full proc on top of the halved max (ACB vs Corp: opal
  +11.4%, dragonstone +8.0%, pearl +6.9%, onyx / diamond +2.3%). Ruby fires
  after the halving upstream as well (+0.7% here).~~ **FIXED** 2026-10-03 —
  the bolt effect rolls off the pre-halving max and is halved with the hit
  (an opal's +9 on a roll of 10 lands trunc(19/2) = 9), a missed opal / pearl
  bonus is halved too, and ruby lands whole after the halving
  (`transformedBoltDamagePerAttack` in `lib/dps/bolts.ts`). Was, on the
  `corp-acb-` combos: opal +20.4%, dragonstone +8.8%, pearl +6.0%, diamond
  +2.0%, ruby +0.8%, onyx −0.3%.
- **Harness: Tormented Demon** — the worker's TD instance reports accuracy
  1.0000 (max hits match ours), so TD rows can't be oracle-checked yet. The
  shield's ×4/5 minimum-1 transform is covered by the unit tests instead.
- ~~**Keris partisan** — no style mapping; ×4/3 instead of ×133/100.~~
  **FIXED** 2026-10-03 (Partisan styles, ×133/100 / ×115/100, the amascut
  partisan's out-of-ToA stats, and the Keris dagger's passive).
- ~~**Accursed / Thammaron's sceptre** — no built-in spell formula (max hit
  0).~~ **FIXED** 2026-10-03 (`data/items/powered-staff-spells.ts`).

## Caveat — data version skew

Our item catalog applies `data/items/stat-overrides.ts` on top of vendored data
to track live OSRS rebalances (e.g. the Inquisitor's buff). The wgloop clone
reads its own pinned `cdn/json/equipment.json`, which can predate those changes.
When a divergence is a clean ±1 on a single rebalanced item, suspect data skew
before an engine bug — verify the item's stats match live OSRS. A future
hardening is to feed the worker our final (overridden) item stats.
