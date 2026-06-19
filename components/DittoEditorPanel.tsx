"use client";

import type { MonsterCatalogEntry } from "@/data/monsters/catalog";
import type { SpellElement } from "@/types/osrs";

interface Props {
  monster: MonsterCatalogEntry;
  onChange: (next: MonsterCatalogEntry) => void;
}

// Attributes that actually change DPS in the engine, offered as toggles. (e.g.
// "dragon" enables dragon-hunter bonuses, "flying" forces halberd-only melee.)
const TOGGLE_ATTRS: { key: string; label: string; hint: string }[] = [
  { key: "dragon", label: "Dragon", hint: "Dragon hunter weapons" },
  { key: "undead", label: "Undead", hint: "Salve amulet" },
  { key: "demon", label: "Demon", hint: "Arclight / Emberlight" },
  { key: "fiery", label: "Fiery", hint: "fire-spell resistance flag" },
  { key: "flying", label: "Flying", hint: "halberd-only in melee" },
  { key: "xerician", label: "Xerician", hint: "Twisted bow CoX cap" },
  { key: "kalphite", label: "Kalphite", hint: "" },
  { key: "leafy", label: "Leafy", hint: "" },
];

const ELEMENTS: SpellElement[] = ["none", "air", "water", "earth", "fire"];

const DEFENCE_FIELDS: { key: keyof MonsterCatalogEntry["defenceBonuses"]; label: string }[] = [
  { key: "stab", label: "Stab" },
  { key: "slash", label: "Slash" },
  { key: "crush", label: "Crush" },
  { key: "magic", label: "Magic" },
  { key: "rangedHeavy", label: "Rng (heavy)" },
  { key: "rangedStandard", label: "Rng (std)" },
  { key: "rangedLight", label: "Rng (light)" },
];

function NumField({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="label-eyebrow text-osrs-muted">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => {
          const n = Math.max(min, Math.round(Number(e.target.value) || 0));
          onChange(n);
        }}
        className="w-full p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm"
      />
    </label>
  );
}

/**
 * Live editor for the "Ditto" theoretical boss. Every field mutates the monster
 * object the cockpit is built from, so DPS / loadout / mechanics recompute
 * instantly as you tweak. A boss sandbox for "what if it had 300 magic def?".
 */
export function DittoEditorPanel({ monster, onChange }: Props) {
  const patch = (p: Partial<MonsterCatalogEntry>) => onChange({ ...monster, ...p });
  const patchDef = (k: keyof MonsterCatalogEntry["defenceBonuses"], n: number) =>
    onChange({ ...monster, defenceBonuses: { ...monster.defenceBonuses, [k]: n } });

  const element: SpellElement = (monster.weakness?.element as SpellElement) ?? "none";

  function setElement(el: SpellElement) {
    if (el === "none") patch({ weakness: null });
    else patch({ weakness: { element: el, severity: monster.weakness?.severity ?? 40 } });
  }

  function toggleAttr(key: string) {
    const has = monster.attributes.includes(key);
    patch({
      attributes: has
        ? monster.attributes.filter((a) => a !== key)
        : [...monster.attributes, key],
    });
  }

  return (
    <div className="osrs-panel p-4 rounded space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="section-title font-semibold text-osrs-brown">Custom boss (Ditto)</h3>
        <span className="text-caption text-osrs-muted">edits recompute live</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <NumField label="HP" value={monster.hp} min={1} onChange={(n) => patch({ hp: n })} />
        <NumField label="Combat lvl" value={monster.combatLevel} min={1} onChange={(n) => patch({ combatLevel: n })} />
        <NumField label="Size" value={monster.size} min={1} onChange={(n) => patch({ size: n })} />
        <NumField label="Defence lvl" value={monster.defenceLevel} min={0} onChange={(n) => patch({ defenceLevel: n })} />
        <NumField label="Magic lvl" value={monster.magicLevel} min={0} onChange={(n) => patch({ magicLevel: n })} />
      </div>

      <div>
        <span className="label-eyebrow text-osrs-muted">Defence bonuses</span>
        <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEFENCE_FIELDS.map((f) => (
            <NumField
              key={f.key}
              label={f.label}
              value={monster.defenceBonuses[f.key]}
              min={-100}
              onChange={(n) => patchDef(f.key, n)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-0.5">
          <span className="label-eyebrow text-osrs-muted">Weakness</span>
          <select
            value={element}
            onChange={(e) => setElement(e.target.value as SpellElement)}
            className="w-full p-1.5 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown text-sm capitalize"
          >
            {ELEMENTS.map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </label>
        {element !== "none" && (
          <NumField
            label="Severity %"
            value={monster.weakness?.severity ?? 40}
            min={0}
            onChange={(n) => patch({ weakness: { element, severity: n } })}
          />
        )}
      </div>

      <div>
        <span className="label-eyebrow text-osrs-muted">Attributes</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {TOGGLE_ATTRS.map((a) => {
            const on = monster.attributes.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => toggleAttr(a.key)}
                title={a.hint}
                className={`rounded px-2 py-0.5 text-caption font-medium border transition-colors ${
                  on
                    ? "bg-osrs-gold/20 text-osrs-gold border-osrs-gold/50"
                    : "text-osrs-brown border-osrs-brown/30 hover:bg-osrs-gold/10"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-osrs-brown cursor-pointer select-none">
        <input
          type="checkbox"
          checked={monster.isSlayerMonster}
          onChange={(e) => patch({ isSlayerMonster: e.target.checked })}
          className="h-4 w-4 accent-osrs-gold"
        />
        <span>Assignable as a Slayer task (enables the on-task bonus)</span>
      </label>
    </div>
  );
}
