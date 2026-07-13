# Pending Plugin Hub release

Changes to the plugin that are merged here in the monorepo but **not yet
shipped to the RuneLite Plugin Hub**. We batch these into one Hub PR rather
than sending the maintainers a PR per tweak.

**Hub currently serves:** standalone-repo commit `2a4bfa5c7c8e988b366600f021f5dd9e0b5a6b4e`
(merged via [plugin-hub PR #13728](https://github.com/runelite/plugin-hub/pull/13728)
on 2026-07-13).

## Unreleased changes

_None — the Hub is in sync with `plugin/`._

_Add future plugin changes above this line as they land._

## Shipped 2026-07-13 (PR #13728, standalone `2a4bfa5`)

- **Trailing-edge write throttle** (monorepo commit `10f12b7`, 2026-07-02) —
  the 2s throttle was leading-edge only, so the *last* container change in a
  burst (e.g. the end of a deposit-all) was silently dropped and `bank.json`
  stayed stale until the next change or relog. Changes landing inside the
  window now schedule one trailing write at the window's end (RuneLite's
  shared `ScheduledExecutorService`; the pending task is cancelled in
  `shutDown`).
- **Skip qty-0 items** (same commit) — bank placeholders are reported with
  quantity 0 and aren't owned; `addContainerItems` now filters them out of the
  payload.
- **Quieter chat confirmations** (2026-07-03) — the full 3-line setup message
  (with the bank.json path and connect instructions) previously replayed on
  every plugin enable/toggle. It now appears only when the write actually
  *creates* bank.json for the first time; when the file already exists, the
  player gets a single short "[Boss Helper] Bank file updated." line instead
  (still once per enable, so active banking doesn't spam chat).

## Release procedure (when ready)

1. Re-run the subtree split so the standalone repo matches `plugin/`:
   `git subtree split --prefix=plugin -b hub-sync`
2. Push `hub-sync` to `ENiceApps/boss-helper-bank-sync` `main` and note the
   new HEAD commit hash.
3. Sanity-check the standalone repo builds: `./gradlew build`.
4. Open one plugin-hub PR updating `plugins/boss-helper-bank-sync`'s
   `commit=` line to the new hash, with a short summary of the batched
   changes (the "Unreleased changes" list above is the PR body).
5. After merge, update this file: move the shipped items under a dated
   "Shipped" note (or delete them) and record the new pinned commit.
