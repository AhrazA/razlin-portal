"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const noopSubscribe = () => () => {};
const getFalseSnapshot = () => false;

function getIsIOSSnapshot() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function getIsStandaloneSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallPrompt() {
  const isIOS = useSyncExternalStore(noopSubscribe, getIsIOSSnapshot, getFalseSnapshot);
  const isStandalone = useSyncExternalStore(noopSubscribe, getIsStandaloneSnapshot, getFalseSnapshot);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handler(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) return null;

  if (deferredPrompt) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setDeferredPrompt(null);
        }}
      >
        Install app
      </Button>
    );
  }

  if (!isIOS) return null;

  return (
    <p className="max-w-xs text-center text-xs text-muted-foreground">
      Install this app to get notifications on iOS: tap the share icon{" "}
      <span aria-hidden>⎋</span> then &quot;Add to Home Screen&quot;{" "}
      <span aria-hidden>➕</span>.
    </p>
  );
}
