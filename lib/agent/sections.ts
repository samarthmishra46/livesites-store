import { createStore } from "@/lib/store/createStore";
import type { SiteSectionWithRoute } from "./siteMap";

type Section = Pick<SiteSectionWithRoute, "id" | "anchorId">;

const isRendered = (el: HTMLElement) => el.getClientRects().length > 0;

/** The on-screen element for a section, ignoring copies hidden at this breakpoint. */
export function findSectionElement(section: Section): HTMLElement | null {
  if (section.anchorId) return document.getElementById(section.anchorId);
  const matches = document.querySelectorAll<HTMLElement>(`[data-agent-section="${CSS.escape(section.id)}"]`);
  return Array.from(matches).find(isRendered) ?? null;
}

/** Viewport rect of a section. Long-form sections run from their heading to the next heading. */
export function sectionRect(el: HTMLElement, section: Section) {
  const r = el.getBoundingClientRect();
  if (!section.anchorId) return { top: r.top, left: r.left, width: r.width, height: r.height };
  let { top, left, right, bottom } = r;
  for (let n = el.nextElementSibling; n && n.tagName !== "H2"; n = n.nextElementSibling) {
    const nr = n.getBoundingClientRect();
    top = Math.min(top, nr.top);
    left = Math.min(left, nr.left);
    right = Math.max(right, nr.right);
    bottom = Math.max(bottom, nr.bottom);
  }
  return { top, left, width: right - left, height: bottom - top };
}

/** Resolves once the section is rendered (e.g. after a route change), or null after `timeoutMs`. */
export function waitForSection(section: Section, timeoutMs = 4000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      const el = findSectionElement(section);
      if (el) return resolve(el);
      if (performance.now() - started > timeoutMs) return resolve(null);
      requestAnimationFrame(check);
    };
    check();
  });
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Brings a section to the top of the viewport, below the sticky header. */
export async function revealSection(section: Section & { route: string }, highlight: boolean) {
  const el = await waitForSection(section);
  if (!el) return false;
  // let a route change finish its own scroll-to-top first
  await nextFrame();
  await nextFrame();
  const fixed = getComputedStyle(el).position === "fixed";
  if (!fixed) {
    const header = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
    // leave room above a highlighted section for the spotlight's label
    const gap = highlight ? 32 : 16;
    const top = section.id === "global.header" ? 0 : sectionRect(el, section).top + window.scrollY - header - gap;
    window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
  }
  if (highlight) spotlight.show(section.id);
  return true;
}

interface SpotlightState {
  sectionId: string;
  pathname: string;
  key: number;
}

export const spotlightStore = createStore<SpotlightState | null>(null);

let spotlightTimer: ReturnType<typeof setTimeout> | undefined;

/** The soft ring the agent draws around the section it is talking about. */
export const spotlight = {
  show(sectionId: string, durationMs = 9000) {
    clearTimeout(spotlightTimer);
    spotlightStore.set({ sectionId, pathname: window.location.pathname, key: Date.now() });
    spotlightTimer = setTimeout(spotlight.clear, durationMs);
  },
  clear() {
    clearTimeout(spotlightTimer);
    if (spotlightStore.get()) spotlightStore.set(null);
  },
};
