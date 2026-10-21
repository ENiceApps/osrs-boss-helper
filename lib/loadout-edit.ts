// Client-safe loadout editing: given a base LoadoutSet and a map of per-slot
// item overrides, produce a synthesized LoadoutSet with recomputed totals,
// attack speed, and item-bonus flags. The DPS engine doesn't know whether
// a set came from codegen or live-edit — it gets a normal LoadoutSet shape.

import { ITEM_CATALOG, type ItemCatalogEntry } from "@/data/items/catalog";
import { AMMO_TYPES } from "@/data/ammo-compatibility";
import {
  INTERNAL_AMMO_WEAPONS,
  type InternalAmmoSpec,
} from "@/data/items/internal-ammo-weapons";
import {
  bulwarkDefence,
  bulwarkStrengthBonus,
  rangedDamageUsesMeleeStrength,
} from "@/data/items/special-strength";
import { elementalAmuletKind, hasTrigger } from "@/data/bonus-trigger-items";
import { hasImbuedSlayerHelm } from "@/data/items/slayer-helm";
import { detectArmorSetBonus } from "@/data/armor-sets";
import { spellMaxHit, type SpellEntry } from "@/data/spells/catalog";
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

/** True iff `dart` is a dart this blowpipe can load (class + tier cap). */
function dartFits(dart: ItemCatalogEntry, spec: InternalAmmoSpec): boolean {
  const ammo = AMMO_TYPES[dart.name];
  return ammo?.class === spec.class && ammo.tier <= spec.maxDartTier;
}

/**
 * Every dart a blowpipe can load, best first (highest ranged strength, then
 * the plain "Unpoisoned" variant ahead of its poisoned twins so the default
 * pick reads cleanly). Empty for a weapon that isn't a blowpipe — darts live
 * in the weapon pool of the catalog (they're thrown weapons), so this is the
 * only way to list them for the dart picker.
 */
