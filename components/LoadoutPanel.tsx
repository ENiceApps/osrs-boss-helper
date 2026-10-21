"use client";

// Center cockpit panel: the equipment "doll" for the active loadout, with the
// style-comparison tabs across the top — the optimizer's Best pick plus one tab
// per attack style, each showing its DPS so styles compare at a glance. Clicking
// a slot opens the item picker; the magic spell chip opens the spell picker.
// Dimmed tabs mark styles the current bank/budget can't build.

import { useState } from "react";
import { EquipmentGrid } from "@/components/EquipmentGrid";
import { MetaChip } from "@/components/ui";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import type { SlotExplanation } from "@/lib/loadout-explain";
import type { SlotAlternative } from "@/lib/slot-alternatives";
import { setPresetsByStyle, wornSetPreset, type SetPreset } from "@/lib/set-presets";
import type { SetupMechanicStatus } from "@/lib/setup-mechanics";
import type { ItemCatalogEntry } from "@/data/items/catalog";
import type { LoadoutSet, LoadoutSlotKey } from "@/types/loadout";
import type { DpsResult, MappingEntry } from "@/types/osrs";

export interface LoadoutTab<Id extends string = string> {
  id: Id;
  label: string;
  /** Shown small inside the tab so setups compare at a glance. */
  dps?: number;
  /** False when the bank/budget can't build this style. The tab still renders
   *  (so the styles are always visible) but dimmed and non-selectable. */
  available?: boolean;
  /** Tooltip on a dimmed tab: why it's unavailable and how to see it. */
  unavailableReason?: string;
}

export type LoadoutEmptyReason = "loading" | "prices-failed" | "budget" | "no-weapon";

interface Props<TabId extends string> {
  /** Comparison tabs: the optimizer's best plus one per attack style. */
  tabs?: Array<LoadoutTab<TabId>>;
  activeTab?: TabId;
  onTabChange?: (id: TabId) => void;
  /** The active loadout (optimizer pick + any manual slot edits). */
  set?: LoadoutSet;
  dps?: DpsResult;
  /** False until the RuneLite plugin has pushed a bank. */
  connected: boolean;
  /** Why there's no loadout yet, when connected but `set` is empty. Budget
   *  mode builds from GE prices, so it has nothing to show until they load. */
  emptyReason?: LoadoutEmptyReason;
  /** Where this loadout came from, e.g. "after upgrades" / "from your bank". */
  sourceLabel?: string;
  ownedItemIds: Set<number>;
  mapping?: MappingEntry[];
  onSlotClick?: (slot: LoadoutSlotKey) => void;
  /** Opens the spell picker. Only wired for magic loadouts without a powered staff. */
  onSpellClick?: () => void;
  /** Per-slot "why this item" details for the hover tooltips. */
  slotDetails?: Partial<Record<LoadoutSlotKey, SlotExplanation>>;
  /** Ranked next-best options for a slot — the tooltip's clickable list. */
  slotAlternatives?: (slot: LoadoutSlotKey) => SlotAlternative[];
  /** Apply a next-best option to the loadout. */
  onAlternativePick?: (slot: LoadoutSlotKey, item: ItemCatalogEntry) => void;
  /** Equip every piece of a set-effect armour at once (the Sets dropdown). */
  onEquipSet?: (preset: SetPreset) => void;
  /** Slots the user has manually overridden. */
  editedSlots: LoadoutSlotKey[];
  onResetEdits: () => void;
  /** Worn-slot mechanics this setup leaves uncovered. */
  conflicts: SetupMechanicStatus[];
  /** Name of the owned boost potion baked into the DPS, if any. */
  boostName?: string;
  /** Called when the user clicks "Open in Wiki Calc". Async — shows a spinner while the shortlink is created. */
  onWikiExport?: () => Promise<void>;
  /** Encoded `?b=` value for a stateless share link, or null when no loadout. */
  shareCode?: string | null;
}

const SLOT_ORDER: LoadoutSlotKey[] = [
  "weapon",
  "head",
  "cape",
  "neck",
  "ammo",
  "body",
  "shield",
  "legs",
  "hands",
  "feet",
  "ring",
];

/**
 * Center column of the boss-page cockpit: the single, always-editable
 * equipment doll. Merges the old read-only optimizer grid and the buried
 * "Tweak the setup" drawer into one surface — click a slot, the picker opens,
 * and DPS in the results rail recomputes immediately.
 */
