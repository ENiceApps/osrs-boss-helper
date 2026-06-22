"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLiveBank, secondsSince } from "@/lib/liveBank";

/**
 * App-wide sticky header. The plugin sync is global state (one player synced
 * across the whole app), so its status lives here rather than per boss page.
 * Mounting useLiveBank here AND on the boss page is fine — SWR dedupes the
 * shared "/api/bank" key into a single poll.
 */
export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-osrs-gold/40 bg-[#201507]">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-5">
        <Link
          href="/"
          className="font-display text-osrs-gold font-bold text-lg tracking-wide whitespace-nowrap"
        >
          OSRS Boss Helper
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {/* /boss/[slug] detail pages also belong to the "Bosses" section. */}
          <NavLink href="/bosses" active={pathname.startsWith("/boss")}>
            Bosses
          </NavLink>
          <NavLink href="/items" active={pathname.startsWith("/items")}>
            Items
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <ConnectionStatus />
          <AuthControl />
        </div>
      </div>
    </header>
  );
}

function AuthControl() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (session?.user) {
    return (
      <span className="inline-flex items-center gap-2 text-caption">
        <span className="text-parchment-dark hidden sm:inline">{session.user.email}</span>
        <Link href="/settings" className="text-osrs-gold hover:underline font-semibold">
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut({ redirectTo: "/" })}
          className="text-osrs-gold hover:underline font-semibold"
        >
          Sign out
        </button>
      </span>
    );
  }
  return (
    <Link href="/signin" className="text-caption text-osrs-gold hover:underline font-semibold">
      Sign in
    </Link>
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
    return (
      <span className="inline-flex items-center gap-2 text-caption text-foreground">
        <span
          aria-hidden
          className="w-2 h-2 rounded-full bg-status-owned"
          style={{ boxShadow: "0 0 5px var(--color-status-owned)" }}
        />
        <span className="font-semibold">{live.playerName ?? "Live"}</span>
        <span className="text-parchment-dark hidden sm:inline">
          {live.bank?.itemIds.size ?? 0} items · synced{" "}
          {secondsSince(live.receivedAt) ?? 0}s ago
        </span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-2 text-caption text-parchment-dark"
      title={
        live.authed
          ? "Signed in, but no bank synced yet. Open your bank in-game with the osrs-boss-sync plugin."
          : "Sign in and run the osrs-boss-sync plugin to sync your bank, or use Budget mode to plan without one."
      }
    >
      <span aria-hidden className="w-2 h-2 rounded-full bg-osrs-muted" />
      {live.authed ? "No bank synced" : "Not signed in"}
    </span>
  );
}
