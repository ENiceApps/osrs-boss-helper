// Updates tab data (/updates): dated release notes, plus the undated roadmap
// (PLANNED), which is INTERNAL only: ENice keeps it off the site (2026-10-13).
// SINGLE SOURCE OF TRUTH for the app version: CURRENT_VERSION = RELEASES[0].
//
// The app is in ALPHA (0.x) — rolled back from 1.0.0 to 0.0.1 on 2026-10-13
// after the Reddit launch feedback. 1.0.0 is saved for when it's ready.
//
// Releases are WEEKLY: every push to main is logged to patch-notes/unreleased.md
// on the `patch-notes` branch (.github/workflows/patch-notes-log.yml). Thursday
// mornings a cloud routine drafts the release on a `release/v*` branch and emails
// ENice; it reaches main only after he approves. See patch-notes/README.md.
//
// To release:
//   1. Pick the bump (highest that applies wins). While in alpha:
//      - Patch 0.x.y: fixes and small wording/UI tweaks only.
//      - Minor 0.x.0: anything new a player can use (feature, panel, new
//        bosses/gear from a game update, new plugin capability). Reset patch.
//      - 1.0.0 only on ENice's say-so.
//   2. Add a block at the TOP of RELEASES (version, ISO deploy date, one-line
//      title, changes). Say what changed for the player, never how.
//   3. Prune shipped items from PLANNED (keep 4–8, undated).
//   4. Set "version" in package.json (and the two root fields in
//      package-lock.json) to match — tests/updates.test.ts enforces it.

export type SemVer = `${number}.${number}.${number}`;
export type IsoDate = `${number}-${number}-${number}`;

export type ChangeKind = "new" | "improved" | "fixed" | "removed";
export const CHANGE_KIND_ORDER: ChangeKind[] = ["new", "improved", "fixed", "removed"];
export const CHANGE_KIND_LABEL: Record<ChangeKind, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
};

export interface Change {
  kind: ChangeKind;
  /** Optional bold lead-in, e.g. "Zulrah". Rendered as "<b>lead</b> — text". */
  lead?: string;
  text: string;
  /** Reporter handle to credit, e.g. "u/someone". Rendered "(thanks u/someone)". */
  thanks?: string;
}

/** One bullet in a note: plain text, or text with an optional bold lead
 *  ("Bork") and its own sub-bullets. */
export type NoteItem = string | { lead?: string; text: string; sub?: string[] };
/** A note block: a paragraph (string), a small section heading, or a bullet
 *  list. */
export type NoteBlock = string | { heading: string } | NoteItem[];

/** Who signs a release note. Omitted = ENice. "ai" = the 4-hourly cloud
 *  routine that watches the OSRS Wiki for new raid/boss/item data and applies
 *  it (docs/tfa-wiki-watch.md); the Updates page labels those "From AI". */
export type ReleaseAuthor = "ai";

export interface Release {
  version: SemVer;
  date: IsoDate; // release day, ISO
  title: string; // one-line teaser, sentence case
  /** ENice's note, rendered as plain text in exactly this order (paragraphs
   *  and bullet lists), above the structured changes. He writes these
   *  himself; don't reword them. */
  note?: NoteBlock[];
  /** Structured change list (New / Improved / Fixed / Removed). A release may
   *  carry only a note instead. */
  changes: Change[];
  /** "ai" for the wiki-watch routine's patch releases (shown as "From AI"). */
  author?: ReleaseAuthor;
}

export type PlanStatus = "planned" | "considering";
export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  planned: "Planned",
  considering: "Considering",
};
export interface PlannedItem {
  status: PlanStatus;
  text: string;
}

/** ENice's letter on /updates, shown in date order with the releases (newest
 *  post first, so a newer release sits above it). A string is a paragraph, a
 *  string[] is a bullet list. ENice writes these himself; don't reword them. */
export interface CommunityNote {
  date: IsoDate;
  blocks: (string | string[])[];
}

