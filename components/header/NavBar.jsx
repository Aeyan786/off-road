import Link from "next/link";
import { X as XIcon } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { NAV_LINKS } from "@/components/header/nav-links";
import ShopMenu from "@/components/header/ShopMenu";

const SOCIALS = [
  { label: "X", Icon: XIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YoutubeIcon },
];

export default function NavBar({ categories = [] }) {
  return (
    <nav className="hidden bg-brand text-white lg:block">
      {/* relative: the Shop mega-menu positions itself against this container
          so it spans the full navbar width. */}
      <div className="relative mx-auto flex max-w-[1400px] items-center justify-between px-6">
        <ul className="flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map((link) =>
            link.hasCategoryMenu ? (
              <ShopMenu key={link.label} link={link} categories={categories} />
            ) : (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group relative inline-block cursor-pointer py-3.5 text-white"
                >
                  {link.label}

                  <span className="absolute bottom-2 left-0 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ label, Icon }) => (
              <Link
                key={label}
                href="/"
                aria-label={label}
                className="text-white/90 hover:text-white"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            className="rounded-sm bg-white px-4 py-1.5 text-sm font-semibold text-brand hover:bg-white/90"
          >
            Make an Inquiry
          </Link>
        </div>
      </div>
    </nav>
  );
}
