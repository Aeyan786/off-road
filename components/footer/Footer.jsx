import Link from "next/link";
import { Mail, MapPin, Phone, Wrench, X as XIcon } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import Image from "next/image";

const LINK_COLUMNS = [
  {
    heading: "Shop",
    links: ["Home", "Products", "Collections", "Sale", "Blog"],
  },
  {
    heading: "Support",
    links: ["Privacy", "Terms", "Help", "FAQ", "Contact"],
  },
  {
    heading: "Locations",
links: ["London", "Manchester", "Birmingham", "Glasgow", "Edinburgh"],  },
];

const SOCIALS = [
  { label: "X", Icon: XIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YoutubeIcon },
];

const image = [
  "/foot1.webp",
  "/foot2.webp",
  "/foot3.avif",
  "/foot4.avif",
  "/foot5.webp",
  "/foot6.avif",
];

export default function Footer() {
  return (
    <footer>
      <div className="bg-brand text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 divide-y divide-white/20 px-6 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-center gap-3 py-4 sm:py-0">
            <Mail className="size-5 shrink-0" />
            <div className="text-sm leading-tight">
              <p>info@example.com</p>
              <p>support@example.com</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 sm:py-0">
            <Phone className="size-5 shrink-0" />
            <div className="text-sm leading-tight">
              <p>000 - 123 - 456789</p>
              <p>00 - 123 - 456789</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 sm:py-0">
            <MapPin className="size-5 shrink-0" />
            <p className="text-sm leading-tight">
              58A Sauchiehall Street, <br />
              Street, Glasgow, Scotland
            </p>
          </div>
        </div>
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-[1.1fr_1.6fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold"
            >
              <Wrench className="size-6 text-brand" />
              Off Road<span className="text-brand"> Performance</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Quality auto and ATV parts backed by a team that knows off-road
              performance inside and out.
            </p>
            <div className="mt-6">
              <p className="text-sm font-medium text-white/80">Follow Us:</p>
              <div className="mt-3 flex items-center gap-4">
                {SOCIALS.map(({ label, Icon }) => (
                  <Link
                    key={label}
                    href="/"
                    aria-label={label}
                    className="text-white/70 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_COLUMNS.map((col) => (
              <div key={col.heading}>
                <ul className="space-y-3 text-sm text-white/70">
                  {col.links.map((label) => (
                    <li key={label}>
                      <Link href="/" className="hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {image.map((e, i) => (
              <Image key={i} src={e} height={100} width={100} alt="image" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-6 py-3 text-xs sm:flex-row sm:justify-between">
          <p>All Right Reserved &copy; 2025 Design Concept By Vebryx Ltd.</p>
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ label, Icon }) => (
              <Link
                key={label}
                href="/"
                aria-label={label}
                className="text-white/90 hover:text-white"
              >
                <Icon className="size-3.5" />
              </Link>
            ))}
          </div>
          <p>We Accept</p>
        </div>
      </div>
    </footer>
  );
}
