// Pure wikitext parsing for scripts/build-drop-tables.ts: template scanning,
// param splitting, and the {{DropsLine}} / {{DropsLineReward}} -> expected-quantity
// folding. No I/O and no top-level side effects, so tests can import this without
// triggering the network run in the codegen script.
//
// Why this exists: the codegen used to match `{{DropsLine\b([^}]*)\}\}` (which
// truncates at the FIRST `}`) and split params on EVERY `|`. Once a template
// nests another one — e.g. `|raritynotes={{Refn|name=blogdroprates}}` — the
// nested template's params leaked into the outer one (`name=blogdroprates`
// overwrote the real item name) and the line was silently dropped. The helpers
// below scan with balanced `{{ }}` nesting and split only on top-level `|`.

export interface WikiTemplate {
  /** The template name as requested (canonical casing from `names`). */
  name: string;
  /** Everything between the template name and the closing `}}` (leading `|` included). */
  body: string;
  /** Offset of the opening `{{` in the scanned text (document order key). */
  start: number;
  /** Offset just past the closing `}}`. */
  end: number;
}

/** Remove `<!-- ... -->` comments (an unterminated one swallows the rest, like MediaWiki). */
export function stripHtmlComments(text: string): string {
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
}

/**
 * Find every `{{Name ...}}` occurrence for the given template names (matched
 * case-insensitively, tolerating whitespace after `{{` and before the first
 * `|`/`}}`), in document order. Multiple templates per line are all found, and
 * nested templates inside a template's params do not truncate it.
 */
export function findTemplates(wikitext: string, names: readonly string[]): WikiTemplate[] {
  const byLower = new Map(names.map((n) => [n.toLowerCase(), n]));
  const openers: number[] = []; // stack of `{{` offsets
  const found: WikiTemplate[] = [];

  let i = 0;
  while (i < wikitext.length) {
    const two = wikitext.slice(i, i + 2);
    if (two === "{{") {
      openers.push(i);
      i += 2;
    } else if (two === "}}") {
      const start = openers.pop();
      if (start !== undefined) {
        const inner = wikitext.slice(start + 2, i); // between the braces
        // Name = everything up to the first `|` (or the closing braces): one word
        // ("DropsLine") or several ("Infobox Monster"), minus surrounding whitespace.
        const m = inner.match(/^\s*([^|{}<>[\]\n]+?)\s*(?=\||$)/);
        if (m) {
          const canonical = byLower.get(m[1].toLowerCase());
          if (canonical) {
            found.push({ name: canonical, body: inner.slice(m[0].length), start, end: i + 2 });
          }
        }
      }
      i += 2;
    } else {
      i++;
    }
  }

  return found.sort((a, b) => a.start - b.start);
}

/**
 * Iterate `s` tracking `{{ }}` / `[[ ]]` nesting (and skipping `<ref>…</ref>`
 * footnote bodies, which may contain stray `|` / `=`) and call
 * `onTopLevel(char, index)` for each character at nesting depth 0.
 */
function scanTopLevel(s: string, onTopLevel: (ch: string, idx: number) => boolean | void): void {
  const closers: string[] = []; // stack of expected closers
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (s[i] === "<" && /^<ref(?=[\s>/])/i.test(s.slice(i, i + 5))) {
      const tagEnd = s.indexOf(">", i);
      if (tagEnd === -1) return; // unterminated tag: nothing more at top level
      if (s[tagEnd - 1] !== "/") {
        const close = s.toLowerCase().indexOf("</ref>", tagEnd);
        i = close === -1 ? s.length : close + "</ref>".length - 1;
      } else {
        i = tagEnd;
      }
    } else if (two === "{{") {
      closers.push("}}");
      i++;
    } else if (two === "[[") {
      closers.push("]]");
      i++;
    } else if (two === "}}" || two === "]]") {
      if (closers.length > 0 && closers[closers.length - 1] === two) closers.pop();
      i++;
    } else if (closers.length === 0) {
      if (onTopLevel(s[i], i) === false) return;
    }
  }
}

