"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { productImageFor } from "@/data/products";
import { useOverlay } from "@/lib/hooks/useOverlay";
import { searchProducts } from "@/lib/search";
import { ui, useUI } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";

const suggestions = ["Linen", "Silk", "Blazer", "Workwear", "Tote"];

export function SearchOverlay() {
  const { searchOpen, searchQuery } = useUI();
  const panel = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useOverlay(searchOpen, ui.closeSearch, panel);
  const results = useMemo(() => (searchQuery.trim() ? searchProducts(searchQuery) : []), [searchQuery]);

  if (!searchOpen) return null;

  const submit = () => {
    const q = searchQuery.trim();
    ui.closeSearch();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-black/20 backdrop-blur-[2px]" onClick={ui.closeSearch} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="relative animate-sheet-in border-b border-line bg-canvas shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
      >
        <div className="mx-auto max-w-[880px] px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-10">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-center gap-2 border-b border-ink/80 pb-2"
          >
            <Search className="size-5 shrink-0 text-ink" strokeWidth={1.6} aria-hidden />
            <label htmlFor="site-search" className="sr-only">
              Search
            </label>
            <input
              id="site-search"
              data-autofocus
              type="search"
              value={searchQuery}
              onChange={(e) => ui.setSearchQuery(e.target.value)}
              placeholder="Search linen, silk, blazers…"
              autoComplete="off"
              className="h-11 flex-1 bg-transparent font-serif text-[22px] tracking-[-0.01em] text-ink placeholder:text-subtle/70 focus:outline-none md:text-[28px] [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={ui.closeSearch}
              className="inline-flex size-10 items-center justify-center rounded-full hover:bg-black/[0.04]"
              aria-label="Close search"
            >
              <X className="size-5" strokeWidth={1.6} />
            </button>
          </form>

          {searchQuery.trim() === "" ? (
            <div className="mt-5">
              <p className="text-[11px] tracking-[0.2em] text-muted uppercase">Popular</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ui.setSearchQuery(s)}
                    className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5" aria-live="polite">
              <p className="text-[12px] text-muted">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              {results.length > 0 ? (
                <ul className="mt-3 divide-y divide-line-soft">
                  {results.map((p) => {
                    const img = productImageFor(p);
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/shop/${p.slug}`}
                          onClick={ui.closeSearch}
                          className="group flex items-center gap-4 py-3"
                        >
                          <span className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-md" style={{ background: p.imageBg }}>
                            <Image
                              src={img.src}
                              alt=""
                              fill
                              sizes="72px"
                              className={cn(img.fit === "contain" ? "object-contain p-1.5" : "object-cover")}
                              style={{ objectPosition: img.position }}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] text-ink">{p.name}</span>
                            <span className="block truncate text-[12px] text-muted">{p.tagline}</span>
                          </span>
                          <span className="text-[13px] text-ink-soft">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-[14px] text-ink-soft">
                  Nothing matches “{searchQuery}”. Try linen, silk or blazer.
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-ink hover:opacity-70"
              >
                See all results in the shop <ArrowRight className="size-4" strokeWidth={1.6} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
