import ReactMarkdown from "react-markdown";
import { type StoredNewsletter } from "@/lib/newsletter";

export function NewsletterCard({ newsletter }: { newsletter: StoredNewsletter | null }) {
  if (!newsletter) return null;

  const range = new Date(`${newsletter.weekStart}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const rangeEnd = new Date(`${newsletter.weekEnd}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border bg-card p-6 text-sm text-foreground">
      <div className="mb-3 flex items-center justify-between text-xs tracking-wide text-muted-foreground uppercase">
        <span>The Razlin Times</span>
        <span>
          {range} – {rangeEnd}
        </span>
      </div>
      <div className="newspaper text-sm text-foreground/90">
        <ReactMarkdown>{newsletter.content}</ReactMarkdown>
      </div>
    </div>
  );
}
