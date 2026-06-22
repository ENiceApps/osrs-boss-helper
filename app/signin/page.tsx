import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

// Email magic-link sign-in. Server component: if already signed in, bounce home.
export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="p-6 max-w-md mx-auto pt-16 sm:pt-24">
      <h1 className="font-display text-3xl font-bold text-osrs-gold text-center">Sign in</h1>
      <p className="text-parchment-dark text-center mt-2 mb-6">
        Save your bank and use the helper on any device. We&apos;ll email you a
        one-time sign-in link — no password.
      </p>

      <form
        action={async (formData) => {
          "use server";
          const email = String(formData.get("email") ?? "").trim();
          if (email) await signIn("resend", { email, redirectTo: "/" });
        }}
        className="osrs-panel rounded p-4 flex flex-col gap-3"
      >
        <label className="block">
          <span className="label-eyebrow">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full p-2 bg-osrs-field border border-osrs-brown/40 rounded text-osrs-brown"
          />
        </label>
        <button
          type="submit"
          className="bg-osrs-gold text-background font-semibold rounded px-3 py-2 hover:bg-osrs-gold-light"
        >
          Email me a sign-in link
        </button>
      </form>

      <p className="text-caption text-osrs-muted mt-3 text-center">
        Tip: in local development the link is printed to the dev-server console.
      </p>
    </div>
  );
}
