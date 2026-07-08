"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConnectionsRules() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="fixed right-6 bottom-6 z-40 size-12 rounded-full shadow-lg"
          />
        }
      >
        <HelpCircle className="size-5" />
        <span className="sr-only">How to play</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to play</DialogTitle>
          <DialogDescription>
            Find the four groups of four words that share something in common.
          </DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li>Tap 4 words you think belong together, then hit Submit.</li>
          <li>Each puzzle has 4 groups, from easiest (yellow) to trickiest (purple).</li>
          <li>You share one pool of 4 mistakes between you both — make them count.</li>
          <li>Nothing&apos;s hidden — every guess either of you makes shows up for both of you.</li>
          <li>A word only belongs to one group, even if it looks like it could fit another.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
