import { products } from "@/data/products";
import type { Product } from "@/types";

/** Simple all-terms match across name, category, collection, copy and colour names. */
export function searchProducts(query: string, source: Product[] = products): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return source;
  return source.filter((p) => {
    const haystack = [p.name, p.category, p.collection, p.tagline, p.composition, ...p.colors.map((c) => c.name)]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t) || (t === "workwear" && /blazer|set|tote/.test(haystack)));
  });
}
