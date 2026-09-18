import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";

/** Editorial page opener shared by content pages: small tracked eyebrow, serif title, intro. */
export function PageIntro({
  eyebrow,
  title,
  children,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <PageContainer className={cn("pt-8 pb-8 md:pt-14 md:pb-12 lg:pt-20", align === "center" && "text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-[10px] tracking-[0.42em] text-[#110f10] uppercase md:text-[11px]",
            align === "center" && "justify-center",
          )}
        >
          <span>{eyebrow}</span>
          <span aria-hidden className="h-px w-8 bg-[#9c9a98] md:w-10" />
        </p>
      )}
      <h1 className="mt-4 font-serif text-[36px] leading-[1.02] tracking-[-0.022em] text-ink md:mt-5 md:text-[52px] lg:text-[60px]">
        {title}
      </h1>
      {children && (
        <div
          className={cn(
            "mt-4 max-w-[620px] font-serif text-[17px] leading-[1.45] text-[#525156] md:mt-5 md:text-[20px]",
            align === "center" && "mx-auto",
          )}
        >
          {children}
        </div>
      )}
    </PageContainer>
  );
}
