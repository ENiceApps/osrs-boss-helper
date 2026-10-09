import type { MetadataRoute } from "next";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { RELEASES } from "@/data/updates";
import { SITE_URL } from "@/lib/site";

// Generated /sitemap.xml — the static pages plus every boss page, so search
// engines can index all ~725 targets. Well under the 50k-URL per-file limit, so
// a single sitemap suffices.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/bosses`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/items`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    {
      url: `${SITE_URL}/updates`,
      lastModified: new Date(`${RELEASES[0].date}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const bossPages: MetadataRoute.Sitemap = MONSTER_CATALOG.map((m) => ({
    url: `${SITE_URL}/boss/${m.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...bossPages];
}
