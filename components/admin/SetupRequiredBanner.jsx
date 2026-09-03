import { DatabaseZap } from "lucide-react";

export default function SetupRequiredBanner({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <DatabaseZap className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-medium">Database not set up yet</p>
        <p className="mt-1 text-amber-700">
          Run <code className="rounded bg-amber-100 px-1 py-0.5">supabase/migrations/0001_init.sql</code>{" "}
          in your Supabase project&apos;s SQL Editor, then refresh this page.
        </p>
        {message ? <p className="mt-1 text-xs text-amber-600">{message}</p> : null}
      </div>
    </div>
  );
}
