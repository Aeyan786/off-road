"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { ADMIN_NAV_LINKS } from "@/components/admin/nav-links";
import { cn } from "@/lib/utils";

export default function Sidebar({ onNavigate, className }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
        <Wrench className="size-5 text-brand" />
        <span className="font-bold text-neutral-900">Off Road Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
