import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/data/products";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { images: [product.images[0].src] },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const pairs = (product.pairsWith ?? [])
    .map(getProductBySlug)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <div className="md:pt-8 lg:pt-12">
        <PageContainer className="max-md:px-0">
          <div className="grid gap-7 md:grid-cols-[1.15fr_1fr] md:gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <ProductGallery product={product} />
            <div className="px-4 md:sticky md:top-24 md:self-start md:px-0 lg:top-28">
              <ProductInfo product={product} />
            </div>
          </div>
        </PageContainer>
      </div>

      {pairs.length > 0 && (
        <PageContainer as="section" data-agent-section="product.pairs" aria-labelledby="pairs-title" className="mt-16 md:mt-24">
          <SectionHeading id="pairs-title" title="Pairs perfectly with" action={{ label: "View All", href: "/shop" }} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 md:mt-6 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-7">
            {pairs.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </PageContainer>
      )}
    </>
  );
}
