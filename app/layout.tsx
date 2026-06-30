// Root layout: global fonts, the accent-color bootstrap, the sticky AppHeader,
// and the floating FeedbackButton wrap every page. Also sets the app-wide
// metadata (title/description + social-share cards). No auth/session — the app
// is fully client-side and stores no user data.

import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AppHeader } from "@/components/AppHeader";
import { FeedbackButton } from "@/components/FeedbackButton";
import { ACCENTS, ACCENT_STORAGE_KEY, DEFAULT_ACCENT_ID } from "@/lib/accent";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

// metadataBase makes the file-based opengraph-image / icon resolve to absolute
// URLs (required for social-share cards). The og:image + favicon <link> tags are
// injected automatically from app/opengraph-image.tsx and app/icon.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — DPS-optimised loadouts from your own bank`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "OSRS",
    "Old School RuneScape",
    "DPS calculator",
    "gear loadout",
    "best in slot",
    "boss guide",
    "RuneLite plugin",
    "bossing",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
        <Analytics />
      </body>
    </html>
  );
}
