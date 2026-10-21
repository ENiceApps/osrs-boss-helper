// The Fractured Archive (Raids 4, 2026-10-20): the hand-authored bosses and
// rewards (data/monsters/supplemental.ts, data/items/supplemental.ts) reach
// the generated catalogs and the data tables that gate them — categories,
// ammo rules, bolt procs, the powered-staff formula, the Zeal prayer, and the
// Nex crush-defence nerf shipped in the same update.

import { describe, expect, it } from "vitest";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { categoryForMonster, HEADLINE_BOSS_SLUGS } from "@/data/monsters/categories";
import { ITEM_CATALOG } from "@/data/items/catalog";
import { checkAmmoCompat, checkAmmoCompatWithCategory } from "@/data/ammo-compatibility";
import { BOLT_EFFECT_BY_ITEM_ID } from "@/data/items/bolt-procs";
import { UNCHARGED_PRICE_ID } from "@/data/items/charged-items";
import { POWERED_STAFF_FORMULA } from "@/data/items/powered-staff-spells";
import { PRAYER_OPTIONS, prayerById } from "@/data/prayers";

const TFA_SLUGS = [
  "archive-guardian",
  "ezekiel",
  "bork",
  "the-smorks",
  "moia",
  "dreadnoth-the-jellied",
  "xarth",
  "ocellus",
];

const itemsNamed = (name: string) => ITEM_CATALOG.filter((it) => it.name === name);

describe("The Fractured Archive bosses", () => {
  it("every boss is in the catalog under the TFA category", () => {
    for (const slug of TFA_SLUGS) {
      expect(MONSTER_BY_SLUG[slug], slug).toBeDefined();
      expect(categoryForMonster(slug)).toBe("tfa");
    }
  });

  it("Ocellus opens on Phase 1 and offers Phase 3 as a stat phase", () => {
    const ocellus = MONSTER_BY_SLUG["ocellus"];
    expect(ocellus.version).toBe("Phase 1");
    expect(ocellus.hp).toBe(2500);
    expect(ocellus.attributes).toContain("demon");
    expect(ocellus.phases?.map((p) => p.version)).toEqual(["Phase 1", "Phase 3"]);
    expect(ocellus.phases?.[1].hp).toBe(5250);
    expect(HEADLINE_BOSS_SLUGS.has("ocellus")).toBe(true);
  });

  it("Bork starts with 10 flat armour and loses it when stunned", () => {
    const bork = MONSTER_BY_SLUG["bork"];
    expect(bork.version).toBe("Base");
    expect(bork.defenceBonuses.flatArmour).toBe(10);
    const stunned = bork.phases?.find((p) => p.version === "Stunned");
    expect(stunned?.defenceBonuses.flatArmour).toBeUndefined();
  });

  it("carries the wiki attributes and elemental weaknesses", () => {
    expect(MONSTER_BY_SLUG["archive-guardian"].attributes).toContain("flying");
    expect(MONSTER_BY_SLUG["archive-guardian"].weakness).toEqual({ element: "fire", severity: 80 });
    expect(MONSTER_BY_SLUG["xarth"].attributes).toContain("demon");
    expect(MONSTER_BY_SLUG["xarth"].weakness).toEqual({ element: "water", severity: 85 });
    // Post-launch wiki corrections (2026-10-20 evening): Dreadnoth is a demon,
    // Moia is weak to Air, the Smorks have 2 flat armour.
    expect(MONSTER_BY_SLUG["dreadnoth-the-jellied"].attributes).toContain("demon");
    expect(MONSTER_BY_SLUG["moia"].weakness).toEqual({ element: "air", severity: 80 });
    expect(MONSTER_BY_SLUG["the-smorks"].defenceBonuses.flatArmour).toBe(2);
  });

  it("Nex's crush defence is the post-launch +35, not the vendored +60", () => {
    expect(MONSTER_BY_SLUG["nex"].defenceBonuses.crush).toBe(35);
  });
});

