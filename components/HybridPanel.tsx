"use client";

import { useMemo, useState } from "react";
import { EquipmentGrid } from "./EquipmentGrid";
import { ItemIcon } from "./ItemIcon";
import { CollapsibleSection } from "./ui";
import { optimizeHybrid } from "@/lib/optimize/hybrid";
import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { BoostResolver } from "@/lib/dps/boost";
import type { CombatStyle, MappingEntry, Skills } from "@/types/osrs";
import type { LoadoutSlotKey } from "@/types/loadout";

interface Props {
  /** The player's bank item IDs. Empty set = not connected. */
  ownedItemIds: Set<number>;
  connected: boolean;
  target: MonsterCatalogEntry;
  skills: Skills;
  boostResolver: BoostResolver;
  onTask: boolean;
  soulreaperMaxStacks: boolean;
  requiresMeleeReach2: boolean;
  mapping?: MappingEntry[];
}

const ALL_STYLES: CombatStyle[] = ["melee", "ranged", "magic"];
const TITLE: Record<CombatStyle, string> = { melee: "Melee", ranged: "Ranged", magic: "Magic" };

/**
 * Hybrid armour / armour-switching optimizer. The player toggles which styles
 * they want to fight a multi-style boss with and how many gear slots they're
 * willing to switch; the engine returns the best BLENDED-DPS configuration —
 * from "mixed armour + swap weapon" (1 switch) up to fully independent switching.
 * Self-contained: its own controls + state, available on every boss page.
 */
