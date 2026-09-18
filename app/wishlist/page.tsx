import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/WishlistView";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <>
      <PageIntro eyebrow="Saved" title="Your wishlist" />
      <WishlistView />
    </>
  );
}
