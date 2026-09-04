import Link from "next/link";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function HeroPanel({ eyebrow, title, src, description, cta = true, className }) {


  return (
    <div
      className={`relative flex min-h-[340px] flex-col justify-end overflow-hidden bg-neutral-900 p-8 text-white ${className ?? ""}`}
    >
      <Image src={src} fill alt="hero" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent" />
      <div className="relative max-w-md space-y-3">
        <p className="text-sm text-white/80">{eyebrow}</p>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-white/75">{description}</p>
        {cta ? (
          <Button className="mt-2">
            <Link href="/">Shop Now</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function HeroTile({ title,src }) {
  return (
    <div className="relative flex min-h-[220px] flex-1 items-end overflow-hidden bg-neutral-900 p-6 text-white">
      <Image src={src} fill alt="hero" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/80 to-transparent" />
      <h3 className="relative text-xl font-bold leading-snug">{title}</h3>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12">
      <HeroPanel
        className="lg:col-span-4"
        eyebrow="Services"
        title="High quality service at an affordable price"
        src="/hero3.webp"
        description="Nam vitae tortor ac justo congue venenatis. Donec ut tortor tellus. Cras quis urna scelerisque felis laoreet tristique."
      />
      <HeroPanel
        className="lg:col-span-5"
        eyebrow="Auto Parts Supplier"
        title="We provide quality auto parts"
        src="/hero.webp"
        description="Faucibus in ornare quam viverra orci. Justo nec ultrices dui sapien eget. Porttitor rhoncus dolor purus non enim praesent elementum."
      />
      <div className="flex flex-col gap-0 lg:col-span-3">
        <HeroTile title="All Model Car Parts" src="/hero1.webp"/>
        <HeroTile title="Expensive model car tools" src="/hero2.webp"/>
      </div>
    </section>
  );
}
