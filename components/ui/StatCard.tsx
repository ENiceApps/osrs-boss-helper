import type { ReactNode } from "react";

type StatSize = "sm" | "md" | "lg";

const VALUE_SIZE: Record<StatSize, string> = {
  sm: "text-2xl leading-tight",
  md: "text-3xl leading-tight",
  lg: "text-5xl leading-none",
};

interface StatCardProps {
  /** Small uppercase caption under the value. */
  label: string;
  /** The headline figure. */
  value: ReactNode;
  /** Tailwind text-colour class for the value. */
  accent?: string;
  /** Optional green delta pill beside the value (e.g. "+3.20"). */
  badge?: string;
  /**
   * Hero treatment — raised parchment + gold border + the largest value. Use
   * for the single "answer" the user came for. Defaults the size to `lg`.
   */
  hero?: boolean;
  /** Value size. Defaults to `lg` when `hero`, else `sm`. */
  size?: StatSize;
}

/**
 * The canonical "big number + small label" tile, so every stat reads with one
 * rhythm — the Gestalt similarity fix. Hero variant carries the page's single
 * headline answer (the DPS number in the results rail).
 */
export function StatCard({
  label,
  value,
  accent = "text-osrs-brown",
  badge,
  hero = false,
  size = hero ? "lg" : "sm",
}: StatCardProps) {
  const surface = hero
    ? "bg-parchment-raised border-2 border-osrs-gold p-3"
    : "bg-parchment border border-osrs-brown p-2";
  return (
    <div className={`flex flex-col items-center justify-center rounded text-center ${surface}`}>
      <div className={`font-bold ${VALUE_SIZE[size]} ${accent}`}>
        {value}
        {badge && (
          <span className="ml-2 align-top text-base font-semibold text-status-owned">
            {badge}
          </span>
        )}
      </div>
      <div className="label-eyebrow mt-1">{label}</div>
    </div>
  );
}
