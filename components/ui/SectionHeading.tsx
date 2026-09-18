import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  title,
  action,
  className,
}: {
  id?: string;
  title: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2
        id={id}
        className="font-display text-[17.5px] leading-6 font-semibold tracking-[-0.01em] text-ink md:text-[24px] md:leading-8 lg:text-[28px] lg:leading-9"
      >
        {title}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="group -mr-1 inline-flex items-center gap-[7px] rounded-md px-1 py-1 font-display text-[10.5px] text-[#1d1c1f] transition-colors hover:text-ink md:font-sans md:text-[13px] lg:text-sm"
        >
          {action.label}
          <ArrowRight
            aria-hidden
            className="size-[14px] transition-transform duration-300 ease-soft group-hover:translate-x-0.5 md:size-4"
            strokeWidth={1.6}
          />
        </Link>
      )}
    </div>
  );
}
