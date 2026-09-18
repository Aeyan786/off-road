import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBlogs, getPublishedBlogBySlug } from "@/lib/data/blogs";
import { safeQuery } from "@/lib/data/safe";
import { formatBlogDate, readingMinutes, toExcerpt, toParagraphs } from "@/lib/blog-text";
import BlogCard from "@/components/blog/BlogCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const blog = await safeQuery(getPublishedBlogBySlug(supabase, slug), null);

  return {
    title: blog ? `${blog.title} | Off Road Performance` : "Blog | Off Road Performance",
    description: blog ? toExcerpt(blog.content) : undefined,
  };
}

/**
 * Only published blogs resolve — a draft's slug 404s exactly like a slug
 * that never existed, so drafts can't be discovered by guessing URLs.
 */
export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const blog = await safeQuery(getPublishedBlogBySlug(supabase, slug), null);
  if (!blog) notFound();

  const more = (await safeQuery(getBlogs(supabase, { limit: 4 }), []))
    .filter((other) => other.id !== blog.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="cursor-pointer hover:text-brand">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blogs" className="cursor-pointer hover:text-brand">
          Blogs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">{blog.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-500">
            {blog.published_at ? (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                <time dateTime={blog.published_at}>{formatBlogDate(blog.published_at)}</time>
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {readingMinutes(blog.content)} min read
            </span>
          </div>
        </header>

        {blog.image ? (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-sm bg-neutral-100">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-5 text-base leading-relaxed text-neutral-700">
          {toParagraphs(blog.content).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        <Link
          href="/blogs"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to all articles
        </Link>
      </article>

      {more.length > 0 ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">More articles</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((other) => (
              <BlogCard key={other.id} blog={other} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
