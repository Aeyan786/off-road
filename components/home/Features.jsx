import { Gem, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    Icon: Gem,
    title: "Premium Products",
    description:
      "High-quality car parts built for reliable performance, durability, and a perfect fit.",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Shop with confidence using safe and secure payment options for every order.",
  },
  {
    Icon: PackageCheck,
    title: "Easy Returns",
    description:
      "Enjoy a hassle-free return process if your product isn't the right fit.",
  },
  {
    Icon: Truck,
    title: "Free Delivery",
    description:
      "Get your car parts delivered safely and conveniently right to your doorstep.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-14">
      <div className="grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {FEATURES.map(({ Icon, title, description }) => (
          <div key={title} className="flex gap-4 px-0 py-6 sm:px-6 sm:first:pl-0">
            <Icon className="size-6 shrink-0 text-neutral-900" />
            <div>
              <h3 className="font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
