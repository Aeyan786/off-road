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
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden h-screen shrink-0 border-r md:flex",
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

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header stays at the top */}
          <AdminHeader userEmail={userEmail} />

          {/* Only this area scrolls */}
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
