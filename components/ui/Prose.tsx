import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

/** Long-form text (policies, terms) with an optional sticky table of contents on desktop. */
export function Prose({
  children,
  updated,
  toc,
}: {
  children: ReactNode;
  updated?: string;
  toc?: { id: string; label: string }[];
}) {
  return (
    <PageContainer className="pb-4">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        {toc && (
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2.5 border-l border-line pl-5 text-[13px]">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-muted transition-colors hover:text-ink">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div
          className={[
            "max-w-[680px] text-[15px] leading-[1.7] text-ink-soft",
            "[&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:font-serif [&_h2]:text-[26px] [&_h2]:leading-tight [&_h2]:tracking-[-0.015em] [&_h2]:text-ink first:[&_h2]:mt-0",
            "[&_h3]:mt-7 [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-ink",
            "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
            "[&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4",
            "[&_strong]:font-medium [&_strong]:text-ink",
          ].join(" ")}
        >
          {updated && <p className="!mt-0 mb-8 text-[13px] text-muted">Last updated {updated}</p>}
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
