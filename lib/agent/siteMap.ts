import { aboutCommitments, aboutValues, contactHours, pricingFaqs, pricingPlans, shippingRates } from "@/data/pages";
import { benefits, footerNav, hero, primaryNav, recommendation, site } from "@/data/site";

/**
 * Everything the AI agent can point at. Each section is found in the DOM either by
 * `data-agent-section="<id>"` or, for long-form policy pages, by the id of its heading.
 * Structured copy comes from `data/`; the prose summaries below mirror the policy
 * pages and must be updated alongside them.
 */
export interface SiteSection {
  id: string;
  label: string;
  /** Existing heading id on long-form pages; otherwise the element carries `data-agent-section`. */
  anchorId?: string;
  /** What is in the section, in plain facts the agent may repeat. */
  about: string;
}

export interface SitePage {
  /** Route pattern. `[slug]` marks the product page; `*` marks elements shown on every page. */
  route: string;
  title: string;
  purpose: string;
  sections: SiteSection[];
}

const list = (items: readonly string[]) => items.join("; ");

export const sitePages: SitePage[] = [
  {
    route: "*",
    title: "Every page",
    purpose: "Site-wide navigation present on all pages.",
    sections: [
      {
        id: "global.header",
        label: "Header",
        about: `Sticky top bar: the ${site.name} logo (links home), main menu (${primaryNav.map((n) => n.label).join(", ")}) on desktop, search, wishlist and account icons, the shopping bag with an item count, and a menu button on mobile.`,
      },
      {
        id: "global.footer",
        label: "Footer",
        about: `Brand line "Elevated essentials, styled live by people who love clothes as much as you do.", a newsletter sign-up, link groups (${footerNav.map((g) => `${g.title}: ${g.links.map((l) => l.label).join(", ")}`).join(" | ")}), the contact email ${site.email} and complimentary shipping over $${site.freeShippingThreshold}.`,
      },
      {
        id: "global.bottom-nav",
        label: "Mobile bottom navigation",
        about: "Fixed bar at the bottom of phone screens with Home, Shop, Wishlist (with saved count) and Account.",
      },
    ],
  },
  {
    route: "/",
    title: "Home",
    purpose: "Introduces the Aurora collection and featured pieces.",
    sections: [
      {
        id: "home.hero",
        label: "Hero banner",
        about: `Campaign photo with the ${hero.eyebrow} eyebrow, the headline "${hero.titleLines.join(" ")}", the line "${hero.subtitleLines.join(" ")}" and a "${hero.cta.label}" button to the shop.`,
      },
      {
        id: "home.benefits",
        label: "Benefits strip",
        about: `Three promises: ${benefits.map((b) => `${b.title} ${b.detail}`).join("; ")}.`,
      },
      {
        id: "home.featured",
        label: "Featured for You",
        about: "Grid of the featured Aurora pieces with photo, name, price, colour swatches and a wishlist heart; View All opens the shop.",
      },
      {
        id: "home.recommendation",
        label: "Recommended for you",
        about: `Recommendation card: "${recommendation.title}" — ${recommendation.subtitle} Links to the product "${recommendation.productSlug}".`,
      },
    ],
  },
  {
    route: "/shop",
    title: "Shop",
    purpose: "All products with category chips, filters (colour, size, max price) and sorting.",
    sections: [
      { id: "shop.intro", label: "Shop heading", about: "Page title (changes with the active filter), number of pieces shown, and a short intro line." },
      {
        id: "shop.filters",
        label: "Filters",
        about: "Sticky bar with category chips (All, Blazers, Dresses, Sets, Bags) and a Filter panel for colour, size, price caps of $150 and $200, and sort (Featured, price low to high, high to low).",
      },
      { id: "shop.grid", label: "Product grid", about: "The matching products; active filters appear as removable chips above the grid." },
    ],
  },
  {
    route: "/shop/[slug]",
    title: "Product page",
    purpose: "One product: photos, price, colours, sizes, add to bag, wishlist, details, and pieces that pair with it.",
    sections: [
      { id: "product.gallery", label: "Product photos", about: "Main photo with thumbnails; changes with the selected colour." },
      {
        id: "product.info",
        label: "Product details and buy box",
        about: "Collection, name, price, tagline, colour and size pickers, Add to bag button, wishlist heart, shipping and returns reminders, description and accordions for details, composition and care, and fit.",
      },
      { id: "product.pairs", label: "Pairs perfectly with", about: "Other pieces that style well with this product." },
    ],
  },
  {
    route: "/wishlist",
    title: "Wishlist",
    purpose: "Pieces the shopper has saved on this device.",
    sections: [
      { id: "wishlist.items", label: "Saved pieces", about: "Saved products with an Add to bag button under each, or an empty state with a link to the shop." },
      { id: "wishlist.suggestions", label: "You might love", about: "Featured pieces, shown when the wishlist is empty." },
    ],
  },
  {
    route: "/account",
    title: "Account",
    purpose: "Sign in or create an account; signed-in shoppers see orders, wishlist, live styling and their fit profile.",
    sections: [
      {
        id: "account.main",
        label: "Account",
        about: "Signed out: Sign in / Create account form. Signed in: welcome message, cards for Orders, Wishlist and Live styling, and a Fit profile (usual sizes and preferred fit) shared with the stylist.",
      },
    ],
  },
  {
    route: "/about",
    title: "About us",
    purpose: "The Livesites story and values.",
    sections: [
      {
        id: "about.story",
        label: "The Aurora collection story",
        about: "Aurora was designed around a relaxed linen blazer that works over a silk slip on Friday night and with tailored trousers on Monday; everything shares a warm, undyed palette. Made with small family-run mills and ateliers in Europe, visited every season.",
      },
      { id: "about.values", label: "What we believe", about: list(aboutValues.map((v) => `${v.title}: ${v.body}`)) },
      { id: "about.commitments", label: "Our commitments", about: list(aboutCommitments.map((c) => `${c.value} — ${c.label}`)) },
    ],
  },
  {
    route: "/pricing",
    title: "Pricing",
    purpose: "Membership plans. Live styling is free for everyone.",
    sections: [
      {
        id: "pricing.plans",
        label: "Membership plans",
        about: list(pricingPlans.map((p) => `${p.name} ${p.price}${p.cadence ? ` ${p.cadence}` : ""} (${p.blurb}): ${p.features.join(", ")}`)),
      },
      { id: "pricing.faq", label: "Pricing questions", about: list(pricingFaqs.map((f) => `Q: ${f.q} A: ${f.a}`)) },
    ],
  },
  {
    route: "/contact",
    title: "Contact",
    purpose: "Ways to reach the team.",
    sections: [
      { id: "contact.form", label: "Contact form", about: "Form with name, email, topic, optional order number and message." },
      {
        id: "contact.details",
        label: "Contact details",
        about: `Email ${site.email}, phone ${site.phone}, hours ${contactHours.days}, ${contactHours.reply.toLowerCase()}.`,
      },
    ],
  },
  {
    route: "/shipping-returns",
    title: "Shipping & Returns",
    purpose: "Delivery options, returns, exchanges and refunds.",
    sections: [
      { id: "shipping.shipping", label: "Shipping", anchorId: "shipping", about: "Orders placed before 1pm ET on a business day ship the same day; a tracking link is emailed. Packaging is recycled and plastic-free." },
      { id: "shipping.rates", label: "Rates & timings", anchorId: "rates", about: list(shippingRates.map((r) => `${r.method}: ${r.time}, ${r.price}`)) },
      {
        id: "shipping.returns",
        label: "Returns",
        anchorId: "returns",
        about: "Return unworn pieces with tags within 30 days of delivery; a prepaid label is emailed and US returns are free. Pieces must be unworn, unwashed and in original packaging. Pierced jewellery and altered pieces can't be returned.",
      },
      { id: "shipping.exchanges", label: "Exchanges", anchorId: "exchanges", about: "Ask the live stylist or request an exchange in your account; the new size ships as soon as the return is scanned by the carrier." },
      { id: "shipping.refunds", label: "Refunds", anchorId: "refunds", about: "Refunded to the original payment method within 5 business days of the return arriving, with an email confirmation." },
    ],
  },
  {
    route: "/terms",
    title: "Terms & Conditions",
    purpose: "The terms for browsing and buying.",
    sections: [
      { id: "terms.about", label: "About these terms", anchorId: "about", about: "Apply when browsing or buying; placing an order means agreeing to them plus the Privacy and Shipping & Returns policies." },
      { id: "terms.orders", label: "Orders & pricing", anchorId: "orders", about: "Prices in US dollars including taxes at checkout; the contract forms when the shipping confirmation is emailed; unavailable or mispriced items are confirmed before charging. Colours can vary between screens." },
      { id: "terms.stylist", label: "The live stylist", anchorId: "stylist", about: "The AI stylist's sizing and styling advice is guidance, not a guarantee of fit; 30-day returns still apply. Microphone, camera and screen sharing stay off until the shopper turns them on." },
      { id: "terms.accounts", label: "Accounts", anchorId: "accounts", about: "Shoppers keep their login secure; memberships renew monthly and can be cancelled any time." },
      { id: "terms.ip", label: "Intellectual property", anchorId: "ip", about: "Photography, copy and designs belong to Livesites or its licensors." },
      { id: "terms.liability", label: "Liability", anchorId: "liability", about: "Statutory rights are unaffected; no liability for losses that weren't reasonably foreseeable." },
      { id: "terms.contact", label: "Contact", anchorId: "contact", about: `Questions to ${site.email}, answered within one business day.` },
    ],
  },
  {
    route: "/privacy",
    title: "Privacy",
    purpose: "How shopper data is handled.",
    sections: [
      { id: "privacy.summary", label: "In short", anchorId: "summary", about: "Only what's needed is collected, data is never sold, and shoppers can ask for deletion any time." },
      { id: "privacy.collect", label: "What we collect", anchorId: "collect", about: "Order details (card details stay with the payment provider), preferences (wishlist, bag, fit profile — in this preview stored only in the browser), and anonymous aggregated usage." },
      { id: "privacy.stylist", label: "Live stylist sessions", anchorId: "stylist", about: "Mic, camera and screen are shared only after the shopper turns them on; video is never recorded; transcripts are kept 30 days, then deleted." },
      { id: "privacy.use", label: "How we use it", anchorId: "use", about: "To deliver orders, answer questions, personalise recommendations when asked, and send emails only with opt-in." },
      { id: "privacy.choices", label: "Your choices", anchorId: "choices", about: "Access, correct, export or delete personal data any time; every email has an unsubscribe link." },
      { id: "privacy.contact", label: "Contact", anchorId: "contact", about: `Privacy requests to ${site.email}.` },
    ],
  },
];

export const siteSections = sitePages.flatMap((page) => page.sections.map((section) => ({ ...section, route: page.route })));

export type SiteSectionWithRoute = (typeof siteSections)[number];

export const sectionIds = siteSections.map((s) => s.id);

export function getSection(id: string) {
  return siteSections.find((s) => s.id === id);
}

/** Routes the agent may open directly (the product page is opened by slug instead). */
export const pageRoutes = sitePages.map((p) => p.route).filter((r) => r !== "*" && !r.includes("["));

/** Which page pattern a concrete pathname belongs to. */
export function routePattern(pathname: string) {
  if (pathname.startsWith("/shop/")) return "/shop/[slug]";
  return pageRoutes.find((r) => r === pathname) ?? pathname;
}
