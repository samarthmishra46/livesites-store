"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

const topics = ["Order & delivery", "Returns & exchanges", "Sizing & styling", "Something else"];

const field =
  "w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink placeholder:text-subtle transition-colors focus:border-ink focus:outline-none";

export function ContactForm() {
  const [sent, setSent] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(String(data.get("name") || "").split(" ")[0] || "there");
  };

  if (sent) {
    return (
      <div data-agent-section="contact.form" role="status" className="rounded-2xl border border-line-soft bg-white p-8 text-center shadow-card md:p-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ink text-white">
          <Check className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <p className="mt-5 font-serif text-[26px] tracking-[-0.01em]">Thank you, {sent}.</p>
        <p className="mt-2 text-[14px] text-muted">We&apos;ve got your message and will reply within one business day.</p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-6 text-[13px] text-ink underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form data-agent-section="contact.form" onSubmit={submit} className="space-y-5 rounded-2xl border border-line-soft bg-white p-6 shadow-card md:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-[13px] text-ink-soft">
            Name
          </label>
          <input id="c-name" name="name" required autoComplete="name" className={`${field} h-12`} />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-[13px] text-ink-soft">
            Email
          </label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className={`${field} h-12`} />
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-[13px] text-ink-soft">What can we help with?</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t, i) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name="topic" value={t} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:border-ink/40">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="c-order" className="mb-1.5 block text-[13px] text-ink-soft">
          Order number <span className="text-muted">(optional)</span>
        </label>
        <input id="c-order" name="order" placeholder="LS-10482" className={`${field} h-12`} />
      </div>
      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-[13px] text-ink-soft">
          Message
        </label>
        <textarea id="c-message" name="message" required rows={5} className={`${field} resize-y py-3`} />
      </div>
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta text-[14px] font-medium text-white transition-colors hover:bg-cta-hover sm:w-auto sm:px-8"
      >
        Send message <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
      </button>
    </form>
  );
}
