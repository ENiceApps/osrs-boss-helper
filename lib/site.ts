// Single source of truth for the public site identity — imported by the root
// metadata, the OG image, robots.ts, and sitemap.ts so the canonical URL lives
// in exactly one place.
//
// SITE_URL defaults to the production domain. Set NEXT_PUBLIC_SITE_URL in the
// environment (e.g. a Vercel preview deploy) to point absolute URLs — including
// the social-share card image — at that host instead.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://osrsbosshelper.com"
).replace(/\/+$/, "");

export const SITE_NAME = "OSRS Boss Helper";

export const SITE_DESCRIPTION =
  "Pick any Old School RuneScape boss and get a DPS-optimised gear loadout built from your own bank, plus the mechanics and spec weapons that matter for the fight.";
