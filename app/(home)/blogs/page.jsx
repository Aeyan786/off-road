import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBlogs } from "@/lib/data/blogs";
import { safeQuery } from "@/lib/data/safe";
import BlogCard from "@/components/blog/BlogCard";
import BlogFilters from "@/components/blog/BlogFilters";
import { BlogGridSkeleton } from "@/components/states/Skeletons";

// Blogs are admin-managed and should appear as soon as they're published.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogs",
  description: "News, guides and updates from Off Road Performance.",
};

/** ?q, ?sort, ?from and ?to combine into one query. */
function readFilters(params = {}) {
  const trim = (value) => (typeof value === "string" ? value.trim() : "");
  const date = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(trim(value)) ? trim(value) : undefined);

  return {
    search: trim(params.q) || undefined,
    sort: params.sort === "oldest" ? "oldest" : "newest",
    from: date(params.from),
    to: date(params.to),
  };
}

export default async function BlogsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Blogs</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {"Latest news and updates from Off Road Performance 'ORP'"}
        </p>
      </div>

      <BlogFilters />

      {/* The skeleton is a Suspense fallback rather than a loading.jsx file:
          a route-level boundary would also wrap /blogs/[slug], and a streamed
          response can no longer change its status, so that page's notFound()
          would answer 200 instead of 404. Filter changes are transitions, so
          the current results stay on screen until the new ones arrive. */}
      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogList params={params} />
      </Suspense>
    </div>
  );
}

/** Published blogs only — getBlogs() filters drafts out in the query. */
async function BlogList({ params }) {
  const supabase = await createClient();
  const filters = readFilters(params);

  const blogs = await safeQuery(getBlogs(supabase, filters), null);
  const failed = blogs === null;
  const results = blogs ?? [];
  const filtered = Boolean(filters.search || filters.from || filters.to);

  return (
    <>
      {!failed ? (
        <p className="mb-4 text-sm text-neutral-500">
          {results.length} article{results.length === 1 ? "" : "s"}
          {filtered ? " match your filters" : ""}
        </p>
      ) : null}

      {failed ? (
        <div
          role="alert"
          className="rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn&apos;t load the articles just now. Please refresh the page.
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-neutral-300 py-20 text-center">
          <p className="text-sm font-medium text-neutral-700">
            {filtered ? "No articles match these filters." : "No articles yet."}
          </p>
          <p className="text-xs text-neutral-500">
            {filtered
              ? "Try a different search term or widen the date range."
              : "Check back soon for news and guides."}
          </p>
        </div>
      )}
    </>
  );
}
