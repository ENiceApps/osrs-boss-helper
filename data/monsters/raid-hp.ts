// Hitpoints as the wiki DPS calculator scales them at its default inputs
// (party size 1, invocation 0, path level 0). Only the Theatre of Blood and
// the Tombs of Amascut change at those defaults (upstream scaling/
// TheatreOfBlood.ts and TombsOfAmascut.ts @ 74958b1; solo Chambers of Xeric
// scaling is the identity):
//
//   Theatre of Blood (normal / hard): the party size is clamped to 3-5, so the
//     smallest scale is trunc(hp x 6/8).
//   Theatre of Blood (entry mode): solo is trunc(hp x 10/40).
//   Tombs of Amascut: an ejected Warden core has 4500; then hitpoints over 100
//     round to the nearest 5 (10 over 300).
//
// The DPS engine reads hitpoints for one thing: a ruby bolt's proc, a share of
// the target's CURRENT hitpoints.

import { TOMBS_OF_AMASCUT_IDS } from "./hit-rules";

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const TOB_IDS: ReadonlySet<number> = new Set([
  10830, 10831, 10832, 8369, 8370, 8371, 10847, 10848, 10849, // Verzik P1 (all modes, as upstream lists them)
  ...range(8360, 8365), 8366, 8367, 8359, ...range(8342, 8353), 8355, 8356, 8357,
  8387, 8388, 10867, 10868, 8339, 8340, 8372, 8373, 8374, 8376, ...range(8381, 8385),
  ...range(10822, 10827), 10828, 10829, 10813, ...range(10791, 10802), 10804, 10805, 10806,
  10808, 10809, 10810, 10770, 10771, 10772, 10850, 10851, 10852, 10854, ...range(10858, 10862),
]);

const TOB_ENTRY_IDS: ReadonlySet<number> = new Set([
  ...range(10814, 10819), 10820, 10821, 10812, ...range(10774, 10785), 10787, 10788, 10789,
  10864, 10865, 10767, 10768, 10833, 10834, 10835, 10837, ...range(10841, 10845),
]);

const BABA_MONKEY_ROOM_IDS: ReadonlySet<number> = new Set([
  11781, 11709, 11712, 11711, 11714, 11715, 11718, 11710, 11713, 11717, 11716,
]);
const WARDEN_CORE_EJECTED_IDS: ReadonlySet<number> = new Set([11755, 11758]);

/** The target's hitpoints at the wiki calc's default raid inputs. */
export function wikiDefaultHp(target: { wikiId: number; hp: number }): number {
  const { wikiId: id, hp } = target;
  if (TOB_IDS.has(id)) return Math.trunc((hp * 6) / 8);
  if (TOB_ENTRY_IDS.has(id)) return Math.trunc((hp * 10) / 40);
  if (TOMBS_OF_AMASCUT_IDS.has(id) && !BABA_MONKEY_ROOM_IDS.has(id)) {
    let scaled = WARDEN_CORE_EJECTED_IDS.has(id) ? 4500 : hp;
    if (scaled > 100) {
      const roundTo = scaled > 300 ? 10 : 5;
      scaled = Math.trunc((scaled + Math.trunc(roundTo / 2)) / roundTo) * roundTo;
    }
    return scaled;
  }
  return hp;
}
