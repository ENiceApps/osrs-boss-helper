import type { ReactNode } from "react";

/**
 * A compact inline "label: value" chip for metadata rows (combat level, HP,
 * size, the optimiser's style/accuracy line, …). Light parchment fill so it
 * reads on both panel and dark-page backgrounds. The optional eyebrow label
 * names the figure without a full sentence.
 */
export function MetaChip({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded border border-osrs-brown/30 bg-parchment-raised px-2 py-0.5 text-caption text-osrs-brown">
      {label && <span className="label-eyebrow">{label}</span>}
      <span className="font-semibold">{children}</span>
    </span>
  );
}
