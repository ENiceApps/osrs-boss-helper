# Roadmap: next items

Features ENice wants built next. Ideas only: nothing here is started unless it
says so. Newest first. Player feature requests from the Reddit launch live in
`docs/feedback/2026-10-reddit-launch.md`.

## Whole-fight mode for multi-phase bosses (added 2026-10-13, not started)

**The idea, in ENice's words:** when you prep for Zulrah you aren't prepping for
one phase, you're prepping for the whole fight. So the app should let you prep
for the whole fight, and hybrid armour should help pick your equipment for the
whole fight too.

**Where the app is today:** a multi-phase boss is scored one phase at a time.
Phases come from two places: stat versions in `data/monsters/catalog.ts`
(`phases`, e.g. Zulrah's forms) and mechanic states in
`data/bosses/mechanic-phases.ts` (e.g. the Tormented Demon shield). You pick a
phase and get the best gear for that phase. The hybrid optimizer
(`lib/optimize/hybrid.ts`) shares armour across styles under a switch budget,
but it scores against a single target, and the style weights are set by hand.

**What "whole fight" would add:**
- A **Whole fight** option next to the per-phase picker on bosses with more than
  one phase.
- Phases weighted by how much of the fight each one takes up (for example
  Zulrah's green/red/blue forms), so the result is the best setup for the kill,
  not for one form.
- Hybrid armour scored across the whole fight. Each phase brings its own
  target and the style that suits it, so the switch-budget dial answers: "with
  N switches, what do I wear for the entire Zulrah kill?" The weights would come
  from the fight instead of being set by hand.
- One gear list for the fight: shared pieces plus the switches, so it reads
  like a real inventory.

**Open questions for when it's built:**
- Where the per-phase time shares come from (wiki rotations, hand-tuned per boss,
  or a slider), and whether to show that number to players.
- Whether the headline number is time-weighted DPS or an estimated kill time.
- Which bosses get it first. Zulrah is the obvious test case. Others that
  already have phase data: Abyssal Sire, Yama, Doom of Mokhaiotl, Hueycoatl,
  Tormented Demons.

## Earlier ideas still open

- **Phone support** (named at the v1.0.0 launch, 2026-10-09).
- **Raid builds** (named at the v1.0.0 launch, 2026-10-09).
