import { Badge } from "./Badge";
import { attributeColor } from "./colors";

/**
 * A monster attribute ("dragon", "undead", …) rendered as a colour-coded pill.
 * Unknown/identity attributes fall back to the neutral accent — see colors.ts.
 */
export function AttributePill({ attribute }: { attribute: string }) {
  return <Badge color={attributeColor(attribute)}>{attribute}</Badge>;
}
