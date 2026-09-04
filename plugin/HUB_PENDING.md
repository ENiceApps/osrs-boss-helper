# Pending Plugin Hub release

Changes to the plugin that are merged here in the monorepo but **not yet
shipped to the RuneLite Plugin Hub**. We batch these into one Hub PR rather
than sending the maintainers a PR per tweak.

**Hub currently serves:** standalone-repo commit `e275b7d5a7e42ab8511424c72a74809d17619d23`
(plugin 1.1, merged via [plugin-hub PR #15936](https://github.com/runelite/plugin-hub/pull/15936)
on 2026-09-03).

## Unreleased changes

_None — the Hub is in sync with `plugin/`._

_Add future plugin changes above this line as they land._

## Shipped 2026-09-03 (PR #15936, standalone `e275b7d`, plugin 1.1)

- **Remember the bank across sessions** (2026-09-02) — `collectAndWrite` rebuilt
  the item list purely from live containers, and `InventoryID.BANK` is null until
  the player opens a bank that session. So the first inventory/equipment change
  after login rewrote `bank.json` with worn+carried items only, wiping the bank
  out of the file until the next bank visit. The plugin now keeps a bank cache:
  seeded on enable by reading the previous file's `accounts` section, refreshed
  on every write where the container is live, and carried forward verbatim when
  it isn't. The first write on enable is deferred until the read-back finishes,
  so it can't clobber the cache it's about to use.
- **Snapshots are per account** (same change) — keyed by lowercased RSN and all
  written to the file's `accounts` section. A single-slot cache would have had
  the opposite failure: logging into an alt writes that alt's (empty) bank to
  the file, and the main's remembered bank would be gone by the next RuneLite
  restart. Now an alt neither inherits nor erases it.
- **Bank file v2** (same change) — added `bank` / `equipment` / `inventory`
  sections (needed to tell a cached bank apart from worn gear next session),
  plus `bankGp`, `bankUpdatedAt`, `bankCached` and `accounts` for staleness
  reporting and per-account memory.
  `items` is still written as the merged pool, so every version of the web app
  already out there keeps working against a v2 file. A v1 file can't seed the
  cache — it has no separate bank section — so upgrading costs one bank visit.
- **One extra chat line** (same change) — when the bank in the file is
  remembered rather than freshly read, the enable-time confirmation adds
  "Using your bank from last time — open your bank to refresh it."
- **Version bumped to 1.1** in `runelite-plugin.properties`.

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
