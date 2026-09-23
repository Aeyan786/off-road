import { getAdminModules } from "@/lib/data/adminUsers";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import UserForm from "@/components/admin/users/UserForm";

export const metadata = {
  title: "Create User",
};

export default async function NewAdminUserPage() {
  const modules = await getAdminModules();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Admin Users", href: "/admin/users" }, { label: "New" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Create User</h1>
        <p className="text-sm text-neutral-500">
          Give a team member their own login and choose what they can manage.
        </p>
      </div>

      <UserForm modules={modules} />
    </div>
  );
}
