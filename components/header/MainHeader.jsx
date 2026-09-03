import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileMenu from "@/components/header/MobileMenu";
import VendorDropdown from "@/components/header/VendorDropdown";
import { createClient } from "@/lib/supabase/server";
import { getDistinctSuppliers } from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";

export default async function MainHeader() {
  const supabase = await createClient();
  const suppliers = await safeQuery(getDistinctSuppliers(supabase), []);

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-neutral-900 underline decoration-2 underline-offset-4 sm:text-2xl"
        >
          Off Road Performance
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex w-full max-w-xl items-stretch divide-x rounded-md border border-neutral-300">
            <VendorDropdown suppliers={suppliers} />
            <Input
              type="search"
              placeholder="Search"
              className="rounded-none border-none shadow-none focus-visible:ring-0"
            />
            <Button className="gap-1.5 rounded-none rounded-r-[5px] px-5">
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden text-right text-sm leading-tight text-neutral-700 xl:block">
            <p className="font-semibold">0000 -1234 56789</p>
            <p>info@example.com</p>
          </div>
          <Link
            href="/"
            aria-label="Account"
            className="text-neutral-800 hover:text-brand"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/"
            aria-label="Cart"
            className="relative text-neutral-800 hover:text-brand"
          >
            <ShoppingBag className="size-5" />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </div>
  );
}
