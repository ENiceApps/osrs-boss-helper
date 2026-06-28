"use client";

// Modal for choosing the combat spell a magic loadout casts. Lists spells across
// the autocastable spellbooks, gated by the equipped weapon (which spellbooks it
// can autocast and whether it meets each spell's staff requirement), each with
// its effective max hit. Selecting null reverts to the optimizer's auto-pick.

import { useEffect, useMemo, useState } from "react";
import {
  ALL_SPELLS,
  spellEffectiveMaxHit,
  spellMaxHit,
  type SpellEntry,
  type Spellbook,
} from "@/data/spells/catalog";
import {
  weaponCanAutocastSpellbook,
  weaponSatisfiesStaffRequirement,
} from "@/data/items/magic-weapon-autocast";

interface Props {
  currentSpellName?: string;
  magicLevel: number;
  targetAttributes: readonly string[];
  /** Equipped weapon — gates which spellbooks/spells can actually be autocast. */
  weaponId?: number;
  /** Spell chosen, or null to revert to the optimizer's auto-pick. */
  onSelect: (spell: SpellEntry | null) => void;
  onClose: () => void;
}

const SPELLBOOK_LABELS: Record<Spellbook, string> = {
  standard: "Standard",
  ancient: "Ancient",
  arceuus: "Arceuus",
};

const SPELLBOOK_ORDER: Spellbook[] = ["standard", "ancient", "arceuus"];

/**
 * Soft reason a spell can't currently be cast against this target, or undefined.
 * Surfaced as an annotation — the spell is still selectable (what-if).
 */
function uncastableReason(
  spell: SpellEntry,
  magicLevel: number,
  targetAttributes: readonly string[],
): string | undefined {
  if (spell.minLevel > magicLevel) return `needs ${spell.minLevel} Magic`;
  if (spell.requiresAttribute && !targetAttributes.includes(spell.requiresAttribute)) {
    return `${spell.requiresAttribute} only`;
  }
  return undefined;
}

/**
 * Hard reason the EQUIPPED WEAPON can't autocast this spell, or undefined. Unlike
 * uncastableReason, this disables the row entirely — the weapon physically can't
 * cast it, so it must not be chooseable.
 */
function autocastBlockReason(spell: SpellEntry, weaponId: number | undefined): string | undefined {
  if (!weaponCanAutocastSpellbook(weaponId, spell.spellbook)) {
    return `can't autocast ${SPELLBOOK_LABELS[spell.spellbook]}`;
  }
  if (spell.requiresStaff && !weaponSatisfiesStaffRequirement(weaponId, spell.requiresStaff)) {
    return `needs ${spell.requiresStaff}`;
  }
  return undefined;
}

/**
 * Modal for picking the combat spell a magic loadout casts. Lists every spell
 * across Standard / Ancient / Arceuus grouped by spellbook, sorted by effective
 * max hit. Spells you can't currently cast (level / target attribute / missing
 * staff) are greyed with a reason but remain selectable for what-if comparison.
 * Mirrors ItemPickerModal's search / Escape / backdrop behaviour.
 */
export function SpellPickerModal({
  currentSpellName,
  magicLevel,
  targetAttributes,
  weaponId,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");

  const ctx = useMemo(
    () => ({ magicLevel, targetAttributes }),
    [magicLevel, targetAttributes],
  );

  // Group by spellbook, each group sorted by effective max hit (desc).
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? ALL_SPELLS.filter((s) => s.name.toLowerCase().includes(q))
      : ALL_SPELLS;
    return SPELLBOOK_ORDER.map((book) => ({
      book,
      spells: matched
        .filter((s) => s.spellbook === book)
        .sort((a, b) => spellEffectiveMaxHit(b, ctx) - spellEffectiveMaxHit(a, ctx)),
    })).filter((g) => g.spells.length > 0);
  }, [query, ctx]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="osrs-panel rounded p-4 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-osrs-brown">Pick combat spell</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-osrs-brown hover:text-osrs-gold text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spells…"
          className="w-full bg-osrs-field border border-osrs-brown/40 rounded p-1.5 text-sm text-osrs-brown mb-2"
        />

        {/* Auto (best) — clears any manual choice and lets the optimizer pick. */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`w-full text-left p-1.5 rounded border text-caption mb-2 ${
            currentSpellName === undefined
              ? "border-osrs-gold bg-osrs-gold/15"
              : "border-transparent hover:border-osrs-gold/40 hover:bg-osrs-gold/5"
          }`}
        >
          <span className="font-semibold text-osrs-brown">Auto (best)</span>
          <span className="label-eyebrow text-osrs-muted ml-2">
            let the optimizer pick the highest-DPS spell
          </span>
        </button>

        <ul className="overflow-y-auto flex-1 space-y-0.5">
          {groups.map((group) => (
            <li key={group.book}>
              <div className="label-eyebrow text-osrs-muted px-1.5 pt-2 pb-1 sticky top-0 bg-parchment">
                {SPELLBOOK_LABELS[group.book]}
              </div>
              <ul className="space-y-0.5">
                {group.spells.map((spell) => {
                  const isCurrent = spell.name === currentSpellName;
                  // Hard block (weapon can't autocast) disables the row; soft
                  // reason (level / target attribute) only greys it but stays
                  // selectable for what-if comparison.
                  const blocked = autocastBlockReason(spell, weaponId);
                  const reason = blocked ?? uncastableReason(spell, magicLevel, targetAttributes);
                  return (
                    <li key={spell.name}>
                      <button
                        type="button"
                        onClick={blocked ? undefined : () => onSelect(spell)}
                        disabled={!!blocked}
                        className={`w-full text-left p-1.5 rounded border text-caption flex items-center gap-2 ${
                          isCurrent
                            ? "border-osrs-gold bg-osrs-gold/15"
                            : "border-transparent hover:border-osrs-gold/40 hover:bg-osrs-gold/5"
                        } ${reason ? "opacity-50" : ""} ${blocked ? "cursor-not-allowed" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-osrs-brown truncate">
                            {spell.name}
                          </div>
                          <div className="label-eyebrow text-osrs-brown-light flex flex-wrap gap-x-2">
                            <span>max {spellMaxHit(spell, magicLevel)}</span>
                            {spell.element !== "none" && <span>{spell.element}</span>}
                          </div>
                        </div>
                        {reason && (
                          <span className="label-eyebrow text-status-missing whitespace-nowrap">
                            {reason}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
