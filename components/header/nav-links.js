export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products", hasCategoryMenu: true },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Blog", href: "/blogs" },
  { label: "Service", href: "/service" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/contact" },
];

/**
 * Subcategories listed under a main category in the navbar menus before a
 * "View All" link takes over. Shared by the desktop mega menu and the
 * mobile slide-over so they always show the same thing.
 */
export const MAX_NAV_SUBCATEGORIES = 6;
