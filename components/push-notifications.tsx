"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeUser, unsubscribeUser } from "@/app/actions/notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

const noopSubscribe = () => () => {};
const getSupportedFalseSnapshot = () => false;

function getSupportedSnapshot() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function PushNotifications() {
  const supported = useSyncExternalStore(noopSubscribe, getSupportedSnapshot, getSupportedFalseSnapshot);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!supported) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.pushManager.getSubscription())
      .then(setSubscription);
  }, [supported]);

  async function subscribeToPush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    setPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      await subscribeUser({
        endpoint: json.endpoint as string,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setSubscription(sub);
    } finally {
      setPending(false);
    }
  }

  async function unsubscribeFromPush() {
    if (!subscription) return;
    setPending(true);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await unsubscribeUser(endpoint);
      setSubscription(null);
    } finally {
      setPending(false);
    }
  }

  if (!supported) return null;

  return subscription ? (
    <Button variant="ghost" size="sm" onClick={unsubscribeFromPush} disabled={pending}>
      <Bell className="size-4" /> Notifications on
    </Button>
  ) : (
    <Button variant="outline" size="sm" onClick={subscribeToPush} disabled={pending}>
      <BellOff className="size-4" /> Enable notifications
    </Button>
  );
}
