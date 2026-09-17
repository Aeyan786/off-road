import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Wrench,
  Truck,
  ShieldCheck,
  Users,
  Award,
  Zap,
  MapPin,
  ArrowRight,
  Star,
} from 'lucide-react'

const page = () => {
  const stats = [
    { label: 'Parts in Catalog', value: '250K+' },
    { label: 'Brands Carried', value: '500+' },
    { label: 'Vehicles Supported', value: '10K+' },
    { label: 'Happy Customers', value: '1M+' },
  ]

  const values = [
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Fitment First',
      description:
        'Every part we sell is matched to your exact make, model, and year — no guesswork, no returns.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Trusted Quality',
      description:
        'We only stock parts from manufacturers we trust, backed by warranties and real customer reviews.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Built for Speed',
      description:
        'Fast shipping, real-time inventory, and a checkout process built for people who want to get back on the trail.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'By Enthusiasts',
      description:
        'Our team is made up of off-roaders and gearheads who use the same parts we sell — every day.',
    },
  ]

  const timeline = [
    {
      year: '2015',
      title: 'The Idea',
      description:
        'Founded in a garage by a group of off-road enthusiasts tired of guessing whether parts would fit their rigs.',
    },
    {
      year: '2018',
      title: 'Fitment Engine Launch',
      description:
        'Built our proprietary Year/Make/Model search engine, changing how customers shop for parts online.',
    },
    {
      year: '2021',
      title: 'Nationwide Distribution',
      description:
        'Expanded to multiple warehouses, enabling 2-day shipping across the entire country.',
    },
    {
      year: '2024',
      title: '1 Million Customers',
      description:
        'Crossed a major milestone, becoming a go-to destination for car and bike parts nationwide.',
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
       
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 rounded-full bg-[#1B9DDB] px-4 py-1 text-sm font-semibold uppercase tracking-wider text-white">
            Our Story
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Built By Riders & Drivers,{' '}
            <span className="text-[#1B9DDB]">For Riders & Drivers</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-900">
            OffRoad Performance is on a mission to make finding the right car
            and bike parts effortless — no matter your make, model, or year.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#1B9DDB]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-white/90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
              Who We Are
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              More Than a Parts Store
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              OffRoad Performance started with a simple frustration: buying
              car and bike parts online was confusing, slow, and full of
              guesswork. We built a platform where every part is matched
              precisely to your vehicle's manufacturer, model, and year —
              eliminating returns and wasted time.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Today, we're proud to serve off-road enthusiasts, daily
              commuters, and weekend warriors across the country with the
              largest fitment-verified catalog in the industry.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1B9DDB] px-6 py-3 font-semibold text-white transition hover:bg-[#1685bb]"
            >
              Shop All Parts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl sm:h-96">
            <Image
              src="/foot2.webp"
              alt="Team working on a vehicle"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
              What Drives Us
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Our Core Values
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-[#1B9DDB] hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B9DDB]/10 text-[#1B9DDB] transition group-hover:bg-[#1B9DDB] group-hover:text-white">
                  {value.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
            Our Journey
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            From Garage to Nationwide
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gray-200 md:block" />
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`flex flex-col items-center gap-6 md:flex-row ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 md:text-right">
                  <div
                    className={`${
                      index % 2 === 1 ? 'md:text-left' : ''
                    } rounded-xl bg-gray-50 p-6`}
                  >
                    <span className="text-2xl font-extrabold text-[#1B9DDB]">
                      {item.year}
                    </span>
                    <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="z-10 hidden h-4 w-4 flex-shrink-0 rounded-full border-4 border-white bg-[#1B9DDB] shadow md:block" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / FITMENT HIGHLIGHT */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
          <div className="relative h-80 w-full overflow-hidden rounded-2xl sm:h-96">
            <Image
              src="/foot1.webp"
              alt="Fitment search in action"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
              Why OffRoad Performance
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Guaranteed Fitment, Every Time
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                'Search by Year, Make & Model for guaranteed compatibility',
                'Verified reviews from real off-road enthusiasts',
                'Fast, reliable shipping from warehouses nationwide',
                'Dedicated support team of gearheads, not call centers',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB]">
                    <Star className="h-3.5 w-3.5 text-white" fill="white" />
                  </div>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative overflow-hidden  py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <MapPin className="mx-auto h-10 w-10 " />
          <h2 className="mt-4 text-3xl font-bold  sm:text-4xl">
            Ready to Find Your Perfect Part?
          </h2>
          <p className="mt-4 text-lg ">
            Search our catalog by your vehicle's year, make, and model — and
            get parts you know will fit, delivered fast.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="rounded-lg bg-gray-100 px-8 py-3 font-semibold hover:text-[#1B9DDB] transition hover:bg-gray-200"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-gray-100 border-2 border-white px-8 py-3 font-semibold  transition hover:bg-gray-200 hover:text-[#1B9DDB]"
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