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
Open your bank in-game once after login so RuneLite knows its contents.

The file is small JSON:

```json
{ "version": 1, "rsn": "Name", "gp": 0, "skills": { "attack": 99, ... },
  "items": [ { "id": 4151, "qty": 1 } ], "updatedAt": 1700000000000 }
```

## Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| Write bank file on change | **off** | Opt-in toggle. Off until you enable it. |
| Min write interval (ms) | `2000` | Throttle so a "deposit all" doesn't write repeatedly. |
| App web page | the hosted app URL | Opened by the sidebar button. |

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

Because this plugin **makes no network requests and only writes inside the
RuneLite directory**, it does not "expose player information over HTTP" and meets
the Data & Privacy restriction that the previous network-sync design could not.
It's also opt-in by default, permissively licensed (BSD-2), Java 11, and free of
template cruft.

Before any Hub submission, set a real `author` in `runelite-plugin.properties`.

## License

BSD-2-Clause — see [LICENSE](LICENSE).
