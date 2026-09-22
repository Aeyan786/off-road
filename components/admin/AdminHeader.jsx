"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, LogOut, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "@/components/admin/Sidebar";
import { logout } from "@/actions/auth";

export default function AdminHeader({ userEmail, access = null }) {
  const [open, setOpen] = useState(false);
  const displayName = access?.fullName || userEmail;
  const initial = displayName?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden cursor-pointer rounded-sm"
          aria-label="Open sidebar"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <span className="font-semibold text-neutral-900">Admin</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex cursor-pointer hover:bg-muted px-4 py-2 items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-brand text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <ArrowDown className="h-4 w-4 text-gray-800"/>
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>

          <DropdownMenuLabel className="max-w-64 space-y-0.5">
            <span className="block truncate">{displayName ?? "Signed in"}</span>
            {access?.fullName && userEmail ? (
              <span className="block truncate text-xs font-normal text-muted-foreground">{userEmail}</span>
            ) : null}
            <span className="block text-xs font-normal text-muted-foreground">
              {access?.isSuperAdmin ? "Super admin" : "Staff"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/admin/settings" />} className="gap-2 cursor-pointer">
            <Settings className="size-4" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => logout()} className="gap-2 cursor-pointer">
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <Sidebar access={access} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
