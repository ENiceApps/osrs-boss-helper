"use client";

// Top-of-page "what's loaded right now" card for /bank. Once a bank is loaded
// (or a saved file needs re-granting) it's the same BankConnect card the boss
// page shows, so status, refresh and Disconnect live in one place.

import { BankConnect } from "@/components/BankConnect";
import { useLocalBank } from "@/lib/localBank";

export function BankStatus() {
  const s = useLocalBank();
  if ((s.connected && s.bank) || s.needsPermission) return <BankConnect />;
  return (
    <div className="osrs-panel p-3 rounded text-caption text-osrs-brown leading-snug flex items-center gap-2">
      <span aria-hidden className="w-2 h-2 rounded-full bg-osrs-muted flex-none" />
      No bank loaded yet. The steps below take about two minutes!
    </div>
  );
}
