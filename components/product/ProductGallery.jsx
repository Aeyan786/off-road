"use client";

import { useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import { cn } from "@/lib/utils";

/**
 * Product image viewer: one large image with thumbnails when the product
 * has more than one. Falls back to the shared placeholder when it has none.
 */
export default function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-square w-full rounded-sm" />;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border bg-white">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-square cursor-pointer overflow-hidden rounded-sm border bg-white transition-colors",
                index === active ? "border-brand ring-1 ring-brand" : "hover:border-neutral-400"
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
