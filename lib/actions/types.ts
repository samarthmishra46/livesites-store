/**
 * Every app action a shopper — or, in Phase 2, the AI assistant — can trigger.
 * UI components and the assistant go through the same dispatcher, so the assistant
 * can never do anything a human couldn't do through the interface.
 */
export type AssistantAction =
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom"; amount?: number }
  /** Sections are ids from `lib/agent/siteMap.ts`; sections on another page navigate there first. */
  | { type: "scroll_to_section"; sectionId: string }
  | { type: "highlight_section"; sectionId: string }
  | { type: "navigate"; href: string }
  | { type: "open_product"; productSlug: string }
  | { type: "add_to_wishlist"; productId: string }
  | { type: "remove_from_wishlist"; productId: string }
  | { type: "add_to_cart"; productId: string; quantity?: number; size?: string; colorId?: string }
  | { type: "remove_from_cart"; productId: string }
  | { type: "filter_products"; category?: string; color?: string; size?: string; maxPrice?: number }
  | { type: "search"; query: string }
  | { type: "open_shop" }
  | { type: "open_wishlist" }
  | { type: "open_account" }
  | { type: "open_cart" }
  | { type: "close_cart" };

export type AssistantActionType = AssistantAction["type"];

export type DispatchResult = { ok: true } | { ok: false; reason: string };
