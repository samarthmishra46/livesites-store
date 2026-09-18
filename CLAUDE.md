# CLAUDE.md — Livesites AI Fashion Store

## Project
Build a production-quality, mobile-first fashion ecommerce experience inspired by the supplied reference screenshot:

- `assets/reference-full.jpg` — complete 900×1600 reference screenshot.
- `assets/*-reference.jpg` — extracted visual references from that screenshot.

The product is an AI-assisted fashion storefront. The floating video-call style card is an AI shopping assistant/avatar. Phase 1 is UI only. Phase 2 connects the assistant to real navigation, product data, cart/wishlist actions, scrolling, and an avatar/voice provider.

## Non-negotiable visual direction

Treat the supplied screenshot as the visual source of truth. Do not redesign it into a generic ecommerce template.

Important visual characteristics:
- warm ivory/cream page background
- black/dark charcoal typography
- elegant editorial serif for large headings
- clean modern sans-serif for UI/body
- thin warm-gray borders/dividers
- generous whitespace
- rounded image cards
- soft neutral fashion photography
- black pill/rounded CTA
- restrained shadows
- minimal line icons
- premium fashion-magazine feel
- mobile bottom navigation with Home / Shop / Wishlist / Account
- floating AI avatar card over the hero
- recommendation card below the product grid
- desktop should preserve the same visual language rather than becoming a different design

Use the screenshot and supplied crops instead of inventing unrelated imagery.

## Technical requirements

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- lucide-react for icons
- local mock data for Phase 1
- component-driven architecture
- responsive/mobile-first CSS
- accessible semantic HTML
- no unnecessary UI framework that makes pixel-level control difficult

Preferred structure:

app/
  page.tsx
  shop/page.tsx
  shop/[slug]/page.tsx
  wishlist/page.tsx
  account/page.tsx
  about/page.tsx
  pricing/page.tsx
  terms/page.tsx
  privacy/page.tsx
  shipping-returns/page.tsx
  contact/page.tsx
components/
  layout/
  navigation/
  home/
  product/
  ai-assistant/
  ui/
data/
lib/
public/
  images/
types/

Keep data, UI and future AI actions separated so Phase 2 can replace mock logic without rewriting the UI.

## Important Phase 1 rule

Do NOT integrate a real AI/voice/avatar provider yet.

The avatar must look and behave like a polished UI prototype:
- floating over the hero/content
- draggable on mobile and desktop
- close/minimize button
- microphone toggle
- camera/video toggle
- chat/screen-style action button
- Live status indicator
- mock transcript/assistant bubble
- open/closed state
- keyboard accessible
- never block the main page interaction

Create a clean adapter boundary for Phase 2, e.g.:
`components/ai-assistant/AIAssistant.tsx`
and
`lib/ai-assistant/types.ts`.

## Quality bar

Before considering Phase 1 complete:
1. Test at 390×844, 430×932, 768×1024, 1280×800 and 1440×900.
2. Check overflow, sticky/fixed elements and safe-area behavior.
3. Check keyboard focus states.
4. Check image aspect ratios and loading.
5. Ensure the mobile bottom nav does not cover content.
6. Ensure the floating assistant can be dragged without causing accidental page scrolling.
7. Run lint/typecheck/build.
8. Do not leave TODOs for basic UI.
9. Do not use lorem ipsum.
10. Use realistic fashion product copy.

## Image handling

Use the supplied images under `assets/` as visual references. Copy the needed assets into `public/images/reference/` during implementation if appropriate.

For new product imagery that is not present in the screenshot, use tasteful neutral fashion placeholders or generated/local assets with the same editorial aesthetic. Keep all imagery coherent.

Do not hotlink random image URLs in the finished app.

## Phase 2 architecture

Design Phase 1 so the assistant can later emit structured actions such as:

```ts
type AssistantAction =
  | { type: "scroll"; direction: "up" | "down"; amount?: number }
  | { type: "navigate"; href: string }
  | { type: "open_product"; productSlug: string }
  | { type: "add_to_wishlist"; productId: string }
  | { type: "remove_from_wishlist"; productId: string }
  | { type: "add_to_cart"; productId: string; quantity?: number }
  | { type: "filter_products"; category?: string; color?: string; size?: string; maxPrice?: number }
  | { type: "search"; query: string }
  | { type: "open_shop" }
  | { type: "open_wishlist" }
  | { type: "open_account" }
  | { type: "open_cart" };
```

The UI should expose a single action dispatcher so a future LLM/voice/avatar service can control the same app actions as a human.

## Do not

- Do not make the page look like a generic Tailwind starter.
- Do not replace the floating avatar with a normal chatbot bubble.
- Do not remove the mobile bottom navigation.
- Do not invent a radically different color palette.
- Do not put the avatar permanently in the center of the page.
- Do not hard-code all product cards directly into JSX.
- Do not couple product state to the avatar implementation.
