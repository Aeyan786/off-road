import Link from "next/link";
import Image from "next/image";
import ButtonLink from "@/components/ui/button-link";

/**
 * Hero panel. The whole panel links to its destination via an overlay link,
 * with the call to action layered above it — that way a panel can keep its
 * own link while its button points somewhere else (the left panel's Support
 * button), without nesting one link inside another.
 */
function HeroPanel({ eyebrow, title, src, description, href = "/products", cta, className }) {
  return (
    <div
      className={`group relative flex min-h-[340px] flex-col justify-end overflow-hidden bg-neutral-900 p-8 text-white ${className ?? ""}`}
    >
      <Image
        src={src}
        fill
        alt="hero"
        className="object-cover transition-all duration-800 ease-out group-hover:scale-102 group-hover:blur-xs"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/85" />

      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-0 cursor-pointer"
      />

      <div className="relative z-10 max-w-md space-y-3">
        <p className="text-sm text-white/80">{eyebrow}</p>
        <h2 className="text-2xl font-bold leading-tight transition-transform duration-500 group-hover:translate-y-[-2px] sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-white/75">{description}</p>
        {cta ? (
          <ButtonLink href={cta.href} className="mt-2 w-fit cursor-pointer">
            {cta.label}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

function HeroTile({ title, src }) {
  return (
    <Link href={"/products"}>
      <div className="group relative flex min-h-[280px] flex-1 cursor-pointer items-end overflow-hidden bg-neutral-900 p-6 text-white">
        <Image
          src={src}
          fill
          alt="hero"
          className="object-cover transition-all duration-800 ease-out group-hover:scale-102 group-hover:blur-xs"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/80 to-transparent transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/85" />
        <h3 className="relative text-xl font-bold leading-snug transition-transform duration-500 group-hover:translate-y-[-2px]">
          {title}
        </h3>
      </div>
    </Link>
  );
}

export default function Hero() {
  return (
    <section className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-12">
      <HeroPanel
        className="lg:col-span-4"
        eyebrow="Aftermarket parts specialists"
        title="Distributors of high-quality parts to the powersports industry"
        src="/hero3.webp"
        description="Where marquee brands meet worldclass distribution."
        href="/products"
        cta={{ label: "Support", href: "/contact" }}
      />

      <HeroPanel
        className="lg:col-span-5"
        eyebrow="Auto Parts Supplier"
        title="Quality parts for every vehicle"
        src="/hero.webp"
        description="We supply a wide range of genuine and reliable car parts for different makes and models, helping you keep your vehicle running smoothly."
        href="/products"
        cta={{ label: "Shop Now", href: "/products" }}
      />

      <div className="flex flex-col gap-2 lg:col-span-3">
        <HeroTile title="Car Parts for All Models" src="/hero1.webp" />
        <HeroTile title="Professional Car Tools" src="/hero2.webp" />
      </div>
    </section>
  );
}
