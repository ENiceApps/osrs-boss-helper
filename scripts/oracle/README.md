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

## Twisted bow combos

`twistedBowCombos()` in `combos.ts` checks the Twisted bow's scaling (upstream
PlayerVsNPCCalc L566-573 / L744-748, `tbowScaling` L2429-2438): the bow scales
off min(cap, max(Magic level, magic attack bonus)), cap 250 (350 vs Xerician),
with the bonus percents clamped to 140% accuracy / 250% damage. One combo per
way the input is reached: Great Olm's head (Magic 250 under the Xerician cap:
141% → 140%), Commander Zilyana (Magic 300 → 250), Araxxor (magic attack 260
over Magic 190), Nylocas Vasilias (600 over 50) and Zebak (215 over 100, under
the cap). They run with `exactRoll`, which is what catches the clamp (the
roll moves under 1%); their numbers are locked in `tests/twisted-bow.test.ts`.
The engine had no clamp and read the Magic level alone until 2026-10-03.

## Melee immunity and Zulrah cap combos

`npcImmunityAndCapCombos()` in `combos.ts` checks two NPC rules. `immune-`
combos: upstream's isImmune (PlayerVsNPCCalc L2057-2060) scores melee 0 vs
IMMUNE_TO_MELEE_DAMAGE_NPC_IDS (constants.ts L347-354) — TzKal-Zuk, the
Kraken, the Leviathan, Jal-MejJak, and Zulrah unless the weapon is a Polearm
(the Scythe isn't). `zulrah-` combos: applyNpcTransforms' first transform
(L1937-1940), `cappedRerollTransformer(50, 5, 45)`, turns every hitsplat over
50 into 45-50 — a Twisted bow (66), a Tumeken's shadow, a Noxious halberd (the
halberd exemption) and a Zaryte crossbow's ruby proc (110; wgloop's max is the
capped proc, ours the normal hit). Their numbers are locked in
`tests/npc-immunity-and-caps.test.ts`.

The worker honours `bossVersion` since these combos: `getTestMonsterById`
takes the FIRST entry with an id, and the Leviathan's 12214 is both
"Post-quest" (our default) and "Awakened" (Defence 287 vs 250), so the
Leviathan row compared different stat blocks until the worker re-picked by
name + version.

## Kraken ranged combos

`krakenRangedCombos()` in `combos.ts` checks the Kraken's ranged ÷7
(applyNpcTransforms L1945-1948, `divisionTransformer(7, 1)` for 'Kraken' and
'Cave kraken' when the style is ranged): every ranged hitsplat of at least 1
lands max(1, trunc(d/7)), misses included (an opal bonus on a miss lands 1).
One combo per ranged mean branch: a Blazing blowpipe (max 26 → 3), the Armadyl
crossbow's ruby (the proc of 51 lands 7), diamond and opal bolts, Dark bow's
two arrows, the Cave kraken, and a Trident of the swamp as the magic control.
wgloop's bolt max hits include the proc (`knownMaxHitResidual`). Their numbers
are locked in `tests/kraken-ranged.test.ts`. The spec-max display in the
results panel takes the same transforms (and Zulrah's cap) per spec hit.

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
- ~~**Twisted bow with no arrows** — fixture omits ammo; the app always fills
  it. Not an engine bug.~~ **FIXED** 2026-10-03 — the `tbow-cerberus` fixture
  carries Dragon arrows now and matches wgloop exactly.
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
- ~~**Twisted bow scaling** — no 140% / 250% clamp (141% accuracy at magic
  250, 150% at a Xerician 350), and only the Magic level read, never the magic
  attack bonus (Araxxor 190 instead of 260 → 250: max 57 vs 66).~~ **FIXED**
  2026-10-03 — the catalog carries `magicAttackBonus` and the engine scales off
  the clamped max (`lib/dps/twisted-bow.ts`); see the Twisted bow combos.
- **P2 Wardens** (Elidinis' / Tumeken's Warden "Active", 11753/11754/11756/
  11757): upstream forces accuracy to 1 and turns the attack roll into a
  15-40% damage modifier (`applyP2WardensDamageModifier`), and the Twisted
  bow's accuracy scaling applies TWICE there (a game behaviour since
  2023-06-21). None of it is modelled: Tbow vs Elidinis' Warden Active is
  8.631 dps here, 10.167 upstream (max 62 vs 37, accuracy 0.83 vs 1).
- ~~**Zulrah's damage cap** — upstream rerolls every hit over 50 into 45-50
  (`cappedRerollTransformer(50, 5, 45)`); we don't, so big hitters run high
  (Tbow + Dragon arrows: max 66 vs 50, 6.746 vs 6.209 dps).~~ **FIXED**
  2026-10-03 — every hitsplat over 50 lands 45-50 (mean 47.5) in upstream's
  order: after the accurate-zero raise, Corp and ruby bolts, before the phase
  factor and flat armour; the max hit is capped per hitsplat
  (`lib/dps/damage-cap.ts`, `data/monsters/damage-cap.ts`). A Zaryte
  crossbow's ruby proc of 110 lands 47.5 too (was 5.730 dps, now 4.355).
- ~~**Per-NPC immunities** — upstream's `isImmune` lists (e.g. melee vs Kraken,
  TzKal-Zuk, Jal-MejJak, the Leviathan, Zulrah bar polearms, the Abyssal
  portal) aren't modelled; only leafy / flying are.~~ **FIXED** 2026-10-03
  for melee — IMMUNE_TO_MELEE_DAMAGE_NPC_IDS scores melee 0 there, Zulrah
  bar a Polearm, so the Scythe is 0 at Zulrah too (`npcMeleeImmunity` in
  `data/monsters/melee-reach.ts`). The Kraken's Whirlpool (496) isn't on
  upstream's list, so it isn't on ours. The ranged / magic immunity lists
  (Tekton, Dusk, the Glowing crystal, the Warriors' Guild cyclopes) and the
  Aviansies' non-salamander list (dead upstream: the flying check returns
  first) are still unmodelled.
- ~~**Kraken ranged ÷7** — upstream's applyNpcTransforms (L1945-1948) divides
  every ranged hitsplat on the Kraken and Cave kraken by 7, minimum 1
  (`divisionTransformer(7, 1)`; the wiki: ranged "deals 1/7th of its normal
  damage"). Not modelled, so ranged runs ×7 high there — and with melee now
  0 the optimizer's Kraken pick is a Blazing blowpipe: 11.437 dps here, 1.495
  upstream (max 29 vs 4). Magic is the real pick.~~ **FIXED** 2026-10-03 —
  every ranged hitsplat lands max(1, trunc(d/7)) (a miss stays 0), after the
  Zulrah cap and before the phase factor and flat armour
  (`data/monsters/style-damage-scale.ts`, `lib/dps/npc-transforms.ts`); the
  Kraken's pick is magic again (Harmonised staff + Earth Surge, 10.812 here,
  10.817 upstream — the gap is the Confliction gauntlets, below). See the
  Kraken ranged combos.
- **Confliction gauntlets** — upstream models the one-handed magic attack
  after a miss rolling accuracy twice (BaseCalc
  getConflictionGauntletsAccuracyRoll: hit chance d/(1 + d − s), d the
  double-roll chance, s the single); we don't, so magic picks wearing them
  run a little low (Harmonised staff + Fire Surge vs Zulrah:
  accuracy 0.9350 vs 0.9386, 10.233 vs 10.273 dps; vs the Kraken 0.04%).
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