export const COMMUNITY_NOTE: CommunityNote | null = {
  date: "2026-10-13",
  blocks: [
    "Hello all,",
    "Posting on Reddit let me know there is much more polishing and work that's needed before truly calling this a “released” project. Even though it's only a side project for me, it's the first time I've tried releasing anything to the public, and I want to do it right. So I'm calling this an alpha release for now. I've also gotten some really good feedback and reports of obvious bugs from a few of you. So my intentions are the following:",
    [
      "To write as much as I can in my own words (like this whole message). I'm not much of a writer, but I'll type it as I'd say it. Maybe that gives it the personal touch.",
      "I'll be adding weekly patch notes with changes I've made throughout the week. I'm changing the app as I go, and patch notes can just be a list of things that changed. I'll also use this to try and keep up with Jagex updates. (Looking at you, Raids 4.)",
      "I know the UI leaves a lot to be desired. This is where I personally struggle the most. I can understand functionality and the OSRS game mechanics, but I'm finding it very challenging to make the UI 1. intuitive to use and 2. easy to look at, so I'm open to ideas.",
    ],
    "Beyond that, I'm straight up winging it weekly, haha. I'm not even asking for donations. I'm making this for you and me, and I love this game just as much as I'm sure you do too. I hope to hear from more of you as the weeks go on. You'll surely hear from me.",
    "Thank you,",
    "— ENice",
  ],
};

