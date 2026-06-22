import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPluginToken } from "@/lib/db";
import { PluginTokenManager } from "@/components/PluginTokenManager";

// Account settings. Server component — gated behind login; mints the plugin
// token via the client manager below.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const exists = await hasPluginToken(session.user.id);

  return (
    <div className="p-6 max-w-2xl mx-auto pt-12">
      <h1 className="font-display text-3xl font-bold text-osrs-gold">Settings</h1>
      <p className="text-parchment-dark mt-1 mb-6">Signed in as {session.user.email}.</p>

      <section className="osrs-panel rounded p-4">
        <h2 className="section-title font-semibold text-osrs-brown mb-1">RuneLite plugin token</h2>
        <p className="text-caption text-osrs-muted mb-3">
          This token lets the osrs-boss-sync plugin save your bank to your account. Keep it secret —
          anyone with it can write banks to your account.
        </p>
        <PluginTokenManager initiallyExists={exists} />
      </section>
    </div>
  );
}
