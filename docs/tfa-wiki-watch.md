# Wiki watch: keeping The Fractured Archive data current

A cloud Claude routine runs **every 4 hours** (00:00, 04:00, 08:00, 12:00,
16:00, 20:00 UTC) and checks the OSRS Wiki for new or changed information
about The Fractured Archive (Raids 4): boss stats and phases, item stats and
mechanics, and the raid's reward list. When it finds something it can verify,
it applies it to the site, pushes to `main` (which deploys), and adds a short
patch release signed **"From AI"** on the Updates page. ENice set this up on
2026-10-20, the raid's launch day, so the site keeps up while the wiki is
still being filled in. No email, no review step: the routine ships.

The routine lives at https://claude.ai/code/routines (name: "OSRS Boss Helper
TFA wiki watch"). This file is the contract it works to.

## What it checks

`data/vendor/wiki/tfa-watch.json` lists the wiki pages and the revision id each
was last checked at. The routine asks the wiki API for the current revids
(`api.php?action=query&prop=revisions&rvprop=ids|timestamp&titles=...`), reads
only the pages that moved (raw wikitext via `rvprop=content&rvslots=main`),
and writes the new revids back in the same commit as any data change. It also
checks the raid page's Rewards section and the Chest page for items not yet
in the list, and adds them to the list.

## What it may change

- **Boss stats** in `data/monsters/supplemental.ts`, transcribed from the
  `{{Infobox Monster}}` template exactly as the file's header describes
  (attributes, weakness, defence bonuses, flat armour, HP, levels, size, new
  phases/versions). New bosses go in the same file plus
  `data/monsters/categories.ts` (`tfa`).
- **Item stats** in `data/items/supplemental.ts` from `{{Infobox Bonuses}}`,
  plus the tables that gate them: `data/items/requirement-overrides.ts`,
  `data/ammo-compatibility.ts`, `data/items/bolt-procs.ts`,
  `data/items/charged-items.ts`, `data/items/powered-staff-spells.ts`. New
  items also need an icon at `public/icons/items/<id>.png` (fetch the wiki
  file through the API's `imageinfo` URL with a descriptive User-Agent).
- **Mechanics the engine already models**, when the wiki states them as fact
  on the boss/item page (not "appears to"): damage caps
  (`data/monsters/damage-cap.ts`), per-style damage scales
  (`data/monsters/style-damage-scale.ts`), demonbane vulnerability
  (`data/monsters/demonbane-vulnerability.ts`), mechanic phases
  (`data/bosses/mechanic-phases.ts`), spec weapons (`data/spec-weapons.ts`),
  and the Obligator rules in `data/items/obligator.ts`.
- Once weirdgloop/osrs-dps-calc ships an entry (`npm run refresh-vendor`),
  the build drops the hand-authored copy automatically; delete it then.

## What it must not do

- Invent or estimate a number. A blank infobox field stays blank; an
  "appears to" / "seems to" sentence on a strategy page is not a source.
- Touch anything outside the data files above, their tests, the catalogs the
  build regenerates, `data/updates.ts`, `package.json`, `package-lock.json`
  and `tfa-watch.json`. No engine rewrites: a mechanic the engine cannot
  express goes in the note under "Still waiting on" and in `docs/ROADMAP.md`.
- Reword ENice's notes, or write as him. Its releases carry `author: "ai"`.
- Push when anything fails. `npm run build-data`, `npm run typecheck`,
  `npx vitest run` and `npx eslint <changed files>` must all pass first.

## The "From AI" release

One patch bump (0.x.y → 0.x.y+1) per run that changed something; nothing is
written when nothing changed. The block goes at the top of `RELEASES` in
`data/updates.ts` with `author: "ai"`, `changes: []`, and a `note` in this
shape, modelled on Blizzard / StarCraft patch notes but far shorter:

```ts
{
  version: "0.1.2",
  date: "2026-10-20",            // America/New_York
  title: "Raids 4 wiki check: Bork, Moia and Dreadnoth updated",
  author: "ai",
  note: [
    "Wiki check at 00:10 UTC, 21 Oct. Numbers below are from the OSRS Wiki boss pages.",
    { heading: "Bosses" },
    [
      { lead: "Bork", text: "flat armour 12 → 10. The Smorks gain 2 flat armour." },
      { lead: "Moia", text: "now 80% weak to Air." },
    ],
    { heading: "Items" },
    [{ lead: "Obligator", text: "..." }],
    { heading: "Still waiting on" },
    [{ lead: "Dagon'hai Elder and Monks", text: "no stats on the wiki yet." }],
  ],
  changes: [],
}
```

Rules: one dated one-liner first; a heading per area actually touched
(Bosses, Items, Mechanics), omitting empty ones; one bullet per change, the
entity as `lead`, the change as a terse before → after; a final "Still
waiting on" list of known gaps. No hype, no apologies, no "I". Update
`tests/fractured-archive.test.ts` when a number it asserts changes.

Commit as `release: vX.Y.Z (From AI: <title>)`. The `release:` prefix keeps
the push out of the weekly patch-notes log, so the Thursday draft does not
repeat what the note already said.
