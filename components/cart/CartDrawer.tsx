"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { productImageFor } from "@/data/products";
import { site } from "@/data/site";
import { useOverlay } from "@/lib/hooks/useOverlay";
import { cart, ui, useCart, useUI } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { cartOpen } = useUI();
  return cartOpen ? <CartPanel /> : null;
}

function CartPanel() {
  const { items, count, subtotal } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const [checkoutNote, setCheckoutNote] = useState(false);
  useOverlay(true, ui.closeCart, panel);

  const remaining = Math.max(site.freeShippingThreshold - subtotal, 0);
  const progress = Math.min(subtotal / site.freeShippingThreshold, 1);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-black/25" onClick={ui.closeCart} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] animate-drawer-in flex-col bg-canvas shadow-drawer sm:w-[92vw]"
      >
        <div className="flex h-14 items-center justify-between border-b border-line-soft pr-2 pl-5 lg:h-[72px] lg:pl-7">
          <h2 id="cart-title" className="font-display text-[17px] font-semibold tracking-[-0.01em]">
            Your bag <span className="font-normal text-muted">({count})</span>
          </h2>
          <button
            type="button"
            data-autofocus
            onClick={ui.closeCart}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-black/[0.04]"
            aria-label="Close bag"
          >
            <X className="size-5" strokeWidth={1.6} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="size-8 text-subtle" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-serif text-[24px] tracking-[-0.01em]">Your bag is empty</p>
            <p className="mt-1.5 text-[13px] text-muted">Pieces you add will wait for you here.</p>
            <Link
              href="/shop"
              onClick={ui.closeCart}
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-cta px-6 text-[13px] font-medium text-white transition-colors hover:bg-cta-hover"
            >
              Shop the Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line-soft px-5 py-3.5 lg:px-7">
              <p className="text-[12px] text-ink-soft">
                {remaining > 0 ? (
                  <>
                    You&apos;re <strong className="font-medium text-ink">{formatPrice(remaining)}</strong> away from free shipping
                  </>
                ) : (
                  "You've unlocked free shipping"
                )}
              </p>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-ink transition-[width] duration-500 ease-soft"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line-soft overflow-y-auto px-5 lg:px-7">
              {items.map(({ line, product }, index) => {
                const color = product.colors.find((c) => c.id === line.colorId) ?? product.colors[0];
                const img = productImageFor(product, color.id);
                return (
                  <li key={`${line.productId}-${line.colorId}-${line.size}`} className="flex gap-4 py-4">
                    <Link
                      href={`/shop/${product.slug}`}
                      onClick={ui.closeCart}
                      className="relative h-[92px] w-[80px] shrink-0 overflow-hidden rounded-md"
                      style={{ background: product.imageBg }}
                    >
                      <Image
                        src={img.src}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className={cn(img.fit === "contain" ? "object-contain p-2" : "object-cover")}
                        style={{ objectPosition: img.position }}
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/shop/${product.slug}`}
                            onClick={ui.closeCart}
                            className="text-[14px] text-ink hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-[12px] text-muted">
                            {color.name} · {line.size}
                          </p>
                        </div>
                        <p className="text-[14px] text-ink">{formatPrice(product.price * line.quantity)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex h-8 items-center rounded-full border border-line bg-white">
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(index, line.quantity - 1)}
                            className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink"
                            aria-label={`Decrease quantity of ${product.name}`}
                          >
                            <Minus className="size-3.5" strokeWidth={1.6} />
                          </button>
                          <span className="w-5 text-center text-[13px] tabular-nums" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(index, line.quantity + 1)}
                            disabled={line.quantity >= 9}
                            className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink disabled:opacity-40"
                            aria-label={`Increase quantity of ${product.name}`}
                          >
                            <Plus className="size-3.5" strokeWidth={1.6} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeLine(index)}
                          className="text-[12px] text-muted underline-offset-4 hover:text-ink hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line-soft px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:px-7">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-muted">Taxes and shipping calculated at checkout.</p>
              <button
                type="button"
                onClick={() => setCheckoutNote(true)}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-cta text-[14px] font-medium text-white transition-colors hover:bg-cta-hover active:scale-[0.99]"
              >
                Checkout · {formatPrice(subtotal)}
              </button>
              {checkoutNote && (
                <p role="status" className="mt-2.5 animate-fade-in text-center text-[12px] text-muted">
                  This is a preview store — checkout opens with our launch.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
