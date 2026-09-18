"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { assistantUI } from "@/lib/ai-assistant/useAssistant";
import { useOverlay } from "@/lib/hooks/useOverlay";
import { ui, useUI } from "@/lib/store/shop";

const primary = [
  { label: "Shop all", href: "/shop" },
  { label: "Aurora collection", href: "/shop?collection=aurora" },
  { label: "Blazers", href: "/shop?category=Blazers" },
  { label: "Dresses", href: "/shop?category=Dresses" },
  { label: "Bags", href: "/shop?category=Bags" },
];

const secondary = [
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Contact", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function MobileMenu() {
  const { menuOpen } = useUI();
  const panel = useRef<HTMLDivElement>(null);
  useOverlay(menuOpen, ui.closeMenu, panel);

  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-black/25" onClick={ui.closeMenu} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] animate-drawer-in flex-col bg-canvas shadow-drawer"
      >
        <div className="flex h-[46px] items-center justify-between pr-1 pl-5 md:h-14">
          <span className="text-[10px] tracking-[0.42em] text-muted uppercase">Menu</span>
          <button
            type="button"
            onClick={ui.closeMenu}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-black/[0.04]"
            aria-label="Close menu"
          >
            <X className="size-5" strokeWidth={1.6} />
          </button>
        </div>
        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-5 pt-2 pb-8">
          <ul className="space-y-1">
            {primary.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={ui.closeMenu}
                  className="block py-2 font-serif text-[28px] leading-tight tracking-[-0.015em] text-ink transition-opacity hover:opacity-60"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-7 h-px bg-line" />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
            {secondary.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={ui.closeMenu} className="text-[14px] text-ink-soft hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              ui.closeMenu();
              assistantUI.open();
            }}
            className="mt-9 flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3.5 text-left text-[14px] shadow-card"
          >
            <span>
              <span className="block font-medium text-ink">Talk to your stylist</span>
              <span className="block text-[12px] text-muted">Live help choosing sizes and outfits</span>
            </span>
            <ArrowUpRight className="size-4 text-ink" strokeWidth={1.6} aria-hidden />
          </button>
        </nav>
      </div>
    </div>
  );
}
