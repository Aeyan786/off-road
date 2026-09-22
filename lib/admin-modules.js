/**
 * Which admin module each route belongs to. The single source of truth for
 * permission checks in proxy.js (pages + /api/admin), requireAdmin() (server
 * actions) and the sidebar. Module keys match the `admin_modules` table
 * (0007_suppliers_admin_users.sql).
 *
 *   superOnly — only super admins (user management)
 *   open      — every admin user (their own account settings)
 *
 * Order matters: the first matching prefix wins, and `firstAllowedPath`
 * uses this order to pick where to send someone after login.
 */
export const ADMIN_ROUTES = [
  { key: "dashboard", path: "/admin", exact: true },
  { key: "products", path: "/admin/products", api: "/api/admin/products" },
  { key: "categories", path: "/admin/categories" },
  { key: "suppliers", path: "/admin/suppliers" },
  { key: "media", path: "/admin/media" },
  { key: "orders", path: "/admin/orders" },
  { key: "customers", path: "/admin/customers" },
  { key: "blogs", path: "/admin/blogs" },
  { key: "reports", path: "/admin/reports" },
  { key: "users", path: "/admin/users", superOnly: true },
  { key: "settings", path: "/admin/settings", open: true },
];

const matches = (pathname, base, exact) =>
  exact ? pathname === base : pathname === base || pathname.startsWith(`${base}/`);

/** The route entry a pathname belongs to, or null if none matches. */
export function routeForPath(pathname) {
  return (
    ADMIN_ROUTES.find(
      (route) =>
        matches(pathname, route.path, route.exact) ||
        (route.api && matches(pathname, route.api, false))
    ) ?? null
  );
}

/**
 * @param {{isSuperAdmin: boolean, modules: string[]}|null} access
 * @param {string} key module key
 */
export function canAccessModule(access, key) {
  if (!access) return false;
  if (access.isSuperAdmin) return true;
  const route = ADMIN_ROUTES.find((r) => r.key === key);
  if (route?.superOnly) return false;
  if (route?.open) return true;
  return access.modules.includes(key);
}

/** True when `access` may use at least one of `keys`. */
export function canAccessAny(access, keys) {
  return [].concat(keys).some((key) => canAccessModule(access, key));
}

/**
 * Whether `access` may open `pathname`. Unknown admin paths are super-admin
 * only, so a new page is never accidentally open to every staff user.
 */
export function canAccessPath(access, pathname) {
  const route = routeForPath(pathname);
  if (!route) return Boolean(access?.isSuperAdmin);
  return canAccessModule(access, route.key);
}

/** Where to send a user who can't open the page they asked for. */
export function firstAllowedPath(access) {
  const route = ADMIN_ROUTES.find((r) => canAccessModule(access, r.key));
  return route?.path ?? "/admin/settings";
}
