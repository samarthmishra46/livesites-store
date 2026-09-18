"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Heart, Package, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { assistantUI } from "@/lib/ai-assistant/useAssistant";
import { createStore, useStore } from "@/lib/store/createStore";
import { useWishlist } from "@/lib/store/shop";
import { cn } from "@/lib/utils";

interface Profile {
  name: string;
  email: string;
  sizes: string[];
  fit: "Relaxed" | "Tailored" | "Oversized";
}

const profileStore = createStore<Profile | null>(null, {
  persistKey: "livesites:profile",
  parse: (v) => (v && typeof v === "object" && "email" in v ? (v as Profile) : null),
});

const sizeOptions = ["XS", "S", "M", "L", "XL"];
const fitOptions: Profile["fit"][] = ["Relaxed", "Tailored", "Oversized"];

const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink placeholder:text-subtle transition-colors focus:border-ink focus:outline-none";

export function AccountView() {
  const profile = useStore(profileStore);
  return profile ? <Dashboard profile={profile} /> : <SignIn />;
}

function SignIn() {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const name = String(data.get("name") || email.split("@")[0]);
    profileStore.set({ name: name.charAt(0).toUpperCase() + name.slice(1), email, sizes: [], fit: "Relaxed" });
  };

  return (
    <PageContainer className="pb-6">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="rounded-2xl border border-line-soft bg-white p-6 shadow-card md:p-9">
          <div className="flex gap-6 border-b border-line-soft" role="tablist">
            {(["signin", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "-mb-px border-b pb-3 text-[14px] transition-colors",
                  mode === m ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="acc-name" className="mb-1.5 block text-[13px] text-ink-soft">
                  First name
                </label>
                <input id="acc-name" name="name" required autoComplete="given-name" className={input} />
              </div>
            )}
            <div>
              <label htmlFor="acc-email" className="mb-1.5 block text-[13px] text-ink-soft">
                Email
              </label>
              <input id="acc-email" name="email" type="email" required autoComplete="email" className={input} />
            </div>
            <div>
              <label htmlFor="acc-password" className="mb-1.5 block text-[13px] text-ink-soft">
                Password
              </label>
              <input
                id="acc-password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className={input}
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta text-[14px] font-medium text-white transition-colors hover:bg-cta-hover"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
            </button>
            <p className="text-center text-[12px] text-muted">
              Preview store: your details stay on this device and are never sent anywhere.
            </p>
          </form>
        </div>

        <div className="md:pt-4">
          <h2 className="font-serif text-[26px] leading-tight tracking-[-0.015em] md:text-[32px]">Members get more</h2>
          <ul className="mt-6 space-y-5">
            {[
              { icon: Sparkles, title: "A stylist who remembers you", body: "Your sizes and fit preferences follow you into every live session." },
              { icon: Heart, title: "Wishlist on every device", body: "Save pieces on your phone and pick them up on your laptop." },
              { icon: Package, title: "Orders and easy returns", body: "Track deliveries and start a return in two taps." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-ink" strokeWidth={1.4} aria-hidden />
                <div>
                  <p className="text-[15px] text-ink">{title}</p>
                  <p className="mt-0.5 text-[14px] text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="mt-7 inline-flex items-center gap-2 text-[14px] text-ink underline-offset-4 hover:underline">
            Compare memberships <ArrowRight className="size-4" strokeWidth={1.6} aria-hidden />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

function Dashboard({ profile }: { profile: Profile }) {
  const { count } = useWishlist();
  const update = (patch: Partial<Profile>) => profileStore.set((p) => (p ? { ...p, ...patch } : p));

  return (
    <PageContainer className="pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="font-serif text-[22px] text-ink-soft md:text-[26px]">Welcome back, {profile.name}.</p>
        <button
          type="button"
          onClick={() => profileStore.set(null)}
          className="text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
          <Package className="size-5 text-ink" strokeWidth={1.4} aria-hidden />
          <p className="mt-4 text-[15px] text-ink">Orders</p>
          <p className="mt-1 text-[14px] text-muted">No orders yet. Your first delivery ships free over $100.</p>
          <Link href="/shop" className="mt-4 inline-block text-[13px] text-ink underline underline-offset-4">
            Start shopping
          </Link>
        </div>
        <div className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
          <Heart className="size-5 text-ink" strokeWidth={1.4} aria-hidden />
          <p className="mt-4 text-[15px] text-ink">Wishlist</p>
          <p className="mt-1 text-[14px] text-muted">
            {count === 0 ? "Nothing saved yet." : `${count} saved ${count === 1 ? "piece" : "pieces"}.`}
          </p>
          <Link href="/wishlist" className="mt-4 inline-block text-[13px] text-ink underline underline-offset-4">
            View wishlist
          </Link>
        </div>
        <div className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
          <Sparkles className="size-5 text-ink" strokeWidth={1.4} aria-hidden />
          <p className="mt-4 text-[15px] text-ink">Live styling</p>
          <p className="mt-1 text-[14px] text-muted">Your stylist is online now for sizing and outfit advice.</p>
          <button type="button" onClick={assistantUI.open} className="mt-4 text-[13px] text-ink underline underline-offset-4">
            Start a session
          </button>
        </div>
      </div>

      <section aria-labelledby="prefs-title" className="mt-10 rounded-2xl border border-line-soft bg-ivory/60 p-6 md:p-8">
        <h2 id="prefs-title" className="font-serif text-[24px] tracking-[-0.01em]">
          Fit profile
        </h2>
        <p className="mt-1 text-[14px] text-muted">Shared with your stylist so recommendations start in your size.</p>
        <fieldset className="mt-6">
          <legend className="text-[13px] text-ink-soft">Usual sizes</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.map((s) => {
              const on = profile.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ sizes: on ? profile.sizes.filter((x) => x !== s) : [...profile.sizes, s] })}
                  className={cn(
                    "h-10 min-w-12 rounded-lg border px-3 text-[13px] transition-colors",
                    on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="text-[13px] text-ink-soft">Preferred fit</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {fitOptions.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={profile.fit === f}
                onClick={() => update({ fit: f })}
                className={cn(
                  "h-10 rounded-full border px-4 text-[13px] transition-colors",
                  profile.fit === f ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-6 text-[12px] text-muted">Signed in as {profile.email}</p>
      </section>
    </PageContainer>
  );
}
