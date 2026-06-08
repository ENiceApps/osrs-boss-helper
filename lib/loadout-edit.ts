// Client-safe loadout editing: given a base LoadoutSet and a map of per-slot
// item overrides, produce a synthesized LoadoutSet with recomputed totals,
// attack speed, and item-bonus flags. The DPS engine doesn't know whether
// a set came from codegen or live-edit — it gets a normal LoadoutSet shape.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { rangedDamageUsesMeleeStrength } from "@/data/items/special-strength";
import { BONUS_TRIGGER_ITEM_IDS } from "@/data/loadouts/sets.source";
import { detectArmorSetBonus } from "@/data/armor-sets";
import type {
  AttackType,
  ItemBonusFlags,
  LoadoutSet,
  LoadoutSlotKey,
} from "@/types/loadout";

const ITEM_BY_ID = new Map<number, ItemCatalogEntry>(
  ITEM_CATALOG.map((it) => [it.id, it]),
);

export function findCatalogItem(itemId: number): ItemCatalogEntry | undefined {
  return ITEM_BY_ID.get(itemId);
}

/** All items that fit a given equipment slot, alphabetised by name. */
export function itemsForSlot(slot: LoadoutSlotKey): ItemCatalogEntry[] {
  return ITEM_CATALOG.filter((it) => it.slot === slot).sort((a, b) => {
    // Empty-version variants first; alphabetical within.
    const av = a.version || "";
    const bv = b.version || "";
    if (a.name === b.name) return av.localeCompare(bv);
    return a.name.localeCompare(b.name);
  });
}

/** Pull the right offensive value from an item for the loadout's attack type. */
function offensiveFor(item: ItemCatalogEntry, attackType: AttackType): number {
  switch (attackType) {
    case "stab": return item.attackStab;
    case "slash": return item.attackSlash;
    case "crush": return item.attackCrush;
    case "magic": return item.attackMagic;
    case "ranged": return item.attackRanged;
  }
}

interface ResolvedSlotItem {
  itemId: number;
  itemName: string;
  version?: string;
}

/** Resolve a slot's effective item: override if present, else the base set's entry. */
function resolveSlot(
  slot: LoadoutSlotKey,
  base: LoadoutSet,
  overrides: Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>,
): ResolvedSlotItem | null {
  if (slot in overrides) {
    const ov = overrides[slot];
    if (ov === null) return null; // explicit clear
    if (ov) return { itemId: ov.id, itemName: ov.name, version: ov.version };
  }
  const baseSlot = base.slots[slot];
  return baseSlot ?? null;
}

/**
 * Merge overrides on top of a base set. Produces a fresh LoadoutSet with
 * recomputed totals/speed/itemBonusFlags. The base's predicate, attack
 * style choice, notes, ammo quantity etc. are preserved.
 */
export function applyOverrides(
  base: LoadoutSet,
  overrides: Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>,
): LoadoutSet {
  const resolved: LoadoutSet["slots"] = {};
  let attackBonus = 0;
  let melStr = 0;
  let rngStr = 0;
  let magStr = 0;
  let attackSpeedTicks = 0;
  const slotKeys: LoadoutSlotKey[] = [
    "head", "cape", "neck", "ammo", "weapon", "body",
    "shield", "legs", "hands", "feet", "ring",
  ];
  for (const slot of slotKeys) {
    const ref = resolveSlot(slot, base, overrides);
    if (!ref) continue;
    const item = ITEM_BY_ID.get(ref.itemId);
    if (!item) {
      // Fall back to base's stats if catalog doesn't have it. Shouldn't
      // happen since the slim catalog covers every equippable item.
      resolved[slot] = ref;
      continue;
    }
    resolved[slot] = { itemId: item.id, itemName: item.name, version: item.version || undefined };
    attackBonus += offensiveFor(item, base.attackType);
    melStr += item.str;
    rngStr += item.rangedStr;
    magStr += item.magicStr;
    if (slot === "weapon" && item.speed > 0) attackSpeedTicks = item.speed;
  }

  // Style-specific strength selection (mirrors scripts/build-loadouts.ts).
  let strengthBonus = 0;
  let magicDamagePct: number | undefined;
  switch (base.style) {
    case "melee":
      strengthBonus = melStr;
      break;
    case "ranged":
      // Eclipse atlatl scales ranged damage off the MELEE strength bonus.
      strengthBonus = rangedDamageUsesMeleeStrength(resolved.weapon?.itemId)
        ? melStr
        : rngStr;
      break;
    case "magic":
      strengthBonus = 0;
      magicDamagePct = magStr / 10;
      break;
  }

  // Item-implied conditional bonus flags — same logic as codegen.
  const slotItemIds = new Set(
    Object.values(resolved).map((s) => s?.itemId).filter((n): n is number => typeof n === "number"),
  );
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

  // Respect the base's speed override (e.g. Harmonised's 5→4 reduction).
  // We can't detect that automatically from items, so if the base had a
  // non-weapon-derived speed we'd lose it — but the only override of that
  // kind so far is the Harmonised set's `attackSpeedTicksOverride: 4`, and
  // since editing usually involves picking a new weapon anyway, taking the
  // raw weapon speed is the right default.
  const weaponRef = resolved.weapon;
  const weaponCategory = weaponRef
    ? ITEM_BY_ID.get(weaponRef.itemId)?.category ?? base.weaponCategory
    : base.weaponCategory;
  const armorSetBonus = detectArmorSetBonus(slotItemIds, base.style, {
    attackType: base.attackType,
    weaponId: weaponRef?.itemId,
  });
  return {
    ...base,
    slots: resolved,
    totals: {
      attackBonus,
      strengthBonus,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks: attackSpeedTicks > 0 ? attackSpeedTicks : base.attackSpeedTicks,
    itemBonusFlags,
    weaponCategory,
    armorSetBonus,
  };
}

/** True iff at least one override differs from the base. */
export function hasOverrides(
  base: LoadoutSet,
  overrides: Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>,
): boolean {
  for (const [slot, ov] of Object.entries(overrides) as Array<[LoadoutSlotKey, ItemCatalogEntry | null]>) {
    const baseSlot = base.slots[slot];
    if (ov === null) {
      if (baseSlot) return true;
    } else if (ov) {
      if (!baseSlot || baseSlot.itemId !== ov.id) return true;
    }
  }
  return false;
}
