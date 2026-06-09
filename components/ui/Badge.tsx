import type { ReactNode } from "react";

interface BadgeProps {
  /** Accent hex. Drives the text colour, a faint tinted fill, and the border. */
  color: string;
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Small colour-coded pill. The accent colour is used at full strength for the
 * text and at low opacity for the fill/border, so the badge stays legible on
 * the parchment background while still reading as "this category = this hue".
 * This is the shared primitive behind <AttributePill> and <WeaknessBadge>.
 */
export function Badge({ color, children, title, className = "" }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-caption font-medium whitespace-nowrap ${className}`}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 38%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}
