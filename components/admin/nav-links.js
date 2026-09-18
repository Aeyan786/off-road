import { FolderTree, Images, LayoutDashboard, Newspaper, Package } from "lucide-react";

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Products", href: "/admin/products", icon: Package },
  { label: "Manage Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Manage Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "Media Library", href: "/admin/media", icon: Images },
];
