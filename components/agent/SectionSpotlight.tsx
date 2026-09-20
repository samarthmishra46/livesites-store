"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { findSectionElement, sectionRect, spotlight, spotlightStore } from "@/lib/agent/sections";
import { getSection } from "@/lib/agent/siteMap";
import { useStore } from "@/lib/store/createStore";

const PAD = 8;

/**
 * Soft ring around the section the agent is talking about. It follows the section
 * while the page scrolls, never takes pointer events, and clears on the shopper's
 * next tap or after a few seconds.
 */
export function SectionSpotlight() {
  const state = useStore(spotlightStore);
  const pathname = usePathname();
  const ringRef = useRef<HTMLDivElement>(null);
  const section = state && state.pathname === pathname ? getSection(state.sectionId) : undefined;

  useEffect(() => {
    if (!section) return;
    let raf = 0;
    const track = () => {
      const ring = ringRef.current;
      const el = findSectionElement(section);
      if (ring) {
        if (el) {
          const r = sectionRect(el, section);
          const inset = Math.min(PAD, r.left);
          ring.style.transform = `translate(${r.left - inset}px, ${r.top - PAD}px)`;
          ring.style.width = `${Math.min(r.width + inset * 2, window.innerWidth - (r.left - inset))}px`;
          ring.style.height = `${r.height + PAD * 2}px`;
          ring.style.opacity = "1";
        } else {
          ring.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(track);
    };
    track();
    const dismiss = () => spotlight.clear();
    window.addEventListener("pointerdown", dismiss, { capture: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", dismiss, { capture: true });
    };
  }, [section]);

  if (!section) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-25 overflow-hidden">
      <div
        key={state?.key}
        ref={ringRef}
        className="absolute top-0 left-0 rounded-[18px] opacity-0 shadow-[0_0_0_1.5px_rgb(27_27_29/0.55),0_0_0_100vmax_rgb(28_24_20/0.12)] transition-opacity duration-300 motion-reduce:transition-none"
      >
        <span className="absolute -top-3 left-4 rounded-full bg-cta px-3 py-1 text-[11px] leading-none font-medium tracking-[0.02em] text-white shadow-float">
          {section.label}
        </span>
      </div>
    </div>
  );
}
