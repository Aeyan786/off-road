import { createClient } from "@/lib/supabase/server";
import { getBlogs } from "@/lib/data/blogs";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import BlogsDataTable from "@/components/admin/blogs/BlogsDataTable";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";

export const metadata = {
  title: "Manage Blogs",
};

export default async function ManageBlogsPage() {
  const supabase = await createClient();

  let blogs = [];
  let setupError = null;
  try {
    blogs = await getBlogs(supabase, { includeDrafts: true });
  } catch (err) {
    setupError = err.message;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Blogs" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Manage Blogs</h1>
        <p className="text-sm text-neutral-500">
          Write, publish, and manage blog articles.
        </p>
      </div>

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0006_blogs.sql" />
      ) : null}

      <BlogsDataTable blogs={blogs} />
    </div>
  );
}
