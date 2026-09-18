import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Scissors, Video } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "About Us",
  description: "Livesites makes elevated essentials in natural fibres — and pairs every shopper with a live stylist.",
};

const values = [
  {
    icon: Leaf,
    title: "Natural fibres, fewer pieces",
    body: "European flax linen, mulberry silk and leather from Gold-rated tanneries. We make small runs of pieces designed to work together, and we don't do seasonal sales.",
  },
  {
    icon: Scissors,
    title: "Made to be worn for years",
    body: "French seams, cupro linings and generous seam allowances so a tailor can adjust the fit as you need it. Every piece is wear-tested by our team before it goes on sale.",
  },
  {
    icon: Video,
    title: "A stylist in every visit",
    body: "Our live stylist can see what you're browsing, check measurements against our fit data and put together a look — the way a good shop assistant always has.",
  },
];

const commitments = [
  { value: "$100", label: "Free shipping on every order over $100" },
  { value: "30 days", label: "To return unworn pieces, free within the US" },
  { value: "Live", label: "A stylist on hand every time you visit" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About us" title={<>Clothes for the life<br className="hidden md:block" /> you actually live</>}>
        <p>
          Livesites began with a simple frustration: shopping online was fast, but it had lost the person who&apos;d tell you
          the blazer runs large, or that the ivory will wash you out. So we built a label around both — beautiful essentials,
          and someone to help you choose them.
        </p>
      </PageIntro>

      <PageContainer>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
            <Image
              src="/images/aurora-linen-suit.jpg"
              alt="Model wearing the Aurora linen blazer and trousers"
              fill
              loading="eager"
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.42em] text-[#110f10] uppercase md:text-[11px]">The Aurora collection</p>
            <h2 className="mt-3 font-serif text-[30px] leading-tight tracking-[-0.02em] md:text-[40px]">
              Designed around the linen blazer
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Aurora started with one piece: a relaxed linen blazer that works over a silk slip on Friday night and with
              tailored trousers on Monday morning. Everything else in the collection was designed to sit alongside it, in
              the same warm, undyed palette.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              We work with a small group of family-run mills and ateliers in Europe and visit each of them every season,
              so we know exactly who made what you&apos;re wearing.
            </p>
            <Link
              href="/shop?collection=aurora"
              className="mt-7 inline-flex h-12 items-center gap-3 rounded-[9px] bg-cta px-7 text-[14px] font-medium text-white transition-colors hover:bg-cta-hover"
            >
              Shop the Collection <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
            </Link>
          </div>
        </div>
      </PageContainer>

      <PageContainer as="section" aria-labelledby="values-title" className="mt-20 md:mt-28">
        <h2 id="values-title" className="sr-only">
          What we believe
        </h2>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {values.map(({ icon: Icon, title, body }) => (
            <li key={title} className="border-t border-line pt-6">
              <Icon className="size-6 text-ink" strokeWidth={1.3} aria-hidden />
              <h3 className="mt-5 font-serif text-[22px] tracking-[-0.01em] text-ink">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </PageContainer>

      <PageContainer as="section" aria-label="Our commitments" className="mt-20 md:mt-28">
        <dl className="grid gap-8 rounded-2xl bg-ivory px-6 py-10 md:grid-cols-3 md:px-12 md:py-14">
          {commitments.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-serif text-[44px] leading-none tracking-[-0.03em] text-ink md:text-[56px]">{s.value}</dd>
              <dd className="mt-2 text-[14px] text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </PageContainer>
    </>
  );
}