/** Split on `sep`, ignoring separators nested inside `{{...}}` or `[[...]]`. */
export function splitTopLevel(s: string, sep: string): string[] {
  const parts: string[] = [];
  let from = 0;
  scanTopLevel(s, (ch, idx) => {
    if (ch === sep) {
      parts.push(s.slice(from, idx));
      from = idx + 1;
    }
  });
  parts.push(s.slice(from));
  return parts;
}

/** Index of the first top-level `ch` in `s`, or -1. */
export function topLevelIndexOf(s: string, ch: string): number {
  let at = -1;
  scanTopLevel(s, (c, idx) => {
    if (c === ch) {
      at = idx;
      return false;
    }
  });
  return at;
}

/**
 * Parse a template body (`|a=1|b=2|{{nested|x=y}}|c=[[Link|text]]`) into its
 * NAMED params (keys trimmed + lowercased, values trimmed; positional params
 * are ignored). Only top-level `|` and `=` count; later duplicates win, as in
 * MediaWiki.
 */
export function parseTemplateParams(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const part of splitTopLevel(body, "|")) {
    const eq = topLevelIndexOf(part, "=");
    if (eq === -1) continue;
    params[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim();
  }
  return params;
}

export interface BossDrop {
  itemId: number;
  name: string;
  /** Expected units obtained per kill (rarity × rolls × avg quantity, merged). */
  expected: number;
}

export const COINS_ID = 995;

/** `{{(f)}}` — the wiki's "Free-to-play-only" drop marker. */
const F2P_ONLY_MARKER = /\{\{\s*\(f\)\s*\}\}/i;

/** Footnote-style templates that never carry drop data (stripped from rarity/quantity values). */
const ANNOTATION_TEMPLATES = ["Refn", "Ref", "Efn", "Sfn", "Cn"];

/** Drop `<ref>…</ref>` tags and `{{Refn|…}}`-style footnote templates from a param value. */
export function stripAnnotations(value: string): string {
  const noTags = value.replace(/<ref\b[^>]*\/>/gi, "").replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, "");
  let out = "";
  let pos = 0;
  for (const t of findTemplates(noTags, ANNOTATION_TEMPLATES)) {
    if (t.start < pos) continue; // nested inside one we already removed
    out += noTags.slice(pos, t.start);
    pos = t.end;
  }
  return out + noTags.slice(pos);
}

/**
 * Evaluate a plain-arithmetic MediaWiki `#expr` body — numbers, `+ - * /`,
 * parentheses and an optional trailing `round N` — or null when it contains
 * anything else (so unknown syntax is never guessed at).
 */
