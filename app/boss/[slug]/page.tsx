// Thin server wrapper for the boss page: owns the route (404 for unknown
// slugs), static params for every catalog boss, and the per-boss SEO metadata
// (title/description/canonical) that a fully client page can't express. The
// actual UI lives in BossCockpit.tsx (client).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MONSTER_BY_SLUG } from "@/data/monsters/catalog";
import { BossCockpit } from "./BossCockpit";

type Props = { params: Promise<{ slug: string }> };

// Prerender every boss page at build time — the content is static per slug
// (player-specific state is all client-side), so this gives crawlers fast,
// fully-formed HTML for all ~725 targets.
export function generateStaticParams(): Array<{ slug: string }> {
  return Object.keys(MONSTER_BY_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = MONSTER_BY_SLUG[slug];
  if (!m) return {};
  const name = m.version ? `${m.name} (${m.version})` : m.name;
  return {
    // The root layout's template appends "· OSRS Boss Helper".
    title: `${name} — gear setup & DPS loadout`,
    description:
      `The best ${name} gear setup built from your own OSRS bank — ` +
      `DPS-optimised melee, ranged & magic loadouts, budget builds, upgrade ` +
      `paths, and fight mechanics. Combat level ${m.combatLevel}, ${m.hp} HP.`,
    alternates: { canonical: `/boss/${slug}` },
    openGraph: {
      title: `${name} — OSRS gear setup & DPS loadout`,
      description: `DPS-optimised ${name} loadouts built from your own bank.`,
      url: `/boss/${slug}`,
      // Defining `openGraph` here REPLACES the inherited object wholesale,
      // which drops the root file-convention og:image — re-point at it.
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function BossPage({ params }: Props) {
  const { slug } = await params;
  if (!MONSTER_BY_SLUG[slug]) notFound();
  return <BossCockpit slug={slug} />;
}
