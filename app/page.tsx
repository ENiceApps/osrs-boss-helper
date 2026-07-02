// Landing page (/): the app's front door — a type-ahead boss search, a few
// popular quick-pick bosses, a link into the full catalog, and a short
// "load your own bank" guide. Server component.

import type { Metadata } from "next";
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

// The three steps to load your real bank, rendered as a numbered guide below.
const BANK_STEPS = [
  {
    title: "Install the plugin",
    body: (
      <>
        In RuneLite, open the <span className="text-osrs-brown">Plugin Hub</span>{" "}
        and add <span className="text-osrs-brown font-semibold">Boss Helper Bank Sync</span>,
        then enable it. It only <em>reads</em> your game data and makes no network
        requests.
      </>
    ),
  },
  {
    title: "Open your bank in-game",
    body: (
      <>
        Log in and open your bank once. The plugin saves a small{" "}
        <code className="text-osrs-brown">bank.json</code> file on your own
        computer — nothing is uploaded.
      </>
    ),
  },
  {
    title: "Connect or upload it here",
    body: (
      <>
        On any boss page, click{" "}
        <span className="text-osrs-brown font-semibold">Connect bank file</span>{" "}
        for live updates (Chrome/Edge/Brave), or{" "}
        <span className="text-osrs-brown font-semibold">Upload bank.json</span>{" "}
        once on any browser. Your data never leaves your machine.
      </>
    ),
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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

      {/* "Load your bank" guide — the recommendations are built from the gear you
          actually own, so the most valuable first step is connecting/uploading
          your bank. Kept simple and numbered so a newcomer can follow it. */}
      <section className="osrs-panel rounded-lg mt-14 w-full max-w-xl p-5 sm:p-6 text-left">
        <h2 className="section-title font-display text-lg font-semibold text-osrs-gold">
          Load your own bank — in 3 steps
        </h2>
        <p className="text-caption text-osrs-muted mt-1">
          Optional, but it lets the optimiser build setups from the gear you
          really have. Free, private, and nothing leaves your computer.
        </p>

        <ol className="mt-4 space-y-3">
          {BANK_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden
                className="flex-none w-6 h-6 rounded-full bg-osrs-gold text-background font-bold text-xs flex items-center justify-center mt-0.5"
              >
                {i + 1}
              </span>
              <p className="text-sm text-parchment-dark leading-snug">
                <span className="text-osrs-brown font-semibold">{step.title}.</span>{" "}
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="text-caption text-osrs-muted mt-4 border-t border-osrs-gold/15 pt-3">
          No RuneLite? Pick any boss and use <span className="text-osrs-brown">Budget mode</span>{" "}
          to plan the best setup for a GP budget — no bank needed.
        </p>
      </section>

      <p className="text-caption text-osrs-muted mt-6">
        Free &amp; open-source · fan-made, not affiliated with Jagex
      </p>
    </div>
  );
}
