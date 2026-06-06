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
    if (!sb) return { requirement: req, satisfied: null };
    const satisfied = sb.anyOf.some((group) =>
      group.some((id) => bank.itemIds.has(id)),
    );
    return { requirement: req, satisfied };
  });
}
