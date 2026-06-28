// Evaluates a boss's fight-mechanic checklist against the player's bank. For
// each requirement it asks "is this satisfied by an item the player owns or
// wears?" — item-backed requirements return true/false, purely informational
// ones return null (the UI renders those without a checkmark). Powers
// <MechanicsPanel>.

import type { BankContents, MechanicRequirement } from "@/types/osrs";

export interface MechanicEvaluation {
  requirement: MechanicRequirement;
  /**
   * True when an item-backed requirement is satisfied by the user's bank.
   * For informational mechanics (no satisfiedBy), this is always `null` —
   * the UI should render those without a checkmark indicator.
   */
  satisfied: boolean | null;
}

export function evaluateMechanics(
  requirements: MechanicRequirement[],
  bank: BankContents,
): MechanicEvaluation[] {
  return requirements.map((req) => {
    const sb = req.satisfiedBy;
    const worn = req.worn;
    // Informational mechanic (no item proxy of either kind) → null.
    if (!sb && !worn) return { requirement: req, satisfied: null };
    // Satisfied if the bank holds EITHER an inventory item (satisfiedBy) OR a
    // worn-route item (worn.items) — owning either route covers the mechanic.
    // The stricter "is it actually equipped in this setup?" check lives in
    // lib/setup-mechanics.ts.
    const satisfied =
      (sb?.anyOf.some((group) => group.some((id) => bank.itemIds.has(id))) ?? false) ||
      (worn?.items.some((id) => bank.itemIds.has(id)) ?? false);
    return { requirement: req, satisfied };
  });
}
