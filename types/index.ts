export type ProductCategory = "Blazers" | "Dresses" | "Sets" | "Bags";

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  /** Image shown when this colour is selected (falls back to the product's first image). */
  image?: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** How the photo sits in its frame: product shots fill the frame, small packshots are contained. */
  fit?: "cover" | "contain";
  position?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  collection: string;
  tagline: string;
  description: string;
  colors: ColorOption[];
  sizes: string[];
  images: ProductImage[];
  details: string[];
  composition: string;
  care: string;
  fit: string;
  /** Background behind the product photo, matched to the studio backdrop. */
  imageBg: string;
  badge?: string;
  featured?: boolean;
  /** Slugs of products that style well with this one. */
  pairsWith?: string[];
}

export interface CartLine {
  productId: string;
  colorId: string;
  size: string;
  quantity: number;
}
