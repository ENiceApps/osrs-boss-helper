import { combatXpPerHour, xpPerDamage, XP_SKILL_LABELS } from "@/lib/combat-xp";
import type { WeaponStyleOption } from "@/data/weapon-styles";
import type { CombatStyle } from "@/types/osrs";

interface Props {
  bossName: string;
  /** DPS of the displayed loadout, already at the selected attack style. */
  dps: number;
  style: CombatStyle;
  /** The weapon's attack styles the player can switch between. */
  options: WeaponStyleOption[];
  /** The option the displayed DPS is computed at. */
  active: WeaponStyleOption;
  /** Switch attack style. When omitted the styles are shown read-only. */
  onPick?: (option: WeaponStyleOption) => void;
  /** Monster XP multiplier (1 = normal); undefined when not checked. */
  xpMultiplier?: number;
  /** Share of the hour spent attacking (the trip's combat uptime). */
  uptime: number;
}

const fmtXp = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Mini combat XP calculator in the results rail: pick an attack style and see
 * the XP per hour each skill gets at the DPS shown above. Switching style
 * re-runs the DPS, so the two always agree.
 */
export function CombatXpPanel({
  bossName,
  dps,
  style,
  options,
  active,
  onPick,
  xpMultiplier,
  uptime,
}: Props) {
  const multiplier = xpMultiplier ?? 1;
  const xp = combatXpPerHour(dps, xpPerDamage(style, active.choice, active.defensive), multiplier, uptime);
  const notes: string[] = [];
  if (multiplier !== 1) {
    const pct = Math.abs((multiplier - 1) * 100);
    notes.push(
      `${bossName} gives ${Number(pct.toFixed(1))}% ${multiplier < 1 ? "less" : "more"} XP per hit, counted here.`,
    );
  } else if (xpMultiplier === undefined) {
    notes.push("Some monsters give bonus XP. That is not counted here.");
  }
  if (style === "magic") notes.push("Each cast's own base XP comes on top.");
  if (uptime < 1) notes.push(`At ${Math.round(uptime * 100)}% combat uptime.`);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-eyebrow">Combat XP / hr</span>
        <span className="text-caption text-osrs-muted">attack style</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Attack style">
        {options.map((o) => {
          const selected = o.name === active.name;
          return (
            <button
              key={o.name}
              type="button"
              aria-pressed={selected}
              disabled={!onPick}
              onClick={() => onPick?.(o)}
              title={`${o.name} (${o.attackType}, ${o.choice})`}
              className={`min-h-9 px-2.5 py-1 rounded border text-caption font-semibold text-osrs-brown ${
                selected
                  ? "bg-osrs-gold border-osrs-gold"
                  : "bg-parchment-raised border-osrs-brown/30 hover:border-osrs-gold"
              }`}
            >
              {o.name}
            </button>
          );
        })}
      </div>
      <div className="mt-2">
        {xp.rows.map((row) => (
          <div
            key={row.skill}
            className="flex items-baseline justify-between gap-2 py-1 border-b border-osrs-brown/15"
          >
            <span className="label-eyebrow">{XP_SKILL_LABELS[row.skill]}</span>
            <span className="text-sm font-semibold text-osrs-brown tabular-nums">
              {fmtXp(row.xpPerHour)}
            </span>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-2 py-1">
          <span className="label-eyebrow">Total</span>
          <span className="text-sm font-bold text-osrs-brown tabular-nums">{fmtXp(xp.total)}</span>
        </div>
      </div>
      {notes.length > 0 && (
        <p className="mt-1 text-caption text-osrs-muted">{notes.join(" ")}</p>
      )}
    </div>
  );
}
