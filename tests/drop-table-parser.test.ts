// Drop-table wikitext parser (scripts/drop-table-parser.ts, used by
// scripts/build-drop-tables.ts). The old parser matched `{{DropsLine([^}]*)}}`
// and split on every `|`, so a nested template in any param (e.g. the Mad Angel
// page's `raritynotes={{Refn|name=blogdroprates}}`) leaked its params into the
// line and silently dropped the item. These cases pin the balanced-brace
// behavior, plus the generated data the bug used to damage.
//
// The second half pins which of a page's drop tables count as one NORMAL kill
// (selectDropTables / infoboxDropVersions): Yama's `Contract`/`Junk` tables and
// the Slayer-cave / Chasm-of-Fire variants used to be summed into the normal kill,
// and so did mutually exclusive splits (Scurrius MVP / non-MVP, zombie pirate
// Diary / Regular, the Mimic's Elite / Master caskets).

import { describe, expect, it } from "vitest";
import {
  DROP_QUANTITY_OVERRIDES,
  DROP_VERSION_OVERRIDES,
  evalArithmetic,
  extractDrops,
  findTemplates,
  infoboxDropVersions,
  parseDropTables,
  parseQuantity,
  parseRarity,
  parseTemplateParams,
  selectDropTables,
  splitTopLevel,
  stripAnnotations,
} from "@/scripts/drop-table-parser";
import { DROPS_BY_SLUG } from "@/data/bosses/drops";

const NAME_TO_ID = new Map<string, number>([
  ["hallowfell", 34027],
  ["ardeaglais teleport", 34033],
  ["flax", 1779],
  ["rune dagger", 1213],
  ["bones", 526],
  ["hydra's claw", 22966],
  ["grimy avantoe", 211],
  ["aether catalyst", 99001],
  ["zulrah's scales", 12934],
  ["dragon knife", 22804],
  ["steel dart", 808],
  ["oathplate helm", 99002],
  ["soulflame horn", 99003],
  ["malicious ashes", 99004],
  ["big bones", 99005],
]);

const drops = (wikitext: string, version = "") => extractDrops(wikitext, version, NAME_TO_ID);

describe("findTemplates / parseTemplateParams", () => {
  it("parses a plain DropsLine", () => {
    const [t] = findTemplates("{{DropsLine|name=Bones|quantity=1|rarity=Always}}", ["DropsLine"]);
    expect(parseTemplateParams(t.body)).toEqual({ name: "Bones", quantity: "1", rarity: "Always" });
  });

  it("keeps the real name when raritynotes nests {{Refn|name=...}} (Mad Angel / Hallowfell)", () => {
    const line = "{{DropsLine|name=Hallowfell|quantity=1|rarity=1/127|raritynotes={{Refn|name=blogdroprates}}}}";
    const [t] = findTemplates(line, ["DropsLine"]);
    expect(t.name).toBe("DropsLine");
    const p = parseTemplateParams(t.body);
    expect(p.name).toBe("Hallowfell"); // not "blogdroprates"
    expect(p.rarity).toBe("1/127");
    expect(p.raritynotes).toBe("{{Refn|name=blogdroprates}}");
    expect(line.slice(t.start, t.end)).toBe(line); // spans the whole template, not up to the first `}`
  });

  it("survives deeply nested citations (CiteNews with url=/name= params)", () => {
    const line =
      "{{DropsLine|name=Ardeaglais teleport|quantity=2|rarity=1/25|raritynotes={{CiteNews|url=https://example.test/a?b=c|title=Drop Rates|newsdate=12 August 2026|quote=The Mad Angel Drop Rates|name=blogdroprates}}}}";
    const p = parseTemplateParams(findTemplates(line, ["DropsLine"])[0].body);
    expect(p).toMatchObject({ name: "Ardeaglais teleport", quantity: "2", rarity: "1/25" });
  });

  it("finds every DropsLine when several share one line (and keeps document order)", () => {
    const line =
      "{{DropsLine|name=Coins|quantity=35|rarity=21/128}}{{DropsLine|name=Bones|quantity=1|rarity=Always|raritynotes={{Refn|name=x}}}}";
    const found = findTemplates(line, ["DropsLine"]);
    expect(found.map((t) => parseTemplateParams(t.body).name)).toEqual(["Coins", "Bones"]);
    expect(found[0].start).toBeLessThan(found[1].start);
  });

  it("does not split on a | inside [[link|text]] and still reads params after it", () => {
    const line = "{{DropsLine|name=Rune dagger|raritynotes=See [[Rare drop table|the RDT]] and [[Foo|bar]]|rarity=1/128|rolls=2}}";
    const p = parseTemplateParams(findTemplates(line, ["DropsLine"])[0].body);
    expect(p.name).toBe("Rune dagger");
    expect(p.raritynotes).toBe("See [[Rare drop table|the RDT]] and [[Foo|bar]]");
    expect(p.rarity).toBe("1/128");
    expect(p.rolls).toBe("2");
  });

  it("ignores = and | inside <ref> bodies and nested templates", () => {
    const body = "|name=Bones|raritynotes=<ref name=a>x|name=oops</ref>|quantity=3|{{foo|k=v}}";
    expect(parseTemplateParams(body)).toEqual({ name: "Bones", raritynotes: "<ref name=a>x|name=oops</ref>", quantity: "3" });
  });

  it("splitTopLevel only splits at depth 0", () => {
    expect(splitTopLevel("a|{{b|c}}|[[d|e]]|f", "|")).toEqual(["a", "{{b|c}}", "[[d|e]]", "f"]);
  });

  it("matches names case-insensitively and tolerates whitespace; ignores other templates", () => {
    const text = "{{ dropsline |name=A}} {{DropsLineFoo|name=B}} {{Other|name=C}} {{DROPSTABLEHEAD|dropversion=X}}";
    const found = findTemplates(text, ["DropsLine", "DropsTableHead"]);
    expect(found.map((t) => t.name)).toEqual(["DropsLine", "DropsTableHead"]);
  });

  it("does not throw on unbalanced braces", () => {
    expect(() => findTemplates("{{DropsLine|name=A|x={{oops}}  }} }} {{ {{", ["DropsLine"])).not.toThrow();
  });
});

