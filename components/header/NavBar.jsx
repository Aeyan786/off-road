import Link from "next/link";
import { X as XIcon } from "lucide-react";
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

export default function NavBar() {
  return (
    <nav className="hidden bg-brand text-white lg:block">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
        <ul className="flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="inline-block py-3.5 text-white/95 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
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
            href="/"
            className="rounded-sm bg-white px-4 py-1.5 text-sm font-semibold text-brand hover:bg-white/90"
          >
            Appointments
          </Link>
        </div>
      </div>
    </nav>
  );
}
