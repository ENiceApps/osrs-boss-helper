// Full-coverage combo generator for the oracle.
//
// The validation set (combos.ts) pins chosen mechanics. This generator instead
// ENUMERATES the catalog so no item or monster goes unchecked:
//
//   weapons   every weapon x every style it has x a target per monster attribute
//   armour    every worn non-weapon item swapped into a base loadout per style
//   ammo      every ammo item on every launcher that takes it
//   spells    every modelled spell on every casting weapon family
//   sets      every armour set on its weapons
//   monsters  every monster and stat phase x a reference loadout per mechanic
//
// It writes chunk files of CanonicalCombo[]; run each through
//   npx tsx scripts/oracle/run-oracle.ts --combos-file=<chunk> --json-out=<out>
//
//   npx tsx scripts/oracle/full-sweep.ts <outDir> [--family=weapons,...] [--chunk=4000]

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { MONSTER_CATALOG, MONSTER_BY_SLUG, type MonsterCatalogEntry } from "@/data/monsters/catalog";
import { WEAPON_STYLES, SPELLCASTING_STAFF_CATEGORIES } from "@/data/weapon-styles";
import { INTERNAL_AMMO_WEAPONS } from "@/data/items/internal-ammo-weapons";
import { MECHANIC_PHASES } from "@/data/bosses/mechanic-phases";
import { isWildernessBoss } from "@/data/monsters/wilderness";
import { ARMOR_SETS } from "@/data/armor-sets";
import { BOLT_EFFECT_BY_ITEM_ID } from "@/data/items/bolt-procs";
import { ALL_SPELLS, spellMaxHit, type SpellEntry } from "@/data/spells/catalog";
import { scoreScenario } from "@/lib/optimize/scenario";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { applyCombatBoost, RANGING_POTION, SATURATED_HEART, SUPER_COMBAT } from "@/lib/dps/boost";
import type { AttackStyleChoice, WeaponAttackType } from "@/types/osrs";
import type { CanonicalCombo } from "./contract";

const warnings: string[] = [];
const BY_ID = new Map(ITEM_CATALOG.map((i) => [i.id, i]));

const PREFERRED_VERSIONS = ["", "Charged", "Regular", "Normal", "Fully charged", "Undamaged", "Unpoisoned"];
function item(name: string, version?: string): number | undefined {
  const want = name.toLowerCase();
  const hits = ITEM_CATALOG.filter((i) => i.name.toLowerCase() === want && (version === undefined || i.version === version));
  if (hits.length === 0) {
    warnings.push(`item not in catalog: ${name}${version ? ` (${version})` : ""}`);
    return undefined;
  }
  for (const v of PREFERRED_VERSIONS) {
    const h = hits.find((i) => i.version === v);
    if (h) return h.id;
  }
  return hits[0].id;
}
const ids = (...names: string[]): number[] => names.map((n) => item(n)).filter((x): x is number => x !== undefined);

function monster(slug: string): MonsterCatalogEntry | undefined {
  const m = MONSTER_BY_SLUG[slug];
  if (!m) warnings.push(`monster not in catalog: ${slug}`);
  return m;
}

const isWeapon = (i: ItemCatalogEntry): boolean => i.slot === "weapon" || i.slot === "2h";
const slotOf = (i: ItemCatalogEntry): string => (i.slot === "2h" ? "weapon" : i.slot);

/** Put `adds` over `base`: same-slot items are replaced; a 2h weapon drops the shield. */
function equip(base: number[], adds: number[]): number[] {
  const bySlot = new Map<string, number>();
  for (const id of [...base, ...adds]) {
    const it = BY_ID.get(id);
    if (!it) continue;
    bySlot.set(slotOf(it), id);
  }
  const weapon = BY_ID.get(bySlot.get("weapon") ?? -1);
  if (weapon?.slot === "2h" || weapon?.isTwoHanded) bySlot.delete("shield");
  return [...bySlot.values()];
}

// ── Shells (no weapon) ──
const MELEE_SHELL = ids("Torva full helm", "Amulet of torture", "Infernal cape", "Bandos chestplate",
  "Bandos tassets", "Ferocious gloves", "Primordial boots", "Berserker ring (i)", "Avernic defender");
const RANGED_SHELL = ids("Armadyl helmet", "Necklace of anguish", "Ava's assembler", "Armadyl chestplate",
  "Armadyl chainskirt", "Zaryte vambraces", "Pegasian boots", "Archers ring (i)");
const MAGIC_SHELL = ids("Ancestral hat", "Occult necklace", "Imbued saradomin cape", "Ancestral robe top",
  "Ancestral robe bottom", "Tormented bracelet", "Eternal boots", "Seers ring (i)");
const shellFor = (t: WeaponAttackType): number[] =>
  t === "ranged" ? RANGED_SHELL : t === "magic" ? MAGIC_SHELL : MELEE_SHELL;

// ── Ammo by trial ──
const AMMO_CANDIDATES = ids(
  "Dragon arrow", "Amethyst arrow", "Rune arrow", "Adamant arrow", "Mithril arrow", "Steel arrow", "Iron arrow", "Bronze arrow",
  "Dragon bolts", "Runite bolts", "Adamant bolts", "Mithril bolts", "Steel bolts", "Iron bolts", "Bronze bolts",
  "Dragon javelin", "Rune javelin", "Bolt rack", "Kebbit bolts", "Long kebbit bolts", "Atlatl dart",
  "Irit tar", "Harralander tar", "Marrentill tar", "Tarromin tar", "Guam tar",
  "Broad bolts", "Broad arrows", "Ogre arrow", "Rune brutal", "Training arrows", "Ice arrows",
);
const DART_CANDIDATES = ids("Dragon dart", "Amethyst dart", "Rune dart", "Adamant dart", "Mithril dart",
  "Steel dart", "Iron dart", "Bronze dart");
const GRAARDOR = MONSTER_BY_SLUG["general-graardor"];

