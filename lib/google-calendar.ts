import { sql } from "@/lib/db";
import { ASSIGNEES } from "@/lib/constants";
import { toDateKey } from "@/lib/calendar";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const SYNC_PAST_DAYS = 7;
const SYNC_FUTURE_DAYS = 28;

export function googleAuthUrl(person: string, redirectUri: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", person);
  return url.toString();
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

async function getValidAccessToken(person: string): Promise<
  { accessToken: string; calendarId: string } | null
> {
  const [account] = await sql<
    { access_token: string; refresh_token: string; expiry: string; calendar_id: string }[]
  >`select access_token, refresh_token, expiry, calendar_id from google_accounts where person = ${person}`;
  if (!account) return null;

  if (new Date(account.expiry).getTime() > Date.now() + 60_000) {
    return { accessToken: account.access_token, calendarId: account.calendar_id };
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await sql`update google_accounts set access_token = ${data.access_token}, expiry = ${expiry} where person = ${person}`;
  return { accessToken: data.access_token, calendarId: account.calendar_id };
}

export type GoogleEvent = {
  id: string;
  title: string;
  date: string;
  person: string;
};

async function fetchPersonEventsFromApi(
  person: string,
  startKey: string,
  endKey: string
): Promise<GoogleEvent[]> {
  const token = await getValidAccessToken(person);
  if (!token) return [];

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(token.calendarId)}/events`
  );
  url.searchParams.set("timeMin", `${startKey}T00:00:00Z`);
  url.searchParams.set("timeMax", `${endKey}T23:59:59Z`);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token.accessToken}` },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map(
    (event: { id: string; summary?: string; start?: { date?: string; dateTime?: string } }) => ({
      id: event.id,
      title: event.summary ?? "(untitled)",
      date: (event.start?.date ?? event.start?.dateTime ?? "").slice(0, 10),
      person,
    })
  );
}

export async function syncCalendarEvents(
  people: readonly string[] = ASSIGNEES
): Promise<{ person: string; count: number }[]> {
  const today = new Date();
  const startKey = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - SYNC_PAST_DAYS)
  );
  const endKey = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + SYNC_FUTURE_DAYS)
  );

  const results = [];
  for (const person of people) {
    const events = await fetchPersonEventsFromApi(person, startKey, endKey);

    await sql`
      delete from calendar_events
      where person = ${person} and date >= ${startKey} and date <= ${endKey}
    `;
    for (const event of events) {
      await sql`
        insert into calendar_events (google_event_id, person, title, date)
        values (${event.id}, ${person}, ${event.title}, ${event.date})
        on conflict (person, google_event_id) do update set
          title = excluded.title,
          date = excluded.date,
          synced_at = now()
      `;
    }
    results.push({ person, count: events.length });
  }
  return results;
}

export async function getStoredEventsForRange(startKey: string, endKey: string): Promise<GoogleEvent[]> {
  const rows = await sql<{ google_event_id: string; title: string; date: string; person: string }[]>`
    select google_event_id, title, date::text as date, person
    from calendar_events
    where date >= ${startKey} and date <= ${endKey}
    order by date asc
  `;
  return rows.map((row) => ({ id: row.google_event_id, title: row.title, date: row.date, person: row.person }));
}

export async function connectedPeople(): Promise<string[]> {
  const rows = await sql<{ person: string }[]>`select person from google_accounts`;
  return rows.map((r) => r.person);
}
