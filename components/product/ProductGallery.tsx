"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { productImageFor } from "@/data/products";
import { useSelectedColor } from "@/lib/store/shop";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGallery({ product }: { product: Product }) {
  const [colorId] = useSelectedColor(product.id);
  const images = [productImageFor(product, colorId), ...product.images.slice(1)];
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    setIndex(i);
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div data-agent-section="product.gallery" className="md:flex md:gap-4 lg:gap-5">
      {images.length > 1 && (
        <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={index === i}
              aria-label={`Image ${i + 1} of ${images.length}`}
              onClick={() => goTo(i)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-lg transition-opacity",
                index === i ? "ring-1 ring-ink ring-offset-2 ring-offset-canvas" : "opacity-70 hover:opacity-100",
              )}
              style={{ background: product.imageBg }}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="80px"
                className={img.fit === "contain" ? "object-contain p-1.5" : "object-cover"}
                style={{ objectPosition: img.position }}
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:rounded-2xl"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== index) setIndex(i);
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.src}
              className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden md:aspect-[5/6]"
              style={{ background: product.imageBg }}
            >
              {img.fit !== "contain" && img.width > img.height ? (
                // landscape packshots float on their matched backdrop instead of being cropped
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]"
                  style={{ aspectRatio: `${img.width} / ${img.height}` }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    loading={i === 0 ? "eager" : undefined}
                    sizes="(min-width: 1024px) 50vw, (min-width: 768px) 55vw, 100vw"
                    className="animate-fade-in object-cover"
                  />
                </div>
              ) : (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading={i === 0 ? "eager" : undefined}
                  sizes="(min-width: 1024px) 50vw, (min-width: 768px) 55vw, 100vw"
                  className={cn("animate-fade-in", img.fit === "contain" ? "object-contain p-[18%] [mask-image:radial-gradient(closest-side,#000_72%,transparent)]" : "object-cover")}
                  style={{ objectPosition: img.position }}
                />
              )}
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.src}
                className={cn("h-1.5 rounded-full bg-ink transition-all duration-300", index === i ? "w-5" : "w-1.5 opacity-30")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