export function LoadoutPanel<TabId extends string>({
  tabs,
  activeTab,
  onTabChange,
  set,
  dps,
  connected,
  emptyReason = "no-weapon",
  sourceLabel,
  ownedItemIds,
  mapping,
  onSlotClick,
  onSpellClick,
  slotDetails,
  slotAlternatives,
  onAlternativePick,
  onEquipSet,
  editedSlots,
  onResetEdits,
  conflicts,
  boostName,
  onWikiExport,
  shareCode,
}: Props<TabId>) {
  const edited = editedSlots.length > 0;
  // The Sets dropdown reflects whichever set the doll is wearing right now, so
  // it needs no state of its own: picking one applies the overrides, the
  // loadout re-renders, and the select lands on the worn set.
  const wornSet = set ? wornSetPreset(set) : undefined;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  async function handleShareLink() {
    if (!shareCode) return;
    const url = `${window.location.origin}${window.location.pathname}?b=${shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / denied) — fail quietly.
    }
  }

  async function handleWikiExport() {
    if (!onWikiExport) return;
    setExporting(true);
    setExportError(null);
    try {
      await onWikiExport();
    } catch (e) {
      setExportError("Couldn't create the link. Try again.");
      console.error("[wiki-export]", e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="osrs-panel p-4 rounded">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="section-title font-semibold text-osrs-brown">Loadout</h3>
        {set && (
          <div className="flex items-center gap-2">
            <span className="text-caption text-osrs-muted">
              {edited ? "custom, edited by you" : sourceLabel}
            </span>
            {/* Persistent "go back to the recommendation" affordance. Reverts
                any manual weapon/gear/spell swaps to the optimizer's pick, which
                re-runs the DPS calc. Disabled (nothing to undo) until edited. */}
            <button
              type="button"
              onClick={onResetEdits}
              disabled={!edited}
              title={
                edited
                  ? "Undo your edits and go back to the recommended loadout"
                  : "This is already the recommended loadout. Nothing to refresh."
              }
              className={`text-caption font-semibold rounded px-1.5 py-0.5 border shrink-0 transition-colors ${
                edited
                  ? "text-osrs-gold border-osrs-gold/60 hover:bg-osrs-gold/10 cursor-pointer"
                  : "text-osrs-muted border-osrs-brown/30 opacity-60 cursor-default"
              }`}
            >
              ↻ Refresh loadout
            </button>
          </div>
        )}
      </div>

      {/* Comparison tabs — the optimizer's overall pick plus the best setup
          per attack style, each with its DPS so they compare at a glance.
          Switching tabs discards manual edits (the page resets overrides). */}
      {(tabs?.length ?? 0) > 1 && (
        <div role="tablist" aria-label="Loadout setups" className="flex flex-wrap gap-1.5 mt-1 mb-3">
          {tabs!.map((tab) => {
            const active = tab.id === activeTab;
            const unavailable = tab.available === false;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-disabled={unavailable}
                // Keep it focusable (not HTML-disabled) so the explanatory
                // title still shows on hover; the click just no-ops.
                title={unavailable ? tab.unavailableReason : undefined}
                onClick={() => !unavailable && onTabChange?.(tab.id)}
                className={`px-2.5 py-1 rounded border text-center ${
                  active
                    ? "bg-osrs-gold border-osrs-gold"
                    : unavailable
                      ? "bg-parchment-dark/5 border-osrs-brown/20 opacity-50 cursor-not-allowed"
                      : "bg-parchment-dark/10 border-osrs-brown/40 hover:border-osrs-gold/60"
                }`}
              >
                <span
                  className={`block text-xs font-semibold ${
                    active ? "text-background" : unavailable ? "text-osrs-muted" : "text-osrs-brown"
                  }`}
                >
                  {tab.label}
                </span>
                {tab.dps !== undefined ? (
                  <span
                    className={`block text-caption ${
                      active ? "text-background/80" : "text-osrs-muted"
                    }`}
                  >
                    {tab.dps.toFixed(2)} dps
                  </span>
                ) : unavailable ? (
                  <span className="block text-caption text-osrs-muted">n/a</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {!connected && (
        <p className="text-sm text-osrs-brown mb-3">
          Connect your bank from the <strong>Boss Helper Bank Sync</strong>{" "}
          RuneLite plugin. It brings in your bank, inventory, worn gear, and
          skills, and you&apos;ll get the best loadout you can equip for this boss.
        </p>
      )}
      {connected && !set && emptyReason === "loading" && (
        <p className="text-sm text-osrs-brown mb-3 motion-safe:animate-pulse" role="status">
          Working out your best setup...
        </p>
      )}
      {connected && !set && emptyReason === "prices-failed" && (
        <p className="text-sm text-osrs-brown mb-3">
          Couldn&apos;t grab GE prices right now, so I can&apos;t build a setup.
          Try a refresh!
        </p>
      )}
      {connected && !set && emptyReason === "budget" && (
        <p className="text-sm text-osrs-brown mb-3">
          Nothing you can equip fits under that yet. Try bumping it up!
        </p>
      )}
      {connected && !set && emptyReason === "no-weapon" && (
        <p className="text-sm text-osrs-brown mb-3">
          Your bank can&apos;t make a loadout yet. You need at least one weapon
          you can equip, so grab a starter weapon first.
        </p>
      )}
      {connected && set && (
        <p className="text-caption text-osrs-muted mb-3">
          Hover a slot to see why. Click to swap.
        </p>
      )}

      {/* Sets dropdown — equips every piece of a set-effect armour (Void,
          Dharok's, Obsidian, …) in one go. Only the active style's sets are
          selectable: a set's effect is style-specific, and each tab is its own
          starting point, so the other styles' groups point at their tab. */}
      {connected && set && onEquipSet && (
        <SetsDropdown style={set.style} worn={wornSet} onEquipSet={onEquipSet} />
      )}

      <EquipmentGrid
        set={set}
        ownedItemIds={ownedItemIds}
        mapping={mapping}
        onSlotClick={set ? onSlotClick : undefined}
        slotSize={56}
        editedSlots={new Set(editedSlots)}
        slotDetails={slotDetails}
        slotAlternatives={slotAlternatives}
        onAlternativePick={onAlternativePick}
      />

      {set && (
        <>
          {/* Named gear list — reading the build shouldn't require decoding
              icons one by one. Weapon first, then the rest. */}
          <div className="mt-3 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-caption leading-snug text-osrs-brown">
            {SLOT_ORDER.map((slot) => set.slots[slot])
              .filter((p): p is NonNullable<typeof p> => Boolean(p))
              .map((piece, i, arr) => (
                <span key={`${piece.itemId}-${i}`}>
                  {piece.itemName}
                  {i < arr.length - 1 && <span className="text-osrs-muted"> · </span>}
                </span>
              ))}
          </div>

          {/* Loadout-property chips. Outcome stats (DPS, accuracy, TTK) live
              in the results rail — no duplication. */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <MetaChip label="style">{set.style}</MetaChip>
            <MetaChip label="choice">{set.attackStyleChoice}</MetaChip>
            {/* Spell chip. For magic loadouts that aren't using a powered staff
                (Trident/Sang/Shadow auto-cast their own formula), it's a button
                that opens the spell picker. Shown even with no auto-spell yet so
                there's an affordance to choose one. */}
            {set.style === "magic" &&
            !POWERED_STAFF_FORMULA.has(set.slots.weapon?.itemId ?? -1) ? (
              <button
                type="button"
                onClick={onSpellClick}
                title="Change combat spell"
                className="rounded hover:ring-1 hover:ring-osrs-gold/60 cursor-pointer"
              >
                <MetaChip label="spell">{set.autoSpellName ?? "auto"}</MetaChip>
              </button>
            ) : (
              set.autoSpellName && (
                <MetaChip label="spell">{set.autoSpellName}</MetaChip>
              )
            )}
            {set.totals.prayerBonus > 0 && (
              <MetaChip label="prayer">+{set.totals.prayerBonus}</MetaChip>
            )}
            {set.internalAmmo && (
              <MetaChip label="loaded">{set.internalAmmo.itemName}</MetaChip>
            )}
            <MetaChip
              label="boost"
              valueClassName={boostName ? "text-status-owned" : "text-osrs-muted"}
            >
              {boostName ?? "none"}
            </MetaChip>
          </div>

          {edited && (
            <div className="mt-3 text-caption text-osrs-brown flex items-center justify-between gap-2 bg-parchment-raised border border-osrs-gold/60 rounded px-2 py-1.5">
              <span>
                <strong>Custom loadout</strong>:{" "}
                {editedSlots.length === 1 ? "1 slot" : `${editedSlots.length} slots`}
                {/* Explicit space: this JSX transform eats a leading space in a
                    text node that follows an expression and wraps lines. */}
                {" changed from the recommended pick."}
              </span>
              <button
                type="button"
                onClick={onResetEdits}
                className="text-osrs-gold hover:underline font-semibold shrink-0"
              >
                Reset
              </button>
            </div>
          )}

          {conflicts.length > 0 && <SetupWarnings conflicts={conflicts} />}

          {dps === undefined && (
            <p className="mt-3 text-caption text-osrs-muted italic text-center">
              Computing DPS…
            </p>
          )}

          {(onWikiExport || shareCode) && (
            <div className="mt-3 border-t border-osrs-brown/20 pt-3 flex gap-2">
              {shareCode && (
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="flex-1 text-caption text-osrs-brown hover:text-osrs-gold border border-osrs-brown/40 hover:border-osrs-gold/60 rounded px-2 py-1.5 transition-colors"
                >
                  {shareCopied ? "Link copied!" : "Copy share link"}
                </button>
              )}
              {onWikiExport && (
                <button
                  type="button"
                  onClick={handleWikiExport}
                  disabled={exporting}
                  className="flex-1 text-caption text-osrs-brown hover:text-osrs-gold border border-osrs-brown/40 hover:border-osrs-gold/60 rounded px-2 py-1.5 transition-colors disabled:opacity-50"
                >
                  {exporting ? "Opening…" : "Open in Wiki DPS Calc ↗"}
                </button>
              )}
            </div>
          )}
          {exportError && (
            <p className="mt-1 text-caption text-status-missing text-center">
              {exportError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const STYLE_LABEL: Record<LoadoutSet["style"], string> = {
  melee: "Melee",
  ranged: "Ranged",
  magic: "Magic",
};

/**
 * "Sets" picker above the doll. A native select so it works the same on a
 * phone: one tap, pick Void or Dharok's, every piece lands in the grid.
 */
function SetsDropdown({
  style,
  worn,
  onEquipSet,
}: {
  style: LoadoutSet["style"];
  worn?: SetPreset;
  onEquipSet: (preset: SetPreset) => void;
}) {
  const groups = setPresetsByStyle();
  const byId = new Map(groups.flatMap((g) => g.presets).map((p) => [p.id, p]));
  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 text-caption">
        <span className="label-eyebrow text-osrs-muted shrink-0">sets</span>
        <select
          value={worn?.id ?? ""}
          onChange={(e) => {
            const preset = byId.get(e.target.value);
            if (preset) onEquipSet(preset);
          }}
          aria-label="Equip an armour set"
          className="flex-1 min-w-0 p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm"
        >
          <option value="">Equip a set…</option>
          {groups.map((g) => {
            const other = g.style !== style;
            return (
              <optgroup
                key={g.style}
                label={other ? `${STYLE_LABEL[g.style]} (switch to the ${STYLE_LABEL[g.style]} tab)` : STYLE_LABEL[g.style]}
                disabled={other}
              >
                {g.presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>
      {worn?.hint && (
        <p className="mt-1 text-caption text-osrs-muted leading-snug">{worn.hint}</p>
      )}
    </div>
  );
}

/**
 * Warns that the active setup leaves a required worn-slot mechanic unmet
 * (e.g. no dragonfire protection in the shield slot, and no Super antifire in
 * the bank). The bridge between pure-DPS optimisation and survivability.
 */
function SetupWarnings({ conflicts }: { conflicts: SetupMechanicStatus[] }) {
  return (
    <div className="mt-3 rounded border border-status-missing/60 bg-status-missing/10 p-2 space-y-1.5">
      <div className="text-caption font-semibold uppercase tracking-wide text-status-missing flex items-center gap-1">
        <span aria-hidden>⚠</span> Setup leaves a mechanic uncovered
      </div>
      {conflicts.map((c) => (
        <div key={c.requirement.id} className="text-caption text-osrs-brown leading-snug">
          <span className="font-semibold">{c.requirement.label}</span>
          {": "}
          {c.requirement.remediation}
        </div>
      ))}
    </div>
  );
}
