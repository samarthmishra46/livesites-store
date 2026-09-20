import Link from "next/link";
import { footerNav, site } from "@/data/site";
import { NewsletterForm } from "./NewsletterForm";
import { PageContainer } from "./PageContainer";

export function Footer() {
  return (
    <footer data-agent-section="global.footer" className="mt-16 border-t border-line-soft bg-ivory/60 md:mt-24">
      <PageContainer className="py-10 md:py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="font-display text-[22px] leading-none font-bold tracking-[-0.035em] text-black">
              Livesites
            </Link>
            <p className="mt-4 font-serif text-[19px] leading-snug tracking-[-0.01em] text-ink-soft">
              Elevated essentials, styled live by people who love clothes as much as you do.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[14px] text-ink-soft transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12px] text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Livesites. All rights reserved.</p>
          <p>
            <a href={`mailto:${site.email}`} className="hover:text-ink">
              {site.email}
            </a>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            Complimentary shipping over ${site.freeShippingThreshold}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
