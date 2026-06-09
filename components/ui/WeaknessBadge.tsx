import { Badge } from "./Badge";
import { elementColor } from "./colors";

/**
 * A monster's elemental spell weakness ("weak to fire +50%") as a colour-coded
 * pill. The element drives the hue; the severity rides along as a secondary
 * figure so the whole weakness reads at a glance.
 */
export function WeaknessBadge({
  element,
  severity,
}: {
  element: string;
  severity: number;
}) {
  return (
    <Badge color={elementColor(element)} title={`Weak to ${element} +${severity}%`}>
      <span className="capitalize">{element}</span>
      <span className="opacity-75">+{severity}%</span>
    </Badge>
  );
}
