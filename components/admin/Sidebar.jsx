"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { ADMIN_NAV_GROUPS } from "@/components/admin/nav-links";
import { canAccessPath } from "@/lib/admin-modules";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";

export default function Sidebar({
  onNavigate,
  className,
  collapsed = false,
  onToggle,
  access = null,
}) {
  const pathname = usePathname();

  // Only the pages this user may open (same rules proxy.js enforces); a
  // group with nothing left is hidden entirely.
  const navGroups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((link) => canAccessPath(access, link.href)),
  })).filter((group) => group.items.length > 0);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-[#1B9DDB]",
        "transition-[width] duration-400 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          "transition-all duration-300 ease-in-out",
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-6"
        )}
      >
        <Link
          href="/admin"
          className={cn(
            "flex min-w-0 cursor-pointer items-center gap-2 overflow-hidden",
            "transition-all duration-300 ease-in-out",
            collapsed
              ? "w-0 -translate-x-2 opacity-0"
              : "w-auto translate-x-0 opacity-100"
          )}
        >
          <Wrench className="size-5 shrink-0 text-white" />

          <span className="truncate whitespace-nowrap font-bold text-white">
            Off Road Admin
          </span>
        </Link>

        {onToggle ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label={
                    collapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  aria-expanded={!collapsed}
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-neutral-100 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {collapsed ? (
                    <PanelLeftOpen className="size-4" />
                  ) : (
                    <PanelLeftClose className="size-4" />
                  )}
                </button>
              }
            />

            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "mt-2 flex-1 space-y-1 overflow-y-auto py-4",
          "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
          "transition-all duration-300 ease-in-out",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {navGroups.map((group, groupIndex) => (
          <div
            key={group.title ?? `group-${groupIndex}`}
            className={groupIndex !== 0 ? "pt-4" : ""}
          >
            {/* Group Label */}
            {group.title ? (
              collapsed ? (
                <div className="my-3 border-t border-white/20" />
              ) : (
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  {group.title}
                </p>
              )
            ) : null}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((link) => {
                const isActive =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);

                const Icon = link.icon;

                const item = (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    aria-label={collapsed ? link.label : undefined}
                    className={cn(
                      "group flex cursor-pointer items-center rounded-md py-2.5 text-sm font-medium",
                      "transition-all duration-300 ease-in-out",
                      collapsed ? "justify-center px-0" : "gap-3 px-3",
                      isActive
                        ? "bg-white text-black"
                        : "text-white hover:bg-neutral-100 hover:text-neutral-900"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />

                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap",
                        "transition-all duration-300 ease-in-out",
                        collapsed
                          ? "w-0 translate-x-[-8px] opacity-0"
                          : "w-auto translate-x-0 opacity-100"
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                );

                return (
                  <Tooltip key={link.href}>
                    <TooltipTrigger render={item} />

                    <TooltipContent
                      side="right"
                      className={cn(
                        "transition-opacity duration-200",
                        collapsed
                          ? "opacity-100"
                          : "pointer-events-none opacity-0"
                      )}
                    >
                      {link.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 border-t border-white/20 py-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {/* Visit Website */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/"
                target="_blank"
                aria-label={collapsed ? "Visit Website" : undefined}
                className={cn(
                  "flex cursor-pointer items-center rounded-sm py-2.5 text-sm font-medium text-white",
                  "transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900",
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                )}
              >
                <ExternalLink className="size-4 shrink-0" />

                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  Visit Website
                </span>
              </Link>
            }
          />

          {collapsed && (
            <TooltipContent side="right">Visit Website</TooltipContent>
          )}
        </Tooltip>

        {/* Logout */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => logout()}
                aria-label={collapsed ? "Logout" : undefined}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-sm py-2.5 text-sm font-medium text-white",
                  "transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900",
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                )}
              >
                <LogOut className="size-4 shrink-0" />

                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  Logout
                </span>
              </button>
            }
          />

          {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
}