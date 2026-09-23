import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Wrench,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Settings,
  Gauge,
  ArrowRight,
  Disc,
  Cog,
  CircleGauge,
  ShieldCheck,
  PoundSterling,
  Banknote,
} from 'lucide-react'

export const metadata = {
  title: "Workshop Services",
  description: "Cylinder re-plating, carburettor cleaning, vapour blasting, dyno tuning, rebuilds and repairs.",
};

const ServicePage = () => {
  const otherServices = [
    'Complete engine strip, casing cleaning & rebuild',
    'Complete rebuilds',
    'Servicing',
    'Diagnostics and repairs',
    'Dyno tuning & testing',
    'Re-mapping',
    'Porting & polishing',
    'Suspension maintenance',
    'Race preparation',
    'MSVA1 preparation',
    'Re-framing, any manufacturer or model',
    'Engine tuning / carburettor / cams / pistons and re-homing bores',
    'Tyre fitting service',
    'Decal design and fitting service',
    'Powder coating',
    'Gusset kit fitting',
    'Welding',
  ]

  const featuredServices = [
    {
      icon: <Disc className="h-7 w-7" />,
      title: 'Top End Rebuilds',
      description: 'Cylinder re-plating, boring & repairs',
      image:
        'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80',
      href: '#top-end-rebuilds',
    },
    {
      icon: <Gauge className="h-7 w-7" />,
      title: 'Carburettor Cleaning',
      description: 'Ultrasonic cleaning & rebuilds',
      image:
        '/abou2.avif',
      href: '#carb-cleaning',
    },
    {
      icon: <Cog className="h-7 w-7" />,
      title: 'Vapour Blasting',
      description: 'Restore parts to a satin finish',
      image:
        '/about1.avif',
      href: '#vapour-blasting',
    },
    {
      icon: <CircleGauge className="h-7 w-7" />,
      title: 'Dyno Tuning',
      description: 'Precision tuning & diagnostics',
      image:
        'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
      href: '#other-services',
    },
  ]

  const rePlatePricing = [
    {
      title: 'Straight Re-plates',
      description:
        'A clean, straightforward re-plating service for cylinders in good base condition.',
      single: '£136.00',
      twin: '£187.57',
      icon: <Disc className="h-6 w-6" />,
    },
    {
      title: 'Repair & Re-plate',
      description:
        'Repairs minor cylinder damage before applying a fresh re-plate finish.',
      single: '£172.00',
      twin: '£223.00',
      twinNote: 'repair on one',
      twinAlt: '£258.40',
      twinAltNote: 'repair on two',
      icon: <Wrench className="h-6 w-6" />,
    },
    {
      title: 'Bore Out & Re-plate',
      description:
        'Increases cylinder bore diameter followed by a precision re-plate.',
      single: '£182.00',
      twin: '£258.40',
      twinNote: 'bore on both',
      icon: <Gauge className="h-6 w-6" />,
    },
    {
      title: 'Repair Detonation & Re-plate',
      description:
        'Restores cylinders damaged by detonation with a full re-plate finish.',
      single: '£193.00',
      twin: '£245.00',
      twinNote: 'repair on one',
      twinAlt: '£299.00',
      twinAltNote: 'repair on two',
      icon: <AlertCircle className="h-6 w-6" />,
    },
    {
      title: 'Rebuild Skirt & Re-plate',
      description:
        'Rebuilds worn piston skirts prior to a fresh cylinder re-plate.',
      single: '£195.00',
      twin: '£246.00',
      twinNote: 'repair on one',
      twinAlt: '£299.00',
      twinAltNote: 'repair on two',
      icon: <Settings className="h-6 w-6" />,
    },
  ]

  const carbCleaning = [
    {
      label: 'Single Carburettor',
      price: '£45.00',
      description: 'Full ultrasonic clean for one carburettor unit.',
    },
    {
      label: 'Twin Carburettors',
      price: '£55.00',
      description: 'Ultrasonic cleaning for a matched pair of carburettors.',
    },
    {
      label: 'Carburettor (Set of 3)',
      price: '£65.00',
      description: 'Full set cleaning for triple carburettor set-ups.',
    },
    {
      label: 'Carburettor (Set of 4)',
      price: '£75.00',
      description: 'Complete ultrasonic service for four-carb systems.',
    },
    {
      label: 'Strip Down & Rebuild',
      price: '£25.00',
      description: 'Individual carburettor strip and rebuild (plus parts if needed).',
    },
  ]

  const vapourBlastingItems = [
    {
      category: 'Single Cylinders',
      items: [
        { name: 'Head', price: '£35.00' },
        { name: 'Barrel', price: '£40.00' },
        { name: 'Crankcases (each)', price: '£30.00' },
        { name: 'Clutch Cover', price: '£25.00' },
        { name: 'Generator Cover', price: '£25.00' },
      ],
    },
    {
      category: 'Other Parts',
      items: [
        { name: 'Carburettor', price: '£20.00' },
        { name: 'Brake Callipers', price: '£28.00' },
        { name: 'Fork Yokes (pair)', price: '£35.00' },
        { name: 'Fork Bottoms (pair)', price: '£38.00' },
        { name: 'Wheel Hub', price: '£30.00' },
        { name: 'Magnesium Wheels', price: '£55.00' },
      ],
    },
    {
      category: 'Twin Cylinders',
      items: [
        { name: 'Head', price: '£45.00' },
        { name: 'Barrel', price: '£50.00' },
        { name: 'Crankcases (each)', price: '£35.00' },
        { name: 'Clutch Cover', price: '£28.00' },
        { name: 'Generator Cover', price: '£28.00' },
      ],
    },
    {
      category: 'Complete Engines',
      items: [
        { name: 'Single Cylinder', price: '£120.00' },
        { name: 'Twin Cylinder', price: '£165.00' },
        { name: 'Four Cylinder', price: '£220.00' },
      ],
    },
  ]

  const whyChooseUs = [
    {
      icon: <Award className="h-6 w-6" />,
      title: '40+ Years Experience',
      description: 'Decades of combined expertise from our lead technicians.',
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: '4,000 sq ft Facility',
      description: 'A dedicated service centre built for powersports.',
    },
    {
      icon: <Banknote/>,
      title: '10–20% Savings',
      description: 'Better pricing than most main dealer workshops.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'Free Estimates',
      description: 'No obligation quotes, usually same or next day.',
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute right-0 top-0 hidden h-full w-1/2 bg-[#1B9DDB]/10 md:block"
          style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="text-sm font-medium text-gray-500">
              Welcome to ORP Service Centre
            </span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              <span className="text-[#1B9DDB]">THE BETTER WAY</span>
              <br />
              <span className="text-gray-900">TO POWERSPORTS CARE</span>
            </h1>
            <p className="mt-6 max-w-md text-gray-600 leading-relaxed">
              Expert servicing, repairs & tuning from a team with over 40
              years' experience — backed by a 4,000 sq ft facility built for
              performance.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1B9DDB] px-8 py-3.5 font-semibold uppercase tracking-wide text-white text-sm transition hover:bg-[#1685bb]"
            >
              Get Free Estimate
            </Link>
          </div>

          <div className="relative h-72 w-full sm:h-96 md:h-[420px]">
            <Image
              src="/foot5.webp"
              alt="Off-road vehicle service"
              fill
              className="rounded-2xl object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">
            <span className="text-[#1B9DDB]">Featured</span>{' '}
            <span className="text-gray-900">Services</span>
          </h2>
          <a
            href="#other-services"
            className="hidden items-center gap-1 text-sm font-semibold text-[#1B9DDB] hover:underline sm:flex"
          >
            Discover All
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <a
              key={service.title}
              href={service.href}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B9DDB] text-white transition group-hover:scale-110">
                  {service.icon}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 transition group-hover:text-[#1B9DDB]">
                  {service.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {service.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
          <div className="relative h-72 w-full sm:h-96">
            <Image
              src="/abou2.avif"
              alt="ORP service workshop"
              fill
              className="rounded-2xl object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="text-[#1B9DDB]">Why</span>{' '}
              <span className="text-gray-900">Choose Us</span>
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Due to customer demand, we've brought together a superb team of
              qualified service technicians — including a lead technician
              with over 40 years' experience and one of the UK's most
              coveted suspension specialists.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {whyChooseUs.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B9DDB]/10 text-[#1B9DDB]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AFTERMARKET & OEM PARTS */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Aftermarket & OEM Parts
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Off Road Performance ('ORP') hold huge stocks of OEM, service and
          aftermarket performance parts from all the industry's leading
          manufacturers. We hope to continue offering excellent customer
          service while placing your needs above all else, and to continue
          expanding our aftermarket performance ranges to include more
          amazing products from Canada, Europe and the US.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          Our service centre carries a large selection of service parts so
          we have no problems replacing broken or worn-out items on a Friday
          afternoon. We try to hold as much product as possible as we know
          you need things now, and that next-day delivery is not always good
          enough.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          We take great pride in providing you with the most reliable and
          powerful products and services in the industry.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Our Simple Business Model
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Leave your repair in our service centre for a free estimate
            (usually done the same day or next). If you are happy with our
            estimate and wish for us to continue, simply pay for the parts
            you require.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            We will start your repair once your parts have arrived, and you
            pay the quoted labour charge once complete — but before
            collection.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Please note:</strong>{' '}
                estimates sometimes change as work unfolds, but we will
                always contact you and advise if this happens.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-gray-700">
                Anyone bringing in a machine for a free estimate, deciding
                not to have us carry out the work, and then failing to
                collect their machine will incur a{' '}
                <strong>£30.00 per day storage fee</strong> after 48 hours.
                We know this sounds harsh, but these repairs are in our way
                and on our insurance.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-gray-700">
                Repairs brought in and completed but not collected will also
                incur a <strong>£30.00 per day storage fee</strong> after 48
                hours — again, we're sorry to have to do this, but you are
                taking up space needed for the next customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP END REBUILDS - CARD PRICING */}
      <section
        id="top-end-rebuilds"
        className="mx-auto max-w-7xl px-4 py-16 scroll-mt-24"
      >
        <div className="flex items-center gap-3">
          <Gauge className="h-7 w-7 text-[#1B9DDB]" />
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Top End Rebuilds
          </h2>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">
          Do you have problems with your cylinder, re-plating, repairs,
          boring out, repairing detonation or re-building skirt? Just strip
          down the cylinder and send it in along with your contact
          information — work takes around one week (two if busy).
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rePlatePricing.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#1B9DDB] hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B9DDB]/10 text-[#1B9DDB] transition group-hover:bg-[#1B9DDB] group-hover:text-white">
                {service.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {service.description}
              </p>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Single Cylinder
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {service.single}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Twin Cylinder
                    {service.twinNote && (
                      <span className="block text-xs text-gray-400">
                        ({service.twinNote})
                      </span>
                    )}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {service.twin}
                  </span>
                </div>
                {service.twinAlt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Twin Cylinder
                      <span className="block text-xs text-gray-400">
                        ({service.twinAltNote})
                      </span>
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {service.twinAlt}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 rounded-lg bg-[#1B9DDB]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            For any other prices not mentioned above please contact us for
            further details.
          </p>
          <p className="text-xs italic text-gray-500">
            Prices subject to change. Return delivery included.
          </p>
        </div>
      </section>

      {/* ULTRASONIC CARB CLEANING - CARD PRICING */}
      <section
        id="carb-cleaning"
        className="bg-gray-50 py-16 scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3">
            <Gauge className="h-7 w-7 text-[#1B9DDB]" />
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Ultrasonic Carburettor Cleaning
            </h2>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">
            The process cleans both the external and internal areas of the
            carburettor and its jets, removing fuel that has 'gone off' and
            carbon deposits — hence improving performance. After ultrasonic
            cleaning, we dry the item and coat with ACF50.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {carbCleaning.map((item) => (
              <div
                key={item.label}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#1B9DDB] hover:shadow-xl"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1B9DDB]/10 text-[#1B9DDB] transition group-hover:bg-[#1B9DDB] group-hover:text-white">
                  <PoundSterling className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-gray-900">
                  {item.label}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-gray-500">
                  {item.description}
                </p>
                <p className="mt-4 text-2xl font-extrabold text-[#1B9DDB]">
                  {item.price}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm italic text-gray-500">
            Return delivery charges apply.
          </p>
        </div>
      </section>

      {/* VAPOUR BLASTING - CARD PRICING */}
      <section
        id="vapour-blasting"
        className="mx-auto max-w-7xl px-4 py-16 scroll-mt-24"
      >
        <div className="flex items-center gap-3">
          <Cog className="h-7 w-7 text-[#1B9DDB]" />
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vapour Blasting
          </h2>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">
          The vapour blasting process will render your non-ferrous items,
          such as aluminium, magnesium etc., blemish-free with a
          high-quality satin finish — with no damage to gasket faces or
          bearing journals.
        </p>
        <p className="mt-4 max-w-3xl text-sm italic text-gray-500">
          Please note: this process is unsuitable for ferrous materials. We
          also offer a less abrasive 'Soda blasting service' — contact us
          for details.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {vapourBlastingItems.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <h3 className="text-lg font-bold text-gray-900">
                {group.category}
              </h3>
              <div className="mt-4 space-y-1">
                {group.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between rounded-lg px-3 py-3 transition hover:bg-[#1B9DDB]/5 ${
                      i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1B9DDB]" />
                      <span className="text-sm text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Prices are indicative — contact us to confirm pricing for your
          specific parts.
        </p>
      </section>

      {/* OTHER SERVICES */}
      <section id="other-services" className="bg-gray-50 py-16 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Other Services Available
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((service) => (
              <div
                key={service}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-[#1B9DDB] hover:shadow-md"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B9DDB]/10 text-[#1B9DDB] transition group-hover:bg-[#1B9DDB] group-hover:text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            A Different Level of Service
          </h2>
          <p className="mt-4 text-lg text-white/90">
            We look forward to showing you a different level of service than
            you have experienced before.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-[#1B9DDB] transition hover:bg-gray-100"
            >
              <Phone className="h-4 w-4" />
              Book a Free Estimate
            </a>
            <a
              href="mailto:service@offroadperformance.com"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-[#1B9DDB]"
            >
              <Mail className="h-4 w-4" />
              Email Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicePage;