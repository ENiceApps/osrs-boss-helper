# Bank-Driven Gear Optimizer — Build Plan

## Goal

Replace the hand-curated loadout system with a **bank-driven gear optimizer**:
the player pastes their bank tag, the app computes the highest-DPS loadout they
can build from what they own, ranks affordable upgrades by DPS-gained-per-GP,
and surfaces the "sell X to afford Y" path. Classic example: a player with a
rune crossbow vs Vorkath should automatically see "upgrade to DHCB (+X% DPS)
for ~Ygp."

---

## Phase status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | ✅ Done | Data foundations |
| 1 | ✅ Done | Loadout-from-raw-items bridge |
| 2 | ✅ Done | Optimizer core (bank-only mode) |
| 3 | ✅ Done | Budget + upgrade finder |
| 4 | ✅ Done | Spec-weapon catalog + per-boss recommendations |
| 5 | ✅ Done | UI overhaul (v0 — Own / GP / Sell modes wired to boss page) |
| 6 | ✅ Done | Verification / regression |

---

## Phase 0 — Data foundations ✅

### 0.1 — Item equip requirements
- **Source:** OSRS Wiki skill-level tables (`Attack/Weapons table`,
  `Armour/Melee|Ranged|Magic armour`) + targeted prose fallback for
  ranged/magic weapons.
- **Artifact:** `data/vendor/wiki/item-requirements.json` (1,712 items scraped).
- **Generator:** `scripts/scrape-requirements.py` — run once on demand, like
  `npm run refresh-vendor`. Re-run when new gear releases.
- **Overrides:** `data/items/requirement-overrides.ts` — hand-verified
  corrections (Masori-f defence=80, Barrows gloves=none, Void 42-all+prayer 22).
- **Catalog:** `ItemCatalogEntry.requirements` field added in
  `build-item-catalog.ts`; 1,720 items now carry requirements.
  Emitted as `JSON.parse(...)` to avoid TS2590 complexity limit.

### 0.2 — Conditional-bonus engine generalized
- `lib/dps/vorkath.ts` renamed → **`lib/dps/conditional.ts`**.
- `VorkathBonusFlags` → **`ConditionalBonusFlags`** throughout.
- `vorkathBonuses` field → **`conditionalBonuses`** in calculate/loadout/recommend/UI.
- **New flags** (calibrated against weirdgloop `PlayerVsNPCCalc.ts`):
  - `demonbane` — Arclight (19675) / Emberlight (29589) vs `demon` → +70%
    accuracy + damage, **additive** (`value + trunc(value×70/100)`).
  - `salveAmulet` — Salve amulet (4081) / (i) (12017) vs `undead` → ×7/6
    (distinct from the enchanted `salveAmuletEi` ×6/5).
- `BONUS_TRIGGER_ITEM_IDS` in `data/loadouts/sets.source.ts` extended.
- 45/45 tests pass.

---

## Phase 1 — Loadout-from-raw-items bridge ✅

- **Module:** `lib/optimize/scenario.ts`
- **Export:** `scoreScenario({ itemIds, target, skills, attackStyle?,
  baseSpellMaxHit?, spellElement? }) → { valid: true, loadout, dps,
  activeBonuses } | { valid: false, reasons[] }`
- **Validation pipeline** collects ALL reasons before returning (no early bail):
  unknown item ID, slot collision, equip requirements vs player skills,
  missing weapon, 2H+shield conflict, ammo class/tier mismatch, illegal
  weapon-style combo.
- **Style auto-pick** when not supplied: ranged → rapid; Powered Staff →
  accurate (magic); Staff → longrange (spell mode); melee → best-offensive
  attackType ranked by target's defence bonuses.
- **Synthesises a real `LoadoutSet`** so `computeSetDps` and
  `activeBonusesForTarget` work unchanged downstream.
- **Parity verified:** scratch DHCB+Salve(ei) loadout vs Vorkath produces
  the same DPS as the `ranged-end-dragonbane-undead` curated set (7.771).
- **Tests:** 8 in `tests/optimize-scenario.test.ts`; 53/53 total tests pass.

### Phase 1 cleanup ✅ — ranged-defence dispatch bug fixed

The original `lib/recommend.ts:defenceBonusForSet` hardcoded `rangedHeavy`
for every ranged loadout. Fixed by:
- Adding `weaponCategory?: string` to `LoadoutSet` (in `types/loadout.ts`)
- Populating it in `scripts/build-loadouts.ts`, `lib/loadout-edit.ts`,
  and `lib/optimize/scenario.ts` from the weapon's catalog `category`
- `defenceBonusForSet` now passes `set.weaponCategory` to
  `rangedDefenceBonusFor`, which dispatches to heavy / standard / light
  based on the existing case table (Crossbow → heavy, Bow → standard,
  Thrown/Blowpipe → light)

Curated Tbow / Blowpipe / BoFa DPS shifted as expected against Vorkath:
- `ranged-end-universal-tbow`: dps=6.749 (Bow → standard bucket)
- `ranged-end-universal-blowpipe`: dps=7.779 (Thrown → light bucket)
- `ranged-end-universal-bofa`: dps=5.591 (Bow → standard bucket)

These numbers are not yet locked against `tools.runescape.wiki/osrs-dps`.
**TODO before Phase 2 ships:** add Tbow / Blowpipe / BoFa wiki baselines
to `tests/vorkath-presets.verify.test.ts` so future regressions are caught.

---

## Phase 2 — Optimizer core (bank-only) ✅

- **Module:** `lib/optimize/bank.ts`
- **Export:** `optimizeForBoss({ bank, target, skills, topN?, baseSpellMaxHit?, spellElement? }) → { rankings: ScoredScenario[], diagnostics }`
- **Algorithm:** Greedy K=1 per non-weapon slot, enumerated across every (weapon × non-defensive style) combo. Augmented with force-include branches for conditional-bonus items (DHCB / DHL / Salve / Salve(ei) / Arclight / Emberlight / Tbow / Tome of Fire) so they don't get pruned by raw-bonus dominance. Per-slot scoring: `2 × strContribution + accuracyContribution` (str weighted higher because max-hit grows linearly while accuracy plateaus).
- **Dedupe key:** `(attackType/choice + sorted itemIds)` — same gear, different style stays distinct.
- **Cost:** ~10-20 candidates per typical bank; <100ms.
- **Notable finding from acceptance tests:** Tbow + Salve(ei) on Vorkath (8.06 DPS) beats DHCB + Salve(ei) (7.77 DPS). The optimizer surfaces this hidden synergy that's missing from the curated set library — exactly what the project was built for. The engine applies Tbow scaling AFTER Salve per wgloop's order of operations.
- **Tests:** 8 in `tests/optimize-bank.test.ts`; 61/61 total tests pass.

### Phase 2 limitations (worth knowing before Phase 3)

- **K=1 greedy** could miss niche cases where two suboptimal items combine to beat their independently-best counterparts. Mitigation: force-includes cover the known conditional-bonus items. If we discover more hidden synergies, bump K to 2 or 3 (Cartesian still tractable at low K).
- **Per-slot scoring weights** (2× str vs 1× accuracy) are a starting heuristic, not principled. At low accuracy levels (e.g. low-level player or very-high-defence boss) accuracy is worth more than str. Phase 6 verification will tell us if the weights need to be DPS-aware (i.e., differentiated against the target).
- **Magic loadouts need `baseSpellMaxHit`** passed in. The optimizer doesn't auto-select a spell for staves; Phase 5 UI will need to expose this.

### Design decisions to make before building

- **Search strategy** — exhaustive per-slot best, or greedy with
  weapon-style branching? Greedy is tractable (~5300 items × 11 slots);
  exhaustive is not (product space).
- **Style enumeration** — for each candidate weapon, try every legal
  (attackType, choice) combo, or trust `scoreScenario`'s auto-pick?
  Auto-pick is heuristic — e.g. a spear's best attackType depends on the
  target's lowest defence bonus.
- **Conditional-bonus awareness** — weapons/amulets that flip bonuses
  (DHCB vs dragon, Salve vs undead, Arclight vs demon, Tbow scaling)
  must not be pruned by raw bonus dominance; force-try them against
  compatible targets.

---

## Phase 3 — Budget + upgrade finder ✅

- **Module:** `lib/optimize/budget.ts`
- **Export:** `findUpgrades({bank, target, skills, gp, mode, sellThreshold?, priceLookup, maxIterations?, baseSpellMaxHit?, spellElement?}) → BudgetResult`
- **Three modes:** `own-only` (passthrough), `gp-only` (wallet only), `sell-to-fund` (wallet + sell value of bank items not in current best, above threshold).
- **Algorithm — iterative greedy:** each round, find every catalog item the player can afford, equip, and that would improve DPS as a single-slot swap; commit the best DPS/GP; in sell-to-fund mode, displaced bank items add to budget; repeat until no profitable affordable upgrade exists (capped at `maxIterations`, default 8).
- **Output:** `{ currentBest, upgradedBest, upgradePath: UpgradeStep[], totalCostGp, totalDpsDelta, sellList, remainingGp }`. Each step has the bought item, the displaced item, before/after DPS, delta, and dps/gp ratio.
- **Tests:** 9 in `tests/optimize-budget.test.ts`; 70/70 total tests pass.

### Demo output (Vorkath, mid-tier ranged bank, 500M GP)

Starting DPS 1.79 → 7.73 (4.3× improvement, 497M spent):
1. Diamond bolts (e), 500 gp → +2.19 DPS (massive ratio — cheapest no-brainer)
2. Dragonfire ward, 12M gp → +0.54 DPS
3. Dragon hunter crossbow, 130M gp → +2.77 DPS
4. Masori body (f), 130M gp → +0.20 DPS
5. Venator ring, 95M gp → +0.06 DPS
6. Masori mask (f), 60M gp → +0.15 DPS
7. Zaryte vambraces, 70M gp → +0.03 DPS

### v1 known limitations (Phase 3 v2 backlog)

- **Cross-style upgrades not explored** — the candidate eval keeps the current loadout's `attackStyle` and lets `scoreScenario` reject incompatible combos. A player with a pure melee bank wouldn't see "buy a Tbow to switch to ranged" suggestions. Fix later by also exploring a "would optimizeForBoss prefer a different style with this item added" branch per candidate.
- **Empty-bank early-out** — if the bank has no valid loadout (e.g., no weapon), the algorithm returns an empty result instead of bootstrapping from the catalog. Acceptable for v1; Phase 5 UI can prompt the user to buy a starter weapon first.
- **`dpsPerGp` display granularity** — for big-ticket items, raw ratio is 1e-9 ish. Phase 5 UI should format as "DPS per 1M GP" or similar.

---

## Phase 4 — Spec-weapon catalog + per-boss recommendations ✅

- **Modules:**
  - `types/spec-weapons.ts` — `SpecWeapon`, `BossSpecRecommendation`, `SpecRole` types. 9 roles (defence-reduction, dps-spike, healing, freeze-stun, prayer-management, anti-prayer, self-buff, aoe, true-max).
  - `data/spec-weapons.ts` — catalog of 51 combat-relevant spec weapons (BGS, DWH, claws, Voidwaker, DDS, AGS, SGS, ZGS, Tonalztics, Arclight/Emberlight/Darklight, etc.). Each entry: itemId, name, specName, energyCost, effect summary, role.
  - `data/bosses/spec-weapons.ts` — per-boss recommendations for 17 bosses (Vorkath, KBD, Cerberus, GWD quartet, Zulrah, Corp, demonic gorillas, dag-rex, wildy bosses, KQ, hydra, sire). Slug-keyed; same pattern as `mechanics.ts`.

- **Design call:** **No scraper script.** The `/w/Special_attack` data was pulled once via WebFetch and hand-curated. Reasons: data is small (~50 entries); spec weapon design changes rarely (Jagex adds maybe 2/year); the actually-valuable data — per-boss recommendations — is *inherently* hand-curated because the wiki doesn't have it in structured form. The wiki link is documented in the catalog file header for future refresh; a future scraper would be ~40 lines if anyone wants one.

- **Tests:** 17 in `tests/spec-weapons.test.ts`. Verifies every itemId resolves against `ITEM_CATALOG`, every recommendation references a real spec weapon, every boss slug exists in `MONSTER_BY_SLUG`, role tagging spot-checks. 87/87 total tests pass.

- **NOT in DPS math** — per the original priority Z. Phase 5 UI will add a "Recommended spec weapons" card to the boss page that reads from this data.

### Coverage gaps worth filling later
- Only 17/234 bosses have curated recommendations. Add more as needed (TOB / TOA / Cox bosses, Nightmare, slayer bosses).
- Skipped weapons: Statius's warhammer + Vesta's + Morrigan's (PvP-only, not in equipment catalog), Enhanced Excalibur (quest-locked variant not in catalog).
- "Skilling" specs (Lumber Up, Fishstabber, Rock Knocker, Toxic Siphon when not for healing) intentionally excluded — Phase 4 is combat-only.

---

## Phase 5 — UI overhaul ✅ (v0 shipped)

- **New components:**
  - `components/SpecWeaponsPanel.tsx` — reads `data/bosses/spec-weapons.ts`, renders Phase 4 recommendations with item icons, spec name/cost, role tag, per-boss note. Marks owned items when a bank is present. Renders nothing for uncurated bosses.
  - `components/OptimizerPanel.tsx` — full Phase 2 + Phase 3 surface. Mode toggle (Own only / With GP / Sell to fund), budget controls (GP from PlayerSetup, sell-threshold slider 0–50M), results: headline DPS card, best-loadout strip, ranked upgrade path with item icons + DPS-per-million-GP ratio, sell list with values.
