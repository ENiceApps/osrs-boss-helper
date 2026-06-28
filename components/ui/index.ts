// Barrel for the small shared UI primitives (badges, chips, stat cards,
// collapsible sections) plus the category/element colour helpers. Import these
// from "@/components/ui" rather than reaching into the individual files.
export { Badge } from "./Badge";
export { CollapsibleSection } from "./CollapsibleSection";
export { AttributePill } from "./AttributePill";
export { WeaknessBadge } from "./WeaknessBadge";
export { StatCard } from "./StatCard";
export { MetaChip } from "./MetaChip";
export {
  attributeColor,
  elementColor,
  ATTRIBUTE_COLORS,
  ELEMENT_COLORS,
  ACCENT_FALLBACK,
} from "./colors";
