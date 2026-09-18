"use client";

import Image from "next/image";
import Link from "next/link";
import { productImageFor } from "@/data/products";
import { useSelectedColor } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { ColorSwatches } from "./ColorSwatches";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  product,
  priority,
  aspect = "landscape",
  className,
}: {
  product: Product;
  priority?: boolean;
  /** Home uses the wide crops from the reference; the shop grid uses taller frames. */
  aspect?: "landscape" | "portrait";
  className?: string;
}) {
  const [colorId, setColor] = useSelectedColor(product.id);
  const image = productImageFor(product, colorId);
  const color = product.colors.find((c) => c.id === colorId);
  const href = `/shop/${product.slug}`;

  return (
    <article className={cn("group/card relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[7px] md:rounded-[10px]",
          aspect === "landscape" ? "aspect-[172/119]" : "aspect-[4/5]",
        )}
        style={{ backgroundColor: product.imageBg }}
      >
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          loading={priority ? "eager" : undefined}
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 768px) 30vw, 46vw"
          className={cn(
            "animate-fade-in transition-transform duration-700 ease-soft md:group-hover/card:scale-[1.04]",
            image.fit === "contain"
              ? "object-contain p-[14%] [mask-image:radial-gradient(closest-side,#000_72%,transparent)]"
              : "object-cover",
          )}
          style={{ objectPosition: image.position }}
        />
        {product.badge && (
          <span className="pointer-events-none absolute top-2 left-2 hidden rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-ink uppercase backdrop-blur md:inline-block">
            {product.badge}
          </span>
        )}
        <WishlistButton product={product} />
      </div>

      <div className="mt-[7px] font-display md:mt-3 md:font-sans">
        <h3 className="text-[10.5px] leading-[14px] text-ink-soft md:text-[14px] md:leading-5 md:text-ink">
          <Link href={href} className="after:absolute after:inset-x-0 after:top-0 after:bottom-[26px] hover:underline md:after:bottom-9">
            {product.name}
          </Link>
        </h3>
        <p className="mt-[1px] text-[10.5px] leading-[14px] text-ink-soft md:mt-0.5 md:text-[14px] md:leading-5">
          {formatPrice(product.price)}
          {color && <span className="sr-only">, {color.name}</span>}
        </p>
        {product.colors.length > 1 ? (
          <div className="relative z-10 mt-[3px] md:mt-3">
            <ColorSwatches colors={product.colors} value={colorId} onChange={setColor} label={`${product.name} colour`} />
          </div>
        ) : (
          <div className="relative z-10 mt-[3px] md:mt-3">
            <span
              className="block size-3 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)] md:size-3.5"
              style={{ backgroundColor: product.colors[0].hex }}
              title={product.colors[0].name}
            />
          </div>
        )}
      </div>
    </article>
  );
}