interface Style { attackType: WeaponAttackType; choice: AttackStyleChoice }
interface Spell { baseSpellMaxHit: number; spellElement: SpellEntry["element"]; spellName: string }
const spellOf = (name: string): Spell => {
  const s = ALL_SPELLS.find((x) => x.name === name);
  if (!s) throw new Error(`spell ${name}`);
  return { baseSpellMaxHit: spellMaxHit(s, 99), spellElement: s.element, spellName: s.name };
};
const FIRE_SURGE = spellOf("Fire Surge");

function score(itemIds: number[], style: Style, extra: { internalAmmoId?: number; spell?: Spell } = {}) {
  try {
    return scoreScenario({
      itemIds, target: GRAARDOR, skills: SKILLS_AT_99, attackStyle: style,
      internalAmmoId: extra.internalAmmoId,
      baseSpellMaxHit: extra.spell?.baseSpellMaxHit, spellElement: extra.spell?.spellElement,
      autoSpellName: extra.spell?.spellName,
    });
  } catch {
    return { valid: false as const, reasons: ["threw"] };
  }
}

interface Kit { itemIds: number[]; internalAmmoId?: number }
const kitCache = new Map<string, Kit>();
/** A weapon on its style shell, with the first ammo (or dart) our engine accepts. */
function kitFor(weapon: ItemCatalogEntry, style: Style, spell?: Spell): Kit {
  const key = `${weapon.id}|${style.attackType}`;
  const hit = kitCache.get(key);
  if (hit) return hit;
  const base = equip(shellFor(style.attackType), [weapon.id]);
  let kit: Kit = { itemIds: base };
  const dartSpec = INTERNAL_AMMO_WEAPONS.get(weapon.id);
  const ok = (k: Kit): boolean => {
    const r = score(k.itemIds, style, { internalAmmoId: k.internalAmmoId, spell });
    return r.valid && r.dps.maxHit > 0;
  };
  if (dartSpec) {
    const dart = DART_CANDIDATES.find((d) => ok({ itemIds: base, internalAmmoId: d }));
    if (dart !== undefined) kit = { itemIds: base, internalAmmoId: dart };
  } else if (style.attackType === "ranged" || !ok(kit)) {
    // Ranged: load ammo whenever the weapon takes any (a bow with none is the
    // noammo family's job). Other styles: only when they need it (salamanders).
    const ammo = AMMO_CANDIDATES.find((a) => ok({ itemIds: equip(base, [a]) }));
    if (ammo !== undefined) kit = { itemIds: equip(base, [ammo]) };
  }
  kitCache.set(key, kit);
  return kit;
}

// Stat phases that upstream models as a phase INPUT on one monster entry.
const WG_PHASE_BY_VERSION: Record<string, Record<string, string>> = {
  bork: {
    Base: "Smork HP 100% - 75%",
    "Smorks 75% - 50%": "Smork HP 75% - 50%",
    "Smorks 50% - 25%": "Smork HP 50% - 25%",
    "Smorks 25% - 0%": "Smork HP 25% - 0%",
    Stunned: "Stunned",
  },
};

function combo(
  id: string, boss: MonsterCatalogEntry, kit: Kit, style: Style,
  extra: { spell?: Spell; onTask?: boolean; statPhase?: { version: string; wikiId: number } } = {},
): CanonicalCombo {
  const marked = (boss as { __phase?: string }).__phase;
  if (marked !== undefined && !extra.statPhase) {
    extra = { ...extra, statPhase: { version: marked, wikiId: boss.wikiId } };
    id = `${id}|s:${marked}`;
  }
  const defaultPhase = extra.statPhase ? undefined : MECHANIC_PHASES[boss.slug]?.[0];
  const proc = style.attackType === "ranged" && kit.itemIds.some((i) => BOLT_EFFECT_BY_ITEM_ID.has(i));
  const sang = style.attackType === "magic" && kit.itemIds.some((i) => /sanguinesti staff/i.test(BY_ID.get(i)?.name ?? ""));
  return {
    ...(proc ? { knownMaxHitResidual: "bolt procs: wgloop's max hit includes the proc hit, ours the normal hit" } : {}),
    ...(sang ? { knownMaxHitResidual: "Sanguinesti: wgloop's max hit includes the 1/6 proc" } : {}),
    id,
    itemIds: kit.itemIds,
    internalAmmoId: kit.internalAmmoId,
    bossWikiId: extra.statPhase?.wikiId ?? boss.wikiId,
    bossVersion: (extra.statPhase ? extra.statPhase.version : boss.version) || undefined,
    bossSlug: boss.slug,
    ...(extra.statPhase ? { bossStatPhase: extra.statPhase.version } : {}),
    ...(extra.statPhase && MECHANIC_PHASES[boss.slug]?.[0]?.wikiPhase
      ? { wgPhase: MECHANIC_PHASES[boss.slug][0].wikiPhase }
      : {}),
    ...(WG_PHASE_BY_VERSION[boss.slug]
      ? { wgPhase: WG_PHASE_BY_VERSION[boss.slug][extra.statPhase ? extra.statPhase.version : boss.version] }
      : {}),
    ...(defaultPhase?.wikiPhase
      ? { bossPhase: { mechanicId: defaultPhase.id, wikiPhase: defaultPhase.wikiPhase } }
      : {}),
    inWilderness: isWildernessBoss(boss.slug),
    attackType: style.attackType,
    choice: style.choice,
    ...(extra.spell ?? {}),
    ...(extra.onTask ? { onTask: true } : {}),
  };
}

// ── Targets ──
/** Named targets with their own mechanics, plus one monster per attribute. */
function attributeTargets(): MonsterCatalogEntry[] {
  const named = ["general-graardor", "vorkath", "abyssal-demon", "kalphite-queen", "kurask", "vetion",
    "corporeal-beast", "zulrah", "kreearra", "rune-dragon", "cerberus", "callisto", "araxxor",
    "tormented-demon", "duke-sucellus", "kraken", "commander-zilyana", "gargoyle", "drake"]
    .map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const seen = new Set(named.flatMap((m) => m.attributes));
  const out = [...named];
  for (const m of MONSTER_CATALOG) {
    if (m.wikiId === 0) continue;
    const fresh = m.attributes.filter((a) => !seen.has(a));
    if (fresh.length === 0) continue;
    for (const a of fresh) seen.add(a);
    out.push(m);
  }
  // Vampyre tiers and other attributes the named set already covers only partly.
  for (const attr of ["vampyre1", "vampyre2", "vampyre3", "shade", "golem", "rat", "leafy", "xerician", "spectral", "fiery"]) {
    if (out.some((m) => m.attributes.includes(attr))) continue;
    const m = MONSTER_CATALOG.find((x) => x.wikiId !== 0 && x.attributes.includes(attr));
    if (m) out.push(m);
  }
  return out;
}

function stylesOf(weapon: ItemCatalogEntry): Style[] {
  return (WEAPON_STYLES[weapon.category] ?? []).map((o) => ({ attackType: o.attackType, choice: o.choice }));
}
const needsSpell = (weapon: ItemCatalogEntry, style: Style): boolean =>
  style.attackType === "magic" && SPELLCASTING_STAFF_CATEGORIES.has(weapon.category);

// ── Families ──
/**
 * Versions the app scores as ready to use where the wiki calc reads the
 * version literally: an Empty blowpipe (we load it), an Uncharged Wilderness
 * weapon or Obligator (we charge it), and the Trident of the Seas (o) "Fully
 * charged", which the wiki calc scores 0 through a missing alias.
 */
