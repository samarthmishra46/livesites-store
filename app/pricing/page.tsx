import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { pricingFaqs, pricingPlans } from "@/data/pages";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Livesites memberships: free live styling for everyone, with more for members.",
};

export default function PricingPage() {
  return (
    <>
      <PageIntro eyebrow="Membership" title="Simple, honest pricing" align="center">
        <p>Live styling is free for everyone. Membership adds faster delivery, a fit profile and time with a senior stylist.</p>
      </PageIntro>

      <PageContainer data-agent-section="pricing.plans">
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {pricingPlans.map((plan) => (
            <section
              key={plan.name}
              aria-labelledby={`plan-${plan.name}`}
              className={cn(
                "flex flex-col rounded-2xl border p-6 md:p-8",
                plan.featured ? "border-ink bg-cta text-white shadow-float" : "border-line-soft bg-white shadow-card",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 id={`plan-${plan.name}`} className="text-[15px] font-medium">
                  {plan.name}
                </h2>
                {plan.featured && (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase">Most loved</span>
                )}
              </div>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-serif text-[48px] leading-none tracking-[-0.03em]">{plan.price}</span>
                {plan.cadence && <span className={cn("text-[14px]", plan.featured ? "text-white/70" : "text-muted")}>{plan.cadence}</span>}
              </p>
              <p className={cn("mt-3 text-[14px]", plan.featured ? "text-white/75" : "text-muted")}>{plan.blurb}</p>
              <ul className="mt-7 flex-1 space-y-3 text-[14px]">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className={cn("mt-0.5 size-4 shrink-0", plan.featured ? "text-white" : "text-ink")} strokeWidth={1.8} aria-hidden />
                    <span className={plan.featured ? "text-white/90" : "text-ink-soft"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={cn(
                  "mt-8 flex h-12 items-center justify-center rounded-lg text-[14px] font-medium transition-colors",
                  plan.featured ? "bg-white text-ink hover:bg-white/90" : "border border-ink/80 text-ink hover:bg-ink hover:text-white",
                )}
              >
                {plan.cta.label}
              </Link>
            </section>
          ))}
        </div>
      </PageContainer>

      <PageContainer as="section" data-agent-section="pricing.faq" aria-labelledby="faq-title" className="mt-20 md:mt-28">
        <div className="mx-auto max-w-[760px]">
          <h2 id="faq-title" className="font-serif text-[30px] tracking-[-0.02em] md:text-[36px]">
            Questions
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {pricingFaqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-[20px] leading-none text-muted transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-[14px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
