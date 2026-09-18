"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { searchProducts } from "@/lib/search";
import { cn, formatPrice } from "@/lib/utils";

const sorts = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

const priceCaps = [150, 200] as const;

const allColors = Array.from(
  new Map(products.flatMap((p) => p.colors).map((c) => [c.name.toLowerCase(), c])).values(),
);
const allSizes = ["XS", "S", "M", "L", "XL"];

const chip =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors duration-200";

export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = params.get("category") ?? "";
  const color = params.get("color")?.toLowerCase() ?? "";
  const size = params.get("size") ?? "";
  const maxPrice = Number(params.get("maxPrice")) || 0;
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "featured";
  const collection = params.get("collection") ?? "";

  const update = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || v === 0) next.delete(k);
      else next.set(k, String(v));
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const results = useMemo(() => {
    let list = q ? searchProducts(q) : products;
    if (collection) list = list.filter((p) => p.collection.toLowerCase() === collection.toLowerCase());
    if (category) list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (color) list = list.filter((p) => p.colors.some((c) => c.name.toLowerCase() === color || c.id === color));
    if (size) list = list.filter((p) => p.sizes.includes(size) || p.sizes.includes("One size"));
    if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [q, collection, category, color, size, maxPrice, sort]);

  const active = [
    q && { key: "q", label: `“${q}”` },
    collection && { key: "collection", label: "Aurora collection" },
    color && { key: "color", label: allColors.find((c) => c.name.toLowerCase() === color)?.name ?? color },
    size && { key: "size", label: `Size ${size}` },
    maxPrice && { key: "maxPrice", label: `Under ${formatPrice(maxPrice)}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const title = q ? "Search results" : collection ? "The Aurora Collection" : category || "Shop all";

  return (
    <>
      <PageContainer className="pt-7 md:pt-12 lg:pt-16">
        <p className="flex items-center gap-3 text-[10px] tracking-[0.42em] text-[#110f10] uppercase md:text-[11px]">
          <span>AURORA</span>
          <span aria-hidden className="h-px w-8 bg-[#9c9a98]" />
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <h1 className="font-serif text-[34px] leading-none tracking-[-0.022em] md:text-[52px]">{title}</h1>
          <p className="pb-1 text-[12px] text-muted md:text-[13px]" aria-live="polite">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <p className="mt-3 max-w-[520px] font-serif text-[16px] leading-snug text-[#525156] md:text-[19px]">
          Washed linen, fluid silk and clean-lined leather — made to be worn together, season after season.
        </p>
      </PageContainer>

      {/* filters */}
      <div className="sticky top-[46px] z-20 mt-6 border-y border-line-soft bg-canvas/92 backdrop-blur-md md:top-14 lg:top-[72px]">
        <PageContainer className="flex items-center gap-3 py-3">
          <div className="no-scrollbar -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label="Category">
            {["", ...categories].map((c) => {
              const selected = category.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c || "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ category: c || null })}
                  className={cn(
                    chip,
                    selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink",
                  )}
                >
                  {c || "All"}
                </button>
              );
            })}
          </div>
          <details className="group relative shrink-0">
            <summary
              className={cn(
                chip,
                "cursor-pointer list-none border-line bg-white text-ink hover:border-ink/40 [&::-webkit-details-marker]:hidden",
              )}
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.6} aria-hidden />
              <span className="max-sm:sr-only">Filter &amp; sort</span>
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-[min(88vw,340px)] animate-sheet-in rounded-2xl border border-line bg-white p-5 shadow-float">
              <fieldset>
                <legend className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Sort</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sorts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={sort === s.id}
                      onClick={() => update({ sort: s.id === "featured" ? null : s.id })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px]",
                        sort === s.id ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink/40",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-5">
                <legend className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Colour</legend>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {allColors.map((c) => {
                    const on = color === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => update({ color: on ? null : c.name.toLowerCase() })}
                        className={cn(
                          "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12px]",
                          on ? "border-ink text-ink" : "border-line text-ink-soft hover:border-ink/40",
                        )}
                      >
                        <span className="size-5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]" style={{ background: c.hex }} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset className="mt-5">
                <legend className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Size</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {allSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={size === s}
                      onClick={() => update({ size: size === s ? null : s })}
                      className={cn(
                        "h-9 min-w-11 rounded-lg border px-2 text-[12px]",
                        size === s ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink/40",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-5">
                <legend className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Price</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {priceCaps.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      aria-pressed={maxPrice === cap}
                      onClick={() => update({ maxPrice: maxPrice === cap ? null : cap })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px]",
                        maxPrice === cap ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink/40",
                      )}
                    >
                      Under {formatPrice(cap)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </details>
        </PageContainer>
      </div>

      <PageContainer className="pt-5 md:pt-8">
        {active.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {active.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ [f.key]: null })}
                className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-stone"
                aria-label={`Remove filter ${f.label}`}
              >
                {f.label}
                <X className="size-3.5" strokeWidth={1.8} aria-hidden />
              </button>
            ))}
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="px-2 text-[12px] text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4 lg:gap-x-7">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <p className="font-serif text-[26px] tracking-[-0.01em]">Nothing matches just yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[14px] text-muted">
              Try removing a filter — or ask your stylist, who can suggest the closest alternative.
            </p>
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-cta px-6 text-[13px] font-medium text-white hover:bg-cta-hover"
            >
              Show all pieces
            </button>
          </div>
        )}
      </PageContainer>
    </>
  );
}
