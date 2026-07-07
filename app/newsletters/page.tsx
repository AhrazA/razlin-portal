import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewsletterCard } from "@/components/newsletter-card";
import { getNewsletterHistory } from "@/lib/newsletter";

export default async function NewslettersPage() {
  const newsletters = await getNewsletterHistory();

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl italic text-primary">The Archive</h1>
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          Home
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          No back issues yet — check in after the next Monday run.
        </p>
      ) : (
        <div className="space-y-6">
          {newsletters.map((newsletter) => (
            <NewsletterCard key={newsletter.id} newsletter={newsletter} />
          ))}
        </div>
      )}
    </div>
  );
}
