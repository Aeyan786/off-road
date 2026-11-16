"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  X,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/components/social-links";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks! This is a dummy form — no data was actually sent.");
  };

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Call",
      detail: "07984 720499",
      subDetail: "",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Mail",
      detail: "support@offroadperformance.com",
      subDetail: "Our support team will get back to you ASAP",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Visit us",
      detail: "CH66",
      subDetail: "Appointment only",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business hours",
      detail: "Mon – Fri: 9am – 5pm",
      detail2: "Weekends – closed ",
      subDetail:
        "We usually respond to WhatsApp messages and Mail outside of working hours",
    },
  ];

  return (
    <div className="w-full bg-white text-neutral-900">
      {/* HERO */}
      <section className="border-b border-neutral-100 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Let's talk parts.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500">
            Do you have questions about your order, parts fitment or your build?
            Our team of specialists are ready to assist.
          </p>
        </div>
      </section>

      {/* CONTACT INFO STRIP */}
      <section className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-neutral-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {contactInfo.map((info) => (
            <div key={info.title} className="py-8 sm:px-8 sm:py-10">
              <div className="text-[#1B9DDB]">{info.icon}</div>
              <p className="mt-4 text-xs font-semibold  tracking-widest text-neutral-400">
                {info.title}
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                {info.detail}
              </p>
              {info.detail2 && (
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {info.detail2}
                </p>
              )}
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
            <span className="text-sm font-semibold  tracking-widest text-[#1B9DDB]">
              Send your message
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Tell us about your build.
            </h2>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold  tracking-widest text-neutral-500"
                  >
                    Full name
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
                    className="mb-2 block text-xs font-semibold  tracking-widest text-neutral-500"
                  >
                    Mail
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
                    className="mb-2 block text-xs font-semibold  tracking-widest text-neutral-500"
                  >
                    Number
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
                    className="mb-2 block text-xs font-semibold  tracking-widest text-neutral-500"
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
                    <option value="order">Order support</option>
                    <option value="fitment">Fitment question</option>
                    <option value="returns">Returns</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-semibold  tracking-widest text-neutral-500"
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
                  placeholder="Type your message here..."
                  className="w-full resize-none border-b border-neutral-300 bg-transparent py-2.5 text-sm outline-none transition focus:border-[#1B9DDB]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-[#1B9DDB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1685bb]"
              >
                Support 
              </button>
            </form>
          </div>

          {/* ADDRESS / SOCIAL SIDE */}
          <div className="lg:col-span-5 lg:pl-6">
            <div className="border-t border-neutral-900 pt-8">
              <p className="text-xs font-semibold  tracking-widest text-neutral-400">
                Our location
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900">
                CH66
                <br />
                Appointment only
              </p>
            </div>

            <div className="mt-10 border-t border-neutral-100 pt-8">
              <p className="text-xs font-semibold  tracking-widest text-neutral-400">
                Socials
              </p>
              <div className="mt-4 flex gap-4">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-[#1B9DDB] hover:text-[#1B9DDB]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-neutral-100 pt-8">
              <p className="text-xs font-semibold  tracking-widest text-neutral-400">
                Responding to messages
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Most enquiries are answered within 24 hours, if you have an
                issue, calling or WhatsApp messaging us directly is fastest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
