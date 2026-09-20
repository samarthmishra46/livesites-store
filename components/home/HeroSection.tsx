import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hero } from "@/data/site";

export function HeroSection() {
  return (
    <section data-agent-section="home.hero" aria-labelledby="hero-title" className="relative overflow-hidden bg-[linear-gradient(180deg,#f9f7f8,#faf5f2)]">
      <div className="relative mx-auto aspect-[676/536] w-full max-w-[1600px] md:aspect-auto md:h-[480px] lg:h-[clamp(560px,calc(100svh-190px),700px)]">
        {/* Photo: full-bleed on phones, anchored right on larger screens with the copy over its soft haze. */}
        <div data-assistant-anchor className="absolute inset-0 md:left-auto md:aspect-[676/536]">
          <Image
            src="/images/hero-aurora.jpg"
            alt="Model in the Aurora linen blazer and trousers, looking over her shoulder in soft morning light"
            fill
            preload
            sizes="(min-width: 1600px) 883px, (min-width: 768px) 62vw, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 hidden w-2/5 bg-[linear-gradient(90deg,#f9f7f6_0%,rgb(249_247_246/0.6)_45%,transparent)] md:block"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 hidden w-24 bg-[linear-gradient(270deg,#f9f7f6,transparent)] min-[1600px]:block"
          />
        </div>

        <div className="absolute inset-0">
          <div className="mx-auto h-full max-w-[1280px] px-4 pt-[9.3%] md:flex md:flex-col md:justify-center md:px-8 md:pt-0 md:pb-4 lg:px-10">
            <p className="flex items-center gap-[7.5px] text-[9.5px] leading-none tracking-[0.46em] text-[#110f10] uppercase md:gap-3 md:text-[11px] lg:text-[12px] lg:tracking-[0.5em]">
              <span>{hero.eyebrow}</span>
              <span aria-hidden className="h-px w-[29px] bg-[#9c9a98] md:w-10 lg:w-14" />
            </p>
            <h1
              id="hero-title"
              className="mt-[21px] font-serif text-[30px] leading-[32px] font-normal tracking-[-0.022em] text-[#010000] md:mt-6 md:text-[48px] md:leading-[1.02] lg:mt-7 lg:text-[64px] xl:text-[72px]"
            >
              {hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-[15px] font-serif text-[13.3px] leading-[17.2px] tracking-[-0.005em] text-[#525156] md:mt-5 md:text-[19px] md:leading-[1.35] lg:mt-6 lg:text-[22px]">
              {hero.subtitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <Link
              href={hero.cta.href}
              className="group mt-[14px] inline-flex h-[37px] w-fit items-center gap-[9px] rounded-[7px] bg-cta pr-[16px] pl-[19px] font-display text-[10.5px] font-medium text-white shadow-[0_6px_16px_-8px_rgb(22_24_31/0.6)] transition-[background-color,transform] duration-200 hover:bg-cta-hover active:scale-[0.98] md:mt-8 md:h-12 md:gap-3 md:rounded-[9px] md:pr-6 md:pl-7 md:text-[14px] lg:mt-10 lg:h-[52px] lg:text-[15px]"
            >
              {hero.cta.label}
              <ArrowRight
                className="size-[13px] transition-transform duration-300 ease-soft group-hover:translate-x-0.5 md:size-[18px]"
                strokeWidth={1.8}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
