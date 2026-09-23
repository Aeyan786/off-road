import React from 'react'
import { Cookie, Settings, ShieldCheck, Mail, MousePointerClick } from 'lucide-react'

export const metadata = {
  title: "Cookie Policy",
  description: "The cookies we use and how to control them.",
};

const CookiesPage = () => {
  const sections = [
    { id: 'cookies-we-use', title: 'Cookies We Use' },
    { id: 'managing-cookies', title: 'Managing Cookies' },
    { id: 'your-consent', title: 'Your Consent' },
  ]

  const cookieTypes = [
    {
      title: 'Essential Cookies',
      description:
        'These cookies are necessary for the website to function properly, allowing you to browse products, add items to your cart, and complete purchases.',
    },
    {
      title: 'Performance Cookies',
      description:
        'These cookies help us analyse how visitors use our site, so we can improve layout, speed, and usability.',
    },
    {
      title: 'Functional Cookies',
      description:
        'These cookies remember your preferences, such as language settings or login details, to provide a smoother browsing experience.',
    },
    {
      title: 'Marketing Cookies',
      description:
        'These cookies help us deliver relevant advertisements and promotions based on your interests.',
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
        
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-white/90">
            At Off Road Performance (ORP) we value your privacy and want to
            make your shopping experience smooth and secure.
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
              Cookies are small text files stored on your device when you
              visit our website. They help us understand how you use our
              site, improve performance, and provide a personalized
              experience tailored to your preferences.
            </p>

            {/* COOKIES WE USE */}
            <div id="cookies-we-use" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Cookies We Use
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We use different types of cookies on our website.
              </p>

              <div className="mt-6 space-y-5 border-l-2 border-[#1B9DDB]/20 pl-6">
                {cookieTypes.map((cookie) => (
                  <div key={cookie.title}>
                    <p className="font-semibold text-gray-800">
                      {cookie.title}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {cookie.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* MANAGING COOKIES */}
            <div id="managing-cookies" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Managing Cookies
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                You can manage or disable cookies through your browser
                settings.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#1B9DDB]/5 p-4">
                <Settings className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  Please note that turning off certain cookies may affect the
                  functionality of the website, including your ability to
                  make purchases or access certain features.
                </p>
              </div>
            </div>

            {/* YOUR CONSENT */}
            <div id="your-consent" className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Consent
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                By using our website, you consent to the use of cookies as
                described in this policy. We are committed to protecting
                your personal information and providing transparency about
                how it is used.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B9DDB]" />
                <p className="text-sm text-gray-700">
                  You can update your cookie preferences at any time through
                  your browser or by clicking the cookie settings icon at the
                  bottom of any page.
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
                  Questions about our use of cookies?
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

export default CookiesPage;