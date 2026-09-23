import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBlogById } from "@/lib/data/blogs";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import BlogForm from "@/components/admin/blogs/BlogForm";

export const metadata = {
  title: "Edit Blog",
};

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const blog = await getBlogById(supabase, id);
  if (!blog) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Blogs", href: "/admin/blogs" },
            { label: "Edit" },
            { label: blog.title },
          ]}
        />
        <h1 className="text-2xl font-bold text-neutral-900">Edit Blog</h1>
        <p className="text-sm text-neutral-500">{blog.title}</p>
      </div>

      <BlogForm blog={blog} />
    </div>
  );
}
