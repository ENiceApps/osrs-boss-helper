// /updates — dated release notes plus ENice's letter, everything newest first
// so the latest post is always at the top (the letter slots in by its date).
// The roadmap (PLANNED) is internal and deliberately not shown here.
// Server component over static data in data/updates.ts; no client JS.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  COMMUNITY_NOTE,
  RELEASES,
  CHANGE_KIND_ORDER,
  CHANGE_KIND_LABEL,
  formatReleaseDate,
  type NoteBlock,
  type Release,
} from "@/data/updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "What's changed in OSRS Boss Helper, version by version.",
  alternates: { canonical: "/updates" },
};

function CommunityNoteSection() {
  if (!COMMUNITY_NOTE) return null;
  return (
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
  );
}

/** One block of a release note, as plain text in the order it was written. */
function NoteBlockView({ block }: { block: NoteBlock }) {
  if (typeof block === "string") {
    return <p className="text-sm text-parchment-dark leading-relaxed mt-3">{block}</p>;
  }
  if (!Array.isArray(block)) {
    return <h3 className="label-eyebrow mt-4">{block.heading}</h3>;
  }
  return (
    <ul className="mt-2 space-y-1.5 list-disc pl-5 marker:text-osrs-gold/60 text-sm leading-relaxed text-parchment-dark">
      {block.map((item, i) =>
        typeof item === "string" ? (
          <li key={i}>{item}</li>
        ) : (
          <li key={i}>
            {item.lead && <span className="font-semibold text-osrs-brown">{item.lead}: </span>}
            {item.text}
            {item.sub && item.sub.length > 0 && (
              <ul className="mt-1 space-y-1 list-[circle] pl-5 marker:text-osrs-gold/40">
                {item.sub.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ul>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

function ReleaseArticle({ r }: { r: Release }) {
  return (
    <article id={`v${r.version}`} className="osrs-panel rounded-lg p-4 sm:p-6 mt-6 scroll-mt-16">
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
      {r.author === "ai" && (
        <p className="label-eyebrow mt-3" title="Written by the wiki-watch routine, not ENice">
          From AI
        </p>
      )}

      {r.note?.map((block, i) => (
        <NoteBlockView key={i} block={block} />
      ))}

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
  );
}

export default function UpdatesPage() {
  // One stream, newest first. RELEASES is already newest-first (enforced by
  // tests/updates.test.ts); the letter goes in front of the first release that
  // is not newer than it. ISO dates compare as strings.
  const posts: { key: string; date: string; node: ReactNode }[] = RELEASES.map((r) => ({
    key: `v${r.version}`,
    date: r.date,
    node: <ReleaseArticle r={r} />,
  }));
  if (COMMUNITY_NOTE) {
    const note = { key: "community-note", date: COMMUNITY_NOTE.date, node: <CommunityNoteSection /> };
    const at = posts.findIndex((p) => p.date <= note.date);
    posts.splice(at === -1 ? posts.length : at, 0, note);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">Updates</h1>
      {posts.map((p) => (
        <div key={p.key}>{p.node}</div>
      ))}
    </div>
  );
}
