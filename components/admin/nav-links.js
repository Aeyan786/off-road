import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Truck,
  Warehouse,
  Settings2,
  Star,
  Images,
  ShoppingCart,
  Users,
  Percent,
  Newspaper,
  FileText,
  Home,
  Navigation,
  TrendingUp,
  BarChart3,
  ClipboardList,
  UserCog,
  Settings,
  Mail,
  ChartNoAxesCombined,
  StarPlus,
} from "lucide-react";

export const ADMIN_NAV_GROUPS = [
  {
    title: null,
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products Management", href: "/admin/products", icon: Package },
      { label: "Categories Management", href: "/admin/categories", icon: FolderTree },
      { label: "Suppliers Management", href: "/admin/suppliers", icon: Tag },
      { label: "Media Library", href: "/admin/media", icon: Images },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders Management", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers Management", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blogs / Articles", href: "/admin/blogs", icon: Newspaper },
      { label: "Email Templates", href: "/admin/templates", icon: Mail },
      { label: "Product Reviews", href: "/admin/reviews", icon: StarPlus },
    ],
  },
  {
    title: "Reporting",
    items: [
      {
        label: "Sales Reports",
        href: "/admin/reports/sales",
        icon: TrendingUp,
      },
      {
        label: "Inventory Reports",
        href: "/admin/reports/inventory",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Admin Users", href: "/admin/users", icon: UserCog },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];