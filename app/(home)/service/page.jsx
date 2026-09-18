import React from 'react'
import {
  Wrench,
  Award,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Settings,
  Sparkles,
  Gauge,
} from 'lucide-react'

const page = () => {
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

  const rePlatePricing = [
    { title: 'Straight Re-plates', single: '£136.00', twin: '£187.57' },
    {
      title: 'Repair & Re-plate',
      single: '£172.00',
      twin: '£223.00',
      twinNote: '(repair on one)',
      twinAlt: '£258.40',
      twinAltNote: '(repair on two)',
    },
    {
      title: 'Bore Out & Re-plate',
      single: '£182.00',
      twin: '£258.40',
      twinNote: '(bore on both)',
    },
    {
      title: 'Repair Detonation & Re-plate',
      single: '£193.00',
      twin: '£245.00',
      twinNote: '(repair on one)',
      twinAlt: '£299.00',
      twinAltNote: '(repair on two)',
    },
    {
      title: 'Rebuild Skirt & Re-plate',
      single: '£195.00',
      twin: '£246.00',
      twinNote: '(repair on one)',
      twinAlt: '£299.00',
      twinAltNote: '(repair on two)',
    },
  ]

  const carbCleaning = [
    { label: 'Single Carburettor', price: '£45.00' },
    { label: 'Twin Carburettors', price: '£55.00' },
    { label: 'Carburettor (set of 3)', price: '£65.00' },
    { label: 'Carburettor (set of 4)', price: '£75.00' },
  ]

  const vapourBlastingSingle = [
    'Head',
    'Barrel',
    'Crankcases (each)',
    'Clutch Cover',
    'Generator Cover',
  ]

  const vapourBlastingParts = [
    'Carburettor',
    'Brake callipers',
    'Fork yokes (pair)',
    'Fork bottoms (pair)',
    'Wheel hub',
    'Magnesium wheels',
  ]

  const vapourBlastingTwin = [
    'Head',
    'Barrel',
    'Crankcases (each)',
    'Clutch cover',
    'Generator cover',
  ]

  const vapourBlastingEngines = [
    'Single cylinder',
    'Twin cylinder',
    'Four cylinders',
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
      
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Our Service Centre
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Off Road Performance (ORP) — Expert servicing, repairs & tuning
            for powersports vehicles
          </p>
        </div>
      </section>

      {/* INTRO SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-lg leading-relaxed text-gray-600">
          Due to customer demand, we look forward to the opening of our new{' '}
          <strong className="text-gray-900">service centre</strong> and have
          been lucky enough to bring together a superb team of qualified
          service technicians.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          Our lead technician brings over{' '}
          <strong className="text-gray-900">40 years' experience</strong> in
          servicing, repair and engine tuning to our business. Our suspension
          specialist is one of the UK's most coveted technicians, ready to
          help with all your suspension set-ups, servicing and repairs.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          With an estimated{' '}
          <strong className="text-gray-900">4,000 sq ft</strong> of dedicated
          service centre capable of dealing with most types of powersports
          servicing, repairs & tuning, our qualified service technicians will
          be on hand to help with anything you require.
        </p>

        {/* HIGHLIGHT STATS */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-gray-100 pt-10 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 flex-shrink-0 text-[#1B9DDB]" />
            <div>
              <p className="font-bold text-gray-900">40+ Years</p>
              <p className="text-sm text-gray-600">Combined experience</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="h-6 w-6 flex-shrink-0 text-[#1B9DDB]" />
            <div>
              <p className="font-bold text-gray-900">4,000 sq ft</p>
              <p className="text-sm text-gray-600">Dedicated facility</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="h-6 w-6 flex-shrink-0 text-[#1B9DDB]" />
            <div>
              <p className="font-bold text-gray-900">10-20% Savings</p>
              <p className="text-sm text-gray-600">Vs. main dealer pricing</p>
            </div>
          </div>
        </div>
      </section>

      {/* AFTERMARKET & OEM PARTS */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
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
            we have no problems replacing broken or worn-out items on a
            Friday afternoon. We try to hold as much product as possible as
            we know you need things now, and that next-day delivery is not
            always good enough.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            We take great pride in providing you with the most reliable and
            powerful products and services in the industry.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Our Simple Business Model
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Leave your repair in our service centre for a free estimate
          (usually done the same day or next). If you are happy with our
          estimate and wish for us to continue, simply pay for the parts you
          require.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          We will start your repair once your parts have arrived, and you
          pay the quoted labour charge once complete — but before collection.
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">Please note:</strong>{' '}
              estimates sometimes change as work unfolds, but we will always
              contact you and advise if this happens.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-gray-700">
              Anyone bringing in a machine for a free estimate, deciding not
              to have us carry out the work, and then failing to collect
              their machine will incur a{' '}
              <strong>£30.00 per day storage fee</strong> after 48 hours. We
              know this sounds harsh, but these repairs are in our way and
              on our insurance.
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
      </section>

      {/* TOP END REBUILDS */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center gap-3">
            <Gauge className="h-7 w-7 text-[#1B9DDB]" />
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Top End Rebuilds
            </h2>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Do you have problems with your cylinder, re-plating, repairs,
            boring out, repairing detonation or re-building skirt? Just
            strip down the cylinder and send it in along with your contact
            information — work takes around one week (two if busy). We can
            also supply you with a new piston (stock or hi-compression) and
            gasket sets.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Why not go all the way and add uprated performance parts, all
            available here at Off Road Performance ('ORP') for the ultimate
            performance from your engine.
          </p>

          {/* PRICING TABLE */}
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#1B9DDB] text-white">
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Single Cylinder</th>
                  <th className="px-5 py-3 font-semibold">Twin Cylinder</th>
                </tr>
              </thead>
              <tbody>
                {rePlatePricing.map((row, i) => (
                  <tr
                    key={row.title}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {row.title}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.single}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.twin}{' '}
                      {row.twinNote && (
                        <span className="block text-xs text-gray-500">
                          {row.twinNote}
                        </span>
                      )}
                      {row.twinAlt && (
                        <>
                          <span className="mt-1 block">{row.twinAlt}</span>
                          <span className="block text-xs text-gray-500">
                            {row.twinAltNote}
                          </span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            For any other prices not mentioned above please contact us for
            further details.
          </p>
          <p className="mt-2 text-sm italic text-gray-500">
            Please note: we reserve the right to change prices without
            notice. Return delivery charges are included.
          </p>
        </div>
      </section>

      {/* ULTRASONIC CARB CLEANING */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#1B9DDB]" />
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Ultrasonic Carburettor Cleaning
          </h2>
        </div>
        <p className="mt-4 leading-relaxed text-gray-600">
          The process cleans both the external and internal areas of the
          carburettor and its jets, removing fuel that has 'gone off' and
          carbon deposits — hence improving performance.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          This process will not remove rust or staining of the carburettor,
          but the cosmetic appearance can be improved by vapour blasting the
          outside of the carburettor prior to this process. After ultrasonic
          cleaning, we dry the item and coat with ACF50.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#1B9DDB] text-white">
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {carbCleaning.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-gray-700">{row.price}</td>
                </tr>
              ))}
              <tr className="bg-white">
                <td className="px-5 py-4 font-medium text-gray-900">
                  Individual strip down & rebuild
                </td>
                <td className="px-5 py-4 text-gray-700">
                  £25.00 (plus parts if needed)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm italic text-gray-500">
          Return delivery charges apply.
        </p>
      </section>

      {/* VAPOUR BLASTING */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vapour Blasting
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The vapour blasting process will render your non-ferrous items,
            such as aluminium, magnesium etc., blemish-free with a
            high-quality satin finish. The process causes no damage or
            scouring to the material, meaning gasket faces and bearing
            journals are left unscathed.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The primary stage ensures items are completely free from paint or
            grease, as the slightest contamination can affect the process. If
            time is pressing or you lack the necessary equipment, we can
            provide cleaning for a small additional charge, depending on the
            level required.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Items are then vapour blasted using small glass beads suspended
            in water, producing a soft abrasive slurry that removes
            oxidisation and surface blemishes — polishing the item to a
            high-quality satin finish. Finally, the item is thoroughly washed
            and coated with an oxidation inhibitor (ACF50) to prolong the
            enhanced appearance.
          </p>
          <p className="mt-4 text-sm italic text-gray-500">
            Please note: this process is unsuitable for ferrous materials —
            please refer to our bead / shot blasting services for these
            items. We now also offer a less abrasive 'Soda blasting service'
            — contact us for further information.
          </p>

          {/* ITEM CATEGORIES */}
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-bold text-gray-900">Single Cylinders</h3>
              <ul className="mt-3 space-y-2">
                {vapourBlastingSingle.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1B9DDB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Other Parts</h3>
              <ul className="mt-3 space-y-2">
                {vapourBlastingParts.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1B9DDB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Twin Cylinders</h3>
              <ul className="mt-3 space-y-2">
                {vapourBlastingTwin.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1B9DDB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Complete Engines</h3>
              <ul className="mt-3 space-y-2">
                {vapourBlastingEngines.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1B9DDB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-600">
            Contact us for pricing on any of the items listed above.
          </p>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Other Services Available
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {otherServices.map((service) => (
            <div key={service} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
              <span className="text-gray-600">{service}</span>
            </div>
          ))}
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

export default page