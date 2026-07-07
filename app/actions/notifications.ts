"use server";

import { sql } from "@/lib/db";
import { sendPushToAll } from "@/lib/push";

type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(sub: PushSubscriptionInput) {
  await sql`
    insert into push_subscriptions (endpoint, p256dh, auth)
    values (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth})
    on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth
  `;
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  await sql`delete from push_subscriptions where endpoint = ${endpoint}`;
  return { success: true };
}

export async function sendTestNotification() {
  await sendPushToAll({
    title: "Razlin",
    body: "Test notification — if you can see this, it works! 🎉",
    url: "/",
  });
  return { success: true };
}
