// Per-slot "how much did this upgrade gain over the bank item it replaced?"
// Used by the loadout doll's hover tooltips in GP / sell-to-fund modes, where
// the displayed loadout is the POST-upgrade build and the honest comparison is
// against the item the player already had in that slot — not an empty slot.
//
// For each slot whose item differs from the reference (bank) loadout, we revert
// just that slot to the bank item and re-score, so the delta isolates that one
// purchase. The weapon slot is special: reverting the weapon also reverts the
// attack style, so we let the bank weapon pick its OWN best legal style (no
// forced style override) — the same rule the budget optimizer uses.

import { scoreScenario } from "@/lib/optimize/scenario";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { BoostResolver } from "@/lib/dps/boost";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type {
  AttackStyleChoice,
  Skills,
  SpellElement,
  WeaponAttackType,
} from "@/types/osrs";

export interface SlotVsBank {
  /** Displayed DPS minus the DPS with this slot reverted to the bank item. */
  dpsDelta: number;
  /** Name of the bank item this upgrade replaced; null if the slot was empty. */
  vsItemName: string | null;
}

const SLOT_KEYS: LoadoutSlotKey[] = [
  "head", "cape", "neck", "ammo", "weapon", "body",
  "shield", "legs", "hands", "feet", "ring",
];

export interface CompareInput {
  /** Post-upgrade loadout currently shown on the doll. */
  displayed: LoadoutSet;
  /** Its DPS (already computed elsewhere — avoids a redundant re-score). */
  displayedDps: number;
  /** Pre-upgrade loadout built from the bank alone. */
  reference: LoadoutSet;
  target: MonsterCatalogEntry;
  skills: Skills;
  boostResolver: BoostResolver;
  onTask: boolean;
  soulreaperMaxStacks: boolean;
}

/**
 * For every displayed slot whose item differs from the reference loadout,
 * compute the DPS gained over the bank item that slot replaced.
 */
export function compareSlotsVsReference(
  input: CompareInput,
): Partial<Record<LoadoutSlotKey, SlotVsBank>> {
  const { displayed, displayedDps, reference, target, skills } = input;
  const out: Partial<Record<LoadoutSlotKey, SlotVsBank>> = {};

  const displayedIds = Object.values(displayed.slots).map((s) => s.itemId);
  const magicFields = {
    baseSpellMaxHit: displayed.style === "magic" ? displayed.baseSpellMaxHit : undefined,
    spellElement:
      displayed.style === "magic" ? (displayed.spellElement as SpellElement | undefined) : undefined,
    autoSpellName: displayed.style === "magic" ? displayed.autoSpellName : undefined,
    internalAmmoId: displayed.internalAmmo?.itemId,
  };

  for (const slot of SLOT_KEYS) {
    const dispPiece = displayed.slots[slot];
    if (!dispPiece) continue;
    const refPiece = reference.slots[slot];
    // Slot unchanged by the upgrade path → nothing to compare against.
    if (refPiece?.itemId === dispPiece.itemId) continue;

    // Build the reverted id list: drop the displayed item in this slot, add the
    // bank item back (if the bank had one).
    const reverted = displayedIds.filter((id) => id !== dispPiece.itemId);
    if (refPiece) reverted.push(refPiece.itemId);

    const scored = scoreScenario({
      itemIds: reverted,
      target,
      skills,
      // Reverting the weapon also reverts the style — let the bank weapon pick
      // its own best legal style. Other slots keep the displayed weapon's style.
      attackStyle:
        slot === "weapon"
          ? undefined
          : {
              attackType: displayed.attackType as WeaponAttackType,
              choice: displayed.attackStyleChoice as AttackStyleChoice,
            },
      boostResolver: input.boostResolver,
      onTask: input.onTask,
      soulreaperMaxStacks: input.soulreaperMaxStacks,
      ...magicFields,
    });
    // If the revert is an illegal combo (e.g. a 2H bank weapon beside a shield),
    // skip — the tooltip falls back to its empty-slot marginal.
    if (!scored.valid) continue;

    out[slot] = {
      dpsDelta: displayedDps - scored.dps.dps,
      vsItemName: refPiece?.itemName ?? null,
    };
  }

  return out;
}
