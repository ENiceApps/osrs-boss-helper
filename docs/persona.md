# Design persona: Tomas

The one player OSRS Boss Helper is designed for. Every design, copy and feature
decision gets checked against him (see "Design mirror" in `AGENTS.md`).

**Status:** approved by ENice, 2026-11-22.

**This is a hypothesis.** Real player feedback and analytics override it. When
they contradict it, edit this file and add a changelog line.

## Evidence

Public data on who plays OSRS is thin. There is no current, OSRS-specific
survey. Each claim below is marked **sourced** (with how strong the source is)
or **assumed**.

| Claim | Status | Source |
| --- | --- | --- |
| Players are now adults around 33 with jobs and about 41 minutes free in an evening | Sourced, weak: headline only, article body not read, about RuneScape overall | [GamesRadar, RuneScape CEO interview](https://www.gamesradar.com/games/mmo/stating-no-lies-runescape-ceo-says-the-mmos-players-used-to-be-angsty-16-year-olds-listening-to-breaking-benjamin-now-its-33-year-old-accountants-and-ceos-whove-got-41-minutes-in-an-evening) |
| About half of active OSRS players joined in the last 5 years and started with Old School | Sourced: Jagex CEO Jon Bellamy, reported second-hand | [MeinMMO, 2026-08-10](https://mein-mmo.de/en/all-mmos-are-fighting-for-new-players-a-13-year-old-classic-has-apparently-found-the-cheat-code-for-it,1581781/) |
| Returning players are the second-largest group; day-one veterans are a minority | Sourced: same interview | same |
| 84% men, 16% women | Sourced, old: Jagex survey of all RuneScape players, 2014 | [RuneScape Wiki: Players](https://runescape.wiki/w/Players) |
| The game is at record size: 240,756 concurrent on 2025-08-03, about 250,000 reported in April 2026 | Sourced | [GamesRadar](https://www.gamesradar.com/games/mmo/with-a-new-record-240-000-players-online-old-school-runescape-is-roughly-8x-bigger-than-its-sister-mmo-and-would-be-the-fourth-biggest-game-on-all-of-steam-if-not-for-a-technicality), MeinMMO above |
| Ironmen are a small minority (6.68% in Feb 2017) | Sourced, weak: fan site, 9 years old | [theburningofrome.com](https://www.theburningofrome.com/advices/what-percentage-of-osrs-players-are-ironman/) |
| Mid-game players without best-in-slot gear get the most from the app | Sourced: our own launch thread (vi3z) | `docs/feedback/2026-10-reddit-launch.md` |
| GearScape feels hard to use for less experienced players; several prefer the wiki calc because it is easy | Sourced: launch thread (Nexion21, fefect123, brprk, Solo_Jawn) | same |
| Players want Slayer monsters, inventory loadouts and in-game recommendations | Sourced: launch thread requests | same |
| The community distrusts anything that reads as AI-written | Sourced: launch thread, post removed under rule 9 | same |
| RuneLite on desktop is his main client; he uses his phone for lookups | Assumed. No usage share found for RuneLite or mobile | none |
| Combat level, bank value, bosses done, weekly hours | Assumed | none |

**Not found:** an OSRS age distribution, RuneLite or mobile share, the share of
players who have done each boss or raid. If site analytics or a community
census turn up, they replace the assumptions here.

## The person

**Tomas, 31.** Works full time in an office job. Lives with his partner.

- **History:** started OSRS in 2022 after watching YouTube videos. He never
  played as a kid, so he has no old habits or old knowledge to lean on.
- **Play time:** about 45 minutes on weeknights, a longer session on the
  weekend. Roughly 8 hours a week. Every session has to feel like progress.
- **Account:** a main (not an ironman). Combat 112, base 85+ combat stats,
  bank around 250m. Fire cape done, quest cape close.
- **Bosses so far:** Barrows, Vorkath, Zulrah (shaky), a few God Wars trips
  with a friend, entry-mode Tombs of Amascut. Has never done Chambers,
  Theatre of Blood or The Fractured Archive. He wants to.
- **Devices:** RuneLite on a desktop PC with one monitor. His phone sits next
  to the keyboard and is where he looks things up mid-session.
- **Tools he uses now:** the wiki (constantly), YouTube guides, the wiki DPS
  calc when someone links a setup. He has opened GearScape and closed it.

## What he comes for

1. **"What do I wear with what I own?"** He does not have best-in-slot gear and
   guides assume he does.
2. **"What should I buy next?"** He has 250m and is scared of wasting it.
3. **"Why this and not that?"** He wants to understand the pick so he needs
   the tool less next time.
4. **"What changes during the fight?"** Phases, switches and prayers, in the
   order they happen.

## What makes him leave

- A wall of numbers with no plain-language answer on top.
- Setup steps before the first result. He has 45 minutes.
- Jargon he has to look up (max hit rolls, accuracy rolls, tick counts).
- A recommendation he cannot afford or cannot obtain.
- A number that disagrees with the wiki and does not say why.
- Copy that sounds like marketing or like a machine wrote it.
- A page that does not work on his phone.

## Who he is not

- **The max-efficiency player.** Owns everything, wants the last 0.5% DPS,
  tick-perfect switches. GearScape and the wiki calc serve this player well.
  We say so openly and do not build for them.
- **The brand-new player** who has not fought a boss yet. The wiki's
  beginner guides serve them.
- **ENice.** He built the app and knows every control. If a screen only makes
  sense to him, it fails the mirror.

Ironmen are a real group but not the design target. Do not break things for
them; do not design around them.

## Mirror questions

Ask these of any screen, feature or piece of copy. A "no" needs a reason.

1. Would Tomas get a useful answer within one minute of landing here?
2. Does the first thing he sees say what to do, in plain words, before any numbers?
3. Does it work with the gear and gold he actually has?
4. Does it tell him why, in a sentence he could repeat to a friend?
5. Would it work on his phone, one-handed, mid-fight?
6. Does it help him with a boss he has not done yet, or only one he already knows?
7. Does it sound like a player wrote it?

## Changelog

- 2026-11-22: first draft from public demographics and the launch thread.
