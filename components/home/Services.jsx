import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleGauge, Cog, Disc, Gauge, Truck } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";

/**
 * Workshop services teaser. Mirrors the featured services on /service (same
 * titles, images and section anchors), so each card deep-links to its full
 * details and pricing there.
 */
const SERVICES = [
  {
    Icon: Disc,
    title: "Top End Rebuilds",
    description: "Cylinder re-plating, boring & repairs",
    image: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80",
    href: "/service#top-end-rebuilds",
  },
  {
    Icon: Gauge,
    title: "Carburettor Cleaning",
    description: "Ultrasonic cleaning & rebuilds",
    image: "/abou2.avif",
    href: "/service#carb-cleaning",
  },
  {
    Icon: Cog,
    title: "Vapour Blasting",
    description: "Restore parts to a satin finish",
    image: "/about1.avif",
    href: "/service#vapour-blasting",
  },
  {
    Icon: CircleGauge,
    title: "Dyno Tuning",
    description: "Precision tuning & diagnostics",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
    href: "/service#other-services",
  },
];

export default function Services() {
  return (
    <section className="bg-neutral-900 text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Workshop services
          </p>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            More than parts — we fit, rebuild &amp; tune
          </h2>
          <p className="text-sm leading-relaxed text-neutral-300">
            From cylinder re-plating to dyno tuning, our workshop keeps your
            machine running at its best. Complete rebuilds, servicing,
            diagnostics and race preparation, with free doorstep pick-up &amp; drop.
          </p>
          <p className="flex items-center gap-2 text-sm text-neutral-300">
            <Truck className="size-4 text-brand" />
            Free doorstep pick-up &amp; drop
          </p>
          <ButtonLink href="/service" className="cursor-pointer rounded-sm px-4">
            Explore all services
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map(({ Icon, title, description, image, href }) => (
            <Link
              key={title}
              href={href}
              className="group cursor-pointer overflow-hidden rounded-sm bg-white text-neutral-900 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-40 overflow-hidden bg-neutral-200">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
           
              </div>
              <div className="flex items-start justify-between gap-2 p-4">
                <div>
                  <h3 className="font-semibold transition-colors group-hover:text-brand">{title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{description}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
