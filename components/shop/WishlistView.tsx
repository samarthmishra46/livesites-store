"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { featuredProducts, getProductById } from "@/data/products";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useActionDispatcher } from "@/lib/actions/useActionDispatcher";
import { useWishlist } from "@/lib/store/shop";

export function WishlistView() {
  const { ids } = useWishlist();
  const dispatch = useActionDispatcher();
  const saved = ids.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (saved.length === 0) {
    return (
      <>
        <PageContainer className="pb-4">
          <div className="rounded-2xl border border-line-soft bg-ivory/70 px-6 py-14 text-center md:py-20">
            <Heart className="mx-auto size-8 text-subtle" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-serif text-[26px] tracking-[-0.01em] md:text-[32px]">Nothing saved yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[14px] text-muted">
              Tap the heart on any piece to keep it here — we&apos;ll hold onto it on this device.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex h-11 items-center rounded-lg bg-cta px-6 text-[13px] font-medium text-white transition-colors hover:bg-cta-hover"
            >
              Shop the Collection
            </Link>
          </div>
        </PageContainer>
        <PageContainer as="section" aria-labelledby="wishlist-suggestions" className="mt-12 md:mt-16">
          <SectionHeading id="wishlist-suggestions" title="You might love" action={{ label: "View All", href: "/shop" }} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 md:mt-6 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-7">
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4 lg:gap-x-7">
        {saved.map((p, i) => (
          <div key={p.id} className="flex flex-col">
            <ProductCard product={p} priority={i < 2} />
            <button
              type="button"
              onClick={() => dispatch({ type: "add_to_cart", productId: p.id })}
              className="mt-3 h-10 rounded-lg border border-ink/80 text-[12px] font-medium text-ink transition-colors hover:bg-ink hover:text-white md:h-11 md:text-[13px]"
            >
              Add to bag
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
