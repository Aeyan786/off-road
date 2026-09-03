"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X as XIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { NAV_LINKS } from "@/components/header/nav-links";

const SOCIALS = [
  { label: "X", Icon: XIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YoutubeIcon },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="text-lg font-bold underline decoration-2 underline-offset-4">
            Off Road Performance
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          <div className="flex items-stretch divide-x rounded-md border border-neutral-300">
            <Input
              type="search"
              placeholder="Search"
              className="rounded-none border-none shadow-none focus-visible:ring-0"
            />
            <Button
              size="icon"
              className="shrink-0 rounded-none rounded-r-[5px]"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Button>
          </div>

          <ul className="flex flex-col gap-1 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-neutral-800 hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-sm bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand/90"
          >
            Appointments
          </Link>

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
