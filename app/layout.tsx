import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { FeedbackButton } from "@/components/FeedbackButton";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <FeedbackButton />
        </SessionProvider>
      </body>
    </html>
  );
}
