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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center gap-3 sm:gap-5">
        <Link
          href="/"
          className="font-display text-osrs-gold font-bold text-base sm:text-lg tracking-wide whitespace-nowrap"
        >
          OSRS Boss Helper
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 text-sm">
          {/* /boss/[slug] detail pages also belong to the "Bosses" section. */}
          <NavLink href="/bosses" active={pathname.startsWith("/boss")}>
            Bosses
          </NavLink>
          <NavLink href="/items" active={pathname.startsWith("/items")}>
            Items
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
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
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
      <span className="inline-flex items-center gap-2 text-caption text-foreground">
        <span
          aria-hidden
          className={`w-2 h-2 rounded-full bg-status-${dot}`}
          style={{ boxShadow: `0 0 5px var(--color-status-${dot})` }}
        />
        <span className="font-semibold">{live.playerName ?? "Loaded"}</span>
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
      title="Connect the bank file the Boss Helper Bank Sync plugin writes, or use Budget mode to plan without one."
    >
      <span aria-hidden className="w-2 h-2 rounded-full bg-osrs-muted" />
      No bank connected
    </span>
  );
}
