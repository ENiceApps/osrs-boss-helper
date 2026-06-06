# OSRS Boss Helper — RuneLite plugin

Syncs your bank, skills, and GP to the boss-helper web app running on
`localhost:3000`. Posts a JSON payload to `POST /api/bank` whenever:

- The plugin starts and you log in (initial sync)
- Your bank contents change (item added, removed, deposited, withdrawn)
- Your skill levels change (rare — usually only after a level-up)

The web app uses this to drive the bank optimizer, upgrade finder, and
sell-to-fund mode. No data leaves your machine.

## Status

**Skeleton, not a working plugin yet.** This folder contains the Java source
and a protocol spec. You (or someone with RuneLite plugin-dev experience)
need to wire it into a real Gradle/Maven project, build a JAR, and sideload
it into RuneLite. See the build/sideload section below.

The web-side endpoint at `app/api/bank/route.ts` is already live and tested.
You can verify it works with `curl` before touching Java code (see the
"Test without the plugin" section).

## Protocol

The plugin POSTs the following JSON to `http://localhost:3000/api/bank`:

```json
{
  "items": [
    { "id": 21012, "qty": 1 },
    { "id": 9243, "qty": 200 },
    { "id": 27235, "qty": 1 }
  ],
  "skills": {
    "attack": 99,
    "strength": 99,
    "defence": 99,
    "ranged": 99,
    "magic": 99,
    "hitpoints": 99,
    "prayer": 99
  },
  "gp": 500000000,
  "playerName": "MyDisplayName"
}
```

**Field notes:**
- `items` — flatten the bank + worn equipment into one array. The optimizer
  treats both as "owned." Quantity is accepted but not used yet; future
  versions may use it for sell-value computation.
- `skills` — base levels (not boosted). 1–99 each. All 7 combat skills
  are required.
- `gp` — sum of coins (item 995) in inventory + bank coin slot.
- `playerName` — optional. Shown in the UI as "Live bank: PlayerName".

**Response:**
```json
{ "ok": true, "itemCount": 327, "receivedAt": 1717420000000 }
```

CORS is open (`Access-Control-Allow-Origin: *`) for localhost convenience.

## Test without the plugin

Before building Java, verify the endpoint works:

```bash
curl -X POST http://localhost:3000/api/bank \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"id":21012,"qty":1},{"id":9243,"qty":200},{"id":27235,"qty":1},{"id":22109,"qty":1},{"id":12018,"qty":1},{"id":27238,"qty":1},{"id":27241,"qty":1},{"id":26235,"qty":1},{"id":13237,"qty":1},{"id":28310,"qty":1},{"id":22002,"qty":1}],
    "skills":{"attack":99,"strength":99,"defence":99,"ranged":99,"magic":99,"hitpoints":99,"prayer":99},
    "gp":50000000,
    "playerName":"TestPlayer"
  }'
```

Then refresh `http://localhost:3000/boss/vorkath` — the banner at the top
should say "● Live bank · TestPlayer · synced 5s ago" and the optimizer
should show the DHCB+Salve loadout.

## Build & sideload (when you're ready for the Java side)

You'll need:

- **JDK 11+** (RuneLite requires 11; 17 works fine)
- **IntelliJ IDEA Community** (free, has Gradle/Maven built-in)
- A clone of [runelite/example-plugin](https://github.com/runelite/example-plugin)

Steps:

1. Clone the example plugin, rename the package to something like
   `com.osrsbosshelper`, and replace `ExamplePlugin.java` with the contents
   of `src/main/java/com/osrsbosshelper/BankSyncPlugin.java` from this
   folder.
2. In `build.gradle.kts`, the example plugin already lists OkHttp 4 and
   Gson — both bundled with RuneLite, no extra deps needed.
3. Run RuneLite in developer mode:
   ```bash
   ./gradlew runClient -Pruntime=...
   # OR launch RuneLiteFromMaven with VM flag --developer-mode
   ```
4. Click the plugin's icon in the side panel to enable it. Look at the
   RuneLite logs for `BankSyncPlugin: posted N items` to confirm it's
   running.

For production / Plugin Hub distribution, see
https://github.com/runelite/plugin-hub.

## Files in this folder

- `src/main/java/com/osrsbosshelper/BankSyncPlugin.java` — the plugin
  entry point. Reads bank/skills/GP, POSTs to the web app on changes.
- `src/main/java/com/osrsbosshelper/BankSyncConfig.java` — config schema
  (endpoint URL, enable/disable). Surfaced in RuneLite's config UI.

Both files are heavily commented; treat them as a starting point and
iterate against the live `/api/bank` endpoint as you go.
