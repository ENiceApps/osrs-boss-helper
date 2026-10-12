// /about: who made the app, how to reach me (inline feedback form, email,
// GitHub issues), links to the app + plugin source and the Plugin Hub page,
// credits, and the Jagex disclaimer. Server component; only the feedback form
// is client-side.

import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/FeedbackForm";
import { CURRENT_VERSION } from "@/data/updates";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who makes OSRS Boss Helper, how to send feedback or get in touch, and links to the source code and the RuneLite plugin.",
  alternates: { canonical: "/about" },
};

const CONTACT_EMAIL = "eniceapps@gmail.com";
const APP_REPO = "https://github.com/ENiceApps/osrs-boss-helper";
const PLUGIN_REPO = "https://github.com/ENiceApps/boss-helper-bank-sync";
const PLUGIN_HUB = "https://runelite.net/plugin-hub/show/boss-helper-bank-sync";

const LINKS: { href: string; title: string; body: string }[] = [
  {
    href: PLUGIN_HUB,
    title: "Boss Helper Bank Sync on the Plugin Hub",
    body: "The RuneLite plugin that sends your bank to the app. Search “Boss Helper” in RuneLite’s Plugin Hub to install it.",
  },
  {
    href: APP_REPO,
    title: "Web app source code",
    body: "Everything that runs on this site. Bug reports and ideas are welcome as issues.",
  },
  {
    href: PLUGIN_REPO,
    title: "RuneLite plugin source code",
    body: "The plugin’s code, so you can see exactly what it does.",
  },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const link = "text-osrs-gold hover:underline";

export default function AboutPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">About</h1>
      <p className="text-sm text-parchment-dark mt-1">
        Who makes OSRS Boss Helper, and how to reach me.
      </p>

      <section className="osrs-panel rounded-lg p-4 sm:p-6 mt-6" aria-labelledby="hi-heading">
        <h2 id="hi-heading" className="font-display text-lg font-semibold text-osrs-gold">
          Hi, I&apos;m ENice!
        </h2>
        <div className="space-y-2 mt-2 text-sm text-parchment-dark leading-relaxed">
          <p>
            I built OSRS Boss Helper for myself, so I could quickly get the best DPS out of what
            I actually own. After using it for bossing (and Slayer) for a few months, I figured
            other people would find it useful too, so I put it online for everyone.
          </p>
          <p>
            It&apos;s free, there&apos;s no account, and the code is open source. It&apos;s a
            one-person, dad-scaper hobby project, so expect some rough edges. I&apos;m still
            working on it, and I&apos;d love to keep building it with you!
          </p>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="contact-heading">
        <h2
          id="contact-heading"
          className="section-title font-display text-lg font-semibold text-osrs-gold"
        >
          Get in touch
        </h2>
        <div className="osrs-panel rounded-lg p-4 sm:p-6 mt-3">
          <h3 className="font-semibold text-osrs-brown">Send feedback</h3>
          <p className="text-caption text-osrs-muted mt-1 mb-3">
            Found a bug or have an idea? It comes straight to me. For a bug, tell me the boss, your
            setup, and what number looked off (and what you expected). That helps a ton! Leave your
            email if you want a reply.
          </p>
          <FeedbackForm />
        </div>

        <ul className="osrs-panel rounded-lg p-4 sm:p-6 mt-3 space-y-3 text-sm text-parchment-dark">
          <li>
            <span className="font-semibold text-osrs-brown">Email: </span>
            <a href={`mailto:${CONTACT_EMAIL}?subject=OSRS%20Boss%20Helper`} className={link}>
              {CONTACT_EMAIL}
            </a>
          </li>
          <li>
            <span className="font-semibold text-osrs-brown">GitHub: </span>
            <a href={`${APP_REPO}/issues`} className={link} {...ext}>
              open an issue
            </a>{" "}
            if you&apos;d rather track a bug or idea in public. Screenshots are welcome there or by
            email.
          </li>
          <li className="text-caption text-osrs-muted">
            It&apos;s just me, so a reply can take a few days. I read everything though!
          </li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="links-heading">
        <h2
          id="links-heading"
          className="section-title font-display text-lg font-semibold text-osrs-gold"
        >
          Links
        </h2>
        <ul className="mt-3 space-y-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                {...ext}
                className="block osrs-panel rounded-lg p-4 hover:bg-osrs-gold/10 transition-colors"
              >
                <span className="font-semibold text-osrs-gold">{l.title} ↗</span>
                <span className="block text-sm text-parchment-dark mt-1">{l.body}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="credits-heading">
        <h2
          id="credits-heading"
          className="section-title font-display text-lg font-semibold text-osrs-gold"
        >
          Thanks to
        </h2>
        <ul className="osrs-panel rounded-lg p-4 sm:p-6 mt-3 space-y-2 list-disc pl-8 marker:text-osrs-gold/60 text-sm leading-snug text-parchment-dark">
          <li>
            The{" "}
            <a href="https://oldschool.runescape.wiki/" className={link} {...ext}>
              OSRS Wiki
            </a>{" "}
            and its editors. All the boss and item data, plus live GE prices, come from them. Every
            boss page links back to its wiki article. Wiki text is{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
              className={link}
              {...ext}
            >
              CC BY-NC-SA 3.0
            </a>
            . Item and monster images are © Jagex Ltd, via the wiki.
          </li>
          <li>
            The Wiki&apos;s{" "}
            <a href="https://tools.runescape.wiki/osrs-dps/" className={link} {...ext}>
              DPS calculator
            </a>
            , which I check the DPS math against.
          </li>
          <li>
            <a href="https://runelite.net/" className={link} {...ext}>
              RuneLite
            </a>
            , for making plugins like Bank Sync possible.
          </li>
          <li>And you, for using it and sending feedback. You make it better!</li>
        </ul>
      </section>

      <footer className="mt-10 text-caption text-osrs-muted space-y-1.5">
        <p>
          OSRS Boss Helper v{CURRENT_VERSION} ·{" "}
          <Link href="/updates" className={link}>
            What&apos;s new
          </Link>
        </p>
        <p>
          No account needed. The only thing sent to me is what you type in the feedback box (plus which page you were on), and
          Vercel Analytics counts page visits.
        </p>
        <p>
          The web app is MIT licensed and the plugin is BSD-2-Clause. Fan-made, not affiliated
          with or endorsed by Jagex Ltd. Old School RuneScape and RuneScape are trademarks of
          Jagex Ltd.
        </p>
      </footer>
    </div>
  );
}
