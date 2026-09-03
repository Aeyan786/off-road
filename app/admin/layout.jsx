import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

// Route protection for everything under /admin is enforced server-side in
// proxy.js (redirects unauthenticated requests to /login before this layout
// ever renders). This layout only reads the session to display the signed
// in user's email.
export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 shrink-0 border-r md:flex">
        <Sidebar className="w-64" />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader userEmail={user?.email} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
