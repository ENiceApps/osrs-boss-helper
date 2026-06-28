// Landing page (/): the app's front door — a type-ahead boss search, a few
// popular quick-pick bosses, and a link into the full catalog. Server component.

import Link from "next/link";
import { MONSTER_CATALOG, MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { BossSearch } from "@/components/BossSearch";

// A few well-known targets for one-click access. Filtered against the catalog
// so a renamed/missing slug simply drops out rather than 404-ing.
const QUICK_PICK_SLUGS = [
  // Combat dummy first: a no-defence, no-mechanics baseline for raw-DPS checks
  // and a sensible default when you haven't picked a real boss yet. Ditto next:
  // a fully editable "theoretical boss" sandbox.
  "combat-dummy",
  "ditto",
  "vorkath",
  "zulrah",
  "alchemical-hydra",
  "vardorvis",
  "cerberus",
  "scurrius",
];

export default function HomePage() {
  const quickPicks = QUICK_PICK_SLUGS.map((slug) => MONSTER_BY_SLUG[slug]).filter(
    (m): m is NonNullable<typeof m> => Boolean(m),
  );

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col items-center text-center pt-16 sm:pt-24">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-osrs-gold">
        OSRS Boss Helper
      </h1>
      <p className="text-parchment-dark mt-3 max-w-lg">
        Pick a boss and get a DPS-optimised loadout built from your own bank,
        plus the mechanics and spec weapons that matter for the fight.
      </p>

      <div className="w-full mt-8">
        <BossSearch />
      </div>

      {quickPicks.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="label-eyebrow text-parchment-dark">Popular</span>
          {quickPicks.map((m) => (
            <Link
              key={m.slug}
              href={`/boss/${m.slug}`}
              className="osrs-panel rounded px-3 py-1 text-sm text-osrs-brown hover:bg-osrs-gold/10 transition-colors"
            >
              {m.name}
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/bosses"
        className="mt-8 text-sm text-osrs-gold hover:underline"
      >
        Browse all {MONSTER_CATALOG.length} bosses →
      </Link>

      <p className="text-caption text-osrs-muted mt-12 max-w-md">
        Tip: install the OSRS Boss Helper Sync RuneLite plugin and connect the
        bank file it writes to load your real gear, inventory, and skills — all
        locally, nothing leaves your machine. Without it, the app demonstrates
        everything on a sample bank.
      </p>
    </div>
  );
}
