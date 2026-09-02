# Boss Helper Bank Sync (RuneLite plugin)

A companion RuneLite plugin for the [OSRS Boss Helper](https://osrsbosshelper.com) web app. It
writes your bank, inventory, worn equipment, combat skills, and GP to a **local
file** that the web app reads in your browser, so it can recommend gear and
compute DPS from what you actually own.

## What it does — and does not — do

- **Reads game state only.** It never modifies your bank, inventory, equipment,
  or any interface. No automation, no input injection.
- **Makes no network requests.** Your data is written to a local file and never
  leaves your computer. There is no server, no account, no token.
- **Never sees your password.** It uses RuneLite's API for game data only.

## How it works

When enabled, the plugin writes (atomically) to:

```
<your RuneLite directory>/osrs-boss-helper/bank.json
```

- Windows: `C:\Users\<you>\.runelite\osrs-boss-helper\bank.json`
- macOS/Linux: `~/.runelite/osrs-boss-helper/bank.json`

The web app then reads that file locally (via the browser's File System Access
API on Chrome/Edge/Brave, or a manual "Import bank.json" on other browsers).

Open your bank in-game once so RuneLite can read its contents — after that the
plugin **remembers it**. RuneLite forgets the bank on every logout, but the
plugin keeps the last bank it saw in the file and carries it forward, so closing
the game (or the app) no longer empties your gear list. Opening a bank again
just refreshes that section. The remembered bank is tied to the account name it
came from, so logging into an alt neither shows nor erases your main's items —
each account's bank is remembered separately.

The file is small JSON:

```json
{ "version": 2, "rsn": "Name", "gp": 0, "skills": { "attack": 99, ... },
  "items": [ { "id": 4151, "qty": 1 } ],
  "bank": [ { "id": 4151, "qty": 1 } ], "equipment": [], "inventory": [],
  "bankGp": 0, "bankUpdatedAt": 1700000000000, "bankCached": false,
  "accounts": { "Name": { "rsn": "Name", "bank": [ ... ], "bankGp": 0,
                          "bankUpdatedAt": 1700000000000 } },
  "updatedAt": 1700000000000 }
```

`items` is the merged pool of everything you own (bank + worn + carried) and is
what the app reads; the per-container sections are what let the next session
tell your bank apart from what you happen to be wearing. `bankUpdatedAt` is when
the bank itself was last read in-game, and `bankCached` says whether this file's
bank section is remembered rather than freshly read — the app uses both to show
how stale your bank is. Everything above `accounts` describes the account you're
logged into; `accounts` holds the remembered bank of every account that has
banked with the plugin, which is what keeps playing an alt from erasing your
main's.

One caveat worth knowing: a remembered bank is a snapshot, not the truth. If you
bank on mobile or in another client, the file keeps showing what the plugin last
saw until you open a bank in RuneLite again — which is what the app's "bank last
read" line is there to tell you.

## Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| Save my bank & gear for the web app | **off** | The only setting — an opt-in toggle. Off until you enable it. |

Writes are throttled to one per 2 seconds (hardcoded) so a "deposit all" doesn't
rewrite the file repeatedly, and the sidebar button always opens
[osrsbosshelper.com](https://osrsbosshelper.com) (also hardcoded).

## Building & testing

```bash
./gradlew build      # compile + unit checks (Java 11)
./gradlew run        # launch a dev RuneLite client with the plugin side-loaded
```

Plugin behaviour can only be verified by a human in the actual client — there is
no automated game test. To log in to the dev client, follow RuneLite's
["Using Jagex Accounts"](https://github.com/runelite/runelite/wiki/Using-Jagex-Accounts)
guide.

> ⚠️ Do not use automation tools to interact with the game — automating input
> violates Jagex's third-party client rules and can get your account banned.

## Plugin Hub status

**Live on the RuneLite Plugin Hub** — search "Boss Helper Bank Sync" in the
in-client Plugin Hub. The canonical source for the Hub build is the standalone
repo [ENiceApps/boss-helper-bank-sync](https://github.com/ENiceApps/boss-helper-bank-sync);
this `plugin/` directory is the same code vendored into the app monorepo (synced
via `git subtree split`).

Because the plugin **makes no network requests and only writes inside the
RuneLite directory**, it does not "expose player information over HTTP" and meets
the Hub's Data & Privacy restrictions. It's also opt-in by default, permissively
licensed (BSD-2), and Java 11.

## License

BSD-2-Clause — see [LICENSE](LICENSE).
