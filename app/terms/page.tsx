import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { PageIntro } from "@/components/ui/PageIntro";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = { title: "Terms & Conditions" };

const toc = [
  { id: "about", label: "About these terms" },
  { id: "orders", label: "Orders & pricing" },
  { id: "stylist", label: "The live stylist" },
  { id: "accounts", label: "Accounts" },
  { id: "ip", label: "Intellectual property" },
  { id: "liability", label: "Liability" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Terms & Conditions" />
      <Prose toc={toc} updated="September 1, 2026">
        <h2 id="about">About these terms</h2>
        <p>
          These terms apply when you browse or buy from Livesites. By placing an order you agree to them, together with our{" "}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/shipping-returns">Shipping &amp; Returns</Link> policy.
        </p>

        <h2 id="orders">Orders &amp; pricing</h2>
        <p>
          All prices are shown in US dollars and include applicable taxes at checkout. Your order is a request to buy; a
          contract is formed when we email to confirm it has shipped. If an item turns out to be unavailable or mispriced, we
          will contact you before charging for it.
        </p>
        <p>
          Colours can vary slightly between screens. Every product page lists the fibre composition and care instructions,
          and your live stylist can answer questions about fit before you buy.
        </p>

        <h2 id="stylist">The live stylist</h2>
        <p>
          Our AI stylist offers suggestions on sizing, fit and styling based on the product information on this site. Its
          advice is guidance, not a guarantee of fit — our 30-day returns apply to anything bought on its recommendation.
          Microphone, camera and screen sharing are always off until you turn them on.
        </p>

        <h2 id="accounts">Accounts</h2>
        <p>
          You&apos;re responsible for keeping your login details secure. Memberships renew monthly until cancelled and can be
          cancelled at any time from your account.
        </p>

        <h2 id="ip">Intellectual property</h2>
        <p>
          All photography, copy and designs on this site belong to Livesites or our licensors. Please don&apos;t reuse them
          without written permission.
        </p>

        <h2 id="liability">Liability</h2>
        <p>
          Nothing in these terms limits your statutory rights. We are not liable for losses that were not reasonably
          foreseeable when you placed your order.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          Questions about these terms? Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll reply within one
          business day.
        </p>
      </Prose>
    </>
  );
}
