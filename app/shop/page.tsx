import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the Aurora collection: linen blazers, silk slip dresses, tailored sets and leather bags.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ShopView />
    </Suspense>
  );
}