describe("extractDrops", () => {
  it("keeps Hallowfell and the Ardeaglais teleport on the nested-ref Mad Angel lines", () => {
    const wt = [
      "{{DropsTableHead}}",
      "{{DropsLine|name=Hallowfell|quantity=1|rarity=1/127|raritynotes={{Refn|name=blogdroprates}}}}",
      "{{DropsLine|name=Ardeaglais teleport|quantity=2|rarity=1/25|raritynotes={{CiteNews|title=Drop Rates|name=blogdroprates}}}}",
      "{{DropsTableBottom}}",
    ].join("\n");
    const out = drops(wt);
    expect(out.get(34027)?.expected).toBeCloseTo(1 / 127, 6);
    expect(out.get(34033)?.expected).toBeCloseTo(0.08, 6);
  });

  it("honors rolls=2 after a nested template (Zulrah flax)", () => {
    const wt =
      "{{DropsLine|name=Flax|quantity=1000 (noted)|rarity=10/249|raritynotes={{Refn|group=d|The exact rarity is 10/249 * 5244/5264 per roll.}}|rolls=2}}";
    expect(drops(wt).get(1779)?.expected).toBeCloseTo((10 / 249) * 2 * 1000, 4);
  });

  it("counts two DropsLines on one line separately and merges same-item lines", () => {
    const wt = "{{DropsLine|name=Bones|quantity=1|rarity=Always}} {{DropsLine|name=Bones|quantity=2|rarity=1/2|raritynotes={{Refn|name=n}}}}";
    expect(drops(wt).get(526)?.expected).toBeCloseTo(1 + 1, 6);
  });

  it("parses a plain line (rarity, range quantity)", () => {
    const out = drops("{{DropsLine|name=Rune dagger|quantity=2-4|rarity=1/128}}");
    expect(out.get(1213)).toEqual({ itemId: 1213, name: "Rune dagger", expected: 3 / 128 });
  });

  it("applies dropversion gating when the catalog version matches a table", () => {
    const wt = [
      "{{DropsTableHead|dropversion=Normal}}",
      "{{DropsLine|name=Bones|quantity=1|rarity=Always}}",
      "{{DropsTableHead|dropversion=Hard}}",
      "{{DropsLine|name=Bones|quantity=5|rarity=Always|raritynotes={{Refn|name=n}}}}",
    ].join("\n");
    expect(drops(wt, "Normal").get(526)?.expected).toBe(1);
    expect(drops(wt, "Hard").get(526)?.expected).toBe(5);
    expect(drops(wt, "Other").get(526)?.expected).toBe(1); // matches neither → the first-listed alternative only
  });

  it("evaluates {{#expr}} rarities instead of reading a fraction out of the expression (Alchemical Hydra)", () => {
    const wt = "{{DropsLine|name=Hydra's claw|quantity=1|rarity=1/{{#expr:1000/(1999/2000*1999/2000) round 1}}|raritynotes={{NamedRef|Alchemical Hydra}}}}";
    const claw = drops(wt).get(22966)?.expected ?? 0;
    expect(claw).toBeCloseTo(1 / 1001.5, 6); // old parser read 1999/2000 → ~1 per kill
  });

  it("skips (rather than guesses) rarities from templates it can't evaluate", () => {
    expect(drops("{{DropsLine|name=Grimy avantoe|quantity=1|rarity=1/{{#expr:1/(5*{{#var:herbbase}}) round 1}}}}").size).toBe(0);
    expect(drops("{{DropsLine|name=Bones|quantity=1|rarity={{Brimstone rarity|96|bonus=yes}}}}").size).toBe(0);
  });

  it("ignores HTML comments inside quantity (Zulrah scales)", () => {
    const wt = "{{DropsLine|name=Zulrah's scales|quantity=100-299<!--note: the 500 scale drop is separate-->|rarity=Always}}";
    expect(drops(wt).get(12934)?.expected).toBeCloseTo(199.5, 6);
  });

  it("reads decimal denominators (Yama 7/95.11) without truncating", () => {
    const wt = "{{DropsLine|name=Aether catalyst|quantity=850|quantitynotes={{Refn|group=d|name=contrib}}|Rarity=7/95.11}}";
    expect(drops(wt).get(99001)?.expected).toBeCloseTo((7 / 95.11) * 850, 4);
  });

  it("skips free-to-play-only ({{(f)}}) lines but keeps members-only ({{(m)}}) ones", () => {
    const wt = [
      "{{DropsLine|name=Steel dart|namenotes={{(f)}}|quantity=10|rarity=1/2}}",
      "{{DropsLine|name=Steel dart|quantity=10|rarity=1/4|namenotes={{(m)}}}}",
    ].join("\n");
    expect(drops(wt).get(808)?.expected).toBeCloseTo(2.5, 6);
  });

  it("multi-line templates and lowercase param keys still parse", () => {
    const wt = "{{DropsLine\n|name=Bones\n|Quantity=2\n|Rarity=Always\n|raritynotes={{Refn|name=n}}\n}}";
    expect(drops(wt).get(526)?.expected).toBe(2);
  });
});

