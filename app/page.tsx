import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6">
      <div className="relative w-full max-w-md -rotate-1 rounded-[2rem] border bg-card p-10 text-center shadow-2xl">
        <Heart className="absolute -top-4 -left-4 size-8 rotate-[-15deg] fill-primary text-primary opacity-70" />
        <Heart className="absolute -bottom-4 -right-4 size-8 rotate-[15deg] fill-primary text-primary opacity-70" />

        <Heart className="mx-auto mb-4 size-6 fill-primary text-primary" />

        <h1 className="font-heading text-5xl italic text-primary">RAZLIN</h1>

        <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a
          odio.
        </p>

        <Button
          render={<Link href="/chores" />}
          nativeButton={false}
          size="lg"
          className="mt-6 rounded-full px-8"
        >
          Chores ♥
        </Button>
      </div>
    </div>
  );
}
