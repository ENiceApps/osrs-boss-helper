# Patch notes

The app ships player-facing release notes **once a week**, and ENice signs off
on them before they go out.

## How it flows

1. **Every push to `main` is logged.** `.github/workflows/patch-notes-log.yml`
   appends the pushed commits to `unreleased.md` on the **`patch-notes`
   branch**. It's a separate branch so the log never adds commits to `main`,
   which would mean extra deploys and push races between sessions.
2. **Thursday 9am ET, a cloud Claude routine drafts the release.** It reads
   the log and the commits, writes player-facing notes, and bumps the version
   using the rules in `data/updates.ts`. It also archives the week here as
   `vX.Y.Z.md`, all on a `release/vX.Y.Z` branch, and emails ENice the notes
   for review. The log is never edited: each archive lists the commits it
   covers, and that's how the next week knows where to pick up. Vercel builds a preview of the release
   branch, so the Updates tab can be checked before anything goes live.
3. **Nothing reaches `main` until ENice approves.** To ship, tell any
   osrs-boss-helper Claude session "ship release vX.Y.Z" (it merges the branch
   into `main` and pushes), or merge it on GitHub. To change the wording, reply
   to the email or edit the branch first.

If a week's release is never approved, the next Thursday folds its notes into
the new draft. Nothing gets lost.

## Files here (on `main`)

- `vX.Y.Z.md`: the archived raw log and final notes for each shipped release.