describe("The Fractured Archive rewards", () => {
  it("Obligator and Zorya's tome are catalogued charged and uncharged, priced uncharged", () => {
    for (const [name, unchargedId] of [
      ["Obligator", 34717],
      ["Zorya's tome", 34727],
    ] as const) {
      const versions = itemsNamed(name);
      expect(versions.map((v) => v.version).sort()).toEqual(["Charged", "Uncharged"]);
      for (const v of versions) {
        expect(v.isTwoHanded).toBe(true);
        expect(UNCHARGED_PRICE_ID.get(v.id)).toBe(unchargedId);
      }
    }
    const obligator = itemsNamed("Obligator")[0];
    expect(obligator.attackCrush).toBe(120);
    expect(obligator.str).toBe(40);
    expect(obligator.requirements).toEqual({ attack: 85 });
  });

  it("Zorya's tome is a 3-tick powered staff with +15% magic damage", () => {
    for (const tome of itemsNamed("Zorya's tome")) {
      expect(tome.category).toBe("Powered Staff");
      expect(tome.speed).toBe(3);
      expect(tome.magicStr).toBe(150);
      expect(tome.requirements).toEqual({ magic: 85 });
      expect(POWERED_STAFF_FORMULA.get(tome.id)?.(99)).toBe(18);
    }
  });

  it("Ascension crossbows fire only Ascension bolts", () => {
    const [xbow] = itemsNamed("Ascension crossbows");
    expect(xbow.category).toBe("Crossbow");
    expect(xbow.speed).toBe(3);
    expect(xbow.isTwoHanded).toBe(true);
    expect(xbow.requirements).toEqual({ ranged: 80 });

    expect(checkAmmoCompat("Ascension crossbows", "Ascension bolts")).toEqual({ ok: true });
    expect(checkAmmoCompat("Ascension crossbows", "Onyx ascension bolts (e)")).toEqual({ ok: true });
    expect(checkAmmoCompat("Ascension crossbows", "Ruby dragon bolts (e)").ok).toBe(false);
    expect(checkAmmoCompat("Ascension crossbows", "Dragon arrow").ok).toBe(false);
    // And no other crossbow can fire them.
    expect(checkAmmoCompat("Zaryte crossbow", "Ascension bolts").ok).toBe(false);
    expect(checkAmmoCompatWithCategory("Dragon crossbow", "Crossbow", "Diamond ascension bolts").ok).toBe(false);
  });

  it("enchanted Ascension bolts keep their gem procs", () => {
    expect(BOLT_EFFECT_BY_ITEM_ID.get(34696)).toBe("diamond");
    expect(BOLT_EFFECT_BY_ITEM_ID.get(34708)).toBe("onyx");
    expect(BOLT_EFFECT_BY_ITEM_ID.get(34690)).toBeUndefined(); // unenchanted
    for (const name of ["Ascension bolts", "Diamond ascension bolts (e)", "Onyx ascension bolts (e)"]) {
      const [bolt] = itemsNamed(name);
      expect(bolt.slot).toBe("ammo");
      expect(bolt.rangedStr).toBe(name === "Ascension bolts" ? 53 : 58);
    }
  });

  it("Rondache is a shield with strength and an 80 Defence requirement", () => {
    const [shield] = itemsNamed("Rondache");
    expect(shield.slot).toBe("shield");
    expect(shield.str).toBe(8);
    expect(shield.defRanged).toBe(55);
    expect(shield.requirements).toEqual({ defence: 80 });
  });

  it("lists all five Living record capes", () => {
    for (let tier = 1; tier <= 5; tier++) {
      const [cape] = itemsNamed(`Living record (tier ${tier})`);
      expect(cape?.slot).toBe("cape");
    }
  });
});

describe("Zeal", () => {
  it("is a selectable melee prayer above Piety, but Piety stays the default", () => {
    const melee = PRAYER_OPTIONS.melee;
    expect(melee[0].id).toBe("zeal");
    expect(melee[1].id).toBe("piety");
    const zeal = prayerById("melee", "zeal");
    expect(zeal.level).toBe(84);
    expect(zeal.selection.attackMultiplier).toBe(1.25);
    expect(zeal.selection.strengthMultiplier).toBe(1.28);
    expect(zeal.selection.defenceMultiplier).toBe(1.25);
    expect(prayerById("melee", undefined).id).toBe("piety");
  });
});
