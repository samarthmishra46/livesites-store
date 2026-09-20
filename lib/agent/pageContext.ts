import { getProductById, getProductBySlug } from "@/data/products";
import { cartStore, wishlistStore } from "@/lib/store/shop";
import { findSectionElement, sectionRect } from "./sections";
import { routePattern, siteSections, sitePages } from "./siteMap";

/** The section under the shopper's reading line, a third of the way down the visible page. */
function sectionOnScreen(pattern: string) {
  const header = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
  const line = header + (window.innerHeight - header) * 0.33;
  let best: { id: string; label: string; distance: number } | null = null;
  for (const section of siteSections) {
    if (section.route !== pattern && section.id !== "global.footer") continue;
    const el = findSectionElement(section);
    if (!el) continue;
    const r = sectionRect(el, section);
    const bottom = r.top + r.height;
    const distance = r.top <= line && bottom >= line ? 0 : Math.min(Math.abs(r.top - line), Math.abs(bottom - line));
    if (!best || distance < best.distance) best = { id: section.id, label: section.label, distance };
  }
  if (!best || best.distance > window.innerHeight / 2) return null;
  return best;
}

/**
 * A short, factual description of what the shopper is looking at, sent to the agent
 * as a contextual update whenever it changes.
 */
export function describePage() {
  const { pathname, search } = window.location;
  const pattern = routePattern(pathname);
  const page = sitePages.find((p) => p.route === pattern);
  const parts: string[] = [];

  if (pattern === "/shop/[slug]") {
    const product = getProductBySlug(pathname.split("/")[2] ?? "");
    parts.push(`The shopper is on the product page for ${product?.name ?? "an unknown product"} (slug ${product?.slug ?? "?"}).`);
  } else {
    parts.push(`The shopper is on the ${page?.title ?? pathname} page (${pathname}${search}).`);
  }

  const nearFooter = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
  const section = nearFooter ? { id: "global.footer", label: "Footer" } : sectionOnScreen(pattern);
  if (section) parts.push(`On screen: ${section.label} (${section.id}).`);

  const lines = cartStore.get();
  const bag = lines
    .map((l) => {
      const p = getProductById(l.productId);
      const color = p?.colors.find((c) => c.id === l.colorId)?.name;
      return p ? `${p.name} (${[color, l.size].filter(Boolean).join(", ")}) ×${l.quantity}` : null;
    })
    .filter(Boolean);
  parts.push(bag.length ? `Bag: ${bag.join("; ")}.` : "Bag is empty.");

  const saved = wishlistStore
    .get()
    .map((id) => getProductById(id)?.name)
    .filter(Boolean);
  parts.push(saved.length ? `Wishlist: ${saved.join(", ")}.` : "Wishlist is empty.");

  return parts.join(" ");
}
