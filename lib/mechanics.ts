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
