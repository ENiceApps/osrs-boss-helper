"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveBank, formatAgo } from "@/lib/liveBank";
import { AccentPicker } from "@/components/AccentPicker";

/**
 * App-wide sticky header. The local bank is global state (one connected file
 * read across the whole app), so its status lives here rather than per boss
 * page. Mounting useLiveBank here AND on the boss page is fine — both read the
 * same in-memory local-bank store.
 */
export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-osrs-gold/40 bg-[#201507]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center gap-2 sm:gap-5">
        <Link
          href="/"
          aria-label="OSRS Boss Helper home"
          className="flex-none font-display text-osrs-gold font-bold text-base sm:text-lg tracking-wide whitespace-nowrap"
        >
          {/* Phones get the icon: the full name plus four nav links and the
              accent swatches don't fit in 375px. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" width={28} height={28} className="sm:hidden rounded" />
          <span className="hidden sm:inline">OSRS Boss Helper</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-[13px] sm:text-sm">
          {/* /boss/[slug] detail pages also belong to the "Bosses" section. */}
          <NavLink href="/bosses" active={pathname.startsWith("/boss")}>
            Bosses
          </NavLink>
          <NavLink href="/items" active={pathname.startsWith("/items")}>
            Items
          </NavLink>
          <NavLink href="/updates" active={pathname.startsWith("/updates")}>
            Updates
          </NavLink>
          {/* Phones get an info icon: a fourth word pushes the accent swatches
              off a 375px screen. */}
          <NavLink href="/about" active={pathname.startsWith("/about")} label="About">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              width={18}
              height={18}
              fill="currentColor"
              className="sm:hidden block"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-2 2.5a1 1 0 0 1 2 0V14a1 1 0 1 1-2 0V9.5Z"
              />
            </svg>
            <span className="hidden sm:inline">About</span>
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <ConnectionStatus />
          <AccentPicker />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  /** Accessible name, for links whose visible content is an icon on phones. */
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "text-osrs-gold font-semibold"
          : "text-parchment-dark hover:text-osrs-gold transition-colors"
      }
    >
      {children}
    </Link>
  );
}

function ConnectionStatus() {
  const live = useLiveBank();
  if (live.isLive) {
    // Gold dot for a bank restored from the browser cache: the data is real but
    // no file is being watched, so it isn't the same "live" as a green dot.
    const dot = live.fromCache ? "affordable" : "owned";
    return (
      <span
        className="inline-flex items-center gap-2 text-caption text-foreground"
        title={live.playerName ?? undefined}
      >
        <span
          aria-hidden
          className={`w-2 h-2 rounded-full bg-status-${dot}`}
          style={{ boxShadow: `0 0 5px var(--color-status-${dot})` }}
        />
        {/* Name hidden on phones: a long RSN pushes the accent swatches off
            screen. The dot still shows a bank is loaded. */}
        <span className="font-semibold hidden sm:inline">{live.playerName ?? "Loaded"}</span>
        <span className="text-parchment-dark hidden sm:inline">
          {live.bank?.itemIds.size ?? 0} items ·{" "}
          {live.fromCache
            ? "from your last visit"
            : // formatAgo, not raw seconds: a cached or long-idle bank turned
              // "updated 259205s ago" into arithmetic homework.
              `updated ${formatAgo(live.receivedAt) ?? "just now"}`}
        </span>
      </span>
    );
  }
  return (
    <span
      className="hidden sm:inline-flex items-center gap-2 text-caption text-parchment-dark"
      title="Connect your bank from the Boss Helper Bank Sync plugin, or use Budget mode to plan without one."
    >
      <span aria-hidden className="w-2 h-2 rounded-full bg-osrs-muted" />
      No bank connected
    </span>
  );
}
