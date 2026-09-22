"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  Plus,
  Minus,
  X,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { XIcon } from "lucide-react";

const page = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState(0);

  const SOCIALS = [
    { label: "X", Icon: XIcon, link: "/" },
    { label: "Facebook", Icon: FacebookIcon, link: "/" },
    { label: "Instagram", Icon: InstagramIcon, link: "/" },
    { label: "YouTube", Icon: YoutubeIcon, link: "/" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thanks! This is a dummy form — no data was actually sent.");
  };

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Call Us",
      detail: "1-800-555-0199",
      subDetail: "Mon–Fri, 8am–8pm",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Us",
      detail: "support@offroadperformance.com",
      subDetail: "We reply within 24 hours",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Visit Us",
      detail: "59 Hawthorn Road, Little Sutton",
      subDetail: "Ellesmere Port, Cheshire, CH66 1PS",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business Hours",
      detail: "Mon – Sat: 8am – 8pm",
      subDetail: "Sunday: 10am – 4pm",
    },
  ];

  const faqs = [
    {
      question: "How do I know if a part fits my vehicle?",
      answer:
        "Use our Year/Make/Model search tool on any product page — it filters out parts that won't fit your specific vehicle.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day hassle-free return policy on all unused parts in original packaging.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently we only ship within the UK, with plans to expand soon.",
    },
    {
      question: "How fast is shipping?",
      answer:
        "Most orders ship within 24 hours and arrive within 2-5 business days depending on location.",
    },
  ];

  return (
    <div className="w-full bg-white text-neutral-900">
      {/* HERO */}
      <section className="border-b border-neutral-100 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#1B9DDB]">
            Get In Touch
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Let's talk parts.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500">
            Questions about fitment, orders, or your build? Our team of
            gearheads is ready to assist.
          </p>
        </div>
      </section>

      {/* CONTACT INFO STRIP */}
      <section className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-neutral-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {contactInfo.map((info) => (
            <div key={info.title} className="py-8 sm:px-8 sm:py-10">
              <div className="text-[#1B9DDB]">{info.icon}</div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {info.title}
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                {info.detail}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{info.subDetail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORM + ADDRESS SECTION */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 lg:grid-cols-12">
          {/* FORM */}
          <div className="lg:col-span-7">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
              Send a Message
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Tell us about your build.
            </h2>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
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
                    className="w-full border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
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
                    className="w-full border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
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
                    className="w-full border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full cursor-pointer border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
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
                  className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your vehicle, part number, or question..."
                  className="w-full resize-none border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-[#1B9DDB] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#1685bb]"
              >
                Send Message
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* ADDRESS / SOCIAL SIDE */}
          <div className="lg:col-span-5 lg:pl-6">
            <div className="border-t border-neutral-900 pt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Our Location
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900">
                59 Hawthorn Road,
                <br />
                Little Sutton, Ellesmere Port,
                <br />
                Cheshire, CH66 1PS
              </p>
              <a
                href="https://maps.google.com/?q=59+Hawthorn+Road,+Little+Sutton,+Ellesmere+Port,+Cheshire,+CH66+1PS"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B9DDB] hover:underline"
              >
                Get directions
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-10 border-t border-neutral-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Follow Us
              </p>
              <div className="mt-4 flex gap-4">
                {SOCIALS.map((s, i) => (
                  <a
                    key={i}
                    href={s.link}
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-[#1B9DDB] hover:text-[#1B9DDB]"
                  >
                    <s.Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-neutral-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Response Time
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Most enquiries are answered within 24 hours. For urgent fitment
                or order questions, calling us directly is fastest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="border-t border-neutral-100 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#1B9DDB]">
            FAQs
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Frequently asked questions.
          </h2>

          <div className="mt-12 divide-y divide-neutral-200 border-t border-neutral-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center cursor-pointer justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-lg font-semibold text-neutral-900">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-transform duration-300 ${
                        isOpen ? "rotate-0" : ""
                      }`}
                    >
                      {isOpen ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 text-sm leading-relaxed text-neutral-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
