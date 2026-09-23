import React from 'react'
import {
  Truck,
  Clock,
  Package,
  MapPin,
  Mail,
  AlertCircle,
  Info,
  Zap,
} from 'lucide-react'

export const metadata = {
  title: "Shipping & Delivery",
  description: "Dispatch times, couriers and delivery estimates for your order.",
};

const ShippingPage = () => {
  const sections = [
    { id: 'processing', title: 'Order Processing & Dispatch' },
    { id: 'shipping-costs', title: 'Shipping Costs' },
    { id: 'tracking', title: 'Order Tracking' },
    { id: 'contact', title: 'When to Contact Us' },
    { id: 'considerations', title: 'Important Considerations' },
    { id: 'urgent', title: 'Urgent Orders' },
  ]

  const depots = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'In Stock UK Items',
      rows: [
        { label: 'Ordered before 2:00pm', value: 'Dispatched same working day' },
        { label: 'Ordered after 2:00pm', value: 'Dispatched next working day' },
      ],
    },
    {
      icon: <Truck className="h-5 w-5" />,
      title: 'European Depot',
      rows: [
        { label: 'Transit to UK facility', value: '48–72 hours' },
        { label: 'Dispatch to you', value: 'Same day as arrival' },
      ],
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: 'North American Depot (US/Canada)',
      rows: [
        { label: 'Transit to UK facility', value: '48–72 hours' },
        { label: 'Dispatch to you', value: 'Same day as arrival' },
      ],
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
     
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Shipping Policy
          </h1>
          <p className="mt-4 text-white/90">
            At Off Road Performance (ORP) we work hard to get your order to
            you as quickly and efficiently as possible.
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
              This policy explains our shipping process, timelines, and how
              we keep you informed every step of the way.
            </p>

            {/* PROCESSING & DISPATCH */}
            <div id="processing" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Processing & Dispatch Times
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We dispatch orders on working days (Monday – Friday,
                excluding national holidays). The time it takes to process
                your order depends on where the product is sourced from.
              </p>

              {/* DEPOT TIMELINE CARDS - MINIMAL STYLE */}
              <div className="mt-8 space-y-4">
                {depots.map((depot) => (
                  <div
                    key={depot.title}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B9DDB]/10 text-[#1B9DDB]">
                        {depot.icon}
                      </div>
                      <h3 className="font-bold text-gray-900">
                        {depot.title}
                      </h3>
                    </div>
                    <div className="mt-4 space-y-2 pl-12">
                      {depot.rows.map((row) => (
                        <div
                          key={row.label}
                          className="flex flex-col justify-between text-sm sm:flex-row sm:items-center"
                        >
                          <span className="text-gray-500">{row.label}</span>
                          <span className="font-medium text-gray-900">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="mt-10 text-lg font-semibold text-gray-900">
                Custom Built or Made to Order Items
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                These products always have a manufacturing lead time. We
                will advise you of this specific lead time when you place
                your order, or on the next working day if the order is
                placed after business hours.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <p className="text-sm text-gray-700">
                  <strong>Please note:</strong> once your order has been
                  placed and paid it cannot be cancelled or refunded — this
                  is a custom-built product built to your specifications and
                  therefore of no use to anyone else.
                </p>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#1B9DDB]/5 p-4">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  <strong>Please note:</strong> the total delivery time is
                  the processing time + lead time + shipping time.
                </p>
              </div>
            </div>

            {/* SHIPPING COSTS */}
            <div id="shipping-costs" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Shipping Costs
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Shipping costs are calculated automatically at checkout. Once
                you enter your delivery address and select a shipping
                method, the final cost will be added to your order subtotal
                for review before you complete your purchase.
              </p>
            </div>

            {/* ORDER TRACKING */}
            <div id="tracking" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Tracking
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Once your order has been dispatched, you will receive a
                shipping confirmation email containing your tracking
                information. You can also find these details in the{' '}
                <strong>"My Account"</strong> section of our website.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We use trusted global partners, including{' '}
                <strong>UPS, DHL and Royal Mail</strong>, to deliver your
                orders safely.
              </p>
            </div>

            {/* WHEN TO CONTACT US */}
            <div id="contact" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                When to Contact Us
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We recommend checking your tracking information first for
                the most up-to-date status of your delivery.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                While our shipping estimates are highly accurate, occasional
                delays can occur. If your order has not arrived within a few
                days of the estimated delivery date, please contact our
                support team, and we will be happy to investigate for you.
              </p>
            </div>

            {/* IMPORTANT CONSIDERATIONS */}
            <div id="considerations" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Important Considerations
              </h2>
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#1B9DDB]/5 p-4">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  <strong>Estimates, not guarantees:</strong> all the
                  timelines provided are estimates based on typical
                  conditions. Whilst we strive to meet them, they are not
                  guaranteed.
                </p>
              </div>
            </div>

            {/* URGENT ORDERS */}
            <div id="urgent" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Urgent Orders
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                If you have a specific deadline, we strongly recommend
                contacting us before placing your order. Our team can
                confirm stock levels and provide a more accurate delivery
                estimate to avoid any disappointment.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-700">
                  Need it fast? Reach out to our team before ordering and
                  we'll do everything we can to help you meet your deadline.
                </p>
              </div>
            </div>

            {/* CONTACT CALLOUT */}
            <div className="mt-16 flex flex-col items-start gap-4 rounded-xl bg-[#1B9DDB]/5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB]">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Questions about your shipment?
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Reach out to our support team at{' '}
                  <a
                    href="mailto:support@offroadperformance.com"
                    className="font-medium text-[#1B9DDB] hover:underline"
                  >
                    support@offroadperformance.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ShippingPage;