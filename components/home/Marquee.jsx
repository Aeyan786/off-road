import ButtonLink from "@/components/ui/button-link";

const BRANDS = ["BURNFOX", "anno", "chavy", "AWAKEN", "ogie"];
const TICKER_ITEMS = Array.from({ length: 5 }, () => "Main Heading");

function ScrollingRow({ items, itemClassName, trackClassName }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className={`flex w-max animate-marquee items-center ${trackClassName ?? ""}`}>
        {doubled.map((item, i) => (
          <span key={i} className={itemClassName}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MarqueeSection() {
  return (
    <div className="border-t py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <h3 className="text-2xl font-bold text-neutral-900">
          Marquee Section
        </h3>
        <ButtonLink
          href="/"
          className="mt-4 bg-sky-300 text-neutral-900 hover:bg-sky-300/90"
        >
          Button Label
        </ButtonLink>
      </div>
      <div className="mt-10">
        <ScrollingRow
          items={TICKER_ITEMS}
          trackClassName="gap-16"
          itemClassName="whitespace-nowrap px-8 text-3xl font-bold text-neutral-300 sm:text-4xl"
        />
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="bg-white">
      <div className="border-b py-10">
        <ScrollingRow
          items={BRANDS}
          trackClassName="gap-20"
          itemClassName="whitespace-nowrap px-4 text-2xl font-bold tracking-tight text-neutral-800"
        />
      </div>

      <MarqueeSection />
      <MarqueeSection />
    </section>
  );
}
