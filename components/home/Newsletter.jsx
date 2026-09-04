"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
  function handleSubmit(event) {
    event.preventDefault();
    toast.success("Thanks for subscribing!");
    event.currentTarget.reset();
  }

  return (
    <section className="bg-neutral-100">
      <div className="mx-auto max-w-[1400px] px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Subscribe Our News Letter And Get Exclusive Offers
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
          Find the right car parts with confidence, designed to deliver reliable performance, lasting durability, and excellent value for every vehicle.

        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md items-stretch gap-0 overflow-hidden rounded-md"
        >
          <Input
            type="email"
            required
            placeholder="Your email address"
            className="rounded-none border-neutral-300 bg-white focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="gap-1.5 rounded-none bg-neutral-900 px-5 hover:bg-neutral-800"
          >
            Subscribe
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}
