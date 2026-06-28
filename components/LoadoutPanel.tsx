"use client";

import { useState } from "react";
import { EquipmentGrid } from "@/components/EquipmentGrid";
import { MetaChip } from "@/components/ui";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import type { SlotExplanation } from "@/lib/loadout-explain";
import type { SetupMechanicStatus } from "@/lib/setup-mechanics";
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
  /** Where this loadout came from, e.g. "after upgrades" / "from your bank". */
  sourceLabel?: string;
  ownedItemIds: Set<number>;
  mapping?: MappingEntry[];
  onSlotClick?: (slot: LoadoutSlotKey) => void;
  /** Opens the spell picker. Only wired for magic loadouts without a powered staff. */
  onSpellClick?: () => void;
  /** Per-slot "why this item" details for the hover tooltips. */
  slotDetails?: Partial<Record<LoadoutSlotKey, SlotExplanation>>;
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
  sourceLabel,
  ownedItemIds,
  mapping,
  onSlotClick,
  onSpellClick,
  slotDetails,
  editedSlots,
  onResetEdits,
  conflicts,
  boostName,
  onWikiExport,
  shareCode,
}: Props<TabId>) {
  const edited = editedSlots.length > 0;
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
      setExportError("Couldn't create shortlink — try again.");
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
              {edited ? "custom — edited by you" : sourceLabel}
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
                  ? "Discard your edits and rebuild the optimizer's recommended loadout"
                  : "This is the optimizer's recommendation — nothing to refresh"
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
          Connect the <strong>osrs-boss-sync</strong> RuneLite plugin to sync
          your bank, inventory, worn gear, and skills — then this builds the
          best loadout you can equip for this boss.
        </p>
      )}
      {connected && !set && (
        <p className="text-sm text-osrs-brown mb-3">
          Your bank can&apos;t produce a valid loadout (you need at least a
          weapon you can equip). Buy a starter weapon first.
        </p>
      )}
      {connected && set && (
        <p className="text-caption text-osrs-muted mb-3">
          Hover a slot to see why it was picked — click to swap items.
        </p>
      )}

      <EquipmentGrid
        set={set}
        ownedItemIds={ownedItemIds}
        mapping={mapping}
        onSlotClick={set ? onSlotClick : undefined}
        slotSize={56}
        editedSlots={new Set(editedSlots)}
        slotDetails={slotDetails}
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
                <strong>Custom loadout</strong> — {editedSlots.length} slot
                {editedSlots.length === 1 ? "" : "s"} edited on top of the
                optimizer&apos;s pick.
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
          {" — "}
          {c.requirement.remediation}
        </div>
      ))}
    </div>
  );
}
