# Reddit launch thread: feedback record (Oct 2026)

- **Thread:** https://www.reddit.com/r/2007scape/comments/1x42y61/i_made_a_free_runelite_plugin_site_that_finds_the/
- **Posted:** ~2026-10-12 by u/enice175 (ENice), flair "Other"
- **Captured:** 2026-10-13, from a full-page copy with all comments expanded. The 5 replies under KingKj52's comment were not expanded.
- **Status:** **removed by the r/2007scape moderators.** Score 0, 106 comments, 144 shares.
- **Likely reason:** sub rule 9, "No AI-generated content" (rule 7, self-promotion, may have played a part too). ENice's own edit said "Yes, this is AI slop", which confirmed it for them.

Claude can't read Reddit directly: both browser tools block reddit.com, and the JSON endpoints return 403. To re-check the thread, ask ENice to paste the page text.

## The post (summary)

Free, open-source site and RuneLite plugin ("Boss Helper Bank Sync") that picks max-DPS boss gear from your own bank. Features listed:
- best setup for all 3 styles
- sell-to-fund
- hybrid setups by switch count
- per-phase DPS
- budget mode
- "compare with the wiki DPS calc" button

It said "just google OSRS Boss Helper" instead of linking. It was framed as a dad-scaper hobby project. The edit admitted AI use and said it wasn't trying to compete with GearScape.

## Actionable feedback

**All closed (2026-10-14).** ENice has either done them or chose not to pursue
them; nothing from this thread is still open. What was raised, for the record:
DPS accuracy (answered by the oracle check at the end of this file), the
Wilderness champion amulet bug (fixed, `c5e1dc1`), explainer-text bloat (trimmed
2026-10-13), API-call politeness, Bank Memory import (shipped), where the DPS
numbers come from, and an AI disclaimer on the site.

## Feature requests
- Slayer and regular monsters, with a melee/range/burst choice (GodsTool)
- Recommendations inside the game, without leaving it: enter a monster, get gear (Park_BADger)
- Inventory loadouts and gear switches (Movient)

## Positioning signals
- **GearScape already does bank → best gear.** Raised by many (greasemonkey22_, jackal5217, Beretot, RyukzReign, LaikenVakar, OreOfChlorophyte). ENice acknowledged it ("Yes they do and it's really good").
- **Credibility hit.** SalmonCue: "two weeks ago you said you got the inspiration from gearscape", which contradicts "I didn't know when I made this". RabbitMario and Individual-Roof-3502 piled on; the latter says this was a repost after earlier backlash. Be consistent about the GearScape timeline from now on.
- **GearScape's UI is seen as hard to use** (fefect123, brprk, Solo_Jawn, Nexion21: "they should just have an 'I'm a noob' toggle"). Pufflere, Big_Cat_Tongue and jackal5217 disagreed. This supports a simpler, teaching-focused angle.
- Several people prefer the wiki calc because it's easy to use.
- petgirlbecky: "like 5 AI plugins that do this already". Crazy-Wrangler3769 mentioned "My BIS finder". Personal-Award-2256 and infinitay_ complained about vibe-coded plugins clogging the Plugin Hub.
- The write-up itself being AI-written drew more anger than the code (DeviousSOIL, zman1672, HobNob_Pack, reachisown on "dad-scaper"). **Write future posts by hand, in ENice's voice.**

## Positive comments
- EnvironmentalEgg5523: "This site is a game changer!!!"
- vi3z: "Absolutely love it... especially useful for progressing mid-game when BiS not available"
- aangst: "very cool so far"
- MillerBlade2: "gearscape isn't on runelite so I'll use yours"
- Copius: good idea, GearScape is clunky
- Far-Cookie2275: kind note encouraging him to keep building despite the AI backlash
- me-patrick: "Sick"
- Defenders in the AI argument: Krelle12343, der3dninja, the_pwnererXx, Business_Type_, Mees51
- KingKj52 corrected misinformation: the wiki asked for sensible API use, not "stop using our API", and RuneLite welcomed new plugin interest.

