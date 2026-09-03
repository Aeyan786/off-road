import { ArrowLeft, ArrowRight, CircleUserRound } from "lucide-react";
import ImagePlaceholder from "@/components/ui/image-placeholder";

const POSTS = [
  {
    id: 1,
    date: "12 Aug",
    author: "Ali Raza",
    title: "Why Care Spare Parts Are More Important",
    excerpt:
      "Aeas congue, sapien sed mollis accumsan, justo orci pulvinar nisl, ut fermentum ante velit in ante. Vivamus blandit urna urna,......",
  },
  {
    id: 2,
    date: "12 Aug",
    author: "Ali Raza",
    title: "Why Care Spare Parts Are More Important",
    excerpt:
      "Aeas congue, sapien sed mollis accumsan, justo orci pulvinar nisl, ut fermentum ante velit in ante. Vivamus blandit urna urna,......",
  },
  {
    id: 3,
    date: "12 Aug",
    author: "Ali Raza",
    title: "Why Care Spare Parts Are More Important",
    excerpt:
      "Aeas congue, sapien sed mollis accumsan, justo orci pulvinar nisl, ut fermentum ante velit in ante. Vivamus blandit urna urna,......",
  },
];

export default function RecentUpdates() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Recent Updations
          </h2>
          <p className="mt-3 max-w-xl text-sm text-neutral-500">
            Dictum at tempor commodo ullamcorper a. Fringilla phasellus
            faucibus scelerisque eleifend. Magnis dis parturient montes.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous"
            className="flex size-9 items-center justify-center rounded-md bg-brand text-white hover:bg-brand/90"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="flex size-9 items-center justify-center rounded-md bg-brand text-white hover:bg-brand/90"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <article key={post.id}>
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
              <ImagePlaceholder className="h-full w-full" />
              <span className="absolute right-3 top-3 rounded-md bg-black/80 px-2.5 py-1.5 text-center text-xs font-semibold leading-tight text-white">
                {post.date.split(" ")[0]}
                <br />
                {post.date.split(" ")[1]}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <CircleUserRound className="size-3.5" />
                {post.author}
              </div>
              <h3 className="font-semibold text-neutral-900">{post.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
