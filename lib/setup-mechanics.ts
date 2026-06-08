// Bridges the gear optimiser and the boss mechanics checklist.
//
// Some mechanics can be satisfied two ways: an INVENTORY/consumable item that
// frees the equipment slot (e.g. a Super antifire), or a WORN item that
// occupies a slot (e.g. a Dragonfire ward in the shield slot). The DPS
// optimiser only knows about DPS, so it can recommend a max-DPS setup that
// silently drops a required worn protection item.
//
// `checkSetupMechanics` cross-references a chosen setup against the boss's
// worn-slot mechanics and reports which are safely covered and which conflict
// (the setup neither equips a worn satisfier NOR has an inventory alternative
// in the bank — an unsafe loadout the UI should warn about).

import type { MechanicRequirement, Slot } from "@/types/osrs";
import type { LoadoutSet } from "@/types/loadout";

export interface SetupMechanicStatus {
  requirement: MechanicRequirement;
  /** The equipment slot this mechanic's worn route occupies. */
  slot: Slot;
  /** The setup equips a protecting item in `slot`. */
  satisfiedByWorn: boolean;
  /** The bank holds an inventory alternative, so `slot` can stay free for DPS. */
  satisfiedByInventory: boolean;
  /**
   * Neither route is covered → the setup is unsafe for this mechanic. The UI
   * should surface `requirement.remediation`.
   */
  conflict: boolean;
}

/**
 * Evaluate every WORN-slot mechanic for a boss against a specific setup + bank.
 * Mechanics without a `worn` route are pure checklist items and are ignored
 * here (they don't constrain gear) — use `evaluateMechanics` for those.
 *
 * `bankItemIds` may be undefined (no bank known yet); inventory satisfaction is
 * then treated as false, so a worn mechanic is only covered by equipping the
 * item. Pass the player's owned item-id set (e.g. `bank.itemIds`).
 */
export function checkSetupMechanics(
  setup: LoadoutSet | undefined,
  mechanics: MechanicRequirement[] | undefined,
  bankItemIds: ReadonlySet<number> | undefined,
): SetupMechanicStatus[] {
  if (!setup || !mechanics) return [];
  const out: SetupMechanicStatus[] = [];
  for (const req of mechanics) {
    if (!req.worn) continue;
    const equippedId = setup.slots[req.worn.slot]?.itemId;
    const wornIds = new Set<number>(req.worn.items);
    const satisfiedByWorn = equippedId !== undefined && wornIds.has(equippedId);
    const satisfiedByInventory = Boolean(
      bankItemIds && req.satisfiedBy?.anyOf.some((group) => group.some((itemId) => bankItemIds.has(itemId))),
    );
    out.push({
      requirement: req,
      slot: req.worn.slot,
      satisfiedByWorn,
      satisfiedByInventory,
      conflict: !satisfiedByWorn && !satisfiedByInventory,
    });
  }
  return out;
}

/** Only the unsafe (conflicting) worn-slot mechanics for a setup. */
export function setupMechanicConflicts(
  setup: LoadoutSet | undefined,
  mechanics: MechanicRequirement[] | undefined,
  bankItemIds: ReadonlySet<number> | undefined,
): SetupMechanicStatus[] {
  return checkSetupMechanics(setup, mechanics, bankItemIds).filter((s) => s.conflict);
}
