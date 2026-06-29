// Root layout: global fonts, the Auth.js SessionProvider, the sticky AppHeader,
// and the floating FeedbackButton wrap every page. Also sets the app-wide
// <title>/description metadata.

import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { FeedbackButton } from "@/components/FeedbackButton";
import { ACCENTS, ACCENT_STORAGE_KEY, DEFAULT_ACCENT_ID } from "@/lib/accent";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSRS Boss Helper",
  description:
    "Pick any boss and get a DPS-optimised loadout built from your own bank, plus mechanics and spec weapons for the fight.",
};

// Apply the user's saved highlight color before first paint so a non-default
// accent doesn't flash gold on load. The palette is serialized from the shared
// source of truth in lib/accent.ts.
//
// Gated to production: a raw inline <script> rendered by React triggers a
// React 19 dev warning ("scripts inside React components are never executed on
// the client"). In production that warning is stripped and the script runs
// from the server HTML before paint. In dev it's omitted — AccentPicker still
// applies the saved accent on mount (a brief flash on hard reload, dev only).
const accentBootstrap = `(function(){try{var m=${JSON.stringify(
  Object.fromEntries(ACCENTS.map((a) => [a.id, [a.base, a.light]])),
)};var id=localStorage.getItem(${JSON.stringify(
  ACCENT_STORAGE_KEY,
)})||${JSON.stringify(DEFAULT_ACCENT_ID)};var c=m[id]||m[${JSON.stringify(
  DEFAULT_ACCENT_ID,
)}];var r=document.documentElement.style;r.setProperty('--accent',c[0]);r.setProperty('--accent-light',c[1]);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} h-full antialiased`}
      // The accentBootstrap script writes --accent onto <html> before React
      // hydrates, so the server/client style attribute can differ by design.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {process.env.NODE_ENV === "production" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script dangerouslySetInnerHTML={{ __html: accentBootstrap }} />
        )}
        <AppHeader />
        <main className="flex-1">{children}</main>
        <FeedbackButton />
      </body>
    </html>
  );
}
