// Data diff: our item / monster / spell catalogs vs a wiki-calc checkout's
// cdn/json (default .oracle/wgloop-head = upstream HEAD, the live
// dps.osrs.wiki data). Pure data comparison, no engine: every stat the DPS
// engine reads, for every id both sides carry, plus what only one side has.
//
//   npx tsx scripts/oracle/data-diff.ts [cloneDir] [--json=<out>]

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { ALL_SPELLS, spellMaxHit } from "@/data/spells/catalog";

const args = process.argv.slice(2);
const clone = resolve(args.find((a) => !a.startsWith("--")) ?? ".oracle/wgloop-head");
const jsonArg = args.find((a) => a.startsWith("--json="));
const load = (f: string) => JSON.parse(readFileSync(join(clone, "cdn", "json", f), "utf8"));

/* eslint-disable @typescript-eslint/no-explicit-any */
const upItems: any[] = load("equipment.json");
const upMonsters: any[] = load("monsters.json");
const upSpells: any[] = load("spells.json");

const out: { kind: string; key: string; name: string; diffs: string[] }[] = [];

// ── Items ──
const upItemById = new Map(upItems.map((i) => [i.id, i]));
for (const it of ITEM_CATALOG) {
  const u = upItemById.get(it.id);
  if (!u) {
    out.push({ kind: "item-missing-upstream", key: String(it.id), name: `${it.name} [${it.version}]`, diffs: [] });
    continue;
  }
  const pairs: [string, number | string | boolean, number | string | boolean][] = [
    ["slot", it.slot === "2h" ? "weapon" : it.slot, u.slot],
    ["isTwoHanded", it.isTwoHanded, Boolean(u.isTwoHanded)],
    ["category", it.category, u.category ?? ""],
    ["speed", it.speed, u.speed ?? 0],
    ["str", it.str, u.bonuses.str], ["rangedStr", it.rangedStr, u.bonuses.ranged_str],
    ["magicStr", it.magicStr, u.bonuses.magic_str], ["prayer", it.prayer, u.bonuses.prayer],
    ["attackStab", it.attackStab, u.offensive.stab], ["attackSlash", it.attackSlash, u.offensive.slash],
    ["attackCrush", it.attackCrush, u.offensive.crush], ["attackMagic", it.attackMagic, u.offensive.magic],
    ["attackRanged", it.attackRanged, u.offensive.ranged],
    ["defStab", it.defStab, u.defensive.stab], ["defSlash", it.defSlash, u.defensive.slash],
    ["defCrush", it.defCrush, u.defensive.crush], ["defMagic", it.defMagic, u.defensive.magic],
    ["defRanged", it.defRanged, u.defensive.ranged],
  ];
  const diffs = pairs.filter(([, a, b]) => a !== b).map(([f, a, b]) => `${f}: ours ${a} / wiki ${b}`);
  if (diffs.length) out.push({ kind: "item-stat", key: String(it.id), name: `${it.name} [${it.version}]`, diffs });
}
const ourItemIds = new Set(ITEM_CATALOG.map((i) => i.id));
for (const u of upItems) {
  if (!ourItemIds.has(u.id)) out.push({ kind: "item-missing-ours", key: String(u.id), name: `${u.name} [${u.version ?? ""}]`, diffs: [] });
}

