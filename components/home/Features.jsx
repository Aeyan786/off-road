import { Gem, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    Icon: Gem,
    title: "Premium Products",
    description:
      "Etiam ac tempor lacus. Nunc vehser vehicula exeget varius.",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Duis lacinia vestibulum turp sodales enim blandit at. Proin sodales.",
  },
  {
    Icon: PackageCheck,
    title: "Easy Returns",
    description:
      "Integer tincidunt diam ut semtris tique tempor leo suscipit.",
  },
  {
    Icon: Truck,
    title: "Free Delivery",
    description:
      "Risus at nisl placerat, in vehicula metus dictum uiseu egestas.",
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
