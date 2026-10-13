// /updates — ENice's pinned note plus dated release notes (newest first).
// The roadmap (PLANNED) is internal and deliberately not shown here.
// Server component over static data in data/updates.ts; no client JS.

import type { Metadata } from "next";
import {
  COMMUNITY_NOTE,
  RELEASES,
  CHANGE_KIND_ORDER,
  CHANGE_KIND_LABEL,
  formatReleaseDate,
} from "@/data/updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "What's changed in OSRS Boss Helper, version by version.",
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">Updates</h1>
      <p className="text-sm text-parchment-dark mt-1">
        What&apos;s changed in OSRS Boss Helper, newest first.
      </p>
      <p className="text-caption text-osrs-muted mt-2">
        Version numbers: the first number changes when something big changes how the app works, the
        middle one for new features, the last one for fixes.
      </p>

      {COMMUNITY_NOTE && (
        <section className="osrs-panel rounded-lg p-4 sm:p-6 mt-6" aria-label="A note from ENice">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="label-eyebrow">From ENice</p>
            <time dateTime={COMMUNITY_NOTE.date} className="text-caption text-osrs-muted">
              Posted {formatReleaseDate(COMMUNITY_NOTE.date)}
            </time>
          </div>
          {COMMUNITY_NOTE.blocks.map((block, i) =>
            typeof block === "string" ? (
              <p key={i} className="text-sm text-parchment-dark leading-relaxed mt-2">
                {block}
              </p>
            ) : (
              <ul
                key={i}
                className="mt-2 space-y-1.5 list-disc pl-5 marker:text-osrs-gold/60 text-sm leading-relaxed text-parchment-dark"
              >
                {block.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      )}

      {RELEASES.map((r) => (
        <article
          key={r.version}
          id={`v${r.version}`}
          className="osrs-panel rounded-lg p-4 sm:p-6 mt-6 scroll-mt-16"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="font-display text-lg font-semibold text-osrs-gold">
              <a href={`#v${r.version}`} className="hover:underline">
                v{r.version}
              </a>
            </h2>
            <time dateTime={r.date} className="text-caption text-osrs-muted">
              {formatReleaseDate(r.date)}
            </time>
          </div>
          <p className="text-sm text-osrs-brown mt-0.5">{r.title}</p>

          {r.note && (
            <div className="osrs-well rounded p-3 sm:p-4 mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="label-eyebrow">From ENice</p>
                <time dateTime={r.date} className="text-caption text-osrs-muted">
                  Posted {formatReleaseDate(r.date)}
                </time>
              </div>
              {r.note.map((para, i) => (
                <p key={i} className="text-sm text-parchment-dark leading-relaxed mt-2">
                  {para}
                </p>
              ))}
            </div>
          )}

          {CHANGE_KIND_ORDER.map((kind) => {
            const items = r.changes.filter((c) => c.kind === kind);
            if (items.length === 0) return null;
            return (
              <div key={kind}>
                <h3 className="label-eyebrow mt-4">{CHANGE_KIND_LABEL[kind]}</h3>
                <ul className="mt-1.5 space-y-1.5 list-disc pl-5 marker:text-osrs-gold/60 text-sm leading-snug text-parchment-dark">
                  {items.map((c, i) => (
                    <li key={`${kind}-${i}`}>
                      {c.lead && (
                        <>
                          <span className="font-semibold text-osrs-brown">{c.lead}</span> —{" "}
                        </>
                      )}
                      {c.text}
                      {c.thanks && <span className="text-osrs-muted"> (thanks {c.thanks})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </article>
      ))}
    </div>
  );
}
