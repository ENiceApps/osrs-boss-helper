"use client";

import type { MechanicEvaluation } from "@/lib/mechanics";

interface Props {
  evaluations: MechanicEvaluation[];
}

export function MechanicsPanel({ evaluations }: Props) {
  if (evaluations.length === 0) return null;
  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-2">Boss mechanics</h3>
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
            <li key={requirement.id} className="text-xs">
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
    </div>
  );
}
