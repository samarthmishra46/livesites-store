import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Livesites memberships: free live styling for everyone, with more for members.",
};

const plans = [
  {
    name: "Essential",
    price: "Free",
    cadence: "",
    blurb: "Everything you need to shop with confidence.",
    features: [
      "Live AI stylist on every page",
      "Free shipping on orders over $100",
      "30-day returns",
      "Wishlist saved on this device",
    ],
    cta: { label: "Start shopping", href: "/shop" },
  },
  {
    name: "Aurora Circle",
    price: "$9",
    cadence: "/ month",
    blurb: "For regulars who want their stylist to know them.",
    features: [
      "Everything in Essential",
      "Free express shipping on every order",
      "Fit profile remembered across devices",
      "Early access to new collections",
      "Free alterations on blazers and trousers",
    ],
    cta: { label: "Join Aurora Circle", href: "/account" },
    featured: true,
  },
  {
    name: "Atelier",
    price: "$29",
    cadence: "/ month",
    blurb: "A dedicated human stylist, on call.",
    features: [
      "Everything in Aurora Circle",
      "Monthly 30-minute video session with a senior stylist",
      "Seasonal capsule edits chosen for you",
      "Home try-on: keep what you love, return the rest",
    ],
    cta: { label: "Choose Atelier", href: "/account" },
  },
];

const faqs = [
  {
    q: "Is the live stylist really free?",
    a: "Yes. Every visitor can talk to the Livesites stylist at no cost and with no account. Memberships add perks around delivery, fit and human styling.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Memberships are month to month. Cancel from your account page and you keep your benefits until the end of the billing period.",
  },
  {
    q: "Do member prices differ from regular prices?",
    a: "No. Product prices are the same for everyone — we don't run member-only discounts or seasonal sales.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageIntro eyebrow="Membership" title="Simple, honest pricing" align="center">
        <p>Live styling is free for everyone. Membership adds faster delivery, a fit profile and time with a senior stylist.</p>
      </PageIntro>

      <PageContainer>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {plans.map((plan) => (
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

      <PageContainer as="section" aria-labelledby="faq-title" className="mt-20 md:mt-28">
        <div className="mx-auto max-w-[760px]">
          <h2 id="faq-title" className="font-serif text-[30px] tracking-[-0.02em] md:text-[36px]">
            Questions
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
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