export function dartsForBlowpipe(weaponId: number | undefined): ItemCatalogEntry[] {
  const spec = weaponId !== undefined ? INTERNAL_AMMO_WEAPONS.get(weaponId) : undefined;
  if (!spec) return [];
  return ITEM_CATALOG.filter((it) => it.slot === "weapon" && dartFits(it, spec)).sort(
    (a, b) => {
      if (a.rangedStr !== b.rangedStr) return b.rangedStr - a.rangedStr;
      const au = a.version === "Unpoisoned" ? 0 : 1;
      const bu = b.version === "Unpoisoned" ? 0 : 1;
      if (au !== bu) return au - bu;
      return a.id - b.id;
    },
  );
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

/**
 * Item-implied conditional bonus flags for a set of worn item ids. The single
 * source for both the optimizer (scenario.ts) and the manual gear editor
 * (applyOverrides) so the two can't drift. Variant-aware (hasTrigger): cosmetic
 * kits and minigame re-imbues carry distinct ids but the same bonus — e.g.
 * Salve amulet(ei) (Emir's Arena), DHCB (t)/(b).
 */
export function itemBonusFlagsFor(slotItemIds: ReadonlySet<number>): ItemBonusFlags {
  return {
    dragonHunterCrossbow: hasTrigger(slotItemIds, "DRAGON_HUNTER_CROSSBOW"),
    dragonHunterLance: hasTrigger(slotItemIds, "DRAGON_HUNTER_LANCE"),
    dragonHunterWand: hasTrigger(slotItemIds, "DRAGON_HUNTER_WAND"),
    salveAmuletEi: hasTrigger(slotItemIds, "SALVE_AMULET_EI") || hasTrigger(slotItemIds, "SALVE_AMULET_E"),
    salveAmulet: hasTrigger(slotItemIds, "SALVE_AMULET") || hasTrigger(slotItemIds, "SALVE_AMULET_I"),
    salveImbued: hasTrigger(slotItemIds, "SALVE_AMULET_EI") || hasTrigger(slotItemIds, "SALVE_AMULET_I"),
    demonbane: hasTrigger(slotItemIds, "ARCLIGHT") || hasTrigger(slotItemIds, "EMBERLIGHT"),
    demonbaneSilverlight: hasTrigger(slotItemIds, "SILVERLIGHT"),
    demonbaneClaws: hasTrigger(slotItemIds, "BURNING_CLAWS"),
    demonbaneScorchingBow: hasTrigger(slotItemIds, "SCORCHING_BOW"),
    kerisPartisan: hasTrigger(slotItemIds, "KERIS_PARTISAN"),
    kerisBreaching: hasTrigger(slotItemIds, "KERIS_PARTISAN_BREACHING"),
    kerisAmascut: hasTrigger(slotItemIds, "KERIS_PARTISAN_AMASCUT"),
    golembaneBarronite: hasTrigger(slotItemIds, "BARRONITE_MACE"),
    golembaneGraniteHammer: hasTrigger(slotItemIds, "GRANITE_HAMMER"),
    tomeOfFire: hasTrigger(slotItemIds, "TOME_OF_FIRE_CHARGED"),
    tomeOfWater: hasTrigger(slotItemIds, "TOME_OF_WATER_CHARGED"),
    tomeOfEarth: hasTrigger(slotItemIds, "TOME_OF_EARTH_CHARGED"),
    twistedBow: hasTrigger(slotItemIds, "TWISTED_BOW"),
    fang: hasTrigger(slotItemIds, "OSMUMTEN_FANG"),
    // Upstream gates the gauntlets on !weapon.isTwoHanded (Tumeken's shadow,
    // the Nightmare staves' two-handed variants get nothing).
    conflictionGauntlets:
      hasTrigger(slotItemIds, "CONFLICTION_GAUNTLETS") &&
      ![...slotItemIds].some((id) => ITEM_BY_ID.get(id)?.isTwoHanded),
    slayerHelmImbued: hasImbuedSlayerHelm(slotItemIds),
    wildernessWeapon: hasTrigger(slotItemIds, "WILDERNESS_WEAPON"),
    elementalAmulet: elementalAmuletKind(slotItemIds),
  };
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
  /**
   * Manually chosen combat spell. `undefined` (or `null`) keeps the base set's
   * auto-selected spell; a `SpellEntry` rewrites the set's spell fields. Magic
   * loadouts only — ignored for other styles and powered staves.
   */
  spellOverride?: SpellEntry | null,
  /** Player magic level, needed to resolve level-scaled spells (Magic Dart). */
  magicLevel?: number,
  /**
   * Dart loaded inside a blowpipe. `undefined` keeps the base set's dart when
   * the resolved weapon can still load it, else loads the best dart the pipe
   * takes (a blowpipe without darts can't fire); an `ItemCatalogEntry` is an
   * explicit pick; `null` unloads the pipe. Ignored — and the base's dart
   * dropped — whenever the resolved weapon is not a blowpipe.
   */
  dartOverride?: ItemCatalogEntry | null,
): LoadoutSet {
  const resolved: LoadoutSet["slots"] = {};
  let attackBonus = 0;
  let melStr = 0;
  let rngStr = 0;
  let magStr = 0;
  let prayerBonus = 0;
  let defenceSum = 0; // Dinh's bulwark scales its strength off this
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
    prayerBonus += item.prayer;
    defenceSum += bulwarkDefence(item);
    if (slot === "weapon" && item.speed > 0) attackSpeedTicks = item.speed;
  }
  // Dinh's bulwark: melee strength from total defence (0 for other weapons).
  melStr += bulwarkStrengthBonus(resolved.weapon?.itemId, defenceSum);

  // Weapon-internal ammo (blowpipe dart). Not in any slot, so the loop above
  // won't have picked it up — resolve it against the RESOLVED weapon so a
  // Tbow swapped in doesn't keep firing the old pipe's darts, and a pipe
  // swapped in gets darts at all, then add its rangedStr to the totals.
  const dartItem = resolveDart(resolved.weapon?.itemId, base, dartOverride);
  const internalAmmo: LoadoutSet["internalAmmo"] = dartItem
    ? { itemId: dartItem.id, itemName: dartItem.name }
    : undefined;
  if (dartItem) rngStr += dartItem.rangedStr;

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

  const slotItemIds = new Set(
    Object.values(resolved).map((s) => s?.itemId).filter((n): n is number => typeof n === "number"),
  );
  const itemBonusFlags = itemBonusFlagsFor(slotItemIds);

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

  // Manual spell override — rewrite the spell fields the DPS engine consumes.
  // Twinflame double-cast flows automatically from autoSpellName downstream
  // (see lib/recommend.ts), so no extra wiring is needed here.
  const spellFields =
    base.style === "magic" && spellOverride
      ? {
          baseSpellMaxHit: spellMaxHit(spellOverride, magicLevel ?? 99),
          spellElement: spellOverride.element,
          autoSpellName: spellOverride.name,
        }
      : {};

  return {
    ...base,
    slots: resolved,
    totals: {
      attackBonus,
      strengthBonus,
      prayerBonus,
      ...(magicDamagePct !== undefined ? { magicDamagePct } : {}),
    },
    attackSpeedTicks: attackSpeedTicks > 0 ? attackSpeedTicks : base.attackSpeedTicks,
    itemBonusFlags,
    weaponCategory,
    armorSetBonus,
    internalAmmo,
    ...spellFields,
  };
}

/**
 * The dart a blowpipe ends up loaded with after an edit (see the
 * `dartOverride` doc on applyOverrides). `undefined` when the weapon isn't a
 * blowpipe or the pipe is deliberately empty.
 */
function resolveDart(
  weaponId: number | undefined,
  base: LoadoutSet,
  dartOverride: ItemCatalogEntry | null | undefined,
): ItemCatalogEntry | undefined {
  const spec = weaponId !== undefined ? INTERNAL_AMMO_WEAPONS.get(weaponId) : undefined;
  if (!spec) return undefined;
  if (dartOverride === null) return undefined;
  if (dartOverride) {
    // The picker only offers darts the pipe takes; anything else falls
    // through to the best legal dart rather than silently emptying the pipe.
    if (dartFits(dartOverride, spec)) return dartOverride;
  } else {
    const carried = base.internalAmmo ? ITEM_BY_ID.get(base.internalAmmo.itemId) : undefined;
    if (carried && dartFits(carried, spec)) return carried;
  }
  return dartsForBlowpipe(weaponId)[0];
}

/** True iff at least one item or spell override differs from the base. */
export function hasOverrides(
  base: LoadoutSet,
  overrides: Partial<Record<LoadoutSlotKey, ItemCatalogEntry | null>>,
  spellOverride?: SpellEntry | null,
  dartOverride?: ItemCatalogEntry | null,
): boolean {
  // A chosen spell that differs from the base's current spell is an override.
  if (base.style === "magic" && spellOverride && spellOverride.name !== base.autoSpellName) {
    return true;
  }
  // A dart pick that differs from what the base pipe holds is an override
  // (`undefined` = untouched; `null` = unloaded, which only counts if the
  // base had a dart).
  if (dartOverride === null ? !!base.internalAmmo : dartOverride && dartOverride.id !== base.internalAmmo?.itemId) {
    return true;
  }
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
