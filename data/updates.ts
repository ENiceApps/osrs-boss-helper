// Updates tab data (/updates): dated release notes + the undated roadmap.
// SINGLE SOURCE OF TRUTH for the app version: CURRENT_VERSION = RELEASES[0].
//
// To release:
//   1. Pick the bump (highest that applies wins):
//      - Patch 1.0.x: fixes and small wording/UI tweaks only.
//      - Minor 1.x.0: anything new a player can use (feature, panel, new
//        bosses/gear from a game update, new plugin capability). Reset patch.
//      - Major x.0.0: players must relearn something or lose something
//        (removed feature, incompatible share-link/bank-file format,
//        redesigned main flow). Reset minor + patch.
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

export interface Release {
  version: SemVer;
  date: IsoDate; // release day, ISO
  title: string; // one-line teaser, sentence case
  note?: string[]; // optional personal note, one string per paragraph
  changes: Change[];
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

export const RELEASES: Release[] = [
  {
    version: "1.0.0",
    date: "2026-10-09",
    title: "Initial public launch",
    note: [
      "I built OSRS Boss Helper for myself: pick a boss, point it at my actual bank, and see what I should be wearing and, more importantly, why. I've been using it for my own bossing for a while now, and figured other players might get something out of it too.",
      "So I bought the domain and open-sourced the code. It's free, there's no account, and your bank never leaves your computer.",
      "Where I want to take it is teaching. Other tools already turn your bank into a best setup, and some do it really well. What I care about is everything around that number: which phase of the fight you're in, how that changes your DPS, and why one item beats another for this boss. If you come away understanding your gear a little better, it's doing its job.",
      "It's a one-person hobby project, so expect rough edges. If something looks off, hit the Feedback button. I'd like to hear about it.",
      "— Eli",
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
      { kind: "new", lead: "Boss Helper Bank Sync", text: "a RuneLite plugin on the Plugin Hub that saves your bank, gear, inventory and skills to a file on your own computer. The site reads that file locally, and the plugin remembers your bank between sessions for each account." },
      { kind: "new", lead: "Highlight colour", text: "pick your accent colour from the swatches in the header." },
    ],
  },
];

export const PLANNED: PlannedItem[] = [
  { status: "planned", text: "More \"why this gear\": short plain-English notes on why an item wins for this boss, not just the DPS number." },
  { status: "planned", text: "Upgrade suggestions across combat styles, e.g. telling a melee-only player that a first ranged weapon is the best buy." },
  { status: "planned", text: "Selectable phases for more multi-phase bosses." },
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
