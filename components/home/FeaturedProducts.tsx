import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export function FeaturedProducts() {
  return (
    <PageContainer as="section" aria-labelledby="featured-title" className="md:pt-14 lg:pt-16">
      <SectionHeading id="featured-title" title="Featured for You" action={{ label: "View All", href: "/shop" }} />
      <div className="mt-[8px] grid grid-cols-2 gap-x-4 gap-y-6 md:mt-6 md:grid-cols-3 md:gap-x-6 lg:mt-8 lg:grid-cols-4 lg:gap-x-7">
        {featuredProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={i < 2}
            // phones show the two pieces from the reference; wider screens add columns
            className={cn(i === 2 && "hidden md:block", i >= 3 && "hidden lg:block")}
          />
        ))}
      </div>
    </PageContainer>
  );
}
