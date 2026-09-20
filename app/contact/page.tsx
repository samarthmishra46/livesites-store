import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";
import { contactHours } from "@/data/pages";
import { site } from "@/data/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Livesites team about orders, returns, sizing or styling.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="We’re here to help">
        <p>For the fastest answer about sizing or styling, talk to your live stylist. For everything else, write to us.</p>
      </PageIntro>
      <PageContainer>
        <div className="grid gap-10 md:grid-cols-[1fr_320px] md:gap-14 lg:grid-cols-[1fr_360px]">
          <ContactForm />
          <aside data-agent-section="contact.details" className="space-y-7 md:pt-2">
            {[
              { icon: Mail, title: "Email", body: <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a> },
              { icon: Phone, title: "Phone", body: <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{site.phone}</a> },
              { icon: Clock, title: "Hours", body: <>{contactHours.days}<br />{contactHours.reply}</> },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-ink" strokeWidth={1.4} aria-hidden />
                <div>
                  <p className="text-[13px] tracking-[0.12em] text-muted uppercase">{title}</p>
                  <p className="mt-1 text-[15px] text-ink">{body}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
