import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import { toExcerpt } from "@/lib/blog-text";

const dayFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit" });
const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short" });

/**
 * Blog card in the Recent Updates design (image with a date badge, title,
 * excerpt). Used by the /blogs listing and the home page carousel.
 *
 * @param {object} blog a published blog row
 */
export default function BlogCard({ blog, className }) {
  const href = `/blogs/${blog.slug}`;
  const date = blog.published_at ? new Date(blog.published_at) : null;

  return (
    <article className={`group flex flex-col ${className ?? ""}`}>
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-neutral-200"
        tabIndex={-1}
        aria-hidden="true"
      >
        {blog.image ? (
          <Image
            src={blog.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
        {date ? (
          <span className="absolute right-3 top-3 rounded-md bg-black/80 px-2.5 py-1.5 text-center text-xs font-semibold leading-tight text-white">
            {dayFormatter.format(date)}
            <br />
            {monthFormatter.format(date)}
          </span>
        ) : null}
      </Link>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <h3 className="font-semibold text-neutral-900">
          <Link href={href} className="transition-colors hover:text-brand">
            {blog.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-neutral-500">{toExcerpt(blog.content)}</p>
        <Link
          href={href}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-sm font-semibold text-brand hover:underline"
          aria-label={`Read article: ${blog.title}`}
        >
          Read article
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
