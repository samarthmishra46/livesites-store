import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1280px] px-4 md:px-8 lg:px-10", className)} {...rest}>
      {children}
    </Tag>
  );
}
