"use client";

import { Heart } from "lucide-react";
import { useActionDispatcher } from "@/lib/actions/useActionDispatcher";
import { useWishlist } from "@/lib/store/shop";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function WishlistButton({
  product,
  variant = "overlay",
  className,
}: {
  product: Product;
  variant?: "overlay" | "outline";
  className?: string;
}) {
  const { has } = useWishlist();
  const dispatch = useActionDispatcher();
  const saved = has(product.id);

  const toggle = () =>
    dispatch({ type: saved ? "remove_from_wishlist" : "add_to_wishlist", productId: product.id });

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-[14px] text-ink transition-colors hover:border-ink/40",
          className,
        )}
      >
        <Heart
          key={String(saved)}
          className={cn("size-[18px]", saved && "animate-pop fill-ink")}
          strokeWidth={1.6}
          aria-hidden
        />
        {saved ? "Saved" : "Save"}
        <span className="sr-only"> {product.name} to wishlist</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={cn(
        "absolute top-0 right-0 z-10 inline-flex size-[29px] items-center justify-center rounded-full text-[#1a1615] transition-colors hover:bg-white/60 md:top-2 md:right-2 md:size-9",
        className,
      )}
    >
      <Heart
        key={String(saved)}
        className={cn("size-[15px] md:size-[18px]", saved && "animate-pop fill-current")}
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  );
}
