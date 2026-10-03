// Twisted bow scaling, as weirdgloop/osrs-dps-calc @ 89c3e25 computes it
// (src/lib/PlayerVsNPCCalc.ts: accuracy L566-573, max hit L744-748,
// `tbowScaling` L2429-2438) and the wiki describes it
// (https://oldschool.runescape.wiki/w/Twisted_bow): the bow scales off the
// higher of the target's Magic level and magic attack bonus, capped at 250 —
// 350 inside the Chambers of Xeric — and each bonus percent is clamped, to
// 140% accuracy and 250% damage.

/** Magic value cap outside the Chambers of Xeric. */
export const TBOW_MAGIC_CAP = 250;
/** Magic value cap vs Xerician (Chambers of Xeric) targets. */
export const TBOW_MAGIC_CAP_XERICIAN = 350;

export interface TwistedBowMagic {
  /** The value the bow scales off: max(Magic level, magic attack bonus), capped. */
  magic: number;
  /** Which stat supplied it (the Magic level on a tie). */
  source: "magicLevel" | "magicAttackBonus";
  /** The cap that applies: 250, or 350 vs a Xerician target. */
  cap: number;
  /** The higher stat exceeded the cap, so `magic` is the cap. */
  capped: boolean;
}

/**
 * Upstream's `tbowMagic = min(cap, max(monster.skills.magic,
 * monster.offensive.magic))`, plus which stat won for the UI's explanation.
 */
export function twistedBowMagic(
  magicLevel: number,
  magicAttackBonus: number,
  xerician: boolean,
): TwistedBowMagic {
  const cap = xerician ? TBOW_MAGIC_CAP_XERICIAN : TBOW_MAGIC_CAP;
  const higher = Math.max(magicLevel, magicAttackBonus);
  return {
    magic: Math.min(cap, higher),
    source: magicAttackBonus > magicLevel ? "magicAttackBonus" : "magicLevel",
    cap,
    capped: higher > cap,
  };
}

/**
 * The bonus percent for a (capped) magic value — upstream's `tbowScaling` with
 * its integer-truncated terms and its clamp: [0, 140] for accuracy, [0, 250]
 * for damage. The unclamped curve peaks above the clamp (141% accuracy at
 * magic 250, 150% at 350), which is where the clamp bites.
 */
export function twistedBowBonusPct(magic: number, mode: "accuracy" | "damage"): number {
  const accuracy = mode === "accuracy";
  const factor = accuracy ? 10 : 14;
  const base = accuracy ? 140 : 250;
  const clamp = accuracy ? 140 : 250;
  const t2 = Math.trunc((3 * magic - factor) / 100);
  const t3 = Math.trunc((Math.trunc((3 * magic) / 10) - 10 * factor) ** 2 / 100);
  return Math.max(0, Math.min(clamp, base + t2 - t3));
}

/** Scale an attack roll or max hit by the bonus percent, truncating as upstream. */
export function applyTwistedBow(value: number, magic: number, mode: "accuracy" | "damage"): number {
  return Math.trunc((value * twistedBowBonusPct(magic, mode)) / 100);
}