// ── Monsters (default entry + every stat phase) ──
const upMonByKey = new Map(upMonsters.map((m) => [`${m.id}|${m.version ?? ""}`, m]));
const upMonById = new Map<number, any[]>();
for (const m of upMonsters) upMonById.set(m.id, [...(upMonById.get(m.id) ?? []), m]);
function diffMonster(slug: string, name: string, e: any): void {
  const u = upMonByKey.get(`${e.wikiId}|${e.version ?? ""}`)
    ?? (upMonById.get(e.wikiId)?.length === 1 ? upMonById.get(e.wikiId)![0] : undefined);
  const label = `${name} [${e.version ?? ""}] #${e.wikiId}`;
  if (!u) {
    const alts = (upMonById.get(e.wikiId) ?? upMonsters.filter((m) => m.name === name)).map((m) => `${m.id}:${m.version}`);
    out.push({ kind: "monster-missing-upstream", key: slug, name: label, diffs: alts.length ? [`wiki has: ${alts.join(", ")}`] : [] });
    return;
  }
  const d = e.defenceBonuses;
  const pairs: [string, unknown, unknown][] = [
    ["name", name, u.name],
    ["hp", e.hp, u.skills.hp], ["defenceLevel", e.defenceLevel, u.skills.def], ["magicLevel", e.magicLevel, u.skills.magic],
    ["magicAttackBonus", e.magicAttackBonus ?? 0, u.offensive.magic ?? 0],
    ["def.stab", d.stab, u.defensive.stab], ["def.slash", d.slash, u.defensive.slash], ["def.crush", d.crush, u.defensive.crush],
    ["def.magic", d.magic, u.defensive.magic], ["def.heavy", d.rangedHeavy, u.defensive.heavy],
    ["def.standard", d.rangedStandard, u.defensive.standard], ["def.light", d.rangedLight, u.defensive.light],
    ["flatArmour", d.flatArmour ?? 0, u.defensive.flat_armour ?? 0],
    ["magicResistance", (d as any).magicResistance ?? 0, u.defensive.magic_resistance ?? 0],
    ["attributes", [...e.attributes].sort().join(","), [...(u.attributes ?? [])].sort().join(",")],
    ["weakness", e.weakness ? `${e.weakness.element}:${e.weakness.severity}` : "", u.weakness ? `${u.weakness.element}:${u.weakness.severity}` : ""],
    ["size", e.size, u.size],
  ];
  const diffs = pairs.filter(([, a, b]) => a !== b).map(([f, a, b]) => `${f}: ours ${a} / wiki ${b}`);
  if (diffs.length) out.push({ kind: "monster-stat", key: slug, name: label, diffs });
}
for (const m of MONSTER_CATALOG) {
  if (m.wikiId === 0) continue;
  diffMonster(m.slug, m.name, m);
  if (m.isSlayerMonster !== undefined) {
    const u = upMonByKey.get(`${m.wikiId}|${m.version ?? ""}`);
    if (u && Boolean(u.is_slayer_monster) !== m.isSlayerMonster) {
      out.push({ kind: "monster-stat", key: m.slug, name: m.name, diffs: [`isSlayerMonster: ours ${m.isSlayerMonster} / wiki ${Boolean(u.is_slayer_monster)}`] });
    }
  }
  for (const p of m.phases ?? []) diffMonster(`${m.slug}|${p.version}`, m.name, { ...p, size: (p as any).size ?? m.size });
}

// ── Spells ──
const ourSpell = new Map(ALL_SPELLS.map((s) => [s.name, s]));
for (const u of upSpells) {
  if (!(u.max_hit > 0)) continue;
  const s = ourSpell.get(u.name);
  if (!s) {
    out.push({ kind: "spell-missing-ours", key: u.name, name: u.name, diffs: [`wiki max ${u.max_hit}`] });
    continue;
  }
  const diffs: string[] = [];
  if (s.baseMaxHit !== u.max_hit && spellMaxHit(s, 99) !== u.max_hit) diffs.push(`max: ours ${spellMaxHit(s, 99)} / wiki ${u.max_hit}`);
  if (s.spellbook !== u.spellbook) diffs.push(`spellbook: ours ${s.spellbook} / wiki ${u.spellbook}`);
  if ((s.element === "none" ? null : s.element) !== (u.element ?? null) && !(s.element === "air" && u.element === "air")) {
    diffs.push(`element: ours ${s.element} / wiki ${u.element}`);
  }
  if (diffs.length) out.push({ kind: "spell", key: u.name, name: u.name, diffs });
}
for (const s of ALL_SPELLS) {
  if (!upSpells.some((u) => u.name === s.name)) out.push({ kind: "spell-missing-upstream", key: s.name, name: s.name, diffs: [] });
}

const counts: Record<string, number> = {};
for (const o of out) counts[o.kind] = (counts[o.kind] ?? 0) + 1;
console.log(counts);
if (jsonArg) writeFileSync(jsonArg.slice("--json=".length), JSON.stringify(out, null, 1), "utf8");
else for (const o of out) console.log(`${o.kind}\t${o.key}\t${o.name}\t${o.diffs.join("; ")}`);
