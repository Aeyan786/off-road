import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminModules, getAdminUser } from "@/lib/data/adminUsers";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ButtonLink from "@/components/ui/button-link";
import UserForm from "@/components/admin/users/UserForm";

export const metadata = {
  title: "Edit User",
};

export default async function EditAdminUserPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [user, modules] = await Promise.all([getAdminUser(id), getAdminModules()]);
  if (!user) notFound();

  const name = user.fullName || user.email;
  // Same rule the actions enforce — shown here instead of a form that
  // would only be refused on save.
  const isProtected = user.isSuperAdmin || user.id === currentUser?.id;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs
          items={[{ label: "Admin Users", href: "/admin/users" }, { label: "Edit" }, { label: name }]}
        />
        <h1 className="text-2xl font-bold text-neutral-900">Edit User</h1>
        <p className="text-sm text-neutral-500">{name}</p>
      </div>

      {isProtected ? (
        <div className="flex flex-col items-start gap-3 rounded-sm border bg-white p-6">
          <p className="flex items-center gap-2 font-medium text-neutral-900">
            <Lock className="size-4" />
            This account is protected
          </p>
          <p className="text-sm text-neutral-500">
            {user.id === currentUser?.id
              ? "You can't edit your own account here. Change your email or password in Settings."
              : "Super admin accounts can't be edited or deleted from the admin portal."}
          </p>
          <ButtonLink href="/admin/users" variant="outline" className="rounded-sm px-3 text-xs cursor-pointer">
            Back to users
          </ButtonLink>
        </div>
      ) : (
        <UserForm user={user} modules={modules} />
      )}
    </div>
  );
}
