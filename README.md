# OSRS Boss Helper

Pick any Old School RuneScape boss and get a **DPS-optimised gear loadout built
from your own bank**, plus the mechanics and special-attack weapons that matter
for the fight.

> **Not affiliated with Jagex Ltd.** Old School RuneScape is a trademark of
> Jagex. This is a fan-made, third-party tool. All game data comes from the
> [OSRS Wiki](https://oldschool.runescape.wiki/).

---

## What it does

- **Boss catalog** — every monster in the game with ≥ 200 HP (~235 targets),
  searchable, on one dynamic page (`/boss/[slug]`).
- **Bank-driven optimizer** — given the items you own, your skills, and your GP,
  it builds the highest-DPS setup it can from *your* gear (no canned "BiS" sets).
  It compares Melee / Ranged / Magic and picks the winner.
- **Accurate DPS engine** — a from-scratch reimplementation of the OSRS combat
  formulas (effective levels, attack/defence rolls, max hits, and multipliers
  like the Salve amulet, Dragon hunter gear, void, slayer helm, elemental tomes,
  bolt procs, multi-hit weapons, Tumeken's shadow, the Twisted bow curve, …),
  cross-checked against the community DPS calculator
  ([weirdgloop](https://tools.runescape.wiki/osrs-dps/)) by an
  [oracle harness](scripts/oracle/).
- **Budget mode** — set a GP cap (and optionally allow selling current gear to
  fund upgrades) and see the best setup you could buy, with an upgrade path.
- **Fight mechanics** — per-boss checklists that turn green/red against your
  setup (anti-dragonfire, anti-venom, melee reach, …), plus spec-weapon picks.
- **Local bank bridge (optional)** — a companion RuneLite plugin writes your
  bank/inventory/worn gear/skills/GP to a **local file**, which the app reads in
  your browser. See [Data & trust model](#data--trust-model).

There's also an **item browser** (`/items`) with sortable bonuses and live GE
prices, and **shareable loadout links** that encode a setup into a URL.

## How it works (data flow)

```
   OSRS Wiki Real-time Prices API  ──►  Next.js app (read-only server proxy adds the
        (GE prices, item mapping)        wiki-required User-Agent; caches briefly)
                                              │
   RuneLite plugin ──► bank.json  ──►  your browser  ──►  DPS engine + optimizer
   (optional, opt-in)  (local file)   (reads the file    ──►  recommended loadout
   reads your game      in .runelite   locally; nothing
   state, no network    directory      is uploaded)
```

**There is no backend that stores or even receives your bank.** The plugin
writes a file on your machine; the browser reads it locally. Without the plugin
(or without connecting the file), the app runs in **Budget mode** — pick a boss
and it builds the best setup for a GP cap, so you can try every feature with no
setup.

## Data & trust model

The RuneScape community rightly scrutinises any tool that reads game data, so
here is exactly what happens — see [SECURITY.md](SECURITY.md) for the full
write-up.

- **Your data never leaves your computer.** The plugin makes **no network
  requests**; it only writes `bank.json` inside your RuneLite directory. The web
  app reads that file in your browser. Nothing is uploaded to any server.
- **What the plugin reads:** your bank + inventory + worn equipment item IDs and
  quantities, your seven combat skill levels, your GP total, and your character
  name. **It only reads game state — it never modifies your bank or anything in
  the client.** (Source: [`plugin/src/.../BankSyncPlugin.java`](plugin/src/main/java/com/osrsbosshelper/BankSyncPlugin.java).)
- **No account, no login, no password.** There's nothing to sign into.
- **The only thing the app server does** is proxy read-only OSRS Wiki prices and
  relay the optional in-app feedback form. Neither touches your game data.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- [SWR](https://swr.vercel.app/) for GE price fetching
- The browser [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API)
  to read the local bank file (with a manual-import fallback)
- A [RuneLite](https://runelite.net/) plugin (Java) for the local bank bridge — see [`plugin/`](plugin/)

No database, no auth service, no server-side state.

## Local development

```bash
npm install
cp .env.example .env.local   # optional — only needed for GE prices / feedback email
npm run dev                  # http://127.0.0.1:3000
```

The app runs fully without any env vars — they only enable live GE prices and the
feedback email relay.

## Environment variables

All optional; documented in [`.env.example`](.env.example):

| Variable | For | Notes |
|----------|-----|-------|
| `WIKI_USER_AGENT_CONTACT` | GE prices | Contact info the OSRS Wiki requires in the User-Agent. |
| `RESEND_API_KEY` | feedback email | [Resend](https://resend.com/) key. Blank in dev → feedback prints to the console. |
| `EMAIL_FROM` | feedback email | Verified sender address. |
| `FEEDBACK_TO` | feedback inbox | Where in-app feedback is emailed. |

No secrets are committed — `.env*` is gitignored (only `*.example` is tracked).

## Project structure

```
app/            Next.js routes & API endpoints
  api/          wiki price/mapping proxies (read-only) + feedback relay
  boss/[slug]/  the one dynamic boss page every boss shares
components/     React UI (panels, modals, the equipment grid, BankConnect, …)
lib/
  dps/          the combat/DPS math engine
  optimize/     the bank-driven loadout optimizer
  localBank.ts  reads the plugin's local bank.json (File System Access API)
  liveBank.ts   adapts the local bank into the shape the UI consumes
data/           static game data (weapon styles, mechanics, spells, …)
  */catalog.ts  GENERATED — do not hand-edit (see below)
scripts/        data-build codegen + the DPS oracle harness
plugin/         the RuneLite local-bridge plugin (Java/Gradle)
tests/          Vitest unit + regression tests
```

### Generated data — don't hand-edit

The item and monster catalogs (`data/items/catalog.ts`,
`data/monsters/catalog.ts`) are **generated** from vendored OSRS Wiki data by the
build scripts and regenerated on every build:

```bash
npm run build-data   # runs automatically before build & test
```

## Testing

```bash
npm test          # Vitest unit + regression suite
npm run typecheck # tsc --noEmit
npm run lint      # eslint
npm run oracle    # cross-check the DPS engine against the real wiki calculator
```

## Security

See [SECURITY.md](SECURITY.md). TL;DR: no backend receives your data, no
third-party tracking, and the RuneLite plugin only writes a local file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

- The web app is licensed under the **MIT License** — see [LICENSE](LICENSE).
- The RuneLite plugin is licensed under the **BSD-2-Clause License** (RuneLite's
  convention) — see [plugin/LICENSE](plugin/LICENSE).
