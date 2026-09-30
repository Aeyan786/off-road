import { X as XIcon } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/SocialIcons";

/**
 * The store's social profiles — the single list used by the navbar, mobile
 * menu, footer and contact page, so they can never drift apart.
 *
 * Only profiles with a real URL belong here: a social icon that links
 * nowhere is worse than no icon. YouTube was removed for that reason — add
 * it back (with `YoutubeIcon` from @/components/icons/SocialIcons) once
 * there's a channel to point at.
 */
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/ORPstores", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/orpstores/", Icon: InstagramIcon },
  { label: "X", href: "https://x.com/ORPstores", Icon: XIcon },
];
