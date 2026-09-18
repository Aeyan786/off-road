import React from 'react'
import { FileText, Mail } from 'lucide-react'

const page = () => {
  const lastUpdated = 'January 15, 2025'

  const sections = [
    { id: 'agreement', title: 'Your Agreement With Us' },
    { id: 'account', title: 'Account Responsibilities' },
    { id: 'age-requirement', title: 'Age Requirement' },
    { id: 'our-rights', title: 'Our Rights' },
    { id: 'website-use', title: 'Website Use & Conduct' },
    { id: 'user-content', title: 'User Content' },
    { id: 'content-rights', title: 'Content Rights' },
    { id: 'copyright', title: 'Copyright' },
    { id: 'trademarks', title: 'Trademarks' },
    { id: 'product-descriptions', title: 'Product Descriptions' },
    { id: 'risk-of-loss', title: 'Risk of Loss' },
    { id: 'disclaimers', title: 'Disclaimers & Limitation of Liability' },
    { id: 'applicable-law', title: 'Applicable Law' },
    { id: 'disputes', title: 'Disputes' },
    { id: 'policy-changes', title: 'Policy Changes' },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
      
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-white/90">
            Welcome to Off Road Performance (ORP)
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
            <div className="sticky top-44 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
              By accessing or using our website and purchasing products from
              us, you agree to be bound by the following terms and
              conditions. Please read them carefully.
            </p>

            {/* AGREEMENT */}
            <div id="agreement" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Agreement With Us
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                These Terms of Service ("Terms") govern your use of our
                website and services. When you use our site, you are
                communicating with us electronically, and you consent to
                receive communications from us electronically (such as
                emails or notices on the site).
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Please also review our Privacy Policy and Return & Refund
                Policy, as they are part of your agreement with us.
              </p>
            </div>

            {/* ACCOUNT RESPONSIBILITIES */}
            <div id="account" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Account Responsibilities
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of
                your account and password and for restricting access to your
                computer. You agree to accept full responsibility for all
                activities that occur under your account.
              </p>
            </div>

            {/* AGE REQUIREMENT */}
            <div id="age-requirement" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Age Requirement
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                If you are under 18 years of age, you may only use this
                website with the involvement and consent of a parent or
                guardian.
              </p>
            </div>

            {/* OUR RIGHTS */}
            <div id="our-rights" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Our Rights</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We reserve the right to refuse service, terminate accounts,
                remove or edit content, or cancel orders at our sole
                discretion.
              </p>
            </div>

            {/* WEBSITE USE */}
            <div id="website-use" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Website Use & Conduct
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Off Road Performance ('ORP') grants you a limited license to
                access and make personal use of this site. This license does
                not include any right to resell or commercially use our site
                or its contents, download or copy account information for
                another merchant, or use data mining, robots, or similar
                data gathering tools.
              </p>
            </div>

            {/* USER CONTENT */}
            <div id="user-content" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                User Content
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                (Reviews, comments, etc.): You may post reviews, comments,
                and other content if it is not illegal, obscene, threatening,
                defamatory, infringing on intellectual property rights, or
                otherwise harmful. You may not use a false email address or
                impersonate any person or entity.
              </p>
            </div>

            {/* CONTENT RIGHTS */}
            <div id="content-rights" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Content Rights
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                By posting content on our site, you grant Off Road
                Performance ('ORP') a nonexclusive, royalty-free, perpetual
                right to use, reproduce, modify, and display such content in
                any media. You confirm that you own the rights to the
                content you post and that it is accurate.
              </p>
            </div>

            {/* COPYRIGHT */}
            <div id="copyright" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Copyright</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                All content on this site including text, graphics, logos,
                images, and software is the property of Off Road Performance
                ('ORP') or its content suppliers and is protected by United
                Kingdom and international copyright laws.
              </p>
            </div>

            {/* TRADEMARKS */}
            <div id="trademarks" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Trademarks
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                The 'Off Road Performance' and 'ORP' names and logos are
                trademarks of © Off Road Performance 'ORP' - 2026 All Rights
                Reserved.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                They may not be used in connection with any product or
                service that is not ours, in any manner that is likely to
                cause confusion, or in any way that disparages or discredits
                us. All other trademarks on this site are the property of
                their respective owners.
              </p>
            </div>

            {/* PRODUCT DESCRIPTIONS */}
            <div id="product-descriptions" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Product Descriptions
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We strive to be as accurate as possible. However, we do not
                warrant that product descriptions or other site content are
                accurate, complete, reliable, or error-free. If a product
                you receive is not as described, your sole remedy is to
                return it in an unused condition according to our Return
                Policy.
              </p>
            </div>

            {/* RISK OF LOSS */}
            <div id="risk-of-loss" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Risk of Loss
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                All items purchased from Off Road Performance ('ORP') are
                made pursuant to a shipment contract. This means that the
                risk of loss and title for such items pass to you upon our
                delivery of the package to the shipping carrier.
              </p>
            </div>

            {/* DISCLAIMERS */}
            <div id="disclaimers" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Disclaimers & Limitation of Liability
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                This site and all information, content and products included
                on it are provided by Off Road Performance ('ORP') on an "AS
                IS" and "AS AVAILABLE" basis.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                You expressly agree that your use of this site is at your
                sole risk. To the fullest extent permissible by law, Off
                Road Performance ('ORP') disclaims all warranties, express
                or implied.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Off Road Performance ('ORP') will not be liable for any
                damages of any kind arising from the use of this site or
                from any products purchased from this site, including but
                not limited to direct, indirect or incidental punitive and
                consequential damages.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Some laws may not allow for limitations on implied
                warranties or the exclusion of certain damages. If these
                laws apply to you, some of the above disclaimers may not
                apply, and you may have additional rights.
              </p>
            </div>

            {/* APPLICABLE LAW */}
            <div id="applicable-law" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Applicable Law
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                By visiting our website, you agree that the laws of the
                United Kingdom will govern these "Terms of Service" and any
                dispute that might arise between you and Off Road
                Performance ('ORP').
              </p>
            </div>

            {/* DISPUTES */}
            <div id="disputes" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">Disputes</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Any dispute relating to your visit or to products you
                purchase shall be submitted to confidential arbitration in
                the United Kingdom. However, if you have violated or
                threatened our intellectual property rights, we may seek an
                injunction or other appropriate relief in the civil courts.
              </p>
            </div>

            {/* POLICY CHANGES */}
            <div id="policy-changes" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Policy Changes
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We reserve the right to make changes to our site, our
                policies, and these Terms of Service at any time. If any of
                these conditions are deemed invalid or unenforceable, that
                condition shall be considered severable and will not affect
                the validity of any remaining conditions.
              </p>
            </div>

            {/* CONTACT CALLOUT */}
            <div className="mt-16 flex flex-col items-start gap-4 rounded-xl bg-[#1B9DDB]/5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1B9DDB]">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Questions about our Terms of Service?
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Please get in touch with our support staff through our{' '}
                  <a
                    href="/contact"
                    className="font-medium text-[#1B9DDB] hover:underline"
                  >
                    Support page
                  </a>
                  .
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