export function HybridPanel({
  ownedItemIds,
  connected,
  target,
  skills,
  boostResolver,
  onTask,
  soulreaperMaxStacks,
  requiresMeleeReach2,
  mapping,
}: Props) {
  const [styles, setStyles] = useState<Set<CombatStyle>>(new Set(ALL_STYLES));
  const [switchBudget, setSwitchBudget] = useState(2);
  const [showWeights, setShowWeights] = useState(false);
  // Independent per-style weights (1–100). The engine normalizes them, so equal
  // values = equal priority. Default equal.
  const [weights, setWeights] = useState<Record<CombatStyle, number>>({ melee: 50, ranged: 50, magic: 50 });

  const selectedStyles = ALL_STYLES.filter((s) => styles.has(s));
  // Stable primitive keys so the memo recomputes when the chosen styles or their
  // weights change — without putting objects or function calls in the dep array.
  const stylesKey = selectedStyles.join(",");
  const weightsKey = selectedStyles.map((s) => weights[s]).join(",");

  const result = useMemo(() => {
    if (!connected || ownedItemIds.size === 0 || selectedStyles.length < 2) return null;
    const w: Partial<Record<CombatStyle, number>> = {};
    for (const s of selectedStyles) w[s] = weights[s];
    return optimizeHybrid({
      bank: ownedItemIds,
      target,
      skills,
      styles: selectedStyles,
      switchBudget,
      weights: w,
      boostResolver,
      onTask,
      soulreaperMaxStacks,
      requiresMeleeReach2,
    }).hybrid;
    // selectedStyles / weights are captured via stylesKey / weightsKey above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedItemIds, connected, target, skills, switchBudget, stylesKey, weightsKey, boostResolver, onTask, soulreaperMaxStacks, requiresMeleeReach2]);

  function toggleStyle(s: CombatStyle) {
    setStyles((prev) => {
      const next = new Set(prev);
      if (next.has(s)) { if (next.size > 1) next.delete(s); } // keep at least one
      else next.add(s);
      return next;
    });
  }

  return (
    <CollapsibleSection title="Hybrid armour">
      <p className="text-caption text-osrs-muted mb-3 max-w-2xl">
        For multi-style bosses. Pick the styles you&apos;ll use and how many gear slots
        you&apos;re willing to switch — fewer switches share more armour (easier to play),
        more switches push each style toward its best gear. The weapon always switches.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mb-4">
        <div>
          <div className="label-eyebrow mb-1">Styles</div>
          <div className="flex gap-1.5">
            {ALL_STYLES.map((s) => {
              const on = styles.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStyle(s)}
                  aria-pressed={on}
                  className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                    on
                      ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                      : "text-osrs-brown border-osrs-brown/30 hover:bg-osrs-gold/10"
                  }`}
                >
                  {TITLE[s]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-[12rem]">
          <label className="label-eyebrow mb-1 block" htmlFor="hybrid-switch-budget">
            Switches: {switchBudget}{" "}
            <span className="text-osrs-muted normal-case">
              (clicks to swap: weapon + {switchBudget - 1} more)
            </span>
          </label>
          <input
            id="hybrid-switch-budget"
            type="range"
            min={1}
            max={10}
            step={1}
            value={switchBudget}
            onChange={(e) => setSwitchBudget(Number(e.target.value))}
            className="w-full accent-osrs-gold"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowWeights((v) => !v)}
          className="text-caption text-osrs-gold hover:underline"
        >
          {showWeights ? "Hide priorities" : "Adjust priorities"}
        </button>
      </div>

      {showWeights && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 osrs-panel rounded p-3">
          {selectedStyles.map((s) => {
            const total = selectedStyles.reduce((a, st) => a + weights[st], 0);
            const pct = Math.round((weights[s] / total) * 100);
            return (
              <div key={s} className="min-w-[10rem]">
                <label className="label-eyebrow mb-1 block" htmlFor={`hybrid-w-${s}`}>
                  {TITLE[s]} — {pct}%
                </label>
                <input
                  id={`hybrid-w-${s}`}
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={weights[s]}
                  onChange={(e) => setWeights((w) => ({ ...w, [s]: Number(e.target.value) }))}
                  className="w-full accent-osrs-gold"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Result */}
      {!connected || ownedItemIds.size === 0 ? (
        <p className="text-sm text-osrs-muted">
          Connect your bank (sync from the plugin) to build a hybrid setup from your gear.
        </p>
      ) : selectedStyles.length < 2 ? (
        <p className="text-sm text-osrs-muted">Pick at least two styles to blend.</p>
      ) : !result ? (
        <p className="text-sm text-osrs-muted">
          Your bank can&apos;t perform two of the chosen styles against {target.name}.
        </p>
      ) : (
        <HybridResult result={result} ownedItemIds={ownedItemIds} mapping={mapping} />
      )}
    </CollapsibleSection>
  );
}

function HybridResult({
  result,
  ownedItemIds,
  mapping,
}: {
  result: NonNullable<ReturnType<typeof optimizeHybrid>["hybrid"]>;
  ownedItemIds: Set<number>;
  mapping?: MappingEntry[];
}) {
  const sharedEntries = Object.entries(result.sharedSlots) as Array<
    [LoadoutSlotKey, { itemId: number; itemName: string }]
  >;

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div>
          <span className="text-2xl font-bold text-osrs-gold tabular-nums">
            {result.blendedDps.toFixed(2)}
          </span>{" "}
          <span className="text-caption text-osrs-muted">blended DPS</span>
        </div>
        <span className="osrs-panel rounded px-2 py-0.5 text-caption text-osrs-brown">
          {result.switchCount} {result.switchCount === 1 ? "switch" : "switches"} of {result.switchBudget}
        </span>
        {result.switchCount < result.switchBudget && (
          <span className="text-caption text-osrs-muted">
            (only {result.switchCount} needed — extra switches wouldn&apos;t help)
          </span>
        )}
      </div>

      {/* Shared base */}
      {sharedEntries.length > 0 && (
        <div>
          <div className="label-eyebrow mb-1.5">Worn for every style (no switch)</div>
          <div className="flex flex-wrap gap-2">
            {sharedEntries.map(([slot, piece]) => (
              <div key={slot} className="flex items-center gap-1.5 osrs-panel rounded px-2 py-1">
                <ItemIcon itemId={piece.itemId} size={24} mapping={mapping} title={piece.itemName} />
                <span className="text-caption text-osrs-brown">{piece.itemName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-style switch sheet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.styles.map((style) => {
          const ps = result.perStyle[style];
          if (!ps) return null;
          // The items you click when switching TO this style: weapon (always) + the
          // switched armour slots. ammo rides with the weapon.
          const switchSlots: LoadoutSlotKey[] = ["weapon", ...ps.switchedSlots];
          const switchItems = switchSlots
            .map((s) => ps.loadout.slots[s])
            .filter((p): p is NonNullable<typeof p> => Boolean(p));
          const highlight = new Set<LoadoutSlotKey>(["weapon", ...ps.switchedSlots]);
          return (
            <div key={style} className="osrs-panel rounded p-3">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-semibold text-osrs-gold">{TITLE[style]}</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-osrs-brown tabular-nums">
                    {ps.dps.toFixed(2)}
                  </span>{" "}
                  <span className="text-caption text-osrs-muted">DPS · {Math.round(ps.weight * 100)}%</span>
                </div>
              </div>
              <EquipmentGrid
                set={ps.loadout}
                ownedItemIds={ownedItemIds}
                mapping={mapping}
                editedSlots={highlight}
                slotSize={34}
              />
              <div className="mt-2">
                <div className="label-eyebrow mb-1">Switch in</div>
                <div className="flex flex-wrap gap-1.5">
                  {switchItems.map((p) => (
                    <span
                      key={p.itemId}
                      className="inline-flex items-center gap-1 text-caption text-osrs-brown"
                      title={p.itemName}
                    >
                      <ItemIcon itemId={p.itemId} size={18} mapping={mapping} title={p.itemName} />
                      {p.itemName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
