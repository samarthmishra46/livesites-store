import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "p-linen-blazer",
    slug: "linen-blazer",
    name: "Linen Blazer",
    price: 129,
    category: "Blazers",
    collection: "Aurora",
    tagline: "Relaxed single-breasted blazer in washed European linen.",
    description:
      "Cut with a softly structured shoulder and a gently relaxed body, our Linen Blazer moves easily from the office to long weekend lunches. The washed linen has a lived-in hand from the first wear and only gets better with time.",
    colors: [
      { id: "oat", name: "Oat", hex: "#c7b8ac", image: "/images/linen-blazer.jpg" },
      { id: "camel", name: "Camel", hex: "#b0917a", image: "/images/linen-blazer-camel.jpg" },
      { id: "charcoal", name: "Charcoal", hex: "#49484d", image: "/images/linen-blazer-charcoal.jpg" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      { src: "/images/linen-blazer.jpg", alt: "Oat linen blazer hanging against a warm studio wall", width: 596, height: 408 },
      {
        src: "/images/aurora-linen-suit.jpg",
        alt: "Model wearing the linen blazer with matching tailored trousers",
        width: 810,
        height: 1072,
        position: "50% 20%",
      },
    ],
    details: [
      "Single-button closure with notch lapels",
      "Two flap pockets and a chest welt pocket",
      "Half-lined in breathable cupro",
      "Hip length, relaxed through the body",
    ],
    composition: "100% European flax linen. Lining: 100% cupro.",
    care: "Dry clean or cool hand wash. Steam to refresh.",
    fit: "Relaxed fit. True to size — size down for a closer silhouette. Model is 5'9\" and wears size S.",
    imageBg: "#e0dbd7",
    badge: "Bestseller",
    featured: true,
    pairsWith: ["structured-leather-tote", "silk-slip-dress"],
  },
  {
    id: "p-silk-slip-dress",
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    price: 149,
    category: "Dresses",
    collection: "Aurora",
    tagline: "Bias-cut mulberry silk with a soft cowl neckline.",
    description:
      "Cut on the bias so it skims rather than clings, the Silk Slip Dress falls from fine adjustable straps into a softly draped cowl. Wear it alone on warm evenings or under the Linen Blazer for the office.",
    colors: [
      { id: "ivory", name: "Ivory", hex: "#e9e0d9", image: "/images/silk-slip-dress.jpg" },
      { id: "black", name: "Black", hex: "#151419", image: "/images/silk-slip-dress-black.jpg" },
    ],
    sizes: ["XS", "S", "M", "L"],
    images: [
      { src: "/images/silk-slip-dress.jpg", alt: "Ivory silk slip dress on a hanger against a cream wall", width: 598, height: 408 },
    ],
    details: [
      "Bias cut for a fluid drape",
      "Cowl neckline and adjustable straps",
      "Midi length, falls just below the knee",
      "French seams throughout",
    ],
    composition: "100% mulberry silk, 19 momme.",
    care: "Dry clean recommended. Hand wash cold with silk detergent.",
    fit: "Fluid fit. If between sizes, choose the larger size.",
    imageBg: "#e5deda",
    featured: true,
    pairsWith: ["linen-blazer", "structured-leather-tote"],
  },
  {
    id: "p-aurora-linen-set",
    slug: "aurora-linen-set",
    name: "Aurora Linen Set",
    price: 239,
    category: "Sets",
    collection: "Aurora",
    tagline: "The Linen Blazer with matching pleated wide-leg trousers.",
    description:
      "Our campaign look in one set: the Linen Blazer paired with high-rise pleated trousers in the same washed linen. Wear them together for an easy tonal suit, or split them up across the week.",
    colors: [{ id: "sand", name: "Sand", hex: "#ddd3c7" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      {
        src: "/images/aurora-linen-suit.jpg",
        alt: "Model in the Aurora linen blazer and trousers, looking over her shoulder",
        width: 810,
        height: 1072,
        position: "50% 18%",
      },
      { src: "/images/linen-blazer.jpg", alt: "The linen blazer from the Aurora set", width: 596, height: 408 },
    ],
    details: [
      "Includes the Linen Blazer and Pleated Linen Trouser",
      "High-rise trousers with double front pleats",
      "Side pockets and buttoned back welt pockets",
      "Pieces can be exchanged in different sizes",
    ],
    composition: "100% European flax linen.",
    care: "Dry clean or cool hand wash. Steam to refresh.",
    fit: "Blazer: relaxed fit. Trousers: high rise, wide leg, full length.",
    imageBg: "#ece8e4",
    badge: "New",
    featured: true,
    pairsWith: ["structured-leather-tote", "silk-slip-dress"],
  },
  {
    id: "p-structured-leather-tote",
    slug: "structured-leather-tote",
    name: "Structured Leather Tote",
    price: 189,
    category: "Bags",
    collection: "Aurora",
    tagline: "A clean-lined work tote in smooth Italian leather.",
    description:
      "Structured enough to hold its shape, roomy enough for a laptop and the day's essentials. Top handles sit comfortably in the hand or over the forearm, and the pale stone leather works with every piece in the Aurora collection.",
    colors: [{ id: "stone", name: "Stone", hex: "#d8cbbd" }],
    sizes: ["One size"],
    images: [
      {
        src: "/images/structured-tote.jpg",
        alt: "Stone leather tote bag with twin top handles",
        width: 200,
        height: 150,
        fit: "contain",
      },
    ],
    details: [
      "Fits a 14\" laptop",
      "Magnetic closure and an interior zip pocket",
      "Protective metal feet on the base",
      "W 36 × H 26 × D 13 cm",
    ],
    composition: "Smooth calf leather from a Gold-rated tannery. Cotton lining.",
    care: "Wipe with a dry soft cloth. Store in the dust bag provided.",
    fit: "Handle drop: 11 cm.",
    imageBg: "#dbd3cf",
    featured: true,
    pairsWith: ["linen-blazer", "aurora-linen-set"],
  },
];

export const categories = ["Blazers", "Dresses", "Sets", "Bags"] as const;

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export const featuredProducts = products.filter((p) => p.featured);

/** Image for a product in a given colour, falling back to the main photo. */
export function productImageFor(product: Product, colorId?: string) {
  const color = product.colors.find((c) => c.id === colorId);
  const main = product.images[0];
  return color?.image ? { ...main, src: color.image } : main;
}
