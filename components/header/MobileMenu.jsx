"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, Menu, Smartphone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/components/social-links";
import { NAV_LINKS } from "@/components/header/nav-links";
import { cn } from "@/lib/utils";

const ROW_CLASS =
  "block rounded-md px-2 py-2.5 text-neutral-800 hover:bg-neutral-100";

/** Collapsible menu row — native <details>, so it's keyboard accessible for free. */
function Section({ label, children }) {
  return (
    <details className="group">
      <summary
        className={cn(
          ROW_CLASS,
          "flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden"
        )}
      >
        {label}
        <ChevronDown className="size-4 text-neutral-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <ul className="mb-2 ml-2 space-y-0.5 border-l border-neutral-200 pl-3">
        {children}
      </ul>
    </details>
  );
}

/**
 * Below lg the navbar collapses into this slide-over. It mirrors the
 * desktop navbar: the same links, with the vendor dropdown as an
 * expandable section. Search stays visible in the header itself.
 */
export default function MobileMenu({ suppliers = [] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2 shrink-0 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-[85vw] max-w-80 flex-col gap-0 p-0">
       

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          <ul className="flex flex-col gap-1 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} onClick={close} className={ROW_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}

            {suppliers.length > 0 ? (
              <li>
                <Section label="Vendors">
                  <li>
                    <Link
                      href="/products"
                      onClick={close}
                      className="block rounded-md px-2 py-2 text-sm font-semibold text-brand hover:bg-neutral-100"
                    >
                      All vendors
                    </Link>
                  </li>
                  {suppliers.map((supplier) => (
                    <li key={supplier}>
                      <Link
                        href={`/products?${new URLSearchParams({ supplier })}`}
                        onClick={close}
                        className="block rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-brand"
                      >
                        {supplier}
                      </Link>
                    </li>
                  ))}
                </Section>
              </li>
            ) : null}
          </ul>

          <Link
            href="/contact"
            onClick={close}
            className="rounded-sm bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand/90"
          >
            Support
          </Link>

          <div className="space-y-1 text-sm text-neutral-700">
            <p className="flex items-center gap-1.5 font-semibold">
              <Smartphone className="size-3.5 shrink-0 text-brand" />
              07984 720499
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0 text-brand" />
              support@offroadperformance.com
            </p>
          </div>

          <div className="mt-auto flex items-center gap-4 border-t pt-5">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="cursor-pointer text-neutral-700 hover:text-brand"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
