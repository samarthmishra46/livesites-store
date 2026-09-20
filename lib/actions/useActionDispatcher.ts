"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getProductById, getProductBySlug } from "@/data/products";
import { revealSection, scrollBehavior } from "@/lib/agent/sections";
import { getSection, routePattern } from "@/lib/agent/siteMap";
import { cart, cartStore, ui, uiStore, wishlist } from "@/lib/store/shop";
import type { AssistantAction, DispatchResult } from "./types";

/** Internal routes the dispatcher may navigate to. External URLs are rejected. */
const isInternalHref = (href: string) => href.startsWith("/") && !href.startsWith("//");

export function useActionDispatcher() {
  const router = useRouter();

  return useCallback(
    (action: AssistantAction): DispatchResult => {
      switch (action.type) {
        case "scroll": {
          const behavior = scrollBehavior();
          if (action.direction === "top" || action.direction === "bottom") {
            window.scrollTo({ top: action.direction === "top" ? 0 : document.documentElement.scrollHeight, behavior });
            return { ok: true };
          }
          const amount = action.amount ?? Math.round(window.innerHeight * 0.8);
          window.scrollBy({ top: action.direction === "down" ? amount : -amount, behavior });
          return { ok: true };
        }
        case "scroll_to_section":
        case "highlight_section": {
          const section = getSection(action.sectionId);
          if (!section) return { ok: false, reason: "Unknown section" };
          const here = routePattern(window.location.pathname);
          if (section.route !== "*" && section.route !== here) {
            if (section.route.includes("[")) return { ok: false, reason: "That section is on product pages — open a product first" };
            router.push(section.route);
          }
          // overlays would hide the section being shown
          const { cartOpen, searchOpen, menuOpen } = uiStore.get();
          if (cartOpen) ui.closeCart();
          if (searchOpen) ui.closeSearch();
          if (menuOpen) ui.closeMenu();
          void revealSection(section, action.type === "highlight_section");
          return { ok: true };
        }
        case "navigate":
          if (!isInternalHref(action.href)) return { ok: false, reason: "Only internal links are allowed" };
          router.push(action.href);
          return { ok: true };
        case "open_product": {
          if (!getProductBySlug(action.productSlug)) return { ok: false, reason: "Unknown product" };
          router.push(`/shop/${action.productSlug}`);
          return { ok: true };
        }
        case "add_to_wishlist":
        case "remove_from_wishlist": {
          const product = getProductById(action.productId);
          if (!product) return { ok: false, reason: "Unknown product" };
          if (action.type === "add_to_wishlist") {
            wishlist.add(product.id);
            ui.toast(`${product.name} saved to your wishlist`);
          } else {
            wishlist.remove(product.id);
            ui.toast(`${product.name} removed from your wishlist`);
          }
          return { ok: true };
        }
        case "add_to_cart": {
          const product = getProductById(action.productId);
          if (!product) return { ok: false, reason: "Unknown product" };
          if (action.size && !product.sizes.includes(action.size)) return { ok: false, reason: `${product.name} comes in ${product.sizes.join(", ")}` };
          if (action.colorId && !product.colors.some((c) => c.id === action.colorId)) {
            return { ok: false, reason: `${product.name} comes in ${product.colors.map((c) => c.name).join(", ")}` };
          }
          cart.add(product.id, { quantity: action.quantity, size: action.size, colorId: action.colorId });
          ui.openCart();
          return { ok: true };
        }
        case "remove_from_cart":
          if (!cartStore.get().some((l) => l.productId === action.productId)) return { ok: false, reason: "That piece isn't in the bag" };
          cart.removeProduct(action.productId);
          return { ok: true };
        case "filter_products": {
          const params = new URLSearchParams();
          if (action.category) params.set("category", action.category);
          if (action.color) params.set("color", action.color);
          if (action.size) params.set("size", action.size);
          if (action.maxPrice != null) params.set("maxPrice", String(action.maxPrice));
          const qs = params.toString();
          router.push(qs ? `/shop?${qs}` : "/shop");
          return { ok: true };
        }
        case "search":
          ui.openSearch(action.query);
          return { ok: true };
        case "open_shop":
          router.push("/shop");
          return { ok: true };
        case "open_wishlist":
          router.push("/wishlist");
          return { ok: true };
        case "open_account":
          router.push("/account");
          return { ok: true };
        case "open_cart":
          ui.openCart();
          return { ok: true };
        case "close_cart":
          ui.closeCart();
          return { ok: true };
      }
    },
    [router],
  );
}