describe("parseRarity / evalArithmetic / stripAnnotations", () => {
  it("handles the existing rarity shapes", () => {
    expect(parseRarity("always")).toBe(1);
    expect(parseRarity("~1/128")).toBeCloseTo(1 / 128, 9);
    expect(parseRarity("5/150 (1/64 on task)")).toBeCloseTo(5 / 150, 9);
    expect(parseRarity("1/1,000")).toBeCloseTo(1 / 1000, 9);
    expect(parseRarity("Varies")).toBeNull();
    expect(parseRarity(undefined)).toBeNull();
  });

  it("strips footnote refs from a rarity before reading the fraction", () => {
    expect(parseRarity("1/128{{Refn|group=d|see 1/2 here}}")).toBeCloseTo(1 / 128, 9);
    expect(parseRarity("1/128<ref name=a>5/6</ref>")).toBeCloseTo(1 / 128, 9);
    expect(stripAnnotations("3{{Refn|x|{{Refn|nested}}}}-4")).toBe("3-4");
  });

  it("evaluates plain arithmetic with round, and refuses anything else", () => {
    expect(evalArithmetic("2*(3+4)")).toBe(14);
    expect(evalArithmetic("1/(5/128 * 25/92) round 1")).toBe(94.2);
    expect(evalArithmetic("{{#var:x}}*2")).toBeNull();
    expect(evalArithmetic("1/0")).toBeNull();
    expect(evalArithmetic("2 +")).toBeNull();
  });
});

