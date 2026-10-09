// /updates — dated release notes (newest first) plus the undated roadmap.
// Server component over static data in data/updates.ts; no client JS.

import type { Metadata } from "next";
import {
  RELEASES,
  PLANNED,
  CHANGE_KIND_ORDER,
  CHANGE_KIND_LABEL,
  PLAN_STATUS_LABEL,
  formatReleaseDate,
} from "@/data/updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "OSRS Boss Helper changelog and roadmap: dated release notes for every version, plus what's planned next.",
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">Updates</h1>
      <p className="text-sm text-parchment-dark mt-1">
        What&apos;s changed in OSRS Boss Helper, newest first, and what&apos;s planned next.
      </p>
      <p className="text-caption text-osrs-muted mt-2">
        Version numbers: the first number changes when something big changes how the app works, the
        middle one for new features, the last one for fixes.
      </p>
      <a href="#planned" className="inline-block mt-2 text-sm text-osrs-gold hover:underline">
        What&apos;s planned ↓
      </a>

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
              <p className="label-eyebrow">From Eli</p>
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

      <section id="planned" className="mt-10 scroll-mt-16" aria-labelledby="planned-heading">
        <h2
          id="planned-heading"
          className="section-title font-display text-lg font-semibold text-osrs-gold"
        >
          Planned
        </h2>
        <p className="text-caption text-osrs-muted mt-1">
          Planned: I intend to do it. Considering: I might, and I&apos;d like to hear if you want it.
        </p>
        <ul className="osrs-panel rounded-lg p-4 sm:p-6 mt-3 space-y-2.5">
          {PLANNED.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm leading-snug text-parchment-dark"
            >
              {/* No label-eyebrow here: its unlayered color would beat the Tailwind text color. */}
              <span className="flex-none mt-0.5 rounded border border-osrs-gold/30 bg-osrs-gold/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-osrs-gold">
                {PLAN_STATUS_LABEL[p.status]}
              </span>
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
        <p className="text-caption text-osrs-muted mt-3">
          This is a hobby project made by one person, so the order and scope will change and
          nothing here is a promise. Want something? Use the Feedback button (top right), or open
          an issue on{" "}
          <a
            href="https://github.com/ENiceApps/osrs-boss-helper"
            className="text-osrs-gold hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
