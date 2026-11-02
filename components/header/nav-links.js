export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products", hasCategoryMenu: true },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Blog", href: "/blogs" },
  { label: "Service", href: "/service" },
  { label: "About", href: "/about" },
];

/**
 * Main categories listed under Shop in the navbar menus. Only top-level
 * categories are shown there — subcategories are browsed from the shop
 * page's filters. Shared by the desktop dropdown and the mobile slide-over
 * so they always show the same thing.
 */
export const MAX_NAV_CATEGORIES = 10;