- **Layout:** `app/boss/[slug]/page.tsx` — SpecWeaponsPanel goes into the right column with mechanics; OptimizerPanel is a new full-width section above the existing `SetupComparisonPanel`. Curated sets remain below as a "verified meta build" reference.
- **Number formatting:** `fmtGp` shows GE-style B/M/K abbreviations; `fmtDpsPerM` converts the raw 1e-9 ish `dpsPerGp` ratio into "DPS gained per million GP" for readable ordering.
- **State:** mode + sellThreshold are owned inside OptimizerPanel; bank + gp come from page. `findUpgrades` runs in a `useMemo` keyed on the inputs.
- **Empty states handled:** no bank → optimizer shows "paste your bank tag" message; uncurated boss → spec panel hides; no profitable upgrades → footer prompts to try sell-to-fund mode.
- **Smoke-tested:** `/boss/vorkath` renders both new panels + retained curated comparison; `/boss/abhorrent-spectre` (uncurated) renders optimizer only, no spec panel, no crash. 87/87 tests still pass.

### Deferred to Phase 5 v1
- **Dream BIS mode** — would run `optimizeForBoss` with the full catalog as bank to surface absolute-best loadouts ignoring ownership. Cheap to add (~30 lines); skipped in v0 because the curated SetupComparisonPanel below already serves the "what's the meta build?" question.
- **Per-item sell-list deselect** — user wants the option to keep specific items off the sell list. Currently the sell list is informational only.
- **Visual polish** — upgrade path is information-dense; could use color-coding by DPS gain magnitude. Equipment grid integration for the optimizer's pick would let the user see the rec in the existing 11-slot widget (currently a flat icon strip).
- **Cross-style upgrade exploration** in `findUpgrades` (Phase 3 v2 backlog) — UI is ready when the algorithm catches up.

---

## Phase 6 — Verification / regression ✅

- **New curated set:** `ranged-end-dragonbane-undead-tbow` — Tbow + Salve(ei) + Masori-f. Surfaced by the bank optimizer (Phase 2), wiki-verified at 8.058 DPS on Vorkath, **beats DHCB + Salve(ei) (7.77 DPS) by +3.7%**. Now visible to users browsing the Vorkath page alongside the other curated sets.
- **Locked-in wiki baselines** in `tests/vorkath-presets.verify.test.ts`:
  - `ranged-end-universal-tbow` (Tbow + anguish): 6.751 — wiki-verified 2026-06-02
  - `ranged-end-dragonbane-undead-tbow` (Tbow + Salve(ei)): 8.058 — wiki-verified 2026-06-02
- **Optimizer rediscovery anchor** — already exists in `tests/optimize-bank.test.ts`: "DHCB+Salve(ei) bank → #1 result on Vorkath matches the curated set's engine DPS." Confirms the bank optimizer never silently regresses past curated quality.
- 88/88 tests pass (was 87, +1 verify for the new curated set).

### Skipped — user choice
- Cross-boss anti-regression baselines (K'ril for demonbane math, Kree'arra for Tbow scaling on high-magic targets, etc.). Vorkath suite is the only safety net for engine changes; non-Vorkath branches rely on the optimizer/budget acceptance tests.

### Still unverified vs wiki tool (future work)
- `ranged-end-universal-blowpipe` (Toxic blowpipe set)
- `ranged-end-universal-bofa` (Bow of Faerdhinen set)
- Engine output for both is recorded in `project_optimizer_phase.md`; just needs a wiki tool run to lock baselines.

---

## Key engine facts (don't reinvent these)

| Fact | Where |
|------|-------|
| Demonbane is ADDITIVE: `value + trunc(value×70/100)` | `lib/dps/conditional.ts` |
| Magic defence uses `target.magicLevel`, not `defenceLevel` | `lib/recommend.ts:targetDefenceLevelFor` |
| Ranged defence has 3 buckets: heavy/standard/light | `lib/loadout.ts:rangedDefenceBonusFor` |
| Default prayers (Piety/Rigour/Augury) per style | `lib/recommend.ts:DEFAULT_PRAYERS` |
| Item→flag map | `data/loadouts/sets.source.ts:BONUS_TRIGGER_ITEM_IDS` |
| `requirements` uses lowercase keys matching `Skills` type | `data/items/catalog.ts:ItemCatalogEntry` |
| Weapon → legal (attackType, choice) combos | `data/weapon-styles.ts:findWeaponStyle` |
| 2H flag | `ItemCatalogEntry.isTwoHanded` |
