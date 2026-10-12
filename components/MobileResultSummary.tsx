"use client";

import type { DpsResult } from "@/types/osrs";
import { formatSeconds } from "@/lib/format";

interface Props {
  bossHp: number;
  dps?: DpsResult;
  /** Budget mode still waiting on GE prices. */
  loading: boolean;
  /** Element id of the full Results panel this strip jumps to. */
  resultsId: string;
}

/**
 * Phone-only headline for the boss page. On a narrow screen the cockpit
 * stacks into one long column and the Results panel lands below the whole
 * equipment grid, so this puts the answer (DPS + kill time) right under the
 * boss header and links down to the full breakdown. Hidden from `lg` up,
 * where Results already sits beside the loadout.
 */
export function MobileResultSummary({ bossHp, dps, loading, resultsId }: Props) {
  if (!dps && !loading) return null;

  return (
    <a
      href={`#${resultsId}`}
      className="lg:hidden osrs-panel rounded px-3 py-2 flex items-center justify-between gap-3 hover:border-osrs-gold/60"
    >
      {dps ? (
        <span className="flex items-baseline gap-x-3 gap-y-0.5 flex-wrap min-w-0">
          <span>
            <span className="text-xl font-bold text-osrs-gold tabular-nums">
              {dps.dps.toFixed(2)}
            </span>{" "}
            <span className="label-eyebrow">dps</span>
          </span>
          <span className="text-sm text-osrs-brown tabular-nums">
            ~{formatSeconds(dps.dps > 0 ? bossHp / dps.dps : Infinity)} a kill
          </span>
        </span>
      ) : (
        <span className="text-sm text-osrs-brown animate-pulse" role="status">
          Working out your best setup...
        </span>
      )}
      <span className="text-sm text-osrs-gold shrink-0">Full results ↓</span>
    </a>
  );
}
