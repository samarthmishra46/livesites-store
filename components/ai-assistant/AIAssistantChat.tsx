"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { ArrowUp, X } from "lucide-react";
import type { AssistantMessage } from "@/lib/ai-assistant/types";
import { cn } from "@/lib/utils";

type Placement = { side: "left" | "right"; vertical: "top" | "bottom" };

/**
 * Transcript and typed input beside the floating card. It opens on whichever side of
 * the card has room, and is the whole conversation when the microphone is blocked.
 */
export function AIAssistantChat({
  cardRef,
  position,
  transcript,
  textOnly,
  onSend,
  onClose,
}: {
  cardRef: RefObject<HTMLElement | null>;
  /** Saved card position; the panel re-places itself when it changes. */
  position: unknown;
  transcript: AssistantMessage[];
  textOnly: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [place, setPlace] = useState<Placement>({ side: "left", vertical: "top" });
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      const r = cardRef.current?.getBoundingClientRect();
      if (!r) return;
      setPlace({
        side: r.left + r.width / 2 > window.innerWidth / 2 ? "left" : "right",
        vertical: r.top + r.height / 2 > window.innerHeight / 2 ? "bottom" : "top",
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardRef, position]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [transcript]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    onClose();
  };

  return (
    <section
      data-no-drag
      aria-label="Chat with the live agent"
      onKeyDown={onKeyDown}
      className={cn(
        "absolute flex h-[min(340px,62vh)] w-[min(288px,calc(100vw-140px))] animate-fade-in cursor-auto flex-col overflow-hidden rounded-2xl bg-white/95 text-[13px] text-ink shadow-float ring-1 ring-black/5 backdrop-blur-md select-text md:w-[300px]",
        place.side === "left" ? "right-[calc(100%+10px)]" : "left-[calc(100%+10px)]",
        place.vertical === "top" ? "top-0" : "bottom-0",
      )}
    >
      <header className="flex items-center justify-between border-b border-line-soft py-2.5 pr-2 pl-4">
        <p className="font-medium">Live agent</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink"
        >
          <X className="size-4" strokeWidth={1.8} aria-hidden />
        </button>
      </header>

      {textOnly && (
        <p className="border-b border-line-soft bg-ivory px-4 py-2 text-[12px] text-muted">
          Your microphone is off, so we&apos;re chatting by text. Allow the mic in your browser to talk.
        </p>
      )}

      <ol ref={listRef} aria-live="polite" className="flex flex-1 touch-pan-y flex-col gap-2 overflow-y-auto overscroll-contain px-3 py-3">
        {transcript.length === 0 && <li className="m-auto text-center text-[12px] text-muted">Say hello, or type a question below.</li>}
        {transcript.map((m) => (
          <li
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 leading-snug",
              m.role === "user" ? "self-end rounded-br-md bg-cta text-white" : "self-start rounded-bl-md bg-ivory text-ink",
            )}
          >
            <span className="sr-only">{m.role === "user" ? "You: " : "Agent: "}</span>
            {m.text}
          </li>
        ))}
      </ol>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line-soft p-2">
        <label htmlFor="assistant-chat-input" className="sr-only">
          Message the live agent
        </label>
        <input
          ref={inputRef}
          id="assistant-chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about sizes, styling…"
          autoComplete="off"
          maxLength={500}
          className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-[13px] placeholder:text-subtle focus:border-ink/50 focus:ring-2 focus:ring-ink/10 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim()}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-cta text-white transition-colors hover:bg-cta-hover disabled:opacity-40"
        >
          <ArrowUp className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </form>
    </section>
  );
}
