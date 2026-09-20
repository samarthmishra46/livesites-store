import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Newsreader } from "next/font/google";
import { SectionSpotlight } from "@/components/agent/SectionSpotlight";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { SearchOverlay } from "@/components/navigation/SearchOverlay";
import { Toast } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.livesites.ai"),
  title: {
    default: "Livesites — Timeless Style for Brighter Days",
    template: "%s — Livesites",
  },
  description:
    "Elevated essentials in linen and silk from the Aurora collection, with a live AI stylist to help you choose.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[70] rounded-md bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div className="pb-nav lg:pb-0">
          <main id="main">{children}</main>
          <Footer />
        </div>
        <MobileBottomNav />
        <SectionSpotlight />
        <AIAssistant />
        <CartDrawer />
        <SearchOverlay />
        <MobileMenu />
        <Toast />
      </body>
    </html>
  );
}
