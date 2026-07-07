"use client";

import { useSyncExternalStore } from "react";

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

  if (isStandalone || !isIOS) return null;

  return (
    <p className="max-w-xs text-center text-xs text-muted-foreground">
      Install this app to get notifications on iOS: tap the share icon{" "}
      <span aria-hidden>⎋</span> then &quot;Add to Home Screen&quot;{" "}
      <span aria-hidden>➕</span>.
    </p>
  );
}
