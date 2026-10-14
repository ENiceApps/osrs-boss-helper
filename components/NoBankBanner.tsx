"use client";

// Top-of-cockpit nudge shown while no bank is loaded. Without a bank the boss
// page runs in Budget mode, which is a fine way to plan, but the whole point of
// the app is "from your own bank", and the analytics said most visitors never
// get that far: the bank card lives in the setup rail, which lands at the very
// bottom of the page on a phone. So the fastest way in (paste) sits right here,
// above the loadout, with the file option as the power-user upgrade.
//
// Dismissal is remembered for the tab (sessionStorage), not forever: a returning
// visitor who still hasn't loaded a bank should see it again.

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { BudgetMode } from "@/lib/optimize/budget";
import { fmtGp } from "@/lib/format";
import { BankFileButtons, BankPaste } from "@/components/BankConnect";

const DISMISS_KEY = "bh:no-bank-banner-dismissed";

// Dismissal as an external store: sessionStorage plus an in-memory flag for
// browsers that refuse storage (private mode), so the × always works.
let dismissedInMemory = false;
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function readDismissed(): boolean {
  if (dismissedInMemory) return true;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}
function dismissNow() {
  dismissedInMemory = true;
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private mode: the in-memory flag covers this tab */
  }
  listeners.forEach((cb) => cb());
}

interface Props {
  mode: BudgetMode;
  /** Budget-mode spend cap, so the headline can say what the setup was built for. */
  budgetGp: number;
}

export function NoBankBanner({ mode, budgetGp }: Props) {
  // The server snapshot says "dismissed" so the banner never renders in the
  // prerendered HTML: sessionStorage isn't available there, and painting the
  // banner then hiding it would flash for people who already closed it.
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);
  if (dismissed) return null;

  const fromScratch = mode === "budget" || mode === "wildy-risk";

  return (
    <section
      aria-label="Load your bank"
      className="osrs-panel rounded-lg p-4 sm:p-5 mb-4 relative"
    >
      <button
        type="button"
        onClick={dismissNow}
        aria-label="Hide this for now"
        className="absolute top-2 right-2 h-7 w-7 rounded text-osrs-muted hover:text-osrs-gold hover:bg-osrs-gold/10 text-lg leading-none"
      >
        ×
      </button>

      <p className="label-eyebrow text-osrs-muted">No bank loaded</p>
      <h2 className="font-display text-base sm:text-lg font-semibold text-osrs-gold mt-0.5 pr-8">
        {fromScratch
          ? `This is the best setup you could buy for ${fmtGp(budgetGp)}, from scratch.`
          : "Load your bank to see the best setup from what you own."}
      </h2>
      <p className="text-sm text-parchment-dark mt-1 leading-snug">
        Load your bank and every setup gets built from gear you actually own. Fastest way:
        in RuneLite, open the <span className="text-osrs-brown font-semibold">Boss Helper</span>{" "}
        panel, hit <span className="text-osrs-brown font-semibold">Copy my bank</span>, and paste
        it here. Works on any browser, phone included.
      </p>

      <div className="mt-3 text-caption text-osrs-brown leading-snug">
        <BankPaste inline rows={3} />
      </div>

      <div className="mt-3 border-t border-osrs-gold/15 pt-3 text-caption text-osrs-brown leading-snug flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-osrs-muted">Prefer the bank.json file?</span>
        <BankFileButtons secondary />
        <Link href="/bank" className="text-osrs-brown hover:text-osrs-gold hover:underline">
          How does this work?
        </Link>
      </div>
    </section>
  );
}
