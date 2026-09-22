import React from 'react'
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Mail,
  Package,
  Truck,
  AlertCircle,
  Info,
  Camera,
  Phone,
} from 'lucide-react'

const page = () => {
  const sections = [
    { id: 'standard-returns', title: 'Standard Returns' },
    { id: 'cannot-return', title: 'Items That Cannot Be Returned' },
    { id: 'custom-orders', title: 'Custom Built Orders' },
    { id: 'refunds', title: 'Refunds' },
    { id: 'damaged-items', title: 'Damaged or Incorrect Items' },
    { id: 'how-to-return', title: 'How to Initiate a Return' },
  ]

  const eligibleConditions = [
    'In its original, unopened packaging',
    'In new and resalable condition, with no signs of use, installation, or modification',
    'Returned with all original parts, accessories, and documentation',
  ]

  const nonReturnable = [
    'Any item that has been installed, used, or modified',
    'Goods that are not in their original packaging and in resalable condition',
  ]

  const returnSteps = [
    {
      icon: <Phone className="h-6 w-6" />,
      step: '1',
      title: 'Contact Us',
      description:
        "Please email or call our customer service team to request a 'Return Merchandise Authorization' (RMA) number.",
    },
    {
      icon: <Package className="h-6 w-6" />,
      step: '2',
      title: 'Package Your Item',
      description:
        'Securely pack the item in its original box, including all parts and paperwork. Clearly write the RMA number on the outside of the shipping box.',
    },
    {
      icon: <Truck className="h-6 w-6" />,
      step: '3',
      title: 'Ship It Back',
      description:
        'Send the package to the address provided by our team. We recommend using a trackable and insured shipping method.',
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
   
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Returns & Refunds
          </h1>
          <p className="mt-4 text-white/90">
            We want you to be completely satisfied with your purchase from
            Off Road Performance (ORP)
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* TABLE OF CONTENTS */}
          <aside className="lg:col-span-1">
            <div className="sticky top-44">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                On This Page
              </h3>
              <nav className="mt-4 space-y-3 border-l-2 border-gray-100">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block border-l-2 border-transparent pl-4 text-sm text-gray-600 transition hover:border-[#1B9DDB] hover:text-[#1B9DDB] -ml-0.5"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-gray-600">
              We've designed our return policy to be clear, fair, and
              straightforward.
            </p>

            {/* STANDARD RETURNS */}
            <div id="standard-returns" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Standard Returns
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We are happy to accept returns on most new, unused items
                within <strong className="text-gray-900">7 days</strong> of
                delivery.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Conditions for Standard Returns
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                To be eligible for a full refund, your item must be:
              </p>

              <div className="mt-5 space-y-3">
                {eligibleConditions.map((condition) => (
                  <div key={condition} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                    <span className="text-gray-600">{condition}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#1B9DDB]/5 p-4">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  To ensure your return is protected, we recommend insuring
                  the shipment for its full value. Any damage or loss during
                  the return shipment is the responsibility of you and your
                  shipping carrier.
                </p>
              </div>
            </div>

            {/* ITEMS THAT CANNOT BE RETURNED */}
            <div id="cannot-return" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Items That Cannot Be Returned
              </h2>
              <div className="mt-5 space-y-3">
                {nonReturnable.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CUSTOM BUILT ORDERS */}
            <div id="custom-orders" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Custom Built Orders
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Products that are custom-built to your specific requirements
                are non-refundable and cannot be cancelled or returned.
              </p>

              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Why?
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                  <span className="text-gray-600">
                    These items are made specifically for your vehicle and
                    cannot be resold to other customers.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                  <span className="text-gray-600">
                    Once production begins on a custom order, we are unable
                    to cancel it with the manufacturer.
                  </span>
                </div>
              </div>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We appreciate your understanding.
              </p>
            </div>

            {/* REFUNDS */}
            <div id="refunds" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Refunds</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Once we receive and inspect your returned item, we will
                notify you of the approval or rejection of your refund.
              </p>

              <div className="mt-6 space-y-4 border-l-2 border-[#1B9DDB]/20 pl-6">
                <div>
                  <p className="font-semibold text-gray-800">
                    Items from Off Road Performance ('ORP') stock
                  </p>
                  <p className="text-gray-600">
                    If your return is approved, a full refund will be
                    processed to your original method of payment.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Items sourced from our suppliers
                  </p>
                  <p className="text-gray-600">
                    If the item needs to be returned to one of our
                    suppliers, your refund will be subject to any restocking
                    or handling fees charged by them. We will always inform
                    you of any potential deductions.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <p className="text-sm text-gray-700">
                  <strong>Please note:</strong> original shipping charges are
                  non-refundable, and you are responsible for the cost of
                  return shipping.
                </p>
              </div>
            </div>

            {/* DAMAGED OR INCORRECT ITEMS */}
            <div id="damaged-items" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Damaged or Incorrect Items
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We take great care in packaging and shipping your order. We
                inspect and photograph all items before they leave our
                facility.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#1B9DDB]/5 p-4">
                <Camera className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  If you receive a damaged or incorrect item, please contact
                  our customer service team within{' '}
                  <strong>48 hours of delivery</strong>. We will work with
                  you to resolve the issue promptly.
                </p>
              </div>
            </div>

            {/* HOW TO INITIATE A RETURN */}
            <div id="how-to-return" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                How to Initiate a Return
              </h2>

              <div className="mt-8 space-y-6">
                {returnSteps.map((step, index) => (
                  <div key={step.step} className="relative flex gap-5">
                    {/* Connector line */}
                    {index !== returnSteps.length - 1 && (
                      <div className="absolute left-6 top-14 h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB] text-white">
                      {step.icon}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1B9DDB]">
                          Step {step.step}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-gray-600 leading-relaxed">
                We hope this policy seems fair and easy to understand. Our
                goal is to provide you with the best possible service.
              </p>
            </div>

            {/* CONTACT CALLOUT */}
            <div className="mt-16 flex flex-col items-start gap-4 rounded-xl bg-[#1B9DDB]/5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB]">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Ready to start a return?
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Contact our support team at{' '}
                  <a
                    href="mailto:returns@offroadperformance.com"
                    className="font-medium text-[#1B9DDB] hover:underline"
                  >
                    returns@offroadperformance.com
                  </a>{' '}
                  to request your RMA number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default page