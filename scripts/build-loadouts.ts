// Codegen: reads data/loadouts/sets.source.ts (hand-curated) + vendored
// wgloop data, writes data/loadouts/sets.generated.ts with computed totals,
// attack speeds, and item-implied bonus flags per loadout. Replaces the
// per-boss build-presets pipeline now that loadouts are universal.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { findItem, sumLoadout } from "../lib/items.js";
import {
  BONUS_TRIGGER_ITEM_IDS,
  LOADOUT_SETS_SOURCE,
} from "../data/loadouts/sets.source.js";
import { findWeaponStyle, type WeaponAttackType } from "../data/weapon-styles.js";
import { checkAmmoCompat } from "../data/ammo-compatibility.js";
import { detectArmorSetBonus } from "../data/armor-sets.js";
import type {
  ItemBonusFlags,
  LoadoutSet,
  LoadoutSetSource,
  LoadoutSlotKey,
} from "../types/loadout.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const HEADER = `// GENERATED FILE — do not edit by hand.
// Run \`npm run build-loadouts\` to regenerate from data/loadouts/sets.source.ts
// and the vendored weirdgloop dataset under data/vendor/wgloop/.
`;

function buildSet(source: LoadoutSetSource): LoadoutSet {
  // Slot labels must match vendor item names (typo guard, same as build-presets).
  for (const [slotKey, ref] of Object.entries(source.slots) as Array<
    [LoadoutSlotKey, { itemId: number; version?: string }]
  >) {
    if (!ref) continue;
    const item = findItem(ref.itemId, ref.version);
    const expectedLabel = source.slotLabels[slotKey];
    if (expectedLabel && expectedLabel !== item.name) {
      throw new Error(
        `Loadout "${source.id}" slot "${slotKey}": label "${expectedLabel}" does not match vendor item ${item.id} name "${item.name}".`,
      );
    }
  }

  const slotRefs = Object.values(source.slots).filter(
    (s): s is { itemId: number; version?: string } => Boolean(s),
  );
  const totals = sumLoadout(slotRefs, source.attackType);

  const weapon = source.slots.weapon
    ? findItem(source.slots.weapon.itemId, source.slots.weapon.version)
    : null;
  if (!weapon) {
    throw new Error(`Loadout "${source.id}" must specify a weapon.`);
  }

  // (weapon.category × attackType × attackStyleChoice) must be a real combo.
  findWeaponStyle(
    weapon.category,
    source.attackType as WeaponAttackType,
    source.attackStyleChoice,
  );

  // Ammo ↔ weapon compatibility.
  if (source.slots.ammo) {
    const ammoItem = findItem(source.slots.ammo.itemId, source.slots.ammo.version);
    const compat = checkAmmoCompat(weapon.name, ammoItem.name);
    if (!compat.ok) {
      throw new Error(`Loadout "${source.id}" ammo/weapon mismatch: ${compat.reason}`);
    }
  }

  const attackSpeedTicks = source.attackSpeedTicksOverride ?? weapon.speed;
  if (attackSpeedTicks <= 0) {
    throw new Error(`Loadout "${source.id}" has no usable attack speed.`);
  }

  // Item-implied flags. Activated at recommend time iff the target's attributes match.
  const slotItemIds = new Set(slotRefs.map((r) => r.itemId));
  const B = BONUS_TRIGGER_ITEM_IDS;
  const itemBonusFlags: ItemBonusFlags = {
    dragonHunterCrossbow: slotItemIds.has(B.DRAGON_HUNTER_CROSSBOW),
    dragonHunterLance: slotItemIds.has(B.DRAGON_HUNTER_LANCE),
    salveAmuletEi: slotItemIds.has(B.SALVE_AMULET_EI) || slotItemIds.has(B.SALVE_AMULET_E),
    salveAmulet: slotItemIds.has(B.SALVE_AMULET) || slotItemIds.has(B.SALVE_AMULET_I),
    demonbane: slotItemIds.has(B.ARCLIGHT) || slotItemIds.has(B.EMBERLIGHT),
    tomeOfFire: slotItemIds.has(B.TOME_OF_FIRE_CHARGED),
    twistedBow: slotItemIds.has(B.TWISTED_BOW),
  };

  // Style-specific strength selection.
  let strengthBonus = 0;
  let magicDamagePct: number | undefined;
  switch (source.style) {
    case "melee":
      strengthBonus = totals.strBonus;
      break;
    case "ranged":
      strengthBonus = totals.rangedStrBonus;
      break;
    case "magic":
      strengthBonus = 0;
      magicDamagePct = totals.magicStrSum / 10;
      break;
  }

  const computedSlots: LoadoutSet["slots"] = {};
  for (const [slotKey, ref] of Object.entries(source.slots) as Array<
    [LoadoutSlotKey, { itemId: number; version?: string }]
  >) {
    if (!ref) continue;
    const item = findItem(ref.itemId, ref.version);
    computedSlots[slotKey] = {
      itemId: item.id,
      itemName: item.name,
      version: ref.version,
    };
  }

  return {
    id: source.id,
    name: source.name,
    style: source.style,
    tier: source.tier,
    attackType: source.attackType,
    attackStyleChoice: source.attackStyleChoice,
    appliesWhen: source.appliesWhen,
    slots: computedSlots,
    totals: {
      attackBonus: totals.attackBonus,
      strengthBonus,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks,
    baseSpellMaxHit: source.baseSpellMaxHit,
    spellElement: source.spellElement,
    ammoQuantity: source.ammoQuantity,
    notes: source.notes,
    itemBonusFlags,
    weaponCategory: weapon.category,
    armorSetBonus: detectArmorSetBonus(slotItemIds, source.style, {
      attackType: source.attackType,
      weaponId: weapon.id,
    }),
  };
}

const built = LOADOUT_SETS_SOURCE.map(buildSet);

const lines: string[] = [HEADER];
lines.push(`import type { LoadoutSet } from "@/types/loadout";`);
lines.push("");
lines.push(`export const LOADOUT_SETS: LoadoutSet[] = ${JSON.stringify(built, null, 2)};`);
lines.push("");
lines.push(`export const LOADOUT_SET_BY_ID: Record<string, LoadoutSet> = Object.fromEntries(`);
lines.push(`  LOADOUT_SETS.map((s) => [s.id, s]),`);
lines.push(`);`);
lines.push("");

writeFileSync(resolve(ROOT, "data/loadouts/sets.generated.ts"), lines.join("\n"), "utf8");
console.log(`Wrote data/loadouts/sets.generated.ts (${built.length} sets)`);
for (const b of built) {
  const flags = Object.entries(b.itemBonusFlags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(",");
  console.log(
    `  ${b.id} [${b.style}/${b.tier}]: atk=${b.totals.attackBonus} str=${b.totals.strengthBonus}${
      b.totals.magicDamagePct ? ` mDmg=${b.totals.magicDamagePct}%` : ""
    } ticks=${b.attackSpeedTicks} flags=${flags || "none"}`,
  );
}
