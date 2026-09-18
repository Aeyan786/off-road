import React from 'react'
import { Shield, Lock, FileText, Mail } from 'lucide-react'

const page = () => {
  const lastUpdated = 'January 15, 2025'

  const sections = [
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'how-we-share', title: 'How We Share Your Information' },
    { id: 'data-security', title: 'Data Security' },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
       
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/90">
            Your privacy is important to us at Off Road Performance (ORP)
          </p>
          <p className="mt-2 text-sm text-white/70">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* TABLE OF CONTENTS - STICKY SIDEBAR */}
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
              This privacy policy explains how we collect, use, and protect
              your personal information when you visit our website and use
              our services. We are committed to ensuring your information is
              secure and handled with care.
            </p>

            {/* INFORMATION WE COLLECT */}
            <div id="information-we-collect" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Information We Collect
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                To provide you with the best possible shopping experience, we
                collect information in a few ways:
              </p>

              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Information You Provide to Us
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                This includes any information you enter on our website, such
                as when you create an account, place an order, or contact us.
                This may include:
              </p>

              <div className="mt-5 space-y-4 border-l-2 border-[#1B9DDB]/20 pl-6">
                <div>
                  <p className="font-semibold text-gray-800">
                    Personal details
                  </p>
                  <p className="text-gray-600">
                    Your name, shipping address, and phone number.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Contact information
                  </p>
                  <p className="text-gray-600">Your email address.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Payment information
                  </p>
                  <p className="text-gray-600">Your credit card details.</p>
                </div>
              </div>

              <h3 className="mt-8 text-lg font-semibold text-gray-900">
                Information We Collect Automatically
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                When you browse our website, we automatically receive certain
                types of data, including:
              </p>

              <div className="mt-5 space-y-4 border-l-2 border-[#1B9DDB]/20 pl-6">
                <div>
                  <p className="font-semibold text-gray-800">Cookies</p>
                  <p className="text-gray-600">
                    Like many websites, we use "cookies" to enhance your
                    experience, such as remembering items in your shopping
                    cart.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Technical information
                  </p>
                  <p className="text-gray-600">
                    We may collect your IP address for security and fraud
                    prevention purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* HOW WE USE INFORMATION */}
            <div id="how-we-use" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                How We Use Your Information
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We use the information we gather to:
              </p>

              <div className="mt-5 space-y-4 border-l-2 border-[#1B9DDB]/20 pl-6">
                <div>
                  <p className="font-semibold text-gray-800">
                    Fulfil your orders
                  </p>
                  <p className="text-gray-600">
                    Process payments and ship your products.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Communicate with you
                  </p>
                  <p className="text-gray-600">
                    Send order confirmations, shipping updates, and respond
                    to your inquiries.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Improve our store
                  </p>
                  <p className="text-gray-600">
                    Personalize your shopping experience and make our website
                    better.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Marketing (with your consent)
                  </p>
                  <p className="text-gray-600">
                    If you opt-in, we may send you newsletters about new
                    products, special offers, and other updates.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-gray-600 leading-relaxed">
                You can unsubscribe at any time through your account settings
                or by clicking the "unsubscribe" link in our emails.
              </p>
            </div>

            {/* HOW WE SHARE INFORMATION */}
            <div id="how-we-share" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                How We Share Your Information
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We value your trust and do not sell, distribute, or lease
                your personal information to third parties.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                The only exception is when it is necessary to complete your
                order. For example, we share your address with our shipping
                carriers (like UPS or FedEx) and your payment details with
                our secure payment processor to complete the transaction. We
                only share the minimum information required.
              </p>
            </div>

            {/* DATA SECURITY */}
            <div id="data-security" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Data Security
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We are committed to keeping your information safe.
              </p>

              <div className="mt-5 space-y-4 border-l-2 border-[#1B9DDB]/20 pl-6">
                <div>
                  <p className="font-semibold text-gray-800">Encryption</p>
                  <p className="text-gray-600">
                    We use Secure Sockets Layer (SSL) technology to encrypt
                    your personal information, including your credit card
                    number, as it is transmitted to us.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Payment security
                  </p>
                  <p className="text-gray-600">
                    When confirming an order, we only reveal the last few
                    digits of your credit card number. The full number is
                    transmitted securely to our payment processor for
                    authorization.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT CALLOUT */}
            <div className="mt-16 flex flex-col items-start gap-4 rounded-xl bg-[#1B9DDB]/5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB]">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Have questions about our privacy practices?
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Reach out to our support team at{' '}
                  <a
                    href="mailto:privacy@offroadperformance.com"
                    className="font-medium text-[#1B9DDB] hover:underline"
                  >
                    privacy@offroadperformance.com
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

export default page