describe("parseQuantity", () => {
  it("averages a range", () => {
    expect(parseQuantity("5-15 (noted)")).toBe(10);
    expect(parseQuantity("100-299")).toBe(199.5);
    expect(parseQuantity(undefined)).toBe(1);
  });

  it("treats a comma as a list separator, not a thousands separator (Desert Treasure II min,max pairs)", () => {
    expect(parseQuantity("933,1400")).toBe(1166.5); // the Whisperer's soul runes, not 9,331,400
    expect(parseQuantity("70,105 (noted)")).toBe(87.5);
    expect(parseQuantity("5,7")).toBe(6);
    expect(parseQuantity("4-8,7-11")).toBe(7.5);
    expect(parseQuantity("1;2")).toBe(1.5);
  });

  it("treats `;` exactly like `,` — Module:DropsLine splits quantity on [,;] (Drake, the Whisperer)", () => {
    expect(parseQuantity("8;10;12")).toBe(10); // Drake's shark lure: 8, 10 or 12
    expect(parseQuantity("280; 420 (noted)")).toBe(350); // the Whisperer's pure essence
    for (const [semi, comma] of [["1;2", "1,2"], ["4-8;7-11", "4-8,7-11"], ["933;1400", "933,1400"]]) {
      expect(parseQuantity(semi), semi).toBe(parseQuantity(comma));
    }
  });
});

describe("quantity overrides (a list entry that is really a footnoted conditional extra)", () => {
  // Greater demon's 100% line: the 2nd set of ashes only drops for a preferred-method Chasm of Fire kill.
  const ASHES =
    "{{DropsTableHead|dropversion=Regular}}\n{{DropsLine|name=Malicious ashes|quantity=1;2|rarity=Always|raritynotes={{refn|group=d|name=100%|A second set of ashes is dropped when the demon is killed with preferred method in the [[Chasm of Fire]].}}}}";
  const OVERRIDE = [{ name: "Malicious ashes", wikiQuantity: "1;2", quantity: 1 }];

  it("without an override the list averages, as the template's own price column does", () => {
    expect(drops(ASHES).get(99004)?.expected).toBe(1.5);
  });

  it("an override replaces the matching line's quantity (rarity and rolls still apply)", () => {
    expect(extractDrops(ASHES, "", NAME_TO_ID, [], OVERRIDE).get(99004)?.expected).toBe(1);
    const halfRate = ASHES.replace("rarity=Always", "rarity=1/2|rolls=3");
    expect(extractDrops(halfRate, "", NAME_TO_ID, [], [{ ...OVERRIDE[0], quantity: 4 }]).get(99004)?.expected).toBe(4); // min(1, 3/2) × 4
  });

  it("matches the item name case-insensitively and the wiki quantity ignoring whitespace", () => {
    const spaced = ASHES.replace("quantity=1;2", "quantity= 1; 2 ");
    expect(extractDrops(spaced, "", NAME_TO_ID, [], [{ name: "malicious ASHES", wikiQuantity: "1;2", quantity: 1 }]).get(99004)?.expected).toBe(1);
  });

  it("lapses once the wiki line changes, and never touches other items", () => {
    const edited = ASHES.replace("quantity=1;2", "quantity=1;3");
    expect(extractDrops(edited, "", NAME_TO_ID, [], OVERRIDE).get(99004)?.expected).toBe(2); // normal parsing again
    const other = `${ASHES}\n{{DropsLine|name=Big bones|quantity=1;2|rarity=Always}}`;
    expect(extractDrops(other, "", NAME_TO_ID, [], OVERRIDE).get(99005)?.expected).toBe(1.5);
    expect(parseDropTables(ASHES, OVERRIDE)[0].lines).toEqual([{ name: "Malicious ashes", expected: 1 }]);
  });

  it("every quantity-override slug exists in the monster catalog", async () => {
    const { MONSTER_CATALOG } = await import("@/data/monsters/catalog");
    const slugs = new Set(MONSTER_CATALOG.map((m) => m.slug));
    for (const slug of Object.keys(DROP_QUANTITY_OVERRIDES)) expect(slugs.has(slug), slug).toBe(true);
  });
});

