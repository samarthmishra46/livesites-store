"use client";

import { Check } from "lucide-react";
import { useUI } from "@/lib/store/shop";

export function Toast() {
  const { toast } = useUI();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+14px)] z-[60] flex justify-center px-4 lg:bottom-8"
    >
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="flex animate-rise-in items-center gap-2 rounded-full bg-cta px-4 py-2.5 text-[13px] text-white shadow-float"
        >
          <Check className="size-4" strokeWidth={2} aria-hidden />
          {toast.message}
        </div>
      )}
    </div>
  );
}
