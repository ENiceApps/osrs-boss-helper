// Per-slot "why was this picked" explanations powering the loadout doll's
// hover tooltips. Pure derivation from pieces that already exist: catalog
// stats for the bonus line, a recompute-with-the-slot-emptied for the
// marginal DPS, and the target-conditional flags for the highlighted reasons.

import { applyOverrides, findCatalogItem } from "@/lib/loadout-edit";
import { computeSetDps } from "@/lib/recommend";
import { applyCombatBoost } from "@/lib/dps/boost";
import { describeBoltProc, resolveBoltProc } from "@/lib/dps/bolts";
import { rangedDamageUsesMeleeStrength } from "@/data/items/special-strength";
import type { TargetActiveBonuses } from "@/lib/loadout";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { AttackType, LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { DpsResult, Skills } from "@/types/osrs";

export interface SlotExplanation {
  /** Style-relevant stat contribution, e.g. "+12 ranged acc · +6 ranged str". */
  bonusLine?: string;
  /** DPS lost if this slot were emptied. Undefined for the weapon slot —
      emptying the weapon isn't a meaningful comparison. */
  marginalDps?: number;
  /**
   * GP / sell-to-fund modes only: DPS gained over the bank item this upgrade
   * replaced. When present, the tooltip shows this instead of the empty-slot
   * marginal — the player is comparing the new item to what they already had.
   */
  vsBank?: { dpsDelta: number; vsItemName: string | null };
  /** Target-specific reasons this item earns its slot (conditional bonuses). */
  reasons: string[];
}

const SLOT_KEYS: LoadoutSlotKey[] = [
  "head",
  "cape",
  "neck",
  "ammo",
  "weapon",
  "body",
  "shield",
  "legs",
  "hands",
  "feet",
  "ring",
];

function fmtSigned(n: number): string {
  return n >= 0 ? `+${n}` : String(n);
}

function offensiveFor(item: ItemCatalogEntry, attackType: AttackType): number {
  switch (attackType) {
    case "stab": return item.attackStab;
    case "slash": return item.attackSlash;
    case "crush": return item.attackCrush;
    case "magic": return item.attackMagic;
    case "ranged": return item.attackRanged;
  }
}

/** "+85 slash acc · +82 str · +1 prayer" — only the stats this build scores. */
function buildBonusLine(item: ItemCatalogEntry, set: LoadoutSet): string {
  const parts: string[] = [];
  const acc = offensiveFor(item, set.attackType);
  if (acc !== 0) parts.push(`${fmtSigned(acc)} ${set.attackType} acc`);
  switch (set.style) {
    case "melee":
      if (item.str !== 0) parts.push(`${fmtSigned(item.str)} str`);
      break;
    case "ranged":
      // Eclipse atlatl scales ranged damage off MELEE strength.
      if (rangedDamageUsesMeleeStrength(set.slots.weapon?.itemId)) {
        if (item.str !== 0) parts.push(`${fmtSigned(item.str)} melee str (atlatl)`);
      } else if (item.rangedStr !== 0) {
        parts.push(`${fmtSigned(item.rangedStr)} ranged str`);
      }
      break;
    case "magic":
      // magic_str is tenths of a percent.
      if (item.magicStr !== 0) parts.push(`+${(item.magicStr / 10).toFixed(1)}% magic dmg`);
      break;
  }
  if (item.prayer !== 0) parts.push(`${fmtSigned(item.prayer)} prayer`);
  return parts.length > 0 ? parts.join(" · ") : "no offensive stats for this build";
}

/** Target-conditional reasons, attributed to the slot that grants them. */
function buildReasons(
  slot: LoadoutSlotKey,
  set: LoadoutSet,
  activeBonuses: TargetActiveBonuses | null,
): string[] {
  const reasons: string[] = [];
  const cb = activeBonuses?.conditionalBonuses;
  if (slot === "weapon") {
    reasons.push(
      `${set.attackSpeedTicks}-tick ${set.style} weapon — every other slot is picked around it`,
    );
    if (cb?.dragonHunterCrossbow) reasons.push("+30% accuracy / +25% damage vs this dragon");
    if (cb?.dragonHunterLance) reasons.push("+20% accuracy & damage vs this dragon");
    if (cb?.dragonHunterWand) reasons.push("+75% accuracy / +40% damage vs this dragon");
    if (cb?.demonbane) reasons.push("+70% accuracy & damage vs this demon");
    if (cb?.demonbaneSilverlight) reasons.push("+60% accuracy & damage vs this demon");
    if (cb?.demonbaneClaws) reasons.push("+5% accuracy & damage vs this demon");
    if (cb?.demonbaneScorchingBow) reasons.push("+30% accuracy & damage vs this demon");
    if (activeBonuses?.twistedBowEquipped)
      reasons.push(
        `scales with the target's magic level (${activeBonuses.targetMonsterMagicLevel})`,
      );
    if (activeBonuses?.fangEquipped)
      reasons.push("rolls accuracy twice on stab — much higher hit chance");
    if (set.slots.weapon?.itemId === 30634)
      reasons.push("Twinflame: +10% acc/dmg on standard spells, +40% second cast on Bolt/Blast/Wave");
  }
  if (slot === "neck") {
    if (cb?.salveAmuletEi) reasons.push("+20% accuracy & damage vs this undead target");
    else if (cb?.salveAmulet) reasons.push("+16.7% accuracy & damage vs this undead target");
  }
  if (slot === "shield") {
    if (activeBonuses?.tomeOfFireEquipped)  reasons.push("+10% fire spell damage");
    if (activeBonuses?.tomeOfWaterEquipped) reasons.push("+20% water spell accuracy & damage");
    if (activeBonuses?.tomeOfEarthEquipped) reasons.push("+10% earth spell accuracy & damage");
  }
  return reasons;
}

/**
 * Explain every filled slot of a loadout: what the item contributes, what the
 * build loses without it, and any target-specific bonus it carries. The
 * marginal DPS is the honest number — it re-runs the engine with the slot
 * emptied, so conditional multipliers (Salve, set bonuses) are priced in.
 */
export function explainSlots(
  set: LoadoutSet,
  dps: DpsResult,
  monster: MonsterCatalogEntry,
  skills: Skills,
  boost: Parameters<typeof computeSetDps>[3],
  activeBonuses: TargetActiveBonuses | null,
  /** Ruby bolt special assumed to fire (default ON) — mirrors the engine's toggle. */
  rubyProcEnabled = true,
  /** Mark of Darkness active (default OFF) — mirrors the engine's toggle. */
  markOfDarkness = false,
): Partial<Record<LoadoutSlotKey, SlotExplanation>> {
  const out: Partial<Record<LoadoutSlotKey, SlotExplanation>> = {};
  // Enchanted-bolt proc on the ammo slot — same resolution the engine uses.
  const boltProc = set.style === "ranged"
    ? resolveBoltProc({
        ammoItemId: set.slots.ammo?.itemId,
        weaponItemId: set.slots.weapon?.itemId,
        weaponCategory: set.weaponCategory,
        visibleRangedLevel: applyCombatBoost(skills, boost).ranged,
        target: { hp: monster.hp, attributes: monster.attributes, slug: monster.slug },
        rubyProcEnabled,
      })
    : undefined;
  for (const slot of SLOT_KEYS) {
    const piece = set.slots[slot];
    if (!piece) continue;
    const item = findCatalogItem(piece.itemId);
    const explanation: SlotExplanation = {
      bonusLine: item ? buildBonusLine(item, set) : undefined,
      reasons: buildReasons(slot, set, activeBonuses),
    };
    if (slot === "ammo" && boltProc) {
      explanation.reasons.push(describeBoltProc(boltProc));
    }
    if (slot !== "weapon" && dps.dps > 0) {
      const without = applyOverrides(set, { [slot]: null });
      const dpsWithout = computeSetDps(
        without, monster, skills, boost,
        false, false, undefined, undefined, rubyProcEnabled, markOfDarkness,
      );
      explanation.marginalDps = Math.max(0, dps.dps - dpsWithout.dps);
    }
    out[slot] = explanation;
  }
  return out;
}
