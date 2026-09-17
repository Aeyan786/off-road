"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";

export const SIDEBAR_COOKIE = "admin-sidebar-collapsed";

export default function AdminShell({
  userEmail,
  defaultCollapsed = false,
  children,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleCollapsed() {
    const next = !collapsed;

    setCollapsed(next);

    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <TooltipProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-neutral-50">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden h-dvh shrink-0 overflow-hidden border-r md:flex",
            "transition-[width] duration-300 ease-in-out",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <Sidebar
            className="h-full w-full"
            collapsed={collapsed}
            onToggle={toggleCollapsed}
          />
        </aside>

        {/* Right side */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="shrink-0">
            <AdminHeader userEmail={userEmail} />
          </div>

          {/* ONLY scrollbar in the admin shell */}
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}