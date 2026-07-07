import webpush from "web-push";
import { sql } from "@/lib/db";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails("mailto:ahraz.asif@cerve.com", publicKey, privateKey);
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys not configured, skipping notification");
    return;
  }

  const subscriptions = await sql<{ id: number; endpoint: string; p256dh: string; auth: string }[]>`
    select id, endpoint, p256dh, auth from push_subscriptions
  `;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await sql`delete from push_subscriptions where id = ${sub.id}`;
        } else {
          console.error("[push] failed to send notification", error);
        }
      }
    })
  );
}
