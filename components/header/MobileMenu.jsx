"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X as XIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { NAV_LINKS } from "@/components/header/nav-links";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { label: "X", Icon: XIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YoutubeIcon },
];

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

/** Category and its children at any depth, indented per level. */
function CategoryItems({ categories, onNavigate, depth = 0 }) {
  return categories.map((category) => (
    <li key={category.id}>
      <Link
        href={`/products?category=${category.slug}`}
        onClick={onNavigate}
        className={cn(
          "block rounded-md px-2 py-2 text-sm hover:bg-neutral-100 hover:text-brand",
          depth === 0 ? "font-semibold text-neutral-900" : "text-neutral-600"
        )}
        style={depth > 0 ? { paddingLeft: `${0.5 + depth * 0.75}rem` } : undefined}
      >
        {category.name}
      </Link>
      {category.children?.length > 0 ? (
        <ul>
          <CategoryItems
            categories={category.children}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        </ul>
      ) : null}
    </li>
  ));
}

/**
 * Below lg the navbar collapses into this slide-over. It mirrors the
 * desktop navbar: the Shop mega-menu and the vendor dropdown become
 * expandable sections. Search stays visible in the header itself.
 */
export default function MobileMenu({ categories = [], suppliers = [] }) {
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
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="text-lg font-bold underline decoration-2 underline-offset-4">
            Off Road Performance
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          <ul className="flex flex-col gap-1 text-sm font-medium">
            {NAV_LINKS.map((link) =>
              link.hasCategoryMenu && categories.length > 0 ? (
                <li key={link.label}>
                  <Section label={link.label}>
                    <li>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="block rounded-md px-2 py-2 text-sm font-semibold text-brand hover:bg-neutral-100"
                      >
                        All Products
                      </Link>
                    </li>
                    <CategoryItems categories={categories} onNavigate={close} />
                  </Section>
                </li>
              ) : (
                <li key={link.label}>
                  <Link href={link.href} onClick={close} className={ROW_CLASS}>
                    {link.label}
                  </Link>
                </li>
              )
            )}

            {suppliers.length > 0 ? (
              <li>
                <Section label="Vendors">
                  <li>
                    <Link
                      href="/products"
                      onClick={close}
                      className="block rounded-md px-2 py-2 text-sm font-semibold text-brand hover:bg-neutral-100"
                    >
                      All Vendors
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
            href="/"
            onClick={close}
            className="rounded-sm bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand/90"
          >
            Appointments
          </Link>

          <div className="space-y-1 text-sm text-neutral-700">
            <p className="font-semibold">0000 -1234 56789</p>
            <p>info@example.com</p>
          </div>

          <div className="mt-auto flex items-center gap-4 border-t pt-5">
            {SOCIALS.map(({ label, Icon }) => (
              <Link
                key={label}
                href="/"
                aria-label={label}
                className="text-neutral-700 hover:text-brand"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
