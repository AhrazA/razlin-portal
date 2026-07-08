import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleCalendarConnect } from "@/components/google-calendar-connect";
import { InstallPrompt } from "@/components/install-prompt";
import { NewsletterCard } from "@/components/newsletter-card";
import { PushNotifications } from "@/components/push-notifications";
import { ASSIGNEES } from "@/lib/constants";
import { connectedPeople } from "@/lib/google-calendar";
import { getLatestNewsletter } from "@/lib/newsletter";

export default async function Home() {
  const [connected, newsletter] = await Promise.all([connectedPeople(), getLatestNewsletter()]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6">
      <div className="relative w-full max-w-md -rotate-1 rounded-[2rem] border bg-card p-10 text-center shadow-2xl">
        <Heart className="absolute -top-4 -left-4 size-8 rotate-[-15deg] fill-primary text-primary opacity-70" />
        <Heart className="absolute -bottom-4 -right-4 size-8 rotate-[15deg] fill-primary text-primary opacity-70" />

        <div className="relative mx-auto mb-4 size-28">
          <Image
            src="/couple.jpg"
            alt="Ahraz and Malin"
            width={112}
            height={112}
            className="size-28 rounded-full border-4 border-background object-cover shadow-lg"
          />
          <Heart className="absolute -right-1 -bottom-1 size-6 fill-primary text-primary drop-shadow" />
        </div>

        <h1 className="font-heading text-5xl italic text-primary">RAZLIN</h1>
        <p className="mt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          A home for the babeses
        </p>

        <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
          Here sits the page for what is arguably the BEST couple that has set foot on this earth.
        </p>
        <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
          A true testament to the power of chance in our lives, we are lucky to have found each other.
        </p>
        <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
          We make each other strong and give each other love, how much better can it get?
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link href="/chores" />}
            nativeButton={false}
            size="lg"
            className="rounded-full px-8"
          >
            Chores ♥
          </Button>
          <Button
            render={<Link href="/love-bomb" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            LOVE BOMB 💣
          </Button>
          <Button
            render={<Link href="/newsletters" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            Newsletters 📰
          </Button>
          <Button
            render={<Link href="/tv-tinder" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            TV Tinder 🍿
          </Button>
          <Button
            render={<Link href="/connections" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            Connections 🧩
          </Button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <NewsletterCard newsletter={newsletter} />
      </div>

      <div className="w-full max-w-md">
        <GoogleCalendarConnect connected={connected} people={ASSIGNEES} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <PushNotifications />
        <InstallPrompt />
      </div>
    </div>
  );
}
