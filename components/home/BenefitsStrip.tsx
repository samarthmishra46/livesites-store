import { Leaf, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { benefits } from "@/data/site";
import { cn } from "@/lib/utils";

const icons: Record<(typeof benefits)[number]["icon"], LucideIcon> = {
  truck: Truck,
  leaf: Leaf,
  shield: ShieldCheck,
};

export function BenefitsStrip({ className }: { className?: string }) {
  return (
    <section aria-label="Why shop with us" className={cn("mx-auto w-full max-w-[1280px] md:px-8 lg:px-10", className)}>
      <ul className="grid grid-cols-3 pt-[14px] pb-[18px] md:border-b md:border-line-soft md:py-10 lg:py-12">
        {benefits.map((b, i) => {
          const Icon = icons[b.icon];
          return (
            <li
              key={b.title}
              className={cn(
                "flex flex-col items-center px-1 text-center md:flex-row md:justify-center md:gap-3 md:px-2 md:text-left lg:gap-4 lg:px-6",
                i > 0 && "border-l border-[#efeeec]",
              )}
            >
              <Icon className="size-[19px] shrink-0 text-[#232326] md:size-7" strokeWidth={1.35} aria-hidden />
              <p className="mt-[2px] font-display text-[10px] leading-[14px] text-muted md:mt-0 md:font-sans md:text-[14px] md:leading-5">
                <span className="block md:font-medium md:text-ink">{b.title}</span>
                <span className="block">{b.detail}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
