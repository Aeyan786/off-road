import { createClient } from "@/lib/supabase/server";
import { getBlogs } from "@/lib/data/blogs";
import { safeQuery } from "@/lib/data/safe";
import BlogCard from "@/components/blog/BlogCard";

// Blogs are admin-managed and should appear as soon as they're published.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogs",
  description: "News, guides and updates from Off Road Performance.",
};

/** Published blogs only — getBlogs() filters drafts out in the query. */
export default async function BlogsPage() {
  const supabase = await createClient();
  const blogs = await safeQuery(getBlogs(supabase), []);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Blogs</h1>
        <p className="mt-2 text-sm text-neutral-500">
          News, guides, and updates from the workshop.
        </p>
      </div>

      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-neutral-300 py-20 text-center">
          <p className="text-sm font-medium text-neutral-700">No articles yet.</p>
          <p className="text-xs text-neutral-500">Check back soon for news and guides.</p>
        </div>
      )}
    </div>
  );
}
