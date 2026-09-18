export const site = {
  name: "Livesites",
  collection: "AURORA",
  email: "hello@livesites.ai",
  phone: "+1 (415) 555-0142",
  freeShippingThreshold: 100,
};

export const hero = {
  eyebrow: "AURORA",
  titleLines: ["Timeless", "Style for", "Brighter Days"],
  subtitleLines: ["Elevated essentials", "for a more confident you."],
  cta: { label: "Shop the Collection", href: "/shop" },
};

export const benefits = [
  { icon: "truck", title: "Free shipping", detail: "on orders over $100" },
  { icon: "leaf", title: "Sustainably made", detail: "for a brighter tomorrow" },
  { icon: "shield", title: "Easy returns", detail: "within 30 days" },
] as const;

export const recommendation = {
  eyebrow: "Recommended for you",
  title: "Pairs perfectly with our linen blazer",
  subtitle: "A versatile look for work or weekends.",
  productSlug: "structured-leather-tote",
};

export const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Aurora", href: "/shop?collection=aurora" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Blazers", href: "/shop?category=Blazers" },
      { label: "Dresses", href: "/shop?category=Dresses" },
      { label: "Bags", href: "/shop?category=Bags" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Contact", href: "/contact" },
      { label: "Account", href: "/account" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
