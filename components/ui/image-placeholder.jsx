import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Neutral stand-in for decorative photography we don't have real assets
 * for yet (hero panels, blog thumbnails, footer gallery). Keeps section
 * spacing/aspect ratios accurate without hot-linking external images.
 */
export default function ImagePlaceholder({ className, iconClassName }) {
  return (
    <div
      className={cn(
        "flex relative items-center justify-center bg-neutral-200",
        className
      )}
    >
     {/* <Image fill src="/blog-1.webp" alt="hero"/> */} <ImageIcon/>
    </div>
  );
}
