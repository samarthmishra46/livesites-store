"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { X } from "lucide-react";
import { assistantUI, assistantUIStore, attachAssistantVideo, getAssistantOutputLevel, useAssistant } from "@/lib/ai-assistant/useAssistant";
import type { AssistantStatus } from "@/lib/ai-assistant/types";
import { clamp, cn } from "@/lib/utils";
import { AIAssistantChat } from "./AIAssistantChat";
import { AIAssistantControls } from "./AIAssistantControls";

const GREETING = "How can I help you today?";
const EDGE = 6;
const SHOW_LATENCY = process.env.NEXT_PUBLIC_AGENT_DEBUG === "1";

type Point = { x: number; y: number };

/** Vertical room taken by the sticky header and (on mobile) the bottom navigation. */
function bounds(card: HTMLElement) {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const nav = document.querySelector<HTMLElement>("[data-bottom-nav]");
  const top = (header?.offsetHeight ?? 0) + EDGE;
  const navHeight = nav && getComputedStyle(nav).display !== "none" ? nav.offsetHeight : 0;
  return {
    minX: EDGE,
    maxX: window.innerWidth - card.offsetWidth - EDGE,
    minY: top,
    maxY: Math.max(top, window.innerHeight - navHeight - card.offsetHeight - EDGE),
  };
}

function clampPoint(card: HTMLElement, p: Point): Point {
  const b = bounds(card);
  return { x: clamp(p.x, b.minX, Math.max(b.minX, b.maxX)), y: clamp(p.y, b.minY, b.maxY) };
}

/** Default spot: top-right of the hero photo when the page has one, otherwise bottom-right like a call PiP. */
function defaultPoint(card: HTMLElement): Point {
  const anchor = document.querySelector<HTMLElement>("[data-assistant-anchor]");
  const inset = window.innerWidth >= 768 ? 24 : EDGE;
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    if (r.bottom > 0) return clampPoint(card, { x: r.right - card.offsetWidth - inset, y: r.top + inset });
  }
  const b = bounds(card);
  return { x: b.maxX - (inset - EDGE), y: b.maxY - (inset - EDGE) };
}

function place(card: HTMLElement, p: Point) {
  card.style.left = `${p.x}px`;
  card.style.top = `${p.y}px`;
  card.style.right = "auto";
  card.style.bottom = "auto";
}

const statusLabel: Record<AssistantStatus, string> = {
  idle: "Live",
  connecting: "Connecting",
  live: "Live",
  muted: "Muted",
  disconnected: "Offline",
  error: "Offline",
};

const bubble =
  "absolute inset-x-[1.05em] bottom-[4.05em] max-h-[7.2em] overflow-hidden [mask-image:linear-gradient(to_bottom,black_5.6em,transparent)] animate-rise-in rounded-[1.6em] bg-[#6b6360]/45 px-[0.55em] py-[0.6em] text-center font-display text-[0.93em] leading-[1.36] text-white backdrop-blur-md [text-shadow:0_1px_1px_rgb(0_0_0/0.12)]";

