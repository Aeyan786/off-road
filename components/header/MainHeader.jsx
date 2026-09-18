import Link from "next/link";
import HeaderStoreActions from "@/components/cart/HeaderStoreActions";
import HeaderSearch from "@/components/header/HeaderSearch";
import MobileMenu from "@/components/header/MobileMenu";
import VendorDropdown from "@/components/header/VendorDropdown";

export default function MainHeader({ categories = [], suppliers = [] }) {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="min-w-0 truncate text-lg font-extrabold tracking-tight text-neutral-900 underline decoration-2 underline-offset-4 sm:text-2xl"
        >
          Off Road Performance
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex w-full max-w-xl items-stretch divide-x rounded-md border border-neutral-300">
            <VendorDropdown suppliers={suppliers} />
            <HeaderSearch />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-8">
          <div className="hidden text-right text-sm leading-tight text-neutral-700 xl:block">
            <p className="font-semibold">0000 -1234 56789</p>
            <p>info@example.com</p>
          </div>

          <HeaderStoreActions />
          <MobileMenu categories={categories} suppliers={suppliers} />
        </div>
      </div>

      {/* Below lg the search gets its own full-width row. */}
      <div className="px-4 pb-3 sm:px-6 lg:hidden">
        <div className="flex items-stretch rounded-md border border-neutral-300">
          <HeaderSearch />
        </div>
      </div>
    </div>
  );
}
