import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/data/products";
import { recommendation } from "@/data/site";
import { PageContainer } from "@/components/layout/PageContainer";

export function RecommendationCard() {
  const product = getProductBySlug(recommendation.productSlug);
  if (!product) return null;

  return (
    <PageContainer data-agent-section="home.recommendation" className="mt-[7px] md:mt-12 lg:mt-14">
      <Link
        href={`/shop/${product.slug}`}
        className="group flex h-[63.5px] items-center rounded-[12px] border border-[#eceae8] bg-white pr-[14px] pl-[10px] shadow-[0_3px_8px_-4px_rgb(0_0_0/0.08)] transition-[box-shadow,border-color] duration-300 hover:border-line hover:shadow-card md:h-[112px] md:rounded-2xl md:pr-7 md:pl-4 lg:mx-auto lg:max-w-[880px]"
      >
        <span className="relative block h-[46px] w-[45px] shrink-0 overflow-hidden rounded-[7px] md:size-20 md:rounded-xl">
          <Image src="/images/stylist-avatar.jpg" alt="" fill sizes="(min-width: 768px) 80px, 45px" className="object-cover" />
        </span>
        <span className="ml-[13px] min-w-0 flex-1 font-display md:ml-5 md:font-sans">
          <span className="block text-[9px] leading-[12px] text-subtle md:text-[12px] md:leading-4">{recommendation.eyebrow}</span>
          <span className="mt-[2px] block truncate text-[11px] leading-[14px] text-[#060608] md:mt-1 md:font-serif md:text-[22px] md:leading-7 md:tracking-[-0.015em]">
            {recommendation.title}
          </span>
          <span className="mt-[1px] block truncate text-[9px] leading-[12px] text-[#78787d] md:mt-0.5 md:text-[13px] md:leading-5">
            {recommendation.subtitle}
          </span>
        </span>
        <span
          className="relative ml-2 block h-[45px] w-[59px] shrink-0 overflow-hidden rounded-[6px] md:h-[76px] md:w-[100px] md:rounded-lg"
          style={{ background: product.imageBg }}
        >
          <Image
            src={product.images[0].src}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 100px, 59px"
            className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
          />
        </span>
        <ChevronRight
          className="ml-[12px] size-[16px] shrink-0 text-[#2b2b2e] transition-transform duration-300 ease-soft group-hover:translate-x-0.5 md:ml-6 md:size-5"
          strokeWidth={1.7}
          aria-hidden
        />
        <span className="sr-only">View the {product.name}</span>
      </Link>
    </PageContainer>
  );
}
