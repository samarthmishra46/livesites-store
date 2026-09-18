"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p role="status" className="mt-6 text-[14px] text-ink-soft">
        Thank you — look out for our next edit in your inbox.
      </p>
    );
  }

  return (
    <form
      className="mt-6 flex items-center border-b border-ink/70 focus-within:border-ink"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Your email for new arrivals"
        className="h-11 flex-1 bg-transparent text-[14px] placeholder:text-subtle focus:outline-none"
      />
      <button type="submit" className="inline-flex size-10 items-center justify-center" aria-label="Subscribe">
        <ArrowRight className="size-4" strokeWidth={1.6} />
      </button>
    </form>
  );
}
