import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoveBombPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6 text-center">
      <div className="absolute right-4 top-4">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          Home
        </Button>
      </div>
      <span className="text-5xl">💣🚧</span>
      <h1 className="font-heading text-4xl italic text-primary">Coming soon</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        The LOVE BOMB is still under construction. Check back soon.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2 rounded-full px-8">
        Back home
      </Button>
    </div>
  );
}