## Negative / anti-AI (no specific product feedback)
Big_Cat_Tongue, RyukzReign, randomjib ("vibe coded", "garbage"), wozzwoz, a_rare_chocobo, goingnowherespecial, Individual-Roof-3502, CueNoLife, bygonecenarion, LaikenVakar, OreOfChlorophyte, MAZZZIAN02, Dry-Adhesiveness-625, BadProse, mr_Joor, RabbitMario, mellophone11, raknarokki, redrumyliad ("AI always uses this exact same design"). Dsullivan777 accused a supportive commenter of being ENice's alt; Krelle12343 claimed the post had bought upvotes.

## ENice's replies in the thread
- To greasemonkey22_: GearScape "is really good"; he didn't know about it when he made this.
- To Copius: thanks, open to that kind of feedback.
- To ltsMeSam: the Wilderness champion amulet is a rough edge he'll smooth out.
- To jackal5217: found GearScape via a Gnomonkey video partway through; it "took the wind out of my sails" for a bit, but he kept going.
- To Far-Cookie2275: thanks, he'll keep working on this and other projects.
- To EnvironmentalEgg5523: "Thank you! :)"

## Takeaways
- Don't post to r/2007scape again without checking rule 9. Write any future post by hand.
- Answer accuracy claims with evidence: oracle results against the wiki engine.

## Accuracy check results (2026-10-13)
`npm run oracle` validation set: 120/121 match the wiki engine (weirdgloop osrs-dps-calc). The one miss is the known ~1.3% Obsidian + Berserker necklace gap.

Next, an oracle check of the app's own best melee/ranged/magic pick for 55 popular bosses, using an owns-everything bank:

```
npm run oracle -- --optimize --all --bosses=<slugs>
```

Run with `ORACLE_IO_DIR=<private dir>` so parallel sessions don't overwrite each other's combos. Each boss's default mechanic phase is pinned on both engines.

**117/132 match.** The other 15:
- **8 rows: max hit only, DPS identical.** The wiki counts the bolt-proc hit (and the Osmumten's fang's trimmed max) as the max hit. Known, by design.
- **5 magic rows run 0.4–2.1% LOW** (Artio, Bryophyta, Callisto, Hespori, Zulrah). These are all one-handed staves/sceptres with Confliction gauntlets. Their second accuracy roll after a miss isn't modelled yet (a known gap in `scripts/oracle/README.md`). Two-handed Tumeken's shadow rows all match.
- **Vardorvis: 2–4% HIGH.** The wiki engine uses Defence 215 at full HP, scaling linearly down to 145 as his HP drops (`src/lib/scaling/Vardorvis.ts`). Our catalog uses a flat 200 (`scripts/build-monster-catalog.ts`). That's optimistic at full HP and pessimistic late in the fight.

Harness fix: Tormented Demon and Doom of Mokhaiotl came back at 100% accuracy at first, because the wiki engine falls into "always hits" when no phase is set. With the default phase pinned they match exactly.

**Fixed (2026-10-13): items that can't be obtained are now dropped from the catalog** (`data/items/excluded-items.ts`):
- the Wilderness champion amulet (2017 event item, +100 all stats; it was in almost every owns-everything pick)
- the Barbarian Assault arrows (Bullet / Blunt / Barbed / Field)
- Emir's Arena hospital gear (the Calamity set incl. Koriff's coif, and the "(wrapped)" gloves)

**Fixed (2026-10-13), second pass:**
- Confliction gauntlets' double roll after a miss is now modelled.
- Vardorvis uses his full-HP Defence, like the wiki calc.

**After both fixes:** 122/131 boss rows match exactly. The other 9 differ only in the max hit shown (bolt specials and the fang's trimmed max); their DPS and accuracy are identical. Validation set: still 120/121.

**Conclusion:** the claim that the site "calcs all of its DPS wrong" doesn't hold up. The real problem was the fake items getting into recommendations.
