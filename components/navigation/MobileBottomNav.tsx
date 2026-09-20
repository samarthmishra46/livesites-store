"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, Search, User, type LucideIcon } from "lucide-react";
import { HomeSolidIcon } from "@/components/ui/icons";
import { useWishlist } from "@/lib/store/shop";
import { cn } from "@/lib/utils";

const items: { label: string; href: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { label: "Home", href: "/", icon: House, match: (p) => p === "/" },
  { label: "Shop", href: "/shop", icon: Search, match: (p) => p.startsWith("/shop") },
  { label: "Wishlist", href: "/wishlist", icon: Heart, match: (p) => p.startsWith("/wishlist") },
  { label: "Account", href: "/account", icon: User, match: (p) => p.startsWith("/account") },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useWishlist();

  return (
    <nav
      data-bottom-nav
      data-agent-section="global.bottom-nav"
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/95 pb-[max(13px,env(safe-area-inset-bottom))] backdrop-blur-md supports-[backdrop-filter]:bg-white/88 lg:hidden"
    >
      <ul className="mx-auto grid h-[44px] max-w-[560px] grid-cols-4 px-1.5">
        {items.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex flex-1 flex-col items-center justify-start gap-[2px] pt-[7px] transition-colors",
                  active ? "text-ink" : "text-[#55555a] hover:text-ink",
                )}
              >
                <span className="relative flex h-[22px] items-center justify-center transition-transform duration-200 group-active:scale-90">
                  {active && label === "Home" ? (
                    <HomeSolidIcon size={22} />
                  ) : (
                    <Icon
                      className="size-[21px]"
                      strokeWidth={active ? 2.1 : 1.5}
                      fill={active && label === "Wishlist" ? "currentColor" : "none"}
                      aria-hidden
                    />
                  )}
                  {label === "Wishlist" && count > 0 && (
                    <span className="absolute -top-0.5 -right-1.5 size-2 rounded-full bg-ink ring-2 ring-white" aria-hidden />
                  )}
                </span>
                <span className={cn("font-display text-[11px] leading-none", active && "font-medium")}>
                  {label}
                  {label === "Wishlist" && count > 0 && <span className="sr-only">, {count} saved</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
