import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AccountForms from "@/components/admin/settings/AccountForms";

export const metadata = {
  title: "Settings | Off Road Performance",
};

// Open to every admin user — it only ever changes their own account.
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Settings" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">
          Manage the email and password you use to sign in.
        </p>
      </div>

      <AccountForms currentEmail={user?.email} pendingEmail={user?.new_email ?? null} />
    </div>
  );
}
