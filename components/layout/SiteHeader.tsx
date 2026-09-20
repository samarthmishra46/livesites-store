"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { useActionDispatcher } from "@/lib/actions/useActionDispatcher";
import { ui, useCart, useWishlist } from "@/lib/store/shop";
import { cn } from "@/lib/utils";

const iconButton =
  "relative flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/[0.04] active:bg-black/[0.07]";

export function SiteHeader() {
  const { count } = useCart();
  const { count: saved } = useWishlist();
  const dispatch = useActionDispatcher();

  return (
    <header data-site-header data-agent-section="global.header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:border-b lg:border-line-soft">
      <div className="mx-auto flex h-[46px] max-w-[1280px] items-center justify-between pr-1 pl-4 md:h-14 md:pr-5 md:pl-8 lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Link
          href="/"
          aria-label="Livesites home"
          className="font-display text-[21px] leading-none font-bold tracking-[-0.035em] text-black md:text-[24px] lg:text-[26px]"
        >
          Livesites
        </Link>

        <Suspense fallback={<div className="hidden lg:block" />}>
          <DesktopNav />
        </Suspense>

        <div className="flex items-center gap-[3px] lg:justify-self-end lg:gap-1">
          <button type="button" className={iconButton} aria-label="Search" onClick={() => ui.openSearch()}>
            <Search className="size-5" strokeWidth={1.7} aria-hidden />
          </button>
          <Link href="/wishlist" className={cn(iconButton, "max-lg:hidden")} aria-label={`Wishlist, ${saved} saved`}>
            <Heart className="size-5" strokeWidth={1.75} aria-hidden />
            {saved > 0 && <Badge value={saved} />}
          </Link>
          <Link href="/account" className={cn(iconButton, "max-lg:hidden")} aria-label="Account">
            <User className="size-5" strokeWidth={1.75} aria-hidden />
          </Link>
          <button
            type="button"
            className={iconButton}
            aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
            onClick={() => dispatch({ type: "open_cart" })}
          >
            <ShoppingBag className="size-5" strokeWidth={1.6} aria-hidden />
            {count > 0 && <Badge value={count} />}
          </button>
          <button type="button" className={cn(iconButton, "lg:hidden")} aria-label="Open menu" onClick={ui.openMenu}>
            <Menu className="size-[22px]" strokeWidth={1.6} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span
      key={value}
      aria-hidden
      className="absolute top-[12px] right-[5px] flex h-[13px] min-w-[13px] animate-pop items-center justify-center rounded-full bg-black px-[3px] font-display text-[8.5px] leading-none font-semibold text-white ring-[1.5px] ring-white lg:top-[7px] lg:right-[4px] lg:h-[15px] lg:min-w-[15px] lg:text-[9px]"
    >
      {value > 9 ? "9+" : value}
    </span>
  );
}
