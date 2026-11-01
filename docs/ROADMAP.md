# Roadmap: next items

Features ENice wants built next. Ideas only: nothing here is started unless it
says so. Newest first. Player feature requests from the Reddit launch live in
`docs/feedback/2026-10-reddit-launch.md`.

- **Raid rework** (named 2026-10-20, the day The Fractured Archive came out).
  Today every raid encounter is just another boss on the roster, grouped by a
  CoX / ToB / ToA / TFA category chip. The rework is a raid-aware view: pick a
  raid, pick a team size, and get ONE setup (or a small switch set) that covers
  the whole run, built from your bank, instead of a per-boss setup for each
  room. Scope notes so far:
  - Covers all four raids: Chambers of Xeric, Theatre of Blood, Tombs of
    Amascut and The Fractured Archive. TFA is the first target since its
    bosses were added as standalone entries on launch day and the raid is a
    pseudo-linear "pick a door" route (Ezekiel or Bork+Smorks, Moia or
    Dreadnoth, Xarth or the Dagon'hai), so the setup should follow the route
    the player picks.
  - Team-size HP scaling for the raid bosses (the catalog carries the wiki's
    base stats; TFA scales HP to the party, minimum two-player scaling).
  - Reuses the hybrid / switch-count optimiser (the "how many gear switches"
    control) across rooms rather than within one fight.
  - ToA invocation level, CoX challenge mode and ToB hard mode as inputs.
- **TFA follow-ups** (2026-10-20): the Rondache Shield Bash, the elemental
  fragments (+2 base max hit per element) as a player toggle, and Defence
  reduction (DWH / BGS / Elder maul specs) with the 60% floor the 21 Oct
  hotfix gave the Archive Guardian, Bork, Ezekiel, Moia, Xarth and Ocellus.
  Mechanics checklists for the TFA rooms. Done 2026-10-21: the Dagon'hai
  Elder / Monks (wiki stats landed that evening). Done the same day: the Obligator's
  best-of-2-to-4 damage rolls, size bonus and thrust-vs-smash choice
  (`data/items/obligator.ts`, engine `damageRolls`), and Zorya's tome's
  special attack in `data/spec-weapons.ts`. Done 2026-10-26 (wiki check):
  the tome's spec name (Zorya's flow) and 50% cost, Dreadnoth's 75% demonbane
  resistance, Ocellus Phase 2 as a stat phase. Done 2026-11-01 (v0.2.0):
  weirdgloop shipped TFA on 24-27 Oct, so the tome now uses its formula
  (trunc(Magic/3) − 10), Ocellus and Xarth carry its 20% demonbane
  resistance, the Ascension crossbows halve bolt proc chances, and the seven
  side NPCs (Undead binder, Jelly, Corpse, the three Voids, the Imp) are in
  the catalog under TFA. Still open: the Obligator's size-bonus placement and
  3-tile line hit; Bork's flat armour (8-14) and magic resistance (0-6) that
  scale with the Smorks' health (upstream now has a `magic_resistance` slot
  and a 60% Defence floor for the TFA bosses, both worth mirroring with the
  Defence-reduction work); the 28 Oct 50% cap on offensive stat drains at
  Ocellus, Xarth and Dreadnoth. Next vendor refresh: upstream's JSON drops
  every hand-authored TFA entry, but its 24 Oct snapshot is behind the wiki
  on Moia (785 → 1900 HP), Ezekiel (130 → 200 Defence), Xarth and the
  Dagon'hai bonuses — carry those as STAT_OVERRIDES in the build script.
- **Phone support** (named at the v1.0.0 launch, 2026-10-09).
- **Raid builds** (named at the v1.0.0 launch, 2026-10-09). Folded into the
  raid rework above.
