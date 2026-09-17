import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Admin breadcrumb trail.
 *
 * @param {{label: string, href?: string}[]} items — the trail *after*
 * "Dashboard", which is always prepended. The last item renders as the
 * current page and should have no href.
 */
export default function Breadcrumbs({ items = [] }) {
  const trail = [{ label: "Dashboard", href: "/admin" }, ...items];

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    render={<Link href={item.href} />}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
