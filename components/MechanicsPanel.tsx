"use client";

// Collapsible "Boss mechanics" checklist. Each row is a fight requirement
// (anti-dragonfire, anti-venom, melee reach, …) evaluated against the current
// setup and shown green/red, with the unmet count surfaced on the collapsed
// header. Info-only rows (no pass/fail) are also supported.

import { CollapsibleSection } from "./ui";
import type { MechanicEvaluation } from "@/lib/mechanics";

interface Props {
  evaluations: MechanicEvaluation[];
}

export function MechanicsPanel({ evaluations }: Props) {
  if (evaluations.length === 0) return null;
  const hasChecked = evaluations.some((e) => e.satisfied !== null);
  const hasInfo = evaluations.some((e) => e.satisfied === null);
  // Surface unmet checks on the collapsed header so a missing mechanic is
  // visible even before the section is opened.
  const missingCount = evaluations.filter((e) => e.satisfied === false).length;
  return (
    <CollapsibleSection
      title="Boss mechanics"
      right={
        missingCount > 0 ? (
          <span className="text-caption text-status-missing tabular-nums">
            {missingCount} missing
          </span>
        ) : undefined
      }
    >
      {/* Legend so the colored dots read as a checklist, not errors. */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 label-eyebrow text-osrs-muted mb-3">
        {hasChecked && (
          <>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-owned" /> Have it
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-missing" /> Missing
            </span>
          </>
        )}
        {hasInfo && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-osrs-brown-light" /> Info
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {evaluations.map(({ requirement, satisfied }) => {
          // satisfied === null → informational (no item-backed check)
          const indicator =
            satisfied === null
              ? "bg-osrs-brown-light"
              : satisfied
                ? "bg-status-owned"
                : "bg-status-missing";
          const body =
            satisfied === null || satisfied
              ? requirement.description
              : requirement.remediation;
          return (
            <li key={requirement.id} className="text-caption">
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={`inline-block w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${indicator}`}
                  title={
                    satisfied === null
                      ? "Informational"
                      : satisfied
                        ? "Owned"
                        : "Missing"
                  }
                />
                <div>
                  <div className="font-semibold text-osrs-brown">{requirement.label}</div>
                  <div className="text-osrs-brown-light">{body}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CollapsibleSection>
  );
}
