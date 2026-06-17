// Wiki-calc verification helper.
// Prints the checklist of what to enter in dps.osrs.wiki for a given fixture.
//
// Usage:
//   npx tsx scripts/wiki-verify.ts <fixture-id>
//   npx tsx scripts/wiki-verify.ts --all          (print every unverified fixture)
//
// After entering the setup in the wiki calc, update the fixture's baseline and
// change verifiedOn to today's date.

import { ITEM_CATALOG } from "@/data/items/catalog";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { ORACLE_MATRIX } from "@/tests/fixtures/oracle-matrix";

const ITEM_BY_ID = new Map(ITEM_CATALOG.map((i) => [i.id, i]));

const SLOT_ORDER = [
  "head", "cape", "neck", "ammo",
  "weapon", "body", "shield",
  "legs", "hands", "feet", "ring",
] as const;

function printFixture(fixtureId: string): void {
  const fixture = ORACLE_MATRIX.find((f) => f.id === fixtureId);
  if (!fixture) {
    console.error(`Fixture not found: ${fixtureId}`);
    console.error(`Available: ${ORACLE_MATRIX.map((f) => f.id).join(", ")}`);
    process.exit(1);
  }

  const boss = MONSTER_BY_SLUG[fixture.bossSlug];

  console.log("─".repeat(60));
  console.log(`Fixture:  ${fixture.id}`);
  console.log(`Boss:     ${boss?.name ?? fixture.bossSlug}`);
  console.log(`Style:    ${fixture.attackType} / ${fixture.choice}`);
  if (fixture.spellElement) console.log(`Spell:    ${fixture.spellElement} (max hit ${fixture.baseSpellMaxHit ?? "?"})`);
  console.log(`Verified: ${fixture.baseline.verifiedOn}`);
  console.log();

  // Group items by slot
  const bySlot = new Map<string, { id: number; name: string }[]>();
  for (const id of fixture.itemIds) {
    const item = ITEM_BY_ID.get(id);
    const slot = item?.slot ?? "unknown";
    const name = item?.name ?? `ID ${id}`;
    if (!bySlot.has(slot)) bySlot.set(slot, []);
    bySlot.get(slot)!.push({ id, name });
  }

  console.log("Items to enter in dps.osrs.wiki:");
  for (const slot of SLOT_ORDER) {
    const items = bySlot.get(slot);
    if (items) {
      for (const item of items) {
        console.log(`  ${slot.padEnd(8)} ${item.name} (id: ${item.id})`);
      }
    }
  }
  const unknown = bySlot.get("unknown");
  if (unknown) {
    for (const item of unknown) {
      console.log(`  ???      ${item.name} (id: ${item.id})`);
    }
  }

  console.log();
  console.log("Code paths tested:");
  for (const path of fixture.codePaths) {
    console.log(`  • ${path}`);
  }

  if (fixture.wikiNotes) {
    console.log();
    console.log("Wiki calc notes:");
    console.log(`  ${fixture.wikiNotes}`);
  }

  console.log();
  console.log("Current engine baseline:");
  console.log(`  maxHit:   ${fixture.baseline.maxHit}`);
  console.log(`  accuracy: ${fixture.baseline.accuracy.toFixed(4)}`);
  if (fixture.baseline.dps !== undefined) {
    console.log(`  dps:      ${fixture.baseline.dps.toFixed(3)}`);
  }

  console.log();
  console.log("After checking the wiki calc, update oracle-matrix.ts:");
  console.log(`  baseline: { maxHit: <wiki>, accuracy: <wiki>, dps: <wiki>, verifiedOn: "${new Date().toISOString().slice(0, 10)}" }`);
  console.log("─".repeat(60));
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage:");
  console.log("  npx tsx scripts/wiki-verify.ts <fixture-id>");
  console.log("  npx tsx scripts/wiki-verify.ts --all");
  console.log();
  console.log("Fixtures:");
  for (const f of ORACLE_MATRIX) {
    const verified = f.baseline.verifiedOn.startsWith("engine-only") || f.baseline.verifiedOn === "TODO";
    const tag = verified ? "⚠ unverified" : "✓ verified  ";
    console.log(`  ${tag}  ${f.id}`);
  }
  process.exit(0);
}

if (args[0] === "--all") {
  const unverified = ORACLE_MATRIX.filter(
    (f) => f.baseline.verifiedOn.startsWith("engine-only") || f.baseline.verifiedOn === "TODO",
  );
  if (unverified.length === 0) {
    console.log("All fixtures verified.");
    process.exit(0);
  }
  console.log(`${unverified.length} unverified fixture(s):\n`);
  for (const f of unverified) {
    printFixture(f.id);
    console.log();
  }
} else {
  printFixture(args[0]);
}
