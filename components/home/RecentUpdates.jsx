"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";

/**
 * Latest published blogs as a carousel. The row is a native scroll-snap
 * container (so it swipes on touch devices); the arrows scroll it by one
 * card and disable themselves at either end.
 *
 * @param {object[]} blogs latest published blogs, newest first
 */
export default function RecentUpdates({ blogs = [] }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Where the arrows are heading. Rapid clicks step from here rather than
  // from the mid-animation scroll position, so each click moves one card.
  // Cleared once scrolling settles, so swipes stay in sync.
  const targetRef = useRef(null);
  const settleTimer = useRef(null);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => {
      window.removeEventListener("resize", updateArrows);
      clearTimeout(settleTimer.current);
    };
  }, [updateArrows, blogs.length]);

  function handleScroll() {
    updateArrows();
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      targetRef.current = null;
    }, 150);
  }

  function scrollByCard(direction) {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const max = track.scrollWidth - track.clientWidth;

    const from = targetRef.current ?? track.scrollLeft;
    const next = Math.min(max, Math.max(0, Math.round(from / step) * step + direction * step));
    targetRef.current = next;
    track.scrollTo({ left: next, behavior: "smooth" });
  }

  const arrowClass =
    "flex size-9 cursor-pointer items-center justify-center rounded-md bg-brand text-white transition-opacity hover:bg-brand/90 disabled:cursor-default disabled:opacity-40";

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Recent Updations
          </h2>
          <p className="mt-3 max-w-xl text-sm text-neutral-500">
            Stay updated with the latest news, improvements, features, and important changes.
          </p>
        </div>
        {blogs.length > 0 ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              className={arrowClass}
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              className={arrowClass}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {blogs.length > 0 ? (
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              className="w-full shrink-0 snap-start sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-400">
          New articles will appear here once they&apos;re published.
        </div>
      )}
    </section>
  );
}
