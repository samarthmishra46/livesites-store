"use client";

import type { ColorOption } from "@/types";
import { cn } from "@/lib/utils";

export function ColorSwatches({
  colors,
  value,
  onChange,
  size = "sm",
  label,
}: {
  colors: ColorOption[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "lg";
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex items-center", size === "sm" ? "gap-[8.5px] md:gap-2.5" : "gap-3")}>
      {colors.map((c) => {
        const selected = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.id)}
            className={cn(
              "relative shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)] transition-[box-shadow,transform] duration-200 ease-soft",
              "my-[2px] before:absolute before:-inset-[7px] before:content-[''] md:my-0",
              "hover:scale-110 focus-visible:outline-offset-4",
              size === "sm" ? "size-3 md:size-3.5" : "size-7",
              selected && (size === "sm" ? "md:ring-1 md:ring-ink/35 md:ring-offset-[2.5px] md:ring-offset-canvas" : "ring-1 ring-ink/40 ring-offset-[3px] ring-offset-canvas"),
            )}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}
