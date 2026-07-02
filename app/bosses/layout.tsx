// Metadata shell for the client-rendered /bosses page — a client component
// can't export metadata, so the title/canonical live in this pass-through
// server layout instead.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All bosses",
  description:
    "Browse every Old School RuneScape boss and high-HP monster — filter by " +
    "category, Slayer assignment, weakness, and attributes, then get a gear " +
    "setup built from your own bank.",
  alternates: { canonical: "/bosses" },
};

export default function BossesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
