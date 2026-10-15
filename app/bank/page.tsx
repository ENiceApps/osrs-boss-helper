// /bank: everything about getting your bank into the app. Shows what's loaded
// now, then the way in: the Boss Helper Bank Sync plugin, "Copy my bank" paste
// first (it works everywhere, phones included) and its bank.json file second
// (live updates on Chromium). A Bank Memory export still parses if someone
// pastes one (lib/localBank.ts), but it isn't advertised: the plugin does the
// same job and brings levels too. Server component; the status card, file
// buttons and paste box are client-side.

import type { Metadata } from "next";
import Link from "next/link";
import { BankFileButtons, BankPaste, FILE_PATH } from "@/components/BankConnect";
import { BankStatus } from "./BankStatus";

export const metadata: Metadata = {
  title: "Your bank",
  description:
    "Load your OSRS bank into Boss Helper with the Boss Helper Bank Sync RuneLite plugin, so every setup is built from gear you own.",
  alternates: { canonical: "/bank" },
};

const PLUGIN_HUB = "https://runelite.net/plugin-hub/show/boss-helper-bank-sync";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const link = "text-osrs-gold hover:underline";
const em = "text-osrs-brown font-semibold";

const SYNC_STEPS = [
  <>
    In RuneLite, open the <span className={em}>Plugin Hub</span> and install{" "}
    <a href={PLUGIN_HUB} className={link} {...ext}>
      Boss Helper Bank Sync
    </a>
    .
  </>,
  <>Log in-game and open your bank once so the plugin can read it (plus your levels).</>,
  <>
    Open the <span className={em}>Boss Helper</span> panel in the RuneLite sidebar, hit{" "}
    <span className={em}>Copy my bank</span> and paste it below. Works on any browser,
    phone included.
  </>,
  <>
    Want it to stay up to date on its own? The plugin also writes a{" "}
    <code className="text-osrs-brown">bank.json</code> file. On Chrome, Edge or Brave hit{" "}
    <span className={em}>Connect bank file</span> and pick it; it refreshes every time you
    bank. Other browsers can <span className={em}>upload</span> it after banking.
  </>,
];

export default function BankPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">Your bank</h1>
      <p className="text-sm text-parchment-dark mt-1">
        Load your bank and every setup gets built from gear you actually own!
      </p>

      <section className="mt-6" aria-label="Loaded bank">
        <BankStatus />
      </section>

      <Method
        id="sync"
        title="Boss Helper Bank Sync plugin"
        blurb="My own plugin. It brings your levels too, and can keep itself up to date."
        steps={SYNC_STEPS}
      >
        <div className="text-caption text-osrs-brown leading-snug space-y-3">
          <BankPaste inline />
          <div className="border-t border-osrs-gold/15 pt-3 space-y-1">
            <p className="text-osrs-muted">Or connect the file for live updates:</p>
            <BankFileButtons />
            <p className="text-osrs-muted">
              Where to find it: <code>{FILE_PATH}</code>
              <br />
              On Windows that&apos;s <code>C:\Users\&lt;you&gt;\.runelite\osrs-boss-helper</code>.
            </p>
          </div>
        </div>
      </Method>

      <section className="mt-10" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="section-title font-display text-lg font-semibold text-osrs-gold"
        >
          Good to know
        </h2>
        <ul className="osrs-panel rounded-lg p-4 sm:p-6 mt-3 space-y-2 list-disc pl-8 marker:text-osrs-gold/60 text-sm leading-snug text-parchment-dark">
          <li>
            Your bank only updates when you open it in-game. If something you just got is
            missing, open your bank and try again.
          </li>
          <li>
            The app remembers your bank for next time. Hit{" "}
            <span className={em}>Disconnect</span> up top to clear it.
          </li>
          <li>
            No RuneLite? Pick any boss and use <span className={em}>Budget mode</span> to plan
            for however much GP you have.
          </li>
        </ul>
      </section>

      <p className="text-center mt-10">
        <Link href="/bosses" className={link}>
          Pick a boss →
        </Link>
      </p>
    </div>
  );
}

function Method({
  id,
  title,
  badge,
  blurb,
  steps,
  children,
}: {
  id: string;
  title: string;
  badge?: string;
  blurb: string;
  steps: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10" aria-labelledby={`${id}-heading`}>
      <h2
        id={`${id}-heading`}
        className="section-title font-display text-lg font-semibold text-osrs-gold flex items-center gap-2"
      >
        {title}
        {badge && (
          <span className="label-eyebrow rounded bg-osrs-gold/15 px-1.5 py-0.5 text-osrs-gold">
            {badge}
          </span>
        )}
      </h2>
      <div className="osrs-panel rounded-lg p-4 sm:p-6 mt-3">
        <p className="text-caption text-osrs-muted">{blurb}</p>
        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="flex-none w-6 h-6 rounded-full bg-osrs-gold text-background font-bold text-xs flex items-center justify-center mt-0.5"
              >
                {i + 1}
              </span>
              <p className="text-sm text-parchment-dark leading-snug">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 border-t border-osrs-gold/15 pt-4">{children}</div>
      </div>
    </section>
  );
}
