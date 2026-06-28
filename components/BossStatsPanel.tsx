"use client";

// Boss defensive-stats card: shows the target's defence level and its per-style
// defence bonuses (stab/slash/crush/magic/ranged) so you can see why the
// optimizer favours one attack style over another. Display-only.

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";

interface Props {
  monster: MonsterCatalogEntry;
}

/** A compact "number + label" cell for defence bonuses. */
function BonusStat({
  label,
  value,
  title,
}: {
  label: string;
  value: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      className="flex flex-col items-center rounded border border-osrs-brown/25 bg-parchment px-2 py-1.5 text-center min-w-[3.25rem]"
    >
      <span className="text-sm font-bold text-osrs-brown leading-none">{value}</span>
      <span className="label-eyebrow mt-0.5 text-[9px]">{label}</span>
    </div>
  );
}

/** Label row header for a group of stat cells. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="label-eyebrow mb-1.5 whitespace-nowrap">{children}</p>;
}

/**
 * Compact monster stat reference — defence skill levels, all 7 defence
 * bonuses (grouped by style), and the max-hit string from the wiki.
 *
 * Placing this between the header strip and the optimizer lets the user see
 * exactly why the optimizer recommended what it did (e.g. "ranged def 580 →
 * use melee").
 */
export function BossStatsPanel({ monster }: Props) {
  const b = monster.defenceBonuses;

  return (
    <div className="osrs-panel rounded px-3 py-2.5">
      <div className="flex flex-wrap items-start gap-x-5 gap-y-2">

        {/* Skill levels */}
        <div>
          <GroupLabel>Levels</GroupLabel>
          <div className="flex gap-1.5">
            <BonusStat label="Def" value={monster.defenceLevel} />
            <BonusStat label="Magic" value={monster.magicLevel} />
          </div>
        </div>

        {/* Melee defence */}
        <div>
          <GroupLabel>Melee def</GroupLabel>
          <div className="flex gap-1.5">
            <BonusStat label="Stab" value={b.stab} />
            <BonusStat label="Slash" value={b.slash} />
            <BonusStat label="Crush" value={b.crush} />
          </div>
        </div>

        {/* Magic defence */}
        <div>
          <GroupLabel>Magic def</GroupLabel>
          <div className="flex gap-1.5">
            <BonusStat label="Magic" value={b.magic} />
          </div>
        </div>

        {/* Ranged defence — split by ammo weight class. Many monsters share one
            value across all three, but some differ a lot (e.g. a boss weak to
            bolts but resistant to darts), so we always show the breakdown. */}
        <div>
          <GroupLabel>Ranged def</GroupLabel>
          <div className="flex gap-1.5">
            <BonusStat
              label="Light"
              value={b.rangedLight}
              title="Light ranged defence — vs thrown weapons (darts, knives, blowpipe)"
            />
            <BonusStat
              label="Std"
              value={b.rangedStandard}
              title="Standard ranged defence — vs bows (arrows) and chinchompas"
            />
            <BonusStat
              label="Heavy"
              value={b.rangedHeavy}
              title="Heavy ranged defence — vs crossbows (bolts) and javelins"
            />
          </div>
        </div>

        {/* Max hit text from the wiki infobox */}
        {monster.maxHitText && (
          <div>
            <GroupLabel>Max hit</GroupLabel>
            <div className="rounded border border-osrs-brown/25 bg-parchment px-2 py-1.5">
              <span className="text-sm font-bold text-osrs-brown">{monster.maxHitText}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