function ownershipVariant(w: ItemCatalogEntry): boolean {
  if (INTERNAL_AMMO_WEAPONS.has(w.id) && w.version === "Empty") return true;
  if (w.version === "Uncharged" && /(chainmace|craw's bow|webweaver bow|sceptre|obligator)/i.test(w.name)) return true;
  return w.id === 33323;
}

function weaponsFamily(): CanonicalCombo[] {
  const targets = attributeTargets();
  const few = targets.slice(0, 3);
  const out: CanonicalCombo[] = [];
  for (const w of ITEM_CATALOG.filter(isWeapon)) {
    if (ownershipVariant(w)) continue;
    const styles = stylesOf(w);
    if (styles.length === 0) {
      warnings.push(`weapon category has no styles: "${w.category}" (${ITEM_CATALOG.filter((x) => isWeapon(x) && x.category === w.category).length} weapons)`);
      continue;
    }
    // Cosmetic "Unarmed" weapons share one code path: a few targets are enough.
    const ts = w.category === "Unarmed" ? few : targets;
    for (const st of styles) {
      // The Obligator's own styles are Thrust (Accurate / Aggressive) and
      // Smash (Aggressive); on Aggressive we score the better of the two,
      // which one wiki style can't mirror, and it has no Block.
      if (w.name === "Obligator" && st.choice !== "accurate") continue;
      const spell = needsSpell(w, st) ? FIRE_SURGE : undefined;
      const kit = kitFor(w, st, spell);
      for (const t of ts) {
        out.push(combo(`w|${w.id}|${st.attackType}/${st.choice}|${t.slug}`, t, kit, st, { spell }));
      }
    }
  }
  return out;
}

interface Base { key: string; weapon: number; style: Style; spell?: Spell; ammo?: number }
function bases(): Base[] {
  const b = (key: string, name: string, style: Style, o: { spell?: Spell; ammo?: string } = {}): Base | undefined => {
    const weapon = item(name);
    if (weapon === undefined) return undefined;
    return { key, weapon, style, spell: o.spell, ammo: o.ammo ? item(o.ammo) : undefined };
  };
  return [
    b("stab", "Ghrazi rapier", { attackType: "stab", choice: "aggressive" }),
    b("crush", "Dragon warhammer", { attackType: "crush", choice: "aggressive" }),
    b("slash", "Abyssal whip", { attackType: "slash", choice: "controlled" }),
    b("xbow", "Armadyl crossbow", { attackType: "ranged", choice: "rapid" }, { ammo: "Runite bolts" }),
    b("bow", "Magic shortbow (i)", { attackType: "ranged", choice: "rapid" }, { ammo: "Amethyst arrow" }),
    b("spell", "Kodai wand", { attackType: "magic", choice: "longrange" }, { spell: FIRE_SURGE }),
    b("powered", "Trident of the swamp", { attackType: "magic", choice: "accurate" }),
  ].filter((x): x is Base => Boolean(x));
}
const baseKit = (b: Base): number[] =>
  equip(shellFor(b.style.attackType), [b.weapon, ...(b.ammo !== undefined ? [b.ammo] : [])]);

function armourFamily(): CanonicalCombo[] {
  const targets = ["general-graardor", "abyssal-demon", "vorkath", "vetion", "kalphite-queen"]
    .map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const taskTargets = ["abyssal-demon", "vorkath"].map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const out: CanonicalCombo[] = [];
  for (const it of ITEM_CATALOG) {
    if (isWeapon(it) || it.slot === "ammo") continue;
    for (const b of bases()) {
      // A shield can't join a two-handed base; all bases here are one-handed.
      const kit: Kit = { itemIds: equip(baseKit(b), [it.id]) };
      for (const t of targets) {
        out.push(combo(`a|${it.id}|${b.key}|${t.slug}`, t, kit, b.style, { spell: b.spell }));
      }
      if (it.slot === "head" || it.slot === "neck") {
        for (const t of taskTargets) {
          out.push(combo(`a|${it.id}|${b.key}|${t.slug}|task`, t, kit, b.style, { spell: b.spell, onTask: true }));
        }
      }
    }
  }
  return out;
}

function ammoFamily(): CanonicalCombo[] {
  const launchers = ids("Rune crossbow", "Armadyl crossbow", "Zaryte crossbow", "Dragon hunter crossbow",
    "Dragon crossbow", "Karil's crossbow", "Hunters' sunlight crossbow", "Magic shortbow (i)", "Twisted bow",
    "Dark bow", "Scorching bow", "Heavy ballista", "Light ballista", "Eclipse atlatl", "Black salamander",
    "Tecu salamander", "Ogre bow", "Comp ogre bow", "Dorgeshuun crossbow", "Ascension crossbows");
  const targets = ["general-graardor", "vorkath", "abyssal-demon", "corporeal-beast", "zulrah", "kraken",
    "gargoyle", "vetion", "kreearra"].map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const fiery = MONSTER_CATALOG.find((m) => m.wikiId !== 0 && m.attributes.includes("fiery") && !m.attributes.includes("dragon"));
  if (fiery) targets.push(fiery);
  const out: CanonicalCombo[] = [];
  const style: Style = { attackType: "ranged", choice: "rapid" };
  for (const a of ITEM_CATALOG.filter((i) => i.slot === "ammo")) {
    for (const w of launchers) {
      const kit: Kit = { itemIds: equip(RANGED_SHELL, [w, a.id]) };
      const r = score(kit.itemIds, style);
      if (!r.valid) continue;
      for (const t of targets) out.push(combo(`m|${a.id}|${w}|${t.slug}`, t, kit, style));
    }
  }
  // Darts inside each blowpipe.
  for (const [bp] of INTERNAL_AMMO_WEAPONS) {
    // An "Empty" pipe is scored as loaded here by design (the player owns the
    // pipe and loads it); the wiki calc gives an Empty one no dart.
    if (BY_ID.get(bp)?.version === "Empty") continue;
    for (const d of DART_CANDIDATES) {
      const kit: Kit = { itemIds: equip(RANGED_SHELL, [bp]), internalAmmoId: d };
      if (!score(kit.itemIds, style, { internalAmmoId: d }).valid) continue;
      for (const t of targets) out.push(combo(`m|dart${d}|${bp}|${t.slug}`, t, kit, style));
    }
  }
  return out;
}

function spellsFamily(): CanonicalCombo[] {
  const casters = ids("Kodai wand", "Harmonised nightmare staff", "Nightmare staff", "Twinflame staff",
    "Mystic smoke staff", "Smoke battlestaff", "Slayer's staff (e)", "Slayer's staff", "Staff of the dead",
    "Toxic staff of the dead", "Staff of light", "Staff of balance", "Iban's staff (u)", "Saradomin staff",
    "Guthix staff", "Zamorak staff", "Void knight mace", "Purging staff", "Ancient sceptre",
    "Blood ancient sceptre", "Ice ancient sceptre", "Smoke ancient sceptre", "Shadow ancient sceptre",
    "Ahrim's staff", "Accursed sceptre (a)", "Thammaron's sceptre (a)", "Master wand", "Mystic fire staff",
    "Mystic water staff", "Mystic earth staff", "Mystic air staff", "Dragon hunter wand", "Skull sceptre (i)",
    "Staff of fire", "Ancient staff", "Volatile nightmare staff", "Eldritch nightmare staff");
  const offhands: (number | undefined)[] = [undefined, ...ids("Tome of fire", "Tome of water", "Tome of earth",
    "Elidinis' ward (f)", "Book of the dead")];
  const named = ["general-graardor", "abyssal-demon", "vorkath", "vetion", "zulrah", "corporeal-beast", "cerberus"]
    .map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  for (const el of ["fire", "water", "earth", "air"]) {
    const m = MONSTER_CATALOG.find((x) => x.wikiId !== 0 && x.weakness?.element === el && !named.includes(x));
    if (m) named.push(m);
  }
  const style: Style = { attackType: "magic", choice: "longrange" };
  const out: CanonicalCombo[] = [];
  for (const s of ALL_SPELLS) {
    const spell: Spell = { baseSpellMaxHit: spellMaxHit(s, 99), spellElement: s.element, spellName: s.name };
    for (const c of casters) {
      const w = BY_ID.get(c)!;
      const st = stylesOf(w).find((o) => o.attackType === "magic" && o.choice === "longrange");
      if (!st) continue;
      for (const off of offhands) {
        if (off !== undefined && w.slot === "2h") continue;
        const kit: Kit = { itemIds: equip(MAGIC_SHELL, off === undefined ? [c] : [c, off]) };
        for (const t of named) {
          if (s.requiresAttribute && !t.attributes.includes(s.requiresAttribute)) continue;
          out.push(combo(`s|${s.name}|${c}|${off ?? "-"}|${t.slug}`, t, kit, style, { spell }));
        }
      }
    }
  }
  return out;
}

function setsFamily(): CanonicalCombo[] {
  const targets = ["general-graardor", "abyssal-demon", "vorkath", "vetion", "tormented-demon", "corporeal-beast"]
    .map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const out: CanonicalCombo[] = [];
  const extraWeapons: Record<string, string[]> = {
    melee: ["Ghrazi rapier", "Dragon warhammer", "Abyssal whip", "Inquisitor's mace", "Scythe of vitur", "Osmumten's fang"],
    ranged: ["Armadyl crossbow", "Twisted bow", "Toxic blowpipe", "Bow of faerdhinen (c)", "Crystal bow"],
    magic: ["Kodai wand", "Tumeken's shadow", "Trident of the swamp", "Sanguinesti staff"],
  };
  for (const set of ARMOR_SETS) {
    const pieces = set.pieces.map((p) => p.itemIds[0]);
    const weapons = set.requiredWeaponIds ? [...set.requiredWeaponIds] : ids(...extraWeapons[set.style]);
    for (const wid of weapons) {
      const w = BY_ID.get(wid);
      if (!w) continue;
      for (const st of stylesOf(w)) {
        const cs = st.attackType === "ranged" ? "ranged" : st.attackType === "magic" ? "magic" : "melee";
        if (cs !== set.style) continue;
        const spell = needsSpell(w, st) ? FIRE_SURGE : undefined;
        const k = kitFor(w, st, spell);
        const full: Kit = { itemIds: equip(k.itemIds, pieces), internalAmmoId: k.internalAmmoId };
        // The full set, and the set short of each piece in turn (partial sets).
        const variants: [string, Kit][] = [["full", full]];
        pieces.forEach((p, i) => {
          const without = pieces.filter((_, j) => j !== i);
          variants.push([`no${i}`, { itemIds: equip(k.itemIds, without), internalAmmoId: k.internalAmmoId }]);
        });
        for (const [vk, kit] of variants) {
          for (const t of targets) {
            out.push(combo(`t|${set.id}|${vk}|${wid}|${st.attackType}/${st.choice}|${t.slug}`, t, kit, st, { spell }));
          }
        }
      }
    }
  }
  return out;
}

interface Ref { key: string; weapon: string; style: Style; spell?: Spell; ammo?: string; dart?: string; swap?: string[]; task?: boolean }
function refLoadouts(): Ref[] {
  const mA: Style = { attackType: "slash", choice: "aggressive" };
  const stab: Style = { attackType: "stab", choice: "aggressive" };
  const crush: Style = { attackType: "crush", choice: "aggressive" };
  const rapid: Style = { attackType: "ranged", choice: "rapid" };
  const cast: Style = { attackType: "magic", choice: "longrange" };
  const acc: Style = { attackType: "magic", choice: "accurate" };
  return [
    { key: "scythe", weapon: "Scythe of vitur", style: mA },
    { key: "rapier", weapon: "Ghrazi rapier", style: stab },
    { key: "dwh", weapon: "Dragon warhammer", style: crush },
    { key: "fang", weapon: "Osmumten's fang", style: stab },
    { key: "macuahuitl", weapon: "Dual macuahuitl", style: crush },
    { key: "halberd", weapon: "Noxious halberd", style: mA },
    { key: "emberlight", weapon: "Emberlight", style: mA },
    { key: "dhl", weapon: "Dragon hunter lance", style: { attackType: "stab", choice: "controlled" } },
    { key: "keris", weapon: "Keris partisan", style: stab },
    { key: "salve-rapier", weapon: "Ghrazi rapier", style: stab, swap: ["Salve amulet(ei)"] },
    { key: "task-rapier", weapon: "Ghrazi rapier", style: stab, swap: ["Slayer helmet (i)"], task: true },
    { key: "tbow", weapon: "Twisted bow", style: rapid, ammo: "Dragon arrow" },
    { key: "blowpipe", weapon: "Toxic blowpipe", style: rapid, dart: "Dragon dart" },
    { key: "zcb-ruby", weapon: "Zaryte crossbow", style: rapid, ammo: "Ruby dragon bolts (e)" },
    { key: "acb-diamond", weapon: "Armadyl crossbow", style: rapid, ammo: "Diamond bolts (e)" },
    { key: "dhcb", weapon: "Dragon hunter crossbow", style: rapid, ammo: "Dragon bolts" },
    { key: "chin", weapon: "Black chinchompa", style: rapid },
    { key: "darkbow", weapon: "Dark bow", style: rapid, ammo: "Dragon arrow" },
    { key: "task-tbow", weapon: "Twisted bow", style: rapid, ammo: "Dragon arrow", swap: ["Slayer helmet (i)"], task: true },
    { key: "shadow", weapon: "Tumeken's shadow", style: acc },
    { key: "sang", weapon: "Sanguinesti staff", style: acc },
    { key: "fire-surge", weapon: "Kodai wand", style: cast, spell: FIRE_SURGE },
    { key: "water-surge", weapon: "Kodai wand", style: cast, spell: spellOf("Water Surge") },
    { key: "earth-surge", weapon: "Kodai wand", style: cast, spell: spellOf("Earth Surge") },
    { key: "wind-surge", weapon: "Kodai wand", style: cast, spell: spellOf("Wind Surge") },
    { key: "ice-barrage", weapon: "Kodai wand", style: cast, spell: spellOf("Ice Barrage") },
    { key: "task-shadow", weapon: "Tumeken's shadow", style: acc, swap: ["Slayer helmet (i)"], task: true },
  ];
}

function monstersFamily(): CanonicalCombo[] {
  const refs = refLoadouts().map((r) => {
    const w = item(r.weapon, undefined);
    if (w === undefined) return undefined;
    const adds = [w, ...(r.ammo ? ids(r.ammo) : []), ...(r.swap ? ids(...r.swap) : [])];
    const kit: Kit = { itemIds: equip(shellFor(r.style.attackType), adds), internalAmmoId: r.dart ? item(r.dart) : undefined };
    return { r, kit };
  }).filter((x): x is { r: Ref; kit: Kit } => Boolean(x));
  const out: CanonicalCombo[] = [];
  for (const m of MONSTER_CATALOG) {
    if (m.wikiId === 0) continue;
    for (const { r, kit } of refs) {
      if (r.task && !m.isSlayerMonster) continue;
      out.push(combo(`b|${m.slug}|${r.key}`, m, kit, r.style, { spell: r.spell, onTask: r.task }));
    }
    // Every non-default mechanic phase.
    for (const p of (MECHANIC_PHASES[m.slug] ?? []).slice(1)) {
      if (!p.wikiPhase) continue;
      for (const { r, kit } of refs) {
        if (r.task) continue;
        const c = combo(`b|${m.slug}|${r.key}|m:${p.id}`, m, kit, r.style, { spell: r.spell });
        c.bossPhase = { mechanicId: p.id, wikiPhase: p.wikiPhase };
        out.push(c);
      }
    }
    // Every stat phase (its own wiki monster).
    for (const p of m.phases ?? []) {
      if (p.wikiId === m.wikiId && p.version === m.version) continue;
      for (const { r, kit } of refs) {
        if (r.task) continue;
        out.push(combo(`b|${m.slug}|${r.key}|s:${p.version}`, m, kit, r.style,
          { spell: r.spell, statPhase: { version: p.version, wikiId: p.wikiId } }));
      }
    }
  }
  return out;
}

/** Every ranged launcher with an EMPTY ammo slot: both engines should score 0. */
function noAmmoFamily(): CanonicalCombo[] {
  const out: CanonicalCombo[] = [];
  for (const w of ITEM_CATALOG.filter(isWeapon)) {
    for (const st of stylesOf(w)) {
      if (st.attackType !== "ranged" || st.choice !== "rapid") continue;
      if (INTERNAL_AMMO_WEAPONS.has(w.id)) continue;
      out.push(combo(`n|${w.id}|${st.attackType}/${st.choice}|general-graardor`, GRAARDOR,
        { itemIds: equip(RANGED_SHELL, [w.id]) }, st));
    }
  }
  return out;
}

/**
 * Hand-picked mechanics the catalog-wide families don't reach: Barrows set
 * effects, vampyrebane, the monsters with their own hit rules, item variants,
 * potion boosts, Mark of Darkness.
 */
function effectsFamily(): CanonicalCombo[] {
  const out: CanonicalCombo[] = [];
  const T = (...slugs: string[]): MonsterCatalogEntry[] =>
    slugs.map(monster).filter((m): m is MonsterCatalogEntry => Boolean(m));
  const withAttr = (attr: string): MonsterCatalogEntry[] =>
    MONSTER_CATALOG.filter((m) => m.wikiId !== 0 && m.attributes.includes(attr));
  const common = T("general-graardor", "vorkath", "corporeal-beast", "zulrah", "gargoyle", "kraken", "abyssal-demon");
  type Opt = { spell?: Spell; onTask?: boolean; boost?: CanonicalCombo["boost"]; markOfDarkness?: boolean };
  /** Every style of `weapon` (or only `only`), wearing `extras`, vs each target. */
  const add = (
    tag: string, weapon: string, extras: string[], targets: MonsterCatalogEntry[],
    opt: Opt = {}, only?: (st: Style) => boolean, dart?: string,
  ): void => {
    const wid = item(weapon);
    const w = wid === undefined ? undefined : BY_ID.get(wid);
    if (!w) return;
    for (const st of stylesOf(w)) {
      if (only && !only(st)) continue;
      const spell = st.attackType === "magic" ? (needsSpell(w, st) ? (opt.spell ?? FIRE_SURGE) : undefined) : undefined;
      const base = kitFor(w, st, spell);
      const kit: Kit = { itemIds: equip(base.itemIds, ids(...extras)), internalAmmoId: dart ? item(dart) : base.internalAmmoId };
      for (const t of targets) {
        const cmb = combo(`e|${tag}|${w.id}|${st.attackType}/${st.choice}|${t.slug}`, t, kit, st, { spell, onTask: opt.onTask });
        if (opt.boost) {
          const b = { "super-combat": SUPER_COMBAT, ranging: RANGING_POTION, "saturated-heart": SATURATED_HEART }[opt.boost];
          const boosted = applyCombatBoost(SKILLS_AT_99, b);
          cmb.boost = opt.boost;
          cmb.wgBoosts = {
            atk: boosted.attack - 99, str: boosted.strength - 99, ranged: boosted.ranged - 99, magic: boosted.magic - 99,
          };
        }
        if (opt.markOfDarkness) cmb.markOfDarkness = true;
        out.push(cmb);
      }
      // Each stat phase of the targets too (the Hueycoatl's tail, Verzik P1, the Wardens).
    }
  };
  const phased = (slug: string, version: string): MonsterCatalogEntry[] => {
    const m = monster(slug);
    const p = m?.phases?.find((x) => x.version === version);
    if (!m || !p) {
      warnings.push(`no phase ${version} on ${slug}`);
      return [];
    }
    return [{ ...m, ...p, phases: undefined, slug: m.slug, __phase: p.version } as never];
  };
  const offensive = (st: Style): boolean => st.choice !== "defensive" && st.choice !== "longrange";

  // Barrows sets.
  add("veracs", "Verac's flail", ["Verac's helm", "Verac's brassard", "Verac's plateskirt"], common);
  add("karils", "Karil's crossbow", ["Karil's coif", "Karil's leathertop", "Karil's leatherskirt", "Amulet of the damned", "Bolt rack"], common);
  add("karils-nodamned", "Karil's crossbow", ["Karil's coif", "Karil's leathertop", "Karil's leatherskirt", "Bolt rack"], common);
  for (const sp of ["Fire Surge", "Ice Barrage", "Fire Wave"]) {
    add(`ahrims-${sp}`, "Ahrim's staff", ["Ahrim's hood", "Ahrim's robetop", "Ahrim's robeskirt", "Amulet of the damned"], common, { spell: spellOf(sp) });
  }
  add("dharoks", "Dharok's greataxe", ["Dharok's helm", "Dharok's platebody", "Dharok's platelegs"], common);
  add("torags", "Torag's hammers", ["Torag's helm", "Torag's platebody", "Torag's platelegs", "Amulet of the damned"], common);

  // Gadderhammer vs shades.
  add("gadder", "Gadderhammer", [], [...withAttr("shade"), ...T("general-graardor")]);

  // Vampyres, every tier, every bane, with and without Efaritay's aid.
  const vamps = [...withAttr("vampyre1").slice(0, 3), ...withAttr("vampyre2").slice(0, 3), ...withAttr("vampyre3").slice(0, 3)];
  for (const wpn of ["Blisterwood flail", "Blisterwood sickle", "Ivandis flail", "Rod of Ivandis", "Hallowed flail",
    "Sunspear", "Silver sickle (b)", "Silverlight", "Darklight", "Arclight", "Wolfbane", "Blessed axe",
    "Blisterwood stake", "Ghrazi rapier", "Kodai wand", "Twisted bow"]) {
    add("vamp", wpn, [], vamps, {}, offensive);
    add("vamp-efaritay", wpn, ["Efaritay's aid"], vamps, {}, offensive);
  }
  add("vamp-silverbolts", "Rune crossbow", ["Silver bolts"], vamps, {}, offensive);
  add("vamp-silverbolts-efaritay", "Rune crossbow", ["Silver bolts", "Efaritay's aid"], vamps, {}, offensive);

  // Amulet of avarice vs Revenants (and not vs anything else).
  const revs = MONSTER_CATALOG.filter((m) => m.name.startsWith("Revenant")).slice(0, 4);
  for (const wpn of ["Ghrazi rapier", "Twisted bow", "Kodai wand", "Tumeken's shadow", "Craw's bow", "Viggora's chainmace"]) {
    add("avarice", wpn, ["Amulet of avarice"], [...revs, ...T("general-graardor")], {}, offensive);
  }

  // Rat-bone weapons.
  const rats = [...withAttr("rat"), ...T("general-graardor")];
  for (const wpn of ["Bone mace", "Bone shortbow", "Bone staff"]) add("ratbone", wpn, [], rats, {}, offensive);
  add("rat-other", "Ghrazi rapier", [], T("giant-rat-scurrius"));
  add("rat-other", "Twisted bow", [], T("giant-rat-scurrius"));
  add("rat-other", "Kodai wand", [], T("giant-rat-scurrius"));

  // Araxytes' shells, the Respiratory system, zogres.
  const shells = T("acidic-araxyte", "mirrorback-araxyte", "araxyte");
  for (const wpn of ["Noxious halberd", "Zaryte crossbow", "Heavy ballista", "Light ballista", "Dragon warhammer",
    "Ghrazi rapier", "Twisted bow", "Elder maul", "Toxic blowpipe"]) add("shell", wpn, [], shells, {}, offensive);
  for (const wpn of ["Emberlight", "Scorching bow", "Ghrazi rapier", "Twisted bow", "Tumeken's shadow", "Burning claws", "Osmumten's fang"]) {
    add("respiratory", wpn, [], T("respiratory-system"), {}, offensive);
  }
  add("respiratory-demonbane", "Kodai wand", [], T("respiratory-system"), { spell: spellOf("Dark Demonbane") });
  const zogres = T("zogre", "skogre", "slash-bash");
  add("zogre-crumble", "Kodai wand", [], zogres, { spell: spellOf("Crumble Undead") });
  add("zogre-brutal", "Comp ogre bow", ["Rune brutal"], zogres);
  add("zogre-brutal", "Ogre bow", ["Rune brutal"], zogres);
  for (const wpn of ["Ghrazi rapier", "Twisted bow", "Tumeken's shadow"]) add("zogre", wpn, [], zogres, {}, offensive);

  // Stat phases with their own rules.
  const tail = phased("the-hueycoatl", "Tail");
  for (const wpn of ["Dragon warhammer", "Ghrazi rapier", "Scythe of vitur", "Zaryte crossbow", "Twisted bow", "Tumeken's shadow"]) {
    add("huey-tail", wpn, [], tail, {}, offensive);
  }
  add("huey-tail-earth", "Kodai wand", [], tail, { spell: spellOf("Earth Surge") });
  add("huey-tail-fire", "Kodai wand", [], tail, { spell: FIRE_SURGE });
  const p1 = [...phased("verzik-vitur", "Entry mode, Phase 1"), ...phased("verzik-vitur", "Hard mode, Phase 1")];
  for (const wpn of ["Dawnbringer", "Scythe of vitur", "Twisted bow", "Tumeken's shadow", "Zaryte crossbow"]) {
    add("verzik-p1", wpn, [], p1, {}, offensive);
  }
  add("dawnbringer", "Dawnbringer", [], common, {}, offensive);
  const wardens = [...phased("elidinis-warden", "Active"), ...phased("tumekens-warden", "Active"), ...T("elidinis-warden", "tumekens-warden")];
  for (const wpn of ["Twisted bow", "Tumeken's shadow", "Bow of faerdhinen", "Scythe of vitur", "Osmumten's fang", "Zaryte crossbow", "Toxic blowpipe"]) {
    add("wardens", wpn, [], wardens, {}, offensive);
  }
  add("wardens-surge", "Kodai wand", [], wardens, { spell: FIRE_SURGE });

  // Spell-side items.
  for (const sp of ["Fire Bolt", "Earth Bolt", "Wind Bolt", "Fire Blast"]) {
    add(`chaos-${sp}`, "Kodai wand", ["Chaos gauntlets"], common, { spell: spellOf(sp) });
  }
  const leafy = [...withAttr("leafy").slice(0, 3), ...T("abyssal-demon", "general-graardor")];
  for (const staff of ["Slayer's staff (e)", "Slayer's staff", "Staff of the dead", "Kodai wand"]) {
    add("dart", staff, [], leafy, { spell: spellOf("Magic Dart") });
    add("dart-task", staff, ["Slayer helmet (i)"], leafy, { spell: spellOf("Magic Dart"), onTask: true });
  }
  add("dhw-salve", "Dragon hunter wand", ["Salve amulet(ei)"], T("vorkath", "rune-dragon", "general-graardor"), { spell: FIRE_SURGE });
  add("dhw-salve-task", "Dragon hunter wand", ["Salve amulet(ei)", "Slayer helmet (i)"], T("vorkath", "rune-dragon"), { spell: FIRE_SURGE, onTask: true });
  for (const staff of ["Kodai wand", "Purging staff"]) {
    for (const sp of ["Dark Demonbane", "Superior Demonbane"]) {
      const demons = T("abyssal-demon", "duke-sucellus", "tormented-demon", "cerberus", "kril-tsutsaroth");
      add(`demonbane-${sp}`, staff, [], demons, { spell: spellOf(sp) });
      add(`demonbane-mark-${sp}`, staff, [], demons, { spell: spellOf(sp), markOfDarkness: true });
    }
  }

  // Plain (non-imbued) slayer heads on task: melee only.
  for (const head of ["Slayer helmet", "Black mask", "Slayer helmet (i)", "Black mask (i)"]) {
    for (const wpn of ["Ghrazi rapier", "Twisted bow", "Tumeken's shadow", "Eclipse atlatl", "Hunter's spear"]) {
      add(`task-${head}`, wpn, [head], T("abyssal-demon", "vorkath", "kurask"), { onTask: true }, offensive);
      add(`task-${head}-salve`, wpn, [head, "Salve amulet (e)"], T("vorkath"), { onTask: true }, offensive);
    }
  }
  for (const wpn of ["Eclipse atlatl", "Hunter's spear", "Holy water"]) add("thrown", wpn, [], common, {}, offensive);
  add("thrown-salve", "Eclipse atlatl", ["Salve amulet (e)"], T("vorkath"), {}, offensive);
  add("thrown-salve", "Hunter's spear", ["Salve amulet"], T("vorkath"), {}, offensive);

  // Variants that are aliases of a base item.
  const voidOr = ["Void knight top (or)", "Void knight robe (or)", "Void knight gloves (or)"];
  const eliteOr = ["Elite void top (or)", "Elite void robe (or)", "Void knight gloves (or)"];
  add("void-or", "Ghrazi rapier", [...voidOr, "Void melee helm (or)"], common, {}, offensive);
  add("void-or", "Twisted bow", [...eliteOr, "Void ranger helm (or)"], common, {}, offensive);
  add("void-or", "Kodai wand", [...eliteOr, "Void mage helm (or)"], common);
  add("void-or", "Tumeken's shadow", [...voidOr, "Void mage helm (or)"], common, {}, offensive);
  add("obsidian-t", "Tzhaar-ket-om (t)", ["Obsidian helmet", "Obsidian platebody", "Obsidian platelegs", "Berserker necklace (or)"], common, {}, offensive);
  add("obsidian-t", "Tzhaar-ket-om (t)", ["Berserker necklace (or)"], common, {}, offensive);
  for (const bow of ["Bow of faerdhinen (c)", "Bow of faerdhinen", "Crystal bow"]) {
    add("crystal", bow, ["Crystal helm", "Crystal body", "Crystal legs"], common, {}, offensive);
    add("crystal-2", bow, ["Crystal body", "Crystal legs"], common, {}, offensive);
    add("crystal-1", bow, ["Crystal helm"], common, {}, offensive);
  }
  for (const cape of ["Dizana's quiver", "Blessed dizana's quiver", "Dizana's max cape"]) {
    for (const [wpn, ammo] of [["Armadyl crossbow", "Runite bolts"], ["Twisted bow", "Dragon arrow"], ["Heavy ballista", "Dragon javelin"],
      ["Eclipse atlatl", "Atlatl dart"], ["Toxic blowpipe", ""], ["Black salamander", "Harralander tar"], ["Dragon crossbow (cr)", "Runite bolts"]]) {
      add(`dizana-${cape}`, wpn, ammo ? [cape, ammo] : [cape], T("general-graardor", "vorkath"), {}, (st) => st.attackType === "ranged" && st.choice === "rapid");
    }
  }

  // Potion boosts.
  const boostTargets = T("general-graardor", "vorkath", "zulrah", "abyssal-demon");
  for (const wpn of ["Ghrazi rapier", "Scythe of vitur", "Osmumten's fang", "Soulreaper axe", "Dragon warhammer"]) {
    add("boost", wpn, [], boostTargets, { boost: "super-combat" }, offensive);
  }
  for (const wpn of ["Twisted bow", "Toxic blowpipe", "Zaryte crossbow", "Bow of faerdhinen", "Dark bow"]) {
    add("boost", wpn, wpn === "Zaryte crossbow" ? ["Ruby dragon bolts (e)"] : [], boostTargets, { boost: "ranging" }, offensive);
  }
  for (const wpn of ["Tumeken's shadow", "Sanguinesti staff", "Trident of the swamp", "Trident of the seas", "Eye of ayak",
    "Thammaron's sceptre", "Accursed sceptre", "Warped sceptre", "Dawnbringer", "Black salamander", "Zorya's tome"]) {
    add("boost", wpn, [], boostTargets, { boost: "saturated-heart" }, (st) => st.attackType === "magic");
  }
  for (const sp of ["Fire Surge", "Ice Barrage", "Magic Dart", "Fire Bolt"]) {
    add(`boost-${sp}`, sp === "Magic Dart" ? "Slayer's staff (e)" : "Kodai wand", [], boostTargets, { spell: spellOf(sp), boost: "saturated-heart" });
  }
  return out;
}

const FAMILIES: Record<string, () => CanonicalCombo[]> = {
  effects: effectsFamily,
  noammo: noAmmoFamily,
  weapons: weaponsFamily,
  armour: armourFamily,
  ammo: ammoFamily,
  spells: spellsFamily,
  sets: setsFamily,
  monsters: monstersFamily,
};

function main(): void {
  const args = process.argv.slice(2);
  const outDir = resolve(args.find((a) => !a.startsWith("--")) ?? ".oracle/sweep");
  const famArg = args.find((a) => a.startsWith("--family="));
  const chunkArg = args.find((a) => a.startsWith("--chunk="));
  const chunk = chunkArg ? Number(chunkArg.slice("--chunk=".length)) : 4000;
  const families = famArg ? famArg.slice("--family=".length).split(",") : Object.keys(FAMILIES);
  mkdirSync(outDir, { recursive: true });
  for (const f of families) {
    const gen = FAMILIES[f];
    if (!gen) throw new Error(`unknown family ${f}`);
    const combos = gen();
    let n = 0;
    for (let i = 0; i < combos.length; i += chunk) {
      writeFileSync(join(outDir, `${f}-${String(n).padStart(3, "0")}.json`), JSON.stringify(combos.slice(i, i + chunk)), "utf8");
      n++;
    }
    console.log(`${f}: ${combos.length} combos in ${n} chunk(s)`);
  }
  const uniq = [...new Set(warnings)];
  if (uniq.length) console.log(`\n${uniq.length} warning(s):\n  ${uniq.join("\n  ")}`);
}

main();
