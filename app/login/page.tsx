import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/chores", error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        action={login}
        className="w-full max-w-xs space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-2xl italic text-primary">Hi love ♥</h1>
          <p className="text-sm text-muted-foreground">Enter our passcode to continue</p>
        </div>
        <input type="hidden" name="from" value={from} />
        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode</Label>
          <Input id="passcode" name="passcode" type="password" autoFocus required />
        </div>
        {error && <p className="text-sm text-destructive">Wrong passcode, try again.</p>}
        <Button type="submit" className="w-full">
          Enter
        </Button>
      </form>
    </div>
  );
}
