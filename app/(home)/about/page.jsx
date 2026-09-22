import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const page = () => {
  return (
    <div className="w-full bg-white text-neutral-900">
      {/* HERO */}
      <section className="relative flex min-h-[85vh] w-full items-end overflow-hidden bg-neutral-900">
        <Image
          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&q=80"
          alt="Off-road truck tackling rough terrain"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        <div className="relative z-10 w-full px-6 pb-16 sm:px-10 lg:px-16">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Off Road Performance — ORP
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Building world-class rides
            <br />
            from the ground up.
          </h1>
        </div>
      </section>

      {/* WELCOME / REDESIGN INTRO */}
      <section className="border-b border-neutral-100 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
              01 — New Website
            </span>
          </div>
          <div className="lg:col-span-9">
            <p className="text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Welcome to Off Road Performance's new website. We've had a
              complete re-design — one that not only celebrates our rich
              history in the powersports industry, but represents all the
              qualities that make us a world-class parts distributor.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-500">
              Over a decade later, we continue to deliver the most powerful
              and reliable aftermarket performance parts to the powersports
              industry.
            </p>
          </div>
        </div>
      </section>

      {/* TAGLINE STATEMENT */}
      <section className="bg-[#1B9DDB] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-2xl font-bold leading-snug text-white sm:text-4xl lg:text-5xl">
            Where marquee brands meet{' '}
            <span className="italic font-serif font-medium">
              world-class distribution.
            </span>
          </p>
        </div>
      </section>

      {/* TRUSTED DESTINATION */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
              02 — Who We Are
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Your trusted destination for off-road excellence.
            </h2>
            <p className="mt-6 leading-relaxed text-neutral-600">
              Off Road Performance was created for those who live life
              outside of work. We understand the thrill of racing or the
              need for some weekend leisure time — we know your ride needs
              to be just as tough as the journey ahead.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              Our store offers a carefully selected range of high-quality
              parts and accessories designed to enhance your ride, give you
              ultimate control and reliable performance.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-neutral-900 pb-1 text-sm font-semibold text-neutral-900 transition hover:border-[#1B9DDB] hover:text-[#1B9DDB]"
            >
              Explore the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-sm sm:h-[28rem] lg:col-span-7">
            <Image
              src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&q=80"
              alt="Off-road motorbike on a dirt trail"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERY TERRAIN */}
      <section className="bg-neutral-50 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-12">
          <div className="relative order-2 h-80 w-full overflow-hidden rounded-sm sm:h-[28rem] lg:order-1 lg:col-span-7">
            <Image
              src="https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=1200&q=80"
              alt="4x4 vehicle driving through mud"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
              03 — Our Standard
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Built for every terrain.
            </h2>
            <p className="mt-6 leading-relaxed text-neutral-600">
              Off Road Performance is built around the idea that no terrain
              should limit your journey. We know that the parts we recommend
              need to perform consistently while under pressure.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              That's why we focus on providing parts designed to handle
              extreme conditions while offering more performance, control,
              and exceptional durability. Every product we offer is selected
              with real-world performance in mind — we understand that
              riding isn't just a hobby, it's an experience that demands
              reliability.
            </p>
          </div>
        </div>
      </section>

      {/* OUR MISSION */}
      <section className="border-t border-neutral-100 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
            04 — Our Mission
          </span>
          <p className="mt-6 text-2xl font-medium leading-snug text-neutral-900 sm:text-3xl">
            We're committed to helping our customers build and upgrade their
            rides with parts they can depend on, no matter how demanding the
            environment becomes.
          </p>
          <p className="mt-8 leading-relaxed text-neutral-600">
            We strive to create a platform where quality meets trust,
            ensuring every customer receives not only the right products but
            also a seamless and reliable shopping experience.
          </p>
          <p className="mt-4 leading-relaxed text-neutral-600">
            At Off Road Performance, our mission goes beyond selling — it's
            about enabling every ride with confidence and peace of mind.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-neutral-900 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
            05 — Why Off Road Performance
          </span>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            Reliability, passion, and a commitment to excellence.
          </h2>
          <p className="mt-6 max-w-3xl leading-relaxed text-neutral-300">
            We focus on delivering products that meet the real demands of
            riding, ensuring every item in our store performs when it
            matters most. We understand the needs of riding enthusiasts
            because we share the same passion — pushing the limits,
            exploring further, and never settling for average.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-neutral-300">
            That's why we prioritize quality, consistency, and customer
            satisfaction in everything we do, making us a trusted partner
            for your journey.
          </p>

          <div className="mt-14 grid grid-cols-1 divide-y divide-white/10 border-t border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {['Quality', 'Consistency', 'Customer Satisfaction'].map(
              (word) => (
                <div key={word} className="py-6 sm:px-8 sm:py-8">
                  <p className="text-lg font-semibold text-white">{word}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 border-t border-neutral-100 pt-16 sm:flex-row sm:items-end">
          <div>
            <h2 className="max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Ready to find your perfect part?
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-neutral-500">
              Search our catalog by your vehicle's year, make, and model —
              and get parts you know will fit, delivered fast.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#1B9DDB] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1685bb]"
            >
              Shop Now
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default page