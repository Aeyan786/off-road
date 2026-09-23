import { ShieldCheck, UserCog, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminModules, listAdminUsers } from "@/lib/data/adminUsers";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import UsersDataTable from "@/components/admin/users/UsersDataTable";

export const metadata = {
  title: "Admin Users",
};

// Super admins only — enforced by proxy.js (lib/admin-modules.js).
export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let users = [];
  let modules = [];
  let setupError = null;
  try {
    [users, modules] = await Promise.all([listAdminUsers(), getAdminModules()]);
  } catch (err) {
    setupError = err.message;
  }

  const superAdmins = users.filter((u) => u.isSuperAdmin).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Admin Users" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Admin Users</h1>
        <p className="text-sm text-neutral-500">
          Create staff logins and choose which parts of the admin they can use.
        </p>
      </div>

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0007_suppliers_admin_users.sql" />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Admin Users" value={users.length} hint="Everyone with portal access" icon={Users} />
        <StatCard title="Super Admins" value={superAdmins} hint="Full access · protected" icon={ShieldCheck} />
        <StatCard title="Staff" value={users.length - superAdmins} hint="Access limited to assigned modules" icon={UserCog} />
      </div>

      <UsersDataTable users={users} modules={modules} currentUserId={user?.id} />
    </div>
  );
}
