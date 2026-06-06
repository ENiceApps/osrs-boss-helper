// Bosses with hand-curated content (presets, mechanics, consumables).
// All other monsters in data/monsters/catalog.ts still get a stats page via
// the /boss/[slug] dynamic route — they just won't have gear recommendations
// or mechanic checklists yet.
//
// To curate a new boss: add its catalog slug here, then create
// data/bosses/<slug>/presets.source.ts (and mechanics, consumables) and
// rerun `npm run build-data`.

export const CURATED_BOSS_SLUGS: ReadonlySet<string> = new Set([
  "vorkath",
]);

export function isBossCurated(slug: string): boolean {
  return CURATED_BOSS_SLUGS.has(slug);
}
