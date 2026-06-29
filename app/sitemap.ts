import type { MetadataRoute } from "next";
import { MONSTER_CATALOG } from "@/data/monsters/catalog";
import { SITE_URL } from "@/lib/site";

// Generated /sitemap.xml — the static pages plus every boss page, so search
// engines can index all ~235 targets. Well under the 50k-URL per-file limit, so
// a single sitemap suffices.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/bosses`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/items`, lastModified, changeFrequency: "weekly", priority: 0.6 },
  ];

  const bossPages: MetadataRoute.Sitemap = MONSTER_CATALOG.map((m) => ({
    url: `${SITE_URL}/boss/${m.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...bossPages];
}
