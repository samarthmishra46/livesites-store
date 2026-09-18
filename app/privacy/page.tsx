import type { Metadata } from "next";
import { site } from "@/data/site";
import { PageIntro } from "@/components/ui/PageIntro";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = { title: "Privacy" };

const toc = [
  { id: "summary", label: "In short" },
  { id: "collect", label: "What we collect" },
  { id: "stylist", label: "Live stylist sessions" },
  { id: "use", label: "How we use it" },
  { id: "choices", label: "Your choices" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Privacy" />
      <Prose toc={toc} updated="September 1, 2026">
        <h2 id="summary">In short</h2>
        <p>
          We collect what we need to deliver your order and improve your visit, we never sell your data, and you can ask us
          to delete it at any time.
        </p>

        <h2 id="collect">What we collect</h2>
        <ul>
          <li>
            <strong>Order details</strong> — name, delivery address, email and payment confirmation (card details are handled
            by our payment provider and never stored by us).
          </li>
          <li>
            <strong>Preferences</strong> — your wishlist, bag and fit profile. In this preview these are stored only in your
            browser.
          </li>
          <li>
            <strong>Usage</strong> — anonymous, aggregated information about which pages are visited so we can improve the
            site.
          </li>
        </ul>

        <h2 id="stylist">Live stylist sessions</h2>
        <p>
          Your microphone, camera and screen are only shared after you turn them on, and you can turn them off at any time
          from the controls on the stylist panel. We don&apos;t record video. Conversation transcripts are kept for 30 days to
          improve recommendations, then deleted.
        </p>

        <h2 id="use">How we use it</h2>
        <p>
          To process and deliver orders, answer your questions, personalise recommendations when you&apos;ve asked us to,
          and — only if you opt in — send occasional emails about new collections.
        </p>

        <h2 id="choices">Your choices</h2>
        <p>
          You can access, correct, export or delete your personal data at any time. Unsubscribe links are in every email we
          send.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          For any privacy request, email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </Prose>
    </>
  );
}
