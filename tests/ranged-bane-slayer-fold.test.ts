// On a slayer task, ranged-bane DAMAGE bonuses fold ADDITIVELY into the
// imbued black mask multiplier — wgloop's "additive with slayer only" block:
//   ×(23 + bonus)/20 where DHCB adds 5, wilderness weapons add 10, and the
//   Scorching bow adds 6 — NOT ×23/20 stacked multiplicatively with the
//   weapon's own factor. Off-task (or with a Salve suppressing the mask) the
//   standalone factors apply as before. Accuracy is unaffected either way.
// The Scorching bow's fold is pinned in tests/demonbane.test.ts; this file
// covers DHCB and the wilderness bows.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { SKILLS_AT_99 } from "@/lib/recommend";
import { scoreScenario } from "@/lib/optimize/scenario";

const VORKATH = MONSTER_BY_SLUG["vorkath"]; // dragon (undead too — but no Salve worn here)
const DOOM = MONSTER_BY_SLUG["doom-of-mokhaiotl"]; // demon — neutral for DHCB/wildy kits
const CALLISTO = MONSTER_BY_SLUG["callisto"]; // Wilderness boss

const DHCB = 21012;
const DRAGON_BOLTS = 21905; // plain — no enchanted-bolt proc muddying the max hit
const CRAWS_BOW = 22550; // charged — supplies its own ammo, no arrows needed
const SLAYER_HELM_I = 11865;

function maxHitOf(itemIds: number[], target: typeof VORKATH, onTask: boolean) {
  const s = scoreScenario({ itemIds, target, skills: SKILLS_AT_99, onTask });
  if (!s.valid) throw new Error("scenario invalid");
  return s.dps.maxHit;
}

describe("DHCB damage × slayer helm (i) vs a dragon", () => {
  const KIT = [DHCB, DRAGON_BOLTS, SLAYER_HELM_I];
  // Baseline: same kit vs a non-dragon, off task → raw max hit with no
  // dragonbane and no mask (max hit is target-independent otherwise; the
  // helm carries no ranged strength).
  const raw = maxHitOf(KIT, DOOM, false);

  it("off task: standalone ×5/4 (unchanged behavior)", () => {
    expect(maxHitOf(KIT, VORKATH, false)).toBe(Math.trunc((raw * 5) / 4));
  });

  it("on task: folds into the mask — ×28/20, not ×23/20 × 5/4", () => {
    expect(maxHitOf(KIT, VORKATH, true)).toBe(Math.trunc((raw * 28) / 20));
    // And that differs from the old multiplicative stack for this kit,
    // proving the fold actually changed the number.
    const oldStack = Math.trunc((Math.trunc((raw * 5) / 4) * 23) / 20);
    expect(maxHitOf(KIT, VORKATH, true)).not.toBe(oldStack);
  });
});

describe("wilderness bow damage × slayer helm (i) in the Wilderness", () => {
  const KIT = [CRAWS_BOW, SLAYER_HELM_I];
  // Baseline: same kit vs a non-wilderness target, off task.
  const raw = maxHitOf(KIT, VORKATH, false);

  it("off task: standalone ×3/2 (unchanged behavior)", () => {
    expect(maxHitOf(KIT, CALLISTO, false)).toBe(Math.trunc((raw * 3) / 2));
  });

  it("on task: folds into the mask — ×33/20, not ×23/20 × 3/2", () => {
    expect(maxHitOf(KIT, CALLISTO, true)).toBe(Math.trunc((raw * 33) / 20));
  });

  it("melee wilderness weapons are NOT folded — ×3/2 stays multiplicative with ×7/6", () => {
    const VIGGORAS = 22545; // Viggora's chainmace (charged)
    const rawMelee = maxHitOf([VIGGORAS, SLAYER_HELM_I], VORKATH, false);
    const onTask = maxHitOf([VIGGORAS, SLAYER_HELM_I], CALLISTO, true);
    // conditional ×3/2 first, then mask ×7/6 — the engine's existing order.
    expect(onTask).toBe(Math.trunc((Math.trunc((rawMelee * 3) / 2) * 7) / 6));
  });
});
