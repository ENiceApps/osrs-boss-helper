// Metadata shell for the client-rendered /items page — a client component
// can't export metadata, so the title/canonical live in this pass-through
// server layout instead.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item browser",
  description:
    "Every OSRS equipment item in one sortable table — attack and defence " +
    "bonuses, strength, prayer, speed, and live Grand Exchange prices.",
  alternates: { canonical: "/items" },
};

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
