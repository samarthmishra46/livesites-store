"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { primaryNav } from "@/data/site";
import { cn } from "@/lib/utils";

function isActive(href: string, pathname: string, collection: string | null) {
  const [path, query] = href.split("?");
  if (query) return pathname === path && collection === new URLSearchParams(query).get("collection");
  if (path === "/shop") return pathname.startsWith("/shop") && !collection;
  return pathname === path;
}

export function DesktopNav() {
  const pathname = usePathname();
  const collection = useSearchParams().get("collection");

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-9">
        {primaryNav.map((item) => {
          const active = isActive(item.href, pathname, collection);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[14px] tracking-[0.01em] transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-300 after:ease-soft",
                  active ? "text-ink after:scale-x-100" : "text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
