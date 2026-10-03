/**
 * Summer Sweep-Up (2026-07-22 .. 2026-08-19) data sweep-up regression tests:
 *   - Vampyre Snail (released 2026-08-12) is classified as a Mid-game boss — not
 *     a "Non-boss NPC" and not a Slayer boss — with a mechanics checklist.
 *   - The Phantom Muspah / Demonic gorilla pacing entries (form swap needs 4
 *     damaging hits, Homing Spikes 34 ticks, gorilla prayer swap needs 4 hits AND
 *     70 damage) exist alongside the older entries.
 *   - Every curated mechanic list is well-formed (unique ids, no blank text).
 *
 * The Inquisitor's per-piece rework is covered in tests/armor-sets.test.ts.
 */
import { describe, expect, it } from "vitest";
import { MECHANICS_BY_SLUG } from "@/data/bosses/mechanics";
import { categoryForMonster, isSlayerBoss } from "@/data/monsters/categories";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";

describe("Vampyre Snail (2026-08-12)", () => {
  it("is in the monster catalog under wiki id 16344", () => {
    expect(MONSTER_BY_SLUG["vampyre-snail"]?.wikiId).toBe(16344);
  });

  it("is a Mid-game boss, not a Non-boss NPC, and not a Slayer boss", () => {
    expect(categoryForMonster("vampyre-snail")).toBe("mid");
    expect(isSlayerBoss("vampyre-snail")).toBe(false);
  });

  it("has a mechanics checklist covering the group requirement and its soft defences", () => {
    const ids = (MECHANICS_BY_SLUG["vampyre-snail"] ?? []).map((m) => m.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "vampyre-snail-group",
        "vampyre-snail-ranged-chip",
        "vampyre-snail-dash-slam",
        "vampyre-snail-defence",
        "vampyre-snail-snelm",
        "food",
      ]),
    );
  });
});

describe("Phantom Muspah / Demonic gorilla pacing entries", () => {
  it("Muspah documents the 34-tick Homing Spikes and the 4-hit form-swap rule", () => {
    const muspah = MECHANICS_BY_SLUG["phantom-muspah"] ?? [];
    const spikes = muspah.find((m) => m.id === "muspah-homing-spikes");
    expect(spikes?.label).toMatch(/34/);
    const rotation = muspah.find((m) => m.id === "muspah-phase-rotation");
    expect(rotation?.description).toMatch(/4 separate damaging hits/);
    expect(rotation?.description).toMatch(/zero damage/);
  });

  it("Demonic gorilla documents the 4-hit AND 70-damage overhead-swap rule", () => {
    const swap = (MECHANICS_BY_SLUG["demonic-gorilla"] ?? []).find((m) => m.id === "gorilla-prayer-swap");
    expect(swap?.label).toMatch(/4 hits/);
    expect(swap?.label).toMatch(/70/);
  });
});

describe("curated mechanics are well-formed", () => {
  for (const [slug, list] of Object.entries(MECHANICS_BY_SLUG)) {
    it(`${slug}: unique ids and non-blank label / description / remediation`, () => {
      const ids = list.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const m of list) {
        expect(m.label.trim()).not.toBe("");
        expect(m.description.trim()).not.toBe("");
        expect(m.remediation.trim()).not.toBe("");
      }
    });
  }
});