export const RELEASES: Release[] = [
  {
    // First "From AI" patch: the wiki-watch check (docs/tfa-wiki-watch.md)
    // run by hand on launch night; the cloud routine writes the next ones in
    // this same shape. Blizzard-style: a dated one-liner, a heading per area,
    // one terse bullet per change, and what is still missing.
    version: "0.1.2",
    date: "2026-10-20",
    title: "Raids 4 wiki check: Bork, Moia and Dreadnoth updated",
    author: "ai",
    note: [
      "Wiki check at 00:10 UTC, 21 Oct. Numbers below are from the OSRS Wiki boss pages, which were corrected after launch.",
      { heading: "Bosses" },
      [
        { lead: "Bork", text: "flat armour 12 → 10. The Smorks gain 2 flat armour." },
        { lead: "Moia", text: "now 80% weak to Air." },
        { lead: "Dreadnoth the Jellied", text: "now counts as a demon, so demonbane weapons and spells apply." },
      ],
      { heading: "Still waiting on" },
      [
        { lead: "Dagon'hai Elder and Monks", text: "no stats on the wiki yet." },
        { lead: "Ezekiel", text: "the wiki suspects a single-digit damage cap. Not applied until it is confirmed." },
      ],
    ],
    changes: [],
  },
  {
    // ENice wrote the note and the change lines himself (2026-10-20, final).
    version: "0.1.1",
    date: "2026-10-20",
    title: "Raids 4 is out!",
    note: [
      "Raids 4 The Fractured Archive is out! Here's what I've added so far and what is on my plate for the next few days.",
      [
        {
          text: "All 8 bosses have been added.",
          sub: ["Each phase of each boss is still being worked out. So, I'll be checking the wiki daily to make sure we can get that added in asap"],
        },
        {
          text: "All new items have been added! The Obligator, Ascension crossbows, Ascension bolts, Zorya's tome, and Rondache (I'll have to think of a way to add the dps on this).",
          sub: ["I'm also waiting for full detailed mechanics on this to add it to the dps calc properly. Once the wiki dps calc gets it, I should have added it too"],
        },
        "Zeal, the new prayer is out and added! 84 Prayer, +25% Attack, +28% Strength, it's the new upgrade to Piety. (The site will default to Piety for now assuming you (and I) haven't gotten the Horn of Bran drop).",
        "I've also added a few little UI changes to make finding these new bosses easier.",
      ],
      "I hope you enjoy the new raid! I'll be trying it for the first time shortly.",
      "ENice",
    ],
    changes: [],
  },
  {
    version: "0.0.1",
    date: "2026-10-09",
    title: "Alpha release",
    note: [
      "Hello World!!",
      "Thank you for finding OSRSBossHelper.com! I built OSRS Boss Helper for myself, to quickly give me the best DPS possible with what I own in my bank.",
      "You pick a boss and import your bank from the RuneLite plugin “Boss Helper Bank Sync”. And that's it! You'll get the best DPS for that boss in all three combat styles, and you can compare it with the Wiki DPS calculator at the touch of a button. If you scroll down, you can also calculate the best hybrid armour for however many armour switches (button clicks) you want.",
      "I've been using this for bossing (and Slayer) for a few months now and thought, I bet other people would find this useful too. So I bought the domain and open-sourced the code to share with the RS community! It's free, there's no account, and I'm still actively working on updates and changes. Next on my mind are phone support and raid builds, as well as the other updates you'll find below.",
      "So please enjoy!",
      "This is a one-person, dad-scaper hobby project, so expect rough edges. If something looks off or you want something added, hit the Feedback button. I'd like to keep building this with you.",
      "Thank you,",
      "— ENice",
    ],
    changes: [
      { kind: "new", lead: "Every boss", text: "over 700 bosses and high-HP monsters, each with a page showing stats, defences and weaknesses." },
      { kind: "new", lead: "Best setup from your bank", text: "compares Melee, Ranged and Magic and picks the strongest setup you can actually wear." },
      { kind: "new", lead: "Budget mode", text: "no bank needed. Set a GP budget to see the best setup you could buy, plus upgrades ranked by DPS gain. You can also spend your own GP, choose gear to sell for upgrades, or tick the untradeables you own." },
      { kind: "new", lead: "Boss phases", text: "switch between forms and phases, like Zulrah's forms, Verzik's phases or the Tormented Demon's shield. Stats, DPS and the recommended setup update to match." },
      { kind: "new", lead: "Why this gear", text: "hover or tap any slot to see what the item adds and the next-best options, then pick one to swap it in." },
      { kind: "new", lead: "DPS you can check", text: "numbers are cross-checked against the OSRS Wiki DPS calculator, and one click opens your setup there." },
      { kind: "new", lead: "Fight mechanics and spec weapons", text: "checklists that turn green or red against your setup (anti-dragonfire, anti-venom, melee reach and more), plus spec weapon picks for popular bosses." },
      { kind: "new", lead: "Prayers, spells and potions", text: "choose your offensive prayer and spell. Potion boosts count when the potion is in your bank." },
      { kind: "new", lead: "Kills, supplies and profit per hour", text: "estimates from trip settings you can adjust." },
      { kind: "new", lead: "Hybrid armour", text: "for fights where you swap styles, choose how many gear switches you'll make and see the best shared setup." },
      { kind: "new", lead: "Ditto and the combat dummy", text: "an editable custom boss (defences, dragon, undead, demon and more) to test any setup, plus a no-defence dummy for raw DPS." },
      { kind: "new", lead: "Wilderness bosses", text: "Risk it mode finds the best setup worth no more than the GP you're willing to risk." },
      { kind: "new", lead: "Share links", text: "send a setup to a friend as a link." },
      { kind: "new", lead: "Item browser", text: "every equippable item, sortable by any bonus, with live Grand Exchange prices." },
      { kind: "new", lead: "Boss Helper Bank Sync", text: "a RuneLite plugin on the Plugin Hub that brings your bank, gear, inventory and skills into the site. It remembers your bank between sessions for each account." },
      { kind: "new", lead: "Highlight colour", text: "pick your accent colour from the swatches in the header." },
    ],
  },
];

export const PLANNED: PlannedItem[] = [
  { status: "planned", text: "Better phone support." },
  { status: "planned", text: "Raid builds: best setups for raid bosses." },
  { status: "planned", text: "Fight mechanics and spec weapon picks for more bosses, starting with raids bosses and the Nightmare." },
  { status: "planned", text: "New gear and bosses added after each game update." },
  { status: "considering", text: "A dream setup view: the best possible gear for a boss, ignoring what you own or can afford." },
];

export const CURRENT_VERSION: SemVer = RELEASES[0].version;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-09" -> "9 Oct 2026". String-split, no Date: avoids timezone drift. */
export function formatReleaseDate(iso: IsoDate): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Numeric semver compare: >0 if a is newer. */
export function compareSemVer(a: SemVer, b: SemVer): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}
