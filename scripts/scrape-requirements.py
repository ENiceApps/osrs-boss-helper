"""
Prototype: build per-item combat level requirements from the OSRS wiki's
STRUCTURED skill/equipment tables (not per-item prose).

Sources (one fetch each):
  - Attack/Weapons table   -> melee weapon Attack reqs (+ secondary {{SCP}} reqs)
  - Armour/Melee armour    -> melee armour Defence reqs   (set-based rows)
  - Armour/Ranged armour   -> ranged armour Ranged+Defence (per-item rows)
  - Armour/Magic armour    -> magic armour Magic+Defence  (set-based rows)
Ranged & magic WEAPONS have no clean table (template-generated displays), so
those few categories fall back to a one-time item-page prose parse.

Output: data/vendor/wiki/item-requirements.json  keyed by item id.
This is a build-time artifact — scraped once, baked into the catalog.
"""
import urllib.request, urllib.parse, json, re, time, os

UA = {"User-Agent": "osrs-boss-helper-research/1.0 (personal project; contact dev)"}
COMBAT = {"Attack","Strength","Defence","Ranged","Magic","Hitpoints","Prayer"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RANGED_CATS = {"Crossbow","Two-handed Crossbow","Bow","Thrown","Chinchompas","Blowpipe","Salamander"}
MAGIC_CATS  = {"Staff","Bladed Staff","Powered Staff","Wand"}
ARMOUR_SLOTS = {"head","body","legs","feet","hands","shield","cape","neck","ring"}

def api_parse(page):
    url = "https://oldschool.runescape.wiki/api.php?" + urllib.parse.urlencode({
        "action":"parse","page":page,"prop":"wikitext","format":"json","formatversion":"2"})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        d = json.load(r)
    return None if "error" in d else d["parse"]["wikitext"]

def api_revisions(titles):
    url = "https://oldschool.runescape.wiki/api.php?" + urllib.parse.urlencode({
        "action":"query","prop":"revisions","rvprop":"content","rvslots":"main",
        "format":"json","formatversion":"2","titles":"|".join(titles)})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return json.load(r)

# ---- catalog ----
with open(os.path.join(ROOT,"data/vendor/wgloop/equipment.json"), encoding="utf-8") as f:
    EQUIP = json.load(f)

by_name = {}
for it in EQUIP:
    by_name.setdefault((it.get("name") or "").lower(), []).append(it)

def is_melee_weapon(it):
    return it.get("slot") in ("weapon","2h") and it.get("category") not in (RANGED_CATS|MAGIC_CATS)

def num(v): return v if isinstance(v, (int, float)) else 0

def meta_relevant(it):
    """Items worth a prose fallback when tables miss them: weapons, real armour,
    or anything with a meaningful offensive/str/prayer bonus. Excludes junk."""
    o = it.get("offensive") or {}; d = it.get("defensive") or {}; b = it.get("bonuses") or {}
    return (it.get("slot") in ("weapon", "2h")
            or max((num(o.get(k)) for k in ("stab","slash","crush","magic","ranged")), default=0) >= 15
            or max((num(d.get(k)) for k in ("stab","slash","crush","magic","ranged")), default=0) >= 50
            or max((num(b.get(k)) for k in ("str","ranged_str","magic_str")), default=0) >= 4
            or num(b.get("prayer")) >= 4)

# requirements accumulator: id -> {Skill: level}
REQS = {}
# Slots that actually carry combat level requirements. neck/ring/cape/ammo are
# excluded from the prose fallback (reqs there are rare and prose misfires).
PROSE_SLOTS = {"weapon", "2h", "head", "body", "legs", "feet", "hands", "shield"}

def add(it, skill, lvl):
    # Drop level-<=1 reqs: they're always satisfiable, so storing them is pure
    # noise (and removes phantom "Attack 1"/"Defence 1" prose matches).
    if skill not in COMBAT or not lvl or lvl <= 1: return
    d = REQS.setdefault(it["id"], {})
    d[skill] = max(lvl, d.get(skill, 0))

# ---- wikitext helpers ----
def split_cells(row):
    row = re.sub(r"\n\s*\|", "||", row.strip())   # newline-led cells -> ||
    return [c.strip() for c in row.split("||")]

def first_int(cell):
    m = re.match(r"\s*\|?\s*(\d{1,3})", cell)
    return int(m.group(1)) if m else None

def cell_name(cell):
    m = re.search(r"\{\{\s*plink[tp]?\s*\|\s*([^|}]+)", cell, re.I)
    if m: return m.group(1).strip()
    m = re.search(r"\{\{\s*Plink\s*\|\s*([^|}]+)", cell)
    if m: return m.group(1).strip()
    m = re.search(r"\[\[\s*File:\s*([^|\]]+?)\.png", cell, re.I)
    if m: return m.group(1).strip()
    m = re.search(r"\[\[\s*([^|\]]+)", cell)
    if m and "File:" not in m.group(1): return m.group(1).strip()
    return None

def collect_names(cells):
    """Every candidate item/set name in a cell range: plink params, [[File:X.png]]
    derived names, and plain [[wiki links]] (which may be set pages)."""
    names = []
    for c in cells:
        for m in re.finditer(r"\{\{\s*[Pp]link[tp]?\s*\|\s*([^|}]+)", c):
            names.append(m.group(1).strip())
        for m in re.finditer(r"\[\[\s*([^|\]]+?)\s*[|\]]", c):
            v = m.group(1).strip()
            fm = re.match(r"File:\s*(.+?)\.png", v, re.I)
            if fm: names.append(fm.group(1).strip())
            elif not v.lower().startswith("file:"): names.append(v)
    return names

TIER_SUFFIX = re.compile(r"\s+(weapons|armour|armor|equipment|robes|set|gear)$", re.I)
def resolve(name, slot_ok):
    """Exact catalog match first; else prefix-expand ONLY when `name` carries a
    set/tier suffix (so bare links like [[Barrows]] can't over-match)."""
    if not name: return []
    exact = [it for it in by_name.get(name.lower(), []) if slot_ok(it)]
    if exact: return exact
    if not TIER_SUFFIX.search(name): return []
    base = TIER_SUFFIX.sub("", name).strip().lower()
    if not base: return []
    out = []
    for it in EQUIP:
        nm = (it.get("name") or "").lower()
        if slot_ok(it) and (nm == base or nm.startswith(base + " ")):
            out.append(it)
    return out

def scp_reqs(text):
    """Parse {{SCP|Skill|N}} (N optional -> inherits primary) from a cell."""
    out = []
    for m in re.finditer(r"\{\{\s*SCP\s*\|\s*([A-Za-z]+)\s*(?:\|\s*(\d{1,3}))?", text):
        sk = m.group(1).strip().capitalize()
        lvl = int(m.group(2)) if m.group(2) else None
        if sk in COMBAT: out.append((sk, lvl))
    return out

# ---- table parsers ----
def parse_attack_weapons(wt):
    n = 0
    for row in wt.split("|-")[1:]:
        row = row.split("|}")[0]   # drop table-end + any trailing sections
        cells = split_cells(row)
        nums = [(i,first_int(c)) for i,c in enumerate(cells)]
        lvl_idx = next((i for i,v in nums if v is not None), None)
        if lvl_idx is None: continue
        lvl = first_int(cells[lvl_idx])
        name = next((cell_name(c) for c in cells[lvl_idx+1:] if cell_name(c)), None)
        if not name: continue
        items = resolve(name, is_melee_weapon)
        other = " ".join(cells[lvl_idx+1:])
        for it in items:
            add(it, "Attack", lvl); n += 1
            for sk, l in scp_reqs(other):
                add(it, sk, l if l is not None else lvl)
    return n

def parse_armour(wt, level_skills):
    """level_skills: skills for the leading numeric columns, in order.
    Rows are set-based (representative piece + [[Set]] link) — collect all names
    in the row and union their resolved pieces."""
    n = 0
    for row in wt.split("|-")[1:]:
        row = row.split("|}")[0]   # drop table-end + any trailing sections
        cells = [c for c in split_cells(row) if c != ""]
        lvls = []
        idx = 0
        while idx < len(cells) and first_int(cells[idx]) is not None and idx < len(level_skills):
            lvls.append(first_int(cells[idx])); idx += 1
        if not lvls: continue
        found = {}
        for nm in collect_names(cells[idx:]):
            for it in resolve(nm, lambda it: it.get("slot") in ARMOUR_SLOTS):
                found[it["id"]] = it
        for it in found.values():
            for sk, lv in zip(level_skills, lvls):
                add(it, sk, lv)
            n += 1
    return n

# ---- prose fallback (ranged & magic weapons only) ----
def parse_prose(wt):
    lead = re.split(r"\n==", wt, maxsplit=1)[0]
    reqs = {}
    for s in re.split(r"(?<=[.])\s+", lead):
        if not re.search(r"to\s+(?:wield|wear|equip)\b", s, re.I): continue
        for m in re.finditer(r"(\d{1,3})\s+(?:in\s+)?\[\[([A-Za-z][A-Za-z ]*?)(?:\|[^\]]*)?\]\]", s):
            lvl=int(m.group(1)); first=m.group(2).strip().capitalize()
            if first in COMBAT: reqs[first]=max(lvl,reqs.get(first,0))
            tail=re.split(r"\d", s[m.end():],maxsplit=1)[0]
            if re.match(r"^[\s,]*(?:and\s+|as well as\s+)?\[\[",tail):
                for c in re.findall(r"\[\[([A-Za-z][A-Za-z ]*?)(?:\|[^\]]*)?\]\]",tail):
                    c=c.strip().capitalize()
                    if c in COMBAT: reqs[c]=max(lvl,reqs.get(c,0))
        for m in re.finditer(r"\[\[([A-Za-z][A-Za-z ]*?)(?:\|[^\]]*)?\]\]\s+level\s+of\s+(\d{1,3})", s):
            sk=m.group(1).strip().capitalize()
            if sk in COMBAT: reqs[sk]=max(int(m.group(2)),reqs.get(sk,0))
    return reqs

# ===== run =====
print("Fetching structured tables...")
add_n = parse_attack_weapons(api_parse("Attack/Weapons table"))
print(f"  Attack/Weapons table     -> {add_n} item-assignments")
n = parse_armour(api_parse("Armour/Melee armour"),  ["Defence"]);           print(f"  Armour/Melee armour      -> {n}")
n = parse_armour(api_parse("Armour/Ranged armour"), ["Ranged","Defence"]);  print(f"  Armour/Ranged armour     -> {n}")
n = parse_armour(api_parse("Armour/Magic armour"),  ["Magic","Defence"]);   print(f"  Armour/Magic armour      -> {n}")

# Prose fallback: any meta-relevant item the structured tables DIDN'T cover
# (ranged/magic weapons, plus stragglers like Barrows, defenders, Elite Void).
# Tables already populated REQS, so this only fills genuine gaps.
covered = set(REQS.keys())
fallback_titles = sorted({it["name"] for it in EQUIP
                          if it["id"] not in covered and it.get("slot") in PROSE_SLOTS
                          and meta_relevant(it) and it.get("name")})
print(f"\nProse fallback for {len(fallback_titles)} uncovered weapon/armour pages...")
for i in range(0, len(fallback_titles), 50):
    d = api_revisions(fallback_titles[i:i+50])
    for pg in d.get("query",{}).get("pages",[]):
        revs = pg.get("revisions") or []
        if not revs: continue
        reqs = parse_prose(revs[0]["slots"]["main"]["content"])
        for it in by_name.get(pg["title"].lower(), []):
            if it["id"] in covered or it.get("slot") not in PROSE_SLOTS: continue
            for sk,lv in reqs.items(): add(it, sk, lv)
    time.sleep(0.3)

print(f"\nTotal items with >=1 requirement: {len(REQS)}")

# ---- verification ----
def show(name):
    ids = [it["id"] for it in by_name.get(name.lower(), [])]
    got = {}
    for i in ids:
        got.update(REQS.get(i, {}))
    print(f"   {name:28} {got}")

print("\nVERIFY (expected in comments):")
show("Dragon hunter crossbow")  # Ranged 70
show("Rune crossbow")           # Ranged 61
show("Armadyl crossbow")        # Ranged 70
show("Twisted bow")             # Ranged 85
show("Toxic blowpipe")          # Ranged 75
show("Masori body (f)")         # Ranged 80, Defence 80
show("Armadyl chestplate")      # Ranged 70, Defence 70
show("Torva platebody")         # Defence 80
show("Bandos chestplate")       # Defence 65
show("Ancestral robe top")      # Magic 75, Defence 65
show("Rune scimitar")           # Attack 40
show("Dragon scimitar")         # Attack 60
show("Abyssal whip")            # Attack 70
show("Osmumten's fang")         # Attack 82
show("Sanguinesti staff")       # Magic 82 (+75? )
show("Tumeken's shadow")        # Magic 85

# ---- write artifact ----
out_dir = os.path.join(ROOT, "data/vendor/wiki")
os.makedirs(out_dir, exist_ok=True)
out = {str(k): v for k, v in sorted(REQS.items())}
with open(os.path.join(out_dir, "item-requirements.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, indent=0)
print(f"\nWrote data/vendor/wiki/item-requirements.json ({len(out)} items)")