describe("extractDrops: which tables make up a normal kill", () => {
  const line = (name: string, rarity: string, extra = "") => `{{DropsLine|name=${name}|quantity=1|rarity=${rarity}${extra}}}`;

  // Yama's shape: untagged main tables, then alternate-mode tables tagged Junk / Contract.
  // The infobox's lone `dropversion` beside numbered versions lists those extras.
  const INFOBOX = ["{{Infobox Monster", "|version1 = Normal", "|version2 = Phase 3", "|dropversion = Contract, Junk", "}}"].join("\n");
  const YAMA_TABLES = [
    "===Unique===",
    "{{DropsTableHead}}",
    line("Oathplate helm", "1/600"),
    line("Soulflame horn", "2/600"),
    "{{DropsTableBottom}}",
    "===Junk===",
    "{{DropsTableHead|dropversion=Junk}}",
    line("Big bones", "Always"),
    "{{DropsTableBottom}}",
    "===Tertiary===",
    "{{DropsTableHead}}",
    line("Aether catalyst", "7/95.11"),
    "{{DropsTableBottom}}",
    "===Contract===",
    "{{DropsTableHead|dropversion=Contract}}",
    line("Oathplate helm", "Always"),
    line("Soulflame horn", "Always"),
    line("Aether catalyst", "Always"),
    "{{DropsTableBottom}}",
  ].join("\n");
  const YAMA = `${INFOBOX}\n${YAMA_TABLES}`;

  it("uses ONLY the untagged tables when the version matches no tag (Yama Normal)", () => {
    const out = drops(YAMA, "Normal");
    expect(out.get(99002)?.expected).toBeCloseTo(1 / 600, 9); // Oathplate helm, not +1 from the Contract table
    expect(out.get(99003)?.expected).toBeCloseTo(2 / 600, 9);
    expect(out.get(99001)?.expected).toBeCloseTo(7 / 95.11, 9); // Aether catalyst, not +1
    expect(out.has(99005)).toBe(false); // the Junk table's Big bones
  });

  it("does the same for a page with no infobox at all, or no version", () => {
    for (const version of ["", "Whatever"]) {
      const out = extractDrops(YAMA_TABLES, version, NAME_TO_ID);
      expect(out.get(99002)?.expected).toBeCloseTo(1 / 600, 9);
      expect(out.has(99005)).toBe(false);
    }
  });

  it("takes only the first-listed alternative when ALL tables are tagged and the version matches none (Scurrius MVP / non-MVP)", () => {
    const wt = [
      "{{Infobox Monster|version1 = Solo|version2 = Group}}",
      "==Drops (MVP/Solo)==",
      "{{DropsTableHead|dropversion=MVP}}",
      line("Big bones", "Always"),
      line("Rune dagger", "6/100"),
      "{{DropsTableHead|dropversion=MVP}}",
      line("Bones", "1/33"),
      "==Drops (non-MVP)==",
      "{{DropsTableHead|dropversion=non-MVP}}",
      line("Big bones", "Always"),
      line("Rune dagger", "3/33"),
      "{{DropsTableHead|dropversion=non-MVP}}",
      line("Bones", "1/33"),
    ].join("\n");
    for (const version of ["Group", "Solo", ""]) {
      const out = drops(wt, version);
      expect(out.get(99005)?.expected, version).toBe(1); // not 2: a kill rolls MVP OR non-MVP
      expect(out.get(1213)?.expected, version).toBeCloseTo(6 / 100, 9); // the MVP rate alone
      expect(out.get(526)?.expected, version).toBeCloseTo(1 / 33, 9); // every table of that alternative counts
    }
  });

  it("first-listed follows document order (zombie pirate Diary / Regular, the Mimic's Elite / Master)", () => {
    const pirate = [
      "{{Infobox Monster|version1 = Level 22|version2 = Level 28|version3 = Level 34|dropversion = Diary,Regular}}",
      "{{DropsTableHead|dropversion=Diary}}",
      line("Rune dagger", "12/378"),
      "{{DropsTableHead|dropversion=Regular}}",
      line("Rune dagger", "12/1260"),
    ].join("\n");
    expect(drops(pirate, "Level 34").get(1213)?.expected).toBeCloseTo(12 / 378, 9);
    const mimic = [
      "{{DropsTableHead|leagueRegion=Kourend|dropversion=Elite}}",
      line("Flax", "Always"),
      "{{DropsTableHead|leagueRegion=Kourend|dropversion=Master}}",
      line("Flax", "Always"),
    ].join("\n");
    expect(drops(mimic, "").get(1779)?.expected).toBe(1);
  });

  it("a multi-tag first table brings in every table sharing its first tag, not the second tag's own tables", () => {
    const wt = [
      "{{DropsTableHead|dropversion=A, B}}",
      line("Bones", "Always"),
      "{{DropsTableHead|dropversion=B}}",
      line("Rune dagger", "Always"),
      "{{DropsTableHead|dropversion=a}}",
      line("Flax", "Always"),
    ].join("\n");
    expect([...drops(wt, "C").keys()].sort((x, y) => x - y)).toEqual([526, 1779]);
  });

  it("leaves a matching version as before: its tables plus the untagged ones, nothing else", () => {
    const wt = [
      "{{DropsTableHead}}",
      line("Bones", "Always"),
      "{{DropsTableHead|dropversion=Normal}}",
      line("Rune dagger", "1/2"),
      "{{DropsTableHead|dropversion=Hard}}",
      line("Hydra's claw", "1/2"),
    ].join("\n");
    expect([...drops(wt, "Normal").keys()].sort((a, b) => a - b)).toEqual([526, 1213]);
    expect([...drops(wt, "Hard").keys()].sort((a, b) => a - b)).toEqual([526, 22966]);
  });

  it("matches a version inside a comma list, ignoring case and spaces", () => {
    const wt = [
      "{{DropsTableHead|dropversion=Regular, Catacombs of Kourend}}",
      line("Bones", "Always"),
      "{{DropsTableHead|dropversion=Wilderness Slayer Cave}}",
      line("Rune dagger", "Always"),
    ].join("\n");
    expect([...drops(wt, "catacombs of kourend").keys()]).toEqual([526]);
    expect([...drops(wt, "Regular").keys()]).toEqual([526]);
  });

  it("follows the infobox's versionN -> dropversionN mapping when the label is not a tag (Black demon Level 188)", () => {
    const wt = [
      "{{Infobox Monster",
      "|version1 = Level 172",
      "|version2 = Level 188",
      "|dropversion1 = Regular,Chasm of Fire",
      "|dropversion2 = Wilderness Slayer Cave",
      "}}",
      "{{DropsTableHead|dropversion=Regular}}",
      line("Malicious ashes", "Always"),
      "{{DropsTableHead|dropversion=Chasm of Fire}}",
      line("Rune dagger", "1/10"),
      "{{DropsTableHead|dropversion=Wilderness Slayer Cave}}",
      line("Malicious ashes", "Always"),
    ].join("\n");
    const out = drops(wt, "Level 188");
    expect(out.get(99004)?.expected).toBe(1); // WSC's ashes only, not Regular's + WSC's
    expect(out.has(1213)).toBe(false);
    expect(drops(wt, "Level 172").get(99004)?.expected).toBe(1); // Regular's only
    expect(drops(wt, "Level 172").has(1213)).toBe(true); // ... plus Chasm of Fire
  });

  it("reads an explicitly empty dropversionN as 'no tagged table applies' (untagged only)", () => {
    const wt = [
      "{{Infobox Monster|version1 = Water|version2 = Land|dropversion1 = On water|dropversion2 =}}",
      "{{DropsTableHead}}",
      line("Bones", "Always"),
      "{{DropsTableHead|dropversion=On water}}",
      line("Rune dagger", "Always"),
    ].join("\n");
    expect([...drops(wt, "Land").keys()]).toEqual([526]);
    expect([...drops(wt, "Water").keys()].sort((a, b) => a - b)).toEqual([526, 1213]);
  });

  it("finds the infobox version through bucketnameN and a lone version/dropversion pair", () => {
    const bucket = "{{Infobox Monster|version1 = 1 (Armed)|bucketname1 = Level 45, 1|dropversion1 = Armed}}";
    expect(infoboxDropVersions(bucket, "Level 45, 1")).toEqual(["Armed"]);
    expect(infoboxDropVersions(bucket, "1 (Armed)")).toEqual(["Armed"]);
    expect(infoboxDropVersions("{{Infobox Monster|version = Level 56,Level 76|dropversion=Rooftop}}", "level 76")).toEqual(["Rooftop"]);
    expect(infoboxDropVersions(bucket, "Level 99")).toBeNull();
    expect(infoboxDropVersions(bucket, "")).toBeNull();
    // a lone dropversion beside numbered versions is the page's extras list, not a mapping
    expect(infoboxDropVersions("{{Infobox Monster|version1 = Normal|dropversion = Contract, Junk}}", "Normal")).toBeNull();
  });

  it("drops free-to-play-only tables when members tables exist, but never when they are all there is", () => {
    const wt = [
      "{{DropsTableHead|dropversion=Members}}",
      line("Rune dagger", "1/2"),
      "{{DropsTableHead|dropversion=Free-to-play}}",
      line("Rune dagger", "1/2"),
    ].join("\n");
    expect(drops(wt, "").get(1213)?.expected).toBe(0.5);
    const f2pOnly = `{{DropsTableHead|dropversion=F2P}}\n${line("Rune dagger", "1/2")}`;
    expect(drops(f2pOnly, "").get(1213)?.expected).toBe(0.5);
    // a free-to-play table listed FIRST still loses to the members one
    const f2pFirst = [
      "{{DropsTableHead|dropversion=Free-to-play}}",
      line("Rune dagger", "1/2"),
      "{{DropsTableHead|dropversion=Members}}",
      line("Rune dagger", "1/4"),
    ].join("\n");
    expect(drops(f2pFirst, "").get(1213)?.expected).toBe(0.25);
  });

  it("an override picks the sub-variant's tables; one the page doesn't carry falls back to the normal rules", () => {
    const wt = [
      "{{DropsTableHead|dropversion=Level 25}}",
      line("Bones", "Always"),
      "{{DropsTableHead|dropversion=Level 48}}",
      line("Rune dagger", "Always"),
    ].join("\n");
    expect([...extractDrops(wt, "Level 48, 1", NAME_TO_ID, ["Level 48"]).keys()]).toEqual([1213]);
    expect([...extractDrops(wt, "Level 48, 1", NAME_TO_ID, ["Level 99"]).keys()]).toEqual([526]); // first-listed (Level 25)
  });

  it("parseDropTables / selectDropTables expose the table split (tags are comma-split and trimmed)", () => {
    const wt = `{{DropsTableHead|dropversion=A, B}}\n${line("Bones", "Always")}\n{{DropsTableHead}}\n${line("Rune dagger", "1/2")}`;
    const tables = parseDropTables(wt);
    expect(tables.map((t) => t.versions)).toEqual([["A", "B"], []]);
    expect(selectDropTables(tables, "b")).toHaveLength(2);
    expect(selectDropTables(tables, "C")).toHaveLength(1); // untagged only
    expect(selectDropTables(tables, "C", ["A"])).toHaveLength(2); // via the infobox mapping
  });

  it("finds multi-word template names", () => {
    const [t] = findTemplates("{{Infobox Monster\n|version1 = A\n}}", ["Infobox Monster"]);
    expect(parseTemplateParams(t.body)).toEqual({ version1: "A" });
  });

  it("every override slug exists in the monster catalog", async () => {
    const { MONSTER_CATALOG } = await import("@/data/monsters/catalog");
    const slugs = new Set(MONSTER_CATALOG.map((m) => m.slug));
    for (const slug of Object.keys(DROP_VERSION_OVERRIDES)) expect(slugs.has(slug), slug).toBe(true);
  });
});