export function AIAssistant() {
  const { ui, session, posterSrc, hasVideo } = useAssistant();
  const pathname = usePathname();
  const cardRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null);
  const current = useRef<Point | null>(null);
  const wasOpen = useRef(ui.open);
  const haloRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Position before paint on open, on route change and whenever the saved position changes.
  const layout = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const saved = assistantUIStore.get().position;
    const p = saved ? clampPoint(card, saved) : defaultPoint(card);
    current.current = p;
    place(card, p);
  }, []);

  useLayoutEffect(() => {
    if (ui.open) layout();
  }, [ui.open, pathname, layout]);

  useEffect(() => {
    if (!ui.open) return;
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [ui.open, layout]);

  // Move focus between the panel and its launcher when the shopper opens/closes it.
  useEffect(() => {
    if (wasOpen.current === ui.open) return;
    wasOpen.current = ui.open;
    requestAnimationFrame(() => (ui.open ? cardRef.current : launcherRef.current)?.focus({ preventScroll: true }));
  }, [ui.open]);

  useEffect(() => {
    if (!hasVideo || !ui.open) return;
    attachAssistantVideo(videoRef.current);
    return () => attachAssistantVideo(null);
  }, [hasVideo, ui.open]);

  // Speaking ring follows the loudness of the assistant's voice.
  useEffect(() => {
    const halo = haloRef.current;
    if (!halo || !session.speaking) return;
    let raf = 0;
    const tick = () => {
      const level = getAssistantOutputLevel();
      halo.style.boxShadow = `0 0 0 ${(0.14 + level * 0.32).toFixed(3)}em rgb(40 189 77 / ${(0.3 + level * 0.45).toFixed(3)})`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      halo.style.boxShadow = "";
    };
  }, [session.speaking, ui.open]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button, a, input, textarea, [data-no-drag]")) return;
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    drag.current = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, startX: e.clientX, startY: e.clientY, moved: false };
    card.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const card = cardRef.current;
    if (!d || !card || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
    if (!d.moved) {
      d.moved = true;
      card.dataset.dragging = "true";
    }
    const p = clampPoint(card, { x: e.clientX - d.dx, y: e.clientY - d.dy });
    current.current = p;
    place(card, p);
  };

  const endDrag = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const card = cardRef.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (card) {
      delete card.dataset.dragging;
      if (card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
    }
    if (d.moved && current.current) assistantUI.setPosition(current.current);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    const card = cardRef.current;
    const step = e.shiftKey ? 48 : 16;
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    if (e.key === "Escape") {
      assistantUI.close();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      assistantUI.setPosition(null);
      layout();
      return;
    }
    const dlt = delta[e.key];
    if (!dlt || !card || !current.current) return;
    e.preventDefault();
    const p = clampPoint(card, { x: current.current.x + dlt.x, y: current.current.y + dlt.y });
    current.current = p;
    place(card, p);
    assistantUI.setPosition(p);
  };

  const live = session.status === "live" || session.status === "idle" || session.status === "connecting";
  const offline = session.status === "error" || session.status === "disconnected";
  const message = (offline && session.detail) || session.message?.text || GREETING;

  if (!ui.open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={assistantUI.open}
        aria-label="Open live stylist"
        className="group fixed right-3 bottom-[calc(var(--nav-h)+14px)] z-30 flex animate-assistant-in items-center gap-3 rounded-full bg-white/90 p-1 shadow-float ring-1 ring-black/5 backdrop-blur-md transition-transform hover:-translate-y-0.5 lg:right-6 lg:bottom-6 lg:pr-5"
      >
        <span className="relative block size-12 overflow-hidden rounded-full">
          <Image src={posterSrc} alt="" fill sizes="48px" className="scale-[1.6] object-cover object-[50%_18%]" />
        </span>
        <span className="absolute top-1 left-10 size-3 rounded-full bg-live ring-2 ring-white" aria-hidden />
        <span className="hidden text-left lg:block">
          <span className="block text-[13px] font-medium text-ink">Talk to a stylist</span>
          <span className="block text-[11px] text-muted">Live now · usually replies instantly</span>
        </span>
      </button>
    );
  }

  return (
    <aside
      ref={cardRef}
      tabIndex={-1}
      aria-label="Live AI shopping assistant. Drag, or focus and use the arrow keys, to move it."
      aria-roledescription="movable video panel"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={cn(
        "group/assistant fixed right-[6px] z-30 touch-none select-none md:right-6",
        "text-[10px] md:text-[13px] lg:text-[16px]",
        // server-rendered spot matches the default the client computes, so nothing jumps on hydration
        pathname === "/" ? "top-[52px] md:top-[80px] lg:top-[96px]" : "bottom-[calc(var(--nav-h)+6px)] md:bottom-[calc(var(--nav-h)+24px)] lg:bottom-6",
        "cursor-grab data-[dragging=true]:cursor-grabbing",
        "focus-visible:outline-offset-4",
      )}
    >
      <div
        ref={haloRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[1.45em] transition-opacity duration-300",
          session.speaking ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative h-[18.1em] w-[10.5em] animate-assistant-in overflow-hidden rounded-[1.45em] bg-[#cfc8c2]",
          "shadow-float ring-[0.15em] ring-white/70 ring-inset",
          "transition-[transform,box-shadow] duration-300 ease-soft",
          "group-data-[dragging=true]/assistant:scale-[1.03] group-data-[dragging=true]/assistant:shadow-[0_24px_48px_-12px_rgb(24_20_16/0.35)]",
        )}
      >
        {/* live avatar video, with the portrait as poster and fallback */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {hasVideo && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              poster={posterSrc}
              className={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-500 ease-soft",
                ui.cameraEnabled && live ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <Image
            src={posterSrc}
            alt=""
            fill
            loading="eager"
            draggable={false}
            sizes="(min-width: 1024px) 168px, (min-width: 768px) 137px, 105px"
            className={cn(
              "object-cover object-[50%_18%] transition-[filter,transform] duration-500 ease-soft",
              ui.cameraEnabled ? "animate-breathe" : "scale-110 blur-[10px] brightness-[0.85]",
            )}
          />
          {!ui.cameraEnabled && (
            <div className="absolute inset-x-0 top-[5.2em] flex animate-fade-in flex-col items-center gap-[0.5em] text-white">
              <span className="relative block size-[3.6em] overflow-hidden rounded-full ring-[0.15em] ring-white/80">
                <Image src={posterSrc} alt="" fill sizes="60px" className="scale-[1.7] object-cover object-[50%_20%]" />
              </span>
              <span className="text-[0.85em] font-medium [text-shadow:0_1px_2px_rgb(0_0_0/0.3)]">Video paused</span>
            </div>
          )}
        </div>

        {/* status */}
        <div
          className="absolute top-[0.8em] left-[0.75em] flex h-[2.2em] items-center gap-[0.45em] rounded-full bg-white/60 pr-[0.85em] pl-[0.7em] text-[1em] font-medium text-[#1b1b1d] backdrop-blur-md"
          role="status"
        >
          <span
            className={cn("size-[0.62em] rounded-full", live ? "animate-live bg-live" : "bg-[#9a9aa0]")}
            aria-hidden
          />
          <span className="text-[1.05em] leading-none">{statusLabel[session.status]}</span>
          {SHOW_LATENCY && session.latencyMs != null && (
            <span className="text-[0.8em] leading-none text-[#55535a] tabular-nums">· {session.latencyMs} ms</span>
          )}
        </div>

        <button
          type="button"
          data-assistant-close
          onClick={assistantUI.close}
          aria-label="Close assistant"
          className="absolute top-[0.8em] right-[0.75em] inline-flex size-[2.3em] items-center justify-center rounded-full bg-[#5c5a5e]/35 text-white backdrop-blur-md transition-colors hover:bg-[#5c5a5e]/55 focus-visible:outline-white"
        >
          <X className="size-[1.2em]" strokeWidth={2} aria-hidden />
        </button>

        {/* transcript bubble — tap to reconnect when offline */}
        {offline ? (
          <button
            key={message}
            type="button"
            onClick={assistantUI.reconnect}
            className={cn(bubble, "cursor-pointer hover:bg-[#6b6360]/60 focus-visible:outline-white")}
          >
            {message}
          </button>
        ) : (
          <p key={message} aria-live="polite" className={bubble}>
            {message}
          </p>
        )}

        <AIAssistantControls
          micEnabled={ui.micEnabled}
          cameraEnabled={ui.cameraEnabled}
          chatOpen={ui.chatOpen}
          onToggleMic={assistantUI.toggleMic}
          onToggleCamera={assistantUI.toggleCamera}
          onToggleChat={assistantUI.toggleChat}
        />
      </div>

      {ui.chatOpen && (
        <AIAssistantChat
          cardRef={cardRef}
          position={ui.position}
          transcript={session.transcript}
          textOnly={session.inputMode === "text"}
          onSend={assistantUI.sendText}
          onClose={assistantUI.toggleChat}
        />
      )}
    </aside>
  );
}
