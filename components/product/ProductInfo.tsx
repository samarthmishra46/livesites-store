"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MessageCircle, RotateCcw, Truck } from "lucide-react";
import { assistantUI } from "@/lib/ai-assistant/useAssistant";
import { cart, ui, useSelectedColor } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { ColorSwatches } from "./ColorSwatches";
import { WishlistButton } from "./WishlistButton";

export function ProductInfo({ product }: { product: Product }) {
  const [colorId, setColor] = useSelectedColor(product.id);
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0] : null);
  const [sizeError, setSizeError] = useState(false);
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    cart.add(product.id, { colorId: color.id, size });
    ui.openCart();
  };

  const sections = [
    { title: "Details", body: <ul className="list-disc space-y-1 pl-4">{product.details.map((d) => <li key={d}>{d}</li>)}</ul> },
    { title: "Composition & care", body: <><p>{product.composition}</p><p className="mt-2">{product.care}</p></> },
    { title: "Size & fit", body: <p>{product.fit}</p> },
  ];

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
          {product.category}
        </Link>
      </nav>

      <p className="mt-5 text-[10px] tracking-[0.42em] text-[#110f10] uppercase md:text-[11px]">{product.collection}</p>
      <h1 className="mt-2 font-serif text-[34px] leading-[1.05] tracking-[-0.022em] md:text-[44px]">{product.name}</h1>
      <p className="mt-2 text-[18px] text-ink">{formatPrice(product.price)}</p>
      <p className="mt-4 font-serif text-[17px] leading-snug text-[#525156] md:text-[19px]">{product.tagline}</p>

      <div className="mt-7">
        <p className="text-[13px] text-ink-soft">
          Colour: <span className="text-ink">{color.name}</span>
        </p>
        <div className="mt-3">
          {product.colors.length > 1 ? (
            <ColorSwatches colors={product.colors} value={color.id} onChange={setColor} size="lg" label="Colour" />
          ) : (
            <span
              className="block size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] ring-1 ring-ink/40 ring-offset-[3px] ring-offset-canvas"
              style={{ background: color.hex }}
            />
          )}
        </div>
      </div>

      {!oneSize && (
        <fieldset className="mt-7">
          <div className="flex items-center justify-between">
            <legend className="text-[13px] text-ink-soft">
              Size{size && <span className="text-ink">: {size}</span>}
            </legend>
            <button
              type="button"
              onClick={assistantUI.open}
              className="text-[12px] text-muted underline underline-offset-4 hover:text-ink"
            >
              Not sure? Ask your stylist
            </button>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={cn(
                  "h-11 rounded-lg border text-[13px] transition-colors",
                  size === s ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/50",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError && (
            <p role="alert" className="mt-2 text-[12px] text-[#a1392f]">
              Please choose a size first.
            </p>
          )}
        </fieldset>
      )}

      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={addToBag}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-cta text-[14px] font-medium text-white shadow-[0_8px_18px_-10px_rgb(22_24_31/0.7)] transition-[background-color,transform] hover:bg-cta-hover active:scale-[0.99]"
        >
          Add to bag · {formatPrice(product.price)}
        </button>
        <WishlistButton product={product} variant="outline" />
      </div>

      <ul className="mt-6 space-y-2.5 text-[13px] text-ink-soft">
        <li className="flex items-center gap-2.5">
          <Truck className="size-[18px] text-ink" strokeWidth={1.4} aria-hidden />
          Free shipping on orders over $100
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw className="size-[18px] text-ink" strokeWidth={1.4} aria-hidden />
          Easy returns within 30 days
        </li>
        <li className="flex items-center gap-2.5">
          <MessageCircle className="size-[18px] text-ink" strokeWidth={1.4} aria-hidden />
          <button type="button" onClick={assistantUI.open} className="underline-offset-4 hover:text-ink hover:underline">
            Book a live styling session
          </button>
        </li>
      </ul>

      <p className="mt-8 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {sections.map((s, i) => (
          <details key={s.title} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[14px] text-ink [&::-webkit-details-marker]:hidden">
              {s.title}
              <ChevronDown
                className="size-4 transition-transform duration-300 ease-soft group-open:rotate-180"
                strokeWidth={1.6}
                aria-hidden
              />
            </summary>
            <div className="pb-5 text-[14px] leading-relaxed text-ink-soft">{s.body}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