export function evalArithmetic(expr: string): number | null {
  const tokens = expr.match(/\d+(?:\.\d+)?|\.\d+|round\b|[-+*/()]|\S/gi);
  if (!tokens) return null;
  let at = 0;
  const peek = () => tokens[at];

  const primary = (): number | null => {
    const t = tokens[at++];
    if (t === undefined) return null;
    if (t === "-") {
      const v = primary();
      return v === null ? null : -v;
    }
    if (t === "(") {
      const v = additive();
      if (v === null || tokens[at++] !== ")") return null;
      return v;
    }
    return /^(?:\d|\.\d)/.test(t) ? Number(t) : null;
  };
  const multiplicative = (): number | null => {
    let v = primary();
    while (v !== null && (peek() === "*" || peek() === "/")) {
      const op = tokens[at++];
      const r = primary();
      if (r === null) return null;
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };
  const additive = (): number | null => {
    let v = multiplicative();
    while (v !== null && (peek() === "+" || peek() === "-")) {
      const op = tokens[at++];
      const r = multiplicative();
      if (r === null) return null;
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };

  let value = additive();
  if (value !== null && peek()?.toLowerCase() === "round") {
    at++;
    const digits = additive();
    if (digits === null || !Number.isInteger(digits) || digits < 0 || digits > 15) return null;
    const f = 10 ** digits;
    value = Math.round(value * f) / f;
  }
  if (value === null || at !== tokens.length || !Number.isFinite(value)) return null;
  return value;
}

/**
 * Replace every self-contained `{{#expr:…}}` in a value with its computed number
 * (e.g. `1/{{#expr:2000/(1999/2000) round 1}}` → `1/2001`). Expressions that
 * aren't plain arithmetic (e.g. they reference `{{#var:…}}`) are left untouched.
 */
export function resolveInlineExprs(value: string): string {
  let cur = value;
  for (let guard = 0; guard < 8; guard++) {
    const next = cur.replace(/\{\{\s*#expr:([^{}]*)\}\}/gi, (whole, body: string) => {
      const n = evalArithmetic(body);
      return n === null ? whole : n.toFixed(10).replace(/\.?0+$/, "");
    });
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

/**
 * Average of every integer found in a quantity string ("5-15 (noted)" → 10).
 * A comma separates list entries on the wiki ("933,1400", "5,7", "4-8,7-11" —
 * the Desert Treasure II bosses give a min,max pair), it is never a thousands
 * separator in a DropsLine quantity, so it must not glue digit groups together
 * ("933,1400" is two numbers, not 9,331,400).
 *
 * A semicolon is the SAME list separator: Module:DropsLine splits the quantity
 * on `[,;]` and renders every list back as `a; b`, so `8;10;12` (Drake's shark
 * lure) means "8, 10 or 12" and averages to 10. The list carries no weights; when
 * an entry is really a conditional extra explained only in a footnote (the
 * demons' `1;2` ashes), see {@link DROP_QUANTITY_OVERRIDES}.
 */
export function parseQuantity(raw: string | undefined): number {
  if (!raw) return 1;
  const cleaned = stripAnnotations(raw).replace(/\(.*?\)/g, " "); // drop "(noted)" etc.
  const nums = cleaned.match(/\d+/g);
  if (!nums || nums.length === 0) return 1;
  const vals = nums.map(Number);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Rarity string → per-roll probability, or null if not quantifiable. */
export function parseRarity(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = resolveInlineExprs(stripAnnotations(raw)).trim().toLowerCase();
  if (s === "always") return 1;
  // A template we couldn't evaluate (`{{Brimstone rarity|96}}`, `{{#var:…}}`):
  // its inner numbers are NOT the rarity, so don't read a fraction out of them.
  if (s.includes("{{")) return null;
  // Take the first fraction, e.g. "~1/128" or "5/150 (1/64 on task)".
  const m = s.match(/~?\s*(\d+(?:\.\d+)?)\s*\/\s*(\d[\d,]*(?:\.\d+)?)/);
  if (m) {
    const num = Number(m[1]);
    const den = Number(m[2].replace(/,/g, ""));
    if (den > 0) return num / den;
  }
  return null; // "Varies", "Common", "Unknown", etc. — skip.
}

/** One parsed `{{DropsLine}}` / `{{DropsLineReward}}`: the item name and its expected units per kill. */
export interface ParsedDropLine {
  name: string;
  expected: number;
}

/** One drop table: the lines under one `{{DropsTableHead}}` (or before the first head). */
export interface DropTable {
  /**
   * The head's `dropversion=` tags, split on commas and trimmed (the wiki lets
   * one table serve several versions: `dropversion=Regular,Catacombs of Kourend`).
   * Empty = untagged = the table applies to every version of the page.
   */
  versions: string[];
  lines: ParsedDropLine[];
}

/**
 * A quantity the wiki line can't express: its `quantity=` list mixes a normal
 * kill's amount with a conditional extra that only a footnote explains (the
 * template has no way to say which entry applies when).
 */
export interface QuantityOverride {
  /** Item name on the DropsLine (case-insensitive). */
  name: string;
  /**
   * The line's `quantity=` as the wiki writes it (whitespace ignored). The
   * override applies only while the line still reads this, so an edited page
   * falls back to normal parsing instead of being silently pinned.
   */
  wikiQuantity: string;
  /** Units per normal kill of this catalog monster. */
  quantity: number;
}

/**
 * Per-monster {@link QuantityOverride}s, slug → overrides. Each entry names the
 * page it was checked against.
 */
export const DROP_QUANTITY_OVERRIDES: Readonly<Record<string, readonly QuantityOverride[]>> = {
  // https://oldschool.runescape.wiki/w/Greater_demon — `Vile ashes|quantity=1;2` in the "Regular" 100% table,
  // footnoted "A second set of ashes is dropped when the demon is killed with preferred method in the Chasm
  // of Fire". The catalog's Level 113 is a Catacombs of Kourend demon (infobox `dropversion5 = Regular,Catacombs
  // of Kourend`), so it always drops exactly one. (Lesser/Black demon carry the same line, but their catalog
  // versions are the Wilderness Slayer Cave ones, whose own table says `quantity=1`.)
  "greater-demon": [{ name: "Vile ashes", wikiQuantity: "1;2", quantity: 1 }],
  // https://oldschool.runescape.wiki/w/The_Mimic — "Main drops": "The quantities received depend on how many
  // attempts it took to kill the Mimic. Each failure reduces the quantity by 1/5 [Master: 1/6] of the maximum",
  // footnoted "Possible quantities: 600, 480, 360, 240, 120". So `120-600` lists one amount per attempt, not a
  // random range to average. The lines' `rarity` is the first-attempt rate (`altrarity` is the 2nd-5th attempt
  // one), and the page's own {{EliteMimicValue}} / {{MasterMimicValue}} price a first-try kill at rarity ×
  // the MAXIMUM quantity. A normal kill here is that first-try kill. Elite is the table that counts (see
  // selectDropTables); the Master lines are listed so a reordered page still prices a first-try kill.
  "the-mimic": [
    { name: "Death rune", wikiQuantity: "120-600", quantity: 600 }, // Elite
    { name: "Blood rune", wikiQuantity: "100-500", quantity: 500 },
    { name: "Grimy ranarr weed", wikiQuantity: "5-25 (noted)", quantity: 25 },
    { name: "Wine of Zamorak", wikiQuantity: "5-25 (noted)", quantity: 25 },
    { name: "Raw manta ray", wikiQuantity: "3-15 (noted)", quantity: 15 },
    { name: "Death rune", wikiQuantity: "100-600", quantity: 600 }, // Master
    { name: "Blood rune", wikiQuantity: "83-500", quantity: 500 },
    { name: "Grimy ranarr weed", wikiQuantity: "4-25 (noted)", quantity: 25 },
    { name: "Wine of Zamorak", wikiQuantity: "4-25 (noted)", quantity: 25 },
    { name: "Raw manta ray", wikiQuantity: "2-15 (noted)", quantity: 15 },
  ],
};

const sameQuantityText = (a: string, b: string) => a.replace(/\s+/g, "") === b.replace(/\s+/g, "");

/** `==Drops==`, `== Elite drops ==`: the level-2 sections whose tables are the monster's loot. */
const DROPS_SECTION = /\bdrops?\b/i;

/** Level-2 headings (`==Title==`, not `===Sub===`) in document order: offset + trimmed title. */
function level2Headings(wikitext: string): { at: number; title: string }[] {
  return [...wikitext.matchAll(/^==(?!=)(.*?[^=])==(?!=)[ \t\r]*$/gm)].map((m) => ({ at: m.index, title: m[1].trim() }));
}

/**
 * Parse every drop table on a page, in document order, without choosing between
 * them. Free-to-play-only (`{{(f)}}`) lines and lines whose rarity can't be
 * quantified are dropped here; item-name lookup happens later (`extractDrops`).
 *
 * `{{DropsLineReward}}` is the same row as `{{DropsLine}}`: both templates are
 * `{{#invoke:DropsLine|main|dtype=…}}` and differ only in the `dtype` (`reward` vs
 * `combat`) Module:DropsLine records for the item's drop-sources list, so its
 * name / quantity / rarity / rolls / `{{(f)}}` handling is identical here too. As
 * with DropsLine, only `rarity` counts. `altrarity` is a second rate the module
 * prints after it in the same cell ("6/250; 6/264", or "1/300–1/171.5" with
 * `altraritydash`) and never uses in the value columns. Pages put a conditional
 * rate there: the Mimic's 2nd-5th attempt, Drake's or TzTok-Jad's on-task rate.
 * Like a tagged table, it is an alternative to the normal kill, so it is not
 * counted.
 *
 * Template:DropsLineReward/doc says it lists "rewards from sources such as from
 * event items, caskets, and the like", and pages use it for things that are not a
 * kill's loot: the cave goblins' "Dialogue rewards", the Vampyre Juvinates'
 * "Rewards" for curing one. So a reward line counts only inside a level-2 section
 * whose heading says drops (`==Drops==`, the Mimic's `==Elite drops==`). Every
 * DropsLine counts wherever it sits, as before.
 */
export function parseDropTables(rawWikitext: string, quantityOverrides: readonly QuantityOverride[] = []): DropTable[] {
  // Editor comments can sit inside a param ("quantity=1<!-- … changing this to 2 … -->")
  // and would otherwise feed their digits into the quantity average.
  const wikitext = stripHtmlComments(rawWikitext);
  const tables: DropTable[] = [];
  let current: DropTable | null = null;
  const headings = level2Headings(wikitext);
  let nextHeading = 0;
  let section = ""; // title of the level-2 section the current template sits in

  // Every head/line in document order (balanced-brace scan, so nested templates
  // such as {{Refn|name=…}} inside a param don't truncate or corrupt the line).
  for (const t of findTemplates(wikitext, ["DropsTableHead", "DropsLine", "DropsLineReward"])) {
    while (nextHeading < headings.length && headings[nextHeading].at < t.start) section = headings[nextHeading++].title;

    if (t.name === "DropsTableHead") {
      const dv = parseTemplateParams(t.body).dropversion ?? "";
      current = { versions: splitVersionTags(dv), lines: [] };
      tables.push(current);
      continue;
    }
    if (t.name === "DropsLineReward" && !DROPS_SECTION.test(section)) continue;

    // `{{(f)}}` marks a free-to-play-ONLY drop (a separate F2P-world table, often
    // alongside a `{{(m)}}` members one). This is a members-world estimate, so
    // skip those. (The old parser skipped them only by accident: its first-`}`
    // truncation cut the line off right after the marker, losing rarity.)
    if (F2P_ONLY_MARKER.test(t.body)) continue;

    const p = parseTemplateParams(t.body);
    const name = p.name;
    if (!name) continue;

    const prob = parseRarity(p.rarity);
    if (prob === null) continue;
    const rolls = p.rolls ? Math.max(1, parseInt(p.rolls, 10) || 1) : 1;
    const override = quantityOverrides.find(
      (o) => o.name.toLowerCase() === name.toLowerCase() && p.quantity !== undefined && sameQuantityText(o.wikiQuantity, p.quantity),
    );
    const qty = override ? override.quantity : parseQuantity(p.quantity);
    const expected = Math.min(1, prob * rolls) * qty;
    if (!(expected > 0)) continue;

    if (!current) {
      current = { versions: [], lines: [] }; // lines before any head are untagged
      tables.push(current);
    }
    current.lines.push({ name, expected });
  }

  return tables;
}

/** `dropversion=Regular, Catacombs of Kourend` → ["Regular", "Catacombs of Kourend"]. */
function splitVersionTags(dropversion: string): string[] {
  return dropversion
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

const sameTag = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * The `dropversion` tag(s) the page's own `{{Infobox Monster}}` assigns to a
 * version label. The infobox pairs `versionN` with `dropversionN` (a lone
 * `version` with a lone `dropversion`), and that pairing is what the wiki's
 * version switcher uses to pick the drop tables for a version, e.g. Black demon:
 * `version4 = Level 188` + `dropversion4 = Wilderness Slayer Cave`. The version
 * may also be named by `bucketnameN` (Skeleton: `bucketname1 = Level 45, 1`).
 *
 * Returns null when no infobox mentions the version (or none gives a
 * `dropversion`); an EMPTY list when the infobox deliberately gives it none
 * (`dropversion2 =`), meaning no tagged table applies to that version.
 */
export function infoboxDropVersions(wikitext: string, catalogVersion: string): string[] | null {
  if (!catalogVersion) return null;
  for (const box of findTemplates(wikitext, ["Infobox Monster"])) {
    const params = parseTemplateParams(box.body);
    for (const [key, label] of Object.entries(params)) {
      const m = key.match(/^(?:version|bucketname)(\d*)$/);
      if (!m) continue;
      // `version = Level 56,Level 76` lists several versions; `Level 48, 1` is a
      // single one, so compare the whole label before its comma-separated parts.
      if (!sameTag(label, catalogVersion) && !splitVersionTags(label).some((v) => sameTag(v, catalogVersion))) continue;
      // A plain `dropversion` beside NUMBERED versions is not a mapping: there it
      // lists the page's optional extra tables (Yama's "Contract, Junk", Maggot
      // King's "Take-eggs"), which are not part of a normal kill.
      const tags = params[`dropversion${m[1]}`];
      if (tags !== undefined) return splitVersionTags(tags);
    }
  }
  return null;
}

/**
 * Per-monster overrides for the pages where the wiki's tags can't be tied to the
 * catalog version by the rules in {@link selectDropTables}: every table is tagged
 * with a sub-variant (a different level, area or monster on the same page) and
 * the infobox doesn't map the catalog's version label to one of them.
 * slug → the dropversion tag(s) standing for THIS monster (untagged tables always
 * count too). Each entry names the page it was checked against.
 */
export const DROP_VERSION_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  // https://oldschool.runescape.wiki/w/Abyssal_demon — the "Standard" tables are the
  // Catacombs of Kourend ones too (section "Standard and Catacombs of Kourend"); the
  // only other tag, "Wilderness Slayer Cave", is a different variant.
  "abyssal-demon": ["Standard"],
  // https://oldschool.runescape.wiki/w/Black_Guard — Level 25 and Level 48 guards each have their own tables.
  "black-guard": ["Level 48"],
  // https://oldschool.runescape.wiki/w/Ice_giant — the catalog entry is the Wilderness Slayer Cave
  // variant (infobox `version1 = Wilderness Slayer Cave 1`, `dropversion = Wilderness Slayer Cave`).
  "ice-giant": ["Wilderness Slayer Cave"],
  // https://oldschool.runescape.wiki/w/Jelly — the plain-coloured jellies (incl. Dark) use "Regular";
  // the "(w)" ones in the Wilderness Slayer Cave use their own table.
  jelly: ["Regular"],
  // https://oldschool.runescape.wiki/w/Nechryarch — "Normal" is the Nechryarch; "Greater" is the Greater nechryarch.
  nechryarch: ["Normal"],
  // https://oldschool.runescape.wiki/w/Zombie — infobox `version1 = Level 24, 1` + `dropversion = Level 24`.
  zombie: ["Level 24"],
};

/** A table meant only for free-to-play worlds (`dropversion=Free-to-play` / `F2P`). */
const isF2pOnly = (t: DropTable) => t.versions.length > 0 && t.versions.every((v) => /^(?:free[- ]to[- ]play|f2p)$/i.test(v));

/**
 * Choose which of a page's tables describe one NORMAL kill of a catalog monster.
 * Steps 1-3 look for a table tagged with the version's tag(s) and keep those
 * tables plus every untagged table (untagged = applies to all versions):
 *
 * 1. `overrideTags` (DROP_VERSION_OVERRIDES), when some table carries one.
 * 2. The catalog version itself equals a table's tag (comma lists and case ignored).
 * 3. The page's infobox maps the version to tag(s) (`infoboxTags`).
 *
 * Otherwise:
 * 4. Untagged tables exist → ONLY those. A tagged table is then an alternate mode
 *    the wiki lists separately (Yama's `Junk` / `Contract`, a Slayer-cave variant,
 *    a page-turning task) and summing it into the normal kill double-counts.
 * 5. Every table is tagged and none matches → the tags split the page into
 *    alternatives the catalog doesn't model (MVP / non-MVP, Diary / Regular,
 *    Elite / Master casket, Members / Free-to-play). A kill rolls ONE of them, so
 *    summing them overstates it: keep only the first-listed alternative's tables.
 *    The wiki leads with the primary table — Scurrius' "Drops (MVP/Solo)", the
 *    zombie pirate's Medium Wilderness Diary table, both of which the pages'
 *    money-making guides assume. Free-to-play-only tables are skipped when
 *    members tables exist (this is a members-world estimate).
 */
export function selectDropTables(
  tables: readonly DropTable[],
  catalogVersion: string,
  infoboxTags: readonly string[] | null = null,
  overrideTags: readonly string[] = [],
): DropTable[] {
  const untagged = (t: DropTable) => t.versions.length === 0;
  const withTags = (tags: readonly string[]) => {
    const hit = (t: DropTable) => t.versions.some((v) => tags.some((w) => sameTag(v, w)));
    return tables.some(hit) ? tables.filter((t) => untagged(t) || hit(t)) : null;
  };

  const chosen =
    withTags(overrideTags) ??
    (catalogVersion ? withTags([catalogVersion]) : null) ??
    (infoboxTags ? withTags(infoboxTags) : null);
  if (chosen) return chosen;
  if (tables.some(untagged)) return tables.filter(untagged);
  const members = tables.filter((t) => !isF2pOnly(t));
  const pool = members.length > 0 ? members : tables;
  const first = pool[0]?.versions[0];
  return first === undefined ? [] : pool.filter((t) => t.versions.some((v) => sameTag(v, first)));
}

/**
 * Extract drops from one page's wikitext for one catalog monster: parse every
 * drop table, keep the ones that describe a normal kill of `catalogVersion`
 * (see {@link selectDropTables}), and fold the lines into expected units per
 * item (items the price mapping doesn't know are skipped).
 */
export function extractDrops(
  rawWikitext: string,
  catalogVersion: string,
  nameToId: Map<string, number>,
  overrideTags: readonly string[] = [],
  quantityOverrides: readonly QuantityOverride[] = [],
): Map<number, BossDrop> {
  const byId = new Map<number, BossDrop>();
  const wikitext = stripHtmlComments(rawWikitext);
  const chosen = selectDropTables(
    parseDropTables(wikitext, quantityOverrides),
    catalogVersion,
    infoboxDropVersions(wikitext, catalogVersion),
    overrideTags,
  );

  for (const { name, expected } of chosen.flatMap((t) => t.lines)) {
    const lower = name.toLowerCase();
    const itemId = lower === "coins" ? COINS_ID : nameToId.get(lower);
    if (itemId === undefined) continue; // unpriceable / non-GE item — skip.

    const existing = byId.get(itemId);
    if (existing) existing.expected += expected;
    else byId.set(itemId, { itemId, name, expected });
  }

  return byId;
}
