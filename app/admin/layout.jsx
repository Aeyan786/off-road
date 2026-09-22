import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import AdminShell, { SIDEBAR_COOKIE } from "@/components/admin/AdminShell";
import { getAdminAccess } from "@/lib/server/adminAccess";

// Route protection for everything under /admin is enforced server-side in
// proxy.js (redirects unauthenticated requests to /login before this layout
// ever renders). This layout only reads the session to display the signed
// in user's email and permissions (for the sidebar), plus the sidebar's
// remembered collapsed state.
export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.js has already refused users without access; this only decides
  // which sidebar items to show.
  const access = user ? await getAdminAccess(user.id).catch(() => null) : null;

  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <AdminShell userEmail={user?.email} access={access} defaultCollapsed={collapsed}>
      {children}
    </AdminShell>
  );
}
