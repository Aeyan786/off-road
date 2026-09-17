'use client'

import React, { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  XIcon,
} from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";

const page = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const SOCIALS = [
    { label: "X", Icon: XIcon , link:"/" },
    { label: "Facebook", Icon: FacebookIcon , link:"/" },
    { label: "Instagram", Icon: InstagramIcon , link:"/" },
    { label: "YouTube", Icon: YoutubeIcon , link:"/" },
  ];

  const handleChange = (
    e
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thanks! This is a dummy form — no data was actually sent.')
  }

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Call Us',
      detail: '1-800-555-0199',
      subDetail: 'Mon–Fri, 8am–8pm EST',
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Us',
      detail: 'support@offroadperformance.com',
      subDetail: 'We reply within 24 hours',
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit Us',
      detail: '1245 Trailhead Ave, Denver, CO',
      subDetail: 'Warehouse & Pickup Center',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      detail: 'Mon – Sat: 8am – 8pm',
      subDetail: 'Sunday: 10am – 4pm',
    },
  ]

  const faqs = [
    {
      question: 'How do I know if a part fits my vehicle?',
      answer:
        'Use our Year/Make/Model search tool on any product page — it filters out parts that won\'t fit your specific vehicle.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day hassle-free return policy on all unused parts in original packaging.',
    },
    {
      question: 'Do you ship internationally?',
      answer:
        'Currently we only ship within the UK, with plans to expand soon.',
    },
    {
      question: 'How fast is shipping?',
      answer:
        'Most orders ship within 24 hours and arrive within 2-5 business days depending on location.',
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1B9DDB] py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-white">
            Get In Touch
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
            We're Here to Help
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Questions about fitment, orders, or your build? Our team of
            gearheads is ready to assist.
          </p>
        </div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="mx-auto max-w-6xl px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((info) => (
            <div
              key={info.title}
              className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 transition hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B9DDB]/10 text-[#1B9DDB]">
                {info.icon}
              </div>
              <h3 className="mt-4 font-bold text-gray-900">{info.title}</h3>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {info.detail}
              </p>
              <p className="mt-1 text-xs text-gray-500">{info.subDetail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORM + MAP SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* FORM */}
          <div className="lg:col-span-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
              Send a Message
            </span>
            <h2 className="mt-2 text-3xl font-bold">Let's Talk Parts</h2>
            <p className="mt-3 text-gray-600">
              Fill out the form below and our support team will get back to
              you shortly.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#1B9DDB] focus:ring-2 focus:ring-[#1B9DDB]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#1B9DDB] focus:ring-2 focus:ring-[#1B9DDB]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#1B9DDB] focus:ring-2 focus:ring-[#1B9DDB]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#1B9DDB] focus:ring-2 focus:ring-[#1B9DDB]/20"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Support</option>
                    <option value="fitment">Fitment Question</option>
                    <option value="returns">Returns & Warranty</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your vehicle, part number, or question..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#1B9DDB] focus:ring-2 focus:ring-[#1B9DDB]/20"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B9DDB] px-8 py-4 font-semibold text-white transition hover:bg-[#1685bb] sm:w-auto"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* SIDE INFO / MAP */}
          <div className="lg:col-span-2">
           

          

            {/* SOCIAL LINKS */}
            <div className="mt-6 rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900">Follow Us</h3>
              <p className="mt-1 text-sm text-gray-600">
                Stay updated on new arrivals & deals
              </p>
              <div className="mt-4 flex gap-3">
                {SOCIALS.map((e, i) => (
                  <a
                    key={i}
                    href={e.link}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B9DDB]/10 text-[#1B9DDB] transition hover:bg-[#1B9DDB] hover:text-white"
                  >
                    <e.Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#1B9DDB]">
              FAQs
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <h3 className="font-bold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default page