describe("generated data (data/bosses/drops.ts) keeps what the old parser lost", () => {
  const has = (slug: string, name: string) => (DROPS_BY_SLUG[slug] ?? []).find((d) => d.name === name);

  it("Mad Angel keeps Hallowfell and the Ardeaglais teleport", () => {
    expect(has("mad-angel", "Hallowfell")?.expected).toBeGreaterThan(0);
    expect(has("mad-angel", "Ardeaglais teleport")?.expected).toBeGreaterThan(0);
  });

  it("Callisto / Artio / Calvar'ion have the drops hidden behind nested refs", () => {
    expect(has("callisto", "Claws of Callisto")).toBeDefined();
    expect(has("artio", "Dragon 2h sword")).toBeDefined();
    expect(has("calvarion", "Dragon 2h sword")).toBeDefined();
  });

  it("Zulrah flax reflects rolls=2 (≈ 2 × 10/249 × 1000)", () => {
    expect(has("zulrah", "Flax")?.expected).toBeGreaterThan(60);
  });

  it("Yama's normal kill excludes the Contract / Junk tables (Oathplate and Soulflame horn are 1/600-ish, not ~1 per kill)", () => {
    for (const piece of ["Oathplate helm", "Oathplate chest", "Oathplate legs", "Soulflame horn"]) {
      const e = has("yama", piece)?.expected ?? NaN;
      expect(e, piece).toBeGreaterThan(0);
      expect(e, piece).toBeLessThan(0.01);
    }
    expect(has("yama", "Aether catalyst")?.expected ?? NaN).toBeLessThan(100); // not +2000 from the Contract table
  });

  it("Black demon / Greater demon ashes come from their own table, not the sum of every location's", () => {
    // Black demon (Level 188) is the Wilderness Slayer Cave variant: that table's lone `Malicious ashes ... Always`.
    expect(has("black-demon", "Malicious ashes")?.expected).toBe(1);
    // Greater demon (Level 113) uses the "Regular" table. Its line is `quantity=1;2` where the 2nd set is a
    // Chasm-of-Fire-only extra (DROP_QUANTITY_OVERRIDES), so exactly 1 — not the list average 1.5, and not the
    // old bug's 2.5 (the Wilderness Slayer Cave table's 1 added on top).
    expect(has("greater-demon", "Vile ashes")?.expected).toBe(1);
  });

  it("mutually exclusive tables are no longer summed (Scurrius MVP, zombie pirate Diary, the Mimic's Elite casket)", () => {
    // https://oldschool.runescape.wiki/w/Money_making_guide/Killing_Scurrius uses the MVP table's 6/100 rates.
    expect(has("scurrius", "Big bones")?.expected).toBe(1); // was 2 (MVP + non-MVP)
    expect(has("scurrius", "Rune arrow")?.expected).toBeCloseTo(35 * (6 / 100), 6); // was + 27.5 × 3/33
    expect(has("scurrius", "Chaos rune")?.expected).toBeCloseTo(97.5 * (6 / 100), 6); // was 10.85
    // https://oldschool.runescape.wiki/w/Money_making_guide/Killing_zombie_pirates_(Budget) lists the Medium
    // Wilderness Diary as a requirement and uses the Diary table's x/378 rates.
    expect(has("zombie-pirate", "Coins")?.expected).toBeCloseTo(4500 * (12 / 378), 3); // was + 4500 × 12/1260
    expect(has("zombie-pirate", "Bones")?.expected).toBe(1);
    // The Mimic: one plank per kill (only its 100% lines are DropsLines; the rest are DropsLineReward).
    expect(has("the-mimic", "Mahogany plank")?.expected).toBe(1);
  });

  it("variants that matched no tag no longer sum alternate tables", () => {
    expect(has("lesser-demon", "Vile ashes")?.expected).toBe(1);
    expect(has("hellhound", "Vile ashes")?.expected).toBe(1);
    expect(has("black-guard", "Bones")?.expected).toBe(1);
    expect(has("bryophyta", "Big bones")).toBeUndefined(); // the free-to-play table's bones
    expect(has("bronze-dragon", "Dragon bones")?.expected).toBe(1); // used to gate everything out (no drops at all)
  });

  it("Desert Treasure II bosses average their min,max quantity pairs instead of gluing them into one huge number", () => {
    const soul = has("the-whisperer", "Soul rune")?.expected ?? NaN;
    expect(soul).toBeGreaterThan(0);
    expect(soul).toBeLessThan(100); // was ~186,628 per kill
    expect(has("the-leviathan", "Aether catalyst")?.expected ?? NaN).toBeLessThan(100);
  });

  it("Alchemical Hydra uniques are ~1/1000-ish per kill, not ~1 per kill", () => {
    const claw = has("alchemical-hydra", "Hydra's claw")?.expected ?? NaN;
    expect(claw).toBeGreaterThan(0);
    expect(claw).toBeLessThan(0.01);
  });
});
