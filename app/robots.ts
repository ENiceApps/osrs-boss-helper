import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Generated /robots.txt — allow crawling everything except the read-only API
// proxies (no useful indexable content there), and point crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
