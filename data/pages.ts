/**
 * Structured copy for the content pages. The pages render it and the AI agent's
 * knowledge is built from it, so both always say the same thing.
 */

export const aboutValues = [
  {
    icon: "leaf",
    title: "Natural fibres, fewer pieces",
    body: "European flax linen, mulberry silk and leather from Gold-rated tanneries. We make small runs of pieces designed to work together, and we don't do seasonal sales.",
  },
  {
    icon: "scissors",
    title: "Made to be worn for years",
    body: "French seams, cupro linings and generous seam allowances so a tailor can adjust the fit as you need it. Every piece is wear-tested by our team before it goes on sale.",
  },
  {
    icon: "video",
    title: "A stylist in every visit",
    body: "Our live stylist can see what you're browsing, check measurements against our fit data and put together a look — the way a good shop assistant always has.",
  },
] as const;

export const aboutCommitments = [
  { value: "$100", label: "Free shipping on every order over $100" },
  { value: "30 days", label: "To return unworn pieces, free within the US" },
  { value: "Live", label: "A stylist on hand every time you visit" },
];

export const pricingPlans = [
  {
    name: "Essential",
    price: "Free",
    cadence: "",
    blurb: "Everything you need to shop with confidence.",
    features: [
      "Live AI stylist on every page",
      "Free shipping on orders over $100",
      "30-day returns",
      "Wishlist saved on this device",
    ],
    cta: { label: "Start shopping", href: "/shop" },
    featured: false,
  },
  {
    name: "Aurora Circle",
    price: "$9",
    cadence: "/ month",
    blurb: "For regulars who want their stylist to know them.",
    features: [
      "Everything in Essential",
      "Free express shipping on every order",
      "Fit profile remembered across devices",
      "Early access to new collections",
      "Free alterations on blazers and trousers",
    ],
    cta: { label: "Join Aurora Circle", href: "/account" },
    featured: true,
  },
  {
    name: "Atelier",
    price: "$29",
    cadence: "/ month",
    blurb: "A dedicated human stylist, on call.",
    features: [
      "Everything in Aurora Circle",
      "Monthly 30-minute video session with a senior stylist",
      "Seasonal capsule edits chosen for you",
      "Home try-on: keep what you love, return the rest",
    ],
    cta: { label: "Choose Atelier", href: "/account" },
    featured: false,
  },
];

export const pricingFaqs = [
  {
    q: "Is the live stylist really free?",
    a: "Yes. Every visitor can talk to the Livesites stylist at no cost and with no account. Memberships add perks around delivery, fit and human styling.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Memberships are month to month. Cancel from your account page and you keep your benefits until the end of the billing period.",
  },
  {
    q: "Do member prices differ from regular prices?",
    a: "No. Product prices are the same for everyone — we don't run member-only discounts or seasonal sales.",
  },
];

export const shippingRates = [
  { method: "Standard", time: "3–5 business days", price: "$8 · free over $100" },
  { method: "Express", time: "1–2 business days", price: "$18 · free for Aurora Circle" },
  { method: "International", time: "5–10 business days", price: "From $25, duties included" },
];

export const contactHours = { days: "Monday–Friday, 9am–6pm ET", reply: "Replies within one business day" };
