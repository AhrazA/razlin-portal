import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlayerIdentity } from "@/components/player-identity";
import { PLAYER_COOKIE } from "@/lib/constants";

export default async function PlayerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from = "/" } = await searchParams;
  const cookieStore = await cookies();

  // /login/player is excluded from the proxy's passcode check (it lives under /login),
  // so re-check the passcode here to keep this page from being reachable unauthenticated.
  if (cookieStore.get("passcode")?.value !== process.env.APP_PASSCODE) {
    redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  if (cookieStore.get(PLAYER_COOKIE)?.value) {
    redirect(from);
  }

  return (
    <PlayerIdentity
      emoji="💌"
      heading="Who's this?"
      description="This just remembers you on this device, so the site knows who's who."
      returnTo={from}
    />
  );